# Feature: Search & Filtering

[← Back to Test Design master](../TEST-DESIGN.md)

## Feature Overview

**Purpose:** Narrows and reorders the Product Catalog's result set via free-text Search, ten toggleable Category chips, a Zone dropdown, a Type dropdown, a Sort dropdown, and a single "Clear Filters" reset. Search narrows the already-loaded result on the page; Category, Zone, Type, Sort and Clear Filters each reload the result set from the server (Architecture §15.2; `FIL-021` Notes).

**Business scope:** Search matching, Category multi-select semantics, cross-dimension combinations (Category+Zone, Category+Search, Category+Sort — all confirmed intersection/AND; Category+Type NOT VERIFIED), Zone/Type/Sort selection including their confirmed display-timing defect, and Clear Filters.

**Authentication:** Required (inherits from Product Catalog).

**Entry point:** `/market.html`, Products tab — search textbox, "📦 Categories" chip list, and Sort/Zone/Type comboboxes, rendered above the product grid.

**Dependencies:** Product Catalog (supplies the result set being filtered).

## Coverage Scope

This is the richest feature file in this Test Design, reflecting the depth of Discovery's own investigation (Pass 2 base + a dedicated Categories/Clear Filters addendum). Covered: search matching and no-match behavior, all ten categories represented across selection scenarios, multi-select OR semantics (two- and three-category), select-all, remove-one, remove-all, confirmed cross-dimension intersections, the Zone/Type/Sort stale display while a filter request is in flight (documented, never "fixed" in test design), and Clear Filters across every confirmed combination.

**Explicitly not covered here:** anything about the catalog's own loading/rendering (`catalog.md`) or the View Details modal's behavior once opened (`product-details.md`) — this file only covers the filtering/search *mechanism* and its effect on the visible result set.

## Preconditions

- Authenticated session; a populated catalog (`CAT-001`).
- Per-category, per-zone, and per-search-term product counts are knowable from the live catalog at execution time — this file's cross-filter scenarios rely on **arithmetic verification against the live catalog**, exactly as Discovery did (e.g. `count(A) + count(B) = count(A OR B)`), not hardcoded expected counts, since the catalog's contents have already changed once during this project (`EV-P2-035`) and may change again.

## Test Data Requirements

| Kind | Detail |
|---|---|
| **Existing/seed data** | All scenarios in this file are read-only against the existing catalog. No product is created, edited, or deleted. |
| **Temporary/generated data** | None. |
| **Ownership** | N/A — read-only feature. |
| **Cleanup requirement** | **Filter/search UI state itself requires no cleanup** — it is confirmed pure client-side state with no URL/hash persistence (`EV-P2-023`), so a fresh browser context or a "Clear Filters" action fully resets it. Scenarios should still end in a clean (Clear Filters) state as good practice, per Architecture §10.2, to avoid leaving stray UI state for a next scenario in the same context. |

## Scenarios

### Search

#### `FIL-001 — Search returns matching products for a valid term`
- **Type:** Positive
- **Priority:** P0
- **Purpose:** Confirms the core search mechanism, including the confirmed requirement that it must be driven by real, per-character keystrokes.
- **Preconditions:** `CAT-001`.
- **Test Data:** A search term known to match at least one product (resolved at execution time against the live catalog — not hardcoded).
- **Steps:** Type the term into the search box **character by character** (a bulk value-set is confirmed not to trigger filtering).
- **Expected Outcome:** The result list narrows to products matching the term; the "N products shown" summary updates; the active-filter chip shows the search term.
- **Business Assertions:** Every visible product is a genuine match for the term (by name or, per `FIL-005`, hidden detail data); the result count is less than or equal to the full catalog count.
- **Persistence / State Assertions:** N/A.
- **Cleanup:** Clear the search field / Clear Filters at scenario end.
- **Dependencies:** `CAT-001`.
- **Traceability:** Feature Map → Search & Filtering → Main Workflows ("Search"). Evidence: `EV-P2-002`.
- **Notes / Known Limitations:** The keystroke requirement is a UI mechanic (Architecture §7.3 assigns it to the `FilterBar` component) — this scenario's *design* intent is the business outcome (correct filtering), and the mechanic is a precondition for that outcome to even be observable.

#### `FIL-002 — Search with no matching term shows the no-results state`
- **Type:** Negative / Boundary
- **Priority:** P1
- **Purpose:** Confirms the no-match UI state, and is this Test Design's chosen way of exercising an "empty catalog view" state without destructively emptying the real catalog (see `catalog.md`'s explicit deferral of this to here).
- **Preconditions:** `CAT-001`.
- **Test Data:** A search term guaranteed not to match any product (e.g. a deliberately implausible string) — resolved and confirmed against the live catalog at execution time, not assumed.
- **Steps:** Type a non-matching term character by character.
- **Expected Outcome:** "0 products shown" (or equivalent zero-count summary); the empty-state message "No products found. Add your first product!" is displayed.
- **Business Assertions:** Result count is exactly zero; no product cards render.
- **Persistence / State Assertions:** N/A.
- **Cleanup:** Clear the search field.
- **Dependencies:** `CAT-001`.
- **Traceability:** Feature Map → Search & Filtering → Negative / Validation Behavior. Evidence: `EV-P2-003`.
- **Notes / Known Limitations:** Discovery confirmed this exact copy does not distinguish "no matches" from "genuinely empty catalog" (`EV-P2-003`) — this is a documented UX gap, not something this scenario needs to resolve; the scenario only asserts the no-match case, which is the only one reachable non-destructively.

#### `FIL-003 — Clearing the search text restores the unfiltered result set`
- **Type:** Positive
- **Priority:** P2
- **Purpose:** Confirms the search box's live-filter mechanism operates symmetrically when text is removed, using the same confirmed per-keystroke mechanism as `FIL-001`.
- **Preconditions:** An active, matching search term is applied (`FIL-001`).
- **Test Data:** None additional.
- **Steps:** Clear the search box's text back to empty, via real input events.
- **Expected Outcome:** The full, unfiltered catalog result set is restored.
- **Business Assertions:** Result count returns to the full catalog count.
- **Persistence / State Assertions:** N/A.
- **Cleanup:** None (search is already cleared by this scenario's own action).
- **Dependencies:** `FIL-001`.
- **Traceability:** Feature Map → Search & Filtering → Main Workflows. Evidence basis: `EV-P2-002` (the same confirmed live-filter mechanism, applied in reverse).
- **Notes / Known Limitations:** **Transparency note:** Discovery's own evidence explicitly documents typing a term in and using "Clear Filters" to reset (`EV-P2-028`); it does not separately capture manually clearing the search text back to empty character-by-character as its own data point. This scenario is designed on the reasonable expectation that the same confirmed live-filter mechanism (`EV-P2-002`) applies symmetrically, not on a directly-captured Discovery observation of this exact action. Kept at P2 accordingly.

#### `FIL-004 — Search matches hidden product Details data, not just the visible name`
- **Type:** Positive / Business Rule
- **Priority:** P1
- **Purpose:** Confirms a genuinely surprising, confirmed business rule: search is not limited to the product name field.
- **Preconditions:** `CAT-001`.
- **Test Data:** A search term known (from the live catalog) to match a product's Details/specification data but not its visible name — Discovery's own example was a "milk"-type detail value on a non-dairy-named product.
- **Steps:** Type the term character by character.
- **Expected Outcome:** The product whose hidden Details data (not name) matches the term is included in the result set.
- **Business Assertions:** A product without the term in its visible name still appears in the filtered results.
- **Persistence / State Assertions:** N/A.
- **Cleanup:** Clear the search field.
- **Dependencies:** `CAT-001`.
- **Traceability:** Feature Map → Search & Filtering → Categories (cross-filter note). Evidence: `EV-P2-031`. Related unknown: `U-207` (the exact matching detail field on "Aged Gouda Wedge" was never opened/confirmed at the field level — this scenario asserts only that *some* hidden-data match occurs, not which exact field).
- **Notes / Known Limitations:** Does not assert the specific field name behind the match, per `U-207`.

### Categories

#### `FIL-005 — Selecting a single category filters the catalog to that category`
- **Type:** Positive
- **Priority:** P0
- **Purpose:** Confirms the baseline category-selection mechanism, and that it applies immediately with no delay (unlike Zone/Type/Sort).
- **Preconditions:** `CAT-001`.
- **Test Data:** Any one of the ten confirmed categories (🥦 Fresh Produce, 🥩 Meat & Seafood, 🥚 Dairy & Eggs, 🍞 Bakery, 🫙 Pantry, 🧃 Beverages, 🍿 Snacks, 🧊 Frozen, 🏠 Household, 📦 Other).
- **Steps:** Click one category chip.
- **Expected Outcome:** The result set narrows to that category immediately, with no additional interaction required; the active-filter chip shows "1 category".
- **Business Assertions:** Every visible product belongs to the selected category; the result count matches that category's known live count.
- **Persistence / State Assertions:** N/A.
- **Cleanup:** Clear Filters.
- **Dependencies:** `CAT-001`.
- **Traceability:** Feature Map → Search & Filtering → Categories. Evidence: `EV-P2-023` (immediate application), `EV-P2-029`.
- **Notes / Known Limitations:** None.

#### `FIL-006 — Selecting two categories combines results with OR/union semantics`
- **Type:** Positive / Business Rule
- **Priority:** P0
- **Purpose:** Confirms multi-select category semantics using the same arithmetic-proof technique Discovery used — this is a core, non-obvious business rule (OR, not AND, within one filter dimension).
- **Preconditions:** `CAT-001`.
- **Test Data:** Two categories with independently-known live counts.
- **Steps:** Note the result count for category A alone; note it for category B alone; select both simultaneously.
- **Expected Outcome:** The combined result count equals `count(A) + count(B)` (assuming no product is in both categories — verified at execution time), i.e. the union, not the intersection.
- **Business Assertions:** Combined count = sum of individual counts (or the true union count, if overlap exists); every visible product belongs to A or B.
- **Persistence / State Assertions:** N/A.
- **Cleanup:** Clear Filters.
- **Dependencies:** `CAT-001`.
- **Traceability:** Feature Map → Search & Filtering → Categories (Confirmed semantics). Evidence: `EV-P2-024` (proved via exact arithmetic, 6 + 7 = 13).
- **Notes / Known Limitations:** None.

#### `FIL-007 — Selecting three categories continues the OR/union pattern`
- **Type:** Positive / Business Rule
- **Priority:** P2
- **Purpose:** Confirms the OR pattern generalizes beyond two selections, using the same technique.
- **Preconditions:** `CAT-001`.
- **Test Data:** A third category added to `FIL-006`'s two.
- **Steps:** With two categories already selected, add a third.
- **Expected Outcome:** The combined result count equals the running union total.
- **Business Assertions:** Combined count matches the arithmetic union; every visible product belongs to one of the three.
- **Persistence / State Assertions:** N/A.
- **Cleanup:** Clear Filters.
- **Dependencies:** `FIL-006`.
- **Traceability:** Feature Map → Search & Filtering → Categories. Evidence: `EV-P2-024` (13 + 7 = 20, the same evidence entry's second step).
- **Notes / Known Limitations:** Priority is P2, not P0/P1 like `FIL-006` — it exercises the identical business rule one increment further, which Discovery's own evidence already proves generalizes; kept as a distinct scenario for direct traceability to `EV-P2-024`'s second arithmetic step, not because it carries independent risk.

#### `FIL-008 — Selecting all ten categories returns the full unfiltered catalog`
- **Type:** Boundary / Positive
- **Priority:** P1
- **Purpose:** Confirms the upper boundary of category selection — no cap exists, and selecting everything is equivalent to selecting nothing.
- **Preconditions:** `CAT-001`.
- **Test Data:** All ten confirmed categories.
- **Steps:** Select all ten category chips.
- **Expected Outcome:** The result count equals the full, unfiltered catalog count.
- **Business Assertions:** Result count = total catalog count.
- **Persistence / State Assertions:** N/A.
- **Cleanup:** Clear Filters.
- **Dependencies:** `CAT-001`.
- **Traceability:** Feature Map → Search & Filtering → Categories. Evidence: `EV-P2-027`.
- **Notes / Known Limitations:** None.

#### `FIL-009 — Removing one category from a multi-selection returns to the remaining combination`
- **Type:** Positive
- **Priority:** P1
- **Purpose:** Confirms deselection works correctly and immediately, not just selection.
- **Preconditions:** Two or more categories selected (`FIL-006`).
- **Test Data:** Same two categories as `FIL-006`.
- **Steps:** Deselect one of the two selected categories.
- **Expected Outcome:** The result set immediately reflects only the remaining category, matching its known individual count.
- **Business Assertions:** Result count equals the remaining category's standalone count.
- **Persistence / State Assertions:** N/A.
- **Cleanup:** Clear Filters.
- **Dependencies:** `FIL-006`.
- **Traceability:** Feature Map → Search & Filtering → Categories. Evidence: `EV-P2-025`.
- **Notes / Known Limitations:** None.

#### `FIL-010 — Removing all selected categories returns to the unfiltered baseline`
- **Type:** Positive / Boundary
- **Priority:** P1
- **Purpose:** Confirms the lower boundary of category selection — deselecting everything individually (not via Clear Filters) cleanly returns to no active category filter.
- **Preconditions:** One or more categories selected.
- **Test Data:** Same selection as `FIL-009`.
- **Steps:** Deselect the remaining category one at a time until none are selected.
- **Expected Outcome:** The result set returns to the full, unfiltered catalog.
- **Business Assertions:** Result count = total catalog count; active-filter chip shows no category filter.
- **Persistence / State Assertions:** N/A.
- **Cleanup:** None (already clean).
- **Dependencies:** `FIL-009`.
- **Traceability:** Feature Map → Search & Filtering → Categories. Evidence: `EV-P2-026`.
- **Notes / Known Limitations:** Distinct from `FIL-020` (Clear Filters) below — this scenario verifies individual deselection, not the dedicated reset control.

### Cross-filter

#### `FIL-011 — Category + Zone combine with AND/intersection semantics`
- **Type:** Positive / Business Rule
- **Priority:** P0
- **Purpose:** Confirms that, unlike the OR semantics *within* the Category dimension, two *different* filter dimensions intersect — a critical, easily-inverted business rule.
- **Preconditions:** `CAT-001`.
- **Test Data:** One category and one Zone value with independently-known live counts.
- **Steps:** Select a category; note the result count. Additionally select a Zone value; note the new count.
- **Expected Outcome:** The combined result count equals the true intersection of the category's products and the zone's products (verified arithmetically against the live catalog), not their union.
- **Business Assertions:** Every visible product matches **both** the selected category and the selected zone.
- **Persistence / State Assertions:** N/A.
- **Cleanup:** Clear Filters.
- **Dependencies:** `CAT-001`.
- **Traceability:** Feature Map → Search & Filtering → Categories (Cross-filter behavior). Evidence: `EV-P2-030` (proven twice with exact counts).
- **Notes / Known Limitations:** Because the Zone display is stale while its request is in flight (`FIL-017`), this scenario's verification step must account for that — see `FIL-017`'s synchronization note; this scenario asserts the **final, settled** state, not the immediately-post-click display.

#### `FIL-012 — Category + Search combine with AND/intersection semantics`
- **Type:** Positive / Business Rule
- **Priority:** P1
- **Purpose:** Confirms the same intersection rule holds for Category + Search, the second of the two independently-confirmed cross-dimension pairs.
- **Preconditions:** `CAT-001`.
- **Test Data:** One category and one search term with independently-known live counts.
- **Steps:** Select a category; note the result count. Additionally enter a search term (keystroke-by-keystroke); note the new count.
- **Expected Outcome:** The combined result count equals the true intersection.
- **Business Assertions:** Every visible product matches both the category and the search term.
- **Persistence / State Assertions:** N/A.
- **Cleanup:** Clear Filters.
- **Dependencies:** `CAT-001`.
- **Traceability:** Feature Map → Search & Filtering → Categories (Cross-filter behavior). Evidence: `EV-P2-031`.
- **Notes / Known Limitations:** Unlike Zone, Search is confirmed **not** subject to that stale display (`EV-P2-002`, `EV-P2-023`), so this scenario's result should be immediately observable with no settling wait — a useful contrast if `FIL-011`/`FIL-017` ever need to be compared side by side.

#### `FIL-013 — Category + Sort applies sorting within the category-filtered subset`
- **Type:** Positive / Business Rule
- **Priority:** P2
- **Purpose:** Confirms Sort operates on the already-filtered subset, not the full catalog, when both are active together.
- **Preconditions:** `CAT-001`.
- **Test Data:** One category and one Sort direction.
- **Steps:** Select a category; note the resulting (unsorted or default-sorted) product order. Change Sort; note the new order.
- **Expected Outcome:** The result set remains scoped to the selected category (same count as `FIL-005`'s single-category case), but its internal order reflects the chosen sort.
- **Business Assertions:** Result count is unchanged by the Sort change; product order changes to match the selected direction, within the category-filtered set.
- **Persistence / State Assertions:** N/A.
- **Cleanup:** Clear Filters.
- **Dependencies:** `CAT-001`.
- **Traceability:** Feature Map → Search & Filtering → Categories (Cross-filter behavior). Evidence: `EV-P2-032`.
- **Notes / Known Limitations:** Sort is one of the three controls whose display is stale while the request is in flight (`FIL-017`) — this scenario's order assertion must be read after the display has settled, exactly as `FIL-017` documents; this scenario does not attempt to "fix" or hide that defect, it simply verifies the *eventual* correct sorted-and-filtered state.

### Exploratory / Deferred Verification

#### `FIL-014 — [Deferred] Category + Type intersection is NOT confirmed to be AND`
- **Type:** Exploratory / Deferred Verification
- **Priority:** P3
- **Purpose:** Records the one cross-dimension pair Discovery did **not** independently arithmetic-verify, so a future session does not silently assume it behaves like the other three (Zone/Search/Sort) by analogy.
- **Preconditions:** `CAT-001`.
- **Test Data:** One category and one Type value.
- **Steps:** Select a category; note the count. Additionally select a Type value; note the new count.
- **Expected Outcome:** **Not asserted as AND or otherwise.** The scenario's purpose is to record the actual combined count so `U-210` can eventually be closed with real evidence — implementation must not encode an expected intersection value here.
- **Business Assertions:** None enforced as pass/fail.
- **Persistence / State Assertions:** N/A.
- **Cleanup:** Clear Filters.
- **Dependencies:** `CAT-001`.
- **Traceability:** Feature Map → Search & Filtering → Categories (Cross-filter behavior, explicitly marked NOT VERIFIED). Related unknown: `U-210`.
- **Notes / Known Limitations:** Type selection shows the same stale display while its request is in flight (`FIL-017`) — any future promotion of this scenario to a confirmed Business Rule scenario must account for that separately.

### Zone / Type / Sort

#### `FIL-015 — Selecting a Zone value narrows the catalog to that zone`
- **Type:** Positive
- **Priority:** P1
- **Purpose:** Confirms the basic Zone filter mechanism works correctly at the server/state level, independent of its confirmed display-timing defect.
- **Preconditions:** `CAT-001`.
- **Test Data:** One Zone value (Dry / Frozen / Chilled / Room Temperature) with a known live count.
- **Steps:** Select a Zone value, wait for the catalog request that change triggered to complete, then verify the settled state. No second interaction is needed or used: the display settles on its own (`FIL-017`). *(Reconciled 2026-09-28: this step previously offered "trigger one further interaction with a Zone/Type/Sort control" as a way to settle the display, which `FIL-017` contradicts.)*
- **Expected Outcome:** The **eventual, settled** result set matches the selected zone's known count.
- **Business Assertions:** Every visible product (once settled) belongs to the selected zone.
- **Persistence / State Assertions:** N/A.
- **Cleanup:** Clear Filters.
- **Dependencies:** `CAT-001`.
- **Traceability:** Feature Map → Search & Filtering → Alternate Workflows. Evidence: `EV-P2-005` (underlying correctness of the applied state, distinct from its display timing).
- **Notes / Known Limitations:** This scenario intentionally verifies the *settled* outcome, not the immediate post-click display — see `FIL-017` for the dedicated defect-detection scenario that verifies the *immediate* (stale) display on purpose.

#### `FIL-016 — Selecting a Type value narrows the catalog to that type`
- **Type:** Positive
- **Priority:** P2
- **Purpose:** Confirms the basic Type filter mechanism (Weighted / Each), independent of its display-timing defect.
- **Preconditions:** `CAT-001`.
- **Test Data:** One Type value with a known live count.
- **Steps:** Select a Type value; verify the settled result set.
- **Expected Outcome:** The eventual result set matches the selected type's known count.
- **Business Assertions:** Every visible product (once settled) matches the selected type.
- **Persistence / State Assertions:** N/A.
- **Cleanup:** Clear Filters.
- **Dependencies:** `CAT-001`.
- **Traceability:** Feature Map → Search & Filtering → Alternate Workflows. Evidence: `EV-P2-005`.
- **Notes / Known Limitations:** Lower priority than `FIL-015` — Type is the least independently-explored of the three delayed controls (no dedicated arithmetic proof beyond the general delay-bug evidence).

#### `FIL-017 — [Defect] Zone/Type/Sort changes display a transient stale state before settling`
- **Type:** Regression / Defect Detection
- **Priority:** P1
- **Purpose:** Watches a confirmed, reproducible display anomaly: after a Zone/Type/Sort change the result count, active-filter chip, and product order keep presenting their **previous, now-incorrect** values while the filter request is in flight, rather than indicating that a result is pending. This scenario exists specifically to **detect regressions in that behavior's presence or absence** — it must not be worked around by test-side compensation (double-clicking, retry-until-green wrappers) per Architecture §3.4/§15.4. Waiting for the in-flight request to complete is ordinary asynchronous synchronization, not compensation.
- **Preconditions:** `CAT-001`.
- **Test Data:** Any Zone, Type, or Sort value change.
- **Steps:** Change one of the three controls (Zone, Type, or Sort). Immediately inspect the visible result count and active-filter chip. Then, **without performing any second interaction with any control**, observe the display until the in-flight filter request completes.
- **Expected Outcome (currently observed, documented as a known defect, not a desired behavior):** Immediately after the change the visible result count, active-filter chip, and product order remain at their **pre-change** state. Once the in-flight filter request completes, the display **settles on its own** to the correct new filtered/sorted state, with **no second interaction required**. The stale window measured during implementation was approximately **400–700 ms**.
- **Business Assertions:** The display is stale immediately after the change (matching the confirmed anomaly); the display then settles to the correct state without any further interaction.
- **Persistence / State Assertions:** The underlying application state is correct as soon as the request the change triggered returns, and the display reflects it at that point — the dual assertion (stale display immediately, correct display once settled) is what distinguishes a transient display anomaly from a real data bug.
- **Cleanup:** Clear Filters (confirmed to reset every dimension in one immediate action, `EV-P2-028`).
- **Dependencies:** `CAT-001`.
- **Traceability:** Feature Map → Search & Filtering → Negative / Validation Behavior (confirmed reproducible anomaly). Evidence: `EV-P2-005` (reproduced 3x). Related unknown: `U-206` (whether this also affects tab-switch buttons — **not** asserted either way by this scenario, which is scoped to Zone/Type/Sort only, exactly as confirmed).
- **Notes / Known Limitations:**
  - **Revised after the Search & Filtering implementation pass.** This scenario previously stated that the display updates *only* once a **second** interaction with Zone, Type, or Sort occurs. That causal claim is **CONTRADICTED FROM EXECUTION**: direct live measurement on all three controls showed the display settling correctly on its own, permanently, with no second interaction — Zone and Type reaching their correct counts and chips, and Sort reaching its correct order, all within ~1 s. A second interaction is **sufficient but not necessary**. The root cause is that `applyFilters()` awaits `GET /api/products/filter`, whose round trip is ~600–750 ms; Discovery's snapshots were taken inside that window, so each one showed the previously-settled state and the chain of interactions read as "always one interaction behind".
  - `EV-P2-005` is **not** rewritten. Its observation — a stale display immediately after the change — stands and still reproduces. Only the *interpretation* of the mechanism is corrected, and that correction belongs here in the design layer, not in the historical Discovery record.
  - **Terminology (updated 2026-09-28).** This anomaly was originally labelled "one-step-late". That label has been replaced across this Test Design and Architecture by a description of the confirmed behavior: a stale display while the change's request is in flight. The guidance those cross-references give — assert the **settled** state, never compensate — is unchanged.
  - Type remains **Regression / Defect Detection** and priority remains **P1**: the scenario is the sentinel that would catch the stale window becoming permanent (the behavior originally believed to exist), growing materially, or the display ceasing to settle at all — each of which is a genuine filter-correctness regression.
  - If this anomaly is ever fixed — the display showing a pending state instead of stale values — this scenario is expected to start failing at its "stale immediately" assertion. That is the correct, intended outcome of a regression scenario, not a scenario to quietly update to keep passing (Architecture §3.4, §25.1). Any further change to this scenario's expected outcome requires an explicit Test Design update, not a silent implementation fix.

#### `FIL-018 — A category selected right after a Zone/Type/Sort change is combined with that change`
- **Type:** Positive / Business Rule
- **Priority:** P2
- **Purpose:** Confirms that when a user changes a Zone/Type/Sort control and then selects a category straight away, the catalog reflects both choices together: selecting the category does not drop or override the Zone/Type/Sort choice made just before it.
- **Preconditions:** `CAT-001`.
- **Test Data:** One Zone/Type/Sort value and one category, chosen from the live catalog so the expected intersection is known.
- **Steps:** Change a Zone/Type/Sort control. Straight away, without waiting for that change to settle and without any other interaction, select a category. Then wait until the displayed result reaches its settled state.
- **Expected Outcome:** The result set is the intersection of the selected category and the Zone/Type/Sort value, and the active-filter summary names both.
- **Business Assertions:** The result count equals the intersection computed from the live catalog; every visible product matches both the category and the Zone/Type/Sort value; the summary names both.
- **Persistence / State Assertions:** N/A.
- **Cleanup:** Clear Filters.
- **Dependencies:** `CAT-001`, and awareness of `FIL-017`.
- **Traceability:** Feature Map → Search & Filtering → Negative / Validation Behavior. Evidence: `EV-P2-030`'s note (`CONFIRMED FROM EXECUTION`: a Zone selection made just before a category click was reflected together with it).
- **Notes / Known Limitations:**
  - **Revised in the Search & Filtering Implementation Re-Alignment (2026-09-28, owner decision D4).** The scenario was previously named *"A category chip click flushes a pending Zone/Type/Sort change"*. Its Purpose said the click "also resolves any pending delayed change", and its Expected Outcome said "the category click resolves the pending staleness as a side effect". That framing came from the "one interaction late" reading of `EV-P2-005`, which is CONTRADICTED FROM EXECUTION (`FIL-017`). A Zone/Type/Sort change settles on its own, and every filter request carries the current value of all the controls (CONFIRMED FROM SOURCE INSPECTION; the `FIL-021` trace of 2026-09-27 shows a Zone request carrying the category and Sort already selected, CONFIRMED FROM EXECUTION). The category selection resolves nothing; its own request simply includes the Zone/Type/Sort value already chosen. The business behavior asserted, both choices combined, is unchanged.
  - **Evidence boundary.** The Zone/Type/Sort change and the category selection each send their own catalog request, none is cancelled, and the grid keeps whichever response arrives last (CONFIRMED FROM SOURCE INSPECTION). This scenario therefore passes only if the category's response is the last to arrive: that dependency on response order is INFERRED. If the Zone/Type/Sort-only response arrived last, the grid would show that value without the category and the count assertion would fail. This has never been observed: the scenario passed in every preserved full-run log (2026-09-27 at 10:56, 16:31 and 16:48; CONFIRMED FROM EXECUTION). No defect is established by this scenario, and it is not a race-condition test. A failure showing that pattern is to be reported with its request timing, linked to the historical race recorded in `FIL-021`'s Notes and `FIL-022`, never retried or relaxed (Architecture §20.7).
  - P2 because it is a secondary characterization of how the filter controls combine, not an independent risk.

### Clear Filters

#### `FIL-019 — Clear Filters resets a single active category filter`
- **Type:** Positive
- **Priority:** P1
- **Purpose:** Confirms the baseline Clear Filters behavior on the simplest active-filter state.
- **Preconditions:** One category selected (`FIL-005`).
- **Test Data:** None additional.
- **Steps:** Click "Clear Filters".
- **Expected Outcome:** The result set returns immediately to the full, unfiltered catalog; the active-filter chip is removed / shows "No active filters".
- **Business Assertions:** Result count = total catalog count.
- **Persistence / State Assertions:** N/A.
- **Cleanup:** None (already clean).
- **Dependencies:** `FIL-005`.
- **Traceability:** Feature Map → Search & Filtering → Categories (Clear Filters). Evidence: `EV-P2-028`.
- **Notes / Known Limitations:** None.

#### `FIL-020 — Clear Filters resets an all-ten-categories selection`
- **Type:** Boundary
- **Priority:** P2
- **Purpose:** Confirms Clear Filters behaves correctly even at the category-selection upper boundary.
- **Preconditions:** All ten categories selected (`FIL-008`).
- **Test Data:** None additional.
- **Steps:** Click "Clear Filters".
- **Expected Outcome:** Result set is the full catalog; no category chip remains visually selected.
- **Business Assertions:** Result count = total catalog count.
- **Persistence / State Assertions:** N/A.
- **Cleanup:** None.
- **Dependencies:** `FIL-008`.
- **Traceability:** Feature Map → Search & Filtering → Categories (Clear Filters). Evidence: `EV-P2-028` (tested in an all-10-categories scenario).
- **Notes / Known Limitations:** None.

#### `FIL-021 — Clear Filters resets every active dimension simultaneously`
- **Type:** Positive / Regression
- **Priority:** P0
- **Purpose:** Confirms that "Clear Filters" returns the catalog and every filter control to its default state in one action, starting from a combined state in which every other dimension is active, once the filter changes that built that state have completed. It is the only scenario that resets Search, Sort, Zone and Type together (`FIL-019` and `FIL-020` reset categories only). Clear Filters is also the reset other scenarios use part-way through to return to the unfiltered catalog (`FIL-006`, `FIL-007`, `FIL-009`, `FIL-018`, `DET-006`).
- **Preconditions:** `CAT-001`.
- **Test Data:** A combined active state built from the live catalog: one or more categories, at least one Zone/Type/Sort change, and a search term, applied in that order. The search term goes last because a later catalog reload redraws the grid without re-applying it (CONFIRMED FROM SOURCE INSPECTION); applied last, it is genuinely in effect when Clear Filters is clicked. Read-only; nothing is created.
- **Steps:** Apply a category, then a Zone/Type/Sort change; after each, wait for the catalog request that change triggered to complete. Then enter a search term. Search narrows the already-loaded result on the page and sends no catalog request, so wait instead until the active-filter summary shows the term. Confirm the summary names every active dimension. Click "Clear Filters", then wait for the catalog reload that Clear Filters triggers to complete.
- **Expected Outcome:** All five filter dimensions (Categories, Search, Sort, Zone, Type) are reset in one action. The search box is empty, Sort reads "Sort A-Z", Zone reads "All Zones", Type reads "All Products", the active-filter summary reads "No active filters", and the result set is the full catalog, matching the live baseline count.
- **Business Assertions:** Result count = total catalog count (the live baseline taken before any filter was applied); search box is empty; Sort, Zone and Type show their defaults; the active-filter summary reads "No active filters" — the chips expose no accessible selected state (`EV-P2-021`), so "no category chip is selected" is asserted through this summary.
- **Persistence / State Assertions:** N/A.
- **Cleanup:** None (already the cleanup action).
- **Dependencies:** `CAT-001`.
- **Traceability:** Feature Map → Search & Filtering → Categories (Clear Filters). Evidence: `EV-P2-028` (`CONFIRMED FROM EXECUTION` — from an all-10-categories state and from a mixed state of categories, search, Sort, Zone and Type, one click showed the full catalog, "No active filters" and every control at its default). Architecture §15.2, §15.4. The FIL-021 reconciliation (2026-09-27 – 2026-09-28) is recorded in the Notes below and in `docs/project-history/PROJECT-HISTORY.md` §9.
- **Notes / Known Limitations:**
  - **Revised in the FIL-021 Test Design Reconciliation (2026-09-28, owner-approved Option A).** The scenario was previously named *"… including a not-yet-displayed pending change"*. Its Purpose claimed a "confirmed ability to bypass the Zone/Type/Sort delay defect entirely"; its Test Data called for "a Zone/Type/Sort change left in its pending (undisplayed) state"; its Steps applied that change "without a settling second interaction"; and its Expected Outcome said "the pending, not-yet-displayed Zone/Type/Sort change is correctly discarded along with everything else". Those claims are withdrawn. The scenario now covers the settled workflow only. It makes no claim about request cancellation, stale-response handling or the order in which responses arrive.
  - **Revised again for owner decision D0 (2026-09-28).** The Steps now distinguish Search, which sends no catalog request, from the network-backed filters, and the Purpose describes Clear Filters as the in-test reset other scenarios use rather than as a teardown mechanism: no teardown in this suite uses it, since every test owns its own browser context.
  - **Synchronization.** Waiting for the catalog request a user action triggered, and for the summary to show a typed search term, are ordinary asynchronous synchronization, not compensation (Architecture §15.2, §15.4). Clicking "Clear Filters" while an earlier filter change's request is still in flight is **out of scope**: this scenario must not create that overlap, and its result says nothing about it either way. It uses no fixed wait, no retry and no control over network responses.
  - **Why the claims were withdrawn.** `EV-P2-028` was captured with clicks and snapshots only, with no network capture. Its "pending" label came from the "one interaction late" reading of `EV-P2-005`, which is CONTRADICTED FROM EXECUTION (`FIL-017`, Architecture §15.4). Whether a filter request was still in flight when Clear Filters was clicked was not observed (NOT VERIFIED); with snapshots seconds apart, the earlier requests had most likely completed (INFERRED). What `EV-P2-028` does confirm is the settled reset this scenario asserts. `EV-P2-028` itself is not rewritten.
  - **Historical observed race/anomaly (owner decision D2, 2026-09-28: recorded, not declared a confirmed application defect).** The test written for the previous design selected a Zone value and clicked Clear Filters about 54 ms later, while the Zone request was still in flight. In the first full-suite run after the repository cleanup (2026-09-27, 16:31 UTC+3) it failed. Evidence classification:
    - **Observed symptom — CONFIRMED FROM EXECUTION.** Every control read reset and the summary read "No active filters", but the grid showed 2 products (Strawberries, Granny Smith Apples) instead of the 33-product catalog, and still did at the 30 s test timeout.
    - **Request timing — CONFIRMED FROM EXECUTION.** The Zone request was issued at about 2983.6 ms and completed at about 3473.8 ms; the reload Clear Filters triggered was issued at about 3037.7 ms and completed at about 3447.2 ms. No catalog request followed.
    - **Source mechanism facts — CONFIRMED FROM SOURCE INSPECTION** (a saved copy of `/market.html`, inspected read-only; not an Evidence Log or register entry, owner decision D5). Each filter change and Clear Filters issue their own catalog request; Clear Filters resets the controls and starts its reload without awaiting it; no request is cancelled and no stale response is discarded; every response redraws the grid, so the last to arrive is what stays shown; the active-filter summary is recomputed from the live controls at each redraw.
    - **Causal relationship — INFERRED**, from the agreement between those facts and the trace.
    - **Frequency — NOT VERIFIED.** Across the recorded runs of the previous test it passed 8 times and failed once; no rate is claimed.
    - **Later reproduction attempt — CONFIRMED FROM EXECUTION.** The unchanged suite passed in full at 16:48 (97/97), this test included: not reproduced.
    - **That the race is fixed or absent — NOT VERIFIED.**
  - **Scope boundary and traceability (owner decision D3).** Option A is a test-design scope decision, not evidence that the race is gone, fixed or rare. The observation is linked to `FIL-022` / `U-208` for traceability only; see `FIL-022`'s Notes for what that link does and does not mean. No scenario covers the race, and none is to be created without a separate decision.
  - **Priority P0 (owner decision D1, 2026-09-28).** §5.2 defines P0 by the core purchase path, which this scenario is not on. This feature nonetheless gives P0 to its core mechanisms (`FIL-001`, `FIL-005`, `FIL-006`, `FIL-011`), and this scenario is P0 on the same footing: it is the only one-click reset of every filter dimension, and other scenarios depend on it part-way through (see Purpose). Priority records business impact and planning order only; it does not change runtime order, which the Playwright project graph sets.
  - This scenario is why Architecture recommends "Clear Filters" as the trustworthy reset primitive (Architecture §15.4) rather than resetting each dimension individually — in the settled state this scenario asserts.

### Regression / Defect Detection

#### `FIL-022 — [Deferred] One-time filter-chip-vs-result-count mismatch during rapid Zone/Sort changes`
- **Type:** Exploratory / Deferred Verification
- **Priority:** P3
- **Purpose:** Records a narrower, distinct-looking anomaly Discovery observed exactly once, without promoting it to a reproducible regression scenario the evidence does not support.
- **Preconditions:** `CAT-001`.
- **Test Data:** Rapid successive Zone/Sort changes.
- **Steps:** Perform rapid successive Zone and Sort changes in quick succession.
- **Expected Outcome:** **Not asserted as a reproducible pass/fail contract.** This scenario's purpose is to observe and record whether the filter-summary chip text and the actual result count/list transiently disagree with each other, as was seen once in Discovery.
- **Business Assertions:** None enforced — one occurrence is insufficient evidence to encode a reliable expected outcome (per Test Design §"Not Everything Becomes a Test": `NOT VERIFIED` mechanism leads to Exploratory, not Regression).
- **Persistence / State Assertions:** N/A.
- **Cleanup:** Clear Filters.
- **Dependencies:** `CAT-001`.
- **Traceability:** Feature Map → Search & Filtering → Negative / Validation Behavior. Evidence: `EV-P2-033` (one instance only). Related unknown: `U-208`. Related historical observation: the 2026-09-27 `FIL-021` failure (`FIL-021` Notes), linked for traceability only.
- **Notes / Known Limitations:** Explicitly **not** the same scenario as `FIL-017` — `FIL-017`'s stale display is reproducible (confirmed 3x) and is therefore a real Regression/Defect Detection scenario; this narrower mismatch is not, and is kept at Exploratory/P3 specifically to avoid overstating single-occurrence evidence, per the instruction to leave it as deferred investigation unless the evidence supports a meaningful reproducible scenario.
  - **Linked historical observation (2026-09-28, owner decision D3) — traceability only.** (1) This scenario remains Exploratory / Deferred and is **not implemented**; it is not active regression coverage. (2) The 2026-09-27 16:31 `FIL-021` failure is a second observed instance of the mismatch symptom this scenario records: the summary read "No active filters" while the grid showed a filtered result (CONFIRMED FROM EXECUTION, once; recorded in `FIL-021`'s Notes). (3) Request ordering and stale-response behavior are **NOT VERIFIED** and have no automated coverage anywhere in this suite. (4) This scenario does not verify request ordering, and linking the observation here does not make it do so. (5) `U-208` remains NOT VERIFIED and is not implemented coverage; the page source suggests candidate mechanisms (overlapping requests where the last response wins, and a search term that a catalog reload does not re-apply), but that either one explains `EV-P2-033` is INFERRED.

## Scenario Count

22 scenarios (`FIL-001`-`FIL-022`): 8 Positive, 1 Negative/Boundary, 5 Positive/Business Rule, 2 Boundary, 1 Regression/Defect Detection, 1 Positive/Regression, 2 Exploratory/Deferred Verification, 2 Positive (Zone/Type settled-state). All ten confirmed categories are represented across `FIL-005`-`FIL-010` (any one may be used per scenario, resolved at execution time — Discovery's own arithmetic-proof technique does not require exhaustively naming all ten in the design itself, only that the mechanism is proven, consistent with Test Count Discipline).
