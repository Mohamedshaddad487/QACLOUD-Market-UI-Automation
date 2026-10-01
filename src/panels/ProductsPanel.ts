import type { Locator, Page, Request } from '@playwright/test';
import { ProductCard } from '../components/ProductCard';
import { CategoryChips } from '../components/CategoryChips';
import { FilterBar } from '../components/FilterBar';
import { ProductDetailsModal } from '../modals/ProductDetailsModal';
import { ProductFormModal } from '../modals/ProductFormModal';
import { withNativeDialog } from '../support/dialogs';
import type { DialogDecision, HandledDialog } from '../support/dialogs';
import { awaitRequestFrom, isBasketAdd, isBasketQuantityUpdate } from '../support/basket-requests';

export function isCatalogRequest(request: Request): boolean {
  if (request.method() !== 'GET') return false;
  const { pathname } = new URL(request.url());
  return pathname === '/api/products' || pathname === '/api/products/filter';
}

export type RenderedProduct = {
  name: string;
  category: string;
  zone: string;
  type: string;
};

export class ProductsPanel {
  readonly page: Page;
  readonly filterBar: FilterBar;
  readonly categoryChips: CategoryChips;
  readonly detailsModal: ProductDetailsModal;
  readonly formModal: ProductFormModal;
  readonly addProductButton: Locator;
  private readonly grid: Locator;
  private readonly cards: Locator;
  readonly emptyState: Locator;

  constructor(page: Page) {
    this.page = page;
    this.filterBar = new FilterBar(page);
    this.categoryChips = new CategoryChips(page);
    this.detailsModal = new ProductDetailsModal(page);
    this.formModal = new ProductFormModal(page);
    this.addProductButton = page.getByRole('button', { name: '+ Add Product' });
    this.grid = page.locator('#productsGrid');
    this.cards = this.grid.locator('.card');
    this.emptyState = this.grid.getByText('No products found. Add your first product!');
  }

  card(nth: number): ProductCard {
    return new ProductCard(this.cards.nth(nth));
  }

  cardByName(name: string): ProductCard {
    return new ProductCard(this.cards.filter({ has: this.page.getByRole('heading', { level: 3, name }) }));
  }

  async hasProductNamed(name: string): Promise<boolean> {
    return (await this.cardByName(name).root.count()) > 0;
  }

  async waitForProductPresent(name: string): Promise<void> {
    await this.cardByName(name).root.waitFor({ state: 'attached' });
  }

  async waitForProductAbsent(name: string): Promise<void> {
    await this.cardByName(name).root.waitFor({ state: 'detached' });
  }

  async ensureProductAbsent(name: string): Promise<'already-absent' | 'deleted'> {
    if (!(await this.hasProductNamed(name))) return 'already-absent';

    await this.deleteProduct(name, 'accept');

    try {
      await this.waitForProductAbsent(name);
    } catch {
      throw new Error(
        `Product "${name}" is still present after an accepted delete. It is an orphan and must be removed manually.`,
      );
    }
    return 'deleted';
  }

  async addToBasket(name: string): Promise<void> {
    await awaitRequestFrom(this.page, isBasketAdd, () => this.cardByName(name).addButton.click());
  }

  async incrementInBasketFromCard(name: string): Promise<void> {
    await awaitRequestFrom(this.page, isBasketQuantityUpdate, () => this.cardByName(name).stepper.incrementButton.click());
  }

  async openAddProduct(): Promise<ProductFormModal> {
    await this.addProductButton.click();
    await this.formModal.waitForOpen();
    return this.formModal;
  }

  async openEditProduct(name: string): Promise<ProductFormModal> {
    await this.cardByName(name).editButton.click();
    await this.formModal.waitForOpen();
    return this.formModal;
  }

  async openDetailsByName(name: string): Promise<ProductDetailsModal> {
    await this.cardByName(name).viewDetailsButton.click();
    await this.detailsModal.root.waitFor({ state: 'visible' });
    return this.detailsModal;
  }

  async saveAndAwaitCatalog(): Promise<void> {
    await this.applyAndAwaitCatalog(() => this.formModal.clickSave());
    await this.formModal.root.waitFor({ state: 'hidden' });
  }

  async deleteProduct(name: string, decision: DialogDecision): Promise<HandledDialog> {
    const deleteButton = this.cardByName(name).deleteButton;

    if (decision === 'dismiss') {
      return withNativeDialog(this.page, 'dismiss', () => deleteButton.click());
    }

    let dialog: HandledDialog | undefined;
    await this.applyAndAwaitCatalog(async () => {
      dialog = await withNativeDialog(this.page, 'accept', () => deleteButton.click());
    });
    if (!dialog) throw new Error(`Delete of "${name}" did not surface a native confirmation dialog.`);
    return dialog;
  }

  async openDetails(nth: number): Promise<ProductDetailsModal> {
    await this.card(nth).viewDetailsButton.click();
    await this.detailsModal.root.waitFor({ state: 'visible' });
    return this.detailsModal;
  }

  async getRenderedCardCount(): Promise<number> {
    return this.cards.count();
  }

  async waitForCatalogLoaded(): Promise<void> {
    await this.cards.first().waitFor({ state: 'visible' });
    await this.page.waitForLoadState('networkidle');
  }

  async applyAndAwaitCatalog(action: () => Promise<void>): Promise<void> {
    let inFlight = 0;
    let signalIdle: () => void = () => {};
    const idle = new Promise<void>((resolve) => {
      signalIdle = resolve;
    });

    const onStarted = (request: Request): void => {
      if (isCatalogRequest(request)) inFlight += 1;
    };
    const onSettled = (request: Request): void => {
      if (!isCatalogRequest(request)) return;
      inFlight -= 1;
      if (inFlight === 0) signalIdle();
    };

    const firstRequest = this.page.waitForRequest(isCatalogRequest);
    this.page.on('request', onStarted);
    this.page.on('requestfinished', onSettled);
    this.page.on('requestfailed', onSettled);

    try {
      await action();
      await firstRequest;
      if (inFlight > 0) await idle;
    } finally {
      this.page.off('request', onStarted);
      this.page.off('requestfinished', onSettled);
      this.page.off('requestfailed', onSettled);
    }
  }

  async getShownCount(): Promise<number> {
    return this.filterBar.getShownCount();
  }

  async getRenderedProducts(): Promise<RenderedProduct[]> {
    const [names, categories, metaChips] = await Promise.all([
      this.cards.locator('h3').allTextContents(),
      this.cards.locator('.category').allTextContents(),
      this.cards.locator('.meta-chip').allTextContents(),
    ]);

    if (categories.length !== names.length || metaChips.length !== names.length * 2) {
      throw new Error(
        `Unexpected card structure: ${names.length} names, ${categories.length} categories, ` +
          `${metaChips.length} meta chips (expected exactly two chips per card).`,
      );
    }

    return names.map((name, index) => ({
      name: name.trim(),
      category: (categories[index] ?? '').trim(),
      zone: (metaChips[index * 2] ?? '').trim(),
      type: (metaChips[index * 2 + 1] ?? '').trim(),
    }));
  }
}
