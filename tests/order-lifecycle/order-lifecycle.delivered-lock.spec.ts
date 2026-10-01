import { test, expect } from '../../src/fixtures/index';

const SEED_DELIVERED_ORDER = 'O62676';

test.describe('Order Lifecycle — Terminal-state lock', () => {
  test("LIF-003 — a Delivered order's Status control is locked", async ({ marketPage }) => {
    await marketPage.openOrdersTab();
    const seed = marketPage.ordersPanel.order(SEED_DELIVERED_ORDER);
    await expect(seed.root, `precondition: the read-only seed order ${SEED_DELIVERED_ORDER} must exist`).toHaveCount(1);
    await expect(seed.status, `precondition: ${SEED_DELIVERED_ORDER} must be Delivered`).toHaveText('delivered');

    await seed.expand();

    await expect(seed.statusSelect).toHaveValue('delivered');
    await expect(seed.statusSelect).toBeDisabled();

    await seed.collapse();
    await expect(seed.details).toBeHidden();
  });
});
