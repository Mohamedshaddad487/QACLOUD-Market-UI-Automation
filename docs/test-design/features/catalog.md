# Feature: Product Catalog

[← Back to Test Design master](../TEST-DESIGN.md)

## Feature Overview

**Purpose:** The authenticated user's own product inventory — a per-account catalog of products with full CRUD capability exposed directly on each card, not a shared/read-only storefront.

**Business scope:** Catalog loading and rendering, product card information readability, catalog-level consequences of product creation/deletion (the list view and header stats reflecting change), and persistence of catalog contents across reload.

**Authentication:** Required (inherits from Authentication & Session).

**Entry point:** `/market.html` — "🛍️ Products" tab, the default tab on load.

**Dependencies:** Authentication & Session. This feature is, in turn, depended on by Search & Filtering, Product Details / View Details, Product Management, and Shopping Basket.

## Coverage Scope

Covered: catalog loading and rendering for an authenticated user, product card structural readability, header stats reflecting catalog state, and the catalog-view-level consequences of product creation, deletion, and reload.

**Explicitly not covered here** (by design, to avoid duplication — see Test Design §"Test Count Discipline"):
- **Filtering, search, sorting, and category behavior** — these belong entirely to `search-filtering.md`. This file does not test what happens to the catalog *view* under an active filter.
- **The detailed Add/Edit/Delete *workflow* mechanics** (form fields, validation, save behavior) — these belong to `product-management.md`. This file's creation/deletion-related scenarios verify only the **catalog list and stats' reaction** to a change that Product Management's own scenarios are responsible for driving and verifying in detail.
- **A genuinely empty catalog state** — the catalog currently holds real seed data and reaching a truly empty state would require destructive seed deletion, which Architecture forbids (§10.5). The only realistically reachable "no products" UI text is triggered by a non-matching **search**, which is covered as `FIL-002` in `search-filtering.md`, not duplicated here.

## Preconditions

- Authenticated session (Authentication & Session, `AUTH-001`/`AUTH-004`).
- A populated catalog exists (confirmed, account-scoped — `EV-P2-001`).

## Test Data Requirements

| Kind | Detail |
|---|---|
| **Existing/seed data** | The catalog's pre-existing products, queried by **attribute** (category, price range, stock text), never by hardcoded name or ID — a previously-baseline product ("100% Florida Orange Juice") is confirmed permanently gone from the catalog (`EV-P2-035`, `U-211`), so any scenario hardcoding a specific product identity is fragile by demonstrated precedent. |
| **Temporary/generated data** | CAT-004/005/006 below observe the catalog's reaction to a product created and deleted by a `product-management.md` scenario — `PM-001` (creation, then a full reload) and `PM-017` (deletion) — this file does not itself create the product. |
| **Ownership** | All catalog data belongs to the single project account (`EV-P2-053`, `EV-P2-054`). |
| **Cleanup requirement** | This file's own scenarios are read-only. The temporary product referenced by CAT-004/005/006 is created and cleaned up by the Product Management test that asserts it (`PM-001` and `PM-017` register their product and remove it in their spec's `afterEach` through `ensureProductAbsent`). |

## Scenarios

### Positive

#### `CAT-001 — Catalog loads and renders real product data for an authenticated user`
- **Type:** Positive
- **Priority:** P0
- **Purpose:** Confirms the catalog's basic, foundational rendering — the precondition every other Products-tab scenario in the suite assumes.
- **Preconditions:** Authenticated session.
- **Test Data:** None — read-only against existing catalog data.
- **Steps:** Navigate to `/market.html` (Products tab, default).
- **Expected Outcome:** The catalog populates with real product cards; the "N products shown" summary reflects a non-zero count.
- **Business Assertions:** At least one product card renders; the result count is greater than zero.
- **Persistence / State Assertions:** N/A.
- **Cleanup:** None.
- **Dependencies:** `AUTH-004`.
- **Traceability:** Feature Map → Product Catalog → Main Workflows. Evidence: `EV-P2-001`, `EV-P1-015`.
- **Notes / Known Limitations:** Does not assert an exact product count — the catalog's count has changed during this project's own discovery (34 → 33) and may change again; an exact-count assertion here would be fragile by design (Architecture §14.7).

#### `CAT-002 — Product cards expose a consistent, readable structure`
- **Type:** Positive
- **Priority:** P1
- **Purpose:** Confirms every card exposes the same predictable structure, which every other feature that reads from a card (Search & Filtering results, Product Details entry, Product Management entry, Basket "ADD") depends on implicitly.
- **Preconditions:** `CAT-001`.
- **Test Data:** Any rendered product card — selection by position/attribute, not by hardcoded name.
- **Steps:** Inspect a rendered product card.
- **Expected Outcome:** The card exposes: a category-emoji icon, three icon-only action controls (👁️ / ✏️ / 🗑️), a product name heading, category text, a Zone/Type badge row, a price, a stock-status text, and an "ADD" control.
- **Business Assertions:** All named elements are present and readable (non-empty text) on the inspected card.
- **Persistence / State Assertions:** N/A.
- **Cleanup:** None.
- **Dependencies:** `CAT-001`.
- **Traceability:** Feature Map → Product Catalog → Product Card Structure. Evidence: `EV-P2-059`, `EV-P2-001`.
- **Notes / Known Limitations:** This scenario verifies structure on one representative card, not all cards exhaustively — Discovery already confirmed structural consistency across every card checked (`EV-P2-059`), so exhaustive per-card verification would not add coverage value (Test Design §"Test Count Discipline").

#### `CAT-003 — Header stats reflect the loaded catalog state`
- **Type:** Positive
- **Priority:** P1
- **Purpose:** Confirms the four header stat tiles (Products / Basket Units / Orders / Inventory Value) are live, computed values tied to real catalog/account state, not static placeholders.
- **Preconditions:** `CAT-001`.
- **Test Data:** None additional.
- **Steps:** Read the header stats bar after the catalog has loaded.
- **Expected Outcome:** "Products" shows a non-zero count consistent with the rendered catalog; "Inventory Value" shows a non-zero currency value.
- **Business Assertions:** Stats are present and numerically non-trivial (not stuck at the all-zero unauthenticated/loading state).
- **Persistence / State Assertions:** N/A.
- **Cleanup:** None.
- **Dependencies:** `CAT-001`.
- **Traceability:** Feature Map → Product Catalog → State Changes. Evidence: `EV-P2-001`, `EV-P0-010` (contrasting the all-zero unauthenticated state).
- **Notes / Known Limitations:** Does not assert an exact "Products" count or "Inventory Value", for the same reason as `CAT-001`.

### State (catalog-level consequence of Product Management actions)

#### `CAT-004 — Catalog list reflects a newly created product without a reload`
- **Type:** Positive / State
- **Priority:** P1
- **Purpose:** Confirms the catalog *view* updates live when a product is created elsewhere in the same session — proving Product Management writes to the same catalog this feature reads from, not a separate cache.
- **Preconditions:** Authenticated session; a product has just been created via a Product Management scenario (e.g. `PM-001`).
- **Test Data:** The temporary product created by the depended-on Product Management scenario (uniquely named, e.g. `AUT-...` per Architecture §11.3).
- **Steps:** After the product-creation action completes (no reload), inspect the catalog list.
- **Expected Outcome:** The new product's card is present among the rendered products.
- **Business Assertions:** The created product's name is found in the currently-rendered catalog.
- **Persistence / State Assertions:** N/A (this is the pre-reload check; see `CAT-006` for reload persistence).
- **Cleanup:** Owned by the depended-on Product Management scenario's cleanup — this scenario does not delete the product itself.
- **Dependencies:** A Product Management creation scenario (e.g. `PM-001`).
- **Traceability:** Feature Map → Product Catalog → Cross-Feature Dependencies. Evidence: `EV-P2-042`.
- **Notes / Known Limitations:** This scenario intentionally does not re-verify the creation *workflow* itself (form fields, validation, save mechanics) — that is `product-management.md`'s responsibility. It verifies only the catalog view's reaction.
- **Implementation status (reconciled 2026-09-27): IMPLEMENTED — in the `PM-001` test** (`tests/product-management/add-product.spec.ts`, titled `PM-001 / CAT-004 / CAT-006 — …`). After Save, with no reload, it asserts the new card's name, category, price and stock. No standalone CAT test exists. *Previously implementation-deferred: the scenario depends on a Product Management action, and Product Management was out of scope when Product Catalog was implemented. By owner decision (2026-09-27) it is asserted inside the Product Management test that performs that action, not in a separate test (TEST-DESIGN §9).* The ID is unchanged.

#### `CAT-005 — Catalog list no longer shows a deleted product, and stats return to baseline`
- **Type:** Positive / State
- **Priority:** P1
- **Purpose:** Confirms the catalog view's deletion-side counterpart to `CAT-004`, and that header stats (count, Inventory Value) are recomputed correctly, not left stale.
- **Preconditions:** A temporary product exists and has just been deleted via a Product Management scenario (`PM-017`).
- **Test Data:** The same temporary product referenced by `CAT-004`.
- **Steps:** After the deletion action completes, inspect the catalog list and header stats.
- **Expected Outcome:** The deleted product's card is absent; "Products" count and "Inventory Value" match their pre-creation baseline.
- **Business Assertions:** The deleted product's name is not found in the catalog; stats equal their recorded pre-creation values.
- **Persistence / State Assertions:** N/A (see `CAT-006`).
- **Cleanup:** Already performed by the depended-on Product Management scenario — this scenario is itself a verification of that cleanup, not an independent cleanup obligation.
- **Dependencies:** A Product Management deletion scenario: `PM-017`, which records the pre-creation baseline. `PM-015` checks only that the card is gone, not the stats.
- **Traceability:** Feature Map → Product Catalog → State Changes. Evidence: `EV-P2-049`.
- **Notes / Known Limitations:** None.
- **Implementation status (reconciled 2026-09-27): IMPLEMENTED — in the `PM-017` test** (`tests/product-management/lifecycle.spec.ts`, titled `PM-017 / JRN-003 / CAT-005 — …`). After the accepted delete, with no reload, it asserts the card is gone and that the Products count and Inventory Value equal the values recorded before the product was created. No standalone CAT test exists. *Previously implementation-deferred: the scenario depends on a Product Management action, and Product Management was out of scope when Product Catalog was implemented. By owner decision (2026-09-27) it is asserted inside the Product Management test that performs that action, not in a separate test (TEST-DESIGN §9).* The ID is unchanged.

### Persistence

#### `CAT-006 — A newly created product persists in the catalog view across a full page reload`
- **Type:** Persistence
- **Priority:** P1
- **Purpose:** Confirms the catalog view, independently re-loaded from the server, still lists a just-created product — the catalog-browsing angle on persistence, distinct from Product Management's own reload check (which re-opens the Edit form to compare field values, not the list view).
- **Preconditions:** A temporary product exists (created via `PM-001`).
- **Test Data:** The temporary product from `CAT-004`.
- **Steps:** Reload `/market.html`. Inspect the catalog list.
- **Expected Outcome:** The product remains listed after reload; it is not an artifact of unreloaded client-side state.
- **Business Assertions:** The product's name is found in the catalog after a fresh page load.
- **Persistence / State Assertions:** Product survives a full reload.
- **Cleanup:** Owned by the Product Management scenario's cleanup (deletion occurs after this check, in that scenario's own teardown).
- **Dependencies:** A Product Management creation scenario (e.g. `PM-001`).
- **Traceability:** Feature Map → Product Catalog → Persistence. Evidence: `EV-P2-046`.
- **Notes / Known Limitations:** Complements, rather than duplicates, Product Management's own persistence scenario (`PM-013`), which re-opens the Edit form after reload to confirm field-level values persisted — this scenario only confirms catalog-list visibility.
- **Implementation status (reconciled 2026-09-27): IMPLEMENTED — in the `PM-001` test**, after its `CAT-004` assertions: a full `/market.html` navigation, `waitForCatalogLoaded()`, then an explicit assertion that the same uniquely named product is listed. No standalone CAT test exists. *Previously implementation-deferred: the scenario depends on a Product Management action, and Product Management was out of scope when Product Catalog was implemented. By owner decision (2026-09-27) it is asserted inside the Product Management test that performs that action, not in a separate test (TEST-DESIGN §9).* The ID is unchanged.

## Scenario Count

6 scenarios (`CAT-001`–`CAT-006`): 3 Positive, 2 Positive/State, 1 Persistence. **Implementation status (2026-09-27):** all six implemented: `CAT-001`–`CAT-003` in `tests/catalog/`; `CAT-004` and `CAT-006` in the `PM-001` test and `CAT-005` in the `PM-017` test (see each scenario's Notes, TEST-DESIGN §9 and §11.1). No Negative/Boundary/Validation/Business-Rule/Regression sections are included — Discovery evidence supports none of those dimensions as *catalog-specific* (they belong to Search & Filtering, Product Management, or are cross-cutting via the journeys file), consistent with the instruction not to force every category.
