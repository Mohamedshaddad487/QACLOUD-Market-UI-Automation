import type { Locator, Page } from '@playwright/test';

export class CategoryChips {
  readonly page: Page;
  private readonly container: Locator;
  readonly clearFiltersButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.container = page.locator('.category-chips-grid');
    this.clearFiltersButton = page.getByRole('button', { name: 'Clear Filters' });
  }

  chip(chipLabel: string): Locator {
    return this.container.getByText(chipLabel, { exact: true });
  }

  async toggle(chipLabel: string): Promise<void> {
    await this.chip(chipLabel).click();
  }

  async clearFilters(): Promise<void> {
    await this.clearFiltersButton.click();
  }
}
