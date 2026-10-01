# DISCOVERY STATE — QACLOUD Market UI Automation

**Current status (reconciled 2026-09-27):** Discovery **COMPLETE and APPROVED** — Pass 0, Pass 1 and Pass 2 including all three addenda, evidence through `EV-P2-069`. Later execution-based reconciliation evidence is kept in `FEATURE-MAP.md` as register rows `D-01`–`D-39` (Shopping Basket, 2026-09-24) and `D-40`–`D-46` (Order Lifecycle, 2026-09-26); this file and `EVIDENCE-LOG.md` are otherwise historical. Project status: `docs/project-history/PROJECT-HISTORY.md`.

**Pass status as last recorded during Discovery (historical):** PASS 2 — Catalog / Basket / Checkout / Orders (NOT YET APPROVED — Categories/Clear Filters addendum, Product Management/Add Product addendum, AND U-211/Product Card Actions addendum all complete, awaiting user sign-off). *Approval was subsequently given.*
**Application:** QA Cloud Market (`/market.html`), reached via the shared QA Cloud portal (`/`)
**Last updated:** Pass 2 U-211 + Product Card Actions addendum
**Test identity:** Unchanged since Pass 1. Authentication uses the configured regression test account, a pre-existing QACLOUD account (username `<TEST_ACCOUNT_HANDLE>`, email `<TEST_ACCOUNT_EMAIL>`). `.env` holds this account's email + password only — no API key is stored anywhere in the project.
**Residual data state after Discovery — later record (added 2026-09-27):**
- **Leftover test product `AUT-3ba49d-24-bsk017b`** (a framework-created Basket test product, `BSK-017` product B, builder defaults) was found in the catalog on 2026-09-26, where it caused `FIL-011`, `FIL-012` and `FIL-018` to fail. Which run leaked it is NOT VERIFIED. It was **removed manually by the project owner through the UI** (not by the automation), and its absence was verified through the UI before the full suite ran.
- **Foreign order `O64856`** (delivered; one "Aged Gouda Wedge", a seed product, $14.99; created 2026-09-26 20:16:55 UTC+3) appeared from outside the test suite, which orders only self-created `AUT-` products and never selects Delivered. Its origin is NOT VERIFIED. It consumed one unit of seed stock irreversibly and is left untouched, like seed order `O52638`.
- After the 2026-09-27 full run: 33 products, no `AUT-` products, basket empty, orders `O52638` and `O64856` only (CONFIRMED FROM EXECUTION, read-only check).

**Known residual data state from Discovery (disclosed, not hidden; historical):** Product "Hass Avocado" stock is 8 units instead of its pre-session value of 9, left over from one test order that was created then fully deleted via the UI (order record itself has no residual trace). An attempt to restore the stock count via the real Edit-Product UI was blocked by the session's own permission gate ("Modify Shared Resources"). See BLOCKER-P2-001 and EV-P2-020. **Addendum 1 housekeeping:** a stray leftover basket item ("100% Florida Orange Juice") was found and removed at the start of the Categories addendum session — see EV-P2-034. **Newly discovered at the start of Addendum 2:** that same "100% Florida Orange Juice" product is now missing from the entire catalog (not just the basket) — 33 products instead of 34 — see EV-P2-035 and U-211. **Addendum 2 data:** one temporary product ("ZZZ Discovery Temp Item") was created, edited, and deleted through the real UI during this session; verified fully removed with catalog count/inventory value returned exactly to the pre-creation baseline (33 products, $2138.31) — see EV-P2-042–049. No other persistent data was left behind by Addendum 2. **Addendum 3 (read-only):** U-211 investigated exhaustively via UI + raw read-only network evidence; the product is confirmed permanently gone server-side by exact Product ID (`97051025-c9b2-4981-afda-f5d99ca490ca`), but the causal mechanism remains unconfirmed (correlation with a prior "Remove" action only, not proof) — see EV-P2-050–058. No mutation of any kind was attempted on this or any other product during Addendum 3. **Credential-safety note:** during Addendum 3's ownership check, an already-issued `/api/profile` network response was inspected and incidentally returned the account's plaintext API key inline (that endpoint's normal response shape); it was not saved to any file and is not reproduced anywhere in project docs — see the disclosure note at the top of the Addendum 3 evidence section.

---

## Status Legend
`Explored` — structure inventoried with evidence · `Partially Explored` — some structure captured, more remains · `Blocked` — cannot proceed without a prerequisite (e.g., auth) · `Not Started` — known to exist, not yet opened

## Surfaces Discovered

| Surface | Route | Status | Notes |
|---|---|---|---|
| Portal root | `/` | Explored (surface-level) | Header, nav, search, Live Status ticker, app grid, tools grid captured. No footer. |
| Login/Register modal | modal on `/` | Partially Explored | Both tabs' fields inventoried (labels only); no submission attempted. |
| Market app shell | `/market.html` | Explored | Authenticated-accessible; full session, header, and stats behavior explored across Pass 1 + Pass 2. |
| Market Products tab | `/market.html` (tab) | Explored (Categories/Clear Filters now thoroughly explored) | Catalog structure, search, category/zone/type/sort filters, product detail modal, add-to-basket all explored (EV-P2-001–009). Category selection/multi-selection/OR-semantics/removal/Clear Filters/cross-filter behavior now rigorously verified with arithmetic proof (EV-P2-021–033). Confirmed reproducible filter bugs: EV-P2-005 (Zone/Type/Sort one-step delay) and EV-P2-033 (chip-vs-result-count transient mismatch, one instance). |
| Market Basket tab | `/market.html` (tab) | Explored | Add/increment/decrement/remove/clear-all, subtotal/totals, persistence (reload + logout/login) all explored (EV-P2-007–015). One confirmed severe bug (EV-P2-009), one confirmed UI-staleness bug (EV-P2-014). |
| Market Orders tab | `/market.html` (tab) | Explored | List, expand/collapse, status lifecycle + terminal-state lock, delete-with-confirmation all explored (EV-P2-016–018). |
| Market Add/Edit/Delete Product | modal on `/market.html` | Explored | Add Product fully explored: exact fields, native-validation rules (required order, min=0 boundaries), Details key/value editor, successful creation, silent Zone="Standard"/Type="Each" defaults, product-detail modal field set, reload persistence (EV-P2-036–046). Edit Product (on self-created data) and Delete Product both explored and completed without permission block (EV-P2-047–049). Edit/Delete on *pre-existing seed* products remains as previously documented (BLOCKER-P2-001) — not re-tested. |
| Market Wiki | `/market/wiki` | Partially Explored | Opened in Pass 1 while checking for an email-verification bypass; contains API-automation task lists, not yet read for UI-relevant content. |
| Market API Docs | `/market/docs` | Partially Explored | Opened in Pass 1 (Swagger-style page); not inspected in depth (out of scope check only). |
| Market Data Viewer | `/market-viewer.html` | Partially Explored | Confirmed reachable without auth; needs a pasted API key to load data. Not used further (out of Pass 1 scope, and no API key stored per credential-safety rules). |
| Profile page | `/profile.html` | Partially Explored | **Now authenticated-accessible** (EV-P1-014): post-login destination. Shows account details and a permanent API key (deliberately not recorded anywhere). Confirmed still gated when unauthenticated/logged-out (EV-P1-007, EV-P1-018). |
| Login/Register modal — Forgot Password sub-view | modal on `/` | Partially Explored | Structure inventoried in Pass 1 (EV-P1-006); submission intentionally not performed. |
| Feedback | `/feedback` | Not Started | Out-of-scope, platform-wide link observed on portal header. |
| Tools (JSON Diff, CC Generator, ID Generator, Barcode Gen) | `/tools/*` | Not Started | Out of scope for this project — recorded for map completeness only. |
| Other portal apps (Hotel, Bank, TaskTracker, Rental, Sandbox, Crypto, SeatMatrix, Data Integrity Hub) | `/hotel.html`, `/bank.html`, etc. | Not Started | **Out of scope** — belong to other QA Cloud projects, not `QACLOUD-Market-UI-Automation`. |

## Navigation Items Catalogued

**Portal root header:** qacloud logo (→ `/`), "Applications" (`#apps`), "JSON Diff", "CC Generator", "ID Generator", "Barcode Gen", "Feedback" (`/feedback`), "Login / Register" button.

**Market app header (pre-redirect):** "qacloud Market Shopping" brand (→ `/`), "🛒 Basket" (count badge), "📖 Wiki" (`/market/wiki`), "API Docs" (`/market/docs`), "🔍 Data Viewer" (`/market-viewer.html`), "← Profile" (`/profile.html`), "☀️" theme toggle.

**Market app tabs (pre-redirect):** "🛍️ Products", "🛒 Basket", "📦 Orders".

## Workflows Identified / Explored

- Registration — CONFIRMED FROM EXECUTION (fields: Username, email, Password min 6 chars w/ live strength meter, Confirm password, Bootcamp name optional, "Register Now"). Result: "✅ Registration Successful!" + required email verification. (Performed on the now-superseded disposable username only.)
- Login — **CONFIRMED FROM EXECUTION, successful** (EV-P1-014), using the pre-existing regression account. Prior attempts on the disposable username failed for two distinct, now-understood reasons: unverified-account gate (`403`, `"Please verify your email first"`) and, separately, wrong password (`401`, `"Invalid username or password"`) — confirming the server does distinguish the two failure modes.
- Forgot password — structure confirmed (EV-P1-006); submission not performed (out of scope).
- Post-login destination — CONFIRMED: `/profile.html` (EV-P1-014).
- Authenticated-state indicators — CONFIRMED: header "Logout" button + username, "Welcome back" profile text (EV-P1-014).
- Session persistence across navigation and reload — CONFIRMED (EV-P1-015, EV-P1-016).
- Logout — CONFIRMED (EV-P1-017): redirects to `/`, header reverts to "Login / Register".
- Re-access to protected pages after logout — CONFIRMED (EV-P1-018): same 401-then-redirect gating as pre-login.
- Market Products browsing — CONFIRMED (EV-P2-001): 34 real products, per-user-owned inventory with 👁️/✏️/🗑️ management icons on every card.
- Search — CONFIRMED (EV-P2-002/003): requires real keystroke events (not value-fill); live-filters correctly; empty-search copy doesn't distinguish "no matches" from "no products at all".
- Category filter — CONFIRMED (EV-P2-004): applies immediately and correctly.
- Zone/Type/Sort filters — CONFIRMED FROM EXECUTION, **buggy** (EV-P2-005): apply one interaction late (confirmed reproducible 3×).
- Product detail (👁️) — CONFIRMED (EV-P2-006): modal with category/price/stock/specifications/product ID.
- Add to basket — CONFIRMED (EV-P2-007): "ADD" becomes an inline stepper; header badge = item count, "Basket Units" = total quantity.
- Basket quantity increment — CONFIRMED (EV-P2-008), works (minor render-timing caveat only).
- Basket quantity decrement — CONFIRMED FROM EXECUTION, **buggy in one instance** (EV-P2-009): a 404 on `PUT /api/basket` silently wiped the entire basket with no visible error; a second isolated attempt succeeded normally — condition-dependent, not fully isolated.
- Basket: Remove single item — CONFIRMED (EV-P2-011), works correctly.
- Basket: Clear All — CONFIRMED (EV-P2-012), native browser `confirm()` dialog, works correctly.
- Basket persistence across logout/login — CONFIRMED (EV-P2-013), correct (account-scoped).
- Basket persistence across full reload — CONFIRMED FROM EXECUTION, **buggy** (EV-P2-014): server data correct, but header/stats display stuck at 0 until the Basket tab itself is opened.
- Checkout ("Place Order") — CONFIRMED (EV-P2-015): single-click from basket, no address/shipping/payment form of any kind exists. Success modal with order number, total, line items.
- Orders list + detail — CONFIRMED (EV-P2-016): collapsible rows; expanded view shows items, an editable Status dropdown (Pending/Processing/Shipped/Delivered/Cancelled), and Delete Order.
- Order status terminal-state rule — CONFIRMED (EV-P2-016): Status dropdown is `disabled` once an order is "Delivered".
- Order status update — CONFIRMED FROM EXECUTION, **UI-staleness bug** (EV-P2-017): succeeds server-side immediately, but the row badge needs a manual Refresh click to reflect it.
- Delete Order — CONFIRMED (EV-P2-018): custom confirmation modal (different pattern from Clear All's native dialog); verified working cleanup path.
- Add Product — CONFIRMED FROM EXECUTION (EV-P2-036–046): Name/Category/Price/Stock (all `required`, native HTML5 validation, ordered field-by-field; Price/Stock share a `min=0` boundary) + optional dynamic Details key-value pairs (add-one-at-a-time editor, removable table rows). Confirmed gap: no Zone/Type field present despite those existing on every product — created products silently default to Zone="Standard" (not a real filter option) and Type="Each". Save succeeds silently (no toast); catalog list and header stats update immediately with no delay-bug behavior; new product persists across reload.
- Edit Product — CONFIRMED FROM EXECUTION on self-created data (EV-P2-047): identical form/fields to Add Product, correctly pre-filled; saved successfully with **no permission block** — clarifies that BLOCKER-P2-001 is scoped to the harness's own classifier reacting to pre-existing/seed data, not an app-level restriction on editing in general.
- Delete Product — CONFIRMED FROM EXECUTION on self-created data (EV-P2-048/049): native browser `confirm()` dialog (same pattern as Clear Basket, unlike Delete Order's custom modal); deletion verified permanent via reload, with catalog count/inventory value returning exactly to baseline.

## Blocked Items — All Resolved

- **BLOCKED-001 (resolved):** Was: all authenticated Market app exploration blocked by the unauthenticated 401-then-redirect gate. **Resolved by successful login** — see EV-P1-014 through EV-P1-018.
- **BLOCKER-P1-001 (historical, superseded):** The original disposable test account (`<ABANDONED_TEST_ACCOUNT>`) registered successfully but could not complete email verification (non-resolving `.test` email domain). See EV-P1-002, EV-P1-004, EV-P1-005, EV-P1-008.
- **BLOCKER-P1-002 (historical, superseded):** Investigation into changing that account's email found no dedicated UI flow, an ambiguous re-registration behavior (EV-P1-009), and a rejected attempt to associate a different, owner-supplied email address (EV-P1-011, `409 "Email already registered"` — which itself revealed the real resolution below).
- **Resolution:** The `409` conflict revealed that `<TEST_ACCOUNT_EMAIL>` already has its own pre-existing account on the platform. The project owner confirmed that this pre-existing account should be used as the regression account and supplied its working credentials directly. Login succeeded (EV-P1-014). The disposable username is abandoned/superseded rather than actively used going forward; no further action is needed on it.

**No open blockers remain for Pass 1.**

- **BLOCKER-P2-001 (open, low impact; scope clarified by Addendum 2, further confirmed by Addendum 3):** The auto-mode permission classifier blocked both "Save" and "Cancel" clicks inside the Edit Product modal ("Modify Shared Resources") while attempting to restore Hass Avocado's stock from 8 back to 9 — Hass Avocado being a **pre-existing seed** product. No workaround attempted. Leaves one disclosed residual data change (see header, and EV-P2-020). **Addendum 2 clarification (EV-P2-047):** this is a restriction from the Claude Code harness's own tool-call permission classifier, not a QACLOUD application-level authorization control — editing and deleting a **self-created** product in the same session completed with no block at all. **Would need explicit user-granted permission (or the user doing it manually) to resolve the Hass Avocado stock specifically** — not a blocker to Pass 2's completion, since the core Catalog/Basket/Checkout/Orders scope, and now Add/Edit/Delete Product on session-owned data, were fully covered without it.
- **BLOCKER-P2-002 (new in Addendum 3, open, low impact, same family as BLOCKER-P2-001):** Clicking 🗑️ Delete on Hass Avocado (pre-existing seed product) was blocked by the same harness classifier ("Modify Shared Resources") *before any confirmation dialog appeared*, even though the intent was only to observe and then dismiss the confirmation, not delete. Not retried. Confirms the classifier's restriction covers Delete's initiating click on seed data too, not just Edit's Save/Cancel (the original BLOCKER-P2-001 finding). The Edit modal itself, on this same seed product, was **not** blocked for opening, reading its pre-filled values, or closing via the "×" control (Save/Cancel were deliberately avoided this time rather than re-tested, to avoid unnecessarily re-triggering the same block). See EV-P2-067/068.

## Unknowns / Unresolved Questions

See `EVIDENCE-LOG.md` for full detail: Pass 0 (U-001–U-008), Pass 1 (U-101–U-105, mostly resolved), Pass 2 (U-201–U-218). Key open items:
- U-201: exact trigger condition for the basket-wiping decrement bug (EV-P2-009) — needs isolated repeated reproduction.
- U-202: whether "Cancelled" order status is also terminal like "Delivered".
- U-203: whether Temperature Zone / Type can be set outside of Add Product. **Now confirmed they cannot be set through Add Product itself (EV-P2-036/043) — still unknown whether any other UI path can set them.**
- U-204: basket quantity vs. available-stock boundary validation — not tested (cost/data-creation reasons).
- U-205: ~~full Edit Product / Delete Product behavior~~ — **now explored for self-created data (EV-P2-047–049)**; remaining open question is only whether the permission classifier behaves the same way for Edit/Delete on *other* pre-existing seed products (not just Hass Avocado).
- U-206: whether the one-step-delay bug family (EV-P2-005/014/017) shares a single root cause across the app, or is coincidentally similar in separate places.
- U-207–U-210: see Categories/Clear Filters addendum (Addendum 1) in EVIDENCE-LOG.md.
- U-211: root cause of the missing "100% Florida Orange Juice" catalog product. **Now extensively investigated (Addendum 3, EV-P2-050–058):** confirmed permanently gone server-side by exact Product ID, ruled out the original 404 bug as the direct cause (product was confirmed intact afterward), and narrowed the likely trigger to the "Remove" basket action from EV-P2-034 by timing — but no network capture of that exact action exists, so causation remains unconfirmed. See U-215 for the specific residual gap.
- U-212: whether a product with Zone="Standard" is truly unreachable under every specific Zone filter option — not cross-checked before the test product was deleted.
- U-213: Price/Stock field behavior at large values, high decimal precision, or non-numeric paste — not tested.
- U-214: whether multiple Details key/value pairs (2+) can coexist, and duplicate-key behavior — only one pair was tested.
- U-215: exact causal mechanism behind U-211 — no network capture exists of the specific "Remove" action that immediately preceded the product's disappearance.
- U-216: how View Details renders a product with zero Specifications, or with duplicate detail keys — no naturally-occurring example existed among products inspected.
- U-217: whether Product Card action visibility would differ for a product not owned by the current account — untestable within a single-account session (every product shares the account's own owner_id).
- U-218: true click-outside-modal (backdrop) close behavior for View Details — not cleanly testable via ref-based clicking.

Carried over from earlier passes, still open and non-blocking: "Get Started"/"Applications" anchor behavior; full contents of Wiki/API Docs pages; "Reset Password" submission; `/profile.html` "Change Password" flow.

## Next-Pass Candidates (Pass 3 scope proposal, not started)

1. Isolated, repeated reproduction of the basket-decrement bug (EV-P2-009 / U-201) to nail down its exact trigger.
2. Edit Product and Delete Product flows, once BLOCKER-P2-001 is resolved (permission granted, or user performs the stock-restore manually).
3. Stock/quantity boundary validation in the basket (U-204).
4. `/profile.html` "Change Password" and "Copy API Key" flows (structure only — no destructive changes without explicit instruction).
5. Any remaining cross-feature journeys not yet exercised (e.g., a second concurrent order, multi-item orders beyond the pre-existing O52638).

## Pass 0 Completion Checklist

- [x] Landing page inspected (portal root `/`)
- [x] Global navigation inspected
- [x] Header inspected (portal + Market pre-redirect)
- [x] Footer inspected (confirmed absent on portal root)
- [x] Obvious reachable routes inspected (portal grid links catalogued by URL; Market shell reached once)
- [x] Visible entry points catalogued
- [x] Authentication entry points identified (Login/Register modal, both tabs)
- [x] Basket/cart entry point identified (Market header basket button + Basket tab, pre-redirect)
- [x] Product/catalog entry points identified (Market Products tab/panel, pre-redirect)
- [x] Order/account entry points identified (Market Orders tab pre-redirect; Profile link; Data Viewer link)
- [x] Obvious dialogs/forms inspected (Login/Register modal, both tabs)
- [x] Unknowns and blocked areas logged
- [x] No deep workflow was prematurely executed (no login/register submission, no checkout, no destructive action)

**Pass 0 status: COMPLETE.**

## Pass 1 Completion Checklist

- [x] Registration flow inspected and executed (fields, live validation, success state) — on the now-superseded disposable username
- [x] Login attempted and diagnosed on the disposable account (unverified-account gate, then confirmed-wrong-password — two distinct, now-understood 403/401 outcomes)
- [x] Invalid-login case observed (multiple non-brute-force attempts, each individually justified — see EV-P1-005, EV-P1-012, EV-P1-013)
- [x] **Successful login reached** — EV-P1-014, using the user's pre-existing QACLOUD account with credentials the user supplied directly
- [x] Authenticated-state indicators identified — EV-P1-014 ("Logout" button, username display, profile content)
- [x] Session persistence across navigation — EV-P1-015
- [x] Session persistence across reload — EV-P1-016
- [x] Direct access to protected Market-ecosystem routes checked both unauthenticated (`/market.html`, `/profile.html` — gated) and authenticated (both accessible) — EV-P0-010/011, EV-P1-007, EV-P1-015
- [x] Logout behavior — EV-P1-017
- [x] Behavior after logout — EV-P1-017 (reverts to unauthenticated header state)
- [x] Re-access to protected pages after logout — EV-P1-018 (re-gated, identical to pre-login behavior)
- [x] "Forgot password?" entry point inspected (structure only; not submitted, per no-password-reset rule)
- [x] Visible auth-related validation/error/success messages recorded (registration success text; silent-UI login failures + underlying API error messages, including the 403-vs-401 distinction)
- [x] No destructive actions taken (no password reset submitted, no account deletion, no profile data changed, no "Change Password" attempted)
- [x] Credential hygiene maintained throughout: password never printed; the account's permanent API key (discovered on `/profile.html`) treated with the same secrecy and never stored; every raw Playwright snapshot file found to contain a plaintext credential was deleted immediately; `.env` holds only QACLOUD application credentials (email + password), never any mailbox credential; `.playwright-mcp/` is git-ignored as a standing safeguard

**Pass 1 status: COMPLETE and APPROVED.** All objectives from the original Pass 1 scope have been reached and evidenced, using the configured regression test account, a pre-existing QACLOUD account (not the originally-planned disposable identity — that plan was superseded once the email-conflict finding (EV-P1-011) revealed the account already existed, and the project owner chose to proceed with it directly).

## Pass 2 Completion Checklist

- [x] Catalog entry point, structure, and per-user-owned inventory model identified (EV-P2-001)
- [x] Search explored, including its real-keystroke-only quirk and empty-state copy gap (EV-P2-002/003)
- [x] Category filter explored (EV-P2-004)
- [x] Zone/Type/Sort filters explored — one confirmed reproducible bug found (EV-P2-005)
- [x] Product detail view explored (EV-P2-006)
- [x] Add-to-basket, quantity increment explored (EV-P2-007/008)
- [x] Quantity decrement explored — one confirmed severe bug found, condition-dependent (EV-P2-009)
- [x] Basket structure, Remove, Clear All explored (EV-P2-010–012)
- [x] Basket persistence across logout/login (correct) and full reload (buggy display) explored (EV-P2-013/014)
- [x] Checkout/order-creation explored — confirmed no payment/address system exists (EV-P2-015)
- [x] Orders list, detail, status lifecycle, terminal-state rule explored (EV-P2-016/017)
- [x] Order deletion (cleanup path) explored and used (EV-P2-018)
- [x] Add Product form structure inspected, not submitted (EV-P2-019)
- [x] Cross-feature journey traced end-to-end: Catalog → Basket → Checkout → Orders → Delete, plus Catalog → Basket → logout/login → Basket
- [x] Data minimized: one test order, cleaned up via the real UI Delete Order flow
- [x] Residual state fully disclosed, not hidden: Hass Avocado stock (8 vs. original 9) — see BLOCKER-P2-001
- [x] No backend/API shortcuts used for any cleanup — only real UI actions attempted (one blocked by the permission system, left as-is rather than worked around)
- [x] No large volumes of test data created (one order, three basket line items across the session, one abandoned-unsaved product edit)
- [x] No automation code, tests, Page Objects, or fixtures created
- [x] Evidence classifications used consistently (CONFIRMED / CONFIRMED FROM EXECUTION / NOT VERIFIED throughout; no INFERRED or CONTRADICTED needed this pass)

**Pass 2 initial pass: internally complete** (all checklist items above satisfied), **but not yet approved by the user** — a Categories/Clear Filters follow-up was requested before sign-off. See the addendum checklist below.

## Pass 2 Addendum Checklist — Categories / Clear Filters

- [x] Exact 10 category names captured, confirmed all visible without expand/scroll (EV-P2-021)
- [x] Control type confirmed (non-semantic clickable `generic` elements, no ARIA state) (EV-P2-021)
- [x] Selected/unselected visual states captured via screenshot; a third transient focus-outline state noted (EV-P2-022)
- [x] Single-category selection verified: immediate, correct, no URL/route change (EV-P2-023)
- [x] Multi-category selection tested at 2 and 3 categories (EV-P2-024)
- [x] OR/union semantics **proven by exact arithmetic**, not inferred from appearance (EV-P2-024, EV-P2-026)
- [x] Removing one category from a multi-selection verified: remaining stay selected, correct result set (EV-P2-025)
- [x] Removing all categories individually verified: clean return to unfiltered 34-product baseline (EV-P2-026)
- [x] All 10 categories selected simultaneously tested: allowed, no cap, equals full catalog (EV-P2-027)
- [x] Clear Filters exact label, enabled-state, and behavior verified across single-category, multi-category, and mixed-filter-type scenarios, including a pending/undisplayed change (EV-P2-028)
- [x] Clear Filters confirmed to reset ALL filter types (category, search, sort, zone, type) in one immediate action (EV-P2-028)
- [x] Interaction timing for Categories confirmed immediate and consistent across ~15 data points, contrasted explicitly with the known Zone/Type/Sort delay (EV-P2-029)
- [x] Cross-filter: Category + Zone tested and AND semantics proven by exact arithmetic, twice (EV-P2-030)
- [x] Cross-filter: Category + Search tested, AND semantics confirmed, plus a discovery that search also matches hidden product "Details" data (EV-P2-031)
- [x] Cross-filter: Category + Sort tested, confirmed sort applies within the filtered subset (EV-P2-032)
- [x] Cross-filter: Category + Type — **not independently arithmetic-verified** (U-210); expected by strong analogy only
- [ ] A subtler, single-instance anomaly (chip text vs. result count mismatch) was found and honestly reported as not-fully-isolated (EV-P2-033, U-208) — flagged for later dedicated reproduction, not resolved here
- [x] No products created or edited (saved); no orders created; only a pre-existing stray basket item was removed as housekeeping (EV-P2-034)
- [x] No automation code, tests, Page Objects, fixtures, or architecture created

**Addendum status: COMPLETE.** All 9 focus-area discovery requirements (category inventory, single-selection, multi-selection, removal, full removal, Clear Filters, all-10-selected, interaction timing, cross-filter interaction) have been investigated with execution-based evidence. One new sub-anomaly (EV-P2-033) and four new unknowns (U-207–U-210) were surfaced rather than resolved outright — reported transparently rather than glossed over. **This does not constitute Pass 2 approval** — that remains the user's decision.

## Pass 2 Addendum 2 Checklist — Product Management / Add Product

- [x] Real Add Product UI opened; exact fields and labels documented (Name, Category, Price, Stock, optional Details key/value) (EV-P2-036)
- [x] Every field's required/optional status determined via real submission attempts, not assumed (EV-P2-037–040)
- [x] Empty-value behavior captured for every required field, in order (EV-P2-037–039)
- [x] Invalid-value/boundary behavior captured: negative Price and negative Stock both rejected by a native `min=0` constraint (EV-P2-039/040)
- [x] Category field specifically verified: all 10 catalog categories present as options, default "Select category...", exactly one required, missing-category message captured ("Please select an item in the list.") — not inferred from catalog filtering behavior (EV-P2-036/038)
- [x] Multiple-category selection in Add Product: **not applicable** — the Category control here is a single-select `<select>`, structurally different from the multi-select filter chips explored in Addendum 1
- [x] A single, clearly-temporary, uniquely-named product ("ZZZ Discovery Temp Item") created through the real UI, using minimal realistic values (EV-P2-042)
- [x] Post-submission state captured: silent success (no toast), immediate catalog/stat update, correct sort placement, selected category/price/stock all correctly persisted (EV-P2-042)
- [x] Gap confirmed with execution evidence: created products silently default to Zone="Standard" (not a real Zone filter option) and Type="Each", since Add Product exposes neither field (EV-P2-043)
- [x] Reload/persistence behavior confirmed (EV-P2-046)
- [x] Product detail (👁️) modal's exact field set captured, including the discovery that it omits Zone/Type entirely and that Details render there as "Specifications" (EV-P2-045)
- [x] Cleanup performed and verified: temp product deleted through the real UI, confirmed gone immediately and after a full reload, with counts/inventory value returned exactly to the pre-creation baseline (EV-P2-048/049)
- [x] Edit Product explored on the self-created product: same form as Add Product, correctly pre-filled, saved with no permission block (EV-P2-047)
- [x] Delete Product explored: native `confirm()` dialog identified, contrasted explicitly with Delete Order's custom modal (EV-P2-048)
- [x] Permission-system question answered directly: Add Product, and Edit/Delete on self-created data, are **not** subject to the "Modify Shared Resources" block that BLOCKER-P2-001 documented for a pre-existing seed product; that block's scope is now clarified as harness-classifier behavior tied to pre-existing data, not an app-level restriction on Product Management generally
- [x] Hass Avocado residual stock state left untouched, as instructed — no unrelated data restoration attempted
- [x] A pre-existing anomaly was discovered (not caused) at session start — "100% Florida Orange Juice" missing from the entire catalog, not just the basket — reported honestly as NOT VERIFIED root cause rather than ignored or overclaimed (EV-P2-035, U-211)
- [x] No automation code, tests, Page Objects, fixtures, or architecture created
- [x] No API/backend shortcuts used at any point

**Addendum 2 status: COMPLETE.** All 16 Product Management / Add Product discovery requirements have been investigated with execution-based evidence, including a full create → view → edit → delete lifecycle on a single minimal temporary product, verified clean afterward. One pre-existing data-integrity anomaly was surfaced (not created) and reported transparently rather than resolved. **This does not constitute Pass 2 approval, and Pass 3 has not been started** — both remain the user's decision.

## Pass 2 Addendum 3 Checklist — U-211 + Product Card Actions

- [x] U-211 investigated strictly read-only: no product created, edited, deleted, or restored (EV-P2-050–058)
- [x] Catalog visibility checked via unfiltered list, Search ("Orange"/"Florida"), and Category filter (Beverages) — all agree the product is absent (EV-P2-050–052)
- [x] Product Management UI recognition checked — no card, no edit/delete attempted since none exists to target (EV-P2-058)
- [x] Read-only raw network evidence inspected: `/api/products` (33 products, exact-ID absence confirmed), `/api/basket` (empty), `/api/profile` (ownership correlation) — no write requests issued (EV-P2-053–055)
- [x] Basket correlation performed using only existing evidence + one retained old snapshot file (recovered the exact Product ID) — the destructive scenario was **not** reproduced, no product was deleted or modified to test it (EV-P2-056/057)
- [x] Ownership/authorization determined from observable evidence only: all 33 current products, and by strong inference the missing one, are owned by the current account itself — not shared/global, not another user's (EV-P2-054)
- [x] U-211 given a final, honest classification: confirmed data loss, unconfirmed cause — not overclaimed as a proven defect with a known trigger
- [x] Credential-safety incident (incidental API key exposure in a network-response inspection) disclosed transparently, not hidden; key not saved to any file, not reproduced in any doc
- [x] Product Card structure documented: exact three action controls, control type (buttons, emoji-only accessible names), consistency confirmed across multiple products (EV-P2-059)
- [x] View Details presentation fully characterized: modal type, no URL change, two close controls, background present-but-not-interactable (confirmed via an actual intercepted-click error, not inferred) (EV-P2-060)
- [x] Escape-key behavior tested directly: does not close the modal (EV-P2-061)
- [x] Close/filter-state preservation tested via both close controls, with an active search filter as the test condition (EV-P2-062)
- [x] Complete View Details field list captured and Zone/Type absence explicitly re-verified on 3 additional real (non-self-created) products (EV-P2-063)
- [x] Card vs. Details data consistency checked field-by-field; the Stock Status label inconsistency (EV-P2-006) reconfirmed as reproducible on a second product, not a one-off (EV-P2-064)
- [x] Specifications/Details rendering mechanism documented (key formatting, array-value joining, stable ordering); empty/duplicate-key cases left honestly unresolved rather than manufactured (EV-P2-065)
- [x] Loading/error/empty states checked via network-request comparison — no fresh fetch occurs, so no error state is reachable through this control (EV-P2-066)
- [x] Edit verified on a pre-existing seed product (not just self-created data): correctly pre-filled, closed without saving, no mutation occurred (EV-P2-067)
- [x] Delete verified on a pre-existing seed product to the extent possible: blocked by the harness's own permission classifier before any dialog appeared; not retried or worked around; existing confirmation-text evidence relied upon instead (EV-P2-068, BLOCKER-P2-002)
- [x] Cross-action identity consistency (Part C) proven directly against raw server data, not inferred: View Details, Edit, and Delete all target one identical product record per card (EV-P2-069)
- [x] No new products, orders, or accounts created; no seed/shared product deleted or modified; no API/backend write shortcuts used
- [x] No automation code, tests, Page Objects, fixtures, or architecture created

**Addendum 3 status: COMPLETE.** U-211 was investigated as exhaustively as read-only evidence allows, reaching a confirmed-loss/unconfirmed-cause conclusion rather than either overclaiming a proven defect or leaving it fully unexamined. Product Card Actions (View Details, Edit, Delete) were fully characterized, with View Details as the primary focus receiving a complete presentation/data/consistency/rendering/error-state investigation across multiple real products. One credential-handling incident occurred and was disclosed transparently per standing protocol. **This does not constitute Pass 2 approval, and Pass 3 has not been started** — both remain the user's decision.
