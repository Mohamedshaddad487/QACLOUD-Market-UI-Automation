import type { Locator } from '@playwright/test';

export class QuantityStepper {
  readonly root: Locator;
  readonly decrementButton: Locator;
  readonly incrementButton: Locator;
  readonly quantity: Locator;

  constructor(root: Locator) {
    this.root = root;
    this.decrementButton = root.getByRole('button', { name: '-', exact: true });
    this.incrementButton = root.getByRole('button', { name: '+', exact: true });
    this.quantity = root.locator('span');
  }

  async readQuantity(): Promise<number> {
    const text = ((await this.quantity.textContent()) ?? '').trim();
    const value = Number(text);
    if (!Number.isInteger(value)) throw new Error(`Stepper quantity is not an integer: "${text}"`);
    return value;
  }
}
