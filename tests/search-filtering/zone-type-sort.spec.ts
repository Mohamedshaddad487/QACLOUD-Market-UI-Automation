import { test, expect } from '../../src/fixtures';
import { MarketPage } from '../../src/pages/MarketPage';
import { CATEGORIES, TYPES, ZONES } from '../../src/data/catalog-reference';

const [CATEGORY] = CATEGORIES;

test.describe('Search & Filtering — Zone / Type / Sort', () => {
  test('FIL-015 — selecting a zone value narrows the catalog to that zone', async ({
    authenticatedPage,
  }) => {
    const market = new MarketPage(authenticatedPage);
    const panel = market.productsPanel;
    await market.goto();
    await panel.waitForCatalogLoaded();

    const baseline = await panel.getRenderedProducts();
    const zone = ZONES.find((candidate) => candidate === baseline[0].zone);
    if (!zone) {
      throw new Error(`Rendered zone "${baseline[0].zone}" is not one of the known Zone values.`);
    }
    const expected = baseline.filter((product) => product.zone === zone);

    await panel.applyAndAwaitCatalog(() => panel.filterBar.selectZone(zone));

    await expect(async () => {
      expect(await panel.getShownCount()).toBe(expected.length);
    }).toPass();
    await expect(panel.filterBar.activeFilters).toContainText(`zone: ${zone}`);

    const settled = await panel.getRenderedProducts();
    expect(settled.length).toBe(expected.length);
    expect(settled.length).toBeLessThan(baseline.length);
    expect(settled.filter((product) => product.zone !== zone).map((p) => p.name)).toEqual([]);
  });

  test('FIL-016 — selecting a type value narrows the catalog to that type', async ({
    authenticatedPage,
  }) => {
    const market = new MarketPage(authenticatedPage);
    const panel = market.productsPanel;
    await market.goto();
    await panel.waitForCatalogLoaded();

    const baseline = await panel.getRenderedProducts();
    const type = TYPES.find((candidate) => candidate === baseline[0].type);
    if (!type) {
      throw new Error(`Rendered type "${baseline[0].type}" is not one of the known Type values.`);
    }
    const expected = baseline.filter((product) => product.type === type);

    await panel.applyAndAwaitCatalog(() => panel.filterBar.selectType(type));

    await expect(async () => {
      expect(await panel.getShownCount()).toBe(expected.length);
    }).toPass();

    const settled = await panel.getRenderedProducts();
    expect(settled.length).toBe(expected.length);
    expect(settled.length).toBeLessThan(baseline.length);
    expect(settled.filter((product) => product.type !== type).map((p) => p.name)).toEqual([]);
  });

  test('FIL-017 — [Defect] Zone/Type/Sort changes display a transient stale state before settling', async ({
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
    const expectedAfterSettle = baseline.filter((product) => product.zone === zone).length;
    expect(expectedAfterSettle).toBeLessThan(baselineCount);

    await panel.filterBar.selectZone(zone);

    expect(
      await panel.getShownCount(),
      'displayed count immediately after a Zone change (EV-P2-005)',
    ).toBe(baselineCount);
    await expect(panel.filterBar.activeFilters).toHaveText('No active filters');

    await expect(async () => {
      expect(await panel.getShownCount()).toBe(expectedAfterSettle);
    }).toPass();
    await expect(panel.filterBar.activeFilters).toContainText(`zone: ${zone}`);
  });

  test('FIL-018 — a category selected right after a Zone/Type/Sort change is combined with that change', async ({
    authenticatedPage,
  }) => {
    const market = new MarketPage(authenticatedPage);
    const panel = market.productsPanel;
    await market.goto();
    await panel.waitForCatalogLoaded();

    await panel.applyAndAwaitCatalog(() => panel.categoryChips.toggle(CATEGORY.chipLabel));
    await expect(panel.filterBar.activeFilters).toContainText('1 category');
    const categoryOnly = await panel.getRenderedProducts();

    const zone = ZONES.find((candidate) => candidate === categoryOnly[0].zone);
    if (!zone) {
      throw new Error(`Rendered zone "${categoryOnly[0].zone}" is not one of the known Zone values.`);
    }
    const expected = categoryOnly.filter((product) => product.zone === zone);

    await panel.applyAndAwaitCatalog(() => panel.categoryChips.clearFilters());
    await expect(panel.filterBar.activeFilters).toHaveText('No active filters');

    await panel.filterBar.selectZone(zone);
    await panel.categoryChips.toggle(CATEGORY.chipLabel);

    await expect(async () => {
      expect(await panel.getShownCount()).toBe(expected.length);
    }).toPass();
    await expect(panel.filterBar.activeFilters).toContainText('1 category');
    await expect(panel.filterBar.activeFilters).toContainText(`zone: ${zone}`);

    const combined = await panel.getRenderedProducts();
    expect(combined.length).toBe(expected.length);
    expect(combined.filter((product) => product.category !== CATEGORY.cardLabel)).toEqual([]);
    expect(combined.filter((product) => product.zone !== zone)).toEqual([]);
  });
});
