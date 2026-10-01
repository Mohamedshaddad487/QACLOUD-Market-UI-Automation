import { test, expect } from '../../src/fixtures';
import { MarketPage } from '../../src/pages/MarketPage';
import type { ProductsPanel, RenderedProduct } from '../../src/panels/ProductsPanel';
import { CATEGORIES } from '../../src/data/catalog-reference';

const [FIRST, SECOND, THIRD] = CATEGORIES;

async function resetToBaseline(panel: ProductsPanel, baselineCount: number): Promise<void> {
  await panel.applyAndAwaitCatalog(() => panel.categoryChips.clearFilters());
  await expect(panel.filterBar.activeFilters).toHaveText('No active filters');
  await expect(async () => {
    expect(await panel.getShownCount()).toBe(baselineCount);
  }).toPass();
}

async function measureCategory(
  panel: ProductsPanel,
  chipLabel: string,
  baselineCount: number,
): Promise<RenderedProduct[]> {
  await resetToBaseline(panel, baselineCount);
  await panel.applyAndAwaitCatalog(() => panel.categoryChips.toggle(chipLabel));
  await expect(panel.filterBar.activeFilters).toContainText('1 category');
  return panel.getRenderedProducts();
}

function outside(products: RenderedProduct[], cardLabels: string[]): string[] {
  return products.filter((p) => !cardLabels.includes(p.category)).map((p) => p.name);
}

test.describe('Search & Filtering — Categories', () => {
  test('FIL-005 — selecting a single category filters the catalog to that category', async ({
    authenticatedPage,
  }) => {
    const market = new MarketPage(authenticatedPage);
    const panel = market.productsPanel;
    await market.goto();
    await panel.waitForCatalogLoaded();

    const baselineCount = await panel.getShownCount();

    await panel.applyAndAwaitCatalog(() => panel.categoryChips.toggle(FIRST.chipLabel));

    await expect(panel.filterBar.activeFilters).toContainText('1 category');

    const results = await panel.getRenderedProducts();
    expect(results.length).toBeGreaterThan(0);
    expect(results.length).toBeLessThan(baselineCount);
    expect(await panel.getShownCount()).toBe(results.length);
    expect(outside(results, [FIRST.cardLabel]), `products outside "${FIRST.cardLabel}"`).toEqual([]);
  });

  test('FIL-006 — selecting two categories combines results with OR/union semantics', async ({
    authenticatedPage,
  }) => {
    const market = new MarketPage(authenticatedPage);
    const panel = market.productsPanel;
    await market.goto();
    await panel.waitForCatalogLoaded();

    const baselineCount = await panel.getShownCount();

    const first = await measureCategory(panel, FIRST.chipLabel, baselineCount);
    const second = await measureCategory(panel, SECOND.chipLabel, baselineCount);

    await resetToBaseline(panel, baselineCount);
    await panel.applyAndAwaitCatalog(() => panel.categoryChips.toggle(FIRST.chipLabel));
    await panel.applyAndAwaitCatalog(() => panel.categoryChips.toggle(SECOND.chipLabel));
    await expect(panel.filterBar.activeFilters).toContainText('2 categories');

    const combined = await panel.getRenderedProducts();

    const overlap = first.filter((p) => second.some((other) => other.name === p.name));
    expect(overlap.map((p) => p.name), 'categories must be disjoint for this arithmetic').toEqual([]);

    expect(combined.length).toBe(first.length + second.length);
    expect(await panel.getShownCount()).toBe(combined.length);
    expect(outside(combined, [FIRST.cardLabel, SECOND.cardLabel])).toEqual([]);
  });

  test('FIL-007 — selecting three categories continues the OR/union pattern', async ({
    authenticatedPage,
  }) => {
    const market = new MarketPage(authenticatedPage);
    const panel = market.productsPanel;
    await market.goto();
    await panel.waitForCatalogLoaded();

    const baselineCount = await panel.getShownCount();

    const third = await measureCategory(panel, THIRD.chipLabel, baselineCount);

    await resetToBaseline(panel, baselineCount);
    await panel.applyAndAwaitCatalog(() => panel.categoryChips.toggle(FIRST.chipLabel));
    await panel.applyAndAwaitCatalog(() => panel.categoryChips.toggle(SECOND.chipLabel));
    await expect(panel.filterBar.activeFilters).toContainText('2 categories');
    const twoCategoryCount = await panel.getShownCount();

    await panel.applyAndAwaitCatalog(() => panel.categoryChips.toggle(THIRD.chipLabel));
    await expect(panel.filterBar.activeFilters).toContainText('3 categories');

    const combined = await panel.getRenderedProducts();

    expect(combined.length).toBe(twoCategoryCount + third.length);
    expect(await panel.getShownCount()).toBe(combined.length);
    expect(outside(combined, [FIRST.cardLabel, SECOND.cardLabel, THIRD.cardLabel])).toEqual([]);
  });

  test('FIL-008 — selecting all ten categories returns the full unfiltered catalog', async ({
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

    await expect(async () => {
      expect(await panel.getShownCount()).toBe(baselineCount);
    }).toPass();
    expect(await panel.getRenderedCardCount()).toBe(baselineCount);
  });

  test('FIL-009 — removing one category from a multi-selection returns to the remaining combination', async ({
    authenticatedPage,
  }) => {
    const market = new MarketPage(authenticatedPage);
    const panel = market.productsPanel;
    await market.goto();
    await panel.waitForCatalogLoaded();

    const baselineCount = await panel.getShownCount();
    const second = await measureCategory(panel, SECOND.chipLabel, baselineCount);

    await resetToBaseline(panel, baselineCount);
    await panel.applyAndAwaitCatalog(() => panel.categoryChips.toggle(FIRST.chipLabel));
    await panel.applyAndAwaitCatalog(() => panel.categoryChips.toggle(SECOND.chipLabel));
    await expect(panel.filterBar.activeFilters).toContainText('2 categories');

    await panel.applyAndAwaitCatalog(() => panel.categoryChips.toggle(FIRST.chipLabel));
    await expect(panel.filterBar.activeFilters).toContainText('1 category');

    const remaining = await panel.getRenderedProducts();
    expect(remaining.length).toBe(second.length);
    expect(outside(remaining, [SECOND.cardLabel])).toEqual([]);
  });

  test('FIL-010 — removing all selected categories returns to the unfiltered baseline', async ({
    authenticatedPage,
  }) => {
    const market = new MarketPage(authenticatedPage);
    const panel = market.productsPanel;
    await market.goto();
    await panel.waitForCatalogLoaded();

    const baselineCount = await panel.getShownCount();

    await panel.applyAndAwaitCatalog(() => panel.categoryChips.toggle(FIRST.chipLabel));
    await panel.applyAndAwaitCatalog(() => panel.categoryChips.toggle(SECOND.chipLabel));
    await expect(panel.filterBar.activeFilters).toContainText('2 categories');

    await panel.applyAndAwaitCatalog(() => panel.categoryChips.toggle(FIRST.chipLabel));
    await expect(panel.filterBar.activeFilters).toContainText('1 category');
    await panel.applyAndAwaitCatalog(() => panel.categoryChips.toggle(SECOND.chipLabel));

    await expect(panel.filterBar.activeFilters).toHaveText('No active filters');
    await expect(async () => {
      expect(await panel.getShownCount()).toBe(baselineCount);
    }).toPass();
    expect(await panel.getRenderedCardCount()).toBe(baselineCount);
  });
});
