import { test, expect } from '../../src/fixtures';
import { MarketPage } from '../../src/pages/MarketPage';
import { ProfilePage } from '../../src/pages/ProfilePage';

test.describe('Authentication & Session — Unauthenticated access control', () => {
  test('AUTH-011 — unauthenticated direct access to the Market app is denied and redirected', async ({
    unauthenticatedPage,
  }) => {
    const market = new MarketPage(unauthenticatedPage);
    await market.goto();

    await expect(unauthenticatedPage).toHaveURL(/\/$/);
  });

  test('AUTH-012 — unauthenticated direct access to the Profile page is denied and redirected', async ({
    unauthenticatedPage,
  }) => {
    const profile = new ProfilePage(unauthenticatedPage);
    await profile.goto();

    await expect(unauthenticatedPage).toHaveURL(/\/$/);
  });
});
