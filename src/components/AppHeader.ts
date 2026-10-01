import type { Locator, Page } from '@playwright/test';

export class AppHeader {
  readonly page: Page;
  readonly loginRegisterButton: Locator;
  readonly logoutButton: Locator;
  readonly basketButton: Locator;
  readonly basketCount: Locator;
  readonly username: Locator;

  constructor(page: Page) {
    this.page = page;
    this.loginRegisterButton = page.getByRole('button', { name: 'Login / Register' });
    this.logoutButton = page.getByRole('button', { name: 'Logout' });
    this.basketButton = page.getByRole('button', { name: /^🛒 Basket \d+$/ });
    this.basketCount = page.locator('#basketCount');
    this.username = page.locator('#headerUsername');
  }

  async openLoginRegister(): Promise<void> {
    await this.loginRegisterButton.click();
  }

  async logout(): Promise<void> {
    await this.logoutButton.click();
  }
}
