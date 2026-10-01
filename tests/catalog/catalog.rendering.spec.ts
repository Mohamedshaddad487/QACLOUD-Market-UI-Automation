import { test, expect } from '../../src/fixtures';
import { MarketPage } from '../../src/pages/MarketPage';

test.describe('Product Catalog — Rendering', () => {
  test('CAT-001 — catalog loads and renders real product data for an authenticated user', async ({
    authenticatedPage,
  }) => {
    const market = new MarketPage(authenticatedPage);
    await market.goto();

    await expect(async () => {
      expect(await market.productsPanel.getShownCount()).toBeGreaterThan(0);
    }).toPass();
    await expect(async () => {
      expect(await market.productsPanel.getRenderedCardCount()).toBeGreaterThan(0);
    }).toPass();
  });

  test('CAT-002 — product cards expose a consistent, readable structure', async ({ authenticatedPage }) => {
    const market = new MarketPage(authenticatedPage);
    await market.goto();

    const card = market.productsPanel.card(0);

    await expect(card.categoryEmoji).not.toHaveText('');
    await expect(card.viewDetailsButton).toBeVisible();
    await expect(card.editButton).toBeVisible();
    await expect(card.deleteButton).toBeVisible();
    await expect(card.nameHeading).not.toHaveText('');
    await expect(card.categoryText).not.toHaveText('');
    await expect(card.metaChips.first()).not.toHaveText('');
    await expect(card.price).not.toHaveText('');
    await expect(card.stockText).not.toHaveText('');
    await expect(card.addButton).toBeVisible();
  });

  test('CAT-003 — header stats reflect the loaded catalog state', async ({ authenticatedPage }) => {
    const market = new MarketPage(authenticatedPage);
    await market.goto();

    await expect(market.statsBar.productsCount).toBeVisible();
    await expect(market.statsBar.inventoryValue).toBeVisible();

    await expect(async () => {
      const productsText = await market.statsBar.productsCount.textContent();
      expect(Number(productsText)).toBeGreaterThan(0);
    }).toPass();
    await expect(async () => {
      const inventoryText = await market.statsBar.inventoryValue.textContent();
      const value = Number(inventoryText?.replace(/[^0-9.]/g, ''));
      expect(value).toBeGreaterThan(0);
    }).toPass();
  });
});
