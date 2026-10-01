import type { Locator } from '@playwright/test';

export type OrderItemLine = {
  label: string;
  amount: string;
};

export const NON_FINAL_ORDER_STATUSES = ['pending', 'processing', 'shipped'] as const;
export type NonFinalOrderStatus = (typeof NON_FINAL_ORDER_STATUSES)[number];

export class OrderRow {
  readonly root: Locator;
  readonly orderNumber: Locator;
  readonly total: Locator;
  readonly status: Locator;
  readonly chevron: Locator;
  readonly details: Locator;
  readonly itemsLabel: Locator;
  readonly items: Locator;
  readonly statusSelect: Locator;
  readonly deleteButton: Locator;

  constructor(root: Locator) {
    this.root = root;
    const header = root.locator('.order-header');
    this.orderNumber = root.locator('.order-id');
    this.total = header.getByText(/^\$\d+\.\d{2}$/);
    this.status = root.locator('.order-status');
    this.chevron = header.getByText(/^[▼▲]$/);
    this.details = root.locator('.order-details');
    this.itemsLabel = this.details.getByText('Items:', { exact: true });
    this.items = this.details.locator('.order-item');
    this.statusSelect = this.details.getByRole('combobox');
    this.deleteButton = this.details.getByRole('button', { name: 'Delete Order', exact: true });
  }

  async expand(): Promise<void> {
    if (await this.details.isVisible()) return;
    await this.chevron.click();
    await this.details.waitFor({ state: 'visible' });
  }

  async collapse(): Promise<void> {
    if (!(await this.details.isVisible())) return;
    await this.chevron.click();
    await this.details.waitFor({ state: 'hidden' });
  }

  async selectStatus(status: NonFinalOrderStatus): Promise<void> {
    if (!NON_FINAL_ORDER_STATUSES.includes(status)) {
      throw new Error(`"${status}" is not a non-final order status; Order Lifecycle may select only ${NON_FINAL_ORDER_STATUSES.join(', ')}.`);
    }
    await this.statusSelect.selectOption(status);
  }

  async readItems(): Promise<OrderItemLine[]> {
    const rows = await this.items.all();
    return Promise.all(
      rows.map(async (row) => {
        const [label, amount] = await row.locator('span').allTextContents();
        return { label: (label ?? '').trim(), amount: (amount ?? '').trim() };
      }),
    );
  }
}
