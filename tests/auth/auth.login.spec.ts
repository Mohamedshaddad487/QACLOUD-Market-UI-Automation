import { test, expect } from '../../src/fixtures';
import { PortalPage } from '../../src/pages/PortalPage';
import { ProfilePage } from '../../src/pages/ProfilePage';
import { getCredentials } from '../../src/support/env';

test.use({ screenshot: 'off', video: 'off', trace: 'off' });

test.describe('Authentication & Session — Login', () => {
  test('AUTH-001 / AUTH-002 — valid login redirects to the authenticated profile destination', async ({
    unauthenticatedPage,
  }) => {
    const { identifier, password } = getCredentials();
    const portal = new PortalPage(unauthenticatedPage);

    await portal.goto();
    await portal.header.openLoginRegister();
    await portal.loginModal.switchToLoginTab();
    await portal.loginModal.login(identifier, password);

    await expect(unauthenticatedPage).toHaveURL(/\/profile\.html$/);
    await expect(unauthenticatedPage).toHaveTitle('My Profile | qacloud');
  });

  test('AUTH-003 — authenticated header state replaces the logged-out header state', async ({ authenticatedPage }) => {
    const profile = new ProfilePage(authenticatedPage);
    await profile.goto();

    await expect(profile.header.username).toBeVisible();
    await expect(profile.header.username).toHaveText(/\S/);
    await expect(authenticatedPage).toHaveURL(/\/profile\.html$/);
    await expect(profile.header.logoutButton).toBeVisible();
    await expect(profile.header.loginRegisterButton).toBeHidden();
  });

  test('AUTH-010 — login is rejected with an incorrect password', async ({ unauthenticatedPage }) => {
    const { identifier } = getCredentials();
    const portal = new PortalPage(unauthenticatedPage);

    await portal.goto();
    await portal.header.openLoginRegister();
    await portal.loginModal.switchToLoginTab();
    const response = await portal.loginModal.loginAndAwaitResponse(identifier, 'Deliberately-Wrong-Password-987!');

    expect(response.status()).toBe(401);
    await expect(unauthenticatedPage).toHaveURL(/\/$/);
    await expect(portal.header.loginRegisterButton).toBeVisible();
  });
});
