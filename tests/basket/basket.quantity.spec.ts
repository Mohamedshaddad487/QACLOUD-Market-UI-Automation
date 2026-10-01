import { test, expect } from '../../src/fixtures/basket';

test.describe('Shopping Basket — Quantity', () => {
  test('BSK-004 — the Basket-tab "+" increases a line quantity and its totals by one unit', async ({
    marketPage,
    ownedProducts,
  }) => {
    const product = await ownedProducts.create({ label: 'bsk004', price: '4.25', stock: '7' });
    await marketPage.productsPanel.addToBasket(product.name);
    await marketPage.openBasketTab();
    const line = marketPage.basketPanel.line(product.name);
    await expect(line.stepper.quantity).toHaveText('1');

    await line.increment();

    await expect(line.stepper.quantity).toHaveText('2');
    await expect(line.subtotal).toHaveText('Subtotal: $8.50');
    await expect(marketPage.basketPanel.orderSummary.total).toHaveText('$8.50');
    await expect(marketPage.statsBar.basketUnits).toHaveText('2');
    await expect(marketPage.header.basketCount).toHaveText('1');
  });

  test('BSK-005 — the Basket-tab "−" decreases a line quantity by one and keeps the line', async ({
    marketPage,
    ownedProducts,
  }) => {
    const product = await ownedProducts.create({ label: 'bsk005', price: '4.25', stock: '7' });
    await marketPage.productsPanel.addToBasket(product.name);
    await marketPage.openBasketTab();
    const line = marketPage.basketPanel.line(product.name);
    await line.increment();
    await expect(line.stepper.quantity).toHaveText('2');

    await line.decrement();

    await expect(line.stepper.quantity).toHaveText('1');
    await expect(line.root).toBeVisible();
    await expect(line.subtotal).toHaveText('Subtotal: $4.25');
    await expect(marketPage.basketPanel.orderSummary.total).toHaveText('$4.25');
  });

  test('BSK-014 — a basket quantity cannot be increased beyond the available stock', async ({
    marketPage,
    ownedProducts,
  }) => {
    const product = await ownedProducts.create({ label: 'bsk014', stock: '3' });
    await marketPage.productsPanel.addToBasket(product.name);
    await marketPage.openBasketTab();
    const line = marketPage.basketPanel.line(product.name);

    await line.increment();
    await expect(line.stepper.quantity).toHaveText('2');
    await line.increment();

    await expect(line.stepper.quantity).toHaveText('3');
    await expect(line.stockText).toHaveText('Stock: 3 available');
    await expect(line.stepper.incrementButton).toBeDisabled();
    await expect(line.stepper.decrementButton).toBeEnabled();

    await marketPage.goto();
    await marketPage.productsPanel.waitForCatalogLoaded();
    const card = marketPage.productsPanel.cardByName(product.name);
    await expect(card.stepper.quantity).toHaveText('3');
    await expect(card.stepper.incrementButton).toBeDisabled();
  });

  test('BSK-015 — "−" at quantity 1 removes the line without confirmation and restores "ADD"', async ({
    marketPage,
    ownedProducts,
  }) => {
    const product = await ownedProducts.create({ label: 'bsk015' });
    await marketPage.productsPanel.addToBasket(product.name);
    await marketPage.openBasketTab();
    const line = marketPage.basketPanel.line(product.name);
    await expect(line.stepper.quantity).toHaveText('1');
    await expect(marketPage.header.basketCount).toHaveText('1');

    await line.decrement();

    await expect(marketPage.alertBanner).toBeVisible();
    await expect(marketPage.alertBanner).toHaveText('Item removed from basket');
    await expect(line.root).toHaveCount(0);
    await expect(marketPage.header.basketCount).toHaveText('0');

    await marketPage.openProductsTab();
    const card = marketPage.productsPanel.cardByName(product.name);
    await expect(card.root).toBeVisible();
    await expect(card.addButton).toBeVisible();
  });

  test('BSK-019 — two Products-card "+" clicks, each allowed to complete, raise the basket quantity by two', async ({
    marketPage,
    ownedProducts,
  }) => {
    const panel = marketPage.productsPanel;
    const product = await ownedProducts.create({ label: 'bsk019', stock: '7' });
    await panel.addToBasket(product.name);
    await expect(panel.cardByName(product.name).stepper.quantity).toHaveText('1');

    await panel.incrementInBasketFromCard(product.name);
    await panel.incrementInBasketFromCard(product.name);

    await marketPage.openBasketTab();
    await expect(marketPage.basketPanel.line(product.name).stepper.quantity).toHaveText('3');
    await expect(marketPage.statsBar.basketUnits).toHaveText('3');
  });
});
