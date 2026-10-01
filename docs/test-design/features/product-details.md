# Feature: Product Details / View Details

[← Back to Test Design master](../TEST-DESIGN.md)

## Feature Overview

**Purpose:** A read-only, per-product detail modal reachable from every catalog card, exposing fields not visible on the card itself (Specifications/Details, Product ID) — but notably omitting Zone and Type, which *are* visible on the card.

**Business scope:** Opening/closing the modal (both close controls, and the confirmed non-closing Escape key), the confirmed field set, background-interaction blocking, filter-state preservation across open/close, and the confirmed Stock Status card-vs-modal discrepancy.

**Authentication:** Required (inherits from Product Catalog).

**Entry point:** Product card — 👁️ icon.

**Dependencies:** Product Catalog (source of the product being viewed).

## Coverage Scope

Covered: modal open/close mechanics (both controls, Escape's confirmed non-behavior, background-blocking), the confirmed field set including the confirmed Zone/Type omission, Specifications rendering rules, filter-state preservation, and the confirmed Stock Status discrepancy as a dedicated defect-detection scenario.

**Explicitly not covered here:** the product-card side of things (`catalog.md`), or any create/edit/delete mechanics (`product-management.md`) — this file is strictly about the read-only modal itself.

**Explicitly not invented:** a "product not found" or loading-spinner state for View Details. Discovery confirmed the modal renders synchronously from the catalog's already-fetched client-side data with **zero new network requests** (`EV-P2-066`) — since a card can only be clicked if it is already rendered from already-loaded data, there is no UI path through which a not-found or loading state could ever be reached through the normal control. No scenario in this file assumes one exists.

## Preconditions

- Authenticated session; a populated catalog (`CAT-001`).
- At least one rendered product card to open.

## Test Data Requirements

| Kind | Detail |
|---|---|
| **Existing/seed data** | Any rendered product card, selected by attribute (not hardcoded identity, per Architecture §11.2). The Stock Status defect scenario (`DET-009`) specifically needs a product whose card shows a low-stock indicator, resolved at execution time. |
| **Temporary/generated data** | None — this file's scenarios are read-only. |
| **Ownership** | N/A — read-only feature. |
| **Cleanup requirement** | None — opening/closing the modal changes no data (`EV-P2-066`). |

## Scenarios

### View Details

#### `DET-001 — Opening View Details renders a same-page modal with no navigation`
- **Type:** Positive
- **Priority:** P1
- **Purpose:** Confirms the basic open mechanism and that it is a true in-page modal, not a route change.
- **Preconditions:** `CAT-001`.
- **Test Data:** Any rendered product card.
- **Steps:** Click the 👁️ icon on a product card.
- **Expected Outcome:** A modal opens over the current page; the URL/route and page title are unchanged.
- **Business Assertions:** Modal is visible with the product's name in its title; underlying route is unchanged.
- **Persistence / State Assertions:** N/A.
- **Cleanup:** Close the modal.
- **Dependencies:** `CAT-001`.
- **Traceability:** Feature Map → Product Details / View Details → Main Workflows. Evidence: `EV-P2-060`.
- **Notes / Known Limitations:** None.

#### `DET-002 — View Details closes via the "×" control`
- **Type:** Positive
- **Priority:** P2
- **Purpose:** Confirms the first of two confirmed, functionally-identical close paths.
- **Preconditions:** `DET-001` (modal open).
- **Test Data:** None additional.
- **Steps:** Click "×".
- **Expected Outcome:** The modal closes; the catalog view is shown again.
- **Business Assertions:** Modal is no longer visible.
- **Persistence / State Assertions:** N/A.
- **Cleanup:** None (already closed).
- **Dependencies:** `DET-001`.
- **Traceability:** Feature Map → Product Details / View Details → Main Workflows. Evidence: `EV-P2-060`.
- **Notes / Known Limitations:** None.

#### `DET-003 — View Details closes via the "Close" control`
- **Type:** Positive
- **Priority:** P2
- **Purpose:** Confirms the second confirmed close path independently, since Discovery verified both explicitly as distinct controls.
- **Preconditions:** `DET-001` (modal open).
- **Test Data:** None additional.
- **Steps:** Click "Close".
- **Expected Outcome:** The modal closes; the catalog view is shown again.
- **Business Assertions:** Modal is no longer visible.
- **Persistence / State Assertions:** N/A.
- **Cleanup:** None.
- **Dependencies:** `DET-001`.
- **Traceability:** Feature Map → Product Details / View Details → Main Workflows. Evidence: `EV-P2-060`.
- **Notes / Known Limitations:** Kept distinct from `DET-002` because Discovery independently confirmed both as separate, real controls — not a duplicate, per Architecture §3.7 ("earn every layer" applies equally to earning every scenario: two independently-evidenced controls warrant two scenarios).

#### `DET-004 — [Defect] Escape key does not close View Details`
- **Type:** Regression / Defect Detection
- **Priority:** P2
- **Purpose:** Watches a confirmed negative behavior — a common user expectation (Escape closes a modal) that this application does not honor.
- **Preconditions:** `DET-001` (modal open).
- **Test Data:** None additional.
- **Steps:** Press Escape.
- **Expected Outcome (currently observed, documented as a known gap):** The modal remains open.
- **Business Assertions:** Modal is still visible after Escape.
- **Persistence / State Assertions:** N/A.
- **Cleanup:** Close via "×" or "Close".
- **Dependencies:** `DET-001`.
- **Traceability:** Feature Map → Product Details / View Details → Negative / Validation Behavior. Evidence: `EV-P2-061`.
- **Notes / Known Limitations:** If a future application change makes Escape close the modal, this scenario is expected to start failing — that is the intended signal of a defect-detection scenario for a confirmed behavioral gap, not a reason to silently update the expectation.

#### `DET-005 — The modal blocks interaction with the background catalog`
- **Type:** Negative / Business Rule
- **Priority:** P2
- **Purpose:** Confirms the background is genuinely non-interactive while the modal is open, not merely visually obscured — a real accessibility/interaction-safety property, confirmed via an actual intercepted-click error, not inferred.
- **Preconditions:** `DET-001` (modal open).
- **Test Data:** None additional.
- **Steps:** Attempt to interact with a background element (e.g. the search textbox) while the modal remains open.
- **Expected Outcome:** The interaction is blocked/intercepted by the modal's overlay; the background element does not receive the interaction.
- **Business Assertions:** The attempted background interaction fails to register (e.g. the search box's value does not change).
- **Persistence / State Assertions:** N/A.
- **Cleanup:** Close the modal.
- **Dependencies:** `DET-001`.
- **Traceability:** Feature Map → Product Details / View Details → Negative / Validation Behavior. Evidence: `EV-P2-060` (confirmed via an actual Playwright intercepted-click error).
- **Notes / Known Limitations:** None.

#### `DET-006 — Filter and search state is preserved across opening and closing View Details`
- **Type:** Persistence
- **Priority:** P1
- **Purpose:** Confirms opening a product's details does not disturb the catalog's current filter/search state — an easy thing to accidentally break, and a real, evidenced cross-feature dependency (Search & Filtering ↔ Product Details).
- **Preconditions:** An active search term or category filter is applied (e.g. via `FIL-001` or `FIL-005`).
- **Test Data:** Any product visible under the active filter.
- **Steps:** With an active filter/search applied, open View Details on a visible product, then close it via either control.
- **Expected Outcome:** The catalog's filter/search state (result set, active-filter chip) is identical before and after.
- **Business Assertions:** The same result count and active-filter chip text are present after closing as before opening.
- **Persistence / State Assertions:** Filter/search state survives the modal's open/close cycle.
- **Cleanup:** Clear Filters.
- **Dependencies:** `FIL-001` or `FIL-005`, `DET-001`.
- **Traceability:** Feature Map → Product Details / View Details → Persistence; Search & Filtering → Cross-Feature Dependencies. Evidence: `EV-P2-062` (tested via both close controls with an active search term).
- **Notes / Known Limitations:** None.

### Data

#### `DET-007 — View Details displays the confirmed field set`
- **Type:** Positive
- **Priority:** P1
- **Purpose:** Confirms the modal's complete, confirmed field inventory renders correctly.
- **Preconditions:** `DET-001` (modal open).
- **Test Data:** Any rendered product.
- **Steps:** Inspect the open modal's content.
- **Expected Outcome:** Category, Price, Stock Status, Available Units, Specifications (dynamic key/value), and Product ID (full UUID) are all present and readable.
- **Business Assertions:** All six confirmed fields are present with non-empty values; the displayed Price and Category match the corresponding catalog card's values for the same product.
- **Persistence / State Assertions:** N/A.
- **Cleanup:** Close the modal.
- **Dependencies:** `DET-001`.
- **Traceability:** Feature Map → Product Details / View Details → Exact Field Set. Evidence: `EV-P2-006`, `EV-P2-045`, `EV-P2-063` (confirmed on 4+ distinct products across Discovery).
- **Notes / Known Limitations:** None.

#### `DET-008 — View Details omits Zone and Type despite both being visible on the card`
- **Type:** Negative / Business Rule
- **Priority:** P2
- **Purpose:** Confirms a specific, deliberately-verified absence — Zone and Type are real, card-visible attributes that Discovery confirmed are **never** shown in the modal, in every case checked.
- **Preconditions:** `DET-001` (modal open) on a product whose card shows both a Zone and a Type badge.
- **Test Data:** Any rendered product.
- **Steps:** Compare the card's Zone/Type badges against the open modal's content.
- **Expected Outcome:** Neither "Zone" nor "Type" (nor their values) appear anywhere in the modal, despite being visible on the card.
- **Business Assertions:** No Zone/Type label or value is present in the modal's content.
- **Persistence / State Assertions:** N/A.
- **Cleanup:** Close the modal.
- **Dependencies:** `DET-001`, `DET-007`.
- **Traceability:** Feature Map → Product Details / View Details → Exact Field Set. Evidence: `EV-P2-006`, `EV-P2-045`, `EV-P2-063`.
- **Notes / Known Limitations:** This is documented as a confirmed field-set gap, not asserted to be a defect requiring a fix — no evidence in Discovery characterizes it as unintended.

#### `DET-009 — [Defect] View Details "Stock Status" text can disagree with the product card's stock indicator`
- **Type:** Regression / Defect Detection
- **Priority:** P1
- **Purpose:** Watches a confirmed, reproduced inconsistency between two UI surfaces describing the same product's stock — the single most notable confirmed defect in this feature, reproduced on two independent products.
- **Preconditions:** `CAT-001`; a product whose card currently shows a low-stock indicator (e.g. "⚡ Low Stock: N left", threshold ≤ 9) is identified at execution time.
- **Test Data:** A product resolved at execution time by its card's low-stock indicator — never hardcoded, since specific stock levels change over time (e.g. Hass Avocado's residual 8-unit state, itself a by-product of this project's own Discovery).
- **Steps:** Note the card's stock indicator for the identified low-stock product. Open View Details for that same product. Read the modal's "Stock Status" field.
- **Expected Outcome (currently observed, documented as a known defect, not a desired behavior):** The modal's "Stock Status" field reads "✅ In Stock" even though the card shows a low-stock warning for the same product. The modal's **numeric** "Available Units" value is correct and matches the card; only the **textual status label** is wrong.
- **Business Assertions:** Card shows a low-stock indicator; modal's Stock Status text shows "✅ In Stock" for the same product at the same moment (the confirmed inconsistency); modal's Available Units number matches the card's stock number.
- **Persistence / State Assertions:** N/A.
- **Cleanup:** Close the modal.
- **Dependencies:** `CAT-001`.
- **Traceability:** Feature Map → Product Details / View Details → Negative / Validation Behavior; Feature Map → Known Observations / Potential Defects, row 5. Evidence: `EV-P2-006` (Orange Juice, 9 units — **note:** this specific product is confirmed permanently gone from the catalog, `U-211`, so it cannot be reused as this scenario's test subject going forward), `EV-P2-064` (Hass Avocado, 8 units, independently reproduced).
- **Notes / Known Limitations:** This scenario's test subject must be resolved dynamically against whatever product currently shows a low-stock indicator at execution time — never a hardcoded product name, both because of Architecture §11.2's general rule and because the scenario's own original evidenced example (Orange Juice) is no longer available. If this defect is ever fixed, this scenario is expected to fail at its "shows ✅ In Stock" assertion, which is the correct, intended signal — not a reason to quietly relax the expectation.

### Exploratory / Deferred Verification

#### `DET-010 — [Deferred] Specifications rendering with an empty or duplicate-key detail set`
- **Type:** Exploratory / Deferred Verification
- **Priority:** P3
- **Purpose:** Records that the Specifications rendering rules Discovery did confirm (underscore→space+colon formatting, no-space array joins, JSON-insertion-key-order) were never observed against an empty or duplicate-key input, because no naturally-occurring example existed among the products inspected.
- **Preconditions:** `DET-001` (modal open) on a product with an empty or duplicate-key Details set — **not currently known to exist** among seed products.
- **Test Data:** Would require a temporary product deliberately constructed with an empty/duplicate-key Details set via Product Management — this scenario is not executable against current seed data as-is.
- **Steps:** N/A until a suitable product exists.
- **Expected Outcome:** **Not asserted.** Recorded so `U-216` can eventually be closed with real evidence, not to encode an assumed rendering behavior.
- **Business Assertions:** None enforced.
- **Persistence / State Assertions:** N/A.
- **Cleanup:** N/A.
- **Dependencies:** Would depend on a Product Management scenario deliberately creating such a product (not currently designed — see `product-management.md`'s own `U-214` deferral).
- **Traceability:** Feature Map → Product Details / View Details → Specifications Rendering Mechanism. Related unknown: `U-216`.
- **Notes / Known Limitations:** Kept in this file for completeness of the Open Questions record; not implementation-ready without a corresponding Product Management scenario to construct the needed data.

#### `DET-011 — [Deferred] True backdrop-click close behavior`
- **Type:** Exploratory / Deferred Verification
- **Priority:** P3
- **Purpose:** Records that whether clicking the modal's backdrop (outside its content, but still inside the modal overlay) closes it was never cleanly testable in Discovery, since the modal exposes no separate backdrop element distinct from its content in the accessibility tree.
- **Preconditions:** `DET-001` (modal open).
- **Test Data:** None additional.
- **Steps:** Attempt a click at a coordinate within the modal overlay but outside its visible content area.
- **Expected Outcome:** **Not asserted as open/close.** Recorded so `U-218` can eventually be closed with real evidence from a coordinate-based (not ref-based) interaction, which Discovery's accessibility-snapshot-first methodology could not reliably perform.
- **Business Assertions:** None enforced.
- **Persistence / State Assertions:** N/A.
- **Cleanup:** Close via a confirmed control (`DET-002`/`DET-003`) regardless of this scenario's outcome.
- **Dependencies:** `DET-001`.
- **Traceability:** Feature Map → Product Details / View Details → Negative / Validation Behavior. Related unknown: `U-218`.
- **Notes / Known Limitations:** May require a coordinate-based interaction technique not used elsewhere in this Test Design; implementation should treat this as a genuinely open technical question, not assume ref-based clicking will resolve it.

## Scenario Count

11 scenarios (`DET-001`–`DET-011`): 5 Positive, 1 Persistence, 2 Negative/Business Rule, 2 Regression/Defect Detection, 2 Exploratory/Deferred Verification.
