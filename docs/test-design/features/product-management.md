# Feature: Product Management

[← Back to Test Design master](../TEST-DESIGN.md)

## Feature Overview

**Purpose:** Full CRUD lifecycle for products in the authenticated user's own catalog: create (Add Product), modify (Edit Product), and remove (Delete Product). (Inspect/View is documented as its own feature — `product-details.md`.)

**Business scope:** Add Product's exact fields, native HTML5 validation (order, `min="0"` boundaries), Details key/value editor, successful save with a brief "Product created successfully!" banner (`PM-001` Notes, C-1), the confirmed Zone/Type default gap, Edit Product on self-owned data, Delete Product with native confirmation, and the full create→edit→delete lifecycle.

**Authentication:** Required (inherits from Product Catalog).

**Entry point:** Add — "+ Add Product" button. Edit — card ✏️. Delete — card 🗑️.

**Dependencies:** Writes directly to the same Product Catalog that Search & Filtering and Product Details read from.

## Coverage Scope

Covered: valid product creation with all fields, all ten category options as a selectable set, optional Details, native validation for every required field and the `min="0"` boundary on Price/Stock, **the confirmed behavior at each field's zero boundary — a Price of `0` passes native validation but is rejected by the server (`PM-009`), while a Stock of `0` is accepted and persisted (`PM-021`)** — the confirmed silent-Zone/Type-default behavior, Edit on self-created data, Delete with native confirmation and verified cleanup, and one dedicated end-to-end lifecycle scenario.

**Hard constraint governing every state-changing scenario in this file:** per Architecture §10.5, **no scenario in this file may create, edit, or delete a pre-existing seed product.** Every mutating scenario here operates exclusively on a uniquely-named, self-created temporary product, and every one of them ends by deleting what it created. This is not merely a convention — Discovery itself demonstrated the cost of not doing this (`BLOCKER-P2-001`, `BLOCKER-P2-002`, and the still-unresolved Hass Avocado stock residue).

**Explicitly not covered here:** the catalog list/stats-level *consequences* of these actions (`catalog.md`'s `CAT-004`–`CAT-006`; designed there, but asserted inside the `PM-001` and `PM-017` tests — TEST-DESIGN §9), or the View Details modal's own field rendering (`product-details.md`).

## Preconditions

- Authenticated session; a populated catalog (`CAT-001`).
- Ability to create a uniquely-named product (no external dependency beyond the authenticated session itself).

## Test Data Requirements

| Kind | Detail |
|---|---|
| **Existing/seed data** | Read-only only — used solely to confirm the ten category options match the filter chip set (`PM-004`), never mutated. |
| **Temporary/generated data** | Every mutating scenario in this file creates its own uniquely-named product (Architecture §11.3's `AUT-<runId>-<workerIndex>-<label>` convention) with modest, realistic field values. |
| **Ownership** | Every created product belongs to the single project account and is scoped to the scenario (or lifecycle group) that created it. |
| **Cleanup requirement** | **Mandatory for every mutating scenario.** Each one either deletes what it created directly, or is itself part of the `PM-014`–`PM-016` create→edit→delete lifecycle group, whose final step is deletion. A scenario that creates data and has no corresponding deletion step is not a valid design in this file. |

## Scenarios

### Positive — Add Product

#### `PM-001 — Valid product creation succeeds with all required fields`
- **Type:** Positive
- **Priority:** P0
- **Purpose:** Confirms the foundational creation workflow — the precondition every other Product Management and cross-referencing Catalog scenario in this Test Design depends on.
- **Preconditions:** `CAT-001`.
- **Test Data:** A uniquely-generated product name (e.g. `AUT-<run>-<worker>-pm001`), one valid category, a modest non-negative price, a modest non-negative stock value.
- **Steps:** Click "+ Add Product". Fill Product Name, Category, Price, Stock. Click "Save Product".
- **Expected Outcome:** The modal closes; the success banner "Product created successfully!" is shown; the product appears in the catalog with the submitted values.
- **Business Assertions:** The success banner is visible and reads exactly "Product created successfully!"; the new product's card shows the submitted name, category, price, and stock.
- **Persistence / State Assertions:** N/A here (see `PM-013`).
- **Cleanup:** Delete the created product (this scenario's own responsibility, or handed off to `PM-014`–`PM-016` if run as part of the lifecycle group).
- **Dependencies:** `CAT-001`.
- **Traceability:** Feature Map → Product Management → Main Workflows ("Add Product"). Evidence: `EV-P2-036`–`EV-P2-042`.
- **Notes / Known Limitations:** **Success feedback (C-1).** `EV-P2-042` records creation as a silent success with no toast. The page source shows a "Product created successfully!" banner for about 3 s (CONFIRMED FROM SOURCE INSPECTION), and this scenario's own record of it in the 2026-09-28 13:35 full run shows the banner displayed with that text (CONFIRMED FROM EXECUTION), so "no toast" is CONTRADICTED FROM EXECUTION for the current application. `EV-P2-042` is not rewritten. By owner decision (2026-09-28) the test asserts the banner: once the save's catalog reload has finished, the page banner (`#alert`, the locator the suite's other banner assertions use) must be visible and read exactly that text, using web-first assertions only. The page shows the banner before that reload and hides it about 3 s later, so a reload slower than that would fail this scenario rather than let it pass without the banner (from the page source; not observed).

#### `PM-002 — The Category dropdown offers exactly the ten catalog categories`
- **Type:** Positive
- **Priority:** P2
- **Purpose:** Confirms the Add Product Category field's option set matches the confirmed ten-category catalog vocabulary exactly — a data-integrity check on the form itself, distinct from actually submitting with each one.
- **Preconditions:** `CAT-001`.
- **Test Data:** None — read-only inspection of the form.
- **Steps:** Open "+ Add Product". Inspect the Category dropdown's option list.
- **Expected Outcome:** The dropdown defaults to "Select category..." and offers exactly the ten confirmed categories, as plain text (no emoji), in the same order as the filter chip set.
- **Business Assertions:** Option list has exactly ten real category entries plus the default placeholder.
- **Persistence / State Assertions:** N/A.
- **Cleanup:** Close the modal via "Cancel" without saving.
- **Dependencies:** `CAT-001`.
- **Traceability:** Feature Map → Product Management → Negative / Validation Behavior. Evidence: `EV-P2-036`.
- **Notes / Known Limitations:** This scenario does not submit with all ten categories individually — that would be ten near-identical, low-value-add scenarios (Test Design §"Test Count Discipline"); `PM-001`'s single successful creation already proves the save path works for one category, and this scenario proves the *option set* is correct and complete.

#### `PM-003 — A single Details key/value pair can be added during creation`
- **Type:** Positive
- **Priority:** P2
- **Purpose:** Confirms the optional Details editor's confirmed, single-pair-at-a-time behavior.
- **Preconditions:** `CAT-001`; the Add Product modal is open with required fields filled.
- **Test Data:** One Details key/value pair (e.g. `origin` / `local`).
- **Steps:** Click "+ Add detail". Fill the inline Key and Value fields. Confirm with "OK". Save the product.
- **Expected Outcome:** The pair commits into a removable table row before save; after save, the created product's Details data includes the pair (verifiable via View Details, `DET-007`).
- **Business Assertions:** The Details row is present in the form before save; the pair is present when the product's details are later inspected.
- **Persistence / State Assertions:** N/A.
- **Cleanup:** Delete the created product.
- **Dependencies:** `CAT-001`.
- **Traceability:** Feature Map → Product Management → Negative / Validation Behavior (Details editor). Evidence: `EV-P2-041`.
- **Notes / Known Limitations:** Does not attempt a second pending row while one is already pending, nor multiple pairs — both are `U-214`, deliberately deferred (`PM-018`), not assumed to work.

### Validation

#### `PM-004 — Submitting with all fields empty shows native validation starting with Product Name`
- **Type:** Validation
- **Priority:** P1
- **Purpose:** Confirms the first step of the confirmed, ordered, field-by-field native HTML5 validation sequence.
- **Preconditions:** `CAT-001`; Add Product modal open, all fields empty.
- **Test Data:** None (deliberately empty submission).
- **Steps:** Click "Save Product" with every field empty.
- **Expected Outcome:** A browser-native validation bubble appears on Product Name reading "Please fill out this field."; the form does not submit.
- **Business Assertions:** Product Name field is reported invalid; no product is created.
- **Persistence / State Assertions:** N/A.
- **Cleanup:** Close the modal via "Cancel".
- **Dependencies:** `CAT-001`.
- **Traceability:** Feature Map → Product Management → Negative / Validation Behavior. Evidence: `EV-P2-037`.
- **Notes / Known Limitations:** This is **browser-native validation, not custom application-level validation** — no in-app error text is rendered; per Architecture §13.7, the validation message is read via the element's validity state, not as page text.

#### `PM-005 — With Product Name filled, an unselected Category is flagged next`
- **Type:** Validation
- **Priority:** P1
- **Purpose:** Confirms the second step of the ordered validation sequence.
- **Preconditions:** `CAT-001`; Add Product modal open, Product Name filled, Category still at its default.
- **Test Data:** A valid product name; Category left unselected.
- **Steps:** Fill Product Name only. Click "Save Product".
- **Expected Outcome:** A browser-native validation message appears on Category reading "Please select an item in the list."; the form does not submit.
- **Business Assertions:** Category field is reported invalid; no product is created.
- **Persistence / State Assertions:** N/A.
- **Cleanup:** Close the modal via "Cancel".
- **Dependencies:** `CAT-001`.
- **Traceability:** Feature Map → Product Management → Negative / Validation Behavior. Evidence: `EV-P2-038`.
- **Notes / Known Limitations:** None.

#### `PM-006 — With Name and Category filled, an empty Price is flagged next`
- **Type:** Validation
- **Priority:** P1
- **Purpose:** Confirms the third step of the ordered validation sequence.
- **Preconditions:** `CAT-001`; Add Product modal open, Product Name and Category filled, Price empty.
- **Test Data:** A valid name and category; Price left empty.
- **Steps:** Fill Product Name and Category. Click "Save Product".
- **Expected Outcome:** A browser-native validation message appears on Price reading "Please fill out this field."; the form does not submit.
- **Business Assertions:** Price field is reported invalid; no product is created.
- **Persistence / State Assertions:** N/A.
- **Cleanup:** Close the modal via "Cancel".
- **Dependencies:** `CAT-001`.
- **Traceability:** Feature Map → Product Management → Negative / Validation Behavior. Evidence: `EV-P2-039`.
- **Notes / Known Limitations:** None.

#### `PM-007 — A negative Price is rejected at the confirmed min=0 boundary`
- **Type:** Boundary / Validation
- **Priority:** P1
- **Purpose:** Confirms the confirmed numeric lower-boundary constraint on Price.
- **Preconditions:** `CAT-001`; Add Product modal open, Name and Category filled.
- **Test Data:** Price = `-5`.
- **Steps:** Fill Name, Category, and a negative Price. Click "Save Product".
- **Expected Outcome:** A browser-native validation message appears reading "Value must be greater than or equal to 0."; the form does not submit.
- **Business Assertions:** Price field is reported invalid; no product is created.
- **Persistence / State Assertions:** N/A.
- **Cleanup:** Close the modal via "Cancel".
- **Dependencies:** `CAT-001`.
- **Traceability:** Feature Map → Product Management → Negative / Validation Behavior. Evidence: `EV-P2-039` (`min="0"` constraint).
- **Notes / Known Limitations:** Confirms the browser-side boundary is exclusive of negative values. What happens at `0` itself is **not** symmetrical across the two fields and is **not** decided by this client-side constraint: `PM-009` records that a Price of `0` passes native validation but is then rejected by the server, while `PM-021` records that a Stock of `0` is accepted and persisted. Neither outcome can be inferred from the `min="0"` attribute alone.

#### `PM-008 — An empty Stock is flagged after Price, and a negative Stock is rejected identically to Price`
- **Type:** Validation / Boundary
- **Priority:** P1
- **Purpose:** Confirms Stock shares Price's exact validation pattern (required, then `min="0"`), as the fourth confirmed step.
- **Preconditions:** `CAT-001`; Add Product modal open, Name/Category/Price filled, Stock empty or negative.
- **Test Data:** Two sub-cases: Stock empty; Stock = `-3`.
- **Steps:** Fill Name, Category, and a valid Price, leaving Stock empty. Click "Save Product". Then fill Stock with `-3` and click "Save Product" again.
- **Expected Outcome:** Empty Stock → "Please fill out this field."; negative Stock → "Value must be greater than or equal to 0." Neither submits.
- **Business Assertions:** Stock field is reported invalid in both sub-cases; no product is created.
- **Persistence / State Assertions:** N/A.
- **Cleanup:** Close the modal via "Cancel".
- **Dependencies:** `CAT-001`.
- **Traceability:** Feature Map → Product Management → Negative / Validation Behavior. Evidence: `EV-P2-040`.
- **Notes / Known Limitations:** Combines the "empty" and "negative" Stock cases into one scenario (rather than two) because Discovery's own evidence already establishes Stock mirrors Price's pattern exactly — separating them would duplicate `PM-006`/`PM-007`'s structure without new risk coverage (Test Design §"Test Count Discipline").

#### `PM-009 — A product with Price = 0 passes browser validation but is rejected by the server`
- **Type:** Boundary / Validation
- **Priority:** P2
- **Purpose:** Records the confirmed behavior at the inclusive edge of the Price boundary, and separates the two validation layers that `PM-007` alone cannot distinguish: the browser's `min="0"` constraint **accepts** `0`, so the form submits and reaches the network, and the **server** then rejects the submission so that no product is created. Establishing that the client-side constraint is not the whole validation story is the point of this scenario.
- **Preconditions:** `CAT-001`.
- **Test Data:** A uniquely-generated product name, a valid category, Price = `0`, and a valid non-zero Stock value (e.g. `10`).
- **Steps:** Fill all required fields with Price set to `0` and a valid Stock value. Confirm that no field is reported invalid by the browser. Click "Save Product".
- **Expected Outcome (currently observed application behavior):** No browser validation message appears — every field satisfies its native constraint and the form submits. The server then rejects the submission with HTTP `400`: the Add Product modal **remains open**, an alert reading **"Failed to save product"** is displayed, and **no product is created**.
- **Business Assertions:** No field is reported invalid by the browser; the Add Product modal is still open after submission; no product with the generated name exists in the catalog; the rendered catalog card count is unchanged.
- **Persistence / State Assertions:** N/A — nothing is created, so there is nothing to persist.
- **Cleanup:** Close the modal via "Cancel". No product is created; a verify-then-delete-if-present teardown is still expected to run and to find nothing.
- **Dependencies:** `CAT-001`.
- **Traceability:** Feature Map → Product Management → Negative / Validation Behavior. Evidence: `EV-P2-039`, `EV-P2-040` establish the **client-side** `min="0"` constraint only. The server-side rejection was confirmed after Discovery closed — see Notes.
- **Notes / Known Limitations:**
  - **Revised after the Product Management implementation pass and a subsequent targeted re-verification (2026-09-24).** This scenario previously read "Price and Stock of exactly 0 are valid boundary values" and expected successful creation. That expectation is **CONTRADICTED FROM EXECUTION**. It was an **inference, never an observation**: `EV-P2-039` states outright that `0` was never submitted during Discovery ("not separately re-tested via full submission, to avoid creating an unwanted $0 product, but the message text is unambiguous"). The inference holds for the browser constraint and does not hold for the application.
  - **Evidence for the current wording — `CONFIRMED FROM EXECUTION`.** Price = `0` with Stock = `10` was verified twice, in two independent fresh browser contexts with two distinct temporary product names, through the real UI. Both runs: client-side validity passed on all fields, `POST /api/products` returned HTTP `400` with `{"error":"product_name/name, price, and category are required"}`, the modal stayed open, "Failed to save product" was displayed, and no product was created. Price = `0` with Stock = `0` was independently observed to behave identically.
  - **Scope of the confirmed rule.** Price = `0` is rejected **regardless of the Stock value** — observed at Stock `0`, `7`, and `10`. A separate scenario for the Price = 0 / Stock = 0 combination is therefore deliberately **not** designed: it is one instance of the same rule and would add no new risk coverage (Test Design §"Test Count Discipline"). The complementary case — Stock = `0` with a positive Price — is a genuinely different outcome and is covered by `PM-021`.
  - **The reason for the server-side rejection is `NOT VERIFIED`** and is deliberately not asserted. Only the externally observable outcome is designed against. No claim is made about the server's internal validation logic.
  - **This scenario does not classify the behavior as a defect.** No requirement, specification, or Discovery evidence in this project establishes that a product must be priced above zero, and none is invented here. Whether rejecting a zero Price is desirable is a **business question for the product owner**, recorded as such and kept separate from the observed behavior. See also `PM-021`'s note on the same question from the opposite direction.

#### `PM-021 — A product with Stock = 0 and a positive Price is created successfully`
- **Type:** Boundary / Positive
- **Priority:** P2
- **Purpose:** Records the confirmed behavior at the inclusive edge of the **Stock** boundary, which is the opposite of Price's: a Stock of `0` is accepted and persisted, so a product may be created already out of stock. Designed as its own scenario because `PM-009` establishes the contrary outcome for Price, and the two must not be inferred from one another — the shared `min="0"` attribute does **not** imply a shared server-side outcome.
- **Preconditions:** `CAT-001`.
- **Test Data:** A uniquely-generated product name, a valid category, a positive Price (e.g. `10`), Stock = `0`. Price is deliberately non-zero so that this scenario isolates the Stock boundary and does not re-enter `PM-009`'s rejection path.
- **Steps:** Fill all required fields with a positive Price and Stock set to `0`. Click "Save Product".
- **Expected Outcome (currently observed application behavior):** The submission is accepted. The Add Product modal closes and the product appears in the catalog showing the entered price and a stock of `0`.
- **Business Assertions:** The new product's card is present; it shows the entered price; it shows a stock of `0`. The product remains manageable through the normal UI — it can be opened, edited, and deleted like any other self-owned product.
- **Persistence / State Assertions:** N/A — creation persistence in general is already covered by `PM-013` and by `CAT-006` (asserted in the `PM-001` test); this scenario does not duplicate it.
- **Cleanup:** Delete the created product through the real UI delete path; removal is verified.
- **Dependencies:** `CAT-001`.
- **Traceability:** Feature Map → Product Management → Negative / Validation Behavior. Evidence: `EV-P2-040` establishes the **client-side** `min="0"` constraint on Stock only. The server-side acceptance was confirmed after Discovery closed — see Notes.
- **Notes / Known Limitations:**
  - **ID is deliberately non-contiguous with its section.** This scenario is grouped under Validation/Boundary because that is where it belongs semantically, but it carries the next free ID (`PM-021`) rather than being inserted as a renumbered `PM-010`. Test Design §5.1 forbids renumbering: IDs are assigned once and never reused, so that existing references from implementation comments and reports keep pointing at the right scenario.
  - **Evidence — `CONFIRMED FROM EXECUTION`.** Observed independently twice: `POST /api/products` returned `201` with `stock: 0` persisted, and the same outcome was separately verified through the UI. The automation did not create this behavior and does not modify the application.
  - **Recorded for regression visibility, not as a defect.** No requirement, specification, or Discovery evidence in this project establishes that a product must carry stock above zero, and none is invented here. This scenario asserts the observed behavior; it does not assert that the behavior is correct or incorrect.
  - **Presentation of a zero-stock product is out of scope here.** How the card and the View Details modal label a stock of `0` ("Stock Status") interacts with a separately documented anomaly (Architecture §18.1 row 4) and is not asserted by this scenario.

### Defaults

#### `PM-010 — A newly created product silently defaults to Zone="Standard" and Type="Each"`
- **Type:** Business Rule
- **Priority:** P1
- **Purpose:** Documents a confirmed, deliberate data behavior — the Add Product form has no field for Zone or Type, yet both are real, filterable catalog attributes every product has. This is recorded as a confirmed business/data fact, **not** automatically labeled a defect (per the task's explicit instruction).
- **Preconditions:** `CAT-001`.
- **Test Data:** A uniquely-generated product created via `PM-001`'s standard flow (no Zone/Type field exists to fill).
- **Steps:** Create a product via the standard Add Product flow. Inspect its card's Zone/Type badge row.
- **Expected Outcome:** The created product's card shows Zone = "Standard" and Type = "Each", despite neither ever being entered.
- **Business Assertions:** Card's Zone badge reads "Standard"; Type badge reads "Each".
- **Persistence / State Assertions:** N/A.
- **Cleanup:** Delete the created product.
- **Dependencies:** `CAT-001`.
- **Traceability:** Feature Map → Product Management → Negative / Validation Behavior ("A significant documented gap"). Evidence: `EV-P2-043`.
- **Notes / Known Limitations:** "Standard" is **not** one of the four real Zone filter options (Dry/Frozen/Chilled/Room Temperature) — a created product is therefore only ever found under "All Zones", never a specific Zone selection. This scenario documents the fact; it does not assert whether that unreachability is total (`U-212`, see `PM-019`).

### Edit

#### `PM-011 — Edit Product opens pre-filled with the product's current values`
- **Type:** Positive
- **Priority:** P1
- **Purpose:** Confirms the Edit form correctly loads existing data before any change is made.
- **Preconditions:** A temporary product exists (`PM-001`).
- **Test Data:** The product created by `PM-001`.
- **Steps:** Click ✏️ on the temporary product's card.
- **Expected Outcome:** The same form as Add Product opens, titled "Edit Product", with Name/Category/Price/Stock/Details all pre-filled with the product's current values.
- **Business Assertions:** Each field's pre-filled value matches what was originally submitted.
- **Persistence / State Assertions:** N/A.
- **Cleanup:** Close via "Cancel" (no change made) or continue to `PM-012`.
- **Dependencies:** `PM-001`.
- **Traceability:** Feature Map → Product Management → Main Workflows ("Edit Product"). Evidence: `EV-P2-047`.
- **Notes / Known Limitations:** None.

#### `PM-012 — Editing and saving a self-owned product updates it immediately`
- **Type:** Positive
- **Priority:** P1
- **Purpose:** Confirms the save half of the Edit workflow, and — critically — that it succeeds without any permission restriction **on self-created data**, in direct, confirmed contrast to the same action on seed data.
- **Preconditions:** `PM-011` (Edit modal open, pre-filled).
- **Test Data:** A modified value for one field (e.g. a new Price).
- **Steps:** Change one field's value. Click "Save Product".
- **Expected Outcome:** The modal closes; the product's card reflects the new value immediately, with no permission block of any kind.
- **Business Assertions:** The card's displayed value for the changed field matches the new value.
- **Persistence / State Assertions:** N/A here (see `PM-013`).
- **Cleanup:** Delete the product (via `PM-015`, or directly).
- **Dependencies:** `PM-011`.
- **Traceability:** Feature Map → Product Management → Main Workflows; → Known Blockers / Constraints (contrast with seed-data restriction). Evidence: `EV-P2-047`. Architecture: §10.5 (self-owned-data-only rule this scenario exists specifically to satisfy).
- **Notes / Known Limitations:** **This scenario must never be run against a pre-existing seed product** — doing so is exactly what produced the unresolved Hass Avocado stock residue during Discovery (`BLOCKER-P2-001`) and is explicitly forbidden by Architecture §10.5, independent of whether any tooling-level restriction happens to be present at execution time.

#### `PM-013 — Created and edited field values persist across a full page reload`
- **Type:** Persistence
- **Priority:** P1
- **Purpose:** Confirms the save is genuinely server-side, not merely an in-page state update — the Product Management-specific angle on persistence (re-opening Edit to compare exact field values), distinct from Catalog's list-visibility check (`CAT-006`).
- **Preconditions:** `PM-012` completed (product created and edited).
- **Test Data:** The product from `PM-012`.
- **Steps:** Reload `/market.html`. Open Edit on the same product again.
- **Expected Outcome:** The Edit form's pre-filled values match exactly what was saved, including the edited field.
- **Business Assertions:** Every field's value after reload equals its last-saved value.
- **Persistence / State Assertions:** Category/Price/Stock all confirmed to persist across reload.
- **Cleanup:** Delete the product.
- **Dependencies:** `PM-012`.
- **Traceability:** Feature Map → Product Management → Persistence. Evidence: `EV-P2-046`.
- **Notes / Known Limitations:** None.

### Delete

#### `PM-014 — Deleting a self-owned product requires native browser confirmation`
- **Type:** Positive / Business Rule
- **Priority:** P1
- **Purpose:** Confirms the Delete trigger surfaces a **native browser `confirm()` dialog** — a distinct mechanism from Delete Order's custom in-page modal, and one that Playwright auto-dismisses if not explicitly handled (Architecture §16.4).
- **Preconditions:** A temporary product exists.
- **Test Data:** The temporary product to be deleted.
- **Steps:** Click 🗑️ on the product's card.
- **Expected Outcome:** A native browser `confirm()` dialog appears reading "Are you sure you want to delete this product?".
- **Business Assertions:** The dialog's presence and exact text are confirmed before any accept/dismiss decision.
- **Persistence / State Assertions:** N/A.
- **Cleanup:** Proceed to accept (`PM-015`) or dismiss and retain the product for further use.
- **Dependencies:** A temporary product (e.g. from `PM-001`).
- **Traceability:** Feature Map → Product Management → Main Workflows ("Delete Product"). Evidence: `EV-P2-048`.
- **Notes / Known Limitations:** Implementation must register a dialog handler explicitly (Architecture §16.4) — an unhandled native dialog is auto-dismissed by Playwright, which would silently look like "delete didn't happen" rather than a real test failure signal.

#### `PM-015 — Accepting the delete confirmation permanently removes the product`
- **Type:** Positive
- **Priority:** P0
- **Purpose:** Confirms the deletion actually completes and is durable — this scenario is also the mandatory cleanup mechanism every other mutating scenario in this file depends on.
- **Preconditions:** `PM-014` (confirmation dialog showing).
- **Test Data:** The same temporary product.
- **Steps:** Accept the confirmation dialog.
- **Expected Outcome:** The product is removed from the catalog immediately.
- **Business Assertions:** The product's card is no longer present.
- **Persistence / State Assertions:** N/A here (see `PM-016`).
- **Cleanup:** N/A — this scenario **is** the cleanup step for whatever product it targets.
- **Dependencies:** `PM-014`.
- **Traceability:** Feature Map → Product Management → Main Workflows. Evidence: `EV-P2-048`.
- **Notes / Known Limitations:** P0 because every other mutating scenario in this Test Design's Product Management and Checkout files structurally depends on this exact action succeeding reliably as their cleanup mechanism (Architecture §9.4).

#### `PM-016 — Deletion is permanent and confirmed after reload`
- **Type:** Persistence
- **Priority:** P1
- **Purpose:** Confirms the deletion is genuinely server-side and durable, not an optimistic client-side removal that a reload would reveal as incomplete.
- **Preconditions:** `PM-015` completed.
- **Test Data:** The deleted product's identity (name), retained only for the assertion, not for any further action.
- **Steps:** Reload `/market.html`.
- **Expected Outcome:** The product remains absent; catalog count and Inventory Value equal their pre-creation baseline.
- **Business Assertions:** The product's name is not found anywhere in the reloaded catalog; stats match baseline.
- **Persistence / State Assertions:** Deletion survives a full reload.
- **Cleanup:** None (already clean).
- **Dependencies:** `PM-015`.
- **Traceability:** Feature Map → Product Management → Persistence. Evidence: `EV-P2-049`.
- **Notes / Known Limitations:** None.

### Lifecycle

#### `PM-017 — Full lifecycle: create, view, edit, and delete the same product`
- **Type:** Positive / Cross-Feature Journey
- **Priority:** P1
- **Purpose:** Confirms the full CRUD lifecycle operates on **one consistent product identity** end to end — a distinct concern from the individual CRUD scenarios above, which each verify one step in isolation. This scenario is kept deliberately separate from `PM-001`/`PM-011`/`PM-012`/`PM-015`, per the explicit instruction to keep the lifecycle scenario apart from individual CRUD scenarios.
- **Preconditions:** `CAT-001`.
- **Test Data:** One uniquely-generated product, used through all four steps.
- **Steps:** Create the product (Add Product). Open View Details and confirm its Product ID. Open Edit and confirm the same Product ID context / pre-filled values, then change one field and save. Delete the product via the native confirmation.
- **Expected Outcome:** Each step operates on the same product; View Details' displayed identity and Edit's pre-filled values are consistent with each other and with what was created; the final Delete removes it completely.
- **Business Assertions:** The Product ID shown in View Details does not change across the lifecycle; the edited value is reflected in View Details before deletion; the product is fully gone afterward.
- **Persistence / State Assertions:** Catalog count and Inventory Value return exactly to the pre-creation baseline after the final delete.
- **Cleanup:** The scenario's own final step (Delete) is its cleanup.
- **Dependencies:** `CAT-001`; conceptually composes `PM-001`, `DET-007`, `PM-011`/`PM-012`, `PM-015`, but is designed and executed as one coherent scenario, not their sum.
- **Traceability:** Feature Map → Cross-Feature Business Journeys → Journey 3 ("Full product management lifecycle"). Evidence: `EV-P2-036`–`EV-P2-049` (creation cycle), `EV-P2-069` (cross-action identity consistency, proven against raw server data for two independent products).
- **Notes / Known Limitations:** This scenario and Journey 3 in `journeys.md` describe the same conceptual path; this one is the Product-Management-owned, single-feature-file version focused on CRUD-identity consistency, while `journeys.md`'s `JRN-003` is reserved for genuine cross-file integration framing. See `journeys.md` for how the two are kept non-duplicative.

### Exploratory / Deferred Verification

#### `PM-018 — [Deferred] Multiple or duplicate Details key/value pairs`
- **Type:** Exploratory / Deferred Verification
- **Priority:** P3
- **Purpose:** Records that only a single Details pair was ever tested in Discovery; whether 2+ pairs, or duplicate keys, are supported is unconfirmed.
- **Preconditions:** `CAT-001`; Add Product modal open.
- **Test Data:** Two or more Details key/value pairs, including one deliberate key collision.
- **Steps:** Attempt to add a second Details pair while one is already pending, and separately attempt two committed pairs sharing the same key.
- **Expected Outcome:** **Not asserted.** Recorded to observe actual behavior so `U-214` can be closed with real evidence.
- **Business Assertions:** None enforced.
- **Persistence / State Assertions:** N/A.
- **Cleanup:** Delete any product created in the course of this observation.
- **Dependencies:** `CAT-001`.
- **Traceability:** Feature Map → Product Management → Negative / Validation Behavior. Related unknown: `U-214`. Evidence for the single-pair-only confirmation: `EV-P2-041`.
- **Notes / Known Limitations:** None.

#### `PM-019 — [Deferred] Whether a Zone="Standard" product is truly unreachable under every specific Zone filter`
- **Type:** Exploratory / Deferred Verification
- **Priority:** P3
- **Purpose:** Records that Discovery did not cross-check the created product against every individual Zone filter option before the test product was deleted.
- **Preconditions:** A temporary product exists (Zone defaults to "Standard", per `PM-010`).
- **Test Data:** The temporary product from `PM-010`.
- **Steps:** With the product present, apply each of the four specific Zone filter options (Dry / Frozen / Chilled / Room Temperature) in turn, waiting after each for the result to settle (the Zone display is stale while its request is in flight, `FIL-017`).
- **Expected Outcome:** **Not asserted as reachable or unreachable.** Recorded to observe actual behavior under each specific Zone option so `U-212` can be closed with real evidence.
- **Business Assertions:** None enforced.
- **Persistence / State Assertions:** N/A.
- **Cleanup:** Delete the product; Clear Filters.
- **Dependencies:** `PM-010`.
- **Traceability:** Feature Map → Product Management → Negative / Validation Behavior. Related unknown: `U-212`.
- **Notes / Known Limitations:** None.

#### `PM-020 — [Deferred] Price/Stock behavior at extreme values or non-numeric input`
- **Type:** Exploratory / Deferred Verification
- **Priority:** P3
- **Purpose:** Records that Price/Stock were never tested at extreme magnitude, high decimal precision, or with pasted non-numeric input.
- **Preconditions:** `CAT-001`; Add Product modal open.
- **Test Data:** A representative extreme value (e.g. a very large number, a high-precision decimal) and a non-numeric paste attempt.
- **Steps:** Attempt each input type in the Price/Stock fields.
- **Expected Outcome:** **Not asserted.** Recorded to observe actual behavior so `U-213` can be closed with real evidence.
- **Business Assertions:** None enforced.
- **Persistence / State Assertions:** N/A.
- **Cleanup:** Close via "Cancel" without saving, unless a product is inadvertently created, in which case delete it.
- **Dependencies:** `CAT-001`.
- **Traceability:** Feature Map → Product Management → Known Unknowns. Related unknown: `U-213`.
- **Notes / Known Limitations:** None.

## Scenario Count

21 scenarios (`PM-001`–`PM-021`): 3 Positive (Add) + 7 Validation/Boundary + 1 Business Rule (Defaults) + 3 Edit (Positive/Persistence) + 3 Delete (Positive/Business Rule/Persistence) + 1 Lifecycle (Positive/Cross-Feature Journey) + 3 Exploratory/Deferred Verification = **21**. Of these, **18 are implementation-ready** (`PM-001`–`PM-017`, `PM-021`) and **3 are deferred** (`PM-018`–`PM-020`). The Validation/Boundary group is `PM-004`–`PM-009` plus `PM-021`. Every mutating scenario operates on self-created data only, per Architecture §10.5.

> **Note on a corrected tally.** The previous version of this line read "20 scenarios … 3 Positive, 5 Validation/Boundary, …", whose parts summed to 19 rather than the stated 20. The total of 20 was correct; the Validation/Boundary figure was understated — that group held 6 scenarios (`PM-004`–`PM-009`), not 5. The breakdown above is the corrected arithmetic with `PM-021` added.
