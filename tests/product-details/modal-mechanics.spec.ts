import { test, expect } from '../../src/fixtures';
import { MarketPage } from '../../src/pages/MarketPage';
import { CATEGORIES } from '../../src/data/catalog-reference';

test.describe('Product Details — View Details mechanics', () => {
  test('DET-001 — opening View Details renders a same-page modal with no navigation', async ({
    authenticatedPage,
  }) => {
    const market = new MarketPage(authenticatedPage);
    const panel = market.productsPanel;
    await market.goto();
    await panel.waitForCatalogLoaded();

    const productName = await panel.card(0).nameHeading.textContent();

    const modal = await panel.openDetails(0);

    await expect(authenticatedPage).toHaveURL(/\/market\.html$/);
    await expect(authenticatedPage).toHaveTitle('Market | qacloud');
    await expect(modal.root).toBeVisible();
    await expect(modal.heading).toContainText(productName?.trim() ?? '');

    await modal.close('x');
  });

  test('DET-002 — View Details closes via the "×" control', async ({ authenticatedPage }) => {
    const market = new MarketPage(authenticatedPage);
    const panel = market.productsPanel;
    await market.goto();
    await panel.waitForCatalogLoaded();

    const modal = await panel.openDetails(0);
    await expect(modal.root).toBeVisible();

    await modal.close('x');

    await expect(modal.root).toBeHidden();
  });

  test('DET-003 — View Details closes via the "Close" control', async ({ authenticatedPage }) => {
    const market = new MarketPage(authenticatedPage);
    const panel = market.productsPanel;
    await market.goto();
    await panel.waitForCatalogLoaded();

    const modal = await panel.openDetails(0);
    await expect(modal.root).toBeVisible();

    await modal.close('close-button');

    await expect(modal.root).toBeHidden();
  });

  test('DET-004 — [Defect] Escape key does not close View Details', async ({ authenticatedPage }) => {
    const market = new MarketPage(authenticatedPage);
    const panel = market.productsPanel;
    await market.goto();
    await panel.waitForCatalogLoaded();

    const modal = await panel.openDetails(0);
    await expect(modal.root).toBeVisible();

    await authenticatedPage.keyboard.press('Escape');

    await expect(modal.root).toBeVisible();

    await modal.close('x');
  });

  test('DET-005 — the modal blocks interaction with the background catalog', async ({
    authenticatedPage,
  }) => {
    const market = new MarketPage(authenticatedPage);
    const panel = market.productsPanel;
    await market.goto();
    await panel.waitForCatalogLoaded();

    const modal = await panel.openDetails(0);
    await expect(modal.root).toBeVisible();

    await expect(panel.filterBar.searchBox.click({ timeout: 3000 })).rejects.toThrow();

    await expect(panel.filterBar.searchBox).toHaveValue('');

    await modal.close('x');
  });

  test('DET-006 — filter and search state is preserved across opening and closing View Details', async ({
    authenticatedPage,
  }) => {
    const market = new MarketPage(authenticatedPage);
    const panel = market.productsPanel;
    await market.goto();
    await panel.waitForCatalogLoaded();

    const [category] = CATEGORIES;
    await panel.applyAndAwaitCatalog(() => panel.categoryChips.toggle(category.chipLabel));
    await expect(panel.filterBar.activeFilters).toContainText('1 category');

    const beforeCount = await panel.getShownCount();
    const beforeChip = await panel.filterBar.activeFilters.textContent();

    const modal = await panel.openDetails(0);
    await expect(modal.root).toBeVisible();
    await modal.close('x');
    await expect(modal.root).toBeHidden();

    expect(await panel.getShownCount()).toBe(beforeCount);
    expect(await panel.filterBar.activeFilters.textContent()).toBe(beforeChip);

    await panel.applyAndAwaitCatalog(() => panel.categoryChips.clearFilters());
  });
});
