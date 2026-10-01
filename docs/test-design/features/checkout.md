# Feature: Checkout / Order Creation

[← Back to Test Design master](../TEST-DESIGN.md)

## Feature Overview

**Purpose:** Converts the current basket contents into a persisted order in a single action — there is no separate address, shipping, or payment step anywhere in this flow.

**Business scope:** The "Place Order" action, the confirmation modal's exact content, basket emptying, stock consumption, and the created order's visibility in Orders Management.

**Authentication:** Required (inherits from Shopping Basket).

**Entry point:** Basket tab — `📦 Place Order` button (in the "Order Summary" panel).

**Dependencies:** Hard-depends on Shopping Basket (a non-empty basket is required). Feeds directly into Orders Management.

## Coverage Scope

Covered: checkout prerequisites, successful order placement, the exact confirmed confirmation-modal content, basket-emptying as a side effect, stock consumption as a confirmed, non-reversed side effect, and the created order's immediate visibility in Orders Management.

**Explicitly not covered here:** any payment, address, or shipping workflow — Discovery confirmed **none exists anywhere in this application** (`EV-P2-015`); this Test Design does not invent one to test. Also not covered: Order Lifecycle status transitions (`order-lifecycle.md`) or Orders list/delete mechanics (`orders.md`) beyond the immediate post-checkout visibility check.

## Preconditions

- Authenticated session; a non-empty basket.
- **Every step in this file that reads the basket must use a fresh read of it**: the Basket tab opened with its own basket read allowed to complete, or refreshed with "🔄 Refresh" (Feature Map → Shopping Basket → Re-discovery Reconciliation, `D-38`). A view rendered earlier does not update when another session of the account changes the basket (`D-22`). (An earlier reconciliation also cited a stale Basket tab after an add from the Products tab, `D-23`; that was not reproduced once the tab's own read had completed — `basket.md` → `BSK-020`, `D-36`.) This precondition adds no new Checkout behavior; it only prevents a scenario from reading a stale basket.

## Test Data Requirements

| Kind | Detail |
|---|---|
| **Existing/seed data** | Not used for the ordered product in any scenario here — see the ownership note below. |
| **Temporary/generated data** | **Every scenario in this file orders a self-created temporary product**, per Architecture §10.7/§11.4: checkout permanently consumes stock, and order deletion does not restore it (`EV-P2-020`). Ordering a seed product would permanently and irreversibly deplete real shared inventory; ordering a disposable, self-created product confines that irreversible consumption to data the scenario itself then deletes entirely. |
| **Ownership** | The ordered product belongs to the scenario that created it; the resulting order belongs to the same scenario/lifecycle group. |
| **Cleanup requirement** | The created order must be deleted via Orders Management (`orders.md`'s `ORD-` deletion scenario) as this file's checkout scenarios' downstream obligation; the product that was ordered must also be deleted via Product Management. Stock consumed by the order is **not** recoverable by any UI action — this is disclosed as residual, expected, contained impact (confined to disposable data), not hidden. |

## Scenarios

### Positive

#### `CHK-001 — Placing an order from a non-empty basket succeeds`
- **Type:** Positive
- **Priority:** P0
- **Purpose:** Confirms the single most central action in the entire application — the purpose the Market app exists to support.
- **Preconditions:** A non-empty basket containing a self-created temporary product (Architecture §10.7).
- **Test Data:** One temporary product (created via `PM-001`), added to the basket (`BSK-002`).
- **Steps:** Open the Basket tab with a fresh read of the basket (see Preconditions). Click "📦 Place Order".
- **Expected Outcome:** A success confirmation is shown; an order is created.
- **Business Assertions:** The confirmation modal appears with a real order number.
- **Persistence / State Assertions:** N/A here (see `CHK-005`).
- **Cleanup:** See `CHK-004` (basket) and downstream `orders.md`/`product-management.md` scenarios (order and product deletion).
- **Dependencies:** `PM-001`, `BSK-002`.
- **Traceability:** Feature Map → Checkout / Order Creation → Main Workflows. Evidence: `EV-P2-015`.
- **Notes / Known Limitations:** None.

#### `CHK-002 — The order confirmation modal displays the exact confirmed content`
- **Type:** Positive
- **Priority:** P1
- **Purpose:** Confirms the specific, confirmed confirmation-modal content — a concrete contract for what the user (and any future assertion) can rely on.
- **Preconditions:** `CHK-001`.
- **Test Data:** Same as `CHK-001`.
- **Steps:** Inspect the confirmation modal immediately after order placement.
- **Expected Outcome:** The modal shows exactly: heading `✅ Order Placed Successfully!`, an "Order Number" (e.g. format like `O28634`), a "Total Amount" matching the basket's subtotal, one line item per basket product, showing `{Product} × {qty}` and its line amount `${price}` as two separate parts (no dash between them; reconciled 2026-09-28 against the rendered markup, Architecture §13.9), and both `View Orders` and `Continue Shopping` controls.
- **Business Assertions:** Order Number is present and well-formed; Total Amount equals the pre-checkout basket subtotal (per `BSK-008`); line items match the basket's contents exactly.
- **Persistence / State Assertions:** N/A.
- **Cleanup:** Dismiss via "Continue Shopping" or "View Orders" (either is a valid, non-destructive close).
- **Dependencies:** `CHK-001`.
- **Traceability:** Feature Map → Checkout / Order Creation → Main Workflows; → Important UI Labels. Evidence: `EV-P2-015`.
- **Notes / Known Limitations:** None.

#### `CHK-003 — No payment, address, or shipping step exists anywhere in the checkout flow`
- **Type:** Negative / Business Rule
- **Priority:** P2
- **Purpose:** Documents a confirmed **absence** — checkout is functionally identical to "place order," a single click from the basket, with no intermediate step of any kind. This is stated as a confirmed absence, not an untested gap, and this scenario exists to keep that fact explicit and regression-checkable (e.g. if a future application change silently adds an intermediate step, this scenario would catch it).
- **Preconditions:** A non-empty basket.
- **Test Data:** Same pattern as `CHK-001`.
- **Steps:** From a non-empty basket, click "📦 Place Order".
- **Expected Outcome:** The order confirmation modal appears **immediately**, with no intervening address, shipping-method, or payment-detail screen of any kind.
- **Business Assertions:** No payment/address/shipping UI is ever rendered between clicking "Place Order" and the confirmation modal appearing.
- **Persistence / State Assertions:** N/A.
- **Cleanup:** Same as `CHK-001`.
- **Dependencies:** `PM-001`, `BSK-002`.
- **Traceability:** Feature Map → Checkout / Order Creation → Negative / Validation Behavior. Evidence: `EV-P2-015`.
- **Notes / Known Limitations:** None.

### State

#### `CHK-004 — Placing an order empties the basket`
- **Type:** Positive / State
- **Priority:** P1
- **Purpose:** Confirms the basket-emptying side effect of a successful checkout.
- **Preconditions:** `CHK-001`.
- **Test Data:** Same as `CHK-001`.
- **Steps:** After order placement, dismiss the confirmation and open the Basket tab.
- **Expected Outcome:** The basket is empty.
- **Business Assertions:** No basket items remain; header "Basket" count and "Basket Units" are both 0.
- **Persistence / State Assertions:** N/A.
- **Cleanup:** None (basket is already empty as a direct consequence).
- **Dependencies:** `CHK-001`.
- **Traceability:** Feature Map → Checkout / Order Creation → State Changes. Evidence basis: consistent pattern observed across every post-checkout basket state throughout Discovery (Feature Map, Checkout → State Changes).
- **Notes / Known Limitations:** Feature Map records this as observed consistently rather than as one dedicated evidence entry — this scenario's priority (P1, not P0) reflects that slightly softer evidentiary basis compared to `CHK-001`/`CHK-002`'s directly-cited entries.

#### `CHK-005 — Placing an order decrements the ordered product's stock`
- **Type:** Business Rule
- **Priority:** P0
- **Purpose:** Confirms the confirmed, consequential stock-consumption business rule — the fact that drives this entire file's self-created-product-only data policy.
- **Preconditions:** `CHK-001`, using a temporary product with a known starting stock value.
- **Test Data:** The temporary product from `CHK-001`, with its stock value noted before checkout.
- **Steps:** Note the product's stock before checkout. Place the order. Check the product's stock afterward (via its catalog card or View Details).
- **Expected Outcome:** The product's stock decreases by exactly the ordered quantity.
- **Business Assertions:** Post-order stock = pre-order stock − ordered quantity.
- **Persistence / State Assertions:** Stock consumption is confirmed to persist (it is not reversed by later deleting the order — see `orders.md`).
- **Cleanup:** Delete the order and the product afterward (the product's remaining stock is irrelevant once the product itself is deleted).
- **Dependencies:** `CHK-001`.
- **Traceability:** Feature Map → Checkout / Order Creation → State Changes. Evidence: `EV-P2-020` (`CONFIRMED FROM EXECUTION`).
- **Notes / Known Limitations:** This scenario is **why** every scenario in this file orders a self-created, disposable product rather than a seed one — see Architecture §10.7.

#### `CHK-006 — The newly created order is immediately visible in Orders Management`
- **Type:** Positive / Persistence
- **Priority:** P0
- **Purpose:** Confirms the direct hand-off from Checkout to Orders Management — the order actually exists as a durable record, not just a transient confirmation screen.
- **Preconditions:** `CHK-001`.
- **Test Data:** Same as `CHK-001`; the Order Number shown in the confirmation.
- **Steps:** After order placement, navigate to the "📦 Orders" tab.
- **Expected Outcome:** The newly placed order appears in "My Orders", identified by the same Order Number shown in the confirmation modal.
- **Business Assertions:** An order row with the matching Order Number is present in the Orders list.
- **Persistence / State Assertions:** The order is a genuine, durable server-side record, not a client-only confirmation artifact.
- **Cleanup:** Delete the order (see `orders.md`).
- **Dependencies:** `CHK-001`, `CHK-002`.
- **Traceability:** Feature Map → Cross-Feature Business Journeys → Journey 1; → Checkout / Order Creation → Persistence. Evidence: `EV-P2-015` → `EV-P2-016` (the specific newly-placed order O28634 observed in Orders).
- **Notes / Known Limitations:** This scenario and `journeys.md`'s `JRN-001` both touch the Checkout→Orders hand-off; this one is scoped narrowly to the immediate-visibility fact, while `JRN-001` covers the full Catalog→...→Orders chain as one integration journey — see `journeys.md` for the explicit non-duplication note.

### Exploratory / Deferred Verification

#### `CHK-007 — [Deferred] Checkout behavior with an empty basket or a quantity exceeding available stock`
- **Type:** Exploratory / Deferred Verification
- **Priority:** P3
- **Purpose:** Records that neither an empty-basket checkout attempt nor an over-stock order attempt was ever tested in Discovery.
- **Preconditions:** Either an empty basket, or a basket with a quantity exceeding the ordered product's available stock.
- **Test Data:** For the over-stock case, a temporary product with a small, known stock value and a basket quantity deliberately exceeding it.
- **Steps:** Attempt "📦 Place Order" under each condition.
- **Expected Outcome:** **Not asserted.** Recorded to observe actual behavior so the relevant open question (part of the general `U-204` stock-boundary gap) can be closed with real evidence.
- **Business Assertions:** None enforced.
- **Persistence / State Assertions:** N/A.
- **Cleanup:** Clean up any order or product state resulting from the observation.
- **Dependencies:** None beyond the ability to construct the described precondition.
- **Traceability:** Feature Map → Checkout / Order Creation → Known Unknowns. Related unknown: `U-204` (general stock-boundary gap; no dedicated ID exists specifically for checkout-time boundary behavior, per the Feature Map's own note).
- **Notes / Known Limitations:** The empty-basket sub-case is additionally constrained by the fact that "Place Order" is only reachable from within the Basket tab's Order Summary panel, which itself may not render meaningfully with zero items — this scenario should first confirm the control is even reachable in that state before attempting to click it.

## Scenario Count

7 scenarios (`CHK-001`–`CHK-007`): 3 Positive/Negative (core flow + confirmed absence), 3 State/Business Rule/Persistence, 1 Exploratory/Deferred Verification.
