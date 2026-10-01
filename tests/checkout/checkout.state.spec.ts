import { test, expect } from '../../src/fixtures/basket';

test.describe('Checkout / Order Creation — State effects', () => {
  test('CHK-004 — placing an order empties the basket', async ({ marketPage, ownedProducts }) => {
    const product = await ownedProducts.create({ label: 'chk004' });
    await marketPage.productsPanel.addToBasket(product.name);
    await marketPage.openBasketTab();

    const confirmation = await marketPage.basketPanel.placeOrder();
    const orderNumber = ((await confirmation.orderNumber.textContent()) ?? '').trim();
    await confirmation.continueShopping();

    await marketPage.openBasketTab();
    await expect(marketPage.basketPanel.emptyState).toBeVisible();
    await expect(marketPage.basketPanel.lineItems).toHaveCount(0);
    await expect(marketPage.header.basketCount).toHaveText('0');
    await expect(marketPage.statsBar.basketUnits).toHaveText('0');

    await marketPage.openOrdersTab();
    await marketPage.ordersPanel.deleteOrder(orderNumber, 'accept');
  });

  test("CHK-005 — placing an order decrements the ordered product's stock", async ({ marketPage, ownedProducts }) => {
    const product = await ownedProducts.create({ label: 'chk005', stock: '5' });
    const panel = marketPage.productsPanel;
    const stockBefore = await panel.cardByName(product.name).readStock();
    expect(stockBefore).toBe(5);

    await panel.addToBasket(product.name);
    await marketPage.openBasketTab();
    const confirmation = await marketPage.basketPanel.placeOrder();
    const orderNumber = ((await confirmation.orderNumber.textContent()) ?? '').trim();
    await confirmation.continueShopping();

    const stockAfter = await panel.cardByName(product.name).readStock();
    expect(stockAfter, 'stock decreases by exactly the ordered quantity (1)').toBe(stockBefore - 1);

    await marketPage.openOrdersTab();
    await marketPage.ordersPanel.deleteOrder(orderNumber, 'accept');
  });

  test('CHK-006 — the newly created order is immediately visible in Orders Management', async ({
    marketPage,
    ownedProducts,
  }) => {
    const product = await ownedProducts.create({ label: 'chk006' });
    await marketPage.productsPanel.addToBasket(product.name);
    await marketPage.openBasketTab();

    const confirmation = await marketPage.basketPanel.placeOrder();
    const orderNumber = ((await confirmation.orderNumber.textContent()) ?? '').trim();

    await confirmation.viewOrders();
    await expect(marketPage.ordersPanel.heading).toBeVisible();
    await expect(marketPage.ordersPanel.order(orderNumber).orderNumber).toHaveText(orderNumber);

    await marketPage.ordersPanel.deleteOrder(orderNumber, 'accept');
  });
});
