import { test, expect } from '../../src/fixtures';
import type { MarketPage } from '../../src/pages/MarketPage';
import { buildProduct } from '../../src/data/product-builder';

let createdNames: string[] = [];

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

test.describe('Product Management — Lifecycle', () => {
  test('PM-017 / JRN-003 / CAT-005 — full lifecycle: create, view, edit, and delete the same product', async ({
    marketPage,
  }, testInfo) => {
    const panel = marketPage.productsPanel;
    const product = buildProduct({ shortLabel: 'pm017', workerIndex: testInfo.workerIndex });
    const editedPrice = '13.50';
    expect(editedPrice).not.toBe(product.price);

    const baselineProducts = (await marketPage.statsBar.productsCount.textContent())?.trim();
    const baselineInventory = (await marketPage.statsBar.inventoryValue.textContent())?.trim();

    const form = await panel.openAddProduct();
    await form.fillName(product.name);
    createdNames.push(product.name);
    await form.selectCategory(product.categoryFormLabel);
    await form.fillPrice(product.price);
    await form.fillStock(product.stock);
    await panel.saveAndAwaitCatalog();
    await panel.waitForProductPresent(product.name);

    const details = await panel.openDetailsByName(product.name);
    await expect(details.heading).toContainText(product.name);
    const productIdAfterCreate = (await details.productId.textContent())?.trim() ?? '';
    expect(productIdAfterCreate).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
    await expect(details.price).toHaveText(`$${product.price}`);
    await details.close('close-button');

    const editForm = await panel.openEditProduct(product.name);
    await expect(editForm.title).toHaveText('Edit Product');
    expect(await editForm.getBoundProductId()).toBe(productIdAfterCreate);
    await expect(editForm.nameField).toHaveValue(product.name);
    await expect(editForm.priceField).toHaveValue(product.price);
    await editForm.fillPrice(editedPrice);
    await panel.saveAndAwaitCatalog();

    const detailsAfterEdit = await panel.openDetailsByName(product.name);
    await expect(detailsAfterEdit.price).toHaveText(`$${editedPrice}`);
    expect((await detailsAfterEdit.productId.textContent())?.trim()).toBe(productIdAfterCreate);
    await detailsAfterEdit.close('close-button');

    const dialog = await panel.deleteProduct(product.name, 'accept');
    expect(dialog.message).toBe('Are you sure you want to delete this product?');
    await panel.waitForProductAbsent(product.name);
    createdNames = createdNames.filter((name) => name !== product.name);

    expect(await panel.hasProductNamed(product.name)).toBe(false);
    await expect(marketPage.statsBar.productsCount).toHaveText(baselineProducts ?? '');
    await expect(marketPage.statsBar.inventoryValue).toHaveText(baselineInventory ?? '');
  });
});
