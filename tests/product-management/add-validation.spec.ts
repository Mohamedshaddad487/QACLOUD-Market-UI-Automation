import { test, expect } from '../../src/fixtures';
import { CATEGORIES } from '../../src/data/catalog-reference';

const [CATEGORY] = CATEGORIES;

test.describe('Product Management — Add Product validation', () => {
  test('PM-004 — submitting with all fields empty shows native validation starting with Product Name', async ({
    marketPage,
  }) => {
    const panel = marketPage.productsPanel;
    const baselineCount = await panel.getRenderedCardCount();

    const form = await panel.openAddProduct();
    await expect(form.title).toHaveText('Add Product');

    await form.clickSave();

    expect(await form.getFirstInvalidField()).toBe('name');
    const nameValidity = await form.getValidity('name');
    expect(nameValidity.valid).toBe(false);
    expect(nameValidity.valueMissing).toBe(true);
    expect(nameValidity.message).toBe('Please fill out this field.');

    await expect(form.root).toBeVisible();
    expect(await panel.getRenderedCardCount()).toBe(baselineCount);

    await form.cancel();
  });

  test('PM-005 — with Product Name filled, an unselected Category is flagged next', async ({ marketPage }) => {
    const panel = marketPage.productsPanel;
    const baselineCount = await panel.getRenderedCardCount();

    const form = await panel.openAddProduct();
    await form.fillName('AUT-validation-not-saved');

    await form.clickSave();

    expect(await form.getFirstInvalidField()).toBe('category');
    const categoryValidity = await form.getValidity('category');
    expect(categoryValidity.valid).toBe(false);
    expect(categoryValidity.valueMissing).toBe(true);
    expect(categoryValidity.message).toBe('Please select an item in the list.');

    await expect(form.root).toBeVisible();
    expect(await panel.getRenderedCardCount()).toBe(baselineCount);

    await form.cancel();
  });

  test('PM-006 — with Name and Category filled, an empty Price is flagged next', async ({ marketPage }) => {
    const panel = marketPage.productsPanel;
    const baselineCount = await panel.getRenderedCardCount();

    const form = await panel.openAddProduct();
    await form.fillName('AUT-validation-not-saved');
    await form.selectCategory(CATEGORY.formLabel);

    await form.clickSave();

    expect(await form.getFirstInvalidField()).toBe('price');
    const priceValidity = await form.getValidity('price');
    expect(priceValidity.valid).toBe(false);
    expect(priceValidity.valueMissing).toBe(true);
    expect(priceValidity.message).toBe('Please fill out this field.');

    await expect(form.root).toBeVisible();
    expect(await panel.getRenderedCardCount()).toBe(baselineCount);

    await form.cancel();
  });

  test('PM-007 — a negative Price is rejected at the confirmed min=0 boundary', async ({ marketPage }) => {
    const panel = marketPage.productsPanel;
    const baselineCount = await panel.getRenderedCardCount();

    const form = await panel.openAddProduct();
    await form.fillName('AUT-validation-not-saved');
    await form.selectCategory(CATEGORY.formLabel);
    await form.fillPrice('-5');

    await form.clickSave();

    const priceValidity = await form.getValidity('price');
    expect(priceValidity.valid).toBe(false);
    expect(priceValidity.rangeUnderflow).toBe(true);
    expect(priceValidity.valueMissing).toBe(false);
    expect(priceValidity.message).toBe('Value must be greater than or equal to 0.');

    await expect(form.root).toBeVisible();
    expect(await panel.getRenderedCardCount()).toBe(baselineCount);

    await form.cancel();
  });

  test('PM-008 — an empty Stock is flagged after Price, and a negative Stock is rejected identically', async ({
    marketPage,
  }) => {
    const panel = marketPage.productsPanel;
    const baselineCount = await panel.getRenderedCardCount();

    const form = await panel.openAddProduct();
    await form.fillName('AUT-validation-not-saved');
    await form.selectCategory(CATEGORY.formLabel);
    await form.fillPrice('3.50');

    await form.clickSave();

    expect(await form.getFirstInvalidField()).toBe('stock');
    const emptyStock = await form.getValidity('stock');
    expect(emptyStock.valid).toBe(false);
    expect(emptyStock.valueMissing).toBe(true);
    expect(emptyStock.message).toBe('Please fill out this field.');

    await form.fillStock('-3');
    await form.clickSave();

    const negativeStock = await form.getValidity('stock');
    expect(negativeStock.valid).toBe(false);
    expect(negativeStock.rangeUnderflow).toBe(true);
    expect(negativeStock.valueMissing).toBe(false);
    expect(negativeStock.message).toBe('Value must be greater than or equal to 0.');

    await expect(form.root).toBeVisible();
    expect(await panel.getRenderedCardCount()).toBe(baselineCount);

    await form.cancel();
  });
});
