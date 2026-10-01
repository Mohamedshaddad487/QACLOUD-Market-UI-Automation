# FEATURE MAP — QACLOUD Market UI Automation

---

## 0. Discovery Evidence Model

This document uses the same evidence vocabulary as `EVIDENCE-LOG.md`, applied consistently throughout:

| Label | Meaning |
|---|---|
| **CONFIRMED** | Directly supported by discovery evidence (observation, not necessarily an executed action). |
| **CONFIRMED FROM EXECUTION** | Confirmed through a real, executed UI action and its observed result. |
| **INFERRED** | Reasoned from evidence but not directly established by a dedicated test. |
| **NOT VERIFIED** | No sufficient execution evidence yet exists. |
| **CONTRADICTED** | Evidence conflicts with a prior statement. *(Originally unused. Later reconciliation passes recorded contradictions — e.g. the Order Lifecycle badge behavior, `D-40`.)* |
| **CONFIRMED FROM SOURCE INSPECTION** | *(Added 2026-09-27.)* Read from the application's own page source (the HTML/JavaScript served as `/market.html`), inspected read-only. Establishes what the page is **coded** to do, not what was observed in execution; never a substitute for execution evidence. First used in the Order Lifecycle reconciliation register (`D-44`–`D-46`); since 2026-09-28 also in reconciliation notes (Search & Filtering, C-1), with no Search & Filtering register (owner decision D5). |

A classification attached to any statement in this Feature Map means exactly what it means in the Evidence Log — nothing here should be read as more certain than its underlying evidence.

---

## 1. Document Purpose

**What this Feature Map represents.** A durable, business/domain-level reference describing what the QA Cloud Market application (`/market.html` and its authenticated ecosystem) actually contains and does, as established through hands-on UI discovery (Pass 0, Pass 1, Pass 2, and Pass 2's three addenda). It organizes the discovered application by **business feature**, not by test case, class name, or automation structure.

**Why it exists.** Discovery produced 69 Pass 2 evidence entries plus 18 Pass 1 and 12 Pass 0 entries, spread across a base pass and three addenda. That evidence is accurate but sequential and hard to navigate by feature. This document is the synthesized, feature-organized view of the same evidence — a map, not a new source of facts.

**How it should be used later.** As the starting reference for every subsequent phase of this project (Architecture, Test Design, Implementation). Anyone — human or a future Claude/ChatGPT session with no memory of this conversation — should be able to read this file plus the two source documents and understand the application well enough to plan automation work, without re-discovering the app from scratch.

**What it does NOT represent.**
- It is **not** a test plan, test case inventory, or assertion strategy.
- It is **not** an automation architecture, Page Object design, or fixture design.
- It is **not** a defect report — observed anomalies are described factually, with their actual evidence-backed classification, not asserted as filed bugs.
- It does **not** introduce any new facts beyond what `DISCOVERY-STATE.md` and `EVIDENCE-LOG.md` already establish. Where those documents are silent or incomplete, this document says so explicitly rather than filling the gap with assumption.

This Feature Map is derived entirely from completed UI Discovery and its evidence trail — it does not extend, reinterpret, or add to that evidence.

---

## 2. Project / Discovery Context

| | |
|---|---|
| **Project** | QACLOUD-Market-UI-Automation |
| **Target application** | QA Cloud Market (`/market.html`), reached via the shared QA Cloud portal (`/`) at `https://www.qacloud.dev` |
| **PASS 0 — Reconnaissance** | COMPLETE |
| **PASS 1 — Authentication & Session** | COMPLETE and **APPROVED** |
| **PASS 2 — Full UI Discovery** | COMPLETE and **APPROVED** (base pass + Categories/Clear Filters addendum + Product Management/Add Product addendum + U-211/Product Card Actions addendum, all internally consistent per the final documentation consistency check) |
| **Current phase** | STEP 4 — Feature Map (this document) |
| **Discovery completion boundary** | Discovery evidence runs through `EV-P2-069`. No discovery activity has occurred beyond that point at the time this Feature Map was written. |

**Relationship between the three documents:**

- **`docs/discovery/DISCOVERY-STATE.md`** — the status tracker: what's explored, what's blocked, what's outstanding, completion checklists per pass/addendum. Read this to know *where the project stands*.
- **`docs/discovery/EVIDENCE-LOG.md`** — the source of truth: every individual observation and executed test, in chronological/sequential order, each with an ID (`EV-P0-xxx`, `EV-P1-xxx`, `EV-P2-xxx`) and a classification. Read this to know *exactly what was observed and how*.
- **`docs/discovery/FEATURE-MAP.md`** (this file) — the synthesized, feature-organized view built from the two documents above. Read this first to get oriented, then follow its evidence references back into `EVIDENCE-LOG.md` for the exact underlying observation whenever more detail or verification is needed.

None of these three files is a substitute for the others. This Feature Map intentionally does not repeat every evidence entry verbatim — it summarizes and organizes, and always points back to the ID(s) that support each claim.

---

## 3. Feature Inventory

| Feature | Purpose | Authentication | Primary Entry Point | Major Dependencies | Key Workflows | Discovery Status | Evidence Range |
|---|---|---|---|---|---|---|---|
| **Authentication & Session** | Establish and maintain an authenticated identity for all other features | N/A (this *is* the auth feature) | `/` portal — "Login / Register" button | None (foundational) | Register, Login, Logout, session persistence | COMPLETE + APPROVED | `EV-P0-008/009`, `EV-P1-001–018` |
| **Product Catalog** | Browse the authenticated user's product inventory | Required | `/market.html` — "🛍️ Products" tab (default) | Authentication & Session | Browse catalog, view stats | Explored | `EV-P2-001`, `EV-P1-015` |
| **Search & Filtering** | Narrow the catalog result set (search text, Categories, Zone, Type, Sort, Clear Filters) | Required | Products tab — search box, category chips, filter dropdowns | Product Catalog | Search, category select, cross-filter, Clear Filters | Explored (Categories/Clear Filters rigorously; Zone/Type/Sort at baseline depth) | `EV-P2-002–005`, `EV-P2-021–033` |
| **Product Details / View Details** | Inspect full information for a single product | Required | Product card — 👁️ icon | Product Catalog | Open details, read fields, close | Explored | `EV-P2-006`, `EV-P2-045`, `EV-P2-059–066` |
| **Product Management** | Create, edit, and delete products in the user's own catalog | Required | Products tab — "+ Add Product" button; card ✏️ / 🗑️ icons | Product Catalog | Add Product, Edit Product, Delete Product | Explored | `EV-P2-019`, `EV-P2-020`, `EV-P2-036–049`, `EV-P2-067–069` |
| **Shopping Basket** | Hold selected products and quantities prior to ordering | Required | Header "🛒 Basket" button; "🛒 Basket" tab | Product Catalog (source of items) | Add, increment/decrement, remove, clear all | Explored | `EV-P2-007–014`, `EV-P2-034` |
| **Checkout / Order Creation** | Convert basket contents into a persisted order | Required | Basket tab — "📦 Place Order" button | Shopping Basket (must be non-empty) | Place Order → confirmation | Explored | `EV-P2-015` |
| **Orders Management** | View, inspect, and delete past orders | Required | Header "📦 Orders" tab | Checkout / Order Creation (source of orders) | List, expand/collapse, Delete Order | Explored | `EV-P2-016`, `EV-P2-018` |
| **Order Lifecycle** | Status progression of an individual order | Required | Order row — Status `<select>` | Orders Management | Change status, terminal-state lock | Explored (Delivered lock confirmed; Cancelled NOT VERIFIED in execution; badge behavior reconciled 2026-09-26) | `EV-P2-016`, `EV-P2-017`, `D-40`–`D-46` |

Nine business features were identified from the discovery evidence. No additional genuine business feature beyond these nine was found; Wiki, API Docs, Data Viewer, and Profile are either out-of-project-scope platform surfaces or already folded into Authentication & Session (see §4 and the Authentication section below) rather than standalone business features of the Market app itself.

---

## 4. Feature Dependency Map

### Primary sequential dependency chain (CONFIRMED — this is the order features must be exercised in to reach each other)

```
Authentication & Session
        ↓
  Product Catalog
        ↓
Search & Filtering  ←→  Product Details / View Details  ←→  Product Management
        ↓
  Shopping Basket
        ↓
Checkout / Order Creation
        ↓
  Orders Management
        ↓
  Order Lifecycle
```

### Relationship notes

- **Authentication & Session → everything else** — **CONFIRMED.** Every other feature is gated behind login; unauthenticated access to `/market.html` and `/profile.html` produces a `401`-then-client-redirect (`EV-P0-010/011`, `EV-P1-007`, `EV-P1-018`).
- **Product Catalog ↔ Search & Filtering** — **CONFIRMED.** Filtering operates on the catalog's already-loaded product set; it is not a separate data source (`EV-P2-002–005`, `EV-P2-066`'s "no new network request" finding, observed on View Details, is consistent with the same client-side-array pattern used throughout Products).
- **Product Management ↔ Product Catalog** — **CONFIRMED.** Add/Edit/Delete Product write directly to the same catalog that Search & Filtering and Product Details read from — a created product appears immediately in the unfiltered list and is immediately searchable/filterable (`EV-P2-042`, `EV-P2-046`).
- **Product Details / View Details → Product Catalog** — **CONFIRMED.** View Details renders from the catalog's already-fetched in-memory data, not a fresh per-product fetch (`EV-P2-066`).
- **Search / Filters → Catalog result set** — **CONFIRMED.** Category, Search, Zone, Type, and Sort all narrow/reorder the same underlying catalog array; Category+Zone and Category+Search were arithmetically proven to combine with AND/intersection semantics across filter *types*, while multiple Categories combine with OR/union semantics *within* the Category dimension (`EV-P2-024/026` for OR, `EV-P2-030/031` for AND).
- **Basket → Checkout prerequisites** — **CONFIRMED.** Checkout ("Place Order") is reached only from a populated Basket tab; no evidence exists of an alternate checkout entry point.
- **Checkout → Orders** — **CONFIRMED.** A successful "Place Order" creates a record that then appears in Orders Management (`EV-P2-015` → `EV-P2-016`'s observation of the newly-placed order O28634).
- **Orders Management → Order Lifecycle** — **CONFIRMED.** Order Lifecycle (the Status dropdown and its terminal-state rule) is a sub-capability reached only from within an expanded order row inside Orders Management — it is not a standalone surface.
- **Basket consumes Product Catalog stock at Checkout time** — **CONFIRMED.** Placing an order decrements the ordered product's stock count, observably and persistently, even after the order itself is later deleted (`EV-P2-020`).
- **Product Management (Delete) does not appear to be gated by Basket/Orders state** — **INFERRED**, not directly tested (no evidence exists of attempting to delete a product that is currently in a basket or referenced by an order).

Do not treat the diagram above as a finalized data-flow or software architecture — it reflects **observed business behavior and page/tab relationships**, not verified internal implementation.

---

## AUTHENTICATION & SESSION

### Purpose

Establishes and maintains the authenticated identity that every other Market feature depends on. Governs login, logout, session persistence, and the boundary between the public portal and the protected Market app ecosystem.

### Entry Point

- Portal root `/` — **"Login / Register"** button in the header, opening a modal with **"Login"** and **"Register"** tabs (`EV-P0-008/009`).
- Post-login destination: `/profile.html` (page title "My Profile | qacloud") (`EV-P1-014`).
- Authenticated header state: username (e.g. "<TEST_ACCOUNT_HANDLE>") + **"Logout"** button, replacing "Login / Register" (`EV-P1-014`).

### Authentication Requirement

This feature *is* the authentication boundary. All confirmed findings below establish that `/market.html` and `/profile.html` require an authenticated session; both are otherwise 401-gated with a client-side redirect back to `/` (`EV-P0-010/011`, `EV-P1-007`, `EV-P1-018`).

### Preconditions

- For Login: an existing, verified account. (`CONFIRMED` — an unverified account's login attempts fail with `403 "Please verify your email first"` even with the correct password, `EV-P1-004/005`.)
- For Register: none — reachable unauthenticated from the portal root.

### Main Workflows

**Registration** (`EV-P1-001, EV-P1-002`):
```
Portal root (/) → "Login / Register" → Register tab
→ fill Username, Email, Password, Confirm password (Bootcamp name optional)
→ "Register Now"
→ "✅ Registration Successful!" (email verification required before login)
```

**Login (established/verified account)** (`EV-P1-014`):
```
Portal root (/) → "Login / Register" → Login tab
→ fill "Username or Email", "Password"
→ "Login"
→ redirect to /profile.html, authenticated header state
```

**Logout** (`EV-P1-017`):
```
/profile.html → "Logout" button
→ redirect to /, header reverts to "Login / Register"
```

### Alternate Workflows

- **"Forgot password?"** — reachable sub-view with fields "Reset Password" heading, email textbox, "Send Reset Link" button, "← Back to Login" link. Structure only confirmed (`EV-P0-009`, `EV-P1-006`); submission was never performed (out of Discovery scope — no password resets were to be triggered).
- **Re-registration with an existing username, different email** — the public Register endpoint accepted this without a "username already exists" rejection (`EV-P1-009`). Whether this updates the same account or creates an ambiguous duplicate is **NOT VERIFIED**.

### Negative / Validation Behavior

- Wrong-password and unverified-account login attempts against an **unverified** account both produced the identical `403 {"error":"Please verify your email first"}` response, with **no visible on-page error/toast rendered at all** — the login form simply sits there silently (`EV-P1-004/005`). This is a confirmed UX gap: a real, informative server error exists but is never surfaced to the user.
- Against a **verified** account with a wrong password, the server distinguishes correctly: `401 {"error":"Invalid username or password"}` — still with no visible on-page feedback (`EV-P1-012/013`).
- Registering with an email already tied to an existing account: `409 {"error":"Email already registered"}` (`EV-P1-011`).
- Whether a verified account shows a *different* (non-silent) error UI than an unverified one is **NOT VERIFIED** (`U-102`) — both produce silent-UI failures in every case actually observed.

### State Changes

- Successful login: header switches from "Login / Register" to username + "Logout"; session becomes authenticated server-side (cookie/token-based, not just client JS state — confirmed by session surviving a full page reload, `EV-P1-016`).
- Logout: session is genuinely invalidated server-side — a subsequent direct navigation to `/market.html` re-triggers the same `401`-then-redirect gating seen pre-login, not merely a client-side UI change (`EV-P1-018`).

### Persistence

- Session persists across **navigation** to a different protected route (`EV-P1-015`) — **CONFIRMED FROM EXECUTION**.
- Session persists across a **full page reload** (`EV-P1-016`) — **CONFIRMED FROM EXECUTION**.
- Session does **not** persist across logout (by design — `EV-P1-017/018`).

### Data Requirements

- One authenticated account, already verified. This project uses the account the user identified as their own pre-existing QACLOUD account (`<TEST_ACCOUNT_HANDLE>` / `<TEST_ACCOUNT_EMAIL>`), supplied directly by the user after an originally-planned disposable test account could not complete email verification (`BLOCKER-P1-001/002`, resolved by `EV-P1-011`'s `409` conflict revealing the account already existed).
- Credentials live only in the project's git-ignored `.env` (email + password). **No password or API key is stored anywhere in the project**, and none appears anywhere in this Feature Map.

### Cleanup

- No destructive account actions were ever taken (no password reset submitted, no account deletion, no profile-data change, no "Change Password" attempted) — `Pass 1 Completion Checklist`.
- No cleanup is required for this feature; it is a login/logout state, not persisted business data.

### Cross-Feature Dependencies

All eight other features depend on this one being satisfied first. Nothing in Product Catalog, Search & Filtering, Product Management, Basket, Checkout, Orders, or Order Lifecycle is reachable without an authenticated session.

### Important UI Labels

"Login / Register" · "Create Account" · "Welcome Back" · "Username or Email" · "Password" · "Login" · "Register Now" · "Forgot password?" · "Logout" · "🔑 Change Password" · "📋 Copy API Key"

### Evidence

`EV-P0-008, EV-P0-009` (structure) · `EV-P1-001–018` (full workflow) · `EV-P0-010, EV-P0-011` (protected-route gating, pre-auth)

### Known Unknowns

- `U-102` — Whether a verified account would show a distinct, credential-specific login error UI (current evidence is entirely silent-UI).
- `U-103` — "Reset Password" flow behavior beyond its static structure — submission never attempted.
- `U-101` — "Get Started →" / "Applications" portal anchors — not Market-specific, carried over from Pass 0, not exercised.

### Known Blockers / Constraints

None currently open for this feature. `BLOCKER-P1-001` and `BLOCKER-P1-002` are **historical and superseded** — both were resolved when the regression account's credentials were supplied directly (`EV-P1-014`); no open blocker remains for Pass 1.

**Security-sensitive observation (non-secret note only):** `/profile.html` displays the account's permanent API key in plaintext as part of its normal, intended page content (`EV-P1-014`). This key **cannot be regenerated**, per the page's own on-screen text. During a later, unrelated read-only network inspection in Pass 2's third addendum, an already-issued `/api/profile` response was also found to return this same key inline in its JSON body (`EV-P2` Addendum 3 disclosure note). **No password or API key value appears anywhere in this Feature Map, the Evidence Log, or the Discovery State document** — this is recorded strictly as a non-secret behavioral fact about the application (the key is *displayed*/*returned* by design in these two normal, intended surfaces), not as a credential leak in project files.

---

## PRODUCT CATALOG

### Purpose

The authenticated user's own product inventory — a per-account catalog of products with full CRUD capability exposed directly on each card, not a shared/read-only storefront.

### Entry Point

`/market.html` — "🛍️ Products" tab, the default tab on load (`EV-P2-001`, `EV-P1-015`).

### Authentication Requirement

Required (`EV-P0-010/011`, `EV-P1-015`).

### Preconditions

Authenticated session (`EV-P1-014`).

### Main Workflows

```
Login → /market.html (Products tab, default)
→ Catalog populates from GET /api/products
→ Browse product cards
```

### Alternate Workflows

None beyond browsing — Search & Filtering, Product Details, and Product Management are documented as their own features below; they all operate *on* this catalog rather than being alternate catalog-browsing paths.

### Negative / Validation Behavior

- Unauthenticated access shows a stuck **"Loading products..."** state with all stats at zero, before the client-side redirect fires — genuinely-empty-catalog vs. loading-interrupted-by-redirect could not be distinguished at that time (`EV-P0-010`), but this was fully resolved once authenticated access confirmed a real, populated catalog (`EV-P1-015`).

### State Changes

- Header stats block: **"Products"** count, **"Basket Units"**, **"Orders"** count, **"Inventory Value"** — all four are live computed aggregates, confirmed to update immediately when catalog/basket/orders data changes (`EV-P2-012`'s note on Inventory Value recalculating; `EV-P2-042`'s immediate count/value update on product creation).
- Catalog product count has changed over the course of discovery — see **Data Requirements** below. Treat the *current* catalog state as whatever the latest addendum in `EVIDENCE-LOG.md` documents, not a fixed number.

### Persistence

Catalog data is server-side and account-scoped; confirmed to persist across logout/login (`EV-P2-013`, tested via Basket, which reads the same account-scoped data model) and across full reload (`EV-P1-016`).

### Data Requirements

**Historical catalog count (do not treat the current count as the original baseline):**

| Point in discovery | Product count | Inventory Value | Evidence |
|---|---|---|---|
| Original Pass 2 baseline | 34 | $2198.31 | `EV-P2-001` |
| Start of Categories addendum (Addendum 1) | 34 | — | `EV-P2-021` onward |
| Start of Product Management addendum (Addendum 2) | **33** (one product, "100% Florida Orange Juice", found missing — see Known Observations) | $2138.31 | `EV-P2-035` |
| After temporary product create+delete cycle (Addendum 2) | 33 (net zero — temp product created then fully cleaned up) | $2138.31 (restored exactly) | `EV-P2-049` |
| Confirmed again via raw API (Addendum 3) | 33 | — | `EV-P2-050, EV-P2-053` |

The catalog's **current** confirmed state, as of the end of discovery, is **33 products**. The original 34-product baseline is preserved here only for historical accuracy, per instruction — it must not be assumed to be the current state.

**Ownership model:** every product in the catalog shares one identical `owner_id`, which exactly matches the authenticated account's own user ID (`EV-P2-054`) — this is **per-account owned data**, not a shared/global storefront and not another user's data (`CONFIRMED FROM EXECUTION`). All 33 (formerly 34) products also share one identical `created_at` timestamp, indicating a single bulk-seed event rather than individually-created records (`EV-P2-053`).

### Cleanup

Not applicable at the catalog level (catalog itself isn't "cleaned up" — see Product Management for individual product cleanup, and Known Observations for the one unresolved catalog-level anomaly).

### Cross-Feature Dependencies

Depends on Authentication & Session. Is depended upon by Search & Filtering, Product Details / View Details, Product Management, and Shopping Basket (as the source of addable items).

### Important UI Labels

"Products" (tab + heading) · "Browse, search, filter, and manage catalog data from one operational view." · "+ Add Product" · "N products shown" · "No active filters"

### Product Card Structure (CONFIRMED FROM EXECUTION, `EV-P2-059`)

Every card exposes, consistently: a category-emoji icon → a group of exactly three icon-only `button`-role controls (**👁️** / **✏️** / **🗑️**, accessible name = the emoji itself, no extra label text) → product name (`heading`, level 3) → category text → a Zone/Type badge row → price (`paragraph`) → stock text (`paragraph`, either `"N in stock"` or `"⚡ Low Stock: N left"`, threshold ≤9 — `EV-P2-001`) → a separate **"ADD"** button.

Whether card-action visibility would differ for a product **not** owned by the current account is **NOT VERIFIED** (`U-217`) — every product in this account's catalog shares the account's own `owner_id`, so no cross-ownership scenario exists to test.

### Evidence

`EV-P2-001` (structure/baseline) · `EV-P2-053, EV-P2-054` (raw ownership data) · `EV-P2-059` (card structure) · `EV-P1-015` (authenticated access)

### Known Unknowns

- `U-006` — Who can access "+ Add Product" (admin-only vs. any authenticated user) — only ever tested with one account.
- `U-217` — Cross-ownership card-action visibility, untestable within a single-account session.

### Known Blockers / Constraints

None specific to browsing the catalog itself. See Product Management for `BLOCKER-P2-001`/`BLOCKER-P2-002`.

---

## SEARCH & FILTERING

### Purpose

Narrows and reorders the Product Catalog's result set via free-text Search, ten toggleable Category chips, a Zone dropdown, a Type dropdown, a Sort dropdown, and a single "Clear Filters" reset. Search narrows the already-loaded list on the page; the Category, Zone, Type and Sort controls and Clear Filters each reload the result set from the server. *(Reconciled 2026-09-28: this line previously said all filtering ran on one in-memory catalog array with no server round-trip. Filter requests were observed in execution, Architecture §15.2.)*

### Entry Point

`/market.html`, Products tab — search textbox (**"Search by product, category, or detail..."**), **"📦 Categories"** chip list, and three comboboxes for Sort / Zone / Type, all rendered together above the product grid.

### Authentication Requirement

Required (inherits from Product Catalog).

### Preconditions

Authenticated session; a populated catalog.

### Main Workflows

**Search:**
```
Products tab → type into search box (character-by-character)
→ result list filters live → filter chip shows search: "term"
```
**Requires real keystroke events** — a bulk `.fill()`-style value set does **not** trigger the filter handler; only per-character `pressSequentially`-style input works (`EV-P2-002`, `CONFIRMED FROM EXECUTION`).

**Category selection:**
```
Products tab → click one or more category chips
→ result list updates immediately → chip shows "N category/categories"
```

**Clear Filters:**
```
Any filter state (1+ dimensions active) → click "Clear Filters"
→ all dimensions reset immediately → "No active filters"
```

### Alternate Workflows

- Zone/Type/Sort selection via their dropdowns — functionally works, but see **Negative / Validation Behavior** for the confirmed display-timing anomaly.
- Cross-filter combinations (Category+Zone, Category+Search, Category+Sort) — see the Categories subsection below.

### Negative / Validation Behavior

- **Confirmed reproducible anomaly (`EV-P2-005`, `CONFIRMED FROM EXECUTION`, reproduced 3×):** after a change made via the **Zone, Type, or Sort dropdowns only**, the **visible result count, active-filter chip, and product list order keep showing their previous values** while that change's request is in flight, then settle to the correct state on their own. **Search and Category-chip clicks are unaffected** — both apply immediately (`EV-P2-002–004`, `EV-P2-023`, `EV-P2-029`). Do not generalize this timing issue beyond Zone/Type/Sort. *Reconciled 2026-09-28:* this bullet previously said the display was "always one interaction behind" and caught up only after another Zone/Type/Sort interaction. That is CONTRADICTED FROM EXECUTION: the display settled on its own in about 400–700 ms with no second interaction (`FIL-017`, Architecture §15.4). `EV-P2-005`'s observation itself stands.
- **A category selected right after a Zone/Type/Sort change is combined with it:** the result reflects both the category and the Zone/Type/Sort value just chosen (`EV-P2-030`'s note). *Reconciled 2026-09-28:* previously worded as the category click "flushing" a pending change. Each filter request carries the current value of every control, so nothing is flushed (`FIL-018`).
- **Clear Filters resets every filter dimension in one action** — tested 3×, including from a mixed state of categories, search, Sort, Zone and Type (`EV-P2-028`). *Reconciled 2026-09-28.* This line previously said Clear Filters "reliably bypasses the delay bug" and "correctly discarded" a still-undisplayed pending Type change. `EV-P2-028` did not observe whether that change was still being applied when Clear Filters was clicked (NOT VERIFIED). In a later automated run, a Zone change made immediately before Clear Filters took effect after it: every control read reset and the summary read "No active filters", but the product list showed that Zone's filtered results and did not correct itself (CONFIRMED FROM EXECUTION, once; not reproduced in the next run). See `search-filtering.md` → `FIL-021`.
- **One single-instance anomaly** (`EV-P2-033`, `CONFIRMED FROM EXECUTION` for the one instance; mechanism `NOT VERIFIED`): during rapid successive Zone/Sort changes, the filter-summary chip text and the actual result count/list were observed to transiently disagree with each other — a narrower, more specific symptom than the general Zone/Type/Sort stale display, captured only once, not isolated.
- Empty-search copy ("No products found. Add your first product!") does not distinguish a genuine no-match search from an empty catalog (`EV-P2-003`) — a UX/copy gap, not a functional defect.

### State Changes

- "Products" header stat and "N products shown" summary both reflect the currently filtered count live.
- Filter-summary chip (e.g. `"2 categories • zone: Frozen • search: \"milk\""`) reflects active filter dimensions, subject to the timing caveats above.

### Persistence

Filter/search state is purely client-side component state — confirmed **no URL query string, hash, or route change** occurs for any filter action (`EV-P2-023`). It is preserved across opening and closing the View Details modal (`EV-P2-062`) but was not tested across tab switches, reload, or logout/login (**NOT VERIFIED** for those transitions).

### Data Requirements

A populated catalog with known per-category/per-zone/per-search-term product counts (used throughout Addendum 1 to arithmetically prove semantics rather than infer them from appearance).

### Cleanup

Not applicable — filter state is ephemeral UI state, not persisted data. `Clear Filters` itself is the built-in reset mechanism.

### Cross-Feature Dependencies

Depends on Product Catalog for its result set. Interacts with Product Details (opening/closing View Details preserves filter state, `EV-P2-062`) and indirectly with Product Management (a newly created or deleted product immediately affects the listed results, because a save or delete reloads the catalog — which also drops any active filter, Architecture §15.3).

### Important UI Labels

"Search by product, category, or detail..." · "📦 Categories" · "Clear Filters" · "Sort A-Z" / "Sort Z-A" · "All Zones" / "Dry" / "Frozen" / "Chilled" / "Room Temperature" · "All Products" / "Weighted" / "Each" · "N products shown" · "No active filters"

### Evidence

`EV-P2-002–005` (Search, base Category, Zone/Type/Sort delay bug) · `EV-P2-021–033` (full Categories/Clear Filters addendum)

### Known Unknowns

- `U-206` — Whether Zone/Type/Sort can be individually reset to "no selection" independent of Clear Filters; whether the delay bug also affects the Products/Basket/Orders tab-switch buttons themselves.
- `U-207` — Exact detail-field value on "Aged Gouda Wedge" that matched a "milk" search — not opened/inspected.
- `U-208` — Precise mechanism/trigger for the `EV-P2-033` chip-vs-result-count mismatch — one instance only.
- `U-210` — Category + Type cross-filter semantics — not independently arithmetic-verified (only Category+Zone and Category+Search were).

### Known Blockers / Constraints

None. No permission blocks were encountered anywhere in this feature's discovery.

---

### Categories (sub-feature of Search & Filtering)

**Exact inventory — all 10, always visible, no expand/scroll control needed (`EV-P2-021`, `CONFIRMED`):**

1. 🥦 Fresh Produce
2. 🥩 Meat & Seafood
3. 🥚 Dairy & Eggs
4. 🍞 Bakery
5. 🫙 Pantry
6. 🧃 Beverages
7. 🍿 Snacks
8. 🧊 Frozen
9. 🏠 Household
10. 📦 Other

**Control type:** plain `generic` elements with `cursor: pointer` styling — **not** semantic `<button>`, `<a>`, or `<input type="checkbox">` elements; no ARIA `pressed`/`selected` state exposed (`EV-P2-021`).

**Selected/unselected visual states:** solid teal/green fill + bold dark text (selected) vs. plain gray text, no fill (unselected); a third, transient outlined state was observed immediately after deselection — most likely a focus-ring artifact, not a confirmed third design state (`EV-P2-022`).

**Confirmed semantics (all `CONFIRMED FROM EXECUTION`, proven by exact arithmetic against independently-known per-category counts — not inferred from appearance):**

- **Immediate application** — no delay, unlike Zone/Type/Sort (`EV-P2-023`, `EV-P2-029`).
- **Multi-select, OR/union semantics** — multiple selected categories combine with OR, proven by exact arithmetic (6 + 7 = 13; 13 + 7 = 20) (`EV-P2-024`).
- **All 10 selectable simultaneously** — no cap, equals the full unfiltered catalog (`EV-P2-027`).
- **Remove-one behavior** — removing one category from a multi-selection correctly returns to the remaining combination, immediately (`EV-P2-025`).
- **Remove-all behavior** — removing every selected category individually cleanly returns to the unfiltered baseline (`EV-P2-026`).

**Cross-filter behavior (all `CONFIRMED FROM EXECUTION`, exact arithmetic):**

- **Category + Zone = AND/intersection** — proven twice with exact counts (`EV-P2-030`).
- **Category + Search = AND/intersection** — proven with exact counts; also revealed that Search matches hidden product "Details" data, not just the visible name (`EV-P2-031`).
- **Category + Sort** — Sort applies correctly *within* the category-filtered subset (`EV-P2-032`).
- **Category + Type remains NOT VERIFIED** (`U-210`) — expected by strong analogy to Category+Zone/Search, but not independently arithmetic-tested.

**Clear Filters:**

- Exact visible label: **"Clear Filters"** (plain text, no icon) — never observed disabled, in any filter state (`EV-P2-028`).
- Clears **all** filter dimensions in one immediate click: Categories, Search, Sort, Zone, and Type — not just Categories (`EV-P2-028`, tested in both an all-10-categories scenario and a mixed-everything scenario).
- Once the preceding filter changes have taken effect, Clear Filters returns the catalog to its full, unfiltered state (`EV-P2-028`). Whether it discards a filter change that is still being applied when it is clicked was not observed in Discovery, and one later run showed such a change surfacing afterwards — see Negative / Validation Behavior above (*reconciled 2026-09-28*).

---

## PRODUCT DETAILS / VIEW DETAILS

### Purpose

A read-only, per-product detail modal reachable from every catalog card, exposing fields not visible on the card itself (Specifications/Details, Product ID) — but notably omitting Zone and Type, which *are* visible on the card.

### Entry Point

Product card — **👁️** icon button.

### Authentication Requirement

Required (inherits from Product Catalog).

### Preconditions

A rendered product card (i.e., the product must already be present in the client's loaded catalog data — this control has no independent fetch path).

### Main Workflows

```
Products tab → click 👁️ on a product card
→ modal opens (same page, no URL change)
→ read Category / Price / Stock Status / Available Units / Specifications / Product ID
→ close via "×" or "Close"
→ return to catalog, filter/search state preserved exactly
```

### Alternate Workflows

None — View Details has exactly one entry point and two functionally-identical close paths.

### Negative / Validation Behavior

- **Escape key does NOT close the modal** — tested directly; modal remained open (`EV-P2-061`, `CONFIRMED FROM EXECUTION`).
- **Background is present in the accessibility tree but not interactive** — a direct click attempt on a background element (the search textbox) while the modal was open was intercepted by the modal's own overlay (`<div class="modal active" id="itemDetailsModal">…subtree intercepts pointer events`) — confirmed via an actual Playwright error, not inferred (`EV-P2-060`).
- **True click-outside-the-modal (backdrop) close behavior is NOT VERIFIED** (`U-218`) — not cleanly testable via ref-based element clicking, since the modal exposes no separate backdrop element distinct from its content.
- **No loading state and no reachable error state** — opening View Details fires **zero new network requests**; it renders synchronously from the catalog's already-fetched client-side array (`EV-P2-066`). Direct consequence: since a card can only be clicked if it's already rendered from already-loaded data, there is no UI path through which this control can ever show a "product not found" or loading-spinner state.
- **Confirmed Stock Status inconsistency** — the modal's **"Stock Status"** field was observed as **"✅ In Stock"** on two independent products whose own catalog cards displayed **"⚠️ Low Stock"** (Orange Juice at 9 units, `EV-P2-006`; Hass Avocado at 8 units, `EV-P2-064`). This is a **confirmed, reproducible observed inconsistency** between the card and the modal's stock-status wording — the modal's numeric "Available Units" value itself was always correct; only the textual status label never showed the low-stock variant in any case observed. **No root cause is established or asserted** for this — it is reported strictly as an observed inconsistency between two UI surfaces.

### State Changes

None — this is a purely read-only view; opening or closing it changes no catalog, basket, or order data.

### Persistence

- Prior Search/filter state is fully preserved across opening and closing the modal, tested via both close controls with an active search term (`EV-P2-062`, `CONFIRMED FROM EXECUTION`).

### Data Requirements

An existing, currently-rendered product.

### Cleanup

Not applicable — no data is created or changed by this feature.

### Cross-Feature Dependencies

Depends on Product Catalog (source of the product being viewed) and, indirectly, on whatever filter state Search & Filtering has set (which it preserves rather than affects).

### Important UI Labels

"🔍 {Product Name}" (modal title) · "Category" · "Price" · "Stock Status" · "✅ In Stock" / "⚠️ Low Stock" · "Available Units" · "📋 Specifications" · "Product ID" · "×" · "Close"

### Exact Field Set (CONFIRMED FROM EXECUTION, verified on 4 distinct products across the full discovery: Orange Juice, Aged Gouda Wedge, Earl Grey Loose Leaf Tea, Hass Avocado, plus one self-created product)

Category · Price · Stock Status · Available Units · Specifications (dynamic key/value) · Product ID (full UUID). **Zone and Type are confirmed absent in every single case checked** (`EV-P2-006`, `EV-P2-045`, `EV-P2-063`) — despite both being visible on the corresponding catalog card.

### Specifications / Details Rendering Mechanism (`EV-P2-065`, `CONFIRMED FROM EXECUTION`)

- Raw JSON keys with underscores render with underscores replaced by spaces plus a trailing colon (e.g. `milk_type` → `"milk type:"`).
- Array-valued detail fields render as a comma-joined string **with no space** (e.g. `["Black Tea","Bergamot Oil"]` → `"Black Tea,Bergamot Oil"`).
- Key ordering matches raw JSON key insertion order exactly, in every case checked (stable, not alphabetized).
- How an entirely **empty** Specifications section, or one with **duplicate keys**, would render is **NOT VERIFIED** (`U-216`) — no naturally-occurring example existed among the products inspected, and none was manufactured for this purpose.

### Evidence

`EV-P2-006` (original) · `EV-P2-045` (self-created product) · `EV-P2-059–066` (full Addendum 3 focus, 3 additional real products)

### Known Unknowns

- `U-207` — Exact matching detail field on "Aged Gouda Wedge" for a "milk" search.
- `U-216` — Empty/duplicate-key Specifications rendering.
- `U-218` — True backdrop-click close behavior.

### Known Blockers / Constraints

None — View Details itself was never blocked by the harness permission classifier on any product, including pre-existing seed products.

---

## PRODUCT MANAGEMENT

### Purpose

Full CRUD lifecycle for products in the authenticated user's own catalog: create (Add Product), inspect (View Details — documented as its own feature above), modify (Edit Product), and remove (Delete Product).

### Entry Point

- Add: Products tab — **"+ Add Product"** button.
- Edit: product card — **✏️** icon.
- Delete: product card — **🗑️** icon.

### Authentication Requirement

Required (inherits from Product Catalog).

### Preconditions

- Add: authenticated session only.
- Edit/Delete: an existing product owned by the current account.

### Main Workflows

**Add Product** (`EV-P2-036–046`, `CONFIRMED FROM EXECUTION`):
```
Products tab → "+ Add Product"
→ fill Product Name, Category, Price, Stock (all required)
→ optionally add Details key/value pairs
→ "Save Product"
→ modal closes → a "Product created successfully!" banner shows briefly (C-1, see below) → catalog/stat panel update immediately
→ new product persists across reload
```

*Reconciled 2026-09-28 (C-1):* `EV-P2-042` recorded creation as a silent success with no toast. The application's page source calls `showAlert('Product created successfully!')`, which shows the page banner for about 3 s (CONFIRMED FROM SOURCE INSPECTION), and a full-suite run on 2026-09-28 (13:35 UTC+3) recorded that banner as shown, reading "Product created successfully!" (CONFIRMED FROM EXECUTION). "No toast" is therefore CONTRADICTED FROM EXECUTION for the current application; why Discovery did not see it is NOT VERIFIED. `PM-001` asserts the banner (owner decision, 2026-09-28).

**Edit Product** (`EV-P2-047`, `EV-P2-067`, `CONFIRMED FROM EXECUTION`):
```
Product card → ✏️
→ modal opens, pre-filled with current Name/Category/Price/Stock/Details
→ modify a field → "Save Product"
→ card updates immediately (on self-created data; see Known Blockers for pre-existing/seed data)
```

**Delete Product** (`EV-P2-048/049`, `CONFIRMED FROM EXECUTION`):
```
Product card → 🗑️
→ native browser confirm() dialog: "Are you sure you want to delete this product?"
→ accept → removed immediately, confirmed permanently gone after reload
```

### Alternate Workflows

- Opening Edit and closing via "×" (or "Cancel") without saving — confirmed non-destructive; verified via a follow-up snapshot that no unintended save occurred (`EV-P2-067`).

### Negative / Validation Behavior

**Exact Add Product fields, in order:** **"Product Name \*"** (textbox) · **"Category \*"** (single-select dropdown, default "Select category...", all 10 catalog categories as plain-text options) · **"Price ($) \*"** (number input) · **"Stock \*"** (number input) · **"Details (key/value)"** (optional, dynamic, starts "No details added") — plus **"Cancel"** / **"Save Product"** buttons (`EV-P2-036`).

- **Native HTML5 validation, one field at a time, in visual top-to-bottom order** (`EV-P2-037–040`, `CONFIRMED FROM EXECUTION`):
  1. Empty submit → browser-native bubble **"Please fill out this field."** on Product Name.
  2. Category still unselected → **"Please select an item in the list."**
  3. Price empty → **"Please fill out this field."**; Price = `-5` → **"Value must be greater than or equal to 0."** (`min="0"` HTML constraint; 0 itself is therefore a valid boundary value).
  4. Stock exhibits the identical `min="0"` behavior and message as Price.
  - This is **browser-native validation, not custom app-level validation** — no in-app error text is ever rendered for these cases.
- **Category is single-select** in Add/Edit Product (a `<select>` element) — structurally different from the multi-select Category *filter chips* documented under Search & Filtering. All 10 catalog categories are available as options, exactly matching the filter chip set.
- **Details (key/value)** is an add-one-at-a-time editor: clicking "+ Add detail" opens one inline Key/Value row with explicit "Cancel"/"OK" buttons; confirming commits it into a removable table row. A second pending row cannot be opened while one is already pending (`EV-P2-041`). Whether 2+ pairs, or duplicate keys, are supported is **NOT VERIFIED** (`U-214`) — only one pair was ever tested.
- **Successful creation is silent** — no success/confirmation toast of any kind appears; the only feedback is the modal closing and the catalog/stat panel updating (`EV-P2-042`, `CONFIRMED FROM EXECUTION`).
- **A significant documented gap:** Zone and Type are real, filterable catalog attributes (visible on every card, used by the Zone/Type filter dropdowns) — **but the Add Product form has no field for either one.** A newly created product silently receives **Zone = "Standard"** and **Type = "Each"** as defaults (`EV-P2-043`, `CONFIRMED FROM EXECUTION`). **"Standard" is not one of the four real Zone filter options** (Dry/Frozen/Chilled/Room Temperature) — such a product would only ever appear under "All Zones", never under any specific Zone filter selection. This is a documented business/data behavior of the application, not an architectural assumption. Whether this is truly unreachable under every specific Zone filter was **not** cross-checked before the one test product was deleted (`U-212`).
- **Permission-classifier restriction (harness-side, not app-side — see Known Blockers below).**

### State Changes

- Add: catalog count and "Inventory Value" both update immediately (`EV-P2-042`).
- Edit: the edited field(s) reflect immediately on the card (`EV-P2-047`).
- Delete: catalog count and "Inventory Value" both return exactly to their pre-creation baseline after a confirmed delete (`EV-P2-049`).

### Persistence

- New products persist across a full page reload (`EV-P2-046`, `CONFIRMED FROM EXECUTION`).
- Deletions are permanent and server-side — confirmed via a fresh reload showing the product gone and counts/value back to baseline (`EV-P2-049`).

### Data Requirements

- Add: Name, Category, Price ≥ 0, Stock ≥ 0 (all required); Details optional.
- Edit/Delete: an existing product owned by the current account.

### Cleanup

- The one temporary product created during discovery (**"ZZZ Discovery Temp Item"**) was deleted through the real UI and its removal verified after a full reload, with catalog count and Inventory Value returning exactly to the pre-creation baseline (`EV-P2-048/049`) — see the Residual/Test Data State section below for the full record.
- No pre-existing/seed product was ever deleted or permanently modified during discovery.

### Cross-Feature Dependencies

Writes directly to the same Product Catalog that Search & Filtering and Product Details / View Details read from — changes here are immediately visible in both.

### Important UI Labels

"+ Add Product" · "Add Product" (modal title) · "Edit Product" (modal title) · "Product Name \*" · "Category \*" · "Price ($) \*" · "Stock \*" · "Details (key/value)" · "+ Add detail" · "No details added" · "Cancel" · "Save Product" · "Are you sure you want to delete this product?"

### Evidence

`EV-P2-019, EV-P2-020` (original, structure-only + residual stock finding) · `EV-P2-036–049` (full Add/Edit/Delete lifecycle on a self-created product) · `EV-P2-067–069` (limited Edit verification + Delete-blocked observation on a pre-existing seed product)

### Known Unknowns

- `U-203` — Whether Temperature Zone / Type can be set through *any* UI path (now confirmed they cannot via Add Product itself; still unknown whether Edit on a differently-configured product, or some other path, could).
- `U-212` — Whether Zone="Standard" is truly unreachable under every specific Zone filter option.
- `U-213` — Price/Stock behavior at extreme values, high decimal precision, or non-numeric paste input.
- `U-214` — Multiple/duplicate Details key-value pairs.

### Known Blockers / Constraints

- **`BLOCKER-P2-001`** — The Claude Code harness's own auto-mode permission classifier ("Modify Shared Resources") blocked both "Save Product" and "Cancel" clicks inside the Edit Product modal while attempting to restore Hass Avocado's stock from 8 back to 9 (`EV-P2-020`). **This is a restriction imposed by the discovery tooling/harness, not by the QACLOUD application itself** — confirmed by contrast: editing and saving a **self-created** product in the same session completed with no block at all (`EV-P2-047`).
- **`BLOCKER-P2-002`** — The same classifier also blocked the 🗑️ Delete click itself on a pre-existing seed product (Hass Avocado), *before* any in-app confirmation dialog could even appear (`EV-P2-068`). Same family as `BLOCKER-P2-001`; also a harness/tooling restriction, not an application authorization rule. Notably, **opening and reading the Edit modal, and closing it via "×", was not blocked** on this same seed product (`EV-P2-067`) — only the mutating actions (Save, Delete) are restricted by the classifier.
- Neither blocker prevented any *discovery* objective from being met — Add/Edit/Delete were all fully characterized using self-created data instead.

---

## SHOPPING BASKET

> **Reconciliation note (2026-09-24).** The subsections below are the original, approved Feature Map text and are preserved unchanged. Several of their statements were re-examined by the Shopping Basket re-discovery pass; see **Re-discovery Reconciliation** at the end of this section for the current status of each, and for the `D-01`–`D-33` evidence register cited by `basket.md` (a current reconciliation layer, distinct from the historical `EVIDENCE-LOG.md`).

### Purpose

Holds selected products and quantities, scoped to the authenticated account, as the staging area before Checkout.

### Entry Point

Header **"🛒 Basket"** button (shows a count badge) or the **"🛒 Basket"** tab.

### Authentication Requirement

Required (inherits from Product Catalog).

### Preconditions

None to view an (possibly empty) basket; a product must exist in the catalog to add one.

### Main Workflows

**Add to basket:**
```
Products tab → click "ADD" on a card
→ header "🛒 Basket N" increments (distinct item count)
→ "Basket Units" stat increments (total quantity)
→ card's "ADD" button becomes an inline "- / qty / +" stepper
```

**Increment/decrement:**
```
Basket tab or Products-tab stepper → click "+" or "-"
→ PUT /api/basket → quantity updates (see Negative Behavior for a confirmed anomaly)
```

**Remove / Clear All:**
```
Basket tab → "Remove" (single item) or "🗑️ Clear All" (native confirm() dialog, whole basket)
→ basket updates immediately
```

### Alternate Workflows

- Adding the same product while it's already in the basket increments its existing line item rather than creating a duplicate (implied by the stepper pattern; not separately stress-tested beyond the cases in `EV-P2-007/008`).

### Negative / Validation Behavior

- **Header "Basket N" (distinct item count) vs. "Basket Units" (total quantity) are two intentionally different metrics**, confirmed as correct behavior, not a bug (`EV-P2-007`).
- **Quantity increment works, with a render-timing caveat only** — a snapshot taken immediately after clicking "+" still showed the old quantity; a follow-up snapshot (no extra click) showed the correct new value. Flagged as ordinary render/async latency, not the same deterministic bug as the Zone/Type/Sort delay (`EV-P2-008`).
- **Confirmed severe bug, one occurrence, condition-dependent (`EV-P2-009`, `CONFIRMED FROM EXECUTION`):** decrementing a quantity 2→1, **after** having navigated to the Basket tab in between (which issues its own `GET /api/basket` calls), returned a `404 {"error":"Basket item not found"}` from `PUT /api/basket` and the UI then showed a **completely empty basket** with **zero visible error to the user**. A second, independent attempt (increment/decrement **without** the intervening Basket-tab navigation) succeeded normally with no data loss. The intervening-navigation condition is a **plausible but NOT VERIFIED trigger** (`U-201`) — only one data point exists per branch.
- **Later re-examination (`EV-P2-034`, `EV-P2-057`) substantially clarified this bug's real effect:** the item that appeared "wiped" by the 404 was later found **still fully and correctly present** in the basket in a subsequent session — proving the original "empty basket" display was itself a **display-only staleness bug**, consistent with the broader one-step-delay family, and **not** an actual server-side deletion. Do not overstate the original finding beyond this now-clarified scope — the basket-wipe *display* was confirmed to be misleading, not the basket-wipe *data loss* itself (which the underlying item survived).
- **Confirmed bug: header/stats stuck at 0 immediately after a full reload**, despite `GET /api/basket` returning the correct, non-empty data — the display only catches up once the Basket **tab** itself is opened (`EV-P2-014`, `CONFIRMED FROM EXECUTION`).

### State Changes

- Basket line items, quantities, and the derived header/stat counts.
- Removing/clearing affects the "Inventory Value" header stat only insofar as it's a live aggregate recomputed from current state (not directly basket-driven — basket contents don't consume stock until Checkout, per `EV-P2-020`).

### Persistence

- **Confirmed correct across logout/login** — basket state is tied to the **account**, not a local/browser session (`EV-P2-013`, `CONFIRMED FROM EXECUTION`).
- **Confirmed server data is correct across full reload**, but the header/stat **display** is stale until the Basket tab is opened (`EV-P2-014`) — see Negative Behavior above.

### Data Requirements

At least one product in the catalog to add.

### Cleanup

- All basket test additions across the full discovery were removed via the real "Remove"/"Clear All" UI paths by the end of each pass; the basket was confirmed empty at the close of the final addendum (`EV-P2-034` and its follow-up verification in Addendum 3).

### Cross-Feature Dependencies

Sources its items from Product Catalog. Is a hard prerequisite for Checkout / Order Creation (non-empty basket required to place an order).

### Important UI Labels

"🛒 Basket" (header button + tab) · "Shopping Basket" (heading) · "🔄 Refresh" · "🗑️ Clear All" · "Remove" · "Subtotal: $X.XX" · "Order Summary" · "N item(s)" · "Total" · "📦 Place Order" · "Your basket is empty. Start marketping!" (note: confirmed copy typo, "marketping" instead of "shopping")

### Evidence

`EV-P2-007–014` (full basket workflow) · `EV-P2-034, EV-P2-057` (later clarification of the 404 bug's real scope)

### Known Unknowns

- `U-201` — Exact trigger condition for the 404 decrement anomaly — needs isolated, repeated reproduction.
- `U-204` — Basket quantity vs. available-stock boundary validation — not tested.
- `U-209` — See the clarified/updated entry in `EVIDENCE-LOG.md` — now substantially resolved by `EV-P2-057`, cross-referenced there.

### Known Blockers / Constraints

None.

### Re-discovery Reconciliation (Shopping Basket Discovery Pass, 2026-09-24)

This subsection records a fresh, execution-based re-discovery of the Basket and reconciles it with the original text above, which is preserved unchanged. The `D-` IDs are this pass's evidence IDs.

**Two distinct records — do not conflate them.** `EVIDENCE-LOG.md` is the **historical evidence record** (`EV-` IDs, closed at `EV-P2-069`); it is frozen and was not modified. The register below is the **current discovery/reconciliation layer** (`D-` IDs); it is kept here deliberately and is not part of, and not to be moved into, the Evidence Log. It supplements the historical record and never replaces or rewrites it: where the two differ, both are kept, and the difference is stated in *Status of the original Basket statements* below.

**Method.** Real UI only, on `/market.html`, with an existing authenticated session. Network traffic was observed passively (no routing or mocking). Every basket subject was a temporary product created and deleted through the real UI (`AUT-bsk-06d5-A` stock 3, `-B` stock 10, `-Z` stock 0) — no seed product was added to the basket, edited, or deleted. "📦 Place Order" was never clicked, and no logout was performed. The pass ended with the catalog identical to its starting state field by field, and the basket empty.

#### Re-discovery evidence register (current reconciliation layer — not part of the historical Evidence Log)

| ID | Observation | Status |
|---|---|---|
| `D-01` | An unauthenticated visit to `/market.html` is redirected to `/` after the profile request is refused; the basket is never requested. | CONFIRMED FROM EXECUTION |
| `D-02` | Two entry points — header button "🛒 Basket N" (count badge) and tab "🛒 Basket" — both open the Basket tab; the URL stays `/market.html`. | CONFIRMED FROM EXECUTION |
| `D-03` | A product card's "ADD" is the only add control. The View Details modal has no add-to-basket control (its only buttons are "×" and "Close"). | CONFIRMED FROM EXECUTION |
| `D-04` | "ADD" adds quantity 1: no alert; the user stays on the Products tab; "ADD" becomes a "- / qty / +" stepper; header count +1 and "Basket Units" +1; the product's stock and "Inventory Value" are unchanged. When the Basket tab had not yet been rendered in the page session, opening it listed the product correctly. | CONFIRMED FROM EXECUTION |
| `D-05` | A zero-stock product's card shows a disabled "Out of Stock" button in place of "ADD". | CONFIRMED FROM EXECUTION |
| `D-06` | Empty basket: heading "Shopping Basket", "🔄 Refresh" and "🗑️ Clear All" (both present and enabled), a 🛒 icon, "Your basket is empty. Start marketping!"; no Order Summary, totals, "📦 Place Order", or "Continue Shopping". | CONFIRMED FROM EXECUTION |
| `D-07` | After a fresh page load with an empty basket, "Loading basket..." stays visible alongside the rendered empty state. It was hidden after Clear All. | CONFIRMED FROM EXECUTION (2 occurrences). **Current: NOT REPRODUCED** (`D-34`); the original reads were taken while the tab's own read was in flight (`D-39`) |
| `D-08` | Basket line: product name, "$X.XX each", "Stock: N available", "Remove", "-" / quantity / "+", "Subtotal: $X.XX". No image, category, product ID, View Details control, or quantity input. | CONFIRMED FROM EXECUTION |
| `D-09` | Order Summary: "N item(s)" counts distinct lines; a subtotal; "Total" equal to it; "📦 Place Order". No tax, shipping, or discount line. | CONFIRMED FROM EXECUTION |
| `D-10` | Amounts use "$" with two decimals; 3 × $1.15 displayed as "$3.45". | CONFIRMED FROM EXECUTION (the general rounding rule is INFERRED) |
| `D-11` | The header count is distinct lines; "Basket Units" is total quantity. | CONFIRMED FROM EXECUTION |
| `D-12` | The Basket-tab stepper set the requested quantity correctly in 6 of 6 operations; line, subtotal, summary and stats updated; no alert. | CONFIRMED FROM EXECUTION |
| `D-13` | The Products-card stepper displays the quantity from one operation earlier, and its next click is applied from that stale quantity: two consecutive "+" from 1 left the basket at 2, and a "−" issued after three "+" set it to 1 while the card showed 3. | CONFIRMED FROM EXECUTION (2 runs, identical update sequence); mechanism INFERRED. **Current: lost increment NOT REPRODUCED** (`D-35`); transient card display lag CONFIRMED FROM EXECUTION (`D-35`) |
| `D-14` | "+" is disabled when the quantity equals available stock, on the Basket-tab line and on the card; no message is shown. | CONFIRMED FROM EXECUTION; server-side over-stock handling NOT VERIFIED |
| `D-15` | "−" at quantity 1 on the Basket tab removes the line, shows "Item removed from basket", and returns the card to "ADD"; no confirmation. | CONFIRMED FROM EXECUTION |
| `D-16` | No quantity input exists on the basket line or the card; quantity cannot be typed. | CONFIRMED FROM EXECUTION |
| `D-17` | "Remove" removes the line immediately, with no confirmation, and shows "Item removed from basket". | CONFIRMED FROM EXECUTION (2 occurrences) |
| `D-18` | Removing a basket line (twice via "Remove", once via "−" at 1) did not delete the catalog product, and no product deletion was requested. | CONFIRMED FROM EXECUTION (3 occurrences) |
| `D-19` | "🗑️ Clear All" shows the native confirm "Are you sure you want to clear your entire basket?". Dismiss leaves the basket unchanged; accept empties it and shows "Basket cleared"; the products remain in the catalog. | CONFIRMED FROM EXECUTION |
| `D-20` | Basket contents persist across switching Basket → Orders → Products → Basket. | CONFIRMED FROM EXECUTION |
| `D-21` | After a full reload the stats briefly read 0 / $0.00, then show the correct values once the catalog renders, without the Basket tab being opened. | CONFIRMED FROM EXECUTION (1 occurrence) |
| `D-22` | A second browser session of the same account sees the same basket. Neither session's view updates live when the other changes it; "🔄 Refresh" synchronizes it. | CONFIRMED FROM EXECUTION |
| `D-23` | With the Basket tab already rendered in the page session, a product added from the Products tab is absent from the Basket tab until "🔄 Refresh". In one occurrence the header badge also stayed at "🛒 Basket 0". | CONFIRMED FROM EXECUTION (2 occurrences); trigger and mechanism INFERRED. **Current: NOT REPRODUCED** (`D-36`); the original reads were taken while the tab's own read was in flight (`D-39`) |
| `D-24` | After a product's stock is reduced below its basket quantity: the line shows the reduced stock with the higher quantity (only after "🔄 Refresh"); "+" is disabled; "−" produces no change or message; "📦 Place Order" is enabled; "Remove" still works. | CONFIRMED FROM EXECUTION (1 occurrence). **Current: PARTIALLY CONFIRMED** (`D-37`): the stock, "+", "📦 Place Order", "−" and "Remove" elements reproduced; "no … message" for "−" is CONTRADICTED (an alert is shown); "only after Refresh" NOT REPRODUCED |
| `D-25` | For a product in the basket, its card displayed an edited stock value one edit behind. | CONFIRMED FROM EXECUTION (2 occurrences, one run); condition INFERRED |
| `D-26` | Once, on first render, a Basket-tab "+" control was generated with an available-stock value of 0; it was correct from the next render and not reproduced. | CONFIRMED FROM EXECUTION (1 occurrence); cause INFERRED |
| `D-27` | A Basket-tab decrement made after navigating to the Basket tab succeeded normally (no `404`). | CONFIRMED FROM EXECUTION (1 attempt) |
| `D-28` | The order of basket lines differed between renders. | CONFIRMED FROM EXECUTION; ordering rule NOT VERIFIED |
| `D-29` | Alerts: none on "ADD" or a quantity change; "Item removed from basket" on Remove or "−" at 1; "Basket cleared" on Clear All. | CONFIRMED FROM EXECUTION |
| `D-30` | "📦 Place Order" is shown only for a non-empty basket and is enabled. It was not clicked. | CONFIRMED |
| `D-31` | Another actor was using the same account during the pass (catalog changes not made by the discovery session were observed). | CONFIRMED FROM EXECUTION; identity not investigated |
| `D-32` | No console errors occurred in any authenticated probe. | CONFIRMED FROM EXECUTION |
| `D-33` | Network logging/diagnostic capture must redact sensitive authentication/profile data by default. | CONFIRMED FROM EXECUTION |
| `D-34` | Re-verification of `D-07`: once the Basket tab's own basket read had completed, "Loading basket..." was hidden and the empty state was rendered; it was also hidden after the page's initial basket read. | CONFIRMED FROM EXECUTION (2 runs); `D-07` NOT REPRODUCED |
| `D-35` | Re-verification of `D-13`: after "ADD", two Products-card "+" clicks, each allowed to complete (its own basket update accepted), left the basket at quantity 3, read from the Basket tab after its own read and after "🔄 Refresh". Right after the first click's update completed, the card still displayed 1 while the application's follow-up basket read was in flight; the card then caught up. In both runs, the second click's update was issued after that follow-up read had completed. | CONFIRMED FROM EXECUTION (2 runs); lost increment NOT REPRODUCED; a click made during the pending follow-up read NOT VERIFIED |
| `D-36` | Re-verification of `D-23`: with the Basket tab already rendered (empty) in the page session, a product added from the Products tab was listed with quantity 1 as soon as the reopened Basket tab's own read had completed; "🔄 Refresh" changed nothing; the header badge read 1. | CONFIRMED FROM EXECUTION (2 runs); `D-23` NOT REPRODUCED |
| `D-37` | Re-verification of `D-24` (stock edited 3 → 1 with quantity 3): after the Basket tab's own read, before any Refresh, the line showed "Stock: 1 available" with quantity 3; "+" was disabled; "📦 Place Order" was visible and enabled (not clicked); "−" issued no basket update, left the quantity at 3 (also after "🔄 Refresh"), and immediately showed the error alert "Cannot add more than 1 units (only 1 in stock)"; "Remove" removed the line. | CONFIRMED FROM EXECUTION (1 run); `D-24` "no … message" CONTRADICTED; "stock shown only after Refresh" NOT REPRODUCED |
| `D-38` | Opening the Basket tab issued exactly one basket read, including with an empty basket. | CONFIRMED FROM EXECUTION (4 openings on an empty basket examined in the request log) |
| `D-39` | Observation conditions of the original re-discovery probes, from their own scripts and logs: the post-click "settle" step did not wait for requests issued by later clicks; the `D-07` and `D-23` reads were taken while the Basket tab's own read was still in flight ("Loading basket..." visible); in `D-13`, each next click was issued while the previous click's follow-up read was still pending; in `D-24`, the alert was read only after a 6-second wait for a request that never came. | CONFIRMED (probe scripts and logs); that the application hides its alert after about 3 s is INFERRED FROM SOURCE |

**Rows `D-34`–`D-39`** come from the Pre-Implementation Verification (2026-09-24). Method: real UI only, with an existing authenticated session; each action waited for the request it issued itself (no load-state settling, no sleeps, no retries); diagnostics were limited to request method, path, status and timing. Only temporary products were used (`AUT-967f-0-d13`, `-d23`, `-d24`), all deleted afterwards; "📦 Place Order" was never clicked; "🗑️ Clear All" was not used; no other actor's activity was observed; the catalog and the basket ended as they began. Rows `D-01`–`D-33` are unchanged apart from the current-status notes appended to `D-07`, `D-13`, `D-23` and `D-24`.

#### Status of the original Basket statements

| Original statement | Source | Re-discovery | Status |
|---|---|---|---|
| "ADD" becomes an inline stepper; header count and "Basket Units" are two distinct metrics; no toast on add | `EV-P2-007` | `D-04`, `D-11`, `D-29` | Reproduced |
| "+" works, with a render-timing caveat judged to be ordinary latency and not a defect | `EV-P2-008` | `D-13` (card), `D-12` (Basket tab) | Observation reproduced on the card stepper. **Interpretation CONTRADICTED FROM EXECUTION** — the next click acts on the lagging display. The Basket-tab stepper is unaffected. **Current (`D-35`):** the lost increment did not reproduce and the card display lag was transient, which is consistent with `EV-P2-008`'s original reading; the contradiction is not supported by current evidence. |
| A decrement after Basket-tab navigation returned `404` and displayed an empty basket (trigger `U-201`) | `EV-P2-009` | `D-27` | Not reproduced (1 attempt). The historical occurrence stands; `U-201` remains open. |
| Navigating to the Basket tab issued two basket requests | `EV-P2-009` | No request with an empty basket; one request on a later occasion | Not reproduced as stated; appears condition-dependent (INFERRED). **Current (`D-38`):** each opening issued exactly one basket read, including with an empty basket, so "no request with an empty basket" is CONTRADICTED |
| Basket tab structure and arithmetic | `EV-P2-010` | `D-08`, `D-09` | Reproduced |
| "Remove" works immediately | `EV-P2-011` | `D-17` | Reproduced; the "Item removed from basket" alert was not recorded originally |
| "Clear All" uses a native `confirm()` | `EV-P2-012` | `D-19` | Reproduced; dismiss behavior and the "Basket cleared" alert added |
| Basket persists across logout/login | `EV-P2-013` | Not re-run; `D-22` consistent with account scoping | NOT VERIFIED in this pass |
| Header/stats stuck at 0 after a reload until the Basket tab is opened | `EV-P2-014` | `D-21` | Not reproduced (1 occurrence each way); the conflict is recorded and neither overrides the other |
| Basket contents do not consume stock until Checkout | State Changes above (`EV-P2-020`) | `D-04` | Reproduced for the add side |
| The item that appeared wiped by the `404` anomaly survived | `EV-P2-034`, `EV-P2-057` | — | Historical; not re-examined |
| A basket "Remove" may have deleted the underlying catalog product (correlation only) | `EV-P2-057` | `D-18` | Not supported by current evidence (3 removals); historical causation remains NOT VERIFIED |
| Adding a product already in the basket increments its line rather than duplicating it (implied) | Alternate Workflows above | `D-04` | Structurally confirmed: once added, the card offers a stepper instead of a second "ADD"; no duplicate lines observed |
| Increment/decrement via "Basket tab or Products-tab stepper" | Main Workflows above | `D-12`, `D-13` | Holds for the Basket-tab stepper; the Products-card stepper is defective. **Current (`D-35`):** the Products-card stepper also reached the correct quantity; only a transient display lag was confirmed |
| `U-204` — quantity vs. available-stock boundary not tested | Known Unknowns above | `D-14`, `D-24` | Partially addressed: the UI stock cap is confirmed; server-side handling and checkout with an over-stock quantity remain NOT VERIFIED |

#### Additional UI labels observed

"Loading basket..." · "$X.XX each" · "Stock: N available" · "Out of Stock" (disabled, on a zero-stock card) · "Item removed from basket" · "Basket cleared".

#### Cross-feature observations

- **Product Details:** no add-to-basket path exists from View Details (`D-03`).
- **Product Management:** reducing a product's stock below its basket quantity leaves the basket holding the higher quantity (`D-24`); a card's displayed stock lagged one edit for a product in the basket (`D-25`).
- **Authentication:** the basket requires authentication (`D-01`) and is shared by every browser session of the account (`D-22`).
- **Checkout:** the boundary is "📦 Place Order" (`D-30`); its behavior was not observed.

#### Open questions from re-discovery (NOT VERIFIED)

Logout/login persistence today; what "📦 Place Order" does (including with an over-stock quantity); server-side over-stock handling; basket behavior when a product in it is deleted; the triggers and mechanisms of `D-25` and `D-26`; whether the historical `D-13` and `D-23` behaviors reproduce under any condition (neither reproduced, `D-35`, `D-36`), in particular whether a card click made while the previous click's follow-up read is pending loses an increment; the Products-card "−" at quantity 1; the basket line ordering rule; the identity of the other actor using the account (not investigated).

**Test Design impact:** see `docs/test-design/features/basket.md` (reconciled 2026-09-24).

---

## CHECKOUT / ORDER CREATION

### Purpose

Converts the current basket contents into a persisted order in a single action — there is no separate address, shipping, or payment step anywhere in this flow.

### Entry Point

Basket tab — **"📦 Place Order"** button (in the "Order Summary" panel).

### Authentication Requirement

Required (inherits from Shopping Basket).

### Preconditions

**CONFIRMED:** a non-empty basket (Shopping Basket must contain at least one item).

### Main Workflows

```
Basket tab (1+ items) → "📦 Place Order"
→ success modal: "✅ Order Placed Successfully!" 🎉
   "Order Number" → e.g. "O28634"
   "Total Amount" → e.g. "$1.50"
   line item(s): "{Product} × {qty} — ${price}"
   "View Orders" / "Continue Shopping"
→ order now appears in Orders Management
```

(`EV-P2-015`, `CONFIRMED FROM EXECUTION`)

### Alternate Workflows

None discovered — "Place Order" is the only checkout entry point found.

### Negative / Validation Behavior

- **Confirmed: there is no payment system and no address/shipping collection anywhere in this checkout flow** — "checkout" is functionally identical to "place order," a single click from the basket (`EV-P2-015`). This is a confirmed absence, not an unverified gap.
- Behavior of attempting to place an order with an empty basket, or with a quantity exceeding available stock, is **NOT VERIFIED** — not tested.

### State Changes

- **Stock consumption is confirmed:** placing an order decrements the ordered product's stock count (Hass Avocado 9→8 units, `EV-P2-020`). This decrement is **not reversed** even if the order is later deleted (see Orders Management).
- Basket is implicitly emptied by a successful order placement (consistent with every subsequent basket-empty observation post-checkout across the discovery sessions; not independently re-verified as a dedicated evidence entry beyond the pattern observed).

### Persistence

The created order persists and is visible in Orders Management immediately (`EV-P2-015` → `EV-P2-016`).

### Data Requirements

A non-empty basket.

### Cleanup

The one test order created during discovery (O28634) was fully deleted through the real UI's Delete Order flow, with no residual order record (`EV-P2-018`). Its stock-consumption side effect was **not** reversible through the permitted UI path — see Residual/Test Data State below.

### Cross-Feature Dependencies

Hard-depends on Shopping Basket (source and prerequisite). Feeds directly into Orders Management and, transitively, Order Lifecycle.

### Important UI Labels

"📦 Place Order" · "✅ Order Placed Successfully!" · "Order Number" · "Total Amount" · "View Orders" · "Continue Shopping"

### Evidence

`EV-P2-015`

### Known Unknowns

- Empty-basket or over-stock checkout attempts — not tested, no unknown ID assigned specifically (falls under the general `U-204` stock-boundary gap).

### Known Blockers / Constraints

None.

---

## ORDERS MANAGEMENT

### Purpose

Lists, inspects, and permits deletion of the account's orders (both system-pre-existing and self-created).

### Entry Point

Header **"📦 Orders"** tab.

### Authentication Requirement

Required (inherits from Checkout / Order Creation).

### Preconditions

At least one order must exist to have anything to view (one pre-existing order, O52638, was present in the account from before this discovery began, in addition to any self-created orders).

### Main Workflows

```
Header → "📦 Orders" tab
→ "My Orders" list, each order a collapsible row
→ click chevron to expand → "Items:", Status <select>, "Delete Order"
```

(`EV-P2-016`)

**Delete Order:**
```
Expanded order row → "Delete Order"
→ custom in-page confirmation modal: "⚠️ Confirm Delete"
   "Are you sure you want to delete this order? This action cannot be undone."
→ "Delete Order" (confirm) or "Cancel"
→ confirmed: order list updates, "Orders" header stat returns to correct count
```

(`EV-P2-018`, `CONFIRMED FROM EXECUTION`)

### Alternate Workflows

Order Lifecycle (status changes) is reachable from within an expanded row — documented as its own feature below.

### Negative / Validation Behavior

None specifically documented. (This line previously pointed to an Order Lifecycle "status-update display-staleness bug"; that behavior was reconciled on 2026-09-26 as a transient window that corrects itself — see Order Lifecycle, `D-40`.)

### State Changes

Deleting an order removes it from the list and correctly decrements the "Orders" header stat (`EV-P2-018`). It does **not** reverse the stock-consumption side effect of the order it deletes (`EV-P2-020`).

### Persistence

Not separately re-tested beyond the general account-scoped, server-side persistence pattern confirmed for Basket (`EV-P2-013`) and session (`EV-P1-016`) — orders are visibly account-scoped (only this account's orders, including the one pre-existing order O52638, are shown).

### Data Requirements

Requires an authenticated account; orders are created only via Checkout.

### Cleanup

The one order created for discovery (O28634) was fully deleted through this feature's own UI-supported Delete Order path — confirmed clean, no residual order record (`EV-P2-018`).

### Cross-Feature Dependencies

Depends on Checkout / Order Creation as its data source. Order Lifecycle is a sub-capability reached from within this feature.

### Important UI Labels

"📦 Orders" (tab) · "My Orders" · "🔄 Refresh" · "▼" / "▲" (expand/collapse) · "Items:" · "Delete Order" · "⚠️ Confirm Delete" · "Are you sure you want to delete this order? This action cannot be undone." · "Cancel"

### Evidence

`EV-P2-016, EV-P2-018`

### Known Unknowns

None specific to this feature beyond those listed under Order Lifecycle.

### Known Blockers / Constraints

None.

---

## ORDER LIFECYCLE

### Purpose

Governs the status progression of an individual order and the business rule that locks status editing once an order reaches a terminal state.

### Entry Point

Orders Management — expanded order row's **Status** `<select>` dropdown.

### Authentication Requirement

Required (inherits from Orders Management).

### Preconditions

An existing order, in a non-terminal status, to change its status.

### Main Workflows

```
Orders tab → expand an order row
→ Status <select> (Pending / Processing / Shipped / Delivered / Cancelled)
→ select a new status
→ PUT /api/orders/{id} → 200, status updated server-side immediately
→ the application re-reads GET /api/orders on its own and redraws the list
→ the row's status badge shows the new status (the row returns collapsed); no Refresh needed
```

(`EV-P2-016, EV-P2-017`, refined by `D-40`–`D-42`, `CONFIRMED FROM EXECUTION`)

> **Reconciled 2026-09-26.** The last step previously read *"row-level status badge requires a manual 🔄 Refresh click to reflect the change"* (from `EV-P2-017`, a single observation). A controlled re-verification found the badge stale only until the application's own automatic re-read completed, after which it was correct with no Refresh (`D-40`). `EV-P2-017` itself is unchanged in the Evidence Log. See *Evidence Reconciliation (Order Lifecycle, 2026-09-26)* below.

### Alternate Workflows

None beyond the standard status-change path.

### Negative / Validation Behavior

- **Confirmed terminal-state lock:** once an order's status is **"Delivered"**, its Status `<select>` becomes `disabled` — verified directly on a real pre-existing order (O52638) (`EV-P2-016`, `CONFIRMED FROM EXECUTION`).
- **Whether "Cancelled" is also a terminal/locked state remains NOT VERIFIED in execution** (`U-202`) — not tested, specifically to avoid unnecessary state changes on data. Do not assume Cancelled behaves like Delivered. The page source renders the select disabled for Cancelled too (`D-45`, CONFIRMED FROM SOURCE INSPECTION only).
- **Transient badge staleness (reconciled):** a status change succeeds server-side immediately (`PUT` returns `200` with the correct new status); the badge shows the old status only until the application's automatic orders re-read completes, then the redrawn row is correct with no Refresh (`EV-P2-017`, refined by `D-40`). *Previously documented as "does not update until 🔄 Refresh is clicked" — contradicted from execution.*
- **Final-status confirmation (source only):** selecting Delivered or Cancelled opens a "⚠️ Confirm Final Status" modal before any request is sent (`D-44`, CONFIRMED FROM SOURCE INSPECTION; NOT VERIFIED in execution).

### State Changes

Order `status` field, transitioning among Pending / Processing / Shipped / Delivered / Cancelled — only the transition *into* "Delivered" was confirmed to subsequently lock further edits.

### Persistence

The status change is confirmed persisted server-side immediately (`PUT` response body), independent of the display-staleness bug (`EV-P2-017`).

### Data Requirements

An existing, non-terminal order.

### Cleanup

Not applicable — status changes are not "cleaned up"; the one order that had its status changed for discovery (O28634, → "Shipped") was itself deleted afterward as part of Orders Management cleanup (`EV-P2-018`).

### Cross-Feature Dependencies

Entirely nested within Orders Management — has no independent entry point.

### Important UI Labels

"Status:" · "Pending" / "Processing" / "Shipped" / "Delivered" / "Cancelled" · "🔄 Refresh"

### Evidence

`EV-P2-016, EV-P2-017`

### Known Unknowns

- `U-202` — Whether "Cancelled" is also terminal/locked like "Delivered". *Open in execution terms; the page source indicates it is (`D-45`).*

### Known Blockers / Constraints

None.

### Evidence Reconciliation (Order Lifecycle, 2026-09-26)

This subsection records the Order Lifecycle evidence reconciliation and continues the `D-` register begun under *Shopping Basket → Re-discovery Reconciliation* (the historical Evidence Log stays closed at `EV-P2-069`). The original text above is corrected in place, with the superseded wording quoted.

**Method.** Real UI only, with the existing authenticated session; one disposable product (`AUT-112b-0-lifverify`) and one disposable order (**O53710**) placed through the real Checkout UI; the transition was **pending → processing** only (no final status was selected). Network requests were recorded by method, path, status and time only. An in-page recorder sampled the target row's badge, select value and expanded state on every DOM mutation and animation frame. Both disposable records were deleted through the UI afterwards. Source-inspection rows come from the application page source captured on 2026-09-24, which was byte-identical to the live page on 2026-09-26.

| ID | Observation | Status |
|---|---|---|
| `D-40` | Selecting a non-final status changes the select at once and sends `PUT /api/orders/{id}` (→ `200`). About 1 ms after that response the application issues `GET /api/orders` on its own. The badge kept the old status (`pending`) through the `PUT` and the re-read (~1.4 s in the observed run), and showed `processing` in the same frame as the redraw that followed the re-read. No "🔄 Refresh" was needed, and a later Refresh changed nothing. | CONFIRMED FROM EXECUTION (1 frame-sampled run; also `LIF-002`, passing in every run including the 2026-09-27 full suite) |
| `D-41` | The redraw replaces the order list, so the row returns collapsed; the alert "Order status updated to processing" appears in the same frame. The page source hides the alert after ~3 s. | CONFIRMED FROM EXECUTION (collapse, alert text); the 3 s hide is CONFIRMED FROM SOURCE INSPECTION |
| `D-42` | The new status persists: identical after "🔄 Refresh" and after a full reload (`processing`; `shipped` in `LIF-001`). | CONFIRMED FROM EXECUTION |
| `D-43` | An order in `processing` (and `shipped`, `EV-P2-018`) can be deleted through Delete Order. | CONFIRMED FROM EXECUTION |
| `D-44` | Selecting Delivered or Cancelled opens a custom DOM modal "⚠️ Confirm Final Status" (order number, FROM → TO, "Cancel" / "Confirm"); Cancel resets the select and sends nothing; Confirm sends the `PUT`. Non-final changes send the `PUT` directly, with no modal. | CONFIRMED FROM SOURCE INSPECTION. The Delivered path is CONFIRMED FROM EXECUTION (2026-09-30: the modal showed "SHIPPED → DELIVERED" for O62676, Confirm sent the `PUT` (→ `200`), the order stayed Delivered after a reload and its select was disabled; `PROJECT-HISTORY.md` §14). Cancel and the Cancelled path NOT VERIFIED in execution |
| `D-45` | The select is rendered `disabled` when the order is Delivered **or** Cancelled. | Delivered: CONFIRMED FROM EXECUTION (`EV-P2-016`, `LIF-003`). Cancelled: CONFIRMED FROM SOURCE INSPECTION only — `U-202` stays open |
| `D-46` | For Cancelled, the modal states "All items from this order will be returned to stock", and after confirmation the page reloads the products and shows "Order cancelled. All items returned to stock." | CONFIRMED FROM SOURCE INSPECTION · stock restoration NOT VERIFIED in execution |

**Consequences.** `LIF-002` was rewritten to assert the confirmed automatic update, and `LIF-001`'s wording reconciled (`order-lifecycle.md`). `LIF-004` (Cancelled) remains deferred. Whether the server itself enforces the Delivered/Cancelled lock, and whether a Delivered or Cancelled order can be deleted, are NOT VERIFIED.

---

## CROSS-FEATURE BUSINESS JOURNEYS

### Journey 1 — Full purchase lifecycle

```
Product Catalog → select a product → Shopping Basket ("ADD")
→ open Basket tab → Checkout ("Place Order")
→ order confirmation → Orders Management ("My Orders")
```

- **Purpose:** The core, end-to-end business journey the entire app exists to support.
- **Entry point:** Products tab.
- **Prerequisites:** Authenticated session; at least one product in the catalog.
- **Major state changes:** Basket item count/units increase; on Place Order, an order is created, the basket empties, and the ordered product's stock decrements.
- **Dependencies:** Product Catalog → Shopping Basket → Checkout / Order Creation → Orders Management (and, if a status is touched, Order Lifecycle).
- **Cleanup:** Confirmed fully achievable through the real UI — Delete Order removes the order record cleanly, though the stock-decrement side effect is **not** reversed by order deletion (a confirmed, disclosed residual-state characteristic, not a cleanup failure of this journey itself).
- **Evidence:** `EV-P2-007, EV-P2-015–018, EV-P2-020`.

### Journey 2 — Basket persistence across authentication

```
Product Catalog → Shopping Basket (add item) → Logout → Login → Shopping Basket
```

- **Purpose:** Confirms basket state is account-scoped, server-side data — not local/browser session state.
- **Entry point:** Products tab, then the authenticated header's "Logout" control.
- **Prerequisites:** Authenticated session; at least one basket item.
- **Major state changes:** None from the basket's perspective — the point of this journey is that basket state does **not** change across the logout/login boundary.
- **Dependencies:** Authentication & Session → Shopping Basket.
- **Cleanup:** The item used for this journey (Red Onions) was removed via the standard Basket cleanup path afterward.
- **Evidence:** `EV-P2-013` (`CONFIRMED FROM EXECUTION`).

### Journey 3 — Full product management lifecycle

```
Product Management (Add Product) → Product Catalog (new product appears)
→ Product Details / View Details (inspect it) → Product Management (Edit) → Product Management (Delete)
```

- **Purpose:** Confirms the full create → view → edit → delete lifecycle works end-to-end on the same product identity, and that View Details/Edit/Delete all target one consistent record.
- **Entry point:** Products tab — "+ Add Product".
- **Prerequisites:** Authenticated session.
- **Major state changes:** Catalog count and Inventory Value increase on creation, reflect edits immediately, and return exactly to baseline on deletion.
- **Dependencies:** Product Management → Product Catalog → Product Details / View Details → Product Management again (Edit, then Delete).
- **Cross-action identity consistency:** directly proven against raw server data — View Details' displayed Product ID and Edit's pre-filled values both exactly matched the same raw `/api/products` record for two independent products (`EV-P2-069`, `CONFIRMED FROM EXECUTION`).
- **Cleanup:** Fully verified — the one temporary product created for this journey was deleted and confirmed gone after a full reload, with catalog count/value restored exactly to baseline.
- **Evidence:** `EV-P2-036–049` (self-created product, full cycle) · `EV-P2-059–069` (View Details/Edit/Delete re-verified on real pre-existing products, Delete blocked by harness classifier per `BLOCKER-P2-002`).

---

## KNOWN OBSERVATIONS / POTENTIAL DEFECTS

Every item below is reported strictly as observed, with its actual evidence-backed classification — none is asserted as a formally confirmed defect unless the evidence explicitly supports that conclusion. "Root cause" is used only where a root cause was actually established (in practice: nowhere in this list — every item's underlying mechanism is either partially understood or explicitly unresolved).

| # | Observation | Confirmed | Unknown | Evidence | Cause known? |
|---|---|---|---|---|---|
| 1 | Zone/Type/Sort dropdown changes apply correctly, but the display keeps its previous values while the change's request is in flight (reconciled 2026-09-28; previously "display one interaction late"; timing mechanism in Architecture §15.4) | The stale display itself, reproduced 3× | Exact internal mechanism | `EV-P2-005` | No — described as "classic stale-closure/stale-state signature," not established |
| 2 | Basket decrement (2→1) once returned a 404 and displayed an empty basket with no visible error | The one occurrence, and that the underlying item later survived intact | Exact trigger condition (navigation-to-Basket-tab correlation is plausible, one data point per branch) | `EV-P2-009`, clarified by `EV-P2-034/057` | No — later evidence ruled out true data loss at that moment; the display-only nature is understood, but why the 404 occurred at all is not |
| 3 | Basket header/stats stuck at 0 immediately after full reload despite correct server data | Yes, once, consistent with the broader delay-bug family | Whether it's the same root mechanism as #1 and #6 | `EV-P2-014` | No |
| 4 | Order status update succeeds server-side immediately; the row badge is stale only until the application's own orders re-read completes (reconciled 2026-09-26 — originally recorded as "needs manual Refresh", contradicted) | Yes | Whether it's the same root mechanism as #1, #3 | `EV-P2-017`, `D-40` | Partly — the display waits for the automatic re-read (`D-40`) |
| 5 | View Details modal's "Stock Status" text shows "✅ In Stock" even on cards showing "⚠️ Low Stock" | Yes, reproduced on 2 independent products | Whether the modal's stock-status text ever renders the low-stock variant at all | `EV-P2-006`, `EV-P2-064` | No |
| 6 | Chip text and result count transiently disagreed with each other during rapid Zone/Sort changes | Yes, one instance | Exact conditions that produce this specific mismatch vs. the general Zone/Type/Sort stale display | `EV-P2-033` | No |
| 7 | "100% Florida Orange Juice" is permanently absent from the server-side catalog | Yes — confirmed absent by exact Product ID in the raw API response, not just by name | Causal mechanism — temporally correlated with a prior basket "Remove" action, but no network capture of that exact action exists | `EV-P2-035, EV-P2-050–058` | No — explicitly correlation, not causation |
| 8 | Add Product has no Zone/Type field; new products silently default to Zone="Standard" (not a real filter option) / Type="Each" | Yes | Whether "Standard" is truly unreachable under every Zone filter option | `EV-P2-043` | N/A — this is a confirmed data/business behavior, not an anomaly with an unknown cause |
| 9 | Login/registration failures (`403`/`401`/`409`) render no visible on-page error text in any case observed | Yes, consistently across every login/registration attempt in Pass 1 | N/A | `EV-P1-004, EV-P1-005, EV-P1-011, EV-P1-012, EV-P1-013` | N/A — confirmed UX gap, mechanism (silent failure by design or omission) not distinguished |
| 10 | Empty-search copy doesn't distinguish "no matches" from "genuinely empty catalog" | Yes | N/A | `EV-P2-003` | N/A — confirmed copy/UX gap |
| 11 | Basket empty-state copy has a typo ("marketping" instead of "shopping") | Yes | N/A | `EV-P2-009` | N/A — confirmed copy defect |
| 12 | Two different confirmation-dialog patterns coexist (native `confirm()` for Clear Basket/Delete Product; custom in-page modal for Delete Order) | Yes | Why the app is inconsistent here | `EV-P2-012, EV-P2-018, EV-P2-048` | N/A — confirmed inconsistency, no stated reason |

---

## OPEN QUESTIONS

All still-open Unknown IDs from `EVIDENCE-LOG.md`, feature-mapped. None have been silently dropped because Pass 2 is approved.

| ID | Description | Feature | Classification | Evidence | Blocks later phases? |
|---|---|---|---|---|---|
| `U-006` | Who can access "+ Add Product" (admin-only vs. any user) | Product Catalog | NOT VERIFIED | `EV-P0-010` | No |
| `U-101` | "Get Started →" / "Applications" portal anchors | Authentication & Session (portal-adjacent) | NOT VERIFIED | Pass 0/1 | No |
| `U-102` | Whether a verified account shows a distinct credential-error UI | Authentication & Session | NOT VERIFIED | `EV-P1-005` | No |
| `U-103` | "Reset Password" flow beyond static structure | Authentication & Session | NOT VERIFIED | `EV-P1-006` | No |
| `U-201` | Exact trigger condition for the basket-404 anomaly | Shopping Basket | NOT VERIFIED | `EV-P2-009` | No, but relevant before formal defect write-up |
| `U-202` | Whether "Cancelled" order status is also terminal | Order Lifecycle | NOT VERIFIED in execution (page source indicates yes, `D-45`) | `EV-P2-016`, `D-45` | No |
| `U-203` | Whether Zone/Type can be set via any UI path | Product Management | NOT VERIFIED | `EV-P2-036/043` | No |
| `U-204` | Basket quantity vs. available-stock boundary validation | Shopping Basket | NOT VERIFIED | — | No |
| `U-206` | Whether Zone/Type/Sort reset independent of Clear Filters; whether the delay bug affects tab-switch buttons | Search & Filtering | NOT VERIFIED | — | No |
| `U-207` | Exact matching detail field for "milk" search on Aged Gouda Wedge | Product Details / View Details | NOT VERIFIED | `EV-P2-031` | No |
| `U-208` | Precise mechanism for the chip-vs-count mismatch | Search & Filtering | NOT VERIFIED | `EV-P2-033` | No |
| `U-209` | Whether the original basket bug deletes items server-side | Shopping Basket | Substantially updated — see `EV-P2-057` cross-reference in `EVIDENCE-LOG.md` | `EV-P2-034, EV-P2-057` | No |
| `U-210` | Category + Type cross-filter semantics, not independently arithmetic-verified | Search & Filtering | NOT VERIFIED | — | No |
| `U-211` | Root cause of the missing Orange Juice product | Product Catalog | Confirmed loss / NOT VERIFIED cause | `EV-P2-035, EV-P2-050–058` | No |
| `U-212` | Whether Zone="Standard" is unreachable under every Zone filter | Product Management | NOT VERIFIED | `EV-P2-043` | No |
| `U-213` | Price/Stock extreme-value/malformed-input behavior | Product Management | NOT VERIFIED | — | No |
| `U-214` | Multiple/duplicate Details key-value pairs | Product Management | NOT VERIFIED | — | No |
| `U-215` | Exact causal mechanism for U-211 | Product Catalog | NOT VERIFIED | `EV-P2-057` | No |
| `U-216` | Empty/duplicate-key Specifications rendering | Product Details / View Details | NOT VERIFIED | — | No |
| `U-217` | Cross-ownership card-action visibility | Product Catalog | NOT VERIFIED | — | No |
| `U-218` | True backdrop-click close behavior for View Details | Product Details / View Details | NOT VERIFIED | — | No |

None of these unknowns are assessed as blocking Architecture or Test Design from starting — they represent gaps to be aware of, not prerequisites that must be resolved first. That assessment itself belongs to whoever runs those later phases, not to this document.

---

## RESIDUAL / TEST DATA STATE

### Hass Avocado

- **Original stock:** 9 units.
- **Observed stock:** 8 units (as of the end of discovery).
- **Cause:** one test order (O28634, containing Hass Avocado × 1) was placed and later deleted; placing the order decremented stock, and deleting the order did **not** restore it (`EV-P2-020`, `CONFIRMED FROM EXECUTION`).
- **Restoration attempt:** made via the real Edit Product UI; both "Save Product" and "Cancel" were blocked by the Claude Code harness's own permission classifier (`BLOCKER-P2-001`). The edit was abandoned via navigation away, not Save — confirmed unchanged afterward.
- **Current status:** unresolved residual state, disclosed rather than hidden. Restoring it requires either explicit harness permission for that action, or the user performing the edit manually.

### 100% Florida Orange Juice

- **Current status:** absent from the server-side catalog, confirmed by its exact Product ID (`97051025-c9b2-4981-afda-f5d99ca490ca`) being missing from the raw `/api/products` response, not merely absent by name (`EV-P2-053, EV-P2-056`).
- **Current catalog count:** 33 products (down from the original 34-product baseline).
- **Correlation:** the item was confirmed still fully intact in the basket in a session that came *after* the original basket-404 bug (`EV-P2-034`), ruling out that bug as the direct cause. It was then removed from the basket via the standard "Remove" action, and was found entirely gone from the catalog in the very next session. This is a **temporal correlation only** — no network capture of that specific "Remove" action exists, so **causation remains NOT VERIFIED** (`U-211`, `U-215`).
- **No restoration was attempted** — this is documented as observed fact, not remediated.

### Temporary Add Product Item

- **Name:** `ZZZ Discovery Temp Item`.
- **Lifecycle:** created via the real Add Product UI → viewed → edited → deleted, all through the real UI (`EV-P2-042–049`).
- **Cleanup:** confirmed successfully deleted; verified gone after a full page reload, with catalog count and Inventory Value returning exactly to the pre-creation baseline (33 products, $2138.31).
- **Current status:** fully cleaned up — no residual trace.

---

## SECURITY / SECRET HANDLING

This Feature Map contains **no** passwords, mailbox credentials, API keys, tokens, cookies, or session secrets, and none should ever be added to it.

**Non-secret behavioral note (permitted level of detail only):** a live account API key is displayed in plaintext as normal, intended content on `/profile.html`, and was also observed inline in a normal `/api/profile` network response during a later read-only discovery step. Both are recorded here strictly as **behavioral facts about the application** — the key itself is never reproduced in this document, in `EVIDENCE-LOG.md`, or in `DISCOVERY-STATE.md`. A full project-wide sweep for the account's exact password and exact API key values, performed at the end of discovery, found zero matches anywhere outside the git-ignored `.env` file.

---

## WHAT THIS FEATURE MAP DOES NOT DECIDE YET

The following are explicitly out of scope for this document and remain undecided, belonging to later phases:

- Page Object boundaries
- Fixture design
- Authentication-state architecture (e.g., stored/reused login state vs. per-test login)
- Test-data factory design
- Locator abstraction strategy
- Folder/project structure for automation code
- CI implementation
- Test-case inventory
- Assertion strategy
- Automation framework internals

None of these decisions should be inferred from anything in this document. Where this Feature Map mentions automation-relevant facts (e.g., "Category chips are non-semantic `generic` elements, not real buttons" or "Search requires real keystroke events, not `.fill()`"), those are preserved as **discovered facts about the application's DOM/behavior**, not as automation design recommendations — they exist so a later Architecture/Test Design phase doesn't have to rediscover them, not to pre-decide how they'll be handled in code.

---

## HOW TO RESUME THIS PROJECT

A future session — with no memory of this conversation — should, in order:

1. Read `docs/discovery/FEATURE-MAP.md` (this file) first, for orientation.
2. Read `docs/discovery/DISCOVERY-STATE.md` for the current status/checklist view.
3. Read `docs/discovery/EVIDENCE-LOG.md` for the exact underlying evidence behind any claim in this file that needs deeper verification.
4. Determine the current approval gate before doing anything else.

**Current status (reconciled 2026-09-27):** Discovery, this Feature Map, the Architecture and the Test Design have all been approved, and every feature has been implemented and passed its own gates; the most recent full suite passed 97/97 on 2026-10-01 at 14:24 (UTC+3), all 13 projects, `retries: 0`, run locally. See `docs/project-history/PROJECT-HISTORY.md` §17. The list below is the gate status **as of this document's creation**, kept as a historical record:

**Gate status as of this document's creation (historical):**

- Discovery (Pass 0, Pass 1, Pass 2 including all three addenda) has been **completed and approved** through `EV-P2-069`.
- The **Feature Map is the current phase** — this document. It has just been created and has **not yet been approved**.
- **Architecture must not be started until the Feature Map receives explicit approval.**
- **Implementation must not start before Architecture approval.**
- **Test Design must not be skipped** — it is a required phase between Architecture and Implementation, not an optional step to fold into either.

If a future session is asked to "start building the tests" or "start automation" without evidence that the Feature Map, Architecture, and Test Design phases have each been explicitly approved in turn, it should stop and confirm the current gate status with whoever is directing the work, rather than assuming permission to proceed.
