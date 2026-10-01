import { test, expect } from '../../src/fixtures';
import type { Response } from '@playwright/test';
import type { MarketPage } from '../../src/pages/MarketPage';
import { CATEGORIES, CATEGORY_PLACEHOLDER } from '../../src/data/catalog-reference';
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

test.describe('Product Management — Add Product', () => {
  test('PM-001 / CAT-004 / CAT-006 — valid product creation succeeds with all required fields and persists across a full reload', async ({
    marketPage,
  }, testInfo) => {
    const panel = marketPage.productsPanel;
    const product = buildProduct({ shortLabel: 'pm001', workerIndex: testInfo.workerIndex });

    const form = await panel.openAddProduct();
    await expect(form.title).toHaveText('Add Product');
    expect(await form.getBoundProductId()).toBe('');

    await form.fillName(register(product.name));
    await form.selectCategory(product.categoryFormLabel);
    await form.fillPrice(product.price);
    await form.fillStock(product.stock);

    await panel.saveAndAwaitCatalog();

    await expect(marketPage.alertBanner).toBeVisible();
    await expect(marketPage.alertBanner).toHaveText('Product created successfully!');

    await panel.waitForProductPresent(product.name);
    const card = panel.cardByName(product.name);
    await expect(card.nameHeading).toHaveText(product.name);
    await expect(card.categoryText).toHaveText(product.categoryCardLabel);
    await expect(card.price).toHaveText(`$${product.price}`);
    await expect(card.stockText).toContainText(product.stock);

    await marketPage.goto();
    await panel.waitForCatalogLoaded();
    expect(await panel.hasProductNamed(product.name), 'the same product is listed after a full reload').toBe(true);
  });

  test('PM-002 — the Category dropdown offers exactly the ten catalog categories', async ({ marketPage }) => {
    const panel = marketPage.productsPanel;

    const form = await panel.openAddProduct();

    const options = await form.getCategoryOptionLabels();

    expect(options).toEqual([CATEGORY_PLACEHOLDER, ...CATEGORIES.map((category) => category.formLabel)]);
    await expect(form.categorySelect).toHaveValue('');

    await form.cancel();
  });

  test('PM-003 — a single Details key/value pair can be added during creation', async ({ marketPage }, testInfo) => {
    const panel = marketPage.productsPanel;
    const detail = { key: 'origin', value: 'local' };
    const product = buildProduct({ shortLabel: 'pm003', workerIndex: testInfo.workerIndex, detail });

    const form = await panel.openAddProduct();
    await form.fillName(register(product.name));
    await form.selectCategory(product.categoryFormLabel);
    await form.fillPrice(product.price);
    await form.fillStock(product.stock);

    await form.addDetail(detail.key, detail.value);

    const row = form.detailRow(detail.key);
    await expect(row).toBeVisible();
    await expect(row).toContainText(detail.value);

    await panel.saveAndAwaitCatalog();
    await panel.waitForProductPresent(product.name);

    const modal = await panel.openDetailsByName(product.name);
    const specifications = await modal.getSpecifications();
    expect(specifications).toContainEqual({ key: `${detail.key}:`, value: detail.value });
    await modal.close('close-button');
  });

  test('PM-009 — a Price of 0 passes browser validation but is rejected by the server', async ({
    marketPage,
  }, testInfo) => {
    const panel = marketPage.productsPanel;
    const product = buildProduct({
      shortLabel: 'pm009',
      workerIndex: testInfo.workerIndex,
      price: '0',
      stock: '10',
    });

    const baselineCount = await panel.getRenderedCardCount();

    const createResponseStatuses: number[] = [];
    const onResponse = (response: Response) => {
      if (response.request().method() === 'POST' && response.url().includes('/api/products')) {
        createResponseStatuses.push(response.status());
      }
    };
    marketPage.page.on('response', onResponse);

    const form = await panel.openAddProduct();
    await form.fillName(register(product.name));
    await form.selectCategory(product.categoryFormLabel);
    await form.fillPrice(product.price);
    await form.fillStock(product.stock);

    expect(await form.getFirstInvalidField()).toBeNull();
    const priceValidity = await form.getValidity('price');
    expect(priceValidity.valid).toBe(true);
    expect(priceValidity.valueMissing).toBe(false);
    expect(priceValidity.rangeUnderflow).toBe(false);

    const rejection = marketPage.page.waitForResponse(
      (response) => response.request().method() === 'POST' && response.url().includes('/api/products'),
    );
    await form.clickSave();
    const response = await rejection;

    marketPage.page.off('response', onResponse);

    expect(response.status()).toBe(400);
    expect(createResponseStatuses).toEqual([400]);

    await expect(form.root).toBeVisible();
    await expect(marketPage.alertBanner).toBeVisible();
    await expect(marketPage.alertBanner).toHaveText('Failed to save product');

    await expect(panel.cardByName(product.name).root).toHaveCount(0);
    expect(await panel.getRenderedCardCount()).toBe(baselineCount);

    await form.cancel();
  });

  test('PM-021 — Stock = 0 with a positive Price is created successfully', async ({ marketPage }, testInfo) => {
    const panel = marketPage.productsPanel;
    const product = buildProduct({
      shortLabel: 'pm021',
      workerIndex: testInfo.workerIndex,
      price: '10',
      stock: '0',
    });

    const form = await panel.openAddProduct();
    await form.fillName(register(product.name));
    await form.selectCategory(product.categoryFormLabel);
    await form.fillPrice(product.price);
    await form.fillStock(product.stock);

    expect(await form.getFirstInvalidField()).toBeNull();

    await panel.saveAndAwaitCatalog();
    await expect(form.root).toBeHidden();
    await panel.waitForProductPresent(product.name);

    const card = panel.cardByName(product.name);
    await expect(card.nameHeading).toHaveText(product.name);
    await expect(card.price).toHaveText('$10.00');
    await expect(card.stockText).toHaveText('⚠️ Out of Stock');

    const details = await panel.openDetailsByName(product.name);
    await expect(details.heading).toContainText(product.name);
    await expect(details.availableUnits).toHaveText('0 units');
    await details.close('close-button');

    const dialog = await panel.deleteProduct(product.name, 'accept');
    expect(dialog.message).toBe('Are you sure you want to delete this product?');
    await panel.waitForProductAbsent(product.name);
    createdNames = createdNames.filter((name) => name !== product.name);
    expect(await panel.hasProductNamed(product.name)).toBe(false);
  });

  test('PM-010 — a newly created product silently defaults to Zone="Standard" and Type="Each"', async ({
    marketPage,
  }, testInfo) => {
    const panel = marketPage.productsPanel;
    const product = buildProduct({ shortLabel: 'pm010', workerIndex: testInfo.workerIndex });

    const form = await panel.openAddProduct();
    await form.fillName(register(product.name));
    await form.selectCategory(product.categoryFormLabel);
    await form.fillPrice(product.price);
    await form.fillStock(product.stock);

    await panel.saveAndAwaitCatalog();
    await panel.waitForProductPresent(product.name);

    const card = panel.cardByName(product.name);
    await expect(card.metaChips).toHaveCount(2);
    await expect(card.metaChips.nth(0)).toHaveText('Standard');
    await expect(card.metaChips.nth(1)).toHaveText('Each');
  });
});
