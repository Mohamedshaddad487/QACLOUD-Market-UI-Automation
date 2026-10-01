import { test, expect } from '../../src/fixtures/basket';

test.describe('Shopping Basket — Persistence', () => {
  test('BSK-009 — basket contents survive navigating to Orders and Products and back', async ({
    marketPage,
    ownedProducts,
  }) => {
    const product = await ownedProducts.create({ label: 'bsk009' });
    await marketPage.productsPanel.addToBasket(product.name);
    await marketPage.openBasketTab();
    const line = marketPage.basketPanel.line(product.name);
    await line.increment();
    await expect(line.stepper.quantity).toHaveText('2');
    const before = await marketPage.basketPanel.readLines();

    await marketPage.openOrdersTab();
    await marketPage.openProductsTab();
    await marketPage.openBasketTab();

    expect(await marketPage.basketPanel.readLines()).toEqual(before);
  });

  test('BSK-017 — basket lines, quantities and subtotals survive a full page reload', async ({
    marketPage,
    ownedProducts,
  }) => {
    const productA = await ownedProducts.create({ label: 'bsk017a' });
    const productB = await ownedProducts.create({ label: 'bsk017b' });
    await marketPage.productsPanel.addToBasket(productA.name);
    await marketPage.productsPanel.addToBasket(productB.name);
    await marketPage.openBasketTab();
    const lineA = marketPage.basketPanel.line(productA.name);
    await lineA.increment();
    await expect(lineA.stepper.quantity).toHaveText('2');
    const before = await marketPage.basketPanel.readLines();
    expect(before).toHaveLength(2);

    await marketPage.goto();
    await marketPage.productsPanel.waitForCatalogLoaded();
    await marketPage.openBasketTab();

    expect(await marketPage.basketPanel.readLines()).toEqual(before);
  });

  test('BSK-018 — a second browser session of the same account sees and changes the same basket', async ({
    marketPage,
    ownedProducts,
    secondSessionMarket,
  }) => {
    const product = await ownedProducts.create({ label: 'bsk018' });

    await marketPage.productsPanel.addToBasket(product.name);

    await secondSessionMarket.goto();
    await secondSessionMarket.productsPanel.waitForCatalogLoaded();
    await secondSessionMarket.openBasketTab();
    const lineInSession2 = secondSessionMarket.basketPanel.line(product.name);
    await expect(lineInSession2.stepper.quantity).toHaveText('1');

    await lineInSession2.increment();
    await expect(lineInSession2.stepper.quantity).toHaveText('2');

    await marketPage.openBasketTab();
    await marketPage.basketPanel.refresh();
    await expect(marketPage.basketPanel.line(product.name).stepper.quantity).toHaveText('2');
  });

  test('BSK-020 — a product added from Products is listed when an already-rendered Basket tab is reopened', async ({
    marketPage,
    ownedProducts,
  }) => {
    const basket = marketPage.basketPanel;
    const product = await ownedProducts.create({ label: 'bsk020' });

    await marketPage.openBasketTab();
    await expect(basket.emptyState).toBeVisible();
    await marketPage.openProductsTab();

    await marketPage.productsPanel.addToBasket(product.name);

    await marketPage.openBasketTab();
    await expect(basket.line(product.name).stepper.quantity).toHaveText('1');

    await basket.refresh();
    await expect(basket.line(product.name).stepper.quantity).toHaveText('1');
  });
});
