import { test, expect } from '../../src/fixtures/basket';
import { MarketPage } from '../../src/pages/MarketPage';
import { PortalPage } from '../../src/pages/PortalPage';
import { ProfilePage } from '../../src/pages/ProfilePage';
import { getCredentials } from '../../src/support/env';

test.use({ screenshot: 'off', video: 'off', trace: 'off' });

test.describe('Shopping Basket — Persistence across authentication', () => {
  test('BSK-010 / JRN-002 — basket contents persist across logout and login', async ({
    ownedProducts,
    disposableSessionPage,
  }) => {
    const product = await ownedProducts.create({ label: 'bsk010' });

    const market = new MarketPage(disposableSessionPage);
    await market.goto();
    await market.productsPanel.waitForCatalogLoaded();
    await market.productsPanel.addToBasket(product.name);
    await market.openBasketTab();
    const before = await market.basketPanel.readLines();
    expect(before.map((line) => [line.name, line.quantity])).toEqual([[product.name, 1]]);

    const profile = new ProfilePage(disposableSessionPage);
    await profile.goto();
    await profile.logout();
    await expect(disposableSessionPage).toHaveURL(/\/$/);

    const { identifier, password } = getCredentials();
    const portal = new PortalPage(disposableSessionPage);
    await portal.header.openLoginRegister();
    await portal.loginModal.switchToLoginTab();
    await portal.loginModal.login(identifier, password);
    await disposableSessionPage.waitForURL(/\/profile\.html$/, { timeout: 15_000 });

    await market.goto();
    await market.productsPanel.waitForCatalogLoaded();
    await market.openBasketTab();
    expect(await market.basketPanel.readLines()).toEqual(before);
  });
});
