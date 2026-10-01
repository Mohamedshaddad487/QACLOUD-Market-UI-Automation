import type { Locator, Page } from '@playwright/test';
import { OrderRow, type NonFinalOrderStatus } from '../components/OrderRow';
import { ConfirmDeleteModal } from '../modals/ConfirmDeleteModal';
import { awaitRequestFrom } from '../support/basket-requests';
import { isOrdersRead, isOrderDelete, isOrderStatusUpdate } from '../support/order-requests';

export class OrdersPanel {
  readonly page: Page;
  readonly root: Locator;
  readonly heading: Locator;
  readonly refreshButton: Locator;
  readonly orderRows: Locator;
  readonly confirmDeleteModal: ConfirmDeleteModal;

  constructor(page: Page) {
    this.page = page;
    this.root = page.locator('#orders-tab');
    const content = this.root.locator('#ordersContent');
    this.heading = this.root.getByRole('heading', { name: 'My Orders', level: 2 });
    this.refreshButton = this.root.getByRole('button', { name: '🔄 Refresh', exact: true });
    this.orderRows = content.locator('.order-card');
    this.confirmDeleteModal = new ConfirmDeleteModal(page);
  }

  order(orderNumber: string): OrderRow {
    return new OrderRow(this.orderRows.filter({ has: this.page.getByText(orderNumber, { exact: true }) }));
  }

  async refresh(): Promise<void> {
    await awaitRequestFrom(this.page, isOrdersRead, () => this.refreshButton.click());
  }

  async openDeleteConfirmation(orderNumber: string): Promise<ConfirmDeleteModal> {
    const row = this.order(orderNumber);
    await row.expand();
    await row.deleteButton.click();
    await this.confirmDeleteModal.root.waitFor({ state: 'visible' });
    return this.confirmDeleteModal;
  }

  async deleteOrder(orderNumber: string, decision: 'cancel' | 'accept'): Promise<void> {
    const modal = await this.openDeleteConfirmation(orderNumber);

    if (decision === 'cancel') {
      await modal.cancel();
      return;
    }

    const response = await awaitRequestFrom(this.page, isOrderDelete, () => modal.confirm());
    if (!response.ok()) {
      throw new Error(`Deleting order ${orderNumber} was rejected with HTTP ${response.status()}.`);
    }
    await this.order(orderNumber).root.waitFor({ state: 'detached' });
  }

  async changeStatus(orderNumber: string, status: NonFinalOrderStatus): Promise<void> {
    const row = this.order(orderNumber);
    await row.expand();
    await awaitRequestFrom(this.page, isOrdersRead, async () => {
      const update = await awaitRequestFrom(this.page, isOrderStatusUpdate, () => row.selectStatus(status));
      if (!update.ok()) {
        throw new Error(`Changing order ${orderNumber} to "${status}" was rejected with HTTP ${update.status()}.`);
      }
    });
  }

  async ensureOrderAbsent(orderNumber: string): Promise<'already-absent' | 'deleted'> {
    if ((await this.order(orderNumber).root.count()) === 0) return 'already-absent';
    await this.deleteOrder(orderNumber, 'accept');
    return 'deleted';
  }
}
