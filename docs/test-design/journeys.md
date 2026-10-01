# Cross-Feature Business Journeys

[← Back to Test Design master](TEST-DESIGN.md)

## Purpose

This file covers **integration between features** — scenarios whose value comes specifically from crossing a feature boundary, not from re-proving any single feature's own mechanics. Every journey below corresponds exactly to one of the three Cross-Feature Business Journeys named in the approved Feature Map. No journey here is invented; no journey here duplicates what a feature file already fully covers.

**How duplication with feature files is avoided:** several feature-level scenarios necessarily touch the same actions a journey passes through (e.g. `checkout.md`'s `CHK-006` and `orders.md`'s `ORD-004` both check that a placed order becomes visible in Orders). Where this happens, the feature-level scenario is scoped **narrowly** to the specific fact it exists to prove (e.g. "the order number matches"), while the journey scenario is scoped to the **end-to-end chain and its cross-feature state changes** (e.g. "basket empties, stock decrements, *and* the order appears, all as one coherent path"). Each journey's own section below states explicitly which feature-level scenarios it deliberately does not re-verify in detail.

## Preconditions (common to all journeys)

- Authenticated session (`AUTH-001`/`AUTH-004`).
- Per Architecture §10.7/§11.4, any journey that reaches Checkout uses a **self-created temporary product**, never a seed product, since stock consumption is irreversible.

## Scenarios

### `JRN-001 — Full purchase lifecycle: Catalog → Product → Basket → Checkout → Order → Orders`

- **Purpose:** Validates the single core business journey the entire application exists to support, end to end, as one continuous path — not as isolated steps. This is the highest-value scenario in this entire Test Design.
- **Priority:** P0
- **Preconditions:** Authenticated session; a temporary product exists in the catalog (or is created as this journey's first step).
- **Test Data:** One uniquely-generated temporary product (Architecture §11.3 naming), created specifically for this journey.
- **Steps:**
  1. Create a temporary product in the catalog (Product Management).
  2. From the Products tab, add it to the basket (Shopping Basket).
  3. Open the Basket tab; confirm the item and its total (Shopping Basket).
  4. Click "📦 Place Order" (Checkout / Order Creation).
  5. Confirm a success confirmation appears, carrying a real order number.
  6. Navigate to Orders Management; confirm the new order is present, identified by that same order number.
- **Business Outcome:** A real order exists, traceable end-to-end from a specific catalog product through to a specific Orders-list entry, with every intermediate state change (basket population, stock decrement, basket emptying, order creation) happening in the correct sequence.
- **State Changes:** Basket item count/units increase, then return to zero on order placement; the ordered product's stock decrements by the ordered quantity; a new order record is created and visible in Orders Management.
- **Cleanup:** Delete the order (Orders Management), then delete the temporary product (Product Management). The stock decrement itself is not reversible — confined here to disposable, self-created inventory, per Architecture §10.7.
- **Dependencies (feature-level, composed but not re-verified in full):** `PM-001` (creation mechanics), `BSK-002` (add-to-basket mechanics), `CHK-001`/`CHK-002` (checkout mechanics/confirmation content), `ORD-004` (visibility). This journey does **not** re-verify each of those scenarios' own detailed assertions (e.g. it does not re-test Add Product's field validation, or Checkout's exact confirmation-modal copy) — it verifies that the **chain as a whole** works and that state changes propagate correctly across feature boundaries.
- **Traceability:** Feature Map → Cross-Feature Business Journeys → Journey 1. Evidence: `EV-P2-007`, `EV-P2-015`–`EV-P2-018`, `EV-P2-020`.

### `JRN-002 — Basket persistence across authentication: Catalog → Basket → Logout → Login → Basket`

- **Purpose:** Confirms the basket is genuinely account-scoped, server-side data — surviving a full session boundary — as an explicit Authentication ↔ Shopping Basket integration check, distinct from either feature's own internal persistence scenarios.
- **Priority:** P0
- **Preconditions:** Authenticated session; must run in the isolated, disposable-session context per Architecture §8.4 (it necessarily performs a real logout).
- **Test Data:** One catalog product added to the basket (a seed product is acceptable here — adding to a basket does not consume stock, `EV-P2-020`).
- **Steps:**
  1. Add a product to the basket (Shopping Basket).
  2. Log out (Authentication & Session).
  3. Log back in (Authentication & Session).
  4. Open the Basket tab; confirm the item is still present.
- **Business Outcome:** The basket's contents are identical before and after the logout/login boundary, proving basket state lives on the server against the account, not in the browser session.
- **State Changes:** None from the basket's own perspective — the point of this journey is precisely that basket state does **not** change across the authentication boundary, even though the session itself is fully invalidated and re-established in between.
- **Cleanup:** Clear the basket via the standard Basket cleanup path (`BSK-007` or equivalent) after verification.
- **Dependencies (feature-level, composed but not re-verified in full):** `BSK-002` (add mechanics), `AUTH-007`/`AUTH-001` (logout/login mechanics). This journey does not re-verify logout's redirect behavior or login's field-level mechanics in detail — those are `authentication.md`'s responsibility. It also does not duplicate `basket.md`'s own `BSK-010`, which already covers this exact fact from the Basket feature's side; this journey scenario is retained specifically to frame it as the named, approved Feature Map journey and to make the cross-feature *intent* (not just the Basket-side fact) explicit and discoverable from this file. Implementation may reasonably treat `BSK-010` and `JRN-002` as the same underlying test with two labels, or keep them distinct — either is acceptable per Test Design §9 (one design file does not require one implementation spec file).
- **Traceability:** Feature Map → Cross-Feature Business Journeys → Journey 2. Evidence: `EV-P2-013` (`CONFIRMED FROM EXECUTION`).

### `JRN-003 — Full product management lifecycle: Add Product → View Details → Edit → Delete`

- **Purpose:** Confirms the full create→view→edit→delete lifecycle works end to end on **one consistent product identity**, and that View Details, Edit, and Delete all target the same real record — proven, in Discovery, against raw server data rather than assumed from UI appearance alone.
- **Priority:** P1
- **Preconditions:** Authenticated session.
- **Test Data:** One uniquely-generated temporary product, used through all four steps.
- **Steps:**
  1. Create a product via Add Product (Product Management).
  2. Open View Details on the new product; note its displayed Product ID (Product Details).
  3. Open Edit on the same product; confirm the pre-filled values match; change one field and save (Product Management).
  4. Re-open View Details; confirm the edited value and the **same** Product ID as step 2 (Product Details).
  5. Delete the product via the native confirmation (Product Management).
- **Business Outcome:** One product identity is created, correctly inspected, correctly modified, and finally removed — with its identity (Product ID) proven stable across every step, not just its visible name.
- **State Changes:** Catalog count and Inventory Value increase on creation, reflect the edit immediately, and return exactly to the pre-creation baseline after deletion.
- **Cleanup:** The scenario's own final step (Delete) is its cleanup; verified via a follow-up catalog check that count/value match baseline.
- **Dependencies (feature-level, composed but not re-verified in full):** `PM-001` (creation), `DET-007` (field set), `PM-011`/`PM-012` (edit mechanics), `PM-015` (delete mechanics). This journey deliberately overlaps with `product-management.md`'s own `PM-017` ("Full lifecycle: create, view, edit, and delete the same product") — the two describe the same underlying path. `PM-017` is the **Product-Management-owned** version, focused on CRUD-identity consistency as a single-feature-file concern; this `JRN-003` entry exists so the approved Feature Map's named journey is directly traceable from this file without requiring a reader to know it lives inside `product-management.md`. **Implementation should treat `PM-017` and `JRN-003` as one scenario, not two** — this is the one deliberate near-duplicate in this Test Design, kept only because both the per-feature and per-journey instructions explicitly required it, and it is called out here rather than silently double-counted.
- **Traceability:** Feature Map → Cross-Feature Business Journeys → Journey 3. Evidence: `EV-P2-036`–`EV-P2-049` (self-created product, full cycle), `EV-P2-069` (cross-action identity consistency, proven against raw server data for two independent products).

## Journey Count

3 journeys (`JRN-001`–`JRN-003`), matching the Feature Map's three named Cross-Feature Business Journeys exactly — no additional journey was invented. `JRN-003` is explicitly documented as sharing its scenario with `product-management.md`'s `PM-017` rather than being silently counted twice in this Test Design's totals.
