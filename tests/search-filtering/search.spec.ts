import { test, expect } from '../../src/fixtures';
import { MarketPage } from '../../src/pages/MarketPage';

function longestWord(name: string): string {
  const words = name.split(/[^A-Za-z]+/).filter(Boolean);
  const longest = words.reduce((a, b) => (b.length > a.length ? b : a), '');
  if (longest.length < 3) {
    throw new Error(`Could not derive a usable search term from the product name "${name}".`);
  }
  return longest;
}

test.describe('Search & Filtering — Search', () => {
  test('FIL-001 — search returns matching products for a valid term', async ({ authenticatedPage }) => {
    const market = new MarketPage(authenticatedPage);
    const panel = market.productsPanel;
    await market.goto();
    await panel.waitForCatalogLoaded();

    const baseline = await panel.getRenderedProducts();
    const term = longestWord(baseline[0].name);

    await panel.filterBar.search(term);

    await expect(panel.filterBar.activeFilters).toContainText(`search: "${term}"`);

    const results = await panel.getRenderedProducts();
    const shown = await panel.getShownCount();

    expect(results.length).toBeGreaterThan(0);
    expect(shown).toBe(results.length);
    expect(shown).toBeLessThanOrEqual(baseline.length);
    expect(results.map((product) => product.name)).toContain(baseline[0].name);
  });

  test('FIL-002 — search with no matching term shows the no-results state', async ({ authenticatedPage }) => {
    const market = new MarketPage(authenticatedPage);
    const panel = market.productsPanel;
    await market.goto();
    await panel.waitForCatalogLoaded();

    const term = 'zzzznoresults';
    await panel.filterBar.search(term);

    await expect(panel.filterBar.activeFilters).toContainText(`search: "${term}"`);

    await expect(panel.emptyState).toBeVisible();
    expect(await panel.getShownCount()).toBe(0);
    expect(await panel.getRenderedCardCount()).toBe(0);
  });

  test('FIL-003 — clearing the search text restores the unfiltered result set', async ({
    authenticatedPage,
  }) => {
    const market = new MarketPage(authenticatedPage);
    const panel = market.productsPanel;
    await market.goto();
    await panel.waitForCatalogLoaded();

    const baseline = await panel.getRenderedProducts();
    const term = longestWord(baseline[0].name);

    await panel.filterBar.search(term);
    await expect(panel.filterBar.activeFilters).toContainText(`search: "${term}"`);
    expect(await panel.getShownCount()).toBeLessThanOrEqual(baseline.length);

    await panel.filterBar.clearSearchText();

    await expect(panel.filterBar.activeFilters).toHaveText('No active filters');
    expect(await panel.getShownCount()).toBe(baseline.length);
    expect(await panel.getRenderedCardCount()).toBe(baseline.length);
  });

  test('FIL-004 — search matches hidden product Details data, not just the visible name', async ({
    authenticatedPage,
  }) => {
    const market = new MarketPage(authenticatedPage);
    const panel = market.productsPanel;
    await market.goto();
    await panel.waitForCatalogLoaded();

    const term = 'milk';
    await panel.filterBar.search(term);

    await expect(panel.filterBar.activeFilters).toContainText(`search: "${term}"`);

    const results = await panel.getRenderedProducts();
    expect(results.length).toBeGreaterThan(0);

    const hiddenDataMatches = results.filter(
      (product) =>
        !product.name.toLowerCase().includes(term) && !product.category.toLowerCase().includes(term),
    );

    expect(
      hiddenDataMatches.map((product) => product.name),
      'at least one result must match on hidden Details data rather than the visible name or category',
    ).not.toEqual([]);
  });
});
