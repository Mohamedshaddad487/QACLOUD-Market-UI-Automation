import type { Page } from '@playwright/test';
import { AppHeader } from '../components/AppHeader';
import { LoginModal } from '../components/LoginModal';

export class PortalPage {
  readonly page: Page;
  readonly header: AppHeader;
  readonly loginModal: LoginModal;

  constructor(page: Page) {
    this.page = page;
    this.header = new AppHeader(page);
    this.loginModal = new LoginModal(page);
  }

  async goto(): Promise<void> {
    await this.page.goto('/', { waitUntil: 'domcontentloaded' });
  }
}
