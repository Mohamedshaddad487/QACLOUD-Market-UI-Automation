import type { Dialog } from '@playwright/test';
import { test, expect } from '../../src/fixtures/basket';
import { isBasketClear, recordRequests } from '../../src/support/basket-requests';

test.describe('Shopping Basket — Remove and Clear All', () => {
  test('BSK-006 — "Remove" deletes a line without confirmation and keeps the product in the catalog', async ({
    marketPage,
    ownedProducts,
  }) => {
    const product = await ownedProducts.create({ label: 'bsk006' });
    await marketPage.productsPanel.addToBasket(product.name);
    await marketPage.openBasketTab();
    const line = marketPage.basketPanel.line(product.name);
    await expect(line.root).toBeVisible();
    await expect(marketPage.header.basketCount).toHaveText('1');

    const dialogs: string[] = [];
    const onDialog = (dialog: Dialog): void => {
      dialogs.push(dialog.message());
    };
    marketPage.page.on('dialog', onDialog);
    await line.remove();
    marketPage.page.off('dialog', onDialog);

    expect(dialogs, 'Remove must not request a confirmation').toEqual([]);
    await expect(marketPage.alertBanner).toBeVisible();
    await expect(marketPage.alertBanner).toHaveText('Item removed from basket');
    await expect(line.root).toHaveCount(0);
    await expect(marketPage.header.basketCount).toHaveText('0');

    await marketPage.openProductsTab();
    const card = marketPage.productsPanel.cardByName(product.name);
    await expect(card.root).toBeVisible();
    await expect(card.addButton).toBeVisible();
  });

  test('BSK-007 — Clear All leaves the basket unchanged when dismissed and empties it when accepted', async ({
    marketPage,
    ownedProducts,
  }) => {
    const basket = marketPage.basketPanel;
    const productA = await ownedProducts.create({ label: 'bsk007a' });
    const productB = await ownedProducts.create({ label: 'bsk007b' });
    await marketPage.productsPanel.addToBasket(productA.name);
    await marketPage.productsPanel.addToBasket(productB.name);
    await marketPage.openBasketTab();
    const before = await basket.readLines();
    expect(before.map((line) => line.name)).toEqual([productA.name, productB.name].sort((a, b) => a.localeCompare(b)));

    const stopRecording = recordRequests(marketPage.page, isBasketClear);
    const dismissed = await basket.clearAll('dismiss');
    await basket.refresh();
    expect(stopRecording(), 'a dismissed Clear All must not clear the basket').toEqual([]);
    expect(dismissed.message).toBe('Are you sure you want to clear your entire basket?');
    expect(dismissed.type).toBe('confirm');
    expect(await basket.readLines()).toEqual(before);

    await basket.refresh();
    const owned = new Set(ownedProducts.names());
    const linesNow = await basket.readLines();
    expect(
      linesNow.every((line) => owned.has(line.name)),
      'Clear All empties the whole account basket; it is only accepted when every line is this test\'s own',
    ).toBe(true);

    const accepted = await basket.clearAll('accept');

    expect(accepted.message).toBe('Are you sure you want to clear your entire basket?');
    await expect(marketPage.alertBanner).toBeVisible();
    await expect(marketPage.alertBanner).toHaveText('Basket cleared');
    await expect(basket.emptyState).toBeVisible();
    await expect(marketPage.header.basketCount).toHaveText('0');
    await expect(marketPage.statsBar.basketUnits).toHaveText('0');

    await basket.refresh();
    await expect(basket.emptyState).toBeVisible();
    await expect(basket.lineItems).toHaveCount(0);

    await marketPage.openProductsTab();
    await expect(marketPage.productsPanel.cardByName(productA.name).root).toBeVisible();
    await expect(marketPage.productsPanel.cardByName(productB.name).root).toBeVisible();
  });
});
