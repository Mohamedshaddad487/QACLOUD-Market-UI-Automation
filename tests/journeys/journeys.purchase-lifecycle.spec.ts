import { test, expect } from '../../src/fixtures/basket';

test.describe('Cross-Feature Business Journeys — Purchase lifecycle', () => {
  test('JRN-001 — Full purchase lifecycle: Catalog → Product → Basket → Checkout → Order → Orders', async ({
    marketPage,
    ownedProducts,
  }, testInfo) => {
    const productsPanel = marketPage.productsPanel;
    const basketPanel = marketPage.basketPanel;
    const ordersPanel = marketPage.ordersPanel;

    const product = await ownedProducts.create({ label: 'jrn001', price: '2.75', stock: '5' });
    const expectedAmount = `$${product.price}`;
    expect(await productsPanel.cardByName(product.name).readStock(), 'initial stock').toBe(5);

    await productsPanel.addToBasket(product.name);

    await marketPage.openBasketTab();
    expect(await basketPanel.readLines(), 'the basket holds exactly this product, quantity 1').toEqual([
      expect.objectContaining({ name: product.name, quantity: 1 }),
    ]);
    await expect(basketPanel.orderSummary.total, 'the order total is the product price').toHaveText(expectedAmount);

    const confirmation = await basketPanel.placeOrder();
    const orderNumber = ((await confirmation.orderNumber.textContent()) ?? '').trim();
    testInfo.annotations.push({
      type: 'created-order',
      description: `${orderNumber} — deleted at the end of this test; if the test failed before that, remove it manually through the Orders tab.`,
    });
    await expect(confirmation.heading).toBeVisible();
    expect(orderNumber, 'a real, well-formed order number').toMatch(/^O\d+$/);

    await confirmation.viewOrders();
    const order = ordersPanel.order(orderNumber);
    await expect(order.orderNumber, 'the order is listed under the same order number').toHaveText(orderNumber);
    expect(await order.readItems(), 'the order holds exactly this product, quantity 1, at its price').toEqual([
      { label: `${product.name} × 1`, amount: expectedAmount },
    ]);

    await marketPage.openBasketTab();
    await expect(basketPanel.emptyState).toBeVisible();
    await expect(basketPanel.lineItems).toHaveCount(0);

    await marketPage.openProductsTab();
    expect(await productsPanel.cardByName(product.name).readStock(), 'stock after ordering 1').toBe(4);

    await marketPage.openOrdersTab();
    await ordersPanel.deleteOrder(orderNumber, 'accept');
  });
});
