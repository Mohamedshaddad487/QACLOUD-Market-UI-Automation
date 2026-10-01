# Feature: Orders Management

[← Back to Test Design master](../TEST-DESIGN.md)

## Feature Overview

**Purpose:** Lists, inspects, and permits deletion of the account's orders (both system-pre-existing and self-created).

**Business scope:** The "My Orders" list, expand/collapse, order contents (identifiers, items, totals, status display), Delete Order with its custom in-page confirmation, and post-delete/reload persistence.

**Authentication:** Required (inherits from Checkout / Order Creation).

**Entry point:** Header "📦 Orders" tab.

**Dependencies:** Checkout / Order Creation (source of orders). Hosts Order Lifecycle as a nested sub-capability.

## Coverage Scope

Covered: the order list and its collapsible rows, order detail contents (identifiers, items, totals, status display), Delete Order's confirmation flow and its custom-modal mechanism (distinct from Product/Basket's native dialogs), deletion persistence, and visibility of newly created orders.

**Explicitly not covered here:** the Status dropdown's transition rules and the Delivered-locking business rule (`order-lifecycle.md`) — this file treats status only as a **displayed field** on an order row, not as a state machine to be exercised.

## Preconditions

- Authenticated session.
- At least one order exists. **One pre-existing seed order (O62676, status Delivered; O52638 in the account used before 2026-09-30) is present in the account and must be treated as strictly read-only** — per Architecture §10.6, it is never deleted, never status-changed, and never used as the subject of any mutating scenario in this file.

## Test Data Requirements

| Kind | Detail |
|---|---|
| **Existing/seed data** | The one pre-existing order (O62676) — used **only** as a read-only subject for list/detail-viewing scenarios (`ORD-001`–`ORD-003`), identified by its own order number, never mutated. |
| **Temporary/generated data** | Deletion scenarios (`ORD-004`–`ORD-006`) require a self-created order, produced via `checkout.md`'s `CHK-001` (which itself orders a self-created temporary product, per Architecture §10.7). |
| **Ownership** | All orders in the account belong to the single project account; self-created orders belong to the scenario/lifecycle group that placed them. |
| **Cleanup requirement** | Every self-created order must be deleted via this file's own Delete Order path and verified gone. The seed order (O62676) is never a cleanup subject — it is permanent, pre-existing account data. |

## Scenarios

### Positive

#### `ORD-001 — The "My Orders" list displays existing orders as collapsible rows`
- **Type:** Positive
- **Priority:** P1
- **Purpose:** Confirms the baseline list rendering, using the account's real, pre-existing order data.
- **Preconditions:** Authenticated session; at least one order exists (the seed order O62676 satisfies this without any setup).
- **Test Data:** The existing seed order, read-only.
- **Steps:** Open the "📦 Orders" tab.
- **Expected Outcome:** "My Orders" heading is shown; at least one order row is listed, collapsed by default, with a chevron control.
- **Business Assertions:** At least one order row is present; header "Orders" stat matches the list's row count.
- **Persistence / State Assertions:** N/A.
- **Cleanup:** None — read-only.
- **Dependencies:** None beyond authentication.
- **Traceability:** Feature Map → Orders Management → Main Workflows. Evidence: `EV-P2-016`.
- **Notes / Known Limitations:** None.

#### `ORD-002 — Expanding an order row reveals its items, status, and Delete control`
- **Type:** Positive
- **Priority:** P1
- **Purpose:** Confirms the expand interaction and the confirmed content set an expanded row exposes.
- **Preconditions:** `ORD-001`.
- **Test Data:** The seed order, read-only.
- **Steps:** Click the chevron to expand an order row.
- **Expected Outcome:** The row expands to reveal "Items:" (line items), a Status `<select>`, and a "Delete Order" control.
- **Business Assertions:** All three named elements are present once expanded.
- **Persistence / State Assertions:** N/A.
- **Cleanup:** Collapse the row (non-destructive, optional).
- **Dependencies:** `ORD-001`.
- **Traceability:** Feature Map → Orders Management → Main Workflows. Evidence: `EV-P2-016`.
- **Notes / Known Limitations:** This scenario reads the Status control's presence and current value only — it does not change it. Status *transitions* belong entirely to `order-lifecycle.md`.

#### `ORD-003 — Order identifiers, items, and totals are readable and internally consistent`
- **Type:** Positive
- **Priority:** P2
- **Purpose:** Confirms the order detail's data is coherent — items and totals correspond to what the order actually represents.
- **Preconditions:** `ORD-002`.
- **Test Data:** The seed order, read-only.
- **Steps:** Inspect an expanded order's identifier, item list, and total.
- **Expected Outcome:** The order number is well-formed; each listed item shows a product and quantity; the total is consistent with the listed items (where price data is available for cross-check).
- **Business Assertions:** Order number is non-empty and well-formed; item list is non-empty.
- **Persistence / State Assertions:** N/A.
- **Cleanup:** None.
- **Dependencies:** `ORD-002`.
- **Traceability:** Feature Map → Orders Management → Main Workflows. Evidence: `EV-P2-016`.
- **Notes / Known Limitations:** None.

### Persistence / Visibility

#### `ORD-004 — A newly created order is visible in the list immediately, identified by its Checkout-issued order number`
- **Type:** Positive / Persistence
- **Priority:** P0
- **Purpose:** Confirms the Orders-Management-owned half of the Checkout→Orders hand-off (complementing `checkout.md`'s `CHK-006`, which verifies the same fact from Checkout's side).
- **Preconditions:** A self-created order exists (`CHK-001`).
- **Test Data:** The order from `CHK-001`, identified by its Order Number.
- **Steps:** Open "📦 Orders" after placing the order.
- **Expected Outcome:** The order appears in the list with the same Order Number issued at checkout.
- **Business Assertions:** An order row matching the exact Order Number is present.
- **Persistence / State Assertions:** N/A.
- **Cleanup:** Delete the order (`ORD-005`).
- **Dependencies:** `CHK-001`.
- **Traceability:** Feature Map → Cross-Feature Business Journeys → Journey 1. Evidence: `EV-P2-015` → `EV-P2-016`.
- **Notes / Known Limitations:** Assertions here target **this specific order by its own number**, never "the first row" or "the row count" — both of which are shared, contaminable state per Architecture §10.6.

### Business Rules / Deletion

#### `ORD-005 — Deleting an order requires a custom in-page confirmation, distinct from native browser dialogs used elsewhere`
- **Type:** Positive / Business Rule
- **Priority:** P1
- **Purpose:** Confirms Delete Order's confirmation mechanism is a **DOM modal**, not a native `confirm()` — the opposite pattern from Clear Basket and Delete Product, and a documented, deliberate application inconsistency worth its own scenario since conflating the two mechanisms is a predictable implementation error (Architecture §7.11, §16.4).
- **Preconditions:** A self-created, deletable order exists (`ORD-004`).
- **Test Data:** The order from `ORD-004`.
- **Steps:** Expand the order row. Click "Delete Order".
- **Expected Outcome:** A **custom in-page modal** appears (not a native browser dialog) reading "⚠️ Confirm Delete" / "Are you sure you want to delete this order? This action cannot be undone.", with "Delete Order" (confirm) and "Cancel" controls.
- **Business Assertions:** The modal is a real DOM element (locatable/inspectable as page content), not a native dialog.
- **Persistence / State Assertions:** N/A.
- **Cleanup:** Proceed to confirm (`ORD-006`) or Cancel and retain the order for further use.
- **Dependencies:** `ORD-004`.
- **Traceability:** Feature Map → Orders Management → Main Workflows ("Delete Order"). Evidence: `EV-P2-018`.
- **Notes / Known Limitations:** None.

#### `ORD-006 — Confirming order deletion removes it and corrects the Orders header stat`
- **Type:** Positive
- **Priority:** P0
- **Purpose:** Confirms the deletion actually completes — this scenario is also the mandatory cleanup mechanism every checkout-dependent scenario in this Test Design relies on.
- **Preconditions:** `ORD-005` (confirmation modal showing).
- **Test Data:** The same self-created order.
- **Steps:** Click "Delete Order" within the confirmation modal.
- **Expected Outcome:** The order is removed from the list immediately; the header "Orders" stat decrements to the correct count.
- **Business Assertions:** The order's number is no longer present in the list; "Orders" stat matches the new, correct count.
- **Persistence / State Assertions:** N/A here (see `ORD-007`).
- **Cleanup:** N/A — this scenario **is** the cleanup step.
- **Dependencies:** `ORD-005`.
- **Traceability:** Feature Map → Orders Management → State Changes. Evidence: `EV-P2-018` (`CONFIRMED FROM EXECUTION`).
- **Notes / Known Limitations:** Per Architecture §10.7/§12.3, this scenario removes the **order record** cleanly but does **not** and cannot restore the stock the order consumed at checkout — that is a confirmed, disclosed, permanent characteristic of this application, contained by always ordering disposable self-created products (see `checkout.md`).

#### `ORD-007 — Order deletion persists across a full page reload`
- **Type:** Persistence
- **Priority:** P2
- **Purpose:** Confirms deletion is genuinely server-side and durable.
- **Preconditions:** `ORD-006` completed.
- **Test Data:** The deleted order's number, retained only for the assertion.
- **Steps:** Reload `/market.html` and open the Orders tab.
- **Expected Outcome:** The order remains absent.
- **Business Assertions:** The order's number is not found anywhere in the reloaded Orders list.
- **Persistence / State Assertions:** Deletion survives a full reload.
- **Cleanup:** None (already clean).
- **Dependencies:** `ORD-006`.
- **Traceability:** Feature Map → Orders Management → Cleanup. Evidence basis: same reload-persistence pattern confirmed for Basket (`EV-P2-013`) and Product deletion (`EV-P2-049`), applied to Orders per the Feature Map's own cross-reference.
- **Notes / Known Limitations:** No dedicated Orders-specific reload-after-delete evidence entry exists distinct from the general pattern — Feature Map explicitly notes Orders persistence was "not separately re-tested beyond the general account-scoped, server-side persistence pattern." This scenario is designed on that general, confirmed pattern rather than an Orders-specific data point, and is kept at P2 accordingly.

## Scenario Count

7 scenarios (`ORD-001`–`ORD-007`): 3 Positive (list/detail), 1 Positive/Persistence (visibility), 2 Positive/Business Rule (deletion), 1 Persistence. The one pre-existing seed order (O62676) is used strictly read-only throughout, per Architecture §10.6.
