import { test, expect } from '../../src/fixtures';
import { MarketPage } from '../../src/pages/MarketPage';
import type { RenderedProduct } from '../../src/panels/ProductsPanel';
import { CATEGORIES, ZONES } from '../../src/data/catalog-reference';

const [CATEGORY] = CATEGORIES;

function outside(products: RenderedProduct[], cardLabels: string[]): string[] {
  return products.filter((p) => !cardLabels.includes(p.category)).map((p) => p.name);
}

test.describe('Search & Filtering — Cross-filter', () => {
  test('FIL-011 — category + zone combine with AND/intersection semantics', async ({
    authenticatedPage,
  }) => {
    const market = new MarketPage(authenticatedPage);
    const panel = market.productsPanel;
    await market.goto();
    await panel.waitForCatalogLoaded();

    await panel.applyAndAwaitCatalog(() => panel.categoryChips.toggle(CATEGORY.chipLabel));
    await expect(panel.filterBar.activeFilters).toContainText('1 category');
    const categoryOnly = await panel.getRenderedProducts();
    expect(categoryOnly.length).toBeGreaterThan(0);

    const zone = ZONES.find((candidate) => candidate === categoryOnly[0].zone);
    if (!zone) {
      throw new Error(`Rendered zone "${categoryOnly[0].zone}" is not one of the known Zone values.`);
    }
    const expectedIntersection = categoryOnly.filter((product) => product.zone === zone);

    await panel.applyAndAwaitCatalog(() => panel.filterBar.selectZone(zone));

    await expect(async () => {
      expect(await panel.getShownCount()).toBe(expectedIntersection.length);
    }).toPass();
    await expect(panel.filterBar.activeFilters).toContainText(`zone: ${zone}`);

    const combined = await panel.getRenderedProducts();

    expect(combined.length).toBe(expectedIntersection.length);
    expect(combined.length).toBeLessThanOrEqual(categoryOnly.length);
    expect(outside(combined, [CATEGORY.cardLabel])).toEqual([]);
    expect(combined.filter((product) => product.zone !== zone).map((p) => p.name)).toEqual([]);
  });

  test('FIL-012 — category + search combine with AND/intersection semantics', async ({
    authenticatedPage,
  }) => {
    const market = new MarketPage(authenticatedPage);
    const panel = market.productsPanel;
    await market.goto();
    await panel.waitForCatalogLoaded();

    await panel.applyAndAwaitCatalog(() => panel.categoryChips.toggle(CATEGORY.chipLabel));
    await expect(panel.filterBar.activeFilters).toContainText('1 category');
    const categoryOnly = await panel.getRenderedProducts();
    expect(categoryOnly.length).toBeGreaterThan(0);

    const words = categoryOnly[0].name.split(/[^A-Za-z]+/).filter((word) => word.length >= 4);
    const term = words.reduce((a, b) => (b.length > a.length ? b : a), '');
    expect(term.length, `no usable search term in "${categoryOnly[0].name}"`).toBeGreaterThanOrEqual(4);

    await panel.filterBar.search(term);

    await expect(panel.filterBar.activeFilters).toContainText(`search: "${term}"`);
    await expect(panel.filterBar.activeFilters).toContainText('1 category');

    const combined = await panel.getRenderedProducts();

    expect(combined.length).toBeGreaterThan(0);
    expect(combined.length).toBeLessThanOrEqual(categoryOnly.length);
    expect(outside(combined, [CATEGORY.cardLabel])).toEqual([]);
    expect(combined.map((product) => product.name)).toContain(categoryOnly[0].name);
  });

  test('FIL-013 — category + sort applies sorting within the category-filtered subset', async ({
    authenticatedPage,
  }) => {
    const market = new MarketPage(authenticatedPage);
    const panel = market.productsPanel;
    await market.goto();
    await panel.waitForCatalogLoaded();

    await panel.applyAndAwaitCatalog(() => panel.categoryChips.toggle(CATEGORY.chipLabel));
    await expect(panel.filterBar.activeFilters).toContainText('1 category');

    const ascending = (await panel.getRenderedProducts()).map((product) => product.name);
    expect(ascending.length).toBeGreaterThan(1);

    await panel.applyAndAwaitCatalog(() => panel.filterBar.selectSort('Sort Z-A'));

    const expectedFirst = ascending[ascending.length - 1];
    await expect(panel.card(0).nameHeading).toHaveText(expectedFirst);

    const descending = (await panel.getRenderedProducts()).map((product) => product.name);

    expect(descending.length).toBe(ascending.length);
    expect(await panel.getShownCount()).toBe(ascending.length);
    expect([...descending].reverse()).toEqual(ascending);
    await expect(panel.filterBar.activeFilters).toContainText('1 category');
  });
});
