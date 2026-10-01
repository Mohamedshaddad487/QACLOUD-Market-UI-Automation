import type { Browser, Page, TestInfo } from '@playwright/test';
import { test as base, expect, STORAGE_STATE_PATH } from './index';
import { MarketPage } from '../pages/MarketPage';
import { buildProduct } from '../data/product-builder';
import type { ProductInput } from '../data/product-builder';
import type { BasketLineSnapshot } from '../panels/BasketPanel';
import { attachFailureEvidence } from '../support/evidence';
import { failOnUnexpectedDialogs } from '../support/dialogs';

export type OwnedProductOptions = {
  label: string;
  price?: string;
  stock?: string;
};

export type OwnedProducts = {
  create(options: OwnedProductOptions): Promise<ProductInput>;
  names(): readonly string[];
  markStillInBasket(name: string): void;
};

type BasketFixtures = {
  ownedProducts: OwnedProducts;
  secondSessionMarket: MarketPage;
  emptyBasket: void;
};

type IndependentSession = { page: Page; close: () => Promise<void> };

async function openIndependentSession(
  browser: Browser,
  baseURL: string | undefined,
  testInfo: TestInfo,
): Promise<IndependentSession> {
  const context = await browser.newContext({ baseURL, storageState: STORAGE_STATE_PATH });
  const page = await context.newPage();
  const stopCollecting = await attachFailureEvidence(page, testInfo);
  const assertNoUnexpectedDialogs = failOnUnexpectedDialogs(page);
  return {
    page,
    close: async () => {
      await stopCollecting();
      await context.close();
      assertNoUnexpectedDialogs();
    },
  };
}

async function readBasketFreshly(page: Page): Promise<MarketPage> {
  const market = new MarketPage(page);
  await market.goto();
  await market.productsPanel.waitForCatalogLoaded();
  await market.openBasketTab();
  await market.basketPanel.refresh();
  return market;
}

function describeLines(lines: readonly BasketLineSnapshot[], owned: ReadonlySet<string>): string {
  if (lines.length === 0) return '(empty)';
  return lines
    .map((line) => {
      const origin = owned.has(line.name) ? 'owned by this test' : line.name.startsWith('AUT-') ? 'framework-created, not this test' : 'not framework-created';
      return `"${line.name}" ×${line.quantity} [${origin}]`;
    })
    .join('; ');
}

export const test = base.extend<BasketFixtures>({
  ownedProducts: async ({ marketPage }, use, testInfo) => {
    const created: string[] = [];
    const stillInBasket = new Set<string>();

    await use({
      create: async ({ label, price, stock }) => {
        const input = buildProduct({ shortLabel: label, workerIndex: testInfo.workerIndex, price, stock });
        created.push(input.name);
        const panel = marketPage.productsPanel;
        try {
          const form = await panel.openAddProduct();
          await form.fillName(input.name);
          await form.selectCategory(input.categoryFormLabel);
          await form.fillPrice(input.price);
          await form.fillStock(input.stock);
          await panel.saveAndAwaitCatalog();
          await panel.waitForProductPresent(input.name);
        } catch (error) {
          throw new Error(
            `[ownedProducts] Could not create "${input.name}" through the Add Product UI: ${(error as Error).message}`,
            { cause: error },
          );
        }
        return input;
      },
      names: () => [...created],
      markStillInBasket: (name) => {
        stillInBasket.add(name);
      },
    });

    if (created.length === 0) return;

    try {
      await marketPage.goto();
      await marketPage.productsPanel.waitForCatalogLoaded();
    } catch (error) {
      throw new Error(
        `[ownedProducts cleanup FAILED] Could not reload the catalog; treat as orphans: ${created.join(', ')}`,
        { cause: error },
      );
    }

    const failures: string[] = [];
    for (const name of created) {
      if (stillInBasket.has(name)) {
        failures.push(`${name}: NOT deleted — it is still in the basket (or its basket state is unknown). Remove the line first, then the product.`);
        continue;
      }
      try {
        await marketPage.productsPanel.ensureProductAbsent(name);
      } catch (error) {
        failures.push(`${name}: ${(error as Error).message}`);
      }
    }
    if (failures.length > 0) {
      throw new Error(`[ownedProducts cleanup FAILED] Orphaned product(s) must be removed manually:\n  ${failures.join('\n  ')}`);
    }
  },

  secondSessionMarket: async ({ browser, baseURL }, use, testInfo) => {
    const session = await openIndependentSession(browser, baseURL, testInfo);
    await use(new MarketPage(session.page));
    await session.close();
  },

  emptyBasket: [
    async ({ browser, baseURL, ownedProducts }, use, testInfo) => {
      const entry = await openIndependentSession(browser, baseURL, testInfo);
      let entryLines: BasketLineSnapshot[];
      let entryEmptyStateShown: boolean;
      try {
        const market = await readBasketFreshly(entry.page);
        entryLines = await market.basketPanel.readLines();
        entryEmptyStateShown = await market.basketPanel.emptyState.isVisible();
      } catch (error) {
        await entry.close().catch(() => undefined);
        throw new Error(`[emptyBasket setup failed] Could not read the account basket: ${(error as Error).message}`, { cause: error });
      }
      await entry.close();

      if (entryLines.length > 0) {
        throw new Error(
          `[emptyBasket setup failed] The account basket is not empty, so this test cannot start from a known state. ` +
            `Nothing was removed — the lines may belong to another session of the account. Lines: ${describeLines(entryLines, new Set())}`,
        );
      }
      if (!entryEmptyStateShown) {
        throw new Error('[emptyBasket setup failed] The basket read showed neither lines nor the empty state.');
      }

      await use();

      const owned = new Set(ownedProducts.names());
      const failures: string[] = [];
      let finalLines: BasketLineSnapshot[] = [];
      const exit = await openIndependentSession(browser, baseURL, testInfo);
      try {
        const market = await readBasketFreshly(exit.page);
        for (const line of await market.basketPanel.readLines()) {
          if (!owned.has(line.name)) continue;
          try {
            await market.basketPanel.line(line.name).remove();
          } catch (error) {
            failures.push(`Remove failed for owned line "${line.name}": ${(error as Error).message}`);
          }
        }
        await market.basketPanel.refresh();
        finalLines = await market.basketPanel.readLines();
        for (const line of finalLines) {
          if (owned.has(line.name)) {
            ownedProducts.markStillInBasket(line.name);
            failures.push(`Owned line "${line.name}" is still in the basket after Remove.`);
          } else {
            failures.push(`Non-owned line "${line.name}" ×${line.quantity} is in the basket; it was NOT removed.`);
          }
        }
        if (finalLines.length === 0 && !(await market.basketPanel.emptyState.isVisible())) {
          failures.push('The cleanup read showed neither lines nor the empty state.');
        }
      } catch (error) {
        for (const name of owned) ownedProducts.markStillInBasket(name);
        failures.push(`Could not complete the cleanup read: ${(error as Error).message}`);
      } finally {
        await exit.close();
      }

      if (failures.length > 0) {
        await testInfo.attach('basket-state', { body: describeLines(finalLines, owned), contentType: 'text/plain' });
        throw new Error(`[emptyBasket cleanup FAILED] Later basket tests are compromised until this is resolved:\n  ${failures.join('\n  ')}`);
      }
    },
    { auto: true },
  ],
});

export { expect };
