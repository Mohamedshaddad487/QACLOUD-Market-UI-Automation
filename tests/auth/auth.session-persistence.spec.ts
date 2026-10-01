import { test, expect } from '../../src/fixtures';
import { MarketPage } from '../../src/pages/MarketPage';
import { ProfilePage } from '../../src/pages/ProfilePage';

test.use({ screenshot: 'off', video: 'off', trace: 'off' });

test.describe('Authentication & Session — Session persistence', () => {
  test('AUTH-004 — authenticated user can access the protected Market application', async ({ authenticatedPage }) => {
    const market = new MarketPage(authenticatedPage);
    await market.goto();

    await expect(authenticatedPage).toHaveURL(/\/market\.html$/);
    await expect(authenticatedPage).toHaveTitle('Market | qacloud');
    await expect(async () => {
      expect(await market.productsPanel.getShownCount()).toBeGreaterThan(0);
    }).toPass();
  });

  test('AUTH-005 — session persists across navigation to another protected route', async ({ authenticatedPage }) => {
    const profile = new ProfilePage(authenticatedPage);
    const market = new MarketPage(authenticatedPage);

    await profile.goto();
    await expect(profile.header.username).toBeVisible();
    await expect(profile.header.username).toHaveText(/\S/);
    await expect(authenticatedPage).toHaveURL(/\/profile\.html$/);
    await expect(profile.header.logoutButton).toBeVisible();
    const username = await profile.header.username.innerText();

    await market.goto();

    await expect(market.header.username).toBeVisible();
    await expect(market.header.username).toHaveText(username);
    await expect(authenticatedPage).toHaveURL(/\/market\.html$/);
    await expect(authenticatedPage).toHaveTitle('Market | qacloud');
  });

  test('AUTH-006 — session persists across a full page reload', async ({ authenticatedPage }) => {
    const market = new MarketPage(authenticatedPage);
    await market.goto();
    await expect(market.header.username).toBeVisible();
    await expect(market.header.username).toHaveText(/\S/);
    const username = await market.header.username.innerText();
    await expect(authenticatedPage).toHaveTitle('Market | qacloud');

    await authenticatedPage.reload();

    await expect(market.header.username).toBeVisible();
    await expect(market.header.username).toHaveText(username);
    await expect(authenticatedPage).toHaveURL(/\/market\.html$/);
    await expect(authenticatedPage).toHaveTitle('Market | qacloud');
  });
});
