export const CATEGORIES = [
  { chipLabel: '🥦 Fresh Produce', cardLabel: 'Fresh Produce', formLabel: 'Fresh Produce', slug: 'fresh-produce' },
  { chipLabel: '🥩 Meat & Seafood', cardLabel: 'Meat Seafood', formLabel: 'Meat & Seafood', slug: 'meat-seafood' },
  { chipLabel: '🥚 Dairy & Eggs', cardLabel: 'Dairy Eggs', formLabel: 'Dairy & Eggs', slug: 'dairy-eggs' },
  { chipLabel: '🍞 Bakery', cardLabel: 'Bakery', formLabel: 'Bakery', slug: 'bakery' },
  { chipLabel: '🫙 Pantry', cardLabel: 'Pantry', formLabel: 'Pantry', slug: 'pantry' },
  { chipLabel: '🧃 Beverages', cardLabel: 'Beverages', formLabel: 'Beverages', slug: 'beverages' },
  { chipLabel: '🍿 Snacks', cardLabel: 'Snacks', formLabel: 'Snacks', slug: 'snacks' },
  { chipLabel: '🧊 Frozen', cardLabel: 'Frozen', formLabel: 'Frozen', slug: 'frozen' },
  { chipLabel: '🏠 Household', cardLabel: 'Household', formLabel: 'Household', slug: 'household' },
  { chipLabel: '📦 Other', cardLabel: 'Other', formLabel: 'Other', slug: 'other' },
] as const;

export const CATEGORY_PLACEHOLDER = 'Select category...';

export type Category = (typeof CATEGORIES)[number];

export const ZONES = ['Dry', 'Frozen', 'Chilled', 'Room Temperature'] as const;

export type Zone = (typeof ZONES)[number];

export const TYPES = ['Weighted', 'Each'] as const;

export type ProductType = (typeof TYPES)[number];

export const SORT_OPTIONS = ['Sort A-Z', 'Sort Z-A'] as const;

export type SortOption = (typeof SORT_OPTIONS)[number];
