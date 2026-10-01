import type { Locator, Page } from '@playwright/test';

export type ValidatedField = 'name' | 'category' | 'price' | 'stock';

export type FieldValidity = {
  valid: boolean;
  valueMissing: boolean;
  rangeUnderflow: boolean;
  message: string;
};

export class ProductFormModal {
  readonly page: Page;
  readonly root: Locator;
  readonly title: Locator;
  readonly nameField: Locator;
  readonly categorySelect: Locator;
  readonly priceField: Locator;
  readonly stockField: Locator;
  readonly detailsTable: Locator;
  readonly addDetailButton: Locator;
  readonly detailsEditor: Locator;
  readonly detailKeyField: Locator;
  readonly detailValueField: Locator;
  readonly detailOkButton: Locator;
  readonly detailCancelButton: Locator;
  readonly saveButton: Locator;
  readonly cancelButton: Locator;
  readonly closeXButton: Locator;

  private readonly hiddenProductId: Locator;

  constructor(page: Page) {
    this.page = page;
    this.root = page.locator('#productModal');
    this.title = this.root.locator('#productModalTitle');
    this.hiddenProductId = this.root.locator('#productId');
    this.nameField = this.root.locator('#productName');
    this.categorySelect = this.root.locator('#productCategory');
    this.priceField = this.root.locator('#productPrice');
    this.stockField = this.root.locator('#productStock');
    this.detailsTable = this.root.locator('#detailsTable');
    this.addDetailButton = this.root.getByRole('button', { name: '+ Add detail' });
    this.detailsEditor = this.root.locator('#detailsEditor');
    this.detailKeyField = this.root.locator('#detailKey');
    this.detailValueField = this.root.locator('#detailValue');
    this.detailOkButton = this.detailsEditor.getByRole('button', { name: 'OK', exact: true });
    this.detailCancelButton = this.detailsEditor.getByRole('button', { name: 'Cancel', exact: true });
    this.saveButton = this.root.getByRole('button', { name: 'Save Product' });
    this.cancelButton = this.root.locator('.form-actions').getByRole('button', { name: 'Cancel', exact: true });
    this.closeXButton = this.root.getByRole('button', { name: '×' });
  }

  async waitForOpen(): Promise<void> {
    await this.root.waitFor({ state: 'visible' });
  }

  async getBoundProductId(): Promise<string> {
    return this.hiddenProductId.inputValue();
  }

  async getCategoryOptionLabels(): Promise<string[]> {
    return this.categorySelect.locator('option').allTextContents();
  }

  async fillName(name: string): Promise<void> {
    await this.nameField.fill(name);
  }

  async selectCategory(formLabel: string): Promise<void> {
    await this.categorySelect.selectOption({ label: formLabel });
  }

  async fillPrice(price: string): Promise<void> {
    await this.priceField.fill(price);
  }

  async fillStock(stock: string): Promise<void> {
    await this.stockField.fill(stock);
  }

  async addDetail(key: string, value: string): Promise<void> {
    await this.addDetailButton.click();
    await this.detailsEditor.waitFor({ state: 'visible' });
    await this.detailKeyField.fill(key);
    await this.detailValueField.fill(value);
    await this.detailOkButton.click();
  }

  detailRow(key: string): Locator {
    return this.detailsTable.locator('tr').filter({ has: this.page.getByText(key, { exact: true }) });
  }

  async getValidity(field: ValidatedField): Promise<FieldValidity> {
    const locator = this.fieldLocator(field);
    return locator.evaluate((element) => {
      const input = element as unknown as {
        validity: { valid: boolean; valueMissing: boolean; rangeUnderflow: boolean };
        validationMessage: string;
      };
      return {
        valid: input.validity.valid,
        valueMissing: input.validity.valueMissing,
        rangeUnderflow: input.validity.rangeUnderflow,
        message: input.validationMessage,
      };
    });
  }

  async getFirstInvalidField(): Promise<ValidatedField | null> {
    const order: ValidatedField[] = ['name', 'category', 'price', 'stock'];
    for (const field of order) {
      const validity = await this.getValidity(field);
      if (!validity.valid) return field;
    }
    return null;
  }

  private fieldLocator(field: ValidatedField): Locator {
    switch (field) {
      case 'name':
        return this.nameField;
      case 'category':
        return this.categorySelect;
      case 'price':
        return this.priceField;
      case 'stock':
        return this.stockField;
    }
  }

  async clickSave(): Promise<void> {
    await this.saveButton.click();
  }

  async cancel(): Promise<void> {
    await this.cancelButton.click();
    await this.root.waitFor({ state: 'hidden' });
  }
}
