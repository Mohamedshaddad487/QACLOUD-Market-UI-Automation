# Feature: Order Lifecycle

[← Back to Test Design master](../TEST-DESIGN.md)

> **Reconciliation note (LIF-002 Evidence Reconciliation, 2026-09-26).** `LIF-002` was reconciled against a controlled, execution-based verification on a disposable order (pending → processing, real Checkout and Orders UI, request timing recorded, badge sampled on every animation frame). Its result, **TRANSIENT STALE WINDOW**, is `CONFIRMED FROM EXECUTION`: the badge showed the old status only until the application's own automatic orders re-read completed, then updated with no "🔄 Refresh". The result is cited below as *the LIF-002 Evidence Reconciliation (2026-09-26)*. The Evidence Log stays closed at `EV-P2-069`; on 2026-09-27 the result was registered in `FEATURE-MAP.md` → Order Lifecycle → *Evidence Reconciliation* as `D-40`–`D-43` (execution) and `D-44`–`D-46` (source inspection only). `EV-P2-017` is historical evidence and is unchanged. Only `LIF-002` and the feature-level lines that described it were revised; no scenario ID was renumbered, reused or retired.

## Feature Overview

**Purpose:** Governs the status progression of an individual order and the business rule that locks status editing once an order reaches a terminal state.

**Business scope:** Status change (server persistence), the order row's own display of a status change (its badge updates automatically after the change), and the confirmed "Delivered" terminal-state lock. "Cancelled" terminal-state behavior is explicitly **not** assumed.

**Authentication:** Required (inherits from Orders Management).

**Entry point:** Orders Management — an expanded order row's Status `<select>`.

**Dependencies:** Entirely nested within Orders Management — no independent entry point.

## Coverage Scope

Covered: the five observed status values as a reference vocabulary (Pending / Processing / Shipped / Delivered / Cancelled), a confirmed status-change action and its server persistence, the row badge's automatic update after a status change, and the confirmed Delivered-locks-editing business rule.

**Explicitly not covered here — and explicitly not assumed:** whether "Cancelled" is also a terminal/locked state. Discovery deliberately did not test this, specifically to avoid an unnecessary state change on real order data (`U-202`), and this Test Design continues that same restraint rather than guessing.

## Preconditions

- Authenticated session; an existing order in a non-terminal status to change.

## Test Data Requirements

| Kind | Detail |
|---|---|
| **Existing/seed data** | The one pre-existing seed order (O62676) is already in status **Delivered** and is used **only** as the read-only subject for the Delivered-lock confirmation (`LIF-003`) — its status is inspected, never changed. |
| **Temporary/generated data** | Status-changing scenarios (`LIF-001`, `LIF-002`) require a self-created order (via `checkout.md`'s `CHK-001`), per Architecture §10.6 — the seed order must never be status-changed since Discovery never tested reversing a status change and no UI path to "un-terminal" an order is confirmed to exist. |
| **Ownership** | Self-created orders belong to the scenario/lifecycle group that placed them. |
| **Cleanup requirement** | Any self-created order used here is deleted via `orders.md`'s `ORD-006` as part of the same lifecycle's teardown — status changes themselves are not independently "cleaned up," since the order carrying them is deleted afterward regardless of its status at that point. |

## Scenarios

### Positive / Business Rules

#### `LIF-001 — Changing an order's status persists server-side immediately`
- **Type:** Positive / Business Rule
- **Priority:** P1
- **Purpose:** Confirms the core status-change mechanism succeeds and is genuinely persisted, proven through an explicit forced re-read. How the page reflects the change on its own, without a Refresh, is `LIF-002`'s concern, not this scenario's.
- **Preconditions:** A self-created order in a non-terminal status (e.g. Pending).
- **Test Data:** An order created via `CHK-001`.
- **Steps:** Expand the order row. Select a new, non-terminal status (e.g. Processing or Shipped) in the Status dropdown.
- **Expected Outcome:** The status change is accepted server-side immediately.
- **Business Assertions:** A genuine re-read (e.g. via the "🔄 Refresh" control, or a reload) confirms the new status is the one now shown — per Architecture §14.6, this assertion is made against a forced re-read, not the immediate post-change display. A persistence claim needs a genuine re-read from the server, and immediately after a change the row can still show the previous status until the application's own re-read completes (confirmed, not asserted — see `LIF-002`'s Notes).
- **Persistence / State Assertions:** The new status persists: it is the status a forced re-read returns, independent of what the page displayed before that re-read.
- **Cleanup:** The order is deleted afterward via `ORD-006`, regardless of its status at that point.
- **Dependencies:** `CHK-001`.
- **Traceability:** Feature Map → Order Lifecycle → Main Workflows. Evidence: `EV-P2-016`, `EV-P2-017` (`CONFIRMED FROM EXECUTION`); persistence re-confirmed `D-42`.
- **Notes / Known Limitations:** None.

#### `LIF-002 — After a status change, the order row's badge shows the new status without "🔄 Refresh"`
- **Type:** Positive
- **Priority:** P1
- **Purpose:** Confirms that the order row, the user's only view of an order's status, reflects a successful status change by itself, without the user having to click "🔄 Refresh". `LIF-001` proves the change reached the server through a forced re-read; this scenario proves the page shows it with no user action.
- **Preconditions:** A self-created order in status Pending.
- **Test Data:** An order created via `CHK-001`.
- **Steps:** Expand the order row and confirm its badge and Status control both read Pending. Select Processing in the Status control. Allow the status update to complete, then allow the application's own automatic re-read of the orders, which it issues after a successful update, to complete. Do not click "🔄 Refresh" and do not reload the page.
- **Expected Outcome:** The status update succeeds. The application re-reads the orders on its own and redraws the order list. The row's badge then reads Processing, the row's Status control reads Processing, and the message "Order status updated to processing" is shown. None of this requires "🔄 Refresh".
- **Business Assertions:** With no Refresh and no reload between the change and the assertions, the order's badge reads Processing, its Status control reads Processing, and the message "Order status updated to processing" is shown.
- **Persistence / State Assertions:** N/A. Server persistence is `LIF-001`'s assertion and is not repeated here.
- **Cleanup:** Delete the order via `ORD-006`.
- **Dependencies:** `CHK-001`.
- **Traceability:** Feature Map → Order Lifecycle → Main Workflows and Negative / Validation Behavior. Evidence: the LIF-002 Evidence Reconciliation (2026-09-26) — `D-40`, `D-41` — `CONFIRMED FROM EXECUTION`; historical `EV-P2-017` (`CONFIRMED FROM EXECUTION`, since refined, see Notes). Architecture §15.2, §15.3 (synchronization on the application's own requests).
- **Notes / Known Limitations:**
  - **Revised in the LIF-002 Evidence Reconciliation (2026-09-26).** This scenario was the P1 defect-detection scenario *"[Defect] The order row's status badge does not reflect a status change until "🔄 Refresh" is clicked"*. Its Expected Outcome was *"The row's status badge continues to show the **old** status, even though the change has already succeeded server-side … Clicking "🔄 Refresh" then updates the badge to the correct, current status."*, and its Business Assertions were *"Badge is stale (shows old status) immediately after the change; badge is correct after "🔄 Refresh" is clicked."* That wording came from `EV-P2-017`, a single Discovery observation. Re-verified on a disposable order (pending → processing), the badge corrected itself when the application's own orders re-read completed; the later "🔄 Refresh" changed nothing. "Stale until Refresh" is **CONTRADICTED FROM EXECUTION**, and the scenario now asserts the confirmed behavior. Type changed from Regression / Defect Detection to Positive. Priority stays P1: the badge is the order's primary status display, and a status change it does not reflect would materially affect usability (§5.2).
  - **`EV-P2-017` is not rewritten.** Its facts that the change is accepted and persisted immediately still hold. Why Discovery saw the badge stay stale until Refresh is **NOT VERIFIED**; the reconciliation named possible explanations, and none is adopted here.
  - **Confirmed, not asserted: the transient stale window.** Between the selection and the completion of the automatic re-read, the Status control already reads Processing while the badge still reads Pending (`CONFIRMED FROM EXECUTION`, one frame-sampled run). It is not asserted. No requirement governs it, it lasts only while the application's own requests are in flight, and asserting it would mean asserting inside that in-flight window. This follows `BSK-019`'s treatment of the Products-card display lag. Its duration is not a design value: no timing is asserted, and none may be used as a wait (Architecture §15.1).
  - **Confirmed, not asserted: the redraw collapses the row.** The application replaces the order list when it redraws, so the order row returns collapsed (`CONFIRMED FROM EXECUTION`; the redraw itself is also `CONFIRMED` from the page source). This is a consequence of how the list is rendered, not a stated requirement, so it is not asserted. Implementation must re-expand the row before reading the Status control.
  - **The success message is transient.** It disappears a few seconds after it appears (`CONFIRMED` from the page source). It must be asserted once the automatic re-read completes, never after an unrelated wait.
  - **Refresh is not part of this scenario.** It must not be used to obtain the Processing badge. Using it would test `LIF-001`'s forced re-read, not the automatic update this scenario covers.
  - **Only non-final statuses.** The change is Pending → Processing. Delivered and Cancelled are never selected here: they are terminal (Cancelled is **NOT VERIFIED** as terminal, `U-202`), and they fall outside this scenario.
  - If a run ever shows the badge still reading Pending after the automatic re-read has completed, that is a genuine failure to report with its request timing, never retried, relaxed, or "fixed" with a Refresh (Architecture §14.8 option 1, §15.4).
  - This scenario is no longer a member of the display-staleness defect family (`FIL-017`; historically `BSK-011`). `U-206` (whether these behaviors share one mechanism) is unaffected.

#### `LIF-003 — [Confirmed business rule] A Delivered order's Status control becomes locked`
- **Type:** Business Rule
- **Priority:** P0
- **Purpose:** Confirms the one genuinely confirmed terminal-state rule in this feature, verified directly on real order data.
- **Preconditions:** An order already in status "Delivered" — satisfied by the pre-existing seed order O62676, used strictly read-only.
- **Test Data:** The seed order O62676 (read-only — its status is inspected, never changed).
- **Steps:** Expand the Delivered order's row. Inspect the Status control's enabled/disabled state.
- **Expected Outcome:** The Status `<select>` is `disabled` — no status change can be initiated.
- **Business Assertions:** The Status control's disabled state is confirmed for a Delivered order.
- **Persistence / State Assertions:** N/A — this is a read-only structural check.
- **Cleanup:** None — no mutation occurs; the seed order is never touched beyond inspection.
- **Dependencies:** None beyond authentication and the seed order's continued existence.
- **Traceability:** Feature Map → Order Lifecycle → Negative / Validation Behavior ("Confirmed terminal-state lock"). Evidence: `EV-P2-016` (`CONFIRMED FROM EXECUTION`, verified directly on O52638 in the account used before 2026-09-30; the current seed order O62676 was driven to Delivered through the UI and showed the same lock, `PROJECT-HISTORY.md` §14).
- **Notes / Known Limitations:** This scenario deliberately reuses the real, pre-existing Delivered order rather than driving a self-created order through every status to reach Delivered — both because Discovery never confirmed every intermediate transition is unrestricted, and because doing so would need to permanently lock a self-created order (preventing any further status-based testing on it) for no additional coverage value beyond what the seed order already, safely, proves. Two related points remain NOT VERIFIED: whether the server also rejects a status change on a Delivered order, and whether a locked order can still be deleted.

### Exploratory / Deferred Verification

#### `LIF-004 — [Deferred] Whether a Cancelled order also becomes locked`
- **Type:** Exploratory / Deferred Verification
- **Priority:** P3
- **Purpose:** Records, without asserting, whether "Cancelled" shares Delivered's terminal-lock behavior — explicitly kept unresolved per the task's direct instruction not to assume this.
- **Preconditions:** A self-created, disposable order (never the seed order, since this scenario intentionally drives a status change that Discovery never confirmed is safe/reversible).
- **Test Data:** An order created via `CHK-001`.
- **Steps:** Change the order's status to "Cancelled" (via a genuine re-read to confirm the change landed, per `LIF-001`'s pattern). Inspect whether the Status control becomes disabled.
- **Expected Outcome:** **Not asserted as locked or unlocked.** Recorded to observe actual behavior so `U-202` can be closed with real evidence.
- **Business Assertions:** None enforced as pass/fail.
- **Persistence / State Assertions:** N/A.
- **Cleanup:** Delete the order via `ORD-006` regardless of the observed outcome — Cancelled or not, disposable order data is always removed at scenario end.
- **Dependencies:** `CHK-001`.
- **Traceability:** Feature Map → Order Lifecycle → Negative / Validation Behavior ("Whether Cancelled is also a terminal/locked state remains NOT VERIFIED"). Related unknown: `U-202`.
- **Notes / Known Limitations:** This is the one scenario in this Test Design that deliberately drives an order to a status Discovery never previously set — it is scoped to a disposable, self-created order specifically so that outcome carries no risk to real account data, consistent with Architecture §10.6's isolation rule.
  - *Source-inspection facts relevant if this scenario is ever promoted (added 2026-09-27; none is execution evidence):* selecting Cancelled first opens a "⚠️ Confirm Final Status" modal, which the Steps above do not yet mention (`D-44`); the page renders the select disabled for Cancelled (`D-45`); and cancelling states that items return to stock (`D-46`). Whether a cancelled order can then be deleted is NOT VERIFIED — the stated cleanup depends on it. Promotion therefore needs execution evidence and a revision of these Steps first (TEST-DESIGN §9).

## Scenario Count

4 scenarios (`LIF-001`–`LIF-004`): 2 Positive (`LIF-001` Positive / Business Rule, `LIF-002` Positive) + 1 confirmed Business Rule (`LIF-003`, Delivered lock, read-only against seed data) + 1 Exploratory/Deferred Verification (`LIF-004`) = **4**. Of these, **3 are implementation-ready** and **1 is deferred**. "Cancelled" is never modeled as locked anywhere in this file, per `U-202`.

> **LIF-002 Evidence Reconciliation (2026-09-26).** This line previously read: *"4 scenarios (`LIF-001`–`LIF-004`): 2 Positive/Business Rule, 1 Regression/Defect Detection, 1 confirmed Business Rule (Delivered lock, read-only against seed data), 1 Exploratory/Deferred Verification."* `LIF-002` became Positive when its defect was contradicted from execution, which leaves this file with no Regression / Defect Detection scenario. The previous breakdown summed to 5 for 4 scenarios, because it counted `LIF-003` both as Positive/Business Rule and as a confirmed Business Rule; each scenario is now counted once. The total is unchanged, and no ID was renumbered, reused or retired.
