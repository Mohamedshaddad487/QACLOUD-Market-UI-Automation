import { test as base, expect } from './basket';
import type { ProductInput } from '../data/product-builder';

export type CreatedOrder = {
  orderNumber: string;
  product: ProductInput;
};

type OrderFixtures = {
  createdOrder: CreatedOrder;
};

export const test = base.extend<OrderFixtures>({
  createdOrder: async ({ marketPage, ownedProducts, emptyBasket }, use, testInfo) => {
    void emptyBasket;

    const label = testInfo.title.slice(0, 10).replace(/[^A-Za-z0-9]/g, '').toLowerCase() || 'ord';
    let orderNumber = '';
    let product: ProductInput;
    try {
      product = await ownedProducts.create({ label });
      await marketPage.productsPanel.addToBasket(product.name);
      await marketPage.openBasketTab();
      const confirmation = await marketPage.basketPanel.placeOrder();
      orderNumber = ((await confirmation.orderNumber.textContent()) ?? '').trim();
      await confirmation.continueShopping();
    } catch (error) {
      const orphan = orderNumber ? ` Order ${orderNumber} was created and must be removed manually.` : '';
      throw new Error(`[createdOrder setup failed] Could not place an order through the Checkout UI.${orphan} ${(error as Error).message}`, {
        cause: error,
      });
    }
    if (!/^O\d+$/.test(orderNumber)) {
      throw new Error(
        `[createdOrder setup failed] The confirmation showed an unreadable order number ("${orderNumber}"). ` +
          'An order may have been created; check the Orders tab and remove it manually.',
      );
    }

    await use({ orderNumber, product });

    try {
      await marketPage.goto();
      await marketPage.productsPanel.waitForCatalogLoaded();
      await marketPage.openOrdersTab();
      await marketPage.ordersPanel.ensureOrderAbsent(orderNumber);
    } catch (error) {
      throw new Error(
        `[createdOrder cleanup FAILED] Could not guarantee removal of order ${orderNumber}. ` +
          `Remove it manually through the Orders tab. Cause: ${(error as Error).message}`,
        { cause: error },
      );
    }
  },
});

export { expect };
