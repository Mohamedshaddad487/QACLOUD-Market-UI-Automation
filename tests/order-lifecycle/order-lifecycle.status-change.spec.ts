import { test, expect } from '../../src/fixtures/orders';

test.describe('Order Lifecycle — Status change', () => {
  test("LIF-001 — changing an order's status persists server-side immediately", async ({
    marketPage,
    createdOrder,
  }) => {
    const panel = marketPage.ordersPanel;
    await marketPage.openOrdersTab();
    const row = panel.order(createdOrder.orderNumber);
    await row.expand();
    await expect(row.statusSelect, 'precondition: a new order starts as pending').toHaveValue('pending');

    await panel.changeStatus(createdOrder.orderNumber, 'shipped');

    await marketPage.goto();
    await marketPage.productsPanel.waitForCatalogLoaded();
    await marketPage.openOrdersTab();
    const reloaded = panel.order(createdOrder.orderNumber);
    await expect(reloaded.status).toHaveText('shipped');
    await reloaded.expand();
    await expect(reloaded.statusSelect).toHaveValue('shipped');
  });

  test('LIF-002 — after a status change, the order row\'s badge shows the new status without "🔄 Refresh"', async ({
    marketPage,
    createdOrder,
  }) => {
    const panel = marketPage.ordersPanel;
    await marketPage.openOrdersTab();
    const row = panel.order(createdOrder.orderNumber);
    await row.expand();
    await expect(row.status, 'precondition: a new order starts as pending').toHaveText('pending');
    await expect(row.statusSelect, 'precondition: a new order starts as pending').toHaveValue('pending');

    await panel.changeStatus(createdOrder.orderNumber, 'processing');

    await expect(row.status, 'badge after the automatic re-read, with no Refresh').toHaveText('processing');
    await expect(marketPage.alertBanner).toHaveText('Order status updated to processing');
    await expect(marketPage.alertBanner).toHaveClass(/\bshow\b/);
    await row.expand();
    await expect(row.statusSelect).toHaveValue('processing');
  });
});
