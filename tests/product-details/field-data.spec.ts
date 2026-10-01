import { test, expect } from '../../src/fixtures';
import { MarketPage } from '../../src/pages/MarketPage';
import type { ProductsPanel } from '../../src/panels/ProductsPanel';

async function findLowStockCardIndex(panel: ProductsPanel): Promise<number> {
  const cardCount = await panel.getRenderedCardCount();
  for (let index = 0; index < cardCount; index += 1) {
    const stockText = await panel.card(index).stockText.textContent();
    if (stockText?.includes('Low Stock')) return index;
  }
  throw new Error('No product card currently shows a low-stock indicator — DET-009 has no subject to test.');
}

test.describe('Product Details — Field data', () => {
  test('DET-007 — View Details displays the confirmed field set', async ({ authenticatedPage }) => {
    const market = new MarketPage(authenticatedPage);
    const panel = market.productsPanel;
    await market.goto();
    await panel.waitForCatalogLoaded();

    const card = panel.card(0);
    const cardCategory = (await card.categoryText.textContent())?.trim();
    const cardPrice = (await card.price.textContent())?.trim();

    const modal = await panel.openDetails(0);

    await expect(modal.category).not.toHaveText('');
    await expect(modal.price).not.toHaveText('');
    await expect(modal.stockStatus).not.toHaveText('');
    await expect(modal.availableUnits).not.toHaveText('');
    await expect(modal.specificationsHeading).toBeVisible();
    await expect(modal.productId).not.toHaveText('');

    const specifications = await modal.getSpecifications();
    expect(specifications.length).toBeGreaterThan(0);

    await expect(modal.productId).toHaveText(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);

    await expect(modal.category).toHaveText(cardCategory ?? '');
    await expect(modal.price).toHaveText(cardPrice ?? '');

    await modal.close('x');
  });

  test('DET-008 — View Details omits Zone and Type despite both being visible on the card', async ({
    authenticatedPage,
  }) => {
    const market = new MarketPage(authenticatedPage);
    const panel = market.productsPanel;
    await market.goto();
    await panel.waitForCatalogLoaded();

    const card = panel.card(0);
    await expect(card.metaChips).toHaveCount(2);

    const modal = await panel.openDetails(0);
    await expect(modal.root).toBeVisible();

    await expect(modal.root.getByText('Zone', { exact: true })).toHaveCount(0);
    await expect(modal.root.getByText('Type', { exact: true })).toHaveCount(0);

    await modal.close('x');
  });

  test("DET-009 — [Defect] View Details Stock Status text can disagree with the product card's stock indicator", async ({
    authenticatedPage,
  }) => {
    const market = new MarketPage(authenticatedPage);
    const panel = market.productsPanel;
    await market.goto();
    await panel.waitForCatalogLoaded();

    const lowStockIndex = await findLowStockCardIndex(panel);
    const card = panel.card(lowStockIndex);
    const cardStockText = (await card.stockText.textContent())?.trim() ?? '';
    const cardUnitsMatch = cardStockText.match(/(\d+)/);
    if (!cardUnitsMatch) {
      throw new Error(`Could not parse a stock number from the card's stock text: "${cardStockText}"`);
    }
    const cardUnits = Number(cardUnitsMatch[1]);

    expect(cardStockText).toContain('Low Stock');

    const modal = await panel.openDetails(lowStockIndex);

    await expect(modal.stockStatus).toHaveText('✅ In Stock');

    const modalUnitsText = (await modal.availableUnits.textContent())?.trim() ?? '';
    const modalUnitsMatch = modalUnitsText.match(/(\d+)/);
    if (!modalUnitsMatch) {
      throw new Error(`Could not parse a units number from the modal's Available Units text: "${modalUnitsText}"`);
    }
    expect(Number(modalUnitsMatch[1])).toBe(cardUnits);

    await modal.close('x');
  });
});
