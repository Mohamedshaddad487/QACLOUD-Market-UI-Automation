import type { Page } from '@playwright/test';
import { AppHeader } from '../components/AppHeader';

export class ProfilePage {
  readonly page: Page;
  readonly header: AppHeader;

  constructor(page: Page) {
    this.page = page;
    this.header = new AppHeader(page);
  }

  async goto(): Promise<void> {
    await this.page.goto('/profile.html', { waitUntil: 'domcontentloaded' });
  }

  async logout(): Promise<void> {
    await this.header.logout();
  }
}
