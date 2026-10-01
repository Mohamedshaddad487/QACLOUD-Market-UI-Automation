import { test, expect } from '../../src/fixtures/basket';

test.describe('Checkout / Order Creation — Placing an order', () => {
  test('CHK-001 — placing an order from a non-empty basket succeeds', async ({ marketPage, ownedProducts }) => {
    const product = await ownedProducts.create({ label: 'chk001' });
    await marketPage.productsPanel.addToBasket(product.name);
    await marketPage.openBasketTab();

    const confirmation = await marketPage.basketPanel.placeOrder();
    await expect(confirmation.heading).toBeVisible();

    const orderNumber = ((await confirmation.orderNumber.textContent()) ?? '').trim();
    expect(orderNumber, 'a real, well-formed order number').toMatch(/^O\d+$/);

    await confirmation.viewOrders();
    await expect(marketPage.ordersPanel.order(orderNumber).root).toBeVisible();
    await marketPage.ordersPanel.deleteOrder(orderNumber, 'accept');
  });

  test('CHK-002 — the order confirmation modal displays the exact confirmed content', async ({
    marketPage,
    ownedProducts,
  }) => {
    const product = await ownedProducts.create({ label: 'chk002', price: '2.50', stock: '4' });
    await marketPage.productsPanel.addToBasket(product.name);
    await marketPage.openBasketTab();
    const expectedTotal = ((await marketPage.basketPanel.orderSummary.total.textContent()) ?? '').trim();

    const confirmation = await marketPage.basketPanel.placeOrder();

    await expect(confirmation.heading).toHaveText('✅ Order Placed Successfully!');
    const orderNumber = ((await confirmation.orderNumber.textContent()) ?? '').trim();
    expect(orderNumber).toMatch(/^O\d+$/);
    await expect(confirmation.totalAmount).toHaveText(expectedTotal);
    expect(await confirmation.readItems()).toEqual([{ label: `${product.name} × 1`, amount: expectedTotal }]);
    await expect(confirmation.viewOrdersButton).toBeVisible();
    await expect(confirmation.continueShoppingButton).toBeVisible();

    await confirmation.viewOrders();
    await marketPage.ordersPanel.deleteOrder(orderNumber, 'accept');
  });

  test('CHK-003 — no payment, address, or shipping step exists anywhere in the checkout flow', async ({
    marketPage,
    ownedProducts,
  }) => {
    const product = await ownedProducts.create({ label: 'chk003' });
    await marketPage.productsPanel.addToBasket(product.name);
    await marketPage.openBasketTab();
    const urlBeforePlaceOrder = marketPage.page.url();

    const confirmation = await marketPage.basketPanel.placeOrder();
    await expect(confirmation.heading).toBeVisible();

    expect(marketPage.page.url(), 'no navigation to a separate checkout step').toBe(urlBeforePlaceOrder);
    await expect(
      marketPage.page.getByText(/payment|shipping address|credit card|billing/i),
      'no payment/address/shipping UI is rendered anywhere on the page',
    ).toHaveCount(0);

    const orderNumber = ((await confirmation.orderNumber.textContent()) ?? '').trim();
    await confirmation.viewOrders();
    await marketPage.ordersPanel.deleteOrder(orderNumber, 'accept');
  });
});
