import { test, expect } from '../../src/fixtures/index';

const SEED_ORDER = 'O62676';

function toCents(amount: string): number {
  const match = amount.match(/^\$(\d+)\.(\d{2})$/);
  if (!match) throw new Error(`Not a displayed amount: "${amount}"`);
  return Number(match[1]) * 100 + Number(match[2]);
}

test.describe('Orders Management — Order list and details', () => {
  test('ORD-001 — the "My Orders" list displays existing orders as collapsible rows', async ({ marketPage }) => {
    const panel = marketPage.ordersPanel;
    await marketPage.openOrdersTab();

    const seed = panel.order(SEED_ORDER);
    await expect(seed.root, `precondition: the read-only seed order ${SEED_ORDER} must exist`).toHaveCount(1);
    await expect(panel.heading).toBeVisible();
    await expect(seed.details).toBeHidden();
    await expect(seed.chevron).toHaveText('▼');

    const rowCount = await panel.orderRows.count();
    expect(rowCount).toBeGreaterThanOrEqual(1);
    await expect(marketPage.statsBar.ordersCount).toHaveText(String(rowCount));
  });

  test('ORD-002 — expanding an order row reveals its items, status, and Delete control', async ({ marketPage }) => {
    await marketPage.openOrdersTab();
    const seed = marketPage.ordersPanel.order(SEED_ORDER);
    await expect(seed.root, `precondition: the read-only seed order ${SEED_ORDER} must exist`).toHaveCount(1);

    await seed.expand();

    await expect(seed.details).toBeVisible();
    await expect(seed.chevron).toHaveText('▲');
    await expect(seed.itemsLabel).toBeVisible();
    await expect(seed.items.first()).toBeVisible();
    for (const item of await seed.readItems()) {
      expect(item.label, 'each item shows a product and its quantity').toMatch(/^.+ × \d+$/);
      expect(item.amount, 'each item shows its amount').toMatch(/^\$\d+\.\d{2}$/);
    }
    const badge = ((await seed.status.textContent()) ?? '').trim();
    await expect(seed.statusSelect).toBeVisible();
    await expect(seed.statusSelect).toHaveValue(badge);
    await expect(seed.deleteButton).toBeVisible();

    await seed.collapse();
    await expect(seed.details).toBeHidden();
  });

  test('ORD-003 — order identifiers, items, and totals are readable and internally consistent', async ({
    marketPage,
  }) => {
    await marketPage.openOrdersTab();
    const seed = marketPage.ordersPanel.order(SEED_ORDER);
    await expect(seed.root, `precondition: the read-only seed order ${SEED_ORDER} must exist`).toHaveCount(1);

    await seed.expand();

    await expect(seed.orderNumber).toHaveText(/^O\d+$/);
    const items = await seed.readItems();
    expect(items.length, 'the item list is non-empty').toBeGreaterThan(0);
    const itemsTotal = items.reduce((sum, item) => sum + toCents(item.amount), 0);
    const total = ((await seed.total.textContent()) ?? '').trim();
    expect(itemsTotal, `items ${JSON.stringify(items)} must add up to the order total ${total}`).toBe(toCents(total));
  });
});
