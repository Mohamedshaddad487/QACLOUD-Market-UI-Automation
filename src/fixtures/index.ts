import { test as base, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import path from 'node:path';
import { PortalPage } from '../pages/PortalPage';
import { MarketPage } from '../pages/MarketPage';
import { getCredentials } from '../support/env';
import { attachFailureEvidence } from '../support/evidence';
import { failOnUnexpectedDialogs } from '../support/dialogs';
import { buildProduct } from '../data/product-builder';
import type { ProductInput } from '../data/product-builder';

export const STORAGE_STATE_PATH = path.join(process.cwd(), 'playwright/.auth/user.json');

export type TemporaryProduct = {
  name: string;
  input: ProductInput;
  markDeletedByTest: () => void;
};

type Fixtures = {
  unauthenticatedPage: Page;
  authenticatedPage: Page;
  disposableSessionPage: Page;
  marketPage: MarketPage;
  temporaryProduct: TemporaryProduct;
};

export const test = base.extend<Fixtures>({
  unauthenticatedPage: async ({ browser, baseURL }, use, testInfo) => {
    const context = await browser.newContext({ baseURL });
    const page = await context.newPage();
    const stopCollecting = await attachFailureEvidence(page, testInfo);
    const assertNoUnexpectedDialogs = failOnUnexpectedDialogs(page);

    await use(page);

    await stopCollecting();
    await context.close();
    assertNoUnexpectedDialogs();
  },

  authenticatedPage: async ({ browser, baseURL }, use, testInfo) => {
    const context = await browser.newContext({ baseURL, storageState: STORAGE_STATE_PATH });
    const page = await context.newPage();
    const stopCollecting = await attachFailureEvidence(page, testInfo);
    const assertNoUnexpectedDialogs = failOnUnexpectedDialogs(page);

    await use(page);

    await stopCollecting();
    await context.close();
    assertNoUnexpectedDialogs();
  },

  disposableSessionPage: async ({ browser, baseURL }, use, testInfo) => {
    const context = await browser.newContext({ baseURL });
    const page = await context.newPage();
    const stopCollecting = await attachFailureEvidence(page, testInfo);
    const assertNoUnexpectedDialogs = failOnUnexpectedDialogs(page);

    try {
      const { identifier, password } = getCredentials();
      const portal = new PortalPage(page);
      await portal.goto();
      await portal.header.openLoginRegister();
      await portal.loginModal.switchToLoginTab();
      await portal.loginModal.login(identifier, password);
      await page.waitForURL(/\/profile\.html$/, { timeout: 15_000 });
    } catch (error) {
      throw new Error(
        `[disposableSessionPage fixture setup failed] Could not establish a live authenticated session: ${(error as Error).message}`,
        { cause: error },
      );
    }

    await use(page);

    await stopCollecting();
    await context.close();
    assertNoUnexpectedDialogs();
  },

  marketPage: async ({ authenticatedPage }, use) => {
    const market = new MarketPage(authenticatedPage);
    await market.goto();
    await market.productsPanel.waitForCatalogLoaded();

    await use(market);
  },

  temporaryProduct: async ({ marketPage }, use, testInfo) => {
    const panel = marketPage.productsPanel;
    const input = buildProduct({
      shortLabel: testInfo.title.slice(0, 10).replace(/[^A-Za-z0-9]/g, '') || 'pm',
      workerIndex: testInfo.workerIndex,
    });

    try {
      const form = await panel.openAddProduct();
      await form.fillName(input.name);
      await form.selectCategory(input.categoryFormLabel);
      await form.fillPrice(input.price);
      await form.fillStock(input.stock);
      await panel.saveAndAwaitCatalog();
    } catch (error) {
      throw new Error(
        `[temporaryProduct fixture setup failed] Could not create "${input.name}" through the Add Product UI: ${(error as Error).message}`,
        { cause: error },
      );
    }

    try {
      await panel.waitForProductPresent(input.name);
    } catch {
      throw new Error(
        `[temporaryProduct fixture setup failed] "${input.name}" was submitted but never appeared in the catalog.`,
      );
    }

    let deletedByTest = false;
    await use({
      name: input.name,
      input,
      markDeletedByTest: () => {
        deletedByTest = true;
      },
    });

    void deletedByTest;
    try {
      await panel.ensureProductAbsent(input.name);
    } catch (error) {
      throw new Error(
        `[temporaryProduct cleanup FAILED] Could not guarantee removal of "${input.name}". ` +
          `Treat it as an orphan and remove it manually. Cause: ${(error as Error).message}`,
        { cause: error },
      );
    }
  },
});

export { expect };
