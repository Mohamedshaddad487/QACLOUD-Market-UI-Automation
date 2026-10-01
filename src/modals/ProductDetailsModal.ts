import type { Locator, Page } from '@playwright/test';

export class ProductDetailsModal {
  readonly page: Page;
  readonly root: Locator;
  readonly heading: Locator;
  readonly closeXButton: Locator;
  readonly closeButton: Locator;
  readonly specificationsHeading: Locator;
  readonly specificationRows: Locator;
  readonly productId: Locator;

  constructor(page: Page) {
    this.page = page;
    this.root = page.locator('#itemDetailsModal');
    this.heading = this.root.locator('#itemDetailsTitle');
    this.closeXButton = this.root.getByRole('button', { name: '×' });
    this.closeButton = this.root.getByRole('button', { name: 'Close', exact: true });
    this.specificationsHeading = this.root.getByRole('heading', { name: 'Specifications', level: 4 });
    this.specificationRows = this.specificationsHeading.locator('xpath=following-sibling::div[1]/div');
    this.productId = this.fieldValue('Product ID');
  }

  private fieldValue(label: string): Locator {
    return this.root.getByText(label, { exact: true }).locator('xpath=following-sibling::div[1]');
  }

  get category(): Locator {
    return this.fieldValue('Category');
  }

  get price(): Locator {
    return this.fieldValue('Price');
  }

  get stockStatus(): Locator {
    return this.fieldValue('Stock Status');
  }

  get availableUnits(): Locator {
    return this.fieldValue('Available Units');
  }

  async close(via: 'x' | 'close-button'): Promise<void> {
    const button = via === 'x' ? this.closeXButton : this.closeButton;
    await button.click();
  }

  async getSpecifications(): Promise<Array<{ key: string; value: string }>> {
    const rows = await this.specificationRows.all();
    const entries = await Promise.all(
      rows.map(async (row) => {
        const cells = row.locator('> div');
        const [key, value] = await cells.allTextContents();
        return { key: (key ?? '').trim(), value: (value ?? '').trim() };
      }),
    );
    return entries;
  }
}
