import { test, expect } from '../../src/fixtures';
import { MarketPage } from '../../src/pages/MarketPage';
import { ProfilePage } from '../../src/pages/ProfilePage';

test.use({ screenshot: 'off', video: 'off', trace: 'off' });

test.describe('Authentication & Session — Logout', () => {
  test('AUTH-007 / AUTH-008 — logout redirects to the portal root and reverts the header', async ({
    disposableSessionPage,
  }) => {
    const profile = new ProfilePage(disposableSessionPage);
    await profile.goto();

    await profile.logout();

    await expect(disposableSessionPage).toHaveURL(/\/$/);
    await expect(profile.header.loginRegisterButton).toBeVisible();
    await expect(profile.header.logoutButton).toBeHidden();
  });

  test('AUTH-009 — protected Market route is re-gated immediately after logout', async ({ disposableSessionPage }) => {
    const profile = new ProfilePage(disposableSessionPage);
    const market = new MarketPage(disposableSessionPage);

    await profile.goto();
    await profile.logout();
    await expect(disposableSessionPage).toHaveURL(/\/$/);

    await market.goto();

    await expect(disposableSessionPage).toHaveURL(/\/$/);
  });
});
