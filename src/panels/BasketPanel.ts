import type { Locator, Page } from '@playwright/test';
import { BasketLine } from '../components/BasketLine';
import type { BasketLineSnapshot } from '../components/BasketLine';
import { OrderSummary } from '../components/OrderSummary';
import { OrderConfirmationModal } from '../modals/OrderConfirmationModal';
import { withNativeDialog } from '../support/dialogs';
import type { DialogDecision, HandledDialog } from '../support/dialogs';
import { awaitRequestFrom, isBasketClear, isBasketRead } from '../support/basket-requests';
import { isOrderCreate } from '../support/order-requests';

export type { BasketLineSnapshot } from '../components/BasketLine';

export class BasketPanel {
  readonly page: Page;
  readonly root: Locator;
  readonly heading: Locator;
  readonly refreshButton: Locator;
  readonly clearAllButton: Locator;
  readonly emptyState: Locator;
  readonly lineItems: Locator;
  readonly orderSummary: OrderSummary;
  readonly orderConfirmationModal: OrderConfirmationModal;

  constructor(page: Page) {
    this.page = page;
    this.root = page.locator('#basket-tab');
    const content = this.root.locator('#basketContent');
    this.heading = this.root.getByRole('heading', { name: 'Shopping Basket', level: 2 });
    this.refreshButton = this.root.getByRole('button', { name: '🔄 Refresh', exact: true });
    this.clearAllButton = this.root.getByRole('button', { name: '🗑️ Clear All', exact: true });
    this.emptyState = content.getByText('Your basket is empty. Start marketping!', { exact: true });
    this.lineItems = content.locator('.basket-item');
    this.orderSummary = new OrderSummary(page);
    this.orderConfirmationModal = new OrderConfirmationModal(page);
  }

  line(name: string): BasketLine {
    return new BasketLine(this.lineItems.filter({ has: this.page.getByRole('heading', { level: 3, name, exact: true }) }));
  }

  async refresh(): Promise<void> {
    await awaitRequestFrom(this.page, isBasketRead, () => this.refreshButton.click());
  }

  async clearAll(decision: DialogDecision): Promise<HandledDialog> {
    if (decision === 'dismiss') {
      return withNativeDialog(this.page, 'dismiss', () => this.clearAllButton.click());
    }

    let dialog: HandledDialog | undefined;
    await awaitRequestFrom(this.page, isBasketClear, async () => {
      dialog = await withNativeDialog(this.page, 'accept', () => this.clearAllButton.click());
    });
    if (!dialog) throw new Error('Clear All did not surface a native confirmation dialog.');
    return dialog;
  }

  async placeOrder(): Promise<OrderConfirmationModal> {
    await awaitRequestFrom(this.page, isOrderCreate, () => this.orderSummary.placeOrderButton.click());
    await this.orderConfirmationModal.root.waitFor({ state: 'visible' });
    return this.orderConfirmationModal;
  }

  async readLines(): Promise<BasketLineSnapshot[]> {
    const roots = await this.lineItems.all();
    const snapshots = await Promise.all(roots.map((root) => new BasketLine(root).read()));
    return snapshots.sort((a, b) => a.name.localeCompare(b.name));
  }
}
