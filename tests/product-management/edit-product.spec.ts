import { test, expect } from '../../src/fixtures';

test.describe('Product Management — Edit Product', () => {
  test('PM-011 — Edit Product opens pre-filled with the product\'s current values', async ({
    marketPage,
    temporaryProduct,
  }) => {
    const panel = marketPage.productsPanel;

    const form = await panel.openEditProduct(temporaryProduct.name);

    await expect(form.title).toHaveText('Edit Product');
    expect(await form.getBoundProductId()).not.toBe('');

    await expect(form.nameField).toHaveValue(temporaryProduct.input.name);
    await expect(form.categorySelect).toHaveValue(temporaryProduct.input.categorySlug);
    await expect(form.priceField).toHaveValue(temporaryProduct.input.price);
    await expect(form.stockField).toHaveValue(temporaryProduct.input.stock);

    await form.cancel();
    await expect(panel.cardByName(temporaryProduct.name).price).toHaveText(`$${temporaryProduct.input.price}`);
  });

  test('PM-012 — editing and saving a self-owned product updates it immediately', async ({
    marketPage,
    temporaryProduct,
  }) => {
    const panel = marketPage.productsPanel;
    const newPrice = '9.99';
    expect(newPrice).not.toBe(temporaryProduct.input.price);

    const form = await panel.openEditProduct(temporaryProduct.name);
    await form.fillPrice(newPrice);
    await panel.saveAndAwaitCatalog();

    await expect(panel.cardByName(temporaryProduct.name).price).toHaveText(`$${newPrice}`);
  });

  test('PM-013 — created and edited field values persist across a full page reload', async ({
    marketPage,
    temporaryProduct,
  }) => {
    const panel = marketPage.productsPanel;
    const newStock = '12';
    expect(newStock).not.toBe(temporaryProduct.input.stock);

    const form = await panel.openEditProduct(temporaryProduct.name);
    await form.fillStock(newStock);
    await panel.saveAndAwaitCatalog();
    await expect(panel.cardByName(temporaryProduct.name).stockText).toContainText(newStock);

    await marketPage.goto();
    await panel.waitForCatalogLoaded();

    const reopened = await panel.openEditProduct(temporaryProduct.name);
    await expect(reopened.nameField).toHaveValue(temporaryProduct.input.name);
    await expect(reopened.priceField).toHaveValue(temporaryProduct.input.price);
    await expect(reopened.stockField).toHaveValue(newStock);
    await reopened.cancel();
  });
});
