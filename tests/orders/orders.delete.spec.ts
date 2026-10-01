import { test, expect } from '../../src/fixtures/orders';
import { recordRequests } from '../../src/support/basket-requests';
import { isOrderDelete } from '../../src/support/order-requests';

test.describe('Orders Management — Delete Order', () => {
  test('ORD-005 — deleting an order requires a custom in-page confirmation, distinct from native browser dialogs', async ({
    marketPage,
    createdOrder,
  }) => {
    const panel = marketPage.ordersPanel;
    await marketPage.openOrdersTab();

    const modal = await panel.openDeleteConfirmation(createdOrder.orderNumber);

    await expect(modal.root).toBeVisible();
    await expect(modal.heading).toBeVisible();
    await expect(modal.body).toBeVisible();
    await expect(modal.orderNumber).toHaveText(createdOrder.orderNumber);
    await expect(modal.deleteButton).toBeVisible();
    await expect(modal.cancelButton).toBeVisible();

    const stopRecording = recordRequests(marketPage.page, isOrderDelete);
    await modal.cancel();
    await panel.refresh();
    expect(stopRecording(), 'Cancel must not send a delete request').toEqual([]);
    await expect(panel.order(createdOrder.orderNumber).root).toHaveCount(1);
  });

  test('ORD-006 — confirming order deletion removes it and corrects the Orders header stat', async ({
    marketPage,
    createdOrder,
  }) => {
    const panel = marketPage.ordersPanel;
    await marketPage.openOrdersTab();
    const row = panel.order(createdOrder.orderNumber);
    await expect(row.root).toHaveCount(1);
    const countBefore = Number(((await marketPage.statsBar.ordersCount.textContent()) ?? '').trim());

    await panel.deleteOrder(createdOrder.orderNumber, 'accept');

    await expect(row.root).toHaveCount(0);
    await expect(marketPage.statsBar.ordersCount).toHaveText(String(countBefore - 1));
    await expect(panel.confirmDeleteModal.root).toBeHidden();
  });

  test('ORD-007 — order deletion persists across a full page reload', async ({ marketPage, createdOrder }) => {
    const panel = marketPage.ordersPanel;
    await marketPage.openOrdersTab();
    await panel.deleteOrder(createdOrder.orderNumber, 'accept');

    await marketPage.goto();
    await marketPage.productsPanel.waitForCatalogLoaded();
    await marketPage.openOrdersTab();

    await expect(panel.orderRows.first(), 'precondition: another order (the seed) exists').toBeVisible();
    await expect(panel.order(createdOrder.orderNumber).root).toHaveCount(0);
  });
});
