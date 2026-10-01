import { test, expect } from '../../src/fixtures/basket';

test.describe('Shopping Basket — Totals', () => {
  test('BSK-008 — line subtotals and the Order Summary reflect the basket contents exactly', async ({
    marketPage,
    ownedProducts,
  }) => {
    const rounding = await ownedProducts.create({ label: 'bsk008a', price: '1.15', stock: '7' });
    const plain = await ownedProducts.create({ label: 'bsk008b', price: '4.25', stock: '7' });
    await marketPage.productsPanel.addToBasket(rounding.name);
    await marketPage.productsPanel.addToBasket(plain.name);
    await marketPage.openBasketTab();

    const roundingLine = marketPage.basketPanel.line(rounding.name);
    await roundingLine.increment();
    await expect(roundingLine.stepper.quantity).toHaveText('2');
    await roundingLine.increment();
    await expect(roundingLine.stepper.quantity).toHaveText('3');

    const plainLine = marketPage.basketPanel.line(plain.name);
    const summary = marketPage.basketPanel.orderSummary;

    await expect(roundingLine.unitPrice).toHaveText('$1.15 each');
    await expect(roundingLine.subtotal).toHaveText('Subtotal: $3.45');
    await expect(plainLine.unitPrice).toHaveText('$4.25 each');
    await expect(plainLine.subtotal).toHaveText('Subtotal: $4.25');
    await expect(summary.itemCount).toHaveText('2 items');
    await expect(summary.total).toHaveText('$7.70');
  });
});
