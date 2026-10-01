import { test, expect } from '../../src/fixtures';
import { PortalPage } from '../../src/pages/PortalPage';

test('AUTH-014 — Forgot Password sub-view is reachable and shows its confirmed static content', async ({
  unauthenticatedPage,
}) => {
  const portal = new PortalPage(unauthenticatedPage);
  await portal.goto();
  await portal.header.openLoginRegister();
  await portal.loginModal.switchToLoginTab();

  await portal.loginModal.openForgotPassword();

  await expect(portal.loginModal.resetPasswordHeading).toBeVisible();
  await expect(portal.loginModal.resetEmailField).toBeVisible();
  await expect(portal.loginModal.sendResetLinkButton).toBeVisible();
  await expect(portal.loginModal.backToLoginLink).toBeVisible();

  await portal.loginModal.backToLogin();

  await expect(portal.loginModal.usernameOrEmailField).toBeVisible();
});
