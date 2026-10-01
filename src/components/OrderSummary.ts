import type { Locator, Page } from '@playwright/test';

export class OrderSummary {
  readonly root: Locator;
  readonly heading: Locator;
  readonly itemCount: Locator;
  readonly total: Locator;
  readonly placeOrderButton: Locator;

  constructor(page: Page) {
    this.root = page.locator('#basketContent .basket-checkout-card');
    this.heading = this.root.getByRole('heading', { name: 'Order Summary', level: 3 });
    this.itemCount = this.root.getByText(/^\d+ items?$/);
    this.total = this.root.locator('.basket-checkout-total').getByText(/^\$\d+\.\d{2}$/);
    this.placeOrderButton = this.root.getByRole('button', { name: '📦 Place Order' });
  }
}
