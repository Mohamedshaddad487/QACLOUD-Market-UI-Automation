import { test, expect } from '../../src/fixtures/orders';

test.describe('Orders Management — Visibility of new orders', () => {
  test('ORD-004 — a newly created order is visible in the list immediately, identified by its Checkout-issued order number', async ({
    marketPage,
    createdOrder,
  }) => {
    await marketPage.openOrdersTab();

    const row = marketPage.ordersPanel.order(createdOrder.orderNumber);
    await expect(row.root).toHaveCount(1);
    await expect(row.orderNumber).toHaveText(createdOrder.orderNumber);
    expect(await row.readItems()).toEqual([
      { label: `${createdOrder.product.name} × 1`, amount: `$${createdOrder.product.price}` },
    ]);
  });
});
