import type { Locator, Page } from '@playwright/test';
import { ProductsPanel } from '../panels/ProductsPanel';
import { BasketPanel } from '../panels/BasketPanel';
import { OrdersPanel } from '../panels/OrdersPanel';
import { StatsBar } from '../components/StatsBar';
import { AppHeader } from '../components/AppHeader';
import { awaitRequestFrom, isBasketRead } from '../support/basket-requests';
import { isOrdersRead } from '../support/order-requests';

export class MarketPage {
  readonly page: Page;
  readonly header: AppHeader;
  readonly statsBar: StatsBar;
  readonly productsPanel: ProductsPanel;
  readonly basketPanel: BasketPanel;
  readonly ordersPanel: OrdersPanel;
  readonly alertBanner: Locator;
  private readonly productsTabButton: Locator;
  private readonly basketTabButton: Locator;
  private readonly ordersTabButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.header = new AppHeader(page);
    this.statsBar = new StatsBar(page);
    this.productsPanel = new ProductsPanel(page);
    this.basketPanel = new BasketPanel(page);
    this.ordersPanel = new OrdersPanel(page);
    this.productsTabButton = page.getByRole('button', { name: '🛍️ Products', exact: true });
    this.basketTabButton = page.getByRole('button', { name: '🛒 Basket', exact: true });
    this.ordersTabButton = page.getByRole('button', { name: '📦 Orders', exact: true });
    this.alertBanner = page.locator('#alert');
  }

  async goto(): Promise<void> {
    await this.page.goto('/market.html', { waitUntil: 'domcontentloaded' });
  }

  async openBasketTab(): Promise<void> {
    await awaitRequestFrom(this.page, isBasketRead, () => this.basketTabButton.click());
    await this.basketPanel.root.waitFor({ state: 'visible' });
  }

  async openProductsTab(): Promise<void> {
    await this.productsPanel.applyAndAwaitCatalog(() => this.productsTabButton.click());
  }

  async openOrdersTab(): Promise<void> {
    await awaitRequestFrom(this.page, isOrdersRead, () => this.ordersTabButton.click());
    await this.ordersPanel.root.waitFor({ state: 'visible' });
  }
}
