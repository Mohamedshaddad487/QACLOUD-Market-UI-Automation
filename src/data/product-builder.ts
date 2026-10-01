import { randomBytes } from 'node:crypto';
import { CATEGORIES } from './catalog-reference';

const RUN_ID = randomBytes(3).toString('hex');

export function buildProductName(shortLabel: string, workerIndex: number): string {
  return `AUT-${RUN_ID}-${workerIndex}-${shortLabel}`;
}

export type ProductInput = {
  name: string;
  categoryFormLabel: string;
  categoryCardLabel: string;
  categorySlug: string;
  price: string;
  stock: string;
  detail?: { key: string; value: string };
};

export type BuildProductOptions = {
  shortLabel: string;
  workerIndex: number;
  price?: string;
  stock?: string;
  detail?: { key: string; value: string };
};

export function buildProduct(options: BuildProductOptions): ProductInput {
  const category = CATEGORIES[0];
  return {
    name: buildProductName(options.shortLabel, options.workerIndex),
    categoryFormLabel: category.formLabel,
    categoryCardLabel: category.cardLabel,
    categorySlug: category.slug,
    price: options.price ?? '4.25',
    stock: options.stock ?? '7',
    detail: options.detail,
  };
}
