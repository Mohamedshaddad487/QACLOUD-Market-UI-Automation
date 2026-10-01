import type { Locator } from '@playwright/test';
import { QuantityStepper } from './QuantityStepper';
import { awaitRequestFrom, isBasketLineRemoval, isBasketQuantityUpdate } from '../support/basket-requests';

export type BasketLineSnapshot = {
  name: string;
  quantity: number;
  subtotal: string;
};

export class BasketLine {
  readonly root: Locator;
  readonly nameHeading: Locator;
  readonly unitPrice: Locator;
  readonly stockText: Locator;
  readonly subtotal: Locator;
  readonly removeButton: Locator;
  readonly stepper: QuantityStepper;

  constructor(root: Locator) {
    this.root = root;
    this.nameHeading = root.getByRole('heading', { level: 3 });
    this.unitPrice = root.getByText(/ each$/);
    this.stockText = root.getByText(/^Stock: \d+ available$/);
    this.subtotal = root.getByText(/^Subtotal: /);
    this.removeButton = root.getByRole('button', { name: 'Remove', exact: true });
    this.stepper = new QuantityStepper(root.locator('.quantity-control'));
  }

  async increment(): Promise<void> {
    await awaitRequestFrom(this.root.page(), isBasketQuantityUpdate, () => this.stepper.incrementButton.click());
  }

  async decrement(): Promise<void> {
    await awaitRequestFrom(
      this.root.page(),
      (request) => isBasketQuantityUpdate(request) || isBasketLineRemoval(request),
      () => this.stepper.decrementButton.click(),
    );
  }

  async remove(): Promise<void> {
    await awaitRequestFrom(this.root.page(), isBasketLineRemoval, () => this.removeButton.click());
  }

  async read(): Promise<BasketLineSnapshot> {
    const [name, subtotal, quantity] = await Promise.all([
      this.nameHeading.textContent(),
      this.subtotal.textContent(),
      this.stepper.readQuantity(),
    ]);
    return { name: (name ?? '').trim(), quantity, subtotal: (subtotal ?? '').trim() };
  }
}
