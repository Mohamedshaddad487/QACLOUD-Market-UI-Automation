# Feature: Shopping Basket

[← Back to Test Design master](../TEST-DESIGN.md)

> **Reconciliation note (Shopping Basket re-discovery, 2026-09-24).** This design was reconciled against a fresh, execution-based re-discovery of the Basket. Re-discovery evidence is cited as `D-01`–`D-33`; those IDs are defined in the Feature Map → Shopping Basket → *Re-discovery Reconciliation* register (the Evidence Log is closed at `EV-P2-069` and was not modified). Every historical scenario ID is preserved (§5.1). Where a scenario was revised, its Notes state what changed, why, and quote the superseded wording, so the original design stays traceable. New scenarios take the next free IDs (`BSK-014`–`BSK-021`) and are grouped by responsibility, so IDs are not contiguous within sections. A later **Pre-Implementation Verification** (2026-09-24) re-checked `D-07`, `D-13`, `D-23` and `D-24` with request-level synchronization; its results are register entries `D-34`–`D-39`, and each scenario it affected (`BSK-001`–`BSK-003`, `BSK-019`–`BSK-021`) says so in its Notes.

## Feature Overview

**Purpose:** Holds selected products and quantities, scoped to the authenticated account, as the staging area before Checkout.

**Business scope:** Add, the two intentionally distinct header metrics, the Basket-tab and Products-card quantity steppers, the quantity bounds (stock cap and removal at zero), zero-stock products, Remove, Clear All, "🔄 Refresh", line subtotals and the Order Summary, persistence across navigation / reload / browser sessions / logout-login, the basket's behavior when stock falls below a basket quantity, and the historical display and synchronization observations (deferred where they are not currently reproduced).

**Authentication:** Required. An unauthenticated visit to `/market.html` is redirected to the portal and never requests the basket (`D-01`).

**Entry point:** Header "🛒 Basket N" button, or the "🛒 Basket" tab (`D-02`). Products are added only from a product card's "ADD" control — the View Details modal has no add-to-basket control (`D-03`).

**Dependencies:** Product Catalog (source of addable items); Product Management (temporary products, and stock edits in `BSK-021`). Hard prerequisite for Checkout.

## Coverage Scope

Covered: basket entry, empty state, add (single and multiple products), zero-stock products, quantity increment/decrement on the Basket tab, the upper (stock) and lower (removal) quantity bounds, Remove, Clear All (dismiss and accept), totals, persistence across tab navigation, full reload, a second browser session of the same account, and logout/login; the basket's behavior when available stock falls below a basket quantity; the Products-card stepper's increment result; and an add reflected in a Basket tab rendered earlier in the page session. The last two were defect-detection scenarios until the Pre-Implementation Verification did not reproduce the defects (`D-35`, `D-36`); they now assert the confirmed correct behavior under the conditions in which the defects were historically observed.

**Explicitly not covered here:** placing an order (`checkout.md`) — this file stops at a populated, correct basket and the existence of "📦 Place Order". No scenario in this file clicks "📦 Place Order". Server-side over-stock handling is not designed (the UI prevents reaching it, and API use is out of scope).

## Preconditions

- Authenticated session; a populated catalog (`CAT-001`).
- **The basket must be empty before every scenario in this file begins, and empty when it ends** — verified by a genuine re-read (see Cleanup requirement below).

## Test Data Requirements

| Kind | Detail |
|---|---|
| **Existing/seed data** | Permitted only for scenarios that neither depend on a specific stock value nor change the product. Adding to the basket does not consume stock (`EV-P2-020`; `D-04`), and removing a basket line did not delete the catalog product in three observed removals (`D-18`). **Temporary products are nonetheless recommended for every scenario**: the historical disappearance of a seed product after a basket Remove (`EV-P2-057`) remains unexplained, and seed stock values are not stable (`EV-P2-020`). |
| **Temporary/generated data** | **Required** for `BSK-014` (small known stock), `BSK-016` (zero stock — no seed product has zero stock), `BSK-019` (known stock), and `BSK-021` (its stock is edited). Created and deleted only through the real Product Management UI with the `AUT-` naming convention. **The basket must be empty before a temporary product is deleted** — how the basket behaves when a product in it is deleted is **NOT VERIFIED**. |
| **Ownership** | The basket is a single, account-scoped resource — **not per-scenario data** — and it is **shared by every browser context and session of the account** (`D-22`). During re-discovery the account was also in use by another actor (`D-31`). This is the most important fact governing this file's design. |
| **Cleanup requirement** | **Mandatory at both ends of every scenario.** The basket persists across logout/login (`EV-P2-013`), reload (`EV-P2-014`, `D-21`) and browser contexts (`D-22`); a leftover item silently changes every later scenario's starting state (`EV-P2-034`). Emptiness must be verified by a **genuine re-read** — a fresh page load, opening the Basket tab with its own basket read allowed to complete (`D-38`), or "🔄 Refresh" — and never inferred from the header stats (`EV-P2-014`) or from a view rendered earlier, which does not update when another session of the account changes the basket (`D-22`). (An already-rendered Basket tab was historically also observed stale after an add, `D-23`; that was not reproduced once the tab's own read had completed, `D-36`.) Cleanup is UI-only: "Remove", "−" at quantity 1, or "🗑️ Clear All". **Clear All empties the entire account basket**, including anything another session of the account has added. |

## Scenarios

### Positive

#### `BSK-001 — The Basket tab shows an empty state when no items are present`
- **Type:** Positive
- **Priority:** P1
- **Purpose:** Confirms the baseline empty-basket presentation, including its confirmed copy.
- **Preconditions:** Authenticated session; basket confirmed empty.
- **Test Data:** None.
- **Steps:** Open the "🛒 Basket" tab with an empty basket.
- **Expected Outcome:** The empty-state message is shown ("Your basket is empty. Start marketping!" — a confirmed copy typo, "marketping" rather than "shopping"). "🔄 Refresh" and "🗑️ Clear All" are present; no Order Summary panel and no "📦 Place Order" button are shown.
- **Business Assertions:** No basket line items are present; the header "Basket" count is 0; no Order Summary or "📦 Place Order" is shown.
- **Persistence / State Assertions:** N/A.
- **Cleanup:** None (already empty).
- **Dependencies:** None.
- **Traceability:** Feature Map → Shopping Basket → Important UI Labels. Evidence: `EV-P2-009`, `EV-P2-011` (both quote the exact empty-state copy); `D-06`.
- **Notes / Known Limitations:**
  - The "marketping" typo is asserted as the confirmed current copy, not silently corrected (Architecture §3.4).
  - **Revised in the 2026-09-24 reconciliation:** Expected Outcome and Business Assertions now also cover the controls present and absent on the empty basket (`D-06`).
  - **Revised in the Pre-Implementation Verification (2026-09-24).** This note previously carried a synchronization warning: *"**Synchronization warning (`D-07`):** after a fresh page load with an empty basket, the "Loading basket..." indicator was observed to remain visible alongside the rendered empty state (twice). Its visibility therefore **must not** be used as a signal that the basket is still loading — a scenario waiting for it to disappear would never proceed."* Re-verified with request-level synchronization, the indicator was hidden, and the empty state rendered, as soon as the Basket tab's own basket read had completed; it was also hidden after the page's initial read (`D-34`, 2 runs). The historical observations were taken while the tab's own read was still in flight (`D-39`). `D-07` is **NOT REPRODUCED**, and the warning is withdrawn. This scenario does not assert the indicator; readiness is the completion of the basket read that opening the tab issues (Architecture §15.2).

#### `BSK-002 — Adding a single product to the basket updates the header count and stat`
- **Type:** Positive
- **Priority:** P0
- **Purpose:** Confirms the core add-to-basket action and the two distinct header metrics it drives — a P0 scenario since basket-adding is a direct precondition of the entire purchase journey.
- **Preconditions:** Authenticated session; basket confirmed empty (see Test Data Requirements → Cleanup requirement); `CAT-001`.
- **Test Data:** One product (see Test Data Requirements).
- **Steps:** Click "ADD" on the product's card.
- **Expected Outcome:** The header "🛒 Basket" count becomes 1 (distinct item count); the "Basket Units" stat becomes 1 (total quantity); the card's "ADD" button becomes an inline "- / qty / +" stepper. The user remains on the Products tab, and the product's displayed stock is unchanged.
- **Business Assertions:** Both header metrics reflect exactly one item, one unit; the product's stock is not reduced by adding it to the basket.
- **Persistence / State Assertions:** N/A.
- **Cleanup:** Remove the item and verify the basket is empty.
- **Dependencies:** `CAT-001`.
- **Traceability:** Feature Map → Shopping Basket → Main Workflows. Evidence: `EV-P2-007`, `D-04`, `D-11`.
- **Notes / Known Limitations:** **Revised in the 2026-09-24 reconciliation:** added the fresh-page precondition and the unchanged-stock assertion. The precondition keeps this scenario clear of `BSK-020`: when the Basket tab had already been rendered in the page session, an add from the Products tab was not reflected in the Basket tab, and once not in the header badge either (`D-23`). Adding produces no alert (`D-29`), so none is asserted. **Revised again in the Pre-Implementation Verification (2026-09-24):** the fresh-page precondition (*"a fresh page load in which the Basket tab has **not** yet been opened"*) is removed. It existed only to avoid the `D-23` stale state, which did not reproduce once the Basket tab's own read had completed: the product was listed and the header badge read 1 (`D-36`, 2 runs). No other confirmed rule requires it. The isolation this scenario does need, an empty basket verified by a genuine re-read, is retained.

#### `BSK-003 — Adding multiple distinct products is reflected correctly in both header metrics`
- **Type:** Positive
- **Priority:** P1
- **Purpose:** Confirms the "distinct items" vs. "total units" distinction holds correctly once more than one product is involved — the scenario that actually exercises the difference between the two metrics (`BSK-002` alone cannot, since 1 item = 1 unit).
- **Preconditions:** Authenticated session; basket confirmed empty (see Test Data Requirements → Cleanup requirement); `CAT-001`.
- **Test Data:** Two distinct products.
- **Steps:** Add product A. Add product B.
- **Expected Outcome:** Header "Basket" count = 2 (two distinct items); "Basket Units" = 2 (one unit each, so far).
- **Business Assertions:** Both metrics reflect two distinct products.
- **Persistence / State Assertions:** N/A.
- **Cleanup:** Remove both items / Clear All; verify empty.
- **Dependencies:** `CAT-001`.
- **Traceability:** Feature Map → Shopping Basket → Negative / Validation Behavior ("two intentionally different metrics"). Evidence: `EV-P2-007`, `D-11`.
- **Notes / Known Limitations:** **Revised in the 2026-09-24 reconciliation:** added the same fresh-page precondition as `BSK-002`, for the same reason (`D-23`). **Revised again in the Pre-Implementation Verification (2026-09-24):** that precondition is removed, for the same reason as in `BSK-002` (`D-36`); the empty-basket precondition is retained.

#### `BSK-004 — Incrementing a basket item's quantity via the Basket-tab stepper increases it correctly`
- **Type:** Positive
- **Priority:** P0
- **Purpose:** Confirms the Basket-tab stepper's increment path, a direct precondition for any multi-unit order.
- **Preconditions:** One product in the basket (`BSK-002`), with available stock of at least 2; the Basket tab rendered from a genuine read (opened for the first time in the page, or refreshed via "🔄 Refresh").
- **Test Data:** The item from `BSK-002`.
- **Steps:** On the Basket tab, click "+" on the item's line.
- **Expected Outcome:** The line's quantity increases by one; its "Subtotal" and the Order Summary update accordingly; "Basket Units" increases by one; the header "Basket" count is unchanged.
- **Business Assertions:** Displayed line quantity equals the pre-click value + 1; subtotal equals price × new quantity.
- **Persistence / State Assertions:** N/A.
- **Cleanup:** Continue toward `BSK-005` or clear the basket.
- **Dependencies:** `BSK-002`.
- **Traceability:** Feature Map → Shopping Basket → Main Workflows. Evidence: `EV-P2-008` (historical), `D-12`.
- **Notes / Known Limitations:** **Revised in the 2026-09-24 reconciliation.** This scenario previously did not specify which of the two steppers it exercised, and carried the note: *"Discovery noted an ordinary render-timing caveat here … flagged as ordinary async latency, not the same deterministic delay bug documented for Zone/Type/Sort."* Re-discovery found the two steppers behave differently: the **Basket-tab** stepper set the requested quantity correctly in 6 of 6 operations (`D-12`), while the **Products-card** stepper applied stale quantities (`D-13`). The "ordinary latency" interpretation of `EV-P2-008` is **CONTRADICTED FROM EXECUTION** for the card stepper, and that behavior is now covered by `BSK-019`. This scenario is scoped to the Basket-tab stepper. Assertions should still be retrying/web-first (Architecture §14.3), never a single immediate read. **Pre-Implementation Verification (2026-09-24):** the card stepper's lost increment did not reproduce (`D-35`), and its display lag was confirmed only as transient. `BSK-019` now asserts the card stepper's correct result; this scenario remains scoped to the Basket-tab stepper.

#### `BSK-005 — Decrementing a basket item's quantity via the Basket-tab stepper decreases it correctly`
- **Type:** Positive
- **Priority:** P1
- **Purpose:** Confirms the Basket-tab stepper's decrement path above the lower bound.
- **Preconditions:** A basket item with quantity ≥ 2, reached with the Basket-tab stepper (`BSK-004`).
- **Test Data:** The item from `BSK-004`.
- **Steps:** On the Basket tab, click "−" on the item's line.
- **Expected Outcome:** The quantity decreases by one; no error occurs; the item remains present; subtotal and Order Summary update.
- **Business Assertions:** Displayed line quantity equals the pre-click value − 1; the item is still present in the basket.
- **Persistence / State Assertions:** N/A.
- **Cleanup:** Remove the item / Clear All; verify empty.
- **Dependencies:** `BSK-004`.
- **Traceability:** Feature Map → Shopping Basket → Negative / Validation Behavior ("a second, independent attempt... succeeded normally with no data loss"). Evidence: `EV-P2-009`, `D-12`, `D-27`.
- **Notes / Known Limitations:** **Revised in the 2026-09-24 reconciliation.** The previous title ended *"(baseline, no intervening navigation)"* and the steps required *"without navigating to the Basket tab in between"*, to avoid the condition hypothesized for the historical `404` anomaly (`U-201`). This scenario now runs on the Basket tab itself; one re-discovery decrement performed after navigating to the Basket tab succeeded normally (`D-27`). The historical anomaly remains covered, as an observation, by `BSK-012`. Decrementing from quantity 1 is a different boundary behavior, covered by `BSK-015`.

#### `BSK-006 — Removing a single basket item works correctly`
- **Type:** Positive
- **Priority:** P1
- **Purpose:** Confirms the dedicated per-item "Remove" control, distinct from decrementing to zero (`BSK-015`).
- **Preconditions:** One or more items in the basket.
- **Test Data:** Any basket item.
- **Steps:** On the Basket tab, click "Remove" on the item.
- **Expected Outcome:** No confirmation is requested. The item is removed from the basket immediately, an alert reading "Item removed from basket" is shown, and the header metrics update accordingly. The product remains in the catalog, and its card shows "ADD" again.
- **Business Assertions:** The removed item is no longer listed; the header count decreases by one; the product is still present in the catalog.
- **Persistence / State Assertions:** N/A.
- **Cleanup:** None if this empties the basket (verify); otherwise continue clearing.
- **Dependencies:** `BSK-002` (or equivalent).
- **Traceability:** Feature Map → Shopping Basket → Main Workflows. Evidence: `EV-P2-011`, `D-17`, `D-18`, `D-29`.
- **Notes / Known Limitations:** **Revised in the 2026-09-24 reconciliation:** added the alert, the absence of a confirmation, and the "product remains in the catalog" assertion. That assertion exists because a seed product once disappeared from the catalog after a basket Remove (`EV-P2-057`, correlation only, causation NOT VERIFIED); in three re-discovery removals the product survived (`D-18`). The alert is transient, so it is a secondary assertion.

#### `BSK-007 — Clear All empties the basket only after native confirmation is accepted`
- **Type:** Positive
- **Priority:** P1
- **Purpose:** Confirms the bulk-clear path, which uses a **native browser `confirm()` dialog** — the same mechanism family as Delete Product, and one that must be explicitly handled to avoid an auto-dismiss false negative (Architecture §16.4) — in both of its outcomes.
- **Preconditions:** Two or more items in the basket (`BSK-003`), all created by this scenario.
- **Test Data:** The items from `BSK-003`.
- **Steps:** Click "🗑️ Clear All" and **dismiss** the native confirmation. Then click "🗑️ Clear All" again and **accept** it. (Exact confirmed dialog text: "Are you sure you want to clear your entire basket?")
- **Expected Outcome:** After dismissing, the basket is unchanged. After accepting, the basket becomes empty, an alert reading "Basket cleared" is shown, header metrics reset to 0, and the products remain in the catalog.
- **Business Assertions:** Dismiss → the same items and quantities remain. Accept → no basket items remain; header "Basket" count and "Basket Units" are both 0.
- **Persistence / State Assertions:** Emptiness is confirmed by a genuine re-read ("🔄 Refresh").
- **Cleanup:** None (already clean).
- **Dependencies:** `BSK-003`.
- **Traceability:** Feature Map → Shopping Basket → Main Workflows. Evidence: `EV-P2-012`, `D-19`, `D-29`.
- **Notes / Known Limitations:** **Revised in the 2026-09-24 reconciliation:** added the dismiss sub-case and the alert. Combined into one scenario because both outcomes belong to the same control and the dismiss step leaves the precondition intact for the accept step. **Clear All empties the entire account basket**, including items added by any other session of the account (`D-22`, `D-31`); the precondition that every item was created by this scenario is what makes its use here safe.

#### `BSK-008 — Basket totals (Subtotal / Order Summary) reflect the current basket contents accurately`
- **Type:** Positive
- **Priority:** P1
- **Purpose:** Confirms the totals shown in the Order Summary panel are a correct, live computation — the value Checkout's confirmation modal will echo back.
- **Preconditions:** Two or more items in the basket with known prices, at least one with quantity > 1 set via the Basket-tab stepper; the Basket tab rendered from a genuine read.
- **Test Data:** A basket populated via `BSK-002`/`BSK-004`. A unit price whose multiple exercises two-decimal rounding is preferred — e.g. $1.15 × 3, observed displayed as "$3.45" (`D-10`).
- **Steps:** Inspect each line's "Subtotal: $X.XX" and the "Order Summary" panel's "N item(s)" and "Total".
- **Expected Outcome:** Each line subtotal equals price × quantity; the displayed total equals the sum of the line subtotals; "N item(s)" equals the number of distinct lines (not the total quantity).
- **Business Assertions:** Displayed subtotals and total match the computed expected values exactly, formatted as "$" with two decimals.
- **Persistence / State Assertions:** N/A.
- **Cleanup:** Clear the basket; verify empty.
- **Dependencies:** `BSK-002` or `BSK-004`.
- **Traceability:** Feature Map → Shopping Basket → Important UI Labels. Evidence: `EV-P2-010` (e.g. "2 × $6.50 = $13.00"); `EV-P2-015` (the same figure echoed in Checkout's confirmation); `D-09`, `D-10`.
- **Notes / Known Limitations:** **Revised in the 2026-09-24 reconciliation:** clarified that "N item(s)" counts distinct lines (`D-09`), added the rounding-sensitive test data (`D-10`), and required a genuine read (`D-23`). No tax, shipping, or discount line was observed (`D-09`); none is asserted.

#### `BSK-019 — Two Products-card "+" clicks, each allowed to complete, raise the basket quantity by two`
- **Type:** Positive
- **Priority:** P2
- **Purpose:** Confirms that the Products-card stepper's increment path, the secondary quantity control distinct from the Basket-tab stepper (`BSK-004`), produces the correct basket quantity. It covers the exact sequence in which a lost increment was historically observed (`D-13`) and asserts the correct result, not the historical defect.
- **Preconditions:** Basket confirmed empty; a temporary product with stock ≥ 3 added with the card's "ADD" (quantity 1).
- **Test Data:** One temporary product, stock ≥ 3.
- **Steps:** On the Products tab, click the card's "+" and allow its basket update to complete. Click the card's "+" again and allow it to complete. Open the Basket tab and allow its basket read to complete; note the line's quantity.
- **Expected Outcome:** The basket holds quantity 3.
- **Business Assertions:** The Basket-tab line shows quantity 3; "Basket Units" is 3.
- **Persistence / State Assertions:** The basket quantity is taken from the Basket tab's own read of the basket, never from the card, which can transiently display the previous quantity (see Notes).
- **Cleanup:** Remove the line; verify the basket is empty; then delete the temporary product.
- **Dependencies:** `BSK-002`.
- **Traceability:** Feature Map → Shopping Basket → Re-discovery Reconciliation. Evidence: `D-35` (2 runs, final quantity 3); historical `D-13` and `EV-P2-008`; observation conditions `D-39`.
- **Notes / Known Limitations:**
  - **Revised in the Pre-Implementation Verification (2026-09-24).** This scenario was the P1 defect-detection scenario *"[Defect] The Products-card stepper can apply a stale quantity to the basket"*, whose Business Assertions were *"After the first "+", the card displays 1; after two card "+" clicks, the basket quantity read after Refresh is 2."* Re-verified with each click allowed to complete, two card "+" clicks reached quantity 3 in both runs (`D-35`); the lost increment is **NOT REPRODUCED**. The scenario therefore asserts the business expectation it already stated (*"each card "+" increases the basket quantity by one, so two consecutive "+" clicks from quantity 1 reach 3"*) and no longer asserts the historical defect. Type changed from Regression / Defect Detection to Positive, and priority from P1 to P2 (§5.2: a secondary UI affordance, since the Basket-tab stepper is the primary quantity control).
  - **Confirmed, not asserted:** immediately after a card "+" has completed, the card can still display the previous quantity until the application's own follow-up read of the basket completes; the card then catches up (`D-35`, 2 runs). This is a transient display, not a basket error. It is not asserted: no requirement governs it, and asserting it would mean asserting inside an in-flight window.
  - **NOT VERIFIED:** whether a card click issued while the previous click's follow-up read is still pending loses an increment. The historical `D-13` runs issued the second click in exactly that state (`D-39`); the verification runs did not. This scenario does not try to create that timing. If a run ever ends at 2, that is a genuine failure to be reported with its request timing, never retried or relaxed (Architecture §14.8 option 1, §16.10).
  - No other scenario in this file may use the Products-card stepper to set up a quantity.

### Boundary / Negative / Business Rule

#### `BSK-014 — A basket quantity cannot be increased beyond the product's available stock`
- **Type:** Boundary
- **Priority:** P1
- **Purpose:** Confirms the upper quantity bound: once the basket quantity equals available stock, "+" is disabled. Partially addresses `U-204` at the UI level.
- **Preconditions:** `CAT-001`; basket confirmed empty; a temporary product with a small known stock (e.g. 3).
- **Test Data:** One temporary product, stock 3.
- **Steps:** Add the product via "ADD". Open the Basket tab. Click the line's "+" until the quantity equals the available stock. Reload the page and locate the product's card.
- **Expected Outcome:** At quantity = stock, the Basket-tab line's "+" is disabled, the quantity stays at the stock value, the line reads "Stock: 3 available", and no message is shown. After a fresh page load, the product card's "+" is also disabled.
- **Business Assertions:** Line quantity equals the available stock; the line's "+" is disabled while its "−" is enabled; the card's "+" is disabled after a fresh load.
- **Persistence / State Assertions:** N/A.
- **Cleanup:** Remove the line; verify the basket is empty; then delete the temporary product.
- **Dependencies:** `CAT-001`; `PM-001` (creation mechanics).
- **Traceability:** Feature Map → Shopping Basket → Re-discovery Reconciliation. Evidence: `D-14`, `D-12`; `EV-P2-010` ("Stock: N available"). Related unknown: `U-204` (partially addressed).
- **Notes / Known Limitations:** Server-side over-stock handling is **NOT VERIFIED** and not asserted — the UI prevents reaching it. The quantity is raised with the Basket-tab stepper, and the card is read only after a fresh load, because the Products-card stepper's state can lag (`BSK-019`).

#### `BSK-015 — Decrementing a basket quantity of 1 removes the line from the basket`
- **Type:** Boundary
- **Priority:** P1
- **Purpose:** Confirms the lower quantity bound: the minimum basket quantity is 1, and decrementing below it removes the line — a second removal path, distinct from "Remove" (`BSK-006`).
- **Preconditions:** Basket confirmed empty; one product added (quantity 1).
- **Test Data:** One product.
- **Steps:** On the Basket tab, click "−" on the line while its quantity is 1.
- **Expected Outcome:** No confirmation is requested. The line is removed, an alert reading "Item removed from basket" is shown, the header count decreases by one, and the product's card shows "ADD" again. The product remains in the catalog.
- **Business Assertions:** The line is absent; the header count decreased by one; the card shows "ADD"; the product is still present in the catalog.
- **Persistence / State Assertions:** N/A.
- **Cleanup:** Verify the basket is empty; delete the temporary product if one was used.
- **Dependencies:** `BSK-002`.
- **Traceability:** Feature Map → Shopping Basket → Re-discovery Reconciliation. Evidence: `D-15`, `D-18`, `D-29`.
- **Notes / Known Limitations:** Observed on the Basket-tab stepper. What the **Products-card** "−" does at quantity 1 is **NOT VERIFIED** and is not asserted.

#### `BSK-016 — A product with zero stock cannot be added to the basket`
- **Type:** Negative / Business Rule
- **Priority:** P2
- **Purpose:** Confirms that an out-of-stock product offers no add-to-basket control.
- **Preconditions:** `CAT-001`; basket confirmed empty; a temporary product created with stock 0 (creation with stock 0 is accepted — `PM-021`).
- **Test Data:** One temporary product, stock 0. No seed product has zero stock.
- **Steps:** Locate the product's card.
- **Expected Outcome:** The card shows a disabled "Out of Stock" button in place of "ADD"; no add control is available for that product.
- **Business Assertions:** "ADD" is absent from the card; "Out of Stock" is present and disabled; the basket remains empty.
- **Persistence / State Assertions:** N/A.
- **Cleanup:** Delete the temporary product.
- **Dependencies:** `PM-021`.
- **Traceability:** Feature Map → Shopping Basket → Re-discovery Reconciliation. Evidence: `D-05`.
- **Notes / Known Limitations:** None.

#### `BSK-021 — When available stock falls below a basket quantity, the basket keeps the higher quantity and offers no way to reduce it except Remove`
- **Type:** Business Rule / Robustness
- **Priority:** P2
- **Purpose:** Records how the basket behaves when a product's available stock is reduced below the quantity already in the basket — a state the stock cap (`BSK-014`) cannot prevent, because the stock changes after the item was added.
- **Preconditions:** Basket confirmed empty; a temporary product with stock 3.
- **Test Data:** One temporary product, stock 3, later edited to stock 1 (a product this scenario owns — never a seed product).
- **Steps:** Add the product and raise its quantity to 3 with the Basket-tab stepper. Edit the product's stock to 1 through Edit Product. Open the Basket tab and allow its basket read to complete; inspect the line. Click the line's "−" once and inspect the alert immediately. Click "🔄 Refresh"; inspect the line. **Do not click "📦 Place Order".**
- **Expected Outcome (currently observed application behavior):** Once the Basket tab's read has completed, the line reads "Stock: 1 available" with quantity 3 and a subtotal of 3 × price, and no over-stock warning is shown on the line or in the Order Summary. "+" is disabled. "📦 Place Order" is visible and enabled. Clicking "−" leaves the quantity at 3 and shows the error alert "Cannot add more than 1 units (only 1 in stock)". After "🔄 Refresh" the quantity is still 3. "Remove" still removes the line.
- **Business Assertions:** After the tab's read, line stock reads 1 while the quantity reads 3; "+" is disabled; "📦 Place Order" is visible and enabled; after "−", the alert reads exactly "Cannot add more than 1 units (only 1 in stock)" and the quantity stays at 3; "Remove" empties the basket.
- **Persistence / State Assertions:** The "−" sends no basket update (passive request observation, Architecture §15.2), and a genuine re-read ("🔄 Refresh") after it still shows quantity 3. The reduced stock is displayed from the Basket tab's own read; a Refresh is not needed for it to appear (`D-37`).
- **Cleanup:** Remove the line; verify the basket is empty; then delete the temporary product.
- **Dependencies:** `BSK-014`; `PM-011`/`PM-012` (Edit mechanics).
- **Traceability:** Feature Map → Shopping Basket → Re-discovery Reconciliation. Evidence: `D-24`, `D-37`; observation conditions `D-39`. Related: `U-204`.
- **Notes / Known Limitations:**
  - **Observed in two runs across two passes** (`D-24`, `D-37`). The input condition is fully specified, so the scenario is designed as implementation-ready; if its first implementation run does not reproduce any element, it returns to Test Design rather than being silently relaxed.
  - **Not classified as a defect.** No requirement or evidence defines how the basket should treat a quantity above available stock. The enabled "−" that refuses to decrease the quantity, and an alert worded as an add limit although the user decreased the quantity, are recorded as observed anomalies; whether the basket should cap, warn, or block checkout is a business question.
  - The alert text, including "1 units", is asserted as the confirmed current copy, not corrected (Architecture §3.4, as with `BSK-001`'s "marketping"); its number is this scenario's edited stock value. The alert is transient, so it is read immediately after the click, as a secondary assertion.
  - **Revised in the Pre-Implementation Verification (2026-09-24).** The Expected Outcome previously read *"After Refresh, the line reads "Stock: 1 available" … Clicking "−" produces no change and no message."*, and the Persistence / State Assertions read *"The reduced stock appears only after a genuine re-read — before Refresh the line still showed the previous stock (`D-24`)."* Re-verified with request-level synchronization, the "−" showed the error alert immediately, so the historical "no message" is **CONTRADICTED**; the historical probe read the alert only after its display window had passed (`D-39`). The reduced stock was already shown after the Basket tab's own read, so the historical Refresh requirement is **NOT REPRODUCED** (`D-37`). The confirmed elements are unchanged: the quantity above stock, "+" disabled, "📦 Place Order" enabled, "−" leaving the quantity unchanged, and "Remove".
  - What "📦 Place Order" does with this basket belongs to Checkout and is **NOT VERIFIED**.
  - The product's card showed its edited stock one edit behind while it was in the basket (`D-25`) — a cross-feature observation, not asserted here.

### Persistence

#### `BSK-009 — Basket contents persist across navigation to another tab and back`
- **Type:** Persistence
- **Priority:** P1
- **Purpose:** Confirms basic within-session persistence as the simplest of the confirmed persistence guarantees.
- **Preconditions:** One or more items in the basket; the Basket tab rendered from a genuine read.
- **Test Data:** A populated basket.
- **Steps:** From the Basket tab, navigate to the Orders tab, then the Products tab, then back to Basket — making no basket change in between.
- **Expected Outcome:** The basket's contents are unchanged.
- **Business Assertions:** Same items/quantities present after the round trip.
- **Persistence / State Assertions:** Basket state survives tab switching.
- **Cleanup:** Clear the basket; verify empty.
- **Dependencies:** A populated basket.
- **Traceability:** Feature Map → Shopping Basket → Persistence. Evidence: `EV-P2-013` (historical general basis), `D-20` (direct).
- **Notes / Known Limitations:** **Revised in the 2026-09-24 reconciliation:** direct evidence added (`D-20`) and the route made explicit. No basket change is made between tab switches, which keeps this scenario distinct from `BSK-020` (an add made while away from an already-rendered Basket tab).

#### `BSK-010 — Basket contents persist correctly across logout and login (account-scoped, not local)`
- **Type:** Persistence / Business Rule
- **Priority:** P0
- **Purpose:** Confirms the basket is genuinely **account-scoped server-side data**, not local/browser session state — a foundational architectural fact this whole feature's isolation design depends on.
- **Preconditions:** One or more items in the basket.
- **Test Data:** A populated basket (a modest, identifiable item).
- **Steps:** Log out. Log back in. Open the Basket tab.
- **Expected Outcome:** The same basket contents from before logout are present after login.
- **Business Assertions:** Same items/quantities present after the logout/login cycle.
- **Persistence / State Assertions:** Basket state survives session invalidation and re-establishment.
- **Cleanup:** Clear the basket after verification.
- **Dependencies:** A populated basket; must run within the isolated, disposable-session context per Architecture §8.4 (since it necessarily performs a logout).
- **Traceability:** Feature Map → Shopping Basket → Persistence; → Cross-Feature Business Journeys, Journey 2. Evidence: `EV-P2-013` (`CONFIRMED FROM EXECUTION`).
- **Notes / Known Limitations:**
  - This scenario and `journeys.md`'s `JRN-002` describe the same underlying fact; this is the Basket-feature-owned version, kept for completeness of this file's own persistence coverage, while `JRN-002` frames it explicitly as a cross-feature (Authentication ↔ Basket) integration journey. See `journeys.md` for how duplication is avoided.
  - **2026-09-24 reconciliation:** unchanged. Logout/login was deliberately **not** re-run during re-discovery (to protect the shared authenticated session), so this scenario rests on `EV-P2-013` alone. Re-discovery found the account scoping consistent from another direction — a second browser session of the same account saw the same basket (`D-22`, `BSK-018`).

#### `BSK-017 — Basket contents persist across a full page reload`
- **Type:** Persistence
- **Priority:** P1
- **Purpose:** Confirms the reload-persistence guarantee — the part of the reload behavior that historical and current evidence agree on. Reload persistence was previously carried only inside the defect scenario `BSK-011`, which is now deferred.
- **Preconditions:** Basket populated with two distinct lines, at least one with quantity > 1 set via the Basket-tab stepper.
- **Test Data:** A populated basket.
- **Steps:** Note the lines and quantities. Reload `/market.html`. Wait until the catalog has rendered. Open the Basket tab (its first render in the reloaded page).
- **Expected Outcome:** The same lines, quantities and subtotals are listed.
- **Business Assertions:** Same product names, quantities and subtotals as before the reload.
- **Persistence / State Assertions:** The first Basket-tab render after a reload is a genuine re-read of server state (`EV-P2-014`: the basket request after reload returned the correct, non-empty data; `D-21`).
- **Cleanup:** Clear the basket; verify empty.
- **Dependencies:** A populated basket.
- **Traceability:** Feature Map → Shopping Basket → Persistence. Evidence: `EV-P2-014` (server-data portion), `D-21`.
- **Notes / Known Limitations:** Deliberately asserts only the basket **contents**. Whether the header/stats **display** is correct immediately after a reload is contested (`EV-P2-014` vs `D-21`) and remains with `BSK-011`. The stats briefly read 0 / $0.00 before the catalog renders (`D-21`), so no header read is taken before the catalog has rendered.

#### `BSK-018 — The basket is shared by every browser session of the same account`
- **Type:** Persistence / Business Rule
- **Priority:** P2
- **Purpose:** Confirms account scoping without a logout: a second browser session authenticated as the same account sees the same basket, and "🔄 Refresh" brings one session's view up to date with changes made in the other. Complements `BSK-010` (which needs a logout and a live login) and gives "🔄 Refresh" its own coverage.
- **Preconditions:** Two browser sessions authenticated as the same account; basket confirmed empty.
- **Test Data:** One product.
- **Steps:** In session 1, add the product. In session 2, open the Basket tab. In session 2, increment the line with the Basket-tab "+". In session 1, open the Basket tab and click "🔄 Refresh".
- **Expected Outcome:** Session 2 lists the product added in session 1. After "🔄 Refresh", session 1 shows the quantity set in session 2.
- **Business Assertions:** Session 2 shows the product at quantity 1; after Refresh, session 1 shows quantity 2.
- **Persistence / State Assertions:** Basket state is shared across browser sessions of one account.
- **Cleanup:** Clear the basket from one session; verify empty in both via "🔄 Refresh".
- **Dependencies:** `BSK-002`.
- **Traceability:** Feature Map → Shopping Basket → Re-discovery Reconciliation. Evidence: `D-22`; `EV-P2-013` (account scoping).
- **Notes / Known Limitations:** A session's view is **not** updated live when the other session changes the basket (`D-22`). That absence is recorded but not asserted — no requirement for live updates exists. This shared-across-sessions property is why browser-context isolation does not isolate basket tests.

#### `BSK-020 — A product added from the Products tab is listed when a Basket tab already rendered earlier in the page session is reopened`
- **Type:** Positive / Persistence
- **Priority:** P1
- **Purpose:** Confirms that an add made from the Products tab is reflected in the Basket tab even when that tab was already rendered earlier in the same page session, which is the condition under which a stale Basket tab was historically observed (`D-23`).
- **Preconditions:** Basket confirmed empty; in the current page session the Basket tab has been opened at least once (its read completed, showing the empty basket), and the Products tab re-selected.
- **Test Data:** One temporary product.
- **Steps:** Click "ADD" on the product's card and allow the add to complete. Open the Basket tab and allow its basket read to complete; inspect it. Click "🔄 Refresh"; inspect it again.
- **Expected Outcome:** Once the Basket tab's read has completed, the product is listed with quantity 1. After "🔄 Refresh", the listing is unchanged.
- **Business Assertions:** The product is listed with quantity 1 after the tab's own read, and still with quantity 1 after Refresh.
- **Persistence / State Assertions:** The add survives the switch from Products to an already-rendered Basket tab; the explicit Refresh confirms the displayed listing against a genuine re-read (Architecture §14.6).
- **Cleanup:** Remove the line; verify the basket is empty; then delete the temporary product.
- **Dependencies:** `BSK-002`.
- **Traceability:** Feature Map → Shopping Basket → Re-discovery Reconciliation. Evidence: `D-36` (2 runs); `D-04`; historical `D-23`; observation conditions `D-39`.
- **Notes / Known Limitations:**
  - **Revised in the Pre-Implementation Verification (2026-09-24).** This scenario was the P1 defect-detection scenario *"[Defect] An already-rendered Basket tab does not show a product just added from the Products tab until Refresh"*, whose Expected Outcome was *"Before Refresh, the Basket tab does not list the newly added product … After Refresh, the product is listed with quantity 1."* Re-verified with the Basket tab's own read allowed to complete, the product was already listed before Refresh, and Refresh changed nothing (`D-36`, 2 runs); the historical stale state was observed while the tab's read was still in flight (`D-39`). `D-23` is **NOT REPRODUCED**, so the stale-state assertion is removed and the scenario asserts the correct behavior. Type changed from Regression / Defect Detection to Positive / Persistence; priority unchanged.
  - The already-rendered precondition is kept because it is this scenario's subject, the one condition that distinguishes it from `BSK-002` and `D-04` (a first render), not to reproduce the historical staleness. The Basket tab is never inspected before its own read completes.
  - The historical single occurrence of the header badge staying at "🛒 Basket 0" after the add (`D-23`) did not recur (`D-36`: badge 1 in both runs). It is not asserted.

### Exploratory / Deferred Verification

#### `BSK-011 — [Deferred] Whether the header/stats display stays at zero after a full reload (historical defect, not reproduced)`
- **Type:** Exploratory / Deferred Verification
- **Priority:** P3
- **Purpose:** Preserves a historically confirmed staleness defect whose reproduction status is now contested, so that it is neither asserted without support nor lost.
- **Preconditions:** One or more items in the basket, confirmed present server-side.
- **Test Data:** A populated basket.
- **Steps:** Reload `/market.html`. After the catalog has rendered, and **without** opening the Basket tab, record the header "Basket" count and "Basket Units". Then open the Basket tab and record its contents.
- **Expected Outcome:** **Not asserted.** Recorded so the header/stats display after a reload can be compared with the basket's real contents.
- **Business Assertions:** None enforced.
- **Persistence / State Assertions:** The basket's contents after reload are asserted by `BSK-017`, not here.
- **Cleanup:** Clear the basket; verify empty.
- **Dependencies:** A populated basket.
- **Traceability:** Feature Map → Shopping Basket → Negative / Validation Behavior. Evidence: `EV-P2-014` (`CONFIRMED FROM EXECUTION`, one occurrence); `D-21` (not reproduced, one occurrence).
- **Notes / Known Limitations:**
  - **Deferred in the 2026-09-24 reconciliation.** This scenario was an implementation-ready P1 defect-detection scenario titled *"[Defect] Header/stats display remains stuck at zero immediately after a full reload, despite correct server data"*, whose Expected Outcome was *"The header/stat display reads 0 / stale, even though the basket's real server-side contents are correct and non-empty."* Re-discovery did **not** reproduce this: the stats briefly read 0 / $0.00 at page load, then showed the correct values once the catalog rendered, without the Basket tab being opened (`D-21`). With one observation on each side, neither overrides the other; the historical evidence is preserved and the scenario is not asserted.
  - **Required future evidence:** repeated reload observations. If the stale header reproduces under an identifiable condition, this scenario returns to defect detection under that condition. If it does not, the record stands as a historical, non-reproducing observation.
  - The brief 0 / $0.00 at page load (`D-21`) is the pre-render state and must not be mistaken for this defect.
  - `order-lifecycle.md` cites this scenario as a member of the staleness-defect family; that reference stays traceable to this ID.

#### `BSK-012 — [Defect, observed occurrence only] A basket decrement following intervening Basket-tab navigation once returned a 404 with a misleadingly empty basket display`
- **Type:** Regression / Defect Detection / Exploratory / Deferred Verification (the occurrence is confirmed; its trigger condition, `U-201`, is not — see Notes)
- **Priority:** P3
- **Purpose:** Carefully documents a confirmed, but only-once-directly-observed, anomaly — **without** asserting its unconfirmed trigger condition as a reliable pass/fail contract, per the explicit instruction not to state the unresolved cause as expected behavior.
- **Preconditions:** A basket item with quantity ≥ 2; the Basket tab has been navigated to and away from at least once beforehand (the condition Discovery's one occurrence happened to involve).
- **Test Data:** One basket item, quantity ≥ 2.
- **Steps:** Navigate to the Basket tab (issuing its own basket read), navigate away, then return and decrement the item's quantity using the **Basket-tab line's** "−" (the control the historical occurrence involved).
- **Expected Outcome:** **Not asserted as reliably reproducible.** This scenario's purpose is to observe and record whether the decrement succeeds normally (as `BSK-005` confirms it usually does) or produces the confirmed anomaly (a `404` from the decrement request and a basket that visually appears empty with no user-facing error).
- **Business Assertions:** If the anomaly occurs: no error is visibly shown to the user (matching the confirmed silent-failure pattern), **and** a subsequent genuine re-read (Basket tab reload) is used to confirm whether the item actually survived — per `BSK-013`'s clarification, an apparently "empty" basket display immediately after this anomaly must **not** be taken at face value as real data loss without that further check.
- **Persistence / State Assertions:** See `BSK-013`.
- **Cleanup:** Verify actual basket contents via a genuine re-read before deciding what, if anything, needs clearing.
- **Dependencies:** None beyond a populated basket.
- **Traceability:** Feature Map → Shopping Basket → Negative / Validation Behavior. Evidence: `EV-P2-009` (the original occurrence — one data point, condition-dependent, trigger **not** confirmed, `U-201`); `D-27` (one further attempt, not reproduced).
- **Notes / Known Limitations:**
  - This scenario is deliberately **not** a P0/P1 deterministic regression scenario like `FIL-017`, because — unlike the filter delay — this anomaly was observed only once and its trigger condition is explicitly unconfirmed (`U-201`). It is retained as a lower-priority, honestly scoped observation scenario rather than promoted into an assertion the evidence does not support. **This scenario must never be designed or extended into a destructive experiment that deliberately risks corrupting real basket data** — it observes a specific, already-once-seen condition; it does not go hunting for new ways to break the basket.
  - **2026-09-24 reconciliation:** the Steps now name the Basket-tab line's stepper (previously unspecified). One re-discovery decrement made after navigating to the Basket tab succeeded normally (`D-27`) — one data point against the hypothesized trigger, not a contradiction of the historical occurrence. Priority aligned from P2 to P3 per §5.2, since the scenario is Exploratory/Deferred and therefore not implementation-ready (§9).

#### `BSK-013 — [Clarification, confirmed] An apparently emptied basket display following the 404 anomaly does not necessarily reflect real data loss`
- **Type:** Regression / Persistence / Exploratory / Deferred Verification (conditional on `BSK-012`)
- **Priority:** P3
- **Purpose:** Encodes the important later clarification Discovery obtained: the original "basket wiped" finding (`BSK-012`) was substantially reassessed once the same item was later found still fully and correctly present. This scenario exists specifically so a future implementation does not treat `BSK-012`'s empty-display observation as proof of server-side deletion.
- **Preconditions:** The condition in `BSK-012` has just been observed (an apparently empty basket display after a decrement).
- **Test Data:** The same item involved in `BSK-012`.
- **Steps:** After observing an apparently empty basket display, perform a genuine re-read (e.g. reload, or "🔄 Refresh").
- **Expected Outcome (as clarified by later evidence):** The item that appeared "wiped" is found still fully and correctly present — the original empty-basket appearance was **display-only staleness**, not an actual server-side deletion.
- **Business Assertions:** The item is present with its correct quantity after the genuine re-read, even if the immediately prior display showed it as absent.
- **Persistence / State Assertions:** This is the authoritative persistence check for the `BSK-012` condition — do not conclude data loss from the display alone.
- **Cleanup:** Clear the basket once the true state is confirmed.
- **Dependencies:** `BSK-012`.
- **Traceability:** Feature Map → Shopping Basket → Negative / Validation Behavior ("Later re-examination substantially clarified this bug's real effect"). Evidence: `EV-P2-034`, `EV-P2-057`. Related unknown: `U-209` (substantially, but not completely, resolved by this evidence — see `EVIDENCE-LOG.md`'s own cross-reference).
- **Notes / Known Limitations:**
  - Do not overstate this scenario's finding beyond its evidenced scope — the basket-wipe *display* is confirmed misleading; this does not retroactively prove every possible basket anomaly is display-only, only the specific case captured here.
  - **Deferred in the 2026-09-24 reconciliation.** Its precondition is `BSK-012`'s anomaly, which cannot be induced on demand (`U-201`, `D-27`), so this scenario cannot run on its own. It was previously typed "Regression / Persistence" at P2 and is now deferred with `BSK-012`, at P3. Its Expected Outcome is unchanged. The re-discovery finding that removing a basket line did not delete the catalog product (`D-18`) concerns a different action and does not bear on this scenario.

## Open Questions (NOT VERIFIED)

These remain unresolved and are not encoded anywhere in this file as expected behavior:

1. Whether the basket persists across logout/login today — not re-run during re-discovery; `BSK-010` rests on `EV-P2-013`.
2. What "📦 Place Order" does, including with a basket whose quantity exceeds available stock (`BSK-021`) — Checkout's scope.
3. Server-side handling of a quantity above available stock (`U-204`, residual).
4. How a basket line behaves when its product is deleted.
5. The trigger conditions and mechanisms behind `D-25` and `D-26`; and whether the historical `D-13` and `D-23` behaviors reproduce under any condition (neither reproduced with request-level synchronization, `D-35`, `D-36`).
6. Whether a Products-card click issued while the previous click's follow-up basket read is still pending loses an increment (the historical `D-13` timing, `D-39`; not exercised in `D-35`). The card display itself was confirmed to catch up once that read completes (`D-35`).
7. What the Products-card "−" does at quantity 1.
8. Whether the header badge staying at "🛒 Basket 0" after an add (`D-23`, one historical occurrence) is reproducible; it did not recur in `D-36` (2 runs).
9. The trigger for the historical `404` decrement anomaly (`U-201`).
10. Whether the historical header-stuck-at-zero reload defect (`EV-P2-014`) reproduces under any condition (`BSK-011`).
11. The rule governing basket line order (`D-28`).
12. The identity of the other actor using the account (`D-31`) — deliberately not investigated.

## Scenario Count

21 scenarios (`BSK-001`–`BSK-021`): 9 Positive (`BSK-001`–`BSK-008`, `BSK-019`) + 4 Boundary / Negative / Business Rule (`BSK-014`, `BSK-015`, `BSK-016`, `BSK-021`) + 5 Persistence (`BSK-009`, `BSK-010`, `BSK-017`, `BSK-018`, `BSK-020`) + 3 Exploratory / Deferred Verification (`BSK-011`, `BSK-012`, `BSK-013`) = **21**. Of these, **18 are implementation-ready** and **3 are deferred**; none was removed.

> **Reconciliation history.** Before the 2026-09-24 reconciliation this line read: *"13 scenarios (`BSK-001`–`BSK-013`): 8 Positive, 3 Persistence (one also Business Rule), 2 Regression/Defect Detection. No dedicated Boundary/Validation section — Discovery evidence does not support quantity-boundary scenarios (`U-204` … was never tested and is not fabricated here)."* Re-discovery supplied execution evidence for the stock cap (`D-14`), removal at zero (`D-15`), zero-stock products (`D-05`) and stock falling below a basket quantity (`D-24`), so a Boundary section now exists. `BSK-011` was deferred, and `BSK-012`/`BSK-013` were made explicitly deferred (`BSK-012`'s Type already included "Exploratory / Deferred Verification"; `BSK-013` depends on it). No ID was renumbered, reused, or retired.

> **Pre-Implementation Verification (2026-09-24).** This line previously read: *"… 8 Positive (`BSK-001`–`BSK-008`) … + 4 Persistence (`BSK-009`, `BSK-010`, `BSK-017`, `BSK-018`) + 2 Regression / Defect Detection (`BSK-019`, `BSK-020`) …"*. `BSK-019` became Positive and `BSK-020` Positive / Persistence after their defects did not reproduce (`D-35`, `D-36`); the Regression / Defect Detection section was left empty and removed. The totals are unchanged, and no ID was renumbered, reused or retired.
