import { test, expect } from '../../src/fixtures';
import type { MarketPage } from '../../src/pages/MarketPage';
import { buildProduct } from '../../src/data/product-builder';

let createdNames: string[] = [];

function register(name: string): string {
  createdNames.push(name);
  return name;
}

test.afterEach(async ({ marketPage }: { marketPage: MarketPage }) => {
  const names = createdNames;
  createdNames = [];
  const failures: string[] = [];

  for (const name of names) {
    try {
      await marketPage.productsPanel.ensureProductAbsent(name);
    } catch (error) {
      failures.push(`${name}: ${(error as Error).message}`);
    }
  }

  if (failures.length > 0) {
    throw new Error(`[cleanup FAILED] Orphaned product(s) must be removed manually:\n  ${failures.join('\n  ')}`);
  }
});

test.describe('Product Management — Delete Product', () => {
  test('PM-014 — deleting a self-owned product requires native browser confirmation', async ({
    marketPage,
    temporaryProduct,
  }) => {
    const panel = marketPage.productsPanel;

    const deleteRequests: string[] = [];
    const onRequest = (request: { method: () => string; url: () => string }) => {
      if (request.method() === 'DELETE' && request.url().includes('/api/products')) {
        deleteRequests.push(request.url());
      }
    };
    marketPage.page.on('request', onRequest);

    const dialog = await panel.deleteProduct(temporaryProduct.name, 'dismiss');

    marketPage.page.off('request', onRequest);

    expect(dialog.type).toBe('confirm');
    expect(dialog.message).toBe('Are you sure you want to delete this product?');

    expect(deleteRequests).toEqual([]);
    expect(await panel.hasProductNamed(temporaryProduct.name)).toBe(true);
  });

  test('PM-015 — accepting the delete confirmation permanently removes the product', async ({
    marketPage,
    temporaryProduct,
  }) => {
    const panel = marketPage.productsPanel;
    expect(await panel.hasProductNamed(temporaryProduct.name)).toBe(true);

    const dialog = await panel.deleteProduct(temporaryProduct.name, 'accept');
    temporaryProduct.markDeletedByTest();

    expect(dialog.type).toBe('confirm');
    expect(dialog.message).toBe('Are you sure you want to delete this product?');

    await panel.waitForProductAbsent(temporaryProduct.name);
    expect(await panel.hasProductNamed(temporaryProduct.name)).toBe(false);
  });

  test('PM-016 — deletion is permanent and confirmed after reload', async ({ marketPage }, testInfo) => {
    const panel = marketPage.productsPanel;
    const product = buildProduct({ shortLabel: 'pm016', workerIndex: testInfo.workerIndex });

    const baselineProducts = (await marketPage.statsBar.productsCount.textContent())?.trim();
    const baselineInventory = (await marketPage.statsBar.inventoryValue.textContent())?.trim();

    const form = await panel.openAddProduct();
    await form.fillName(register(product.name));
    await form.selectCategory(product.categoryFormLabel);
    await form.fillPrice(product.price);
    await form.fillStock(product.stock);
    await panel.saveAndAwaitCatalog();
    await panel.waitForProductPresent(product.name);

    await panel.deleteProduct(product.name, 'accept');
    await panel.waitForProductAbsent(product.name);
    createdNames = createdNames.filter((name) => name !== product.name);

    await marketPage.goto();
    await panel.waitForCatalogLoaded();

    expect(await panel.hasProductNamed(product.name)).toBe(false);
    await expect(marketPage.statsBar.productsCount).toHaveText(baselineProducts ?? '');
    await expect(marketPage.statsBar.inventoryValue).toHaveText(baselineInventory ?? '');
  });
});
