import type { Locator, Page } from '@playwright/test';

export class StatsBar {
  readonly productsCount: Locator;
  readonly basketUnits: Locator;
  readonly ordersCount: Locator;
  readonly inventoryValue: Locator;

  constructor(page: Page) {
    this.productsCount = page.locator('#totalProductsStat');
    this.basketUnits = page.locator('#basketItemsStat');
    this.ordersCount = page.locator('#ordersStat');
    this.inventoryValue = page.locator('#inventoryValueStat');
  }
}
