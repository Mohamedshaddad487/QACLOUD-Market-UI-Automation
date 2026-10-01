import { test, expect } from '../../src/fixtures/basket';
import { isBasketWrite, recordRequests } from '../../src/support/basket-requests';

test.describe('Shopping Basket — Stock change', () => {
  test('BSK-021 — when stock falls below the basket quantity, the basket keeps the higher quantity and refuses "−" with an alert', async ({
    marketPage,
    ownedProducts,
  }) => {
    const panel = marketPage.productsPanel;
    const basket = marketPage.basketPanel;
    const product = await ownedProducts.create({ label: 'bsk021', price: '2.50', stock: '3' });

    await panel.addToBasket(product.name);
    await marketPage.openBasketTab();
    const line = basket.line(product.name);
    await line.increment();
    await expect(line.stepper.quantity).toHaveText('2');
    await line.increment();
    await expect(line.stepper.quantity).toHaveText('3');

    await marketPage.openProductsTab();
    const form = await panel.openEditProduct(product.name);
    await expect(form.nameField).toHaveValue(product.name);
    await form.fillStock('1');
    await panel.saveAndAwaitCatalog();

    await marketPage.openBasketTab();
    await expect(line.stockText).toHaveText('Stock: 1 available');
    await expect(line.stepper.quantity).toHaveText('3');
    await expect(line.subtotal).toHaveText('Subtotal: $7.50');
    await expect(line.stepper.incrementButton).toBeDisabled();
    await expect(basket.orderSummary.placeOrderButton).toBeVisible();
    await expect(basket.orderSummary.placeOrderButton).toBeEnabled();

    const stopRecording = recordRequests(marketPage.page, isBasketWrite);
    await line.stepper.decrementButton.click();

    await expect(marketPage.alertBanner).toBeVisible();
    await expect(marketPage.alertBanner).toHaveText('Cannot add more than 1 units (only 1 in stock)');
    await expect(line.stepper.quantity).toHaveText('3');

    await basket.refresh();
    expect(stopRecording(), 'the over-stock "−" must not send a basket update').toEqual([]);
    await expect(line.stepper.quantity).toHaveText('3');

    await line.remove();
    await expect(line.root).toHaveCount(0);
    await expect(basket.emptyState).toBeVisible();
  });
});
