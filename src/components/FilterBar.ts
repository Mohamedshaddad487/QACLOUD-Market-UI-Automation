import type { Locator, Page } from '@playwright/test';
import type { SortOption, Zone, ProductType } from '../data/catalog-reference';

export class FilterBar {
  readonly page: Page;
  readonly searchBox: Locator;
  readonly sortSelect: Locator;
  readonly zoneSelect: Locator;
  readonly typeSelect: Locator;
  readonly resultSummary: Locator;
  readonly activeFilters: Locator;

  constructor(page: Page) {
    this.page = page;
    this.searchBox = page.locator('#productSearch');
    this.sortSelect = page.locator('#sortOrder');
    this.zoneSelect = page.locator('#filterTemperatureZone');
    this.typeSelect = page.locator('#filterWeighted');
    this.resultSummary = page.locator('#resultsCount');
    this.activeFilters = page.locator('#activeFiltersSummary');
  }

  async search(term: string): Promise<void> {
    await this.searchBox.pressSequentially(term);
  }

  async clearSearchText(): Promise<void> {
    await this.searchBox.press('ControlOrMeta+a');
    await this.searchBox.press('Backspace');
  }

  async selectSort(option: SortOption): Promise<void> {
    await this.sortSelect.selectOption({ label: option });
  }

  async selectZone(zone: Zone): Promise<void> {
    await this.zoneSelect.selectOption({ label: zone });
  }

  async selectType(type: ProductType): Promise<void> {
    await this.typeSelect.selectOption({ label: type });
  }

  async getShownCount(): Promise<number> {
    const text = await this.resultSummary.textContent();
    const match = text?.match(/(\d+)/);
    if (!match) {
      throw new Error(`Could not parse a count from the result summary: "${text}"`);
    }
    return Number(match[1]);
  }
}
