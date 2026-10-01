import { test, expect } from '../../src/fixtures/basket';

test.describe('Shopping Basket — Empty state and adding', () => {
  test('BSK-001 — the Basket tab shows an empty state when no items are present', async ({ marketPage }) => {
    const basket = marketPage.basketPanel;

    await marketPage.openBasketTab();

    await expect(basket.emptyState).toBeVisible();
    await expect(basket.refreshButton).toBeVisible();
    await expect(basket.clearAllButton).toBeVisible();
    await expect(basket.lineItems).toHaveCount(0);
    await expect(marketPage.header.basketCount).toHaveText('0');
    await expect(basket.orderSummary.root).toHaveCount(0);
    await expect(basket.orderSummary.placeOrderButton).toHaveCount(0);
  });

  test('BSK-002 — adding a single product updates the header count and the Basket Units stat', async ({
    marketPage,
    ownedProducts,
  }) => {
    const panel = marketPage.productsPanel;
    const product = await ownedProducts.create({ label: 'bsk002' });
    const card = panel.cardByName(product.name);
    const stockTextBefore = ((await card.stockText.textContent()) ?? '').trim();

    await panel.addToBasket(product.name);

    await expect(marketPage.header.basketCount).toHaveText('1');
    await expect(marketPage.statsBar.basketUnits).toHaveText('1');
    await expect(card.addButton).toHaveCount(0);
    await expect(card.stepper.quantity).toHaveText('1');
    await expect(card.root).toBeVisible();
    await expect(marketPage.basketPanel.root).toBeHidden();
    await expect(card.stockText).toHaveText(stockTextBefore);
  });

  test('BSK-003 — adding two distinct products is reflected correctly in both header metrics', async ({
    marketPage,
    ownedProducts,
  }) => {
    const panel = marketPage.productsPanel;
    const productA = await ownedProducts.create({ label: 'bsk003a' });
    const productB = await ownedProducts.create({ label: 'bsk003b' });

    await panel.addToBasket(productA.name);
    await panel.addToBasket(productB.name);

    await expect(marketPage.header.basketCount).toHaveText('2');
    await expect(marketPage.statsBar.basketUnits).toHaveText('2');
  });

  test('BSK-016 — a product with zero stock offers no add-to-basket control', async ({ marketPage, ownedProducts }) => {
    const product = await ownedProducts.create({ label: 'bsk016', stock: '0' });
    const card = marketPage.productsPanel.cardByName(product.name);

    await expect(card.addButton).toHaveCount(0);
    await expect(card.outOfStockButton).toBeVisible();
    await expect(card.outOfStockButton).toBeDisabled();

    await marketPage.openBasketTab();
    await expect(marketPage.basketPanel.emptyState).toBeVisible();
    await expect(marketPage.basketPanel.line(product.name).root).toHaveCount(0);
  });
});
