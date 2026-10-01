import { test, expect } from '../../src/fixtures';
import { MarketPage } from '../../src/pages/MarketPage';
import { CATEGORIES, ZONES } from '../../src/data/catalog-reference';

const [FIRST] = CATEGORIES;

test.describe('Search & Filtering — Clear Filters', () => {
  test('FIL-019 — Clear Filters resets a single active category filter', async ({
    authenticatedPage,
  }) => {
    const market = new MarketPage(authenticatedPage);
    const panel = market.productsPanel;
    await market.goto();
    await panel.waitForCatalogLoaded();

    const baselineCount = await panel.getShownCount();

    await panel.applyAndAwaitCatalog(() => panel.categoryChips.toggle(FIRST.chipLabel));
    await expect(panel.filterBar.activeFilters).toContainText('1 category');
    expect(await panel.getShownCount()).toBeLessThan(baselineCount);

    await panel.applyAndAwaitCatalog(() => panel.categoryChips.clearFilters());

    await expect(panel.filterBar.activeFilters).toHaveText('No active filters');
    await expect(async () => {
      expect(await panel.getShownCount()).toBe(baselineCount);
    }).toPass();
    expect(await panel.getRenderedCardCount()).toBe(baselineCount);
  });

  test('FIL-020 — Clear Filters resets an all-ten-categories selection', async ({
    authenticatedPage,
  }) => {
    const market = new MarketPage(authenticatedPage);
    const panel = market.productsPanel;
    await market.goto();
    await panel.waitForCatalogLoaded();

    const baselineCount = await panel.getShownCount();

    for (const category of CATEGORIES) {
      await panel.applyAndAwaitCatalog(() => panel.categoryChips.toggle(category.chipLabel));
    }
    await expect(panel.filterBar.activeFilters).toContainText('10 categories');

    await panel.applyAndAwaitCatalog(() => panel.categoryChips.clearFilters());

    await expect(panel.filterBar.activeFilters).toHaveText('No active filters');
    await expect(async () => {
      expect(await panel.getShownCount()).toBe(baselineCount);
    }).toPass();
    expect(await panel.getRenderedCardCount()).toBe(baselineCount);
  });

  test('FIL-021 — Clear Filters resets every active dimension simultaneously', async ({
    authenticatedPage,
  }) => {
    const market = new MarketPage(authenticatedPage);
    const panel = market.productsPanel;
    await market.goto();
    await panel.waitForCatalogLoaded();

    const baseline = await panel.getRenderedProducts();
    const baselineCount = baseline.length;
    const zone = ZONES.find((candidate) => candidate === baseline[0].zone);
    if (!zone) {
      throw new Error(`Rendered zone "${baseline[0].zone}" is not one of the known Zone values.`);
    }

    await panel.applyAndAwaitCatalog(() => panel.categoryChips.toggle(FIRST.chipLabel));
    await expect(panel.filterBar.activeFilters).toContainText('1 category');

    await panel.applyAndAwaitCatalog(() => panel.filterBar.selectSort('Sort Z-A'));
    await expect(panel.filterBar.sortSelect).toHaveValue('desc');

    await panel.applyAndAwaitCatalog(() => panel.filterBar.selectZone(zone));
    await expect(panel.filterBar.activeFilters).toContainText(`zone: ${zone}`);

    await panel.filterBar.search('a');
    await expect(panel.filterBar.activeFilters).toContainText('search: "a"');

    await expect(panel.filterBar.activeFilters).toContainText('1 category');
    await expect(panel.filterBar.activeFilters).toContainText(`zone: ${zone}`);
    await expect(panel.filterBar.searchBox).toHaveValue('a');

    await panel.applyAndAwaitCatalog(() => panel.categoryChips.clearFilters());

    await expect(panel.filterBar.activeFilters).toHaveText('No active filters');
    await expect(panel.filterBar.searchBox).toHaveValue('');
    await expect(panel.filterBar.sortSelect).toHaveValue('asc');
    await expect(panel.filterBar.zoneSelect).toHaveValue('');
    await expect(panel.filterBar.typeSelect).toHaveValue('');

    await expect(async () => {
      expect(await panel.getShownCount()).toBe(baselineCount);
    }).toPass();
    expect(await panel.getRenderedCardCount()).toBe(baselineCount);

    await expect(panel.filterBar.activeFilters).toHaveText('No active filters');
  });
});
