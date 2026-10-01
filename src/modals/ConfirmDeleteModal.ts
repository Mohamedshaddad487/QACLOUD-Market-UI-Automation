import type { Locator, Page } from '@playwright/test';

export class ConfirmDeleteModal {
  readonly page: Page;
  readonly root: Locator;
  readonly heading: Locator;
  readonly body: Locator;
  readonly orderNumber: Locator;
  readonly cancelButton: Locator;
  readonly deleteButton: Locator;
  readonly closeXButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.root = page.locator('#deleteOrderModal');
    this.heading = this.root.getByRole('heading', { name: '⚠️ Confirm Delete', level: 3 });
    this.body = this.root.getByText('Are you sure you want to delete this order? This action cannot be undone.', {
      exact: true,
    });
    this.orderNumber = this.root.locator('#deleteOrderNumber');
    this.cancelButton = this.root.getByRole('button', { name: 'Cancel', exact: true });
    this.deleteButton = this.root.getByRole('button', { name: 'Delete Order', exact: true });
    this.closeXButton = this.root.getByRole('button', { name: '×' });
  }

  async cancel(): Promise<void> {
    await this.cancelButton.click();
    await this.root.waitFor({ state: 'hidden' });
  }

  async confirm(): Promise<void> {
    await this.deleteButton.click();
  }
}
