import type { Locator } from '@playwright/test';
import { QuantityStepper } from './QuantityStepper';

export class ProductCard {
  readonly root: Locator;
  readonly categoryEmoji: Locator;
  readonly viewDetailsButton: Locator;
  readonly editButton: Locator;
  readonly deleteButton: Locator;
  readonly nameHeading: Locator;
  readonly categoryText: Locator;
  readonly metaChips: Locator;
  readonly price: Locator;
  readonly stockText: Locator;
  readonly addButton: Locator;
  readonly outOfStockButton: Locator;
  readonly stepper: QuantityStepper;

  constructor(root: Locator) {
    this.root = root;
    this.categoryEmoji = root.locator('.card-art > span').first();
    this.viewDetailsButton = root.getByRole('button', { name: '👁️' });
    this.editButton = root.getByRole('button', { name: '✏️' });
    this.deleteButton = root.getByRole('button', { name: '🗑️' });
    this.nameHeading = root.getByRole('heading', { level: 3 });
    this.categoryText = root.locator('.category');
    this.metaChips = root.locator('.meta-chip');
    this.price = root.locator('.price');
    this.stockText = root.locator('.stock');
    this.addButton = root.getByRole('button', { name: 'ADD' });
    this.outOfStockButton = root.getByRole('button', { name: 'Out of Stock', exact: true });
    this.stepper = new QuantityStepper(root.locator('.quantity-control'));
  }

  async readStock(): Promise<number> {
    const text = ((await this.stockText.textContent()) ?? '').trim();
    const match = text.match(/\d+/);
    if (!match) throw new Error(`Could not find a stock count in "${text}".`);
    return Number(match[0]);
  }
}
