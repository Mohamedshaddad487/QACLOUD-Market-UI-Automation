import { test as setup } from '@playwright/test';
import path from 'node:path';
import { PortalPage } from '../src/pages/PortalPage';
import { getCredentials } from '../src/support/env';

const STORAGE_STATE_PATH = path.join(process.cwd(), 'playwright/.auth/user.json');

setup.use({ screenshot: 'off', video: 'off', trace: 'off' });

setup('authenticate once and persist storage state', async ({ page }) => {
  const { identifier, password } = getCredentials();
  const portal = new PortalPage(page);

  await portal.goto();
  await portal.header.openLoginRegister();
  await portal.loginModal.switchToLoginTab();
  await portal.loginModal.login(identifier, password);

  await page.waitForURL(/\/profile\.html$/, { timeout: 15_000 });

  await page.context().storageState({ path: STORAGE_STATE_PATH });
});
