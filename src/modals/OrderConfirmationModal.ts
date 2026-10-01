import type { Locator, Page } from '@playwright/test';
import { awaitRequestFrom } from '../support/basket-requests';
import { isOrdersRead } from '../support/order-requests';
import { isCatalogRequest } from '../panels/ProductsPanel';

export type OrderConfirmationLine = {
  label: string;
  amount: string;
};

export class OrderConfirmationModal {
  readonly page: Page;
  readonly root: Locator;
  readonly heading: Locator;
  readonly orderNumber: Locator;
  readonly totalAmount: Locator;
  readonly itemsList: Locator;
  readonly viewOrdersButton: Locator;
  readonly continueShoppingButton: Locator;
  readonly closeXButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.root = page.locator('#orderSuccessModal');
    this.heading = this.root.getByRole('heading', { name: '✅ Order Placed Successfully!', level: 3 });
    this.orderNumber = this.root.locator('#orderNumber');
    this.totalAmount = this.root.locator('#orderTotal');
    this.itemsList = this.root.locator('#orderItemsList');
    this.viewOrdersButton = this.root.getByRole('button', { name: 'View Orders', exact: true });
    this.continueShoppingButton = this.root.getByRole('button', { name: 'Continue Shopping', exact: true });
    this.closeXButton = this.root.getByRole('button', { name: '×' });
  }

  async readItems(): Promise<OrderConfirmationLine[]> {
    const rows = this.itemsList.locator('> div');
    const count = await rows.count();
    const items: OrderConfirmationLine[] = [];
    for (let index = 0; index < count; index += 1) {
      const spans = rows.nth(index).locator('span');
      const [label, amount] = await spans.allTextContents();
      items.push({ label: (label ?? '').trim(), amount: (amount ?? '').trim() });
    }
    return items;
  }

  async viewOrders(): Promise<void> {
    await awaitRequestFrom(this.page, isOrdersRead, () => this.viewOrdersButton.click());
    await this.root.waitFor({ state: 'hidden' });
  }

  async continueShopping(): Promise<void> {
    await awaitRequestFrom(this.page, isCatalogRequest, () => this.continueShoppingButton.click());
    await this.root.waitFor({ state: 'hidden' });
  }
}
