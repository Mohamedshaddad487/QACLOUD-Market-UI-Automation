# AUTOMATION ARCHITECTURE — QACLOUD Market UI Automation

---

## 1. Document Purpose

### What this document defines

This is the canonical architecture reference for the Playwright UI automation framework of the **QACLOUD Market** application (`/market.html` and its authenticated ecosystem at `https://www.qacloud.dev`). It defines **how the automation framework will represent and execute** the business workflows that Discovery confirmed to exist.

It is derived **entirely** from the approved Discovery outputs. It is not a generic Playwright framework template. Every structural choice below traces back to a specific, observed characteristic of this application — its single-page tabbed Market shell, its per-account-owned catalog, its account-scoped persistent basket, its non-semantic category chips, its emoji-named card controls, and its confirmed UI-staleness defects.

### Relationship to the other project phases

| Phase | Question it answers | Status |
|---|---|---|
| **Discovery** (Pass 0/1/2) | What does the application actually do, and what evidence proves it? | COMPLETE + APPROVED |
| **Feature Map** | WHAT the application contains, and how business workflows relate to each other | COMPLETE + APPROVED |
| **Architecture** (this document) | HOW the automation framework will represent and execute those workflows | COMPLETE + APPROVED · implemented · reconciled with the implementation 2026-09-27 |
| **Test Design** | WHICH scenarios, cases, and assertions will actually be automated | COMPLETE + APPROVED (reconciled 2026-09-26 / 2026-09-27) |
| **Implementation** | The actual framework and test code | COMPLETE for the approved scope — most recent full suite 97/97 passed on 2026-10-01 at 14:24 (UTC+3), all 13 projects, `retries: 0`, run locally (`docs/project-history/PROJECT-HISTORY.md` §17) |

These are deliberately separate. The Feature Map describes the application; this document describes the framework that will exercise it. Neither one decides which test cases get written — that is Test Design's exclusive responsibility.

### What this document does NOT define

- Which test scenarios will be automated, or how many (Test Design).
- Exact selector strings, method names, or class implementations (Implementation).
- Exact worker counts, CI YAML, or reporter configuration values (deferred — see §29).
- Any new facts about the application. Where Discovery is silent or an Unknown is open, this document says so explicitly and designs for robustness rather than filling the gap with assumption.

### How to use it

Read this document after the Feature Map and before any code is written. Every major decision carries a traceability reference (§27) and a rationale entry (§28) so that a future session — human or model, with no memory of this conversation — can understand *why* a decision was made before changing it.

---

## 2. Architecture Status / Governance

| | |
|---|---|
| **Project** | QACLOUD-Market-UI-Automation |
| **Target application** | QA Cloud Market (`/market.html`), via the QA Cloud portal (`/`) at `https://www.qacloud.dev` |
| **Current phase** | Release readiness and publication preparation. Architecture was approved, then implemented feature by feature; the explicit navigation boundary (§6.7) was made on 2026-10-01 |
| **Approved inputs** | PASS 1 (Authentication & Session) — COMPLETE + APPROVED · PASS 2 (Full UI Discovery, base + 3 addenda) — COMPLETE + APPROVED · Feature Map — COMPLETE + APPROVED |
| **Discovery evidence boundary** | `EV-P0-001`–`EV-P0-012`, `EV-P1-001`–`EV-P1-018`, `EV-P2-001`–`EV-P2-069`. No discovery has occurred beyond `EV-P2-069`. |
| **Later evidence** | Re-discovery and reconciliation registers `D-01`–`D-39` (Shopping Basket, 2026-09-24) and `D-40`–`D-46` (Order Lifecycle, 2026-09-26), in `FEATURE-MAP.md`. The historical Evidence Log remains closed at `EV-P2-069` |
| **Current gate** | Final release readiness — documentation correction; next, release re-confirmation, then the owner's first commit and publication |
| **Implementation status** | **Implemented** for the approved scope: 3 pages, 3 panels, 10 components, 4 modals, 3 fixture modules, 5 support modules, 34 spec files (97 tests including `setup`), 13 Playwright projects. **No CI exists** (§22 is design only). Details: §4, §9, §20, and `docs/project-history/PROJECT-HISTORY.md` |

### Approval requirement — explicit

> **Historical governance text.** The approval rules below were written before approval and are kept as the project's record of its own discipline. The approval they required was given (the approval date was not recorded in the repository), and every later phase followed the same gate sequence (`docs/project-history/PROJECT-HISTORY.md`).

**Architecture is not approved automatically by being generated.**

This document being written, complete, and internally consistent does **not** constitute approval. It must be reviewed and **explicitly approved** by the project owner before any implementation work begins. Generation is not ratification.

The phase sequence is strict and non-skippable:

```
Discovery (APPROVED) → Feature Map (APPROVED) → Architecture (APPROVED)
    → Test Design (APPROVED)
    → Implementation (feature by feature, each through its own readiness,
      implementation and feature gates — COMPLETE for the approved scope)
```

If a future session is asked to "start building the framework" or "write the tests" without evidence that this Architecture document and then Test Design have each been explicitly approved in turn, it should stop and confirm the gate status rather than assume permission.

---

## 3. Architecture Principles

These are project-specific principles, each grounded in something Discovery actually established about this application — not generic best-practice boilerplate.

### 3.1 Feature-first organization

The framework is organized by **business feature** (the nine features in the approved Feature Map), not by page, not by technical layer, and not by test type. A contributor asking "where does basket behavior live?" must have exactly one obvious answer.

*Why here:* the Market app is a **single page with three tabs** (`/market.html` → Products / Basket / Orders), not three routes. Route-based organization would collapse eight of nine features into one directory and one god object. Feature-first is the only organization that survives this application's structure. (`EV-P0-010`, `EV-P2-001`)

### 3.2 Accessibility-first locators, with honest fallbacks

Prefer role + accessible name. Where the application genuinely does not expose semantics, use the narrowest stable alternative and **record why** in §13 (§13.9 lists every such choice in the implementation).

*Why here:* this app is genuinely mixed. Card action controls expose clean `button` roles with exact accessible names (`EV-P2-059`), but the ten category chips are plain `generic` elements with no role, no `aria-pressed`, and no `aria-selected` (`EV-P2-021`). A policy of "always use getByRole" would be a lie in this codebase; a policy of "use CSS everywhere" would throw away real semantics. The principle must handle both honestly. See §13.

### 3.3 Deterministic synchronization — never arbitrary sleeps

Synchronization is achieved through web-first assertions, explicit observable-state waits, and read-only network-response observation. `waitForTimeout` is prohibited.

*Why here:* this application has **confirmed stale-display behaviors** (`EV-P2-005`, `EV-P2-014`, `EV-P2-017` — the last since refined to a transient window, `D-40`). A sleep would sometimes mask them and sometimes not, producing a suite that is both flaky and dishonest. See §15.

### 3.4 Defects stay visible — the framework never normalizes a known bug

The framework must not contain compensating logic (double-clicks, retry loops, forgiving waits) that makes a confirmed defect pass silently.

*Why here:* Discovery confirmed at least four distinct staleness/anomaly behaviors. Any of them could be "worked around" in a Page Object in three lines. Doing so would convert a real defect into permanent invisible behavior and defeat the purpose of the suite. Where a test must tolerate a known bug, that tolerance belongs in an explicit, annotated, Test-Design-approved decision — never buried in a helper. See §15, §18, §25.

### 3.5 Test isolation under a single shared account

Every test must assume the application's server-side state is **shared and persistent**, and must leave it as it found it.

*Why here:* this is the single most consequential constraint in the entire project. There is one account; the catalog, the basket, and the orders list are all account-scoped server-side resources (`EV-P2-013`, `EV-P2-054`). The basket in particular survives logout/login and full reload — it is effectively a **global singleton**. See §10.

### 3.6 Deterministic, self-owned test data

Tests that mutate data create their own uniquely named resources and delete them. Tests that read data must not depend on any specific pre-existing product continuing to exist.

*Why here:* Discovery proved this the hard way. A product that existed at baseline ("100% Florida Orange Juice") **vanished from the catalog mid-project**, cause unconfirmed (`EV-P2-035`, `EV-P2-050`–`EV-P2-058`, `U-211`, `U-215`). Any test that had hardcoded that product would now be permanently broken. See §11.

### 3.7 Controlled abstraction — earn every layer

A Page Object, Component, or fixture must justify its existence by repetition or by a real boundary. One-off markup does not get a class.

*Why here:* the app has genuinely repeated structures (33 identical product cards, repeated modal patterns) and genuinely singular ones (the order confirmation modal). Abstracting both identically would produce ceremony without benefit. See §6, §7, §24.

### 3.8 Meaningful assertions only

A test asserts a **business outcome or a state change**. `toBeVisible()` as a test's sole assertion is not a test.

*Why here:* this application fails **silently**. In Pass 1, login failures rendered no visible error text (`EV-P1-004`, `EV-P1-005`, `EV-P1-012`, `EV-P1-013`) — a historical observation, not a UI contract: the current portal source has a failure-message path (`showSnackbar(...)`), and whether it renders for the real account is NOT VERIFIED; a basket operation once returned `404` and displayed an empty basket with zero user-visible error (`EV-P2-009`). "No error appeared" is worthless as a success signal here. Only positive post-condition assertions are trustworthy. See §14.

### 3.9 UI mechanics stay in objects; test intent stays in tests

How to type into the search box belongs in a Component. What the search is expected to return belongs in the test.

*Why here:* the search box requires real per-character keystrokes — a bulk value-set does not trigger the filter handler at all (`EV-P2-002`). That is a UI mechanic every future test would otherwise have to know and repeat. See §24.

### 3.10 Secret safety is architectural, not incidental

No credential ever appears in source, in documentation, in logs, or in a published artifact.

*Why here:* two specific hazards exist in this project. First, credentials live in a git-ignored `.env`. Second — and easy to miss — `/profile.html` **displays the account's permanent, non-regenerable API key in plaintext as normal page content** (`EV-P1-014`), which means any trace, screenshot, or video captured on that page embeds a live credential into a CI artifact. See §8, §20, §21.

---

## 4. Repository Structure

> **Reconciled 2026-09-27.** This section was originally a proposal. It now describes the structure that exists. Two proposed directories were never created: `src/workflows/` (journeys use inline steps — approved decision D-1, §17) and `src/types/` (types live next to the objects that own them). Request-observation helpers, which the proposal did not anticipate, live in `src/support/`.

```
QACLOUD-Market-UI-Automation/
│
├── docs/
│   ├── discovery/                    # APPROVED, FROZEN — consume, do not rewrite
│   │   ├── DISCOVERY-STATE.md
│   │   ├── EVIDENCE-LOG.md
│   │   └── FEATURE-MAP.md
│   ├── architecture/
│   │   └── ARCHITECTURE.md           # this document
│   ├── test-design/                  # TEST-DESIGN.md, journeys.md, features/*.md
│   └── project-history/              # PROJECT-HISTORY.md — gates, decisions, execution evidence
│
├── src/                              # framework code — never contains test specs
│   ├── pages/                        # surface-level objects (own a URL / full screen)
│   ├── panels/                       # tab-scoped objects inside /market.html
│   ├── components/                   # repeated UI structures
│   ├── modals/                       # in-page modal dialogs
│   ├── fixtures/                     # index.ts (base `test`) + basket.ts, orders.ts extensions
│   ├── data/                         # catalog-reference.ts, product-builder.ts (unique AUT- names)
│   └── support/                      # env, dialogs, evidence, basket-requests, order-requests
│
├── tests/                            # specs ONLY — no reusable logic
│   ├── auth/
│   ├── catalog/
│   ├── search-filtering/
│   ├── product-details/
│   ├── product-management/
│   ├── basket/
│   ├── checkout/
│   ├── orders/
│   ├── order-lifecycle/
│   └── journeys/                     # cross-feature business journeys
│
├── tests/auth.setup.ts               # the `setup` project: one live login → storage state
├── playwright.config.ts              # 13 projects — see §20.1
├── package.json / tsconfig.json / eslint.config.mjs   # exist
├── .env                              # git-ignored, never committed
└── .env.example                      # committed template, empty values only
```

### Directory responsibilities and boundaries

| Directory | Exists to hold | Must NOT hold |
|---|---|---|
| `src/pages/` | Objects owning a real URL or full-screen surface: `PortalPage` (`/`), `MarketPage` (`/market.html` shell), `ProfilePage` (`/profile.html`). Navigation entry points. | Tab-panel logic, assertions, test data, product-level detail |
| `src/panels/` | Tab-scoped objects inside the Market shell: `ProductsPanel`, `BasketPanel`, `OrdersPanel`. These are page *sections*, not pages — they have no URL. | URL navigation, cross-tab orchestration, assertions |
| `src/components/` | Repeated UI structures appearing many times or across surfaces: `AppHeader`, `StatsBar`, `FilterBar`, `CategoryChips`, `ProductCard`, `QuantityStepper`, `BasketLine`, `OrderSummary`, `OrderRow`. | One-off markup, business workflows, assertions, waits for unrelated features |
| `src/modals/` | In-page modal dialogs: `ProductFormModal` (Add **and** Edit), `ProductDetailsModal`, `OrderConfirmationModal`, `ConfirmDeleteModal`. | Native browser `confirm()` handling (no DOM — belongs in `src/support/`) |
| `src/fixtures/` | Fixture definitions: the base extended `test` (`index.ts`) and two feature extensions built on it (`basket.ts`, `orders.ts`; see §9.2). Lifecycle and cleanup wiring. | Selectors, business assertions, page structure |
| `src/data/` | Reference constants derived from the Feature Map (`catalog-reference.ts`) and the unique-name / product-data builder (`product-builder.ts`). The non-final order statuses live with `OrderRow` (`NON_FINAL_ORDER_STATUSES`). | Credentials, secrets, environment values, live application state |
| `src/support/` | `env.ts` (loads `.env`, validates credentials, base URL), `dialogs.ts` (native-dialog handling and the unexpected-dialog guard), `evidence.ts` (console errors and failed responses, attached on failure), `basket-requests.ts` / `order-requests.ts` (read-only request predicates and `awaitRequestFrom` / `recordRequests`, §15.2). | Page structure, selectors, business logic, assertions |
| `tests/` | Spec files only — arrange via fixtures, act via objects, assert business outcomes. Journeys are inline in their spec (D-1). | Selectors, reusable helpers, page structure, shared mutable state between specs |

### Why `src/` rather than root-level `pages/`, `fixtures/`, …

A single framework root keeps the distinction between *framework code* and *specs* unambiguous, gives one path-alias root, and prevents the repository root from accumulating eight sibling folders alongside config files. The alternative (root-level folders) is common in Playwright examples and is recorded in §28 as a considered alternative.

### Why `panels/` is separate from `pages/`

This is the structural consequence of a confirmed discovery fact: **Products, Basket, and Orders are tabs on one page, not three routes** (`EV-P0-010`, `EV-P2-001`). Calling them "Pages" would be factually wrong and would invite `page.goto()` calls that do not exist in this application. Calling them "Components" would understate their scope — each owns an entire feature area. A distinct `panels/` layer names the reality precisely.

### Why `tests/` mirrors the Feature Map's nine features

Feature ownership becomes navigable: every approved feature maps to exactly one spec directory, plus one `journeys/` directory for the confirmed cross-feature journeys (Feature Map §"Cross-Feature Business Journeys"). No spec directory exists for a feature Discovery did not confirm.

---

## 5. Feature-to-Architecture Mapping

Every one of the nine approved Feature Map features is mapped below. No feature is omitted; no feature is invented.

### 5.1 Authentication & Session

| | |
|---|---|
| **Page Objects** | `PortalPage` (`/`, hosts the Login/Register modal), `ProfilePage` (`/profile.html`, post-login destination, holds Logout) |
| **Components** | `LoginModal` (Login / Register / Forgot-password views), `AppHeader` (authenticated vs unauthenticated state) |
| **Fixtures** | `authenticatedPage` (default, storage-state backed) · `unauthenticatedPage` (clean context, no storage state) · `disposableSessionPage` (own context + own live login, for logout/invalidation tests) |
| **Data** | Credentials from `.env` only. Never inline, never logged. |
| **Dependencies** | Foundation — all eight other features depend on this |
| **Cleanup** | Session state only. **Logout invalidates the session server-side** (`EV-P1-018`), so logout tests must not share a session with other tests — see §8.4 |
| **Test boundaries** | Login success; login failure modes (no visible error observed in Pass 1, `EV-P1-004/005/012/013`; the current source's failure message is NOT VERIFIED as rendered); session persistence across navigation (`EV-P1-015`) and reload (`EV-P1-016`); logout; post-logout protected-route gating (`EV-P1-018`) |

### 5.2 Product Catalog

| | |
|---|---|
| **Page Objects** | `MarketPage` (shell) → `ProductsPanel` |
| **Components** | `StatsBar` (Products / Basket Units / Orders / Inventory Value), `ProductCard` |
| **Fixtures** | `authenticatedPage`; optionally a `marketPage` convenience fixture landing on the Products tab |
| **Data** | Read-only. **No hardcoded product identity** — products are selected by queried attributes (`U-211` precedent, §11) |
| **Dependencies** | Authentication & Session |
| **Cleanup** | None — browsing mutates nothing |
| **Test boundaries** | Catalog renders; card structure consistency (`EV-P2-059`); stats reflect catalog state. **Absolute product counts must not be asserted in parallel contexts** (§19) |

### 5.3 Search & Filtering

| | |
|---|---|
| **Page Objects** | `ProductsPanel` |
| **Components** | `FilterBar` (search box, Sort/Zone/Type selects, result summary chip, active-filter chip) · `CategoryChips` (the 10 chips + "Clear Filters") |
| **Fixtures** | `authenticatedPage`. A filter-reset guard in teardown is optional — filter state is ephemeral client state with no URL persistence (`EV-P2-023`) |
| **Data** | The 10 category names (with emoji), 4 zone values, 2 type values, sort options — all as reference constants from the Feature Map |
| **Dependencies** | Product Catalog (supplies the result set) |
| **Cleanup** | None persistent. "Clear Filters" is the app's own reset and clears all five dimensions in one action once the preceding filter requests have completed (`EV-P2-028`, §15.4) |
| **Test boundaries** | Search live-filtering (requires real keystrokes, `EV-P2-002`); category OR/union semantics (`EV-P2-024`); cross-dimension intersection for Category+Zone and Category+Search (`EV-P2-030`, `EV-P2-031`); Category+Sort within subset (`EV-P2-032`); Clear Filters. **Category+Type is `U-210` — NOT VERIFIED, and must be treated as an open question, not an assumed AND** |
| **Known defect surface** | Zone/Type/Sort display stale while the filter request is in flight (`EV-P2-005`, `FIL-017`) — see §15, §18 |

### 5.4 Product Details / View Details

| | |
|---|---|
| **Page Objects** | `ProductsPanel` (entry via card 👁️) |
| **Components** | `ProductCard` (opens it) |
| **Modals** | `ProductDetailsModal` |
| **Fixtures** | `authenticatedPage` |
| **Data** | An existing rendered product, selected by queried attributes |
| **Dependencies** | Product Catalog. Preserves Search & Filtering state across open/close (`EV-P2-062`) |
| **Cleanup** | None — strictly read-only (`EV-P2-066`: zero network requests fired) |
| **Test boundaries** | Field set (Category, Price, Stock Status, Available Units, Specifications, Product ID); **Zone and Type confirmed absent** (`EV-P2-006`, `EV-P2-045`, `EV-P2-063`); close via "×" and "Close"; Escape does **not** close (`EV-P2-061`); background non-interactive (`EV-P2-060`); Specifications rendering rules (`EV-P2-065`) |
| **Known defect surface** | Stock Status shows "✅ In Stock" on cards displaying low-stock (`EV-P2-006`, `EV-P2-064`) — §18 |
| **Open unknowns to design around** | `U-216` (empty/duplicate-key Specifications), `U-218` (backdrop-click close) — the modal object must not assume either behavior |

### 5.5 Product Management

| | |
|---|---|
| **Page Objects** | `ProductsPanel` |
| **Components** | `ProductCard` (✏️ / 🗑️ entry points) |
| **Modals** | `ProductFormModal` — **one object serving both Add and Edit**, because Discovery confirmed the two forms are structurally identical with Edit merely pre-filled (`EV-P2-047`) |
| **Support** | Native `confirm()` handler — Delete Product uses a **native browser dialog**, not a DOM modal (`EV-P2-048`) |
| **Fixtures** | `temporaryProduct` (creates a uniquely named product, guarantees deletion in teardown, reports failure loudly) |
| **Data** | Generated unique names (§11). Required: Name, Category, Price ≥ 0, Stock ≥ 0. Optional key/value Details |
| **Dependencies** | Writes to the same catalog that Catalog / Search / Details read from |
| **Cleanup** | **Mandatory.** Every created product is deleted via the real UI 🗑️ path and verified gone (§12) |
| **Test boundaries** | Field inventory (`EV-P2-036`); native HTML5 validation order and `min="0"` boundaries (`EV-P2-037`–`EV-P2-040`); Details editor one-at-a-time behavior (`EV-P2-041`); successful save (`EV-P2-042`; its "silent" wording is contradicted by execution, see `PM-001` Notes, C-1); reload persistence (`EV-P2-046`); Edit pre-fill + save; Delete + native confirm + verified removal (`EV-P2-048/049`) |
| **Confirmed data behavior to preserve** | Created products silently default **Zone="Standard"** and **Type="Each"**; "Standard" is not one of the four real Zone filter options (`EV-P2-043`). `U-212` (true unreachability under Zone filters) remains open |
| **Constraint** | **Never create, edit, or delete a pre-existing seed product.** See §10.5 and §18 regarding `BLOCKER-P2-001`/`BLOCKER-P2-002` |

### 5.6 Shopping Basket

| | |
|---|---|
| **Page Objects** | `MarketPage` → `BasketPanel`; also reachable via `AppHeader`'s "🛒 Basket" button |
| **Components** | `AppHeader` (basket count badge), `StatsBar` ("Basket Units"), `ProductCard` ("ADD" → inline stepper), `QuantityStepper`, `BasketLine`, `OrderSummary` |
| **Support** | Native `confirm()` handler — "🗑️ Clear All" uses a native dialog (`EV-P2-012`) |
| **Fixtures** | `emptyBasket` (precondition guard + teardown) — **required for every basket/checkout test** because the basket is a persistent account-scoped singleton (`EV-P2-013`) |
| **Data** | A product to add — prefer a self-created temporary product when the test will proceed to checkout (§11.4) |
| **Dependencies** | Product Catalog (item source). Hard prerequisite for Checkout |
| **Cleanup** | **Mandatory and cross-session.** Basket contents survive logout/login and reload — an uncleaned basket contaminates every later run, not just the current one |
| **Test boundaries** | Add; header count (distinct items) vs. Basket Units (total quantity) as two intentionally different metrics (`EV-P2-007`); increment/decrement; Remove; Clear All; persistence across logout/login (`EV-P2-013`) |
| **Known defect surface** | Post-reload header/stats stuck at 0 despite correct server data (`EV-P2-014`); the `404` decrement anomaly (`EV-P2-009`, trigger `U-201` unconfirmed) — §18 |

> **Re-discovery implications for the Basket Architecture Gate (2026-09-24).** Recorded only as inputs; **no architectural decision in this document is changed by this note**, and AD-06 remains *Proposed*. Evidence IDs `D-xx` are defined in Feature Map → Shopping Basket → *Re-discovery Reconciliation*.
>
> - **Shared across browser sessions:** the basket is shared by every browser context and session of the account (`D-22`), and another actor used the account concurrently during re-discovery (`D-31`). Browser-context isolation does not isolate basket tests; this bears directly on AD-06 and §19.
> - **Genuine re-read for basket truth:** besides the header stats (`EV-P2-014`), an already-rendered Basket tab can also be stale after an add from the Products tab (`D-23`). The table above and §12's cleanup-verification row name "the Basket tab" as the source of truth; re-discovery indicates that only a fresh load or "🔄 Refresh" is a reliable read.
> - **Cleanup scope and order:** UI-only cleanup is confirmed feasible (Remove, "−" at 1, Clear All — `D-15`, `D-17`, `D-19`). Clear All empties the entire account basket, including any concurrent session's items. The basket should be empty before a temporary product is deleted, since basket behavior for a deleted product is NOT VERIFIED.
> - **Two stepper behaviors:** both steppers render the same "- / qty / +" markup, but the Basket-tab stepper behaved correctly (`D-12`) while the Products-card stepper applied stale quantities (`D-13`). This bears on §7.6's shared `QuantityStepper` proposal, and on §14.3/§15's reading of `EV-P2-008` as ordinary latency, which `D-13` contradicts for the card.
> - **§18.1 rows 2 and 3:** neither reproduced in re-discovery (`D-21`, `D-27`); both historical records stand.
> - **Loading indicator:** "Loading basket..." can remain visible alongside a rendered empty basket (`D-07`), so its visibility is not a usable readiness signal.
> - **Diagnostic capture:** network logging/diagnostic capture must redact sensitive authentication/profile data by default (`D-33`); this bears on §21's network-capture evidence.

### 5.7 Checkout / Order Creation

| | |
|---|---|
| **Page Objects** | `BasketPanel` |
| **Components** | `OrderSummary` ("📦 Place Order") |
| **Modals** | `OrderConfirmationModal` ("✅ Order Placed Successfully!", Order Number, Total Amount, line items) |
| **Fixtures** | `emptyBasket` + `temporaryProduct` — checkout tests should consume **self-created stock**, not seed stock (§11.4) |
| **Data** | A non-empty basket |
| **Dependencies** | Shopping Basket (hard prerequisite). Feeds Orders Management |
| **Cleanup** | The created order must be deleted via Orders Management. **Stock consumption is NOT reversible** (`EV-P2-020`) — this is why the ordered product should be a temporary one that is then deleted entirely |
| **Test boundaries** | Single-click order placement; confirmation modal contents; order appears in Orders. **Confirmed absence:** no payment, address, or shipping step exists anywhere (`EV-P2-015`) — a confirmed absence, not an untested gap |
| **Not verified** | Empty-basket checkout and over-stock checkout were never tested (`U-204` family) — the architecture must not assume either behavior |

### 5.8 Orders Management

| | |
|---|---|
| **Page Objects** | `MarketPage` → `OrdersPanel` |
| **Components** | `OrderRow` (collapsible; expanded exposes Items, Status select, Delete Order) |
| **Modals** | `ConfirmDeleteModal` — a **custom in-page modal** ("⚠️ Confirm Delete"), structurally different from the native dialogs used by Clear All and Delete Product (`EV-P2-018`) |
| **Fixtures** | `createdOrder` (creates via the real checkout path, guarantees deletion in teardown) |
| **Data** | Orders exist only via Checkout. One pre-existing order (O62676, status Delivered; O52638 in the account used before 2026-09-30) is present in the account and **must be treated as read-only seed data** |
| **Dependencies** | Checkout / Order Creation. Hosts Order Lifecycle |
| **Cleanup** | Delete Order removes the record cleanly (`EV-P2-018`) but **does not restore consumed stock** (`EV-P2-020`) — cleanup here is complete for the order, incomplete for the inventory side effect (§12.3) |
| **Test boundaries** | Order list; expand/collapse; order contents; Delete Order with custom-modal confirmation; Orders stat decrements |

### 5.9 Order Lifecycle

| | |
|---|---|
| **Page Objects** | `OrdersPanel` |
| **Components** | `OrderRow` (owns the Status `<select>`: `selectStatus()` for non-final values only). The "🔄 Refresh" control belongs to the whole list and is owned by `OrdersPanel` |
| **Fixtures** | `createdOrder` — **never a seed order.** The one pre-existing order is Delivered/locked and must not be mutated |
| **Data** | Status reference constants: Pending / Processing / Shipped / Delivered / Cancelled |
| **Dependencies** | Entirely nested inside Orders Management — no independent entry point |
| **Cleanup** | Status changes are not independently reversible; the order carrying them is deleted as part of `createdOrder` teardown |
| **Test boundaries** | Status change persists server-side immediately (`EV-P2-017`, `D-42`); the row reflects the change automatically after the application's own orders re-read (`D-40`); **Delivered locks the select** (`EV-P2-016`, confirmed) |
| **Critical unknown** | **Whether "Cancelled" is also terminal is NOT VERIFIED (`U-202`).** The framework must not model Cancelled as locked. A test asserting it would be asserting an assumption, not a confirmed rule |
| **Known display behavior** | After a successful change the badge shows the old status only until the application's automatic `GET /api/orders` completes, then the redrawn row shows the new status with no Refresh (`D-40`, CONFIRMED FROM EXECUTION). *Previously documented as "requires a manual Refresh" (`EV-P2-017`) — that interpretation is contradicted.* §15.3, §18 |
| **Source-only behavior (not executed)** | Selecting Delivered or Cancelled opens a "⚠️ Confirm Final Status" modal; the select is rendered disabled for Cancelled as well as Delivered; cancelling states that items return to stock (`D-44`–`D-46`, CONFIRMED FROM SOURCE INSPECTION only). None of this is automated (`LIF-004` deferred) |

### 5.10 Coverage confirmation

All nine approved features are mapped. The three approved cross-feature journeys are addressed architecturally in §17.

---

## 6. Page Object Strategy

### 6.1 The three-tier object model

This application does not fit a conventional one-class-per-page model, because eight of its nine features live on a single URL. The architecture therefore defines three distinct object tiers with hard boundaries:

```
Page      — owns a URL or a full-screen surface; owns navigation
  └── Panel   — owns a tab region inside /market.html; no URL of its own
        └── Component — owns a repeated UI structure; no feature ownership
```

### 6.2 What qualifies as a Page Object

A Page Object must own **a real navigable URL or a full-screen application surface**. Exactly three qualify:

| Page Object | Surface | Responsibility |
|---|---|---|
| `PortalPage` | `/` | Public portal; opens the Login/Register modal; unauthenticated entry point |
| `MarketPage` | `/market.html` | The Market **shell**: header, stats bar, tab switching. Provides access to the three panels. Deliberately thin |
| `ProfilePage` | `/profile.html` | Post-login destination; Logout control; account surface. **Handled with artifact caution — displays a live API key** (`EV-P1-014`, §8.6) |

Nothing else is a Page. Adding a fourth Page Object requires a newly discovered URL — not a new feature.

### 6.3 What qualifies as a Panel Object

A Panel owns a **tab region** within the Market shell. Exactly three qualify: `ProductsPanel`, `BasketPanel`, `OrdersPanel` — matching the three confirmed tabs ("🛍️ Products", "🛒 Basket", "📦 Orders").

Panels expose feature-level operations and queries. They do **not** navigate by URL; they are reached through `MarketPage`'s tab switching, which mirrors how a real user reaches them.

### 6.4 What qualifies as a Component

See §7. Briefly: a repeated UI structure, appearing many times on one surface or across surfaces, with its own coherent responsibility.

### 6.5 Preventing god objects

`MarketPage` is the god-object risk in this architecture, because the real application concentrates everything on one URL. Three hard rules prevent it:

1. **`MarketPage` owns only the shell** — header, stats bar, tab switching, and panel access. It must not contain product, basket, or order logic.
2. **Panels delegate repeated structure to Components.** `ProductsPanel` must not contain card-internal locators; it returns `ProductCard` instances.
3. **Size as a review signal, not a rule.** A Panel growing past roughly 200 lines, or a Page past roughly 150, is a prompt to ask whether a Component is missing. This is a review heuristic, not a lint rule.

### 6.6 Selector encapsulation

Every selector for a given UI region lives in exactly **one** object. A selector string must never appear in a spec file, a workflow, a fixture, or a data module. If two objects need the same element, the element belongs to the more specific object and the other composes it.

### 6.7 Navigation representation

- **URL navigation** (`page.goto`) exists only in Page Objects, and only for the three confirmed routes.
- **Navigation boundary:** every Page Object `goto()` resolves at `DOMContentLoaded` (`waitUntil: 'domcontentloaded'`): the document has been parsed and its document scripts have run. It does **not** establish application or business readiness — navigation is not readiness. The caller establishes readiness through the §15.2 mechanisms. The browser `load` event is deliberately not the boundary: it waits for every subresource, including large images that no scenario depends on, so a slow image could fail a test whose business outcome had already been reached.
- **Tab switching** is a `MarketPage` responsibility, performed by clicking the real tab buttons — never by URL manipulation, because no per-tab URL exists (`EV-P2-023` confirmed filters and tabs produce no URL, hash, or route change).
- **Modal opening** is owned by whichever object hosts the trigger; the modal object owns everything from open to close.

### 6.8 Business operations vs. raw interaction

Objects expose **intent-level operations** (`addToBasket()`, `openDetails()`, `changeStatus(status)`), not mechanical ones (`clickButtonAt(3)`). Mechanics that are specific to this application — per-character typing in search, native-dialog registration before Delete — are encapsulated inside the operation, so that no test has to know them.

### 6.9 Assertions in Page Objects — the rule

**Page Objects, Panels, and Components do not assert.** They expose two things:

1. **Queries** returning domain values — `getVisibleProductNames(): Promise<string[]>`, `getStats(): Promise<MarketStats>`, `getStockText(): Promise<string>`.
2. **Locator getters** for the test to pass into web-first `expect()` calls, preserving auto-retry.

Assertions live in tests (§14). The single permitted exception is an **internal precondition guard** — an object may fail fast with a clear message if it is asked to operate on something that is not present (e.g. `ProductFormModal.save()` when the modal is not open). That is a guard, not a business assertion, and it must never replace a test's assertion.

### 6.10 Business logic in Page Objects

Objects may contain **UI-mechanical knowledge** (how this app's search box must be typed into). They must not contain **business rules** (what the filtered result *should* be). The expected outcome is the test's knowledge; producing the actual state is the object's.

---

## 7. Component Strategy

Each component below is justified by a repeated structure or a real boundary confirmed in Discovery. Components that would be speculative are explicitly declined at the end of this section.

### 7.1 `AppHeader`

- **Why reusable:** present on every authenticated Market surface, and its state is the primary authentication indicator (`EV-P1-014`, `EV-P0-010`).
- **Owns:** brand link, "🛒 Basket" button + count badge, username display, nav links (Wiki / API Docs / Data Viewer / Profile), theme toggle, and — on `/profile.html` — Logout.
- **Exposes:** basket item count; authenticated-vs-unauthenticated state; navigation actions.
- **Does NOT expose:** basket contents (that is `BasketPanel`), or any credential-bearing value.

### 7.2 `StatsBar`

- **Why reusable:** a fixed four-metric row used as a cross-feature verification surface (Products, Basket Units, Orders, Inventory Value) (`EV-P0-010`, `EV-P2-042`).
- **Owns:** the four stat tiles.
- **Exposes:** a typed `MarketStats` snapshot.
- **Does NOT expose:** assertions about correctness — the stats are a **known staleness surface** after reload (`EV-P2-014`), and the component must report what is displayed, never a "corrected" value.

### 7.3 `FilterBar`

- **Why reusable:** a single coherent control cluster (search textbox + Sort/Zone/Type selects + result summary + active-filter chip) driving one result set.
- **Owns:** the search box — **including the confirmed requirement to type character-by-character**, since a bulk value-set does not trigger filtering (`EV-P2-002`) — the three `<select>` controls, and the "N products shown" summary.
- **Exposes:** setting each filter dimension; reading the displayed result count and active-filter chip text.
- **Does NOT expose:** any compensation for the transient Zone/Type/Sort stale display (`EV-P2-005`). It must report the displayed state faithfully. See §15.4.

### 7.4 `CategoryChips`

- **Why reusable:** ten structurally identical chips with confirmed multi-select OR semantics, plus the "Clear Filters" control (`EV-P2-021`–`EV-P2-028`).
- **Owns:** chip selection/deselection and "Clear Filters".
- **Exposes:** select/deselect by category name; clear all filters.
- **Does NOT reliably expose:** **selected state.** The chips are plain `generic` elements with no role and no `aria-pressed`/`aria-selected` (`EV-P2-021`). Selection is conveyed visually only. The component must not fabricate a boolean "isSelected" from ARIA that does not exist — see §13.4 for the locator consequence and §14.5 for the assertion consequence.

### 7.5 `ProductCard`

- **Why reusable:** the single most-repeated structure in the application — 33 instances with a confirmed-consistent internal layout (`EV-P2-059`).
- **Owns:** category emoji, the three action buttons (👁️ / ✏️ / 🗑️, whose accessible names are exactly those emoji), product name heading, category text, Zone/Type badges, price, stock text, and the "ADD" button / inline stepper.
- **Exposes:** name, price, stock text, zone, type; and the actions openDetails / openEdit / requestDelete / addToBasket.
- **Does NOT expose:** catalog-level concerns (counts, filtering). **Critically, card action buttons must always be located within a card scope** — every card exposes all three emoji names, so an unscoped lookup is ambiguous across 33 cards (§13.3).

### 7.6 `QuantityStepper`

- **Why reusable:** the "- / qty / +" control appears both on product cards after adding and within basket lines (`EV-P2-007`, `EV-P2-008`).
- **Owns:** increment, decrement, current quantity.
- **Caveat — honest scoping:** that both surfaces *have* a stepper is confirmed; that they share **identical DOM structure** is **NOT VERIFIED**. The architecture proposes a shared component, to be confirmed at implementation. If the structures differ, two thin components are correct and preferable to a parameterized one.
- **Resolved during implementation:** both surfaces use the same structure, a `.quantity-control` container with buttons named "-" and "+" (confirmed live, and in the page source), so one `QuantityStepper` serves both.

### 7.7 `BasketLine`

- **Why reusable:** one repeated row per basket item (name, stepper, subtotal, "Remove").
- **Exposes:** product name, quantity, subtotal, remove action.
- **Does NOT own:** totals or "Place Order" — those belong to `OrderSummary`.

### 7.8 `OrderSummary`

- **Why justified:** a distinct panel ("Order Summary", "N item(s)", "Total", "📦 Place Order") that is the **checkout boundary** — a real feature boundary, not just markup.
- **Exposes:** item count, total, place-order action.

### 7.9 `OrderRow`

- **Why reusable:** one repeated collapsible row per order; expansion reveals Items, the Status `<select>`, and "Delete Order" (`EV-P2-016`).
- **Exposes:** order number, total, status badge, chevron, expand/collapse, items, the Status `<select>` (read, and `selectStatus()` restricted to non-final statuses), and the "Delete Order" button. The list-wide "🔄 Refresh" and the request synchronization for delete and status change are owned by `OrdersPanel`.
- **Must preserve:** that the Status select is **`disabled` when the order is Delivered** (`EV-P2-016`) — exposed as observed state, never worked around.

### 7.10 Modal components

| Modal | Justification |
|---|---|
| `ProductFormModal` | **One object for both Add and Edit** — confirmed structurally identical, Edit merely pre-filled (`EV-P2-036`, `EV-P2-047`). Two objects would duplicate every field. Owns native HTML5 validation-message reading |
| `ProductDetailsModal` | Distinct read-only modal with its own confirmed field set and two close controls (`EV-P2-060`–`EV-P2-066`). Owns the confirmed facts that Escape does not close it and that no network request fires |
| `OrderConfirmationModal` | Single-instance, but a real workflow boundary carrying the order number needed downstream (`EV-P2-015`) |
| `ConfirmDeleteModal` | The **custom in-page** confirmation used by Delete Order (`EV-P2-018`) — deliberately distinct from native dialogs |

### 7.11 Native dialogs are NOT components

"🗑️ Clear All" (basket) and "🗑️" (Delete Product) use **native browser `confirm()` dialogs** (`EV-P2-012`, `EV-P2-048`), which have **no DOM representation**. They cannot be modeled as components and must be handled through Playwright's dialog event in `src/support/` — see §16.4. Confusing these two patterns is a predictable and costly implementation error, which is why the architecture names them separately.

### 7.12 Deliberately declined component boundaries

- **Individual stat tile** — no independent behavior; `StatsBar` is the right granularity.
- **Individual category chip** — no independent behavior beyond click; `CategoryChips` owns the set.
- **Product detail "Specifications" block** — a rendering detail of one modal, not a reusable structure.
- **Generic `Modal` base class** — the four modals differ in close controls, confirmation semantics, and validation behavior. A shared base would abstract over real differences for no gain; this is deliberately deferred to implementation if genuine duplication emerges.

---

## 8. Authentication Architecture

### 8.1 What Discovery established

| Fact | Evidence |
|---|---|
| `/market.html` and `/profile.html` are 401-gated with a client-side redirect to `/` | `EV-P0-010/011`, `EV-P1-007`, `EV-P1-018` |
| Login succeeds from the portal modal and lands on `/profile.html` | `EV-P1-014` |
| Session survives navigation to another protected route | `EV-P1-015` |
| Session survives a full page reload | `EV-P1-016` |
| Logout invalidates the session **server-side** — not merely a UI change | `EV-P1-017`, `EV-P1-018` |
| In Pass 1, login failures rendered **no visible on-page error** — a historical observation, not a UI contract. The current portal source has a failure-message path, `showSnackbar(...)` (CONFIRMED FROM SOURCE INSPECTION); whether it renders for the real account is NOT VERIFIED | `EV-P1-004/005/012/013` |

**Not established:** the underlying session mechanism (cookie vs. token in storage) was never inspected. The architecture therefore must not depend on which it is.

### 8.2 Storage-state strategy

A **setup project** logs in once through the real UI and persists the authenticated context to a storage-state file. Feature projects declare a dependency on it and consume that state.

```
[setup project]  real UI login  →  storage state file (git-ignored)
       │
       └── consumed by → catalog · search · product-management · basket ·
                          checkout · orders · order-lifecycle projects
```

Playwright's storage state captures **both cookies and origin storage**, so it works regardless of which mechanism this application uses — which is exactly why it is the right choice given that the mechanism is unverified.

**Mandatory first implementation step:** verify that restoring storage state actually yields an authenticated session (navigate to `/market.html`, confirm no redirect). If it does not, the session is not captured by storage state and the fallback is per-worker live login. This is a **known verification task**, not an assumption, and is recorded as a deferred item in §29.

**Storage-state files are git-ignored artifacts.** They are session credentials in file form and must never be committed.

### 8.3 Authenticated vs. unauthenticated states

| Fixture | Context | Used for |
|---|---|---|
| `authenticatedPage` | Storage-state-backed context | The default for nearly all tests |
| `unauthenticatedPage` | Clean context, **no** storage state | Protected-route gating, redirect behavior, login-failure modes |
| `disposableSessionPage` | Own context **and its own live login** | Logout and session-invalidation tests only |

### 8.4 Logout isolation — a hard, evidence-driven constraint

Because **logout invalidates the session server-side** (`EV-P1-018`), and because the project has **exactly one account**, a logout test that shares the suite's session could invalidate the credential every other running test depends on.

Whether two concurrent sessions can coexist for one account is **NOT VERIFIED** — Discovery never tested it. The architecture therefore takes the conservative position:

1. Logout/invalidation tests run in a **dedicated project** using `disposableSessionPage` (its own context and its own fresh login).
2. That project is **serialized** and ordered **last**, so that even if concurrent sessions turn out to be mutually exclusive, no other test is affected.
3. Shared storage state is never used by a test that intends to log out.

This is a case where an unverified behavior drives a conservative design rather than an assumed one.

### 8.5 Login-once vs. login-per-test

**Login once (setup project), reuse via storage state.** Rationale: login is exercised on its own merits by the Authentication feature's tests; repeating it as setup for every other test adds runtime, adds a failure mode unrelated to the test's subject, and — given a single shared account — multiplies concurrent session creation whose safety is unverified.

### 8.6 Credential handling and artifact hygiene

- Credentials are read from a git-ignored `.env`, surfaced through a single validated accessor in `src/support/`. Never inlined, never defaulted, never logged.
- `.env.example` is committed with **empty values** as a template (this file already exists in the correct form).
- Config must **fail fast** with a clear message if a required variable is missing — and that message must name the variable, never echo the value.
- **Artifact hazard — specific to this application:** `/profile.html` renders the account's permanent, non-regenerable API key in plaintext as normal page content (`EV-P1-014`). Traces, screenshots, and videos captured on that page would embed a live credential into an artifact that CI may publish. Mitigations, in preference order: (a) do not visit `/profile.html` except where a test genuinely requires it; (b) disable or scrub artifact capture for specs that must visit it; (c) mask the key element before any capture. **Never read, assert on, or log the key's value.** See §20.5 and §21.5.
- Password fields are `type="password"` and thus masked in screenshots; **the API key is not masked by anything** — this asymmetry is the whole reason this constraint exists.

### 8.7 CI secret injection

Credentials are supplied to CI as repository/environment secrets mapped to the same environment variable names used locally. No `.env` file is ever committed or reconstructed into the repository. Secrets are never echoed to logs. See §22.

---

## 9. Fixture Architecture

### 9.1 Design posture

One extended `test` object is exported from `src/fixtures/` and imported by every spec. Fixtures are deliberately **few and purposeful** — each exists because a real precondition or a real cleanup obligation demands it, not because a feature exists.

### 9.2 The fixture set

> **Reconciled 2026-09-27** against `src/fixtures/`. The original proposal described `emptyBasket` as clearing the basket and `createdOrder` as depending on `temporaryProduct`, and listed `evidenceCollector` as a fixture. The table below describes what exists.

| Fixture | Module | Responsibility | Depends on | Cleanup |
|---|---|---|---|---|
| `unauthenticatedPage` | `index.ts` | Page in a clean context, no storage state | — | Context disposal |
| `authenticatedPage` | `index.ts` | Page in a context restored from the `setup` project's storage state | storage state file | Context disposal |
| `disposableSessionPage` | `index.ts` | Own context **plus** its own live UI login (logout / session-boundary tests only) | credentials | Context disposal; the session may already be invalidated by the test |
| `marketPage` | `index.ts` | `MarketPage` on `/market.html`, catalog rendered | `authenticatedPage` | None |
| `temporaryProduct` | `index.ts` | One uniquely named product created through the real Add Product UI | `marketPage` | Verify, then delete through the real 🗑️ path if still present; fails loudly naming the product |
| `ownedProducts` | `basket.ts` | Creates any number of uniquely named products on request; records each name **before** Save | `marketPage` | Deletes every recorded product that is still present, **except** any the basket guard marked as still in the basket; fails loudly naming each orphan |
| `emptyBasket` (automatic) | `basket.ts` | **A guard, not a pre-test cleanup.** At entry it reads the basket from an independent fresh session and **fails** if it is not empty — it never removes pre-existing lines (they may belong to another session of the account). At exit it removes only this test's own lines, verifies with a genuine re-read, and fails loudly on anything left | `ownedProducts` (fixes teardown order: lines before products) | Removes owned lines only; reports non-owned lines without touching them (approved decisions P-2–P-4) |
| `secondSessionMarket` | `basket.ts` | A second, independent storage-state session of the same account (`BSK-018`) | — | Context disposal |
| `createdOrder` | `orders.ts` | Places one real order through the real Checkout UI with an `ownedProducts` product; yields the order number and product | `marketPage`, `ownedProducts`, `emptyBasket` | Deletes the order through the Orders UI if still present (teardown order: order → basket guard → product). **Cannot restore consumed stock** (`EV-P2-020`) |

**Feature extensions.** `basket.ts` extends the base `test`, and `orders.ts` extends `basket.ts`. Specs import the narrowest extension they need, so the automatic basket guard runs only where a test touches the basket (accepted as a pattern at the Shopping Basket gate, finding F-05).

**Evidence collection is not a separate fixture.** `attachFailureEvidence()` (`src/support/evidence.ts`) is wired into every page fixture (and into the independent sessions opened by `emptyBasket` / `secondSessionMarket`); it records console errors and 4xx/5xx responses and attaches them only on failure. The same fixtures install `failOnUnexpectedDialogs()` (`src/support/dialogs.ts`).

### 9.3 Why `emptyBasket` is not optional

The basket is an **account-scoped server-side singleton that persists across logout/login and reload** (`EV-P2-013`, `EV-P2-014`). A leftover item from any earlier test — or from any earlier *run*, or from a developer's manual session — silently changes the starting state of every basket and checkout test. Discovery encountered exactly this: a stray basket item survived into a later session and had to be cleaned up before work could proceed (`EV-P2-034`).

`emptyBasket` therefore guards **both ends**: it asserts an empty basket before the test body (failing the test as a setup failure if it is not — it never clears unknown lines), and restores it after by removing only the test's own lines.

### 9.4 Why `temporaryProduct` owns its own cleanup

Product creation is the only safe way to obtain mutable data in this application, because seed products must never be mutated (§10.5). Binding creation and deletion into one fixture makes leakage structurally unlikely rather than dependent on each test remembering.

### 9.5 Fixture dependency boundaries

```
authenticatedPage
   └── marketPage
          ├── temporaryProduct
          └── ownedProducts
                 └── emptyBasket (auto)
                        └── createdOrder   (also depends on ownedProducts)
```

Rules:
- Fixtures may depend on fixtures; **fixtures must never depend on tests**.
- No fixture asserts business behavior. A fixture may **fail fast on an unmet precondition** — that is a setup failure, and it must be clearly distinguishable in the report from a genuine test failure (§16.7).
- No fixture may silently repair application state beyond its declared cleanup scope.
- Teardown runs in dependency order: the created order first, then basket lines, then the product. What happens to a basket line or an order whose product has been deleted is NOT VERIFIED, so a product is never deleted while either still refers to it.

### 9.6 Avoiding fixture explosion

Eight fixtures, none per-feature. Rejected: per-feature page fixtures (the panels are already cheap to obtain from `marketPage`), a "logged-in-as-role" fixture (only one account and one role exist — `U-006` remains open on whether roles differ at all), and per-test-data-type factories (a single unique-name builder covers the need, §11).

---

## 10. Test Isolation Strategy

### 10.1 The governing constraint

**One account. One shared, persistent, server-side dataset.** Every worker, every spec, and every concurrent local run operates on the same catalog, the same basket, and the same orders list (`EV-P2-013`, `EV-P2-054`). This single fact drives nearly every isolation decision below.

### 10.2 Browser context isolation

Every test gets its **own browser context** (Playwright's default). This isolates cookies, storage, and in-memory UI state — which is genuine isolation for client-side concerns such as filter state (`EV-P2-023` confirmed filters are pure client state with no URL persistence).

**What context isolation does NOT isolate:** anything server-side. Two contexts authenticated as the same account see the same basket, the same catalog, and the same orders. Context isolation is necessary but nowhere near sufficient here.

### 10.3 Session isolation

Covered in §8.4. Summary: shared storage state for the majority; dedicated, serialized, own-login contexts for logout/invalidation tests, because logout invalidates server-side (`EV-P1-018`) and multi-session safety is unverified.

### 10.4 Basket isolation — treat as a global singleton

The basket is account-scoped and persists across navigation, reload, and logout/login (`EV-P2-013`, `EV-P2-014`). **Two tests manipulating the basket concurrently will collide.**

Response:
- All basket, checkout, and order-creation tests run in a **serialized project** (§19).
- The `emptyBasket` fixture guards entry and exit (§9.3).
- No test may assume the basket is empty without the fixture establishing it.

### 10.5 Product isolation — self-owned data only

The catalog is **per-account owned** — every product shares the authenticated account's `owner_id` (`EV-P2-054`) and one bulk-seed `created_at` (`EV-P2-053`).

Rules:
- **Mutating tests operate only on products they created themselves**, with unique names (§11.3).
- **Pre-existing seed products are strictly read-only.** Never edit, never delete, never order in a way that consumes their stock.
- Read-only tests select products by **queried attributes**, never by hardcoded identity (§11.2).

**An important scoping clarification.** During Discovery, attempts to Save an edit or initiate a Delete on the seed product "Hass Avocado" were blocked (`BLOCKER-P2-001`, `BLOCKER-P2-002`). That block came from the **Claude Code harness's own permission classifier**, not from any QACLOUD application authorization rule — proven by contrast, since the identical operations on a self-created product in the same session completed with no block (`EV-P2-047`, `EV-P2-048`).

The architectural consequence is important and easy to get wrong: **that guardrail will not exist when the suite runs under `npx playwright test`.** The application itself will permit seed-product mutation. Therefore "never mutate seed data" must be enforced by **design discipline, code review, and fixture structure** — it cannot be assumed to be enforced by tooling. This is precisely why `temporaryProduct` exists as the only sanctioned path to mutable product data.

### 10.6 Order isolation

Orders are account-global and appear in one shared list. One pre-existing order (O62676, Delivered, therefore status-locked per `EV-P2-016`; O52638 in the account used before 2026-09-30) must be treated as read-only seed data.

Response:
- Order tests create their own orders via the real checkout path (`createdOrder`) and delete them in teardown.
- Assertions target **the specific order the test created**, identified by its order number — never "the first row" or "the row count", both of which are shared state.
- Order tests run in the serialized project alongside basket and checkout (§19).

### 10.7 Stock — a depleting, non-renewable shared resource

This deserves its own heading because it has no clean solution.

**Confirmed:** placing an order decrements the ordered product's stock (`EV-P2-020`), and **deleting the order does not restore it** (`EV-P2-020`). Discovery left exactly this residue: Hass Avocado went 9 → 8 and was never restored.

No **automated or confirmed** UI path reverses stock consumption for a product that must otherwise remain untouched. (Cancelling an order states that its items return to stock — `D-46` — but that is confirmed from the page source only, and cancelling is deliberately not automated: it would lock the order, `U-202`.) Therefore every checkout test permanently consumes inventory. Left unmanaged, repeated CI runs would drive seed-product stock toward zero and eventually break the suite against its own test data.

**Architectural response:** checkout tests order a **self-created temporary product** (created with known stock via `temporaryProduct`) rather than a seed product. The stock consumed belongs to a product the test then deletes entirely, so the depletion is confined to data that ceases to exist. This does not make consumption reversible — it makes it **irrelevant**, by ensuring the depleted product is disposable.

Where a test genuinely must order a seed product, that stock consumption is permanent and must be explicitly acknowledged in Test Design, not absorbed silently.

### 10.8 Persistent server-side state — summary

| Resource | Shared? | Persists across session? | Isolation approach |
|---|---|---|---|
| Session | Yes (one account) | Until logout (server-side) | Storage state; disposable contexts for logout tests |
| Basket | **Yes — singleton** | **Yes** (`EV-P2-013`) | `emptyBasket` fixture + serialized project |
| Catalog | Yes | Yes | Read-only for seed; self-created products for mutation |
| Orders | Yes | Yes | Self-created orders, identified by order number; serialized |
| Stock | Yes | Yes, **irreversibly** | Consume only self-created product stock |
| Filter/search state | No — client only | No (`EV-P2-023`) | Context isolation is sufficient |

### 10.9 Parallel execution risk summary

Detailed in §19. The headline risks are: concurrent basket mutation (collision), concurrent catalog mutation invalidating another test's absolute counts, and concurrent session invalidation via logout. Each is addressed by project-level serialization rather than by hoping tests do not overlap.

### 10.10 Cross-run isolation

Because all state is server-side and persistent, **two simultaneous runs of this suite — in CI, or by two developers — will interfere with each other.** The isolation unit is the *account*, and there is exactly one. The architecture's answer is a CI concurrency lock (§22.6) and an explicit expectation that the suite is treated as **single-concurrent-run**. This constraint is a property of the application and account, not of the framework.

---

## 11. Test Data Strategy

### 11.1 The three data tiers

| Tier | What it is | Mutable? | Source |
|---|---|---|---|
| **Reference constants** | Fixed domain vocabulary: the 10 category names, 4 zone values, 2 type values, 5 order statuses, exact UI label strings | Never | Derived from the approved Feature Map — not invented, not re-discovered |
| **Seed catalog data** | The ~33 pre-existing products and the 1 pre-existing order | **Read-only, always** | The live application |
| **Ephemeral owned data** | Products, basket contents, and orders the test creates itself | Yes — this is the only mutable tier | Created and destroyed by fixtures |

### 11.2 Static vs. generated — and the rule against hardcoded identity

**Reference constants are static.** The category list is a confirmed, closed set of exactly ten (`EV-P2-021`), and hardcoding it is correct: if the application's category list changes, a test *should* fail, because that is a real behavioral change.

**Product identity is never static.** No test may hardcode a specific product name, price, stock level, or Product ID as a precondition for passing.

This rule is not theoretical caution — Discovery produced the counterexample. "100% Florida Orange Juice" was present at the Pass 2 baseline and **vanished from the server-side catalog mid-project**, confirmed absent by exact Product ID, with the cause never established (`EV-P2-035`, `EV-P2-050`–`EV-P2-058`, `U-211`, `U-215`). The catalog also moved from 34 products to 33. Any suite that had hardcoded that product, or that count, would now be permanently red for reasons unrelated to any defect under test.

**Instead:** read-only tests select a product by *queried attribute* — "the first product in category Dairy & Eggs", "any product whose stock text indicates low stock", "a product whose Specifications block is non-empty" — resolved at runtime against the live catalog. If no product satisfies the requirement, the test reports a clear **precondition failure**, which is honest and diagnosable, rather than a confusing assertion failure.

### 11.3 Uniqueness strategy for created data

Every created product name must be unique across workers, across concurrent specs, and across runs. Proposed shape:

```
AUT-<runId>-<workerIndex>-<shortLabel>
```

- `runId` — a per-run identifier, so two runs never collide and orphans are attributable to a run.
- `workerIndex` — Playwright's worker index, so parallel workers cannot generate the same name.
- `shortLabel` — a human-readable hint about the creating test.

Three application-specific reasons this matters more than usual here:

1. **Search matches hidden Details data, not just the visible name** (`EV-P2-031`). A weak prefix could cause one test's product to appear in another test's search results.
2. **Sort A-Z / Z-A operate on the same catalog** (`EV-P2-032`). Created products participate in sort ordering, so a prefix must be chosen deliberately, not accidentally — a prefix that lands at one extreme of the alphabet has a predictable, documentable effect on sort-boundary tests.
3. **Orphan identification.** A consistent `AUT-` prefix makes any leaked product immediately identifiable as framework-created and safe to sweep, distinguishing it unambiguously from seed data.

Discovery used exactly this discipline manually — the single temporary product was named `ZZZ Discovery Temp Item`, deliberately prefixed and deliberately sort-extreme (`EV-P2-042`).

### 11.4 When to use seed data vs. create temporary data

| Situation | Use | Why |
|---|---|---|
| Reading catalog, search, filtering, view-details | **Seed data, queried by attribute** | Non-destructive; exercises realistic data volume |
| Any product create / edit / delete test | **Self-created temporary product** | Seed mutation is forbidden (§10.5) |
| Basket add / remove / quantity tests | Either, but basket must be cleaned | Adding to a basket does not consume stock (`EV-P2-020` — consumption happens at checkout) |
| **Any test that places an order** | **Self-created temporary product** | Checkout permanently consumes stock and deletion never restores it (`EV-P2-020`). Confining consumption to a disposable product is the only way to keep the suite repeatable (§10.7) |

### 11.5 Data ownership

All data in this application is owned by the single authenticated account (`EV-P2-054`). There is no multi-user, multi-tenant, or role dimension to model. Two consequences:

- The framework needs no user-role abstraction. `U-006` (whether "+ Add Product" is restricted by role) and `U-217` (whether card actions differ for non-owned products) both remain **open and untestable** with one account — the architecture must not encode an answer to either.
- "Ownership" in this framework means *which test created it*, not which user owns it. That is what the naming convention encodes.

### 11.6 Required field values for created products

Confirmed from `EV-P2-036`–`EV-P2-043`:

- **Product Name** — required, free text.
- **Category** — required, single-select from exactly the 10 catalog categories (note: **single-select here**, structurally different from the multi-select category *filter* chips).
- **Price ($)** — required, `min="0"`. `0` is a valid boundary value; negative values are rejected by native validation.
- **Stock** — required, identical `min="0"` behavior.
- **Details (key/value)** — optional, added one pair at a time.

**Open unknowns the data builder must not assume away:**
- `U-213` — behavior at extreme values, high decimal precision, or non-numeric paste is untested. The builder should default to modest, realistic values and must not present extreme-value handling as known.
- `U-214` — whether 2+ Details pairs, or duplicate keys, are supported is untested (only one pair was ever created). The builder must support one pair confidently and treat multiple as an unverified capability.

### 11.7 The silent-defaults fact the data model must carry

A created product silently receives **Zone = "Standard"** and **Type = "Each"**, and the Add Product form has no field for either (`EV-P2-043`). "Standard" is **not** one of the four real Zone filter options (Dry / Frozen / Chilled / Room Temperature).

This means **a self-created product may not be reachable through a specific Zone filter at all**. Any test that creates a product and then expects to find it via Zone filtering is likely to fail for reasons that are a property of the application, not of the test. `U-212` — whether Zone="Standard" is truly unreachable under every Zone option — remains **open**. The architecture records this so a future Test Design does not walk into it; it does not assume the answer.

### 11.8 State-changing workflow dependencies

Some data only exists as the product of a prior workflow: an order requires a basket, which requires a catalog product. These chains are expressed **through fixture composition** (§9.5), never through test ordering. No test may depend on another test having run.

---

## 12. Cleanup Strategy

### 12.1 Governing rules

1. **UI-only.** Cleanup uses the same real UI paths a user would. No API calls, no direct database access, no backdoor endpoints.
2. **Fixture-owned.** Whatever a fixture creates, that fixture destroys.
3. **Verified.** Cleanup asserts the resource is actually gone; "clicked delete" is not "deleted".
4. **Loud on failure.** A failed cleanup is reported prominently, never swallowed.

**Why UI-only is a deliberate constraint, not an oversight.** An API cleanup path exists in principle — the application exposes `/api/*` endpoints and an API-key auth mechanism. It is rejected for three reasons: (a) the project's scope is UI automation, and API-cleaned state would mean the suite never proves the UI's own delete paths work; (b) it would require storing the account API key, which this project has deliberately never done; (c) Discovery confirmed every required cleanup path **is** achievable through the UI (`EV-P2-018`, `EV-P2-048/049`, `EV-P2-034`), so the shortcut buys nothing. Changing this would be an architectural decision requiring explicit approval (§28).

### 12.2 Cleanup by resource type

| Resource | UI path | Verification | If cleanup fails |
|---|---|---|---|
| **Product** | Card 🗑️ → **native `confirm()`** → accept (`EV-P2-048`) | Product absent from catalog; Products count and Inventory Value return to pre-creation values (`EV-P2-049`) | Fail loudly; record the orphan's unique name in the residual report |
| **Basket** | "Remove" per line, or "🗑️ Clear All" → **native `confirm()`** (`EV-P2-011`, `EV-P2-012`) | Basket empty **on the Basket tab** — not from header stats, which are a confirmed staleness surface (`EV-P2-014`) | Fail loudly; flag that subsequent basket tests are compromised |
| **Order** | Expand row → "Delete Order" → **custom in-page modal** "⚠️ Confirm Delete" → confirm (`EV-P2-018`) | Order absent from the list; Orders stat decremented | Fail loudly; record the order number |
| **Session** | Context disposal; logout only where the test is about logout | Context closed | Low impact — contexts are per-test |

**The dialog-pattern split is a real trap.** Delete Product and Clear Basket use **native browser dialogs** (no DOM). Delete Order uses a **custom in-page modal** (DOM). Cleanup code that assumes one pattern will silently fail against the other — Playwright auto-dismisses unhandled native dialogs, so the delete simply would not happen and the code would proceed as if it had. See §16.4.

### 12.3 The cleanup gap that cannot be closed

**Stock consumed by an order is not restored by deleting the order** (`EV-P2-020`, CONFIRMED FROM EXECUTION). No path the suite uses restores it.

*Reconciled 2026-09-27.* This line previously read *"never restored, by any UI path, ever"*. The application's page source shows that **cancelling** an order returns its items to stock (`D-46`) — CONFIRMED FROM SOURCE INSPECTION, **not** observed in execution. It does not change the containment strategy below, because cancelling is not automated.

This is not a framework limitation; it is confirmed application behavior. The architecture's response is containment, not repair (§10.7): order self-created products, then delete them, so the consumed stock belongs to a record that no longer exists.

Where stock is consumed from a seed product anyway, the framework **reports it as residual state** rather than pretending cleanup was complete. Discovery set this precedent by disclosing the Hass Avocado 9→8 residue instead of hiding it (`EV-P2-020`, `BLOCKER-P2-001`).

### 12.4 Cleanup failure policy

- Teardown errors are **never** caught-and-ignored.
- A cleanup failure marks the test result as compromised even if the test body passed — a passing test that leaked state is not a clean pass.
- The failure message names the exact resource (unique product name, order number) so a human can remove it manually.
- Cleanup does **not** retry blindly. One attempt, then report. A retry loop here would mask the very defect it stumbled into.

### 12.5 Residual-state reporting

The framework maintains a per-run record of resources it created and could not remove, emitted at run end and attached to the report. It answers one question precisely: *what did this run leave behind?*

This mirrors the discipline Discovery applied by hand — `DISCOVERY-STATE.md` carries an explicit, permanent "Known residual data state" section rather than quietly moving on.

### 12.6 Preventing cascading contamination

- `emptyBasket` guards **entry as well as exit** (§9.3), so a leak from an earlier test cannot silently corrupt a later one.
- Tests never assert absolute catalog counts in contexts where another worker may be creating or deleting products (§19.3).
- Orders are identified by their own order number, never by list position.
- A run that detects pre-existing `AUT-`-prefixed orphans at startup should report them, because their presence means a previous run failed to clean up — information worth surfacing, not suppressing.

### 12.7 Orders owned by the test body (approved decision D-2)

Where placing the order **is** the subject of the test (Checkout `CHK-001`–`CHK-006`, journey `JRN-001`), the order is created by the test body, not by `createdOrder` (§17.4), and the test deletes it itself after its assertions through `OrdersPanel.deleteOrder`. `JRN-001` also records the order number as a test annotation the moment it is known, so a failure names the order (§12.4).

**Accepted limitations, not guarantees:**
- If such a test fails after the order exists but before its explicit delete, the order is left behind; `ownedProducts` then still deletes the product while that order references it (application behavior in that case NOT VERIFIED).
- If `createdOrder`'s own cleanup fails, the same product deletion still happens.
- If `createdOrder`'s setup fails after an order was placed but before its number was read, that order cannot be cleaned up automatically; the error says so.

A stronger order-tracking fixture was considered and **not** adopted (D-2).

---

## 13. Locator Strategy

### 13.1 The hierarchy

Applied in order; drop a tier only when the tier above genuinely does not exist in the application.

| Tier | Approach | When |
|---|---|---|
| **1** | Role + accessible name (`getByRole`) | Default. Works well here — buttons, headings, textboxes, links, selects |
| **2** | Visible label / placeholder / exact text | When a role exists but the name does not disambiguate, or for text-identified content |
| **3** | Stable IDs or data attributes **that actually exist** | Only where Discovery confirmed one — e.g. the details modal's `id="itemDetailsModal"` (`EV-P2-060`) |
| **4** | Narrowly scoped CSS, anchored to a stable ancestor | Last resort; the reason and the evidence are recorded in §13.9 |

**Explicitly unavailable:** the application exposes **no `data-testid` attributes**, and this project may not modify the production application. The ideal top tier of most locator strategies simply does not exist here. Recommending test IDs to the application team is a reasonable future suggestion; the framework must work without them.

### 13.2 What works well — tier 1 surfaces

Confirmed clean role+name targets: `+ Add Product`, `ADD`, `Save Product`, `Cancel`, `Clear Filters`, `📦 Place Order`, `Delete Order`, `Close`, `Remove`, `🔄 Refresh`, `Logout`, `Login`, `Register Now`; the three tab buttons; product-name `heading` (level 3); the search `textbox` by its placeholder `"Search by product, category, or detail..."`; the Add/Edit `Category *` combobox. *(Reconciled 2026-09-28: this list also named the order Status `<select>`. Its "Status:" label is not associated with it, so it has no accessible name; it is located as the only combobox inside the expanded order's details, §13.9.)*

### 13.3 Emoji-only accessible names — scoping is mandatory

Card action buttons expose `button` role with accessible names that are **exactly** the emoji: `👁️`, `✏️`, `🗑️` — no label text, no `aria-label` supplement (`EV-P2-059`).

They are perfectly valid role+name targets, but **every one of ~33 cards exposes all three**. An unscoped lookup is ambiguous by construction. The rule is therefore absolute:

```
// Illustrative only — not an implementation
card = productsPanel.cardByName(resolvedProductName)
card.getByRole('button', { name: '👁️' })     // scoped to one card — correct
page.getByRole('button', { name: '👁️' })      // 33 matches — always wrong
```

`ProductCard` exists in large part to make this scoping structural rather than a thing each test remembers (§7.5).

### 13.4 Category chips — the genuine tier-4 case

The ten category chips are plain `generic` elements with `cursor: pointer`. They are **not** `<button>`, `<a>`, or `<input type="checkbox">`, and expose **no ARIA role and no `aria-pressed` / `aria-selected`** (`EV-P2-021`).

*Reconciled 2026-09-28:* in the DOM, each chip is a `div.category-item` wrapping a `<label>` and an `<input type="checkbox">` hidden with `display: none` (CONFIRMED FROM SOURCE INSPECTION). Because the checkbox is not rendered, it is absent from the accessibility tree, which is what Discovery observed. The consequences below are unchanged; tests click the chip's label text.

Consequences, stated honestly:

1. **They cannot be located by role.** Text-based location scoped to the Categories container is the correct approach — the chip labels are stable, exact, and include their emoji (`🥦 Fresh Produce` … `📦 Other`).
2. **Their selected state cannot be read programmatically.** Selection is conveyed only visually (solid teal fill + bold text vs. plain gray) (`EV-P2-022`). There is no accessible state to assert against.
3. **Therefore assert the effect, not the presentation.** The trustworthy assertion for "category X is selected" is the *filtered result set* — which Discovery proved with exact arithmetic (`EV-P2-024`, `EV-P2-030`, `EV-P2-031`). Asserting a CSS class or computed color would couple tests to styling and would still not prove the filter applied.

This is an application accessibility gap. The framework works around it for locating, and refuses to fake it for asserting.

### 13.5 The Sort / Zone / Type dropdowns

These are three `<select>` controls. Across all Discovery snapshots they are identified by their **option sets** (`Sort A-Z`/`Sort Z-A`; `All Zones`/`Dry`/`Frozen`/`Chilled`/`Room Temperature`; `All Products`/`Weighted`/`Each`) (`EV-P0-010`, `EV-P2-005`).

**No accessible name for these three controls is recorded anywhere in the Discovery evidence** — this is stated as an absence of evidence, not as a confirmed absence of a label. Implementation must check first. If a programmatic label or stable `id` exists, it is tier 1/3 and should be used. If not, the fallback is to identify each select by an option it uniquely contains, scoped within `FilterBar` — which is stable, readable, and does not depend on DOM ordering.

*As implemented:* the three selects have stable ids, `#sortOrder`, `#filterTemperatureZone` and `#filterWeighted`, as do `#productSearch`, `#resultsCount` and `#activeFiltersSummary`. All six were confirmed live during implementation, so they are located at tier 3 and the option-set fallback is unused.

The Add/Edit `Category *` combobox is a separate control and **does** have a confirmed accessible name (`EV-P2-036`); it must not be confused with the Zone/Type filter selects.

### 13.6 Modals

- `ProductDetailsModal` — `#itemDetailsModal` is a confirmed stable id (`EV-P2-060`), a legitimate tier-3 anchor for scoping; internal fields are located by their confirmed labels (Category, Price, Stock Status, Available Units, Specifications, Product ID).
- `ProductFormModal` — located by its title (`Add Product` / `Edit Product`); fields by their confirmed labels including the asterisk (`Product Name *`, `Category *`, `Price ($) *`, `Stock *`).
- `ConfirmDeleteModal` — located by its heading `⚠️ Confirm Delete` and its confirmed body text.
- `OrderConfirmationModal` — located by `✅ Order Placed Successfully!`.
- **Background elements are non-interactive while a modal is open** — confirmed by an actual intercepted-click error, not inferred (`EV-P2-060`). Locators must be scoped *into* the open modal rather than relying on the background being absent; it is present in the accessibility tree.

### 13.7 Native HTML5 validation messages

Add Product validation is **browser-native**, not application-rendered: `"Please fill out this field."`, `"Please select an item in the list."`, `"Value must be greater than or equal to 0."` (`EV-P2-037`–`EV-P2-040`).

These messages live in the browser's validation bubble and are **not DOM text**. They are read through the element's validation state/message property, not by a text locator. Any attempt to locate them as page text will fail, and failing to know this would likely be misread as "validation is missing." `ProductFormModal` owns this mechanic.

A second consequence: these messages are **browser- and locale-dependent**. Asserting exact English strings couples the suite to Chromium's wording. The more robust assertion is the *validity state* plus the fact that submission was blocked; exact-message assertions are acceptable only where Test Design explicitly accepts that coupling.

### 13.8 Locator anti-patterns for this codebase

- Unscoped emoji-button lookups (33-way ambiguity).
- Structural CSS chains (`div > div:nth-child(3)`) — no evidence supports any DOM structure being stable.
- Locating a product by index position — ordering changes with Sort and with any created product.
- Asserting chip selection via CSS class or color.
- Any locator built from the stats bar's *values*, which are a confirmed staleness surface.

---

### 13.9 Locators and DOM facts confirmed during implementation

The code carries no comments (owner requirement, 2026-09-28), so the reasons behind every non-tier-1 locator, and the DOM facts they rely on, are recorded here. Each was confirmed live during implementation (CONFIRMED FROM EXECUTION); where marked, it was also read from the application's page source (CONFIRMED FROM SOURCE INSPECTION, a saved copy of `/market.html`). These tier-3 anchors were confirmed during implementation rather than in Discovery, which §13.1 did not anticipate.

- **Stable ids (tier 3):** `#productsGrid`; `#basketCount` and the stats `#totalProductsStat`, `#inventoryValueStat`, `#basketItemsStat`, `#ordersStat`; `#basket-tab` / `#basketContent` and `#orders-tab` / `#ordersContent`; the filter controls (§13.5); the Add/Edit form `#productModal` with `#productModalTitle`, `#productName`, `#productCategory`, `#productPrice`, `#productStock`, `#detailsEditor`, `#detailKey`, `#detailValue`, `#detailsTable`; `#itemDetailsModal` (§13.6); `#deleteOrderModal` and `#orderSuccessModal`, static nodes shown and hidden with the `active` class; `#alert`, the page's one message banner; `#headerUsername`, the header's authenticated username, which starts empty on `/profile.html` and `/market.html` until the page's `GET /api/profile` succeeds and, on the unauthenticated portal, holds the placeholder "User" inside the hidden user menu (CONFIRMED FROM SOURCE INSPECTION).
- **Product cards (tier 4):** one `.card` per product, with `.category`, `.price`, `.stock` and exactly two `.meta-chip` elements, Zone then Type (the order is also CONFIRMED FROM SOURCE INSPECTION). The price is shown with two decimals ("$10.00" for 10), and a stock of 0 shows "⚠️ Out of Stock" instead of a number (CONFIRMED FROM SOURCE INSPECTION).
- **Category names** take three forms: the chip label, with emoji and "&" ("🥩 Meat & Seafood"); the card text, built from the category slug, which drops the "&" ("Meat Seafood"); and the Add/Edit form option, with "&" and no emoji, whose value is the slug. Edit pre-selects the category by slug.
- **Basket and orders (tier 4):** `.basket-item` lines; `.basket-checkout-card`; `.order-card`, `.order-header`, `.order-id`, `.order-status`, `.order-details` and `.order-item`. A basket line leaves out "Stock: N available" when the stock is 0 (CONFIRMED FROM SOURCE INSPECTION).
- **Order Status `<select>`:** unlabeled (§13.2), located as the only combobox inside the expanded order's `.order-details` (CONFIRMED FROM SOURCE INSPECTION).
- **Order confirmation and order lines:** each item renders as two parts, "{Product} × {qty}" and the amount "${amount}", with no dash between them (read-only DOM inspection).
- **View Details fields** have no ids: each is a label `<div>` followed by a sibling value `<div>`, every label is unique, and the section heading reads "📋 Specifications".
- **Login modal:** the Register form stays mounted, hidden, behind Login and Forgot Password, so fields are scoped to `#loginForm` and `#forgotEmail`. The password field is not exposed as a textbox and is located by `input[type="password"]` inside `#loginForm`.
- **Duplicate accessible names:** the Add/Edit form has two "Cancel" buttons, one in `#detailsEditor` and one in the footer (`.form-actions`), and each is scoped to its container. The header's basket button is named "🛒 Basket N", so an exact "🛒 Basket" match is the tab.
- **Message banner:** every application message appears in `#alert` and hides after about 3 s (CONFIRMED FROM SOURCE INSPECTION).

## 14. Assertion Strategy

### 14.1 Four assertion categories

| Category | Asserts | Example subject |
|---|---|---|
| **Business outcome** | A real domain result | An order exists with the expected number and total |
| **UI state** | What the interface displays | Card shows the stepper after "ADD"; Status select is disabled when Delivered |
| **Navigation** | Location and access control | Unauthenticated `/market.html` redirects to `/` |
| **Persistence / server state** | State survives a reload or a re-read | Created product still present after full reload |

### 14.2 Ownership

| Layer | May assert? | Responsibility |
|---|---|---|
| **Tests** | **Yes — exclusively** | All business, UI-state, navigation, and persistence assertions |
| **Page Objects / Panels / Components** | **No** | Expose queries returning domain values, and locator getters for the test's `expect()`. Internal precondition guards only (§6.9) |
| **Fixtures** | **No business assertions** | May fail fast on an unmet precondition; that is a setup failure, reported distinctly (§16.7) |
| **Workflows** | **No** | Composition only; they return results for the test to assert on |

The reason is diagnosability: when an assertion fails inside a shared object, the failure message describes the object's expectation rather than the test's intent, and the same hidden assertion silently governs every test that touches that object.

### 14.3 Web-first assertions are the default

Use retrying assertions against locators (`expect(locator).toHaveText(...)`) rather than snapshotting a value and asserting on the snapshot. This matters especially here: Discovery observed ordinary render latency in the basket, where a snapshot taken immediately after a click showed the old quantity and a follow-up showed the correct one (`EV-P2-008`). A web-first assertion absorbs that latency **without** a sleep and without masking a genuine failure — it still fails if the value never arrives.

### 14.4 Banned weak assertions

Prohibited as a test's primary or sole assertion:

- `toBeVisible()` on an element that was always visible.
- "The page loaded" / title-only assertions.
- Asserting that no error message appeared.

That last one is specifically dangerous in this application. In Pass 1, login failures rendered **no visible error text** (`EV-P1-004/005/012/013`; the current source's failure message is NOT VERIFIED as rendered for the real account), and the basket `404` displayed an empty basket with **zero visible error** (`EV-P2-009`). "No error appeared" is fully consistent with total failure here. Only a positive post-condition — the authenticated header state, the item present in the basket, the order in the list — is trustworthy.

### 14.5 Assert effects, not unreadable presentation

Where the application exposes no accessible state, assert the behavioral consequence:

- **Category selection** → assert the resulting filtered set, not chip styling (§13.4). Discovery's own arithmetic proofs are the model: 6 + 7 = 13 for OR semantics (`EV-P2-024`), exact intersection counts for Category+Zone and Category+Search (`EV-P2-030`, `EV-P2-031`).
- **Filter application** → assert the visible product set and/or the "N products shown" summary, understanding that for Zone/Type/Sort the display is stale while the filter request is in flight (§15.4).

### 14.6 Persistence assertions must re-read from the server

Because **displayed state and server state demonstrably diverge in this application**, a persistence assertion must force a genuine re-read — a full reload, or the app's own "🔄 Refresh" control — and then assert.

Two confirmed cases make this non-negotiable:
- Basket header/stats read `0` after reload while `GET /api/basket` returned correct non-empty data; the display corrected only when the Basket tab was opened (`EV-P2-014`).
- An order status change persisted server-side immediately (`PUT` → `200` with the new status) while the row badge still showed the old value (`EV-P2-017`). Reconciled on 2026-09-26: the badge is stale only until the application's own automatic orders re-read completes, then correct with no Refresh (`D-40`). The rule still applies — a *persistence* claim is made after a forced re-read (`LIF-001`), never from the immediate post-change display.

Asserting only the immediate post-action UI would produce **both** false failures (server correct, display stale) and false passes (display optimistic, server unconfirmed).

### 14.7 Count assertions

Absolute counts ("33 products") are only safe where no concurrent mutation is possible (§19.3). Prefer:
- **Relative deltas** — count before, act, assert the expected change.
- **Set membership** — the created product's name appears / does not appear.
- **Arithmetic relationships** on a known filtered subset, the technique Discovery used throughout Addendum 1.

### 14.8 Asserting known-defective behavior

A test must not silently encode a confirmed defect as the expected result. Options, all of which require explicit Test Design approval:

1. Assert the **correct** behavior and let it fail — the honest default, appropriate where the failure is the point.
2. Mark it `fixme`/`fail` with an evidence reference, so the suite stays green while the defect stays visible and tracked.
3. Assert the **observed defective** behavior — only with a test title marked `[Defect]` and a Test Design scenario stating that it documents a known defect (`EV-ID`), never presented as correct.

Choosing among these is **Test Design's decision, not Architecture's and not an implementer's**. What Architecture fixes is that option 3 may never be done invisibly.

---

## 15. Synchronization / Timing Strategy

### 15.1 Prohibited

`page.waitForTimeout()` and every equivalent fixed sleep. No exceptions. In an application with confirmed staleness defects, a sleep is not a synchronization mechanism — it is a coin flip that sometimes hides a real bug.

### 15.2 Sanctioned mechanisms

The table states the principle: the kinds of synchronization the framework accepts. Which helpers implement each kind follows the table, and the application behavior each one answers is in §15.3.

| Mechanism | Use for |
|---|---|
| **Web-first retrying assertions** | The default for nearly everything. Absorbs render latency without hiding failure |
| **Explicit observable-state waits** | Modal open/closed, row expanded, stepper present |
| **Read-only network-response observation** (`waitForResponse` on confirmed endpoints) | Distinguishing "the server responded" from "the display updated" — the central distinction in this application |
| **Page load-state wait** (`networkidle`) | Settling a freshly loaded page before its first interaction, where the page's own start-up requests can still repaint what the test is about to act on. Not a substitute for waiting on the request a user action triggers |
| **The application's own refresh controls** | "🔄 Refresh" is a real user action and a legitimate step, when the test is explicit that it is taking it |

Network observation deserves a note: **observing** responses is read-only and does **not** violate the UI-only scope. The prohibition is on *driving* the application through the API, not on watching what the browser already did. The confirmed endpoints are `GET /api/products`, `GET /api/products/filter`, `GET /api/basket`, `PUT /api/basket`, `PUT /api/orders/{id}`, and `GET /api/profile`. `GET /api/products/filter` is the request a Zone/Type/Sort or Category change issues; it was confirmed live during the Search & Filtering implementation pass and is the endpoint §15.4 refers to. Later passes also observe `POST /api/basket`, `DELETE /api/basket/{productId}`, `DELETE /api/basket/clear`, `GET /api/orders`, `POST /api/orders` and `DELETE /api/orders/{id}`; the predicates live in `src/support/basket-requests.ts` and `src/support/order-requests.ts`, record method and path only, and are used through `awaitRequestFrom()` (wait for the request an action issues) and `recordRequests()` (prove an action issued none). The authentication tests also observe `POST /api/login`: `LoginModal.loginAndAwaitResponse()` submits the login form through `awaitRequestFrom()`, with a method-and-path predicate private to `LoginModal`, and returns the response, whose status AUTH-010 asserts.

**Implemented mechanisms.**

- **Web-first assertions:** the default in every test.
- **Observable-state waits:** `waitForProductPresent()` / `waitForProductAbsent()`, the product form closing at the end of `saveAndAwaitCatalog()`, and a tab's panel becoming visible after its request.
- **Request observation:** `applyAndAwaitCatalog()` (waits until every catalog request an action started has finished), `awaitRequestFrom()` and `recordRequests()`. Every filter change, save, delete and tab switch is synchronized this way.
- **Page load-state wait:** only in `waitForCatalogLoaded()`, which waits for the first product card and then for the page's `networkidle` load state. It is called only after a full navigation to `/market.html`: in the `marketPage` fixture, in the basket and order fixtures, and wherever a test reloads the page. It answers one behavior, the grid rendering twice on load (§15.3), and is an intentional part of the current framework.
- **Navigation is not a readiness mechanism:** Page Object `goto()` resolves at `DOMContentLoaded` (§6.7) and establishes only that the document has been parsed and its document scripts have run. The browser `load` event is deliberately not used as a readiness signal; readiness always comes from one of the mechanisms above.

What the load-state wait establishes is narrow. Playwright reports `networkidle` once the page has had no network connection for at least 500 ms, and its documentation discourages the state as a general-purpose wait. Here it establishes only that the page's start-up requests have finished, so the start-up render cannot repaint the grid after the test's first action. It does not establish that those responses were correct, in which order they were answered or applied, or anything about a request a later action starts; it does not remove the transient stale display (§15.4) or the overlap of a user action with an in-flight filter request, which no scenario covers (`FIL-022`).

### 15.3 Behavior-specific synchronization

| Observed behavior | Evidence | Synchronization approach |
|---|---|---|
| **Categories apply immediately** | `EV-P2-023`, `EV-P2-029` | Assert the resulting set directly. No special handling |
| **Search applies live, per keystroke** | `EV-P2-002` | Type character-by-character (a `FilterBar` mechanic), then assert the result set |
| **Zone/Type/Sort display transiently stale while the filter request is in flight** | `EV-P2-005`, reproduced 3× | **Do not compensate** with a second interaction. Where a scenario needs the settled state, synchronize on the request that change already triggered, or web-first assert the specific expected value. See §15.4 |
| **Basket header/stats stale after reload** | `EV-P2-014` | Assert basket truth on the Basket tab, or after the app's own refresh — never from header stats alone |
| **Order status badge stale until the automatic re-read completes** | `EV-P2-017`, refined by `D-40` | Wait for the status `PUT` (and check it succeeded), then for the application's own `GET /api/orders`, then web-first assert the redrawn row — never click Refresh to obtain it (`LIF-002`). Persistence is proven separately after a forced re-read (`LIF-001`) |
| **View Details fires no network request** | `EV-P2-066` | **Never** wait for a response here — it will never arrive. Wait on modal visibility and content |
| **Basket quantity render latency** | `EV-P2-008` | Web-first assertion on the quantity value. Ordinary latency, distinct from the confirmed Zone/Type/Sort transient stale-display behavior described in §15.4. |
| **The grid renders twice on load** | The page's start-up loads products, basket and orders together, and the basket load repaints the grid from the unfiltered product list, so a filter applied between the two renders is lost (CONFIRMED FROM SOURCE INSPECTION; root-caused after a real failure) | `waitForCatalogLoaded()` waits for the first card, then for the page's `networkidle` load state, before any filter is applied. This is the §15.2 page load-state wait and the only place the suite uses it; it settles start-up only (see §15.2 for what it does not establish) |
| **One category-chip click sends two catalog requests** | The chip's label and its hidden checkbox both reach the same handler (CONFIRMED FROM SOURCE INSPECTION) | `applyAndAwaitCatalog()` waits until every catalog request the action started has finished, not for the first response |
| **Search sends no request** | Search narrows the loaded result on the page on each keystroke, and a later catalog reload redraws the grid without re-applying the term (CONFIRMED FROM SOURCE INSPECTION; the absence of a request is also CONFIRMED FROM EXECUTION in a `FIL-021` trace) | Synchronize on the summary showing the term; never wait for a request |
| **A successful save or delete reloads the unfiltered catalog** | Save and delete end by reloading the full product list rather than re-applying the filters (CONFIRMED FROM SOURCE INSPECTION) | Wait for that reload (`saveAndAwaitCatalog()`, `deleteProduct()`); expect any active filter to be dropped |
| **Every tab switch reloads that tab's data** | Products issues a catalog request, Orders `GET /api/orders`, Basket `GET /api/basket` (`D-38`), including after "View Orders" and "Continue Shopping" (confirmed live and in the page source) | Wait for the request the switch triggers |
| **An order delete ends with the application's own orders re-read** | After a successful delete the page re-reads the orders itself, so the row leaves the list with no Refresh (CONFIRMED FROM SOURCE INSPECTION; the status-change re-read is `D-40`) | Wait for that `GET /api/orders`; never click Refresh to obtain it |
| **Expanding an order row is client-side** | It toggles the details' visibility and the ▼/▲ chevron; no request is sent (CONFIRMED FROM SOURCE INSPECTION) | Wait on the row's visible state |
| **Render tick after a response** | The grid and the order-confirmation modal can finish rendering a moment after their response resolves (observed during implementation; NOT VERIFIED as a measured behavior) | Explicit observable-state waits (`waitForProductPresent()` / `waitForProductAbsent()`, the modal becoming visible) |

### 15.4 The Zone/Type/Sort transient stale display — the architectural position

Changes made through the Zone, Type, or Sort dropdowns are applied correctly in state, but the **visible result count, active-filter chip, and product order remain transiently stale** while the request that change triggered is in flight — they keep presenting their previous, now-incorrect values instead of a pending state, then settle to the correct state once the request completes (`EV-P2-005`). Search and Category chips are confirmed **unaffected** (`EV-P2-023`, `EV-P2-029`).

> **Corrected after the Search & Filtering implementation pass.** This section previously stated that the display remained one interaction behind *until another interaction with one of those three controls occurred*. That causal claim is **CONTRADICTED FROM EXECUTION**: `applyFilters()` awaits `GET /api/products/filter` (~600–750 ms round trip), and live measurement on all three controls showed the display settling correctly and permanently **with no second interaction**. The stale window measured ~400–700 ms. A second interaction is sufficient but **not** necessary. `EV-P2-005`'s observation is unchanged and still reproduces; only the mechanism attributed to it is corrected. See `FIL-017`.

The framework **must not** silently compensate — no second click to "make it apply", no retry-until-green wrapper, no forgiving assertion that would pass whether or not the filter actually applied. Each of those would convert a confirmed, reproducible anomaly into permanently invisible behavior, which is the opposite of what a test suite is for. Waiting for the request a change triggered to complete is **ordinary asynchronous synchronization** (§15.2), not compensation — it is how a test reaches the settled state that Test Design asks it to assert.

The boundary is the **mechanism**, not the outcome:

- **Allowed** — synchronizing on the request the user's own action already triggered, or a web-first assertion of the **specific expected settled value**. Both fail if the filter never applies or applies wrongly.
- **Forbidden** — a fixed sleep (`waitForTimeout`, §15.1); an extra interaction the scenario does not itself call for; and any open-ended "poll until something changes" or "wait until everything matches" that would pass regardless of what the filter actually did.

What the framework **does** provide:
- `FilterBar` reports the displayed state **faithfully**, including when it is stale.
- The behavior is documented in this section and in `FIL-017`, with its evidence ID.
- Two adjacent facts are available to Test Design: a category selected right after a Zone/Type/Sort change is combined with it (`EV-P2-030`, `FIL-018`), and "Clear Filters" resets all five dimensions in one action (`EV-P2-028`). *Reconciled 2026-09-28:* this bullet previously added that Clear Filters "**reliably bypasses** the delay entirely, correctly discarding even a not-yet-displayed pending change". `EV-P2-028` never observed a request in flight, and a full-suite run showed a Zone change whose request was still in flight surfacing after Clear Filters (`FIL-021`, Notes). Clear Filters is dependable as a reset once the preceding filter requests have completed, and the synchronization rules above apply to it as to any other action. No rule in this section changes.

Whether a given test asserts correct behavior (and fails), or documents the defect, is Test Design's call (§14.8).

### 15.5 Scope discipline on the delay

The delay is confirmed for Zone, Type, and Sort **only**. It must not be generalized. Whether it also affects the Products/Basket/Orders tab-switch buttons is **`U-206` — open**. The framework must neither assume tab switching is affected nor assume it is clean; tab switches synchronize on observable panel state, which is correct either way.

### 15.6 Related-but-distinct staleness

The basket post-reload staleness (`EV-P2-014`), the order-status badge's transient staleness (`EV-P2-017`, refined by `D-40`), and the filter delay (`EV-P2-005`) are **similar in signature but not proven to share a root cause** — `U-206` records exactly this open question. The architecture treats them as three separate behaviors with three separate handling rules, rather than inventing a single unified "staleness handler" that would imply a shared mechanism nobody has established.

### 15.7 Timeouts

Default Playwright timeouts are the starting point. Where the observed render latency justifies it, the **expect timeout** may be raised modestly rather than inserting waits. Concrete values are deferred to implementation with real timing data (§29) — picking numbers now would be inventing evidence.

---

## 16. Error Handling Strategy

### 16.1 Governing principle

**The framework exposes failures; it does not absorb them.** Every mechanism below is designed to make a real problem louder and better-diagnosed, never quieter.

### 16.2 Validation failures

Add/Edit Product validation is **browser-native**, surfaced through validation bubbles rather than DOM text (`EV-P2-037`–`EV-P2-040`). `ProductFormModal` owns reading validity state and the native message. A test asserting a validation outcome asserts that submission was blocked and the field is invalid — see §13.7 on why exact-message assertions are a coupling choice, not a default.

### 16.3 HTTP/API failures surfaced through the UI

The application can fail server-side while showing the user nothing. The confirmed case: `PUT /api/basket` returned `404 {"error":"Basket item not found"}` and the UI rendered an empty basket with **no error whatsoever** (`EV-P2-009`).

Response: the `evidenceCollector` fixture passively records failed responses (4xx/5xx) and console errors for every test, attaching them **on failure**. This turns "the assertion failed and nobody knows why" into "the assertion failed and a `404` on `PUT /api/basket` is attached" — precisely how Discovery actually diagnosed this bug.

Recording is passive observation. It never alters test outcome on its own, because a 4xx may be the expected subject of a negative test.

### 16.4 Unexpected dialogs — and the native-dialog trap

Playwright **auto-dismisses** native dialogs that have no registered handler. In this application that produces a specific, silent failure mode: clicking Delete Product or Clear Basket without registering a handler causes the dialog to be dismissed, **the action to not happen**, and the code to continue as though it had.

Rules:
1. Any operation that triggers a native `confirm()` — Delete Product (`EV-P2-048`), Clear Basket (`EV-P2-012`) — registers its handler **inside the owning object's operation**, with accept/dismiss as an explicit parameter.
2. **No global always-accept handler.** It would mask exactly the unexpected dialogs worth knowing about.
3. A global listener records **unexpected** dialogs and fails loudly, naming the dialog's message.
4. Delete Order is a **DOM modal**, not a native dialog (`EV-P2-018`) — different mechanism entirely, and conflating the two is a predictable bug (§7.11, §12.2).

*As implemented (`src/support/dialogs.ts`):* Playwright calls every registered `dialog` listener, so the global guard of rule 3 stands down while an operation-scoped handler is active, tracked with a counter (safe because each worker runs one test at a time). A second dialog during the same scoped operation is dismissed and then reported as a failure.

### 16.5 Silent UI failures

Covered in §14.4: never treat absence of an error as success. Architecturally, the countermeasure is that every action-oriented test asserts a **positive post-condition**.

### 16.6 Navigation and access-control errors

Protected routes return `401` then client-side redirect to `/` (`EV-P0-010/011`, `EV-P1-007`, `EV-P1-018`). This is **expected behavior** for unauthenticated tests and a **failure** for authenticated ones. The framework distinguishes them by intent: the `unauthenticatedPage` fixture expects gating; `authenticatedPage` treats an unexpected redirect as a session-establishment failure and reports it as a setup problem, not a mysterious assertion failure.

### 16.7 Setup failures vs. test failures

These must be visibly distinct. A fixture that cannot establish its precondition (auth not restored, basket not clearable, temporary product not creatable) fails with a message that clearly identifies it as **setup**, naming the fixture and the precondition. Otherwise a broken login surfaces as dozens of confusing assertion failures across unrelated features.

### 16.8 Stale UI

Handled as synchronization (§15), not as error recovery. The distinction matters: treating staleness as an error to retry past would hide it. Staleness is asserted against deliberately, or routed around via a genuine re-read.

### 16.9 Harness / tooling restrictions

`BLOCKER-P2-001` and `BLOCKER-P2-002` were **Claude Code harness permission-classifier restrictions encountered during Discovery**, not application authorization rules (`EV-P2-047`, `EV-P2-048` prove the contrast on self-created data).

They therefore have **no runtime effect** on a `npx playwright test` execution and must not be modeled as application behavior, error states, or expected failures. Their only architectural relevance is the one stated in §10.5: the guardrail that discouraged seed mutation during Discovery **will not be present at runtime**, so the discipline must be structural.

### 16.10 No blanket retries

Explicitly rejected: retrying failed tests to achieve green. See §20.7.

---

## 17. Cross-Feature Workflow Architecture

### 17.1 The two confirmed composed journeys

```
Journey 1 — Purchase lifecycle
Catalog → Product → Basket → Checkout → Order → Orders (→ Order Lifecycle)

Journey 3 — Product management lifecycle
Add Product → View Details → Edit → Delete
```

(Feature Map "Cross-Feature Business Journeys"; Journey 2 — basket persistence across authentication — is covered in §17.5.)

### 17.2 The options considered

| Option | Assessment |
|---|---|
| **A. Inline in tests** | Honest and explicit, but duplicates a 6-step sequence across every test needing an order, and puts sequencing knowledge in specs. **Adopted for `JRN-001` (approved decision D-1)** — see the note below |
| **B. Composed from feature-level objects, in a thin `workflows/` layer** | Originally selected; **superseded by D-1 at implementation** — no `workflows/` layer exists |
| **C. A "journey object" per journey** | Rejected — a fourth object tier for two journeys; drifts toward god objects |
| **D. API shortcuts for setup** | **Rejected outright** — violates UI-only scope, requires storing the API key, and would mean never proving the real paths work (§12.1) |

> **Implementation decision D-1 (approved at the JRN-001 readiness gate).** `JRN-001` is implemented with inline steps in `tests/journeys/journeys.purchase-lifecycle.spec.ts`. The journey's value is the assertions *between* steps (basket before checkout, confirmation, the order in Orders, the emptied basket, the decremented stock), and §17.3 forbids assertions in workflows — so a workflow would either hide those states or merely wrap single panel calls. Option A's cost (repeating the order sequence across many tests) is absorbed by the `createdOrder` fixture. `JRN-002` and `JRN-003` share their tests with `BSK-010` and `PM-017`. §17.3 is kept as the rule any future `workflows/` layer would follow.

### 17.3 What `workflows/` may and may not do

**May:** sequence operations across Panels/Components; return meaningful results (an order number, a created product's identity); encapsulate the *order of steps*, which is genuine cross-feature knowledge.

**May not:** contain selectors (they belong to objects); contain assertions (they belong to tests); hold state between calls; or become a general-purpose helper grab-bag. A workflow that grows conditional branches for many callers has become a `doEverything` helper (§25) and must be split.

### 17.4 Workflow vs. fixture — the dividing line

- A **fixture** provides a *precondition* and owns *cleanup* (`temporaryProduct`, `createdOrder`, `emptyBasket`).
- A **workflow** performs a *business action* the test is actually about.

The same sequence can be either, depending on intent: placing an order is a **workflow** when the test is about checkout, and a **fixture** when the test is about order management and merely needs an order to exist. This distinction keeps the subject of a test in the test.

### 17.5 Journey 2 — basket persistence across authentication

```
Add to basket → Logout → Login → verify basket intact   (EV-P2-013)
```

Architecturally special: it deliberately crosses the session boundary, so it must use `disposableSessionPage` and run in the serialized session project (§8.4, §19.4). It is the one journey that intentionally invalidates and re-establishes a session, which is precisely why it cannot share the suite's storage state.

### 17.6 Where journeys live

`tests/journeys/` — separate from single-feature spec directories, because they assert cross-feature *integration*, carry heavier setup and cleanup, and belong to the serialized project. Keeping them separate also prevents a journey failure from being misread as a single-feature regression.

---

## 18. Known Application Quirks and Architectural Implications

Every row is stated at exactly the confidence its evidence supports. **No confirmed defect below is treated as correct application behavior**, and none may be normalized without explicit Test Design approval (§14.8).

### 18.1 Confirmed defects / anomalies

| # | Behavior | Confirmed status | Architectural implication | Automation treatment | Evidence / Unknown |
|---|---|---|---|---|---|
| 1 | **Zone/Type/Sort display transiently stale while the filter request is in flight** | Stale window confirmed, reproduced 3×. **Mechanism established** during the Search & Filtering implementation pass: the display is updated only after the in-flight `GET /api/products/filter` completes (~600–750 ms observed), and during that interval it remains at the previously settled state; it then settles on its own, with **no second interaction required**. The earlier "one interaction late" mechanism is CONTRADICTED FROM EXECUTION (§15.4) | `FilterBar` must report displayed state faithfully; no compensation logic | **Detect, never accommodate.** Test Design chooses assert-correct / `fixme` / document-defect (see `FIL-017`) | `EV-P2-005`; `U-206`, `U-208` |
| 2 | **Basket header/stats stale after reload** (show 0 while server data is correct) | Confirmed, one occurrence | Basket truth is read from the Basket tab, never from header stats | Detect. Persistence assertions force a genuine re-read | `EV-P2-014` |
| 3 | **Basket `404` on decrement, empty basket displayed, no visible error** | The occurrence is confirmed; **later evidence proved the underlying item survived** — the "wipe" was display-only, not data loss. Trigger unconfirmed | Justifies failure-evidence collection (`attachFailureEvidence`, §9.2); justifies never trusting "no error shown" | Detect and record. Not deliberately reproduced — trigger is unisolated | `EV-P2-009`, clarified by `EV-P2-034`/`EV-P2-057`; `U-201`, `U-209` |
| 4 | **View Details "Stock Status" shows "✅ In Stock" on cards displaying low stock** | Confirmed, reproduced on 2 independent products. Cause not established | `ProductDetailsModal` reports the modal's own text; card and modal are distinct sources | Detect. A candidate defect-oriented scenario for Test Design | `EV-P2-006`, `EV-P2-064` |
| 5 | **Order status badge transiently stale after a status change** | Refined 2026-09-26: stale only until the application's automatic orders re-read completes, then correct with no Refresh (CONFIRMED FROM EXECUTION). The original "until manual Refresh" reading is contradicted | Status-change actions wait for the `PUT` and the automatic re-read; persistence is asserted after a forced re-read | The transient window is confirmed but not asserted (`LIF-002` Notes) | `EV-P2-017`, `D-40` |
| 6 | **Filter chip text and result count transiently disagreed** | Confirmed, **one instance only**; mechanism unresolved | Do not build logic around it; too narrow a data point | Leave as a known observation. Not a design driver | `EV-P2-033`; `U-208` |
| 7 | **"100% Florida Orange Juice" absent from the catalog** | **Absence confirmed** by exact Product ID against the raw API response. **Cause NOT VERIFIED** — temporal correlation with a prior "Remove" action only | **Drives the no-hardcoded-product-identity rule** (§11.2) | Design around it. Never assert on this product; never attempt restoration | `EV-P2-035`, `EV-P2-050`–`EV-P2-058`; `U-211`, `U-215` |
| 8 | **Deleting an order does not restore consumed stock** | Confirmed | Stock is a non-renewable shared resource; drives the temporary-product checkout rule | Contain (order disposable products); report residuals | `EV-P2-020` |

### 18.2 Confirmed application behaviors (not defects) with architectural weight

| # | Behavior | Status | Architectural implication | Evidence / Unknown |
|---|---|---|---|---|
| 9 | **Created products silently default Zone="Standard", Type="Each"**; Add Product has no field for either, and "Standard" is not a real Zone filter option | **Confirmed data behavior**, not an anomaly with unknown cause | A created product may be unreachable via specific Zone filters. Tests must not assume otherwise | `EV-P2-043`; `U-203`, `U-212` |
| 10 | **"Delivered" locks the order Status select (`disabled`)** | Confirmed on a real order | Legitimate business rule; `OrderRow` exposes it as observed state | `EV-P2-016` |
| 11 | **Whether "Cancelled" is also terminal** | **NOT VERIFIED** | The framework must **not** model Cancelled as locked | `U-202` |
| 12 | **Native HTML5 validation** on Add/Edit Product (`min="0"`, required, ordered field-by-field) | Confirmed | Validation messages are not DOM text (§13.7); `0` is a valid boundary | `EV-P2-037`–`EV-P2-040` |
| 13 | **"Clear Filters" clears all five dimensions in one action** | Confirmed, tested 3× (`EV-P2-028`). *Reconciled 2026-09-28:* previously also "reliably bypasses the delay bug … including with a pending undisplayed change"; an in-flight change was never observed in Discovery, and one full-suite run showed one surfacing after Clear Filters (§15.4) | The dependable reset primitive once the preceding filter requests have completed; preferred over resetting dimensions individually | `EV-P2-028` |
| 14 | **Categories: multi-select, OR/union within the dimension, applied immediately** | Confirmed by exact arithmetic | Category filtering needs no special synchronization | `EV-P2-021`–`EV-P2-029` |
| 15 | **Cross-dimension: Category+Zone and Category+Search intersect; Category+Sort sorts within the subset** | Confirmed by exact arithmetic | Safe to model as intersection **for these confirmed pairs only** | `EV-P2-030`–`EV-P2-032` |
| 16 | **Category + Type** | **NOT VERIFIED** | Must **not** be assumed to intersect by analogy. An open question, not a modeled rule | `U-210` |
| 17 | **Search requires real per-character keystrokes** | Confirmed | `FilterBar` mechanic; a bulk value-set silently does nothing | `EV-P2-002` |
| 18 | **View Details fires zero network requests; omits Zone and Type; Escape does not close it** | Confirmed | Never wait for a response; never expect Zone/Type in the modal; never close via Escape | `EV-P2-061`, `EV-P2-063`, `EV-P2-066` |
| 19 | **Two confirmation patterns coexist** — native `confirm()` (Delete Product, Clear Basket) vs. custom modal (Delete Order) | Confirmed | Two distinct handling mechanisms; conflating them fails silently | `EV-P2-012`, `EV-P2-018`, `EV-P2-048` |
| 20 | **Login failures rendered no visible error in Pass 1** | Confirmed across every attempt in Pass 1; a historical observation, not a UI contract — the current portal source has a failure-message path whose rendering for the real account is NOT VERIFIED | Negative auth tests assert the *absence of an authenticated state*, never a visible error message | `EV-P1-004/005/012/013`; `U-102` |

### 18.3 Residual data state carried into automation

| Item | State | Architectural note |
|---|---|---|
| **Hass Avocado** | Stock 8, originally 9; not restored | Real seed data with a known-altered value. Never treat stock levels as fixed constants | `EV-P2-020` |
| **100% Florida Orange Juice** | Permanently absent; cause unverified | Never reference. Never attempt restoration | `EV-P2-053`, `EV-P2-056`; `U-211` |
| **`ZZZ Discovery Temp Item`** | Fully cleaned up, verified gone | The model for `temporaryProduct`'s lifecycle | `EV-P2-042`–`EV-P2-049` |

### 18.4 Open unknowns the architecture explicitly preserves

`U-210` (Category+Type) · `U-211` / `U-215` (missing product, cause) · `U-212` (Zone="Standard" reachability) · `U-213` (Price/Stock extremes) · `U-214` (multiple/duplicate Details pairs) · `U-216` (empty/duplicate-key Specifications) · `U-217` (cross-ownership card actions) · `U-218` (backdrop-click close).

None is resolved here. The framework is designed to remain **robust to each** — by not depending on the unknown behavior — rather than to assume an answer. Where a future phase needs one resolved, that is a discovery task, not an architectural assumption.

---

## 19. Parallelism Strategy

### 19.1 The constraint, restated

Parallelism is bounded not by machine capacity but by **one account and one shared server-side dataset** (§10). The question is never "how many workers can we run?" but "which tests can safely overlap given shared state?"

### 19.2 Risk classification

| Class | Tests | Shared-state risk | Strategy |
|---|---|---|---|
| **A — Read-only** | Catalog browsing, search & filtering, view details | Low. No mutation. Vulnerable only to *another* class mutating the catalog concurrently | Parallel-safe **within the class** |
| **B — Catalog-mutating** | Product management (add/edit/delete) | Medium. Uniquely named products avoid collisions with each other, but change catalog counts that Class A may observe | Parallel **within the class**; must not overlap Class A count assertions |
| **C — Stateful singleton** | Basket, checkout, orders, order lifecycle, journeys | **High.** One basket per account; one shared orders list; irreversible stock consumption | **Serialized** |
| **D — Session-destructive** | Logout, session invalidation, unauthenticated gating | **Highest.** Can invalidate the session other tests depend on | **Serialized and ordered last**, own contexts, own logins |

### 19.3 The Class A / Class B interaction

Class B changes the total product count. Class A must therefore **never assert absolute catalog counts** while Class B could be running — instead using relative deltas, set membership, or subset arithmetic (§14.7). This is the reason the assertion rule exists; it is a parallelism consequence, not a style preference.

If Test Design later requires exact-count assertions, the correct response is to place those specific tests in a serialized project — not to relax the isolation model.

### 19.4 Project-based isolation

Playwright **projects** are the isolation unit, with `dependencies` expressing order:

```
setup (auth, storage state)
   ├── read-only        (Class A — parallel)
   ├── catalog-mutating (Class B — parallel, unique names)
   ├── stateful         (Class C — serialized)
   └── session          (Class D — serialized, last)
```

Serialization is expressed at the project level rather than sprinkled as per-file `describe.serial`, so the isolation model is visible in one place and cannot be quietly weakened file by file.

### 19.5 Worker counts — deliberately not chosen

**No worker count is specified in this architecture**, because no evidence supports one. Discovery measured no timing, no resource characteristics, and no concurrency limits of the live environment. Picking a number now would be inventing a fact.

What *is* architecturally decided:
- The `stateful` and `session` projects are **effectively single-worker** — that follows from shared state, not from tuning.
- The parallel classes' worker count is an **empirical decision** made during implementation against real timing and real stability (§29).
- A safe initial posture is low concurrency, raised only with evidence.

*As implemented (§20.1):* every stateful project (Class C) runs with one worker, the Class D logout project runs its single file serially (`fullyParallel: false`), and Product Management runs with one worker because it asserts exact baselines. The read-only projects use Playwright's default worker count; the 2026-09-27 and 2026-09-28 full runs used 6.

### 19.6 Cross-run concurrency

Two simultaneous suite runs collide regardless of internal worker configuration, because they share the account (§10.10). CI must enforce a concurrency group so runs queue rather than overlap (§22.6). Locally, contributors should expect the same limitation.

---

## 20. Configuration & Environment Strategy

### 20.1 Current baseline

*Reconciled 2026-09-27.* This subsection originally described the pre-Discovery baseline (one `chromium` project, `trace: 'on-first-retry'`). The current `playwright.config.ts` implements this architecture:

- **Global:** `testDir: './tests'`, `fullyParallel: true`, `retries: 0`, reporters `list` + `html` (`open: 'never'`), `baseURL` from `getBaseUrl()` (§20.2), `trace: 'retain-on-failure'`, `screenshot: 'only-on-failure'`, `video: 'retain-on-failure'`.
- **13 projects**, all `Desktop Chrome` (Chromium only, §20.6), expressing the isolation classes of §19:

```
setup (tests/auth.setup.ts: one live login → playwright/.auth/user.json)
 ├─ auth · catalog · search-filtering · product-details        (read-only / own contexts; parallel)
 │     └─ product-management        deps: catalog, search-filtering, product-details · workers 1
 │           └─ basket              deps: product-management · workers 1 · 60 s
 │                 └─ basket-session   deps: auth, basket · workers 1 · 60 s
 │                       └─ checkout   deps: basket, basket-session · workers 1 · 60 s
 │                             └─ orders   deps: checkout · workers 1 · 60 s
 │                                   └─ order-lifecycle   deps: orders · workers 1 · 60 s
 │                                         └─ journeys    deps: order-lifecycle · workers 1 · 60 s
 └─ auth-session (logout)   deps: every content project above · fullyParallel: false
```

- **Timeouts:** the default 30 s, raised to 60 s for the six stateful projects from timings measured during implementation (§15.7): basket 16–25 s per test, mostly fixture overhead; basket-session the same, plus two live logins; checkout 20–21 s; orders 22–25 s for the order-creating tests (`ORD-004`–`ORD-007`) and about 3 s for the read-only ones; order-lifecycle 22–25 s; journeys about 23 s.
- **Dependency rules to keep:** `auth-session` lists every content project, so a new project must be added to its `dependencies`; `basket-session` depends on `auth` so that its two live logins never overlap another project's.
- **Storage state:** written by `setup`, read by `authenticatedPage` and by the independent sessions in `fixtures/basket.ts`. The differences below are **proposals**; the file is not modified by this task.

### 20.2 Base URL

`BASE_URL` as an environment variable, defaulting to the confirmed `https://www.qacloud.dev`. Page Objects navigate by path (`/`, `/market.html`, `/profile.html`) so the host is configurable in exactly one place.

### 20.3 Credentials and environment variables

| Variable | Purpose | Source |
|---|---|---|
| `BASE_URL` | Target host | Env, with a default |
| `MARKET_EMAIL` | Login identity of the single Market automation account — the suite logs in with it | `.env` locally, CI secret in CI |
| `MARKET_PASSWORD` | Login credential of that account | `.env` locally, CI secret in CI |

- `.env` is git-ignored (already correctly configured) and never committed.
- `.env.example` is committed with **empty values** (already exists in the correct form).
- A single validated accessor in `src/support/` reads them, **failing fast** with a message that names any missing variable and never echoes a value.
- **No credential ever appears in source, in this document, in a test title, in a log line, or in an error message.**
- **No API key is stored by this project**, in any form, anywhere — consistent with the standing project rule.

### 20.4 Local vs. CI

Same code, different inputs: locally `.env` + headed-when-debugging; in CI, injected secrets + headless + artifact retention. The config should not branch on environment beyond these input and artifact concerns — divergent behavior between local and CI is itself a defect source.

### 20.5 Artifact hygiene for `/profile.html`

Restated here because it is a configuration concern: that page displays a live, non-regenerable API key as normal content (`EV-P1-014`). Any trace, screenshot, or video captured there embeds a credential in an artifact CI may publish. Configuration must ensure such artifacts are either not produced for that surface or are scrubbed/masked before retention (§8.6, §21.5).

### 20.6 Browsers and projects

**Chromium only**, initially. Every single Discovery observation was made in Chromium; no behavior in Firefox or WebKit has been observed even once. Adding engines would mean asserting cross-browser behavior that no evidence supports — and this application's confirmed quirks (native validation messages, native dialogs, render timing) are exactly the kind that differ across engines. Cross-browser expansion is a deliberate, evidence-gathering decision for later (§29).

Playwright projects are used for the **isolation classes** in §19.4, not for browsers.

### 20.7 Timeouts and retries — philosophy

**Timeouts:** start from Playwright defaults; raise the *expect* timeout modestly if real measurements justify it. Never raise timeouts to paper over a missing synchronization signal. Values deferred (§29).

**Retries: propose `0`, in both local and CI.**

This is a deliberate departure from the common "retry once in CI" default, and the reason is specific to this application. It has **confirmed, intermittent-looking staleness defects** (`EV-P2-005`, `EV-P2-009`, `EV-P2-014`, `EV-P2-017`). A retry would convert precisely those defects into green runs — the suite would be most likely to hide exactly the bugs it was built to catch. A flaky result here is **information**, and it should be investigated, not retried away.

If operational reality later demands a retry, that is a documented decision with a stated justification — not a silent default (§29).

### 20.8 Headed / headless

Headless by default; headed and debug modes available locally via standard Playwright flags. No framework-specific mechanism is needed.

### 20.9 What configuration must never contain

Credentials or API keys; environment-specific hardcoded product names or IDs; sleep-based waits; anything that changes assertion behavior between local and CI.

---

## 21. Reporting / Debugging Strategy

### 21.1 Purpose

Reporting exists to answer one question fast: **why did this fail, and what state was the application in?** Given that this application fails silently in confirmed ways (§14.4), the report must carry evidence the UI itself never showed.

### 21.2 Reporters

| Context | Reporters | Rationale |
|---|---|---|
| Local | `list` + `html` | Immediate console feedback; HTML for investigation |
| CI | `html` + a machine-readable reporter (e.g. JUnit) + `github` where applicable | Human report as artifact; machine format for CI surfacing |

Concrete reporter configuration is deferred (§29) — this section fixes intent, not syntax. *As implemented:* the local `list` + `html` reporters. The CI reporters are not configured, because no CI exists yet (§22).

### 21.3 Failure artifacts

| Artifact | Policy | Why |
|---|---|---|
| **Trace** | `retain-on-failure` | With `retries: 0` (§20.7), `on-first-retry` would produce **no trace at all**. This change is a direct consequence of the retry decision |
| **Screenshot** | `only-on-failure` | Cheap, immediately orienting |
| **Video** | `retain-on-failure` | Genuinely valuable here — the confirmed display behaviors are *sequence*-dependent (the Zone/Type/Sort display while its request is in flight, the order badge's transient staleness, `D-40`), and a static screenshot cannot show a sequence |

### 21.4 Evidence attachments beyond Playwright defaults

The `evidenceCollector` fixture (§9.2, §16.3) attaches on failure:

1. **Console errors** captured during the test.
2. **Failed network responses** (4xx/5xx) with method, URL, and status.
3. **Residual-state notes** where cleanup could not complete (§12.5).

Justification is concrete: the basket `404` bug produced **no user-visible error at all** (`EV-P2-009`). Without network capture, a failure there presents as an inexplicable empty basket. With it, the cause is in the report.

### 21.5 Artifact hygiene — mandatory

Traces, screenshots, and videos of `/profile.html` would capture the account's **live, non-regenerable API key**, which is rendered as plaintext page content (`EV-P1-014`). CI artifact upload would then publish a credential.

Rules: avoid visiting `/profile.html` unless required; where required, suppress or scrub artifacts for that spec, or mask the key element before capture; never log or assert on the value. This is a hard constraint, not a recommendation (§8.6, §20.5).

*As implemented (reconciled 2026-09-27):* every spec that reaches `/profile.html` turns failure artifacts off with `test.use({ screenshot: 'off', video: 'off', trace: 'off' })` — `tests/auth.setup.ts`, `auth.login.spec.ts`, `auth.logout.spec.ts`, `auth.session-persistence.spec.ts`, `basket.session.spec.ts`. `auth.setup.ts` was added on 2026-09-27, when the audit found it uncovered. No masking is implemented. Any visual recording must avoid or mask that page as well.

### 21.6 Readable test names

Test titles state the **business behavior** under test, in language a non-automation reader understands. A title naming a selector, a method, or a technical mechanism is wrong (§23.6).

### 21.7 CI artifact retention

Artifacts are retained long enough to investigate a failure and no longer. Because of §21.5, retention is a **security-relevant** setting, not merely a storage one. Specific durations are deferred (§29).

---

## 22. CI Architecture

> **Design level only.** No workflow file is created by this task.
>
> **Status 2026-09-27:** still design only. The repository contains **no CI configuration**; the full suite has been run locally only. CI, including the concurrency control of §22.6, is a Release Gate item.

### 22.1 Pipeline shape

```
checkout → setup Node + cache deps → npm ci
   → install Chromium (with OS deps)
   → inject secrets as env vars
   → run suite (project order per §19.4)
   → upload artifacts (traces/screenshots/videos/report)
   → publish report + residual-state summary
```

### 22.2 Dependency installation

`npm ci` against the committed lockfile, for reproducibility. Node version pinned. Dependency and Playwright browser caches keyed to the lockfile.

### 22.3 Browsers

Chromium only, installed with OS dependencies (`--with-deps`), matching §20.6 and the engine every Discovery observation was made in.

### 22.4 Environment injection

`BASE_URL` plus the three credential variables, supplied as repository/environment secrets under the same names used locally (§20.3). No `.env` is ever committed or reconstructed. Secrets are masked in logs and never echoed — not in a debug step, not in a failure message.

### 22.5 Execution and ordering

Project dependencies enforce order: `setup` → read-only / catalog-mutating → stateful → session (§19.4). The session project runs **last** so a logout cannot invalidate a session other tests still need (§8.4).

### 22.6 Concurrency control — required, not optional

CI **must** enforce a concurrency group so that two runs of this suite never execute simultaneously.

This is not a performance preference. All state is server-side and account-scoped, and there is exactly one account (§10.10). Two overlapping runs would interfere through the shared basket, the shared orders list, and irreversible stock consumption. Without a lock, cross-run interference would surface as unreproducible flakiness that no amount of test-level isolation can fix.

The same reasoning argues against unattended scheduled runs: every run that places an order permanently consumes inventory (§10.7). Trigger policy — on-demand and/or PR-gated versus scheduled — is a deliberate decision deferred to the CI implementation phase, with this cost stated explicitly (§29).

### 22.7 Artifacts and reporting

Upload traces, screenshots, videos, and the HTML report on failure; publish a machine-readable summary; surface the residual-state report so leaked data is visible to whoever owns the run. Retention is bounded, and bounded for the security reason in §21.5.

### 22.8 Failure handling

- A failing run fails the pipeline. No auto-retry to green (§20.7).
- Setup failures are surfaced distinctly from test failures (§16.7) so a broken credential does not read as a mass functional regression.
- Residual state is reported even when the run passes.

### 22.9 Secret management summary

Secrets live only in the CI secret store and the local git-ignored `.env`. They are never committed, never printed, never placed in artifact content, and never embedded in a report. The `/profile.html` artifact hazard (§21.5) is treated as part of secret management, not as a separate concern.

---

## 23. Naming Conventions

### 23.1 Features and directories

Feature directory names are kebab-case and match the approved Feature Map feature names: `auth`, `catalog`, `search-filtering`, `product-details`, `product-management`, `basket`, `checkout`, `orders`, `order-lifecycle`, plus `journeys`.

### 23.2 Page Objects, Panels, Components, Modals

`PascalCase` class names in files of the same name. Suffixes carry the tier and must be accurate:

| Suffix | Meaning | Examples |
|---|---|---|
| `…Page` | Owns a URL / full surface | `PortalPage`, `MarketPage`, `ProfilePage` |
| `…Panel` | Owns a tab region, no URL | `ProductsPanel`, `BasketPanel`, `OrdersPanel` |
| `…Modal` | In-page modal dialog | `ProductFormModal`, `ProductDetailsModal`, `ConfirmDeleteModal`, `OrderConfirmationModal` |
| *(no suffix)* | Component | `ProductCard`, `CategoryChips`, `FilterBar`, `AppHeader`, `StatsBar`, `OrderRow`, `BasketLine`, `QuantityStepper`, `OrderSummary` |

A `…Page` suffix on something without a URL is a naming error that misleads every future reader about the application's structure.

### 23.3 Methods

- **Actions** — imperative, business-oriented: `addToBasket()`, `openDetails()`, `placeOrder()`, `changeStatus(status)`, `clearFilters()`.
- **Queries** — `get…` / `read…` returning domain values: `getStats()`, `getVisibleProductNames()`.
- **Locator getters** — named for what they expose, for use in the test's `expect()`.
- **Banned:** `check…`, `verify…`, `assert…`, `shouldBe…` on objects — those names imply assertions, which objects do not perform (§6.9, §14.2).

### 23.4 Fixtures

camelCase, named for what they provide, not what they do: `authenticatedPage`, `unauthenticatedPage`, `disposableSessionPage`, `marketPage`, `temporaryProduct`, `emptyBasket`, `createdOrder`, `evidenceCollector`.

### 23.5 Test files

`<feature>.<aspect>.spec.ts` — e.g. `basket.add-item.spec.ts`, `product-management.validation.spec.ts`, `orders.delete-order.spec.ts`, `journeys.purchase-lifecycle.spec.ts`. Feature first so files group naturally; aspect second so intent is visible in a file list.

### 23.6 Test titles

A declarative sentence describing **business behavior and expected outcome**, readable by someone who has never seen the code.

- Good: *"placing an order creates an order visible in Orders with the expected total"*, *"selecting two categories shows the union of both category's products"*.
- Bad: *"test ProductCard click 👁️"*, *"POM basket flow 2"*.

Where a test documents a known defect, its title marks it `[Defect]` and its Test Design scenario carries the evidence ID (§23.9).

### 23.7 Test data

- Created products: `AUT-<runId>-<workerIndex>-<shortLabel>` (§11.3).
- Reference constants: `SCREAMING_SNAKE_CASE` (`CATEGORIES`, `ORDER_STATUSES`, `ZONES`, `PRODUCT_TYPES`).
- Domain types: `PascalCase` (`Product`, `Order`, `OrderStatus`, `MarketStats`, `BasketLine`).

### 23.8 Utilities

camelCase, narrowly named for one job: `buildUniqueProductName()`, `readRequiredEnv()`, `withNativeConfirm()`. A name containing `helper`, `util`, `manager`, or `do` is a smell — it usually signals an unbounded grab-bag (§25).

### 23.9 Evidence references

Discovery evidence IDs are cited **verbatim** (`EV-P2-005`, `U-210`, `BLOCKER-P2-001`) in the documentation — the Test Design scenarios, this document and the Feature Map — wherever a design choice or a known defect is involved. The code carries no comments (owner requirement, 2026-09-28): a test reaches its evidence through the scenario IDs in its title (§23.6). The one runtime annotation in use records the order a journey creates (`created-order`, `JRN-001`).

**Never invent an evidence ID.** If no evidence supports a statement, say so plainly instead of manufacturing a citation. Fabricated traceability is worse than none, because it survives review unchallenged.

---

## 24. Abstraction Boundaries

This section exists to prevent architecture drift. When a future contributor is unsure where something belongs, this table decides.

| Layer | Belongs here | Never here |
|---|---|---|
| **Tests** (`tests/`) | Test intent; arrangement via fixtures; action via objects (journeys inline, D-1); **all assertions**; expected business outcomes; known-defect titles (§23.6) | Selectors; waits; reusable logic; page structure; cleanup logic; state shared with other specs |
| **Workflows** (`src/workflows/`) — *not implemented (D-1)* | Sequencing across features; returning results (order number, created identity) | Assertions; selectors; retained state; conditional branching for many callers |
| **Pages** (`src/pages/`) | URL navigation for the three confirmed routes; full-surface composition; access to panels | Tab-region logic; component internals; assertions; test data |
| **Panels** (`src/panels/`) | Tab-scoped feature operations and queries; composing components | URL navigation; assertions; cross-tab orchestration; other features' concerns |
| **Components** (`src/components/`, `src/modals/`) | Repeated-structure interaction and queries; **app-specific UI mechanics** (per-character search typing, native-dialog registration, scoped emoji-button lookup) | Assertions; business rules; feature orchestration; knowledge of unrelated components |
| **Fixtures** (`src/fixtures/`) | Preconditions; lifecycle; **cleanup ownership**; context/auth setup; evidence collection | Business assertions; selectors; page structure; silent state repair beyond declared scope |
| **Data** (`src/data/`) | Reference constants from the Feature Map; unique-name builders; typed shapes | Credentials; environment values; live application state; hardcoded product identity |
| **Support** (`src/support/`) | Env reading/validation; unique-name generation; native-dialog utilities; console/network evidence capture | Page structure; selectors; business logic; assertions |
| **Types** (`src/types/`) | Shared domain types | Runtime behavior |
| **Configuration** (`playwright.config.ts`, env) | Base URL; projects/isolation classes; timeouts; retries; reporters; artifact policy | Secrets; test data; business logic; local-vs-CI behavioral divergence |

### 24.1 The four drift tests

If any of these is true, the boundary has been crossed:

1. **A selector appears outside a Page/Panel/Component/Modal.** → Move it into the owning object.
2. **An `expect()` appears outside `tests/`.** → Move it into the test, or convert it to an explicit precondition guard.
3. **A test contains a wait, a sleep, or a retry.** → It is compensating for missing synchronization; fix the object (§15).
4. **A test's outcome depends on another test having run.** → Convert the dependency into a fixture (§9, §25).

### 24.2 The direction-of-knowledge rule

Knowledge flows **downward only**:

```
tests  →  (workflows — not implemented, D-1)  →  pages/panels  →  components  →  support
```

A Component must never know which test uses it. A Page must never branch on a test's intent. A fixture must never inspect the test body. Upward knowledge is the mechanism by which frameworks become untestable and unmaintainable.

---

## 25. Anti-Patterns to Avoid

### 25.1 Universal anti-patterns

| Anti-pattern | Why it is banned here |
|---|---|
| **Giant Page Objects** | `MarketPage` is the live risk — one URL hosts eight features. Mitigated by the Page/Panel/Component split (§6.5) |
| **`doEverything` helpers** | A helper with many parameters and branches hides intent and couples unrelated features. Split it |
| **Arbitrary sleeps** | Would mask this application's confirmed staleness defects (§15.1) |
| **Blanket retries** | Would convert confirmed intermittent defects into green runs (§20.7) |
| **Brittle structural selectors** | No evidence supports DOM-structure stability (§13.8) |
| **Hard-coded credentials** | Never, anywhere — source, tests, config, docs, logs |
| **Test-order dependency** | Express dependencies as fixtures, never as ordering |
| **State leakage** | The single most damaging failure mode here — all state is shared and persistent (§10) |
| **Hidden assertions in helpers** | Failure messages then describe the helper's expectation, not the test's (§14.2) |
| **Accidental coupling** | A Component that knows about a feature it does not own |

### 25.2 Project-specific anti-patterns

These are specific to this application, and each would be an easy, well-intentioned mistake:

| Anti-pattern | Why it is specifically wrong here |
|---|---|
| **Clicking a filter dropdown twice to "make it apply"** | Compensates for the confirmed Zone/Type/Sort stale display and destroys the suite's ability to detect it (`EV-P2-005`, `FIL-017`) |
| **A global "always accept dialogs" handler** | Masks unexpected native dialogs and makes Delete/Clear operations untraceable (§16.4) |
| **Hardcoding a seed product by name** | "100% Florida Orange Juice" disappeared mid-project (`EV-P2-035`, `U-211`). This has already happened once |
| **Asserting absolute catalog counts in parallel contexts** | Class B tests change the count concurrently (§19.3) |
| **Placing orders against seed products** | Permanently burns shared inventory that nothing can restore (`EV-P2-020`, §10.7) |
| **Mutating a seed product because "the tool allowed it"** | The Discovery-time harness guardrail does **not** exist at runtime (§10.5). The application will permit it; the architecture forbids it |
| **Using `/api/*` for setup or cleanup** | Violates UI-only scope, requires storing the API key, and skips proving the real paths work (§12.1) |
| **Reading, logging, or asserting on the `/profile.html` API key** | Embeds a live, non-regenerable credential in artifacts (§21.5) |
| **Waiting for a network response on View Details** | It fires **zero** requests (`EV-P2-066`) — the wait would always time out |
| **Treating "no visible error" as success** | This application fails silently in confirmed ways (§14.4) |
| **Using Escape to close the details modal** | Confirmed not to close it (`EV-P2-061`) |
| **Assuming Category+Type intersects** | `U-210` — untested. Assuming it by analogy would encode an unknown as a fact |
| **Modeling "Cancelled" as a locked terminal status** | `U-202` — only "Delivered" is confirmed locked (`EV-P2-016`) |
| **Asserting category-chip selection via CSS class or color** | No accessible state exists; assert the filtered result instead (§13.4) |
| **Locating an emoji action button without card scope** | ~33 simultaneous matches (§13.3) |
| **Using `fill()` on the search box** | Confirmed not to trigger filtering at all (`EV-P2-002`) |
| **Presenting a known defect as expected behavior without approval** | Test Design's decision, never an implementer's (§14.8) |

---

## 26. Proposed Architecture Diagram

> *Reconciled 2026-09-27:* the diagram is the original proposal. As implemented, there is no `WORKFLOWS` layer (D-1), and evidence collection is a support function wired into the page fixtures rather than its own fixture (§9.2). Everything else matches.

```
┌──────────────────────────────────────────────────────────────────────────┐
│  TESTS  (tests/<feature>/*.spec.ts, tests/journeys/)                     │
│  Intent · Arrangement via fixtures · ALL ASSERTIONS · Evidence refs       │
└───────────────┬──────────────────────────────────────┬───────────────────┘
                │ uses                                  │ requests
                ▼                                       ▼
┌────────────────────────────────┐        ┌────────────────────────────────┐
│  WORKFLOWS (src/workflows/)    │        │  FIXTURES (src/fixtures/)      │
│  Cross-feature sequencing      │        │  authenticatedPage             │
│  Purchase lifecycle            │        │  unauthenticatedPage           │
│  Product mgmt lifecycle        │        │  disposableSessionPage         │
│  No assertions · No selectors  │        │  marketPage                    │
└───────────────┬────────────────┘        │  temporaryProduct  ─┐ cleanup  │
                │                          │  emptyBasket       ─┤ owners   │
                │ composes                 │  createdOrder      ─┘          │
                │                          │  evidenceCollector             │
                │                          └───────┬───────────────┬────────┘
                │                                  │ provides      │ uses
                ▼                                  ▼               ▼
┌──────────────────────────────────────────────────────┐  ┌──────────────────┐
│  PAGES (src/pages/)          — own a URL             │  │  DATA            │
│    PortalPage · MarketPage · ProfilePage             │  │  (src/data/)     │
│                     │ hosts                          │  │  Categories      │
│                     ▼                                │  │  Zones · Types   │
│  PANELS (src/panels/)        — own a tab, no URL     │  │  Order statuses  │
│    ProductsPanel · BasketPanel · OrdersPanel         │  │  Unique names    │
│                     │ composes                       │  └──────────────────┘
│                     ▼                                │
│  COMPONENTS (src/components/, src/modals/)           │  ┌──────────────────┐
│    AppHeader · StatsBar · FilterBar · CategoryChips  │  │  SUPPORT         │
│    ProductCard · QuantityStepper · BasketLine        │  │  (src/support/)  │
│    OrderSummary · OrderRow                           │  │  env validation  │
│    ProductFormModal · ProductDetailsModal            │  │  native dialogs  │
│    ConfirmDeleteModal · OrderConfirmationModal       │  │  evidence capture│
│    ── owns selectors + app-specific UI mechanics ──  │  └──────────────────┘
└──────────────────────────┬───────────────────────────┘
                           │ drives
                           ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  CONFIGURATION (playwright.config.ts + env)                              │
│  BASE_URL · isolation projects · timeouts · retries: 0 · artifact policy │
│           setup → read-only ─┬─ catalog-mutating → stateful → session    │
│                  (parallel)  │      (parallel)     (serial)   (serial)   │
└──────────────────────────┬───────────────────────────────────────────────┘
                           ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  PLAYWRIGHT RUNTIME   — browser contexts (1 per test) · Chromium         │
└──────────────────────────┬───────────────────────────────────────────────┘
                           ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  APPLICATION  https://www.qacloud.dev                                    │
│    /  (portal + login modal)                                             │
│    /market.html  →  [ Products | Basket | Orders ]   ← ONE page, 3 tabs   │
│    /profile.html  (logout · API key displayed — ARTIFACT HAZARD)         │
│                                                                          │
│  SHARED SERVER-SIDE STATE — one account, persistent:                     │
│    catalog (per-user-owned) · basket (singleton) · orders · stock (↓only)│
└──────────────────────────────────────────────────────────────────────────┘

         OBSERVABILITY (cross-cutting, attaches on failure)
         ┌────────────────────────────────────────────────┐
         │ HTML report · trace (retain-on-failure)        │
         │ screenshot · video · console errors            │
         │ failed network responses · residual-state report│
         └────────────────────────────────────────────────┘
```

---

## 27. Traceability to Approved Discovery

Every reference below is a real ID from the approved documents. **No evidence ID in this document is invented.**

| Architectural decision | Justified by | Feature Map section |
|---|---|---|
| Page / Panel / Component three-tier split | `EV-P0-010`, `EV-P2-001` — one URL, three tabs | Product Catalog; Shopping Basket; Orders Management |
| Storage-state auth with a setup project | `EV-P1-014`, `EV-P1-015`, `EV-P1-016` — login works, session survives navigation and reload | Authentication & Session |
| Logout tests isolated, serialized, ordered last | `EV-P1-017`, `EV-P1-018` — logout invalidates server-side | Authentication & Session |
| Unauthenticated fixture for gating tests | `EV-P0-010/011`, `EV-P1-007`, `EV-P1-018` — 401-then-redirect | Authentication & Session |
| `emptyBasket` fixture guarding both ends | `EV-P2-013` (survives logout/login), `EV-P2-014` (survives reload), `EV-P2-034` (a real stray item occurred) | Shopping Basket |
| Basket/checkout/orders serialized | `EV-P2-013` — account-scoped singleton basket | Shopping Basket; Checkout |
| `temporaryProduct` as the only mutable product path | `EV-P2-042`–`EV-P2-049` — full create/edit/delete lifecycle verified on self-created data | Product Management |
| Never mutate seed products | `EV-P2-054` (single-owner catalog); `BLOCKER-P2-001`, `BLOCKER-P2-002` (Discovery-time restriction, harness-scoped) | Product Catalog; Product Management |
| Checkout consumes only self-created stock | `EV-P2-020` — stock decrements and is never restored by order deletion | Checkout; Orders Management |
| No hardcoded product identity | `EV-P2-035`, `EV-P2-050`–`EV-P2-058` — a baseline product vanished; `U-211`, `U-215` | Product Catalog; Residual/Test Data State |
| Unique `AUT-` prefixed names | `EV-P2-031` (search matches hidden Details), `EV-P2-032` (sort operates on the same set), `EV-P2-042` (Discovery's own prefixed temp item) | Search & Filtering; Product Management |
| Category chips located by text, asserted by effect | `EV-P2-021` (generic elements, no ARIA state), `EV-P2-022` (visual-only state), `EV-P2-024`/`EV-P2-030`/`EV-P2-031` (arithmetic proofs) | Search & Filtering → Categories |
| Card action buttons must be card-scoped | `EV-P2-059` — emoji-only accessible names, identical on every card | Product Catalog → Product Card Structure |
| Per-character typing in the search box | `EV-P2-002` — bulk value-set does not trigger filtering | Search & Filtering |
| Native-validation reading in `ProductFormModal` | `EV-P2-037`–`EV-P2-040` — browser-native messages, not DOM text | Product Management |
| `ProductFormModal` serves Add **and** Edit | `EV-P2-036`, `EV-P2-047` — structurally identical, Edit pre-filled | Product Management |
| Native dialogs handled separately from DOM modals | `EV-P2-012`, `EV-P2-048` (native) vs. `EV-P2-018` (custom modal) | Shopping Basket; Product Management; Orders Management |
| `#itemDetailsModal` as a tier-3 anchor | `EV-P2-060` — confirmed stable id | Product Details / View Details |
| No network wait on View Details | `EV-P2-066` — zero requests fired | Product Details / View Details |
| No Escape-to-close for the details modal | `EV-P2-061` — confirmed it does not close | Product Details / View Details |
| No compensation for the filter delay | `EV-P2-005` — confirmed, reproduced 3× | Search & Filtering |
| "Clear Filters" as the reliable reset primitive | `EV-P2-028` — clears all five dimensions in one action (settled state; §15.4) | Search & Filtering → Categories |
| Persistence assertions force a genuine re-read | `EV-P2-014`, `EV-P2-017` (refined by `D-40`) — server correct while display stale | Shopping Basket; Order Lifecycle |
| Network/console evidence capture | `EV-P2-009` — a `404` with zero visible error | Shopping Basket |
| Positive post-conditions only in negative auth tests | `EV-P1-004/005/012/013` — failures render nothing; `U-102` | Authentication & Session |
| "Delivered" locks status; "Cancelled" does not | `EV-P2-016` (confirmed lock); `U-202` (Cancelled unverified) | Order Lifecycle |
| Zone="Standard" / Type="Each" carried as data behavior | `EV-P2-043`; `U-203`, `U-212` | Product Management |
| Category+Type left unmodeled | `U-210` — not arithmetic-verified | Search & Filtering |
| Chromium-only initially | Every Discovery observation was Chromium-only | Project / Discovery Context |
| `/profile.html` artifact hazard controls | `EV-P1-014` — API key rendered in plaintext | Authentication & Session (security note) |
| UI-only cleanup, no API shortcuts | `EV-P2-018`, `EV-P2-048/049`, `EV-P2-034` — every needed path confirmed reachable via UI | Cleanup sections across features |

---

## 28. Architecture Decisions / Rationale

| # | Decision | Rationale | Discovery evidence | Alternatives considered | Why not selected | Status |
|---|---|---|---|---|---|---|
| AD-01 | Three-tier objects: Page → Panel → Component | Eight of nine features live on one URL; a Page-per-feature model would be factually wrong | `EV-P0-010`, `EV-P2-001` | Page-per-feature; single `MarketPage`; Page-per-tab | Page-per-feature invents routes that do not exist; single page = god object; "Page" per tab misnames non-routes | **Proposed** |
| AD-02 | `src/` framework root, `tests/` for specs only | Unambiguous framework-vs-spec split; one alias root | — (structural) | Root-level `pages/`, `fixtures/`, … | Clutters root; blurs the framework/spec boundary | **Proposed** |
| AD-03 | Feature-first directory organization | Matches the approved Feature Map; gives clear ownership | Feature Map §3 | Layer-first; test-type-first | Layer-first scatters a feature across directories; test-type-first has no meaning here | **Proposed** |
| AD-04 | Storage-state auth via a setup project | Login is proven; mechanism is unverified, and storage state covers cookies *and* origin storage | `EV-P1-014`–`EV-P1-016` | Login per test; global-setup script; API-token injection | Per-test login multiplies unverified concurrent sessions; API injection needs a stored API key | **Proposed, pending the §8.2 verification step** |
| AD-05 | Logout tests isolated, serialized, last | Logout invalidates server-side; one account; multi-session safety unverified | `EV-P1-017`, `EV-P1-018` | Run logout tests inline with others | Could invalidate the session other running tests depend on | **Proposed** |
| AD-06 | Basket/checkout/orders serialized | The basket is an account-scoped persistent singleton | `EV-P2-013`, `EV-P2-014` | Full parallelism with per-test cleanup | Cleanup cannot prevent a mid-test collision on one shared basket | **Proposed** |
| AD-07 | `emptyBasket` guards entry **and** exit | Basket state survives sessions and runs; a stray item really occurred | `EV-P2-013`, `EV-P2-034` | Teardown-only cleanup | Cannot protect against leakage from an earlier run or a manual session | **Proposed** |
| AD-08 | Mutation only on self-created products | Catalog is single-owner shared data; seed mutation is irreversible | `EV-P2-054`, `BLOCKER-P2-001/002` | Mutate seed products and restore afterward | Restoration is not reliably possible; Discovery's own restore attempt failed and left residue | **Proposed** |
| AD-09 | Checkout consumes only self-created stock | Stock is consumed irreversibly; order deletion does not restore it | `EV-P2-020` | Order seed products; accept depletion | Repeated runs would drive seed stock to zero and break the suite | **Proposed** |
| AD-10 | No hardcoded product identity | A baseline product vanished mid-project, cause unknown | `EV-P2-035`, `EV-P2-050`–`EV-P2-058` | Fixture list of known products | Already demonstrated to break; would have broken this project's own suite | **Proposed** |
| AD-11 | UI-only cleanup; no API shortcuts | Preserves UI scope; avoids storing an API key; all paths confirmed reachable via UI | `EV-P2-018`, `EV-P2-048/049` | API cleanup for speed/reliability | Would never prove the UI delete paths work; requires a secret the project deliberately does not store | **Proposed** |
| AD-12 | Assertions only in tests | Hidden assertions produce misleading failures and govern unrelated tests | — (design) | Self-verifying Page Objects | Obscures intent; couples every consumer to one expectation | **Proposed** |
| AD-13 | Assert filter *effects*, not chip presentation | Chips expose no accessible state | `EV-P2-021`, `EV-P2-022` | Assert CSS class / computed color | Couples to styling and still does not prove the filter applied | **Proposed** |
| AD-14 | No compensation for the Zone/Type/Sort stale-display defect | Compensation would permanently hide a confirmed defect | `EV-P2-005` | Double-click; retry until consistent; forgiving waits | Defeats the suite's purpose; makes the bug undetectable forever | **Proposed** |
| AD-15 | `retries: 0` locally **and** in CI | Confirmed intermittent-looking defects would be retried into green | `EV-P2-005/009/014/017` | `retries: 1` in CI (common default) | Would hide precisely the defects this suite exists to catch | **Proposed — revisit with real data** |
| AD-16 | `trace: retain-on-failure` | With `retries: 0`, `on-first-retry` would capture nothing | Consequence of AD-15 | Keep the existing `on-first-retry` | Would produce zero traces under the chosen retry policy | **Proposed** |
| AD-17 | Chromium only, initially | Every Discovery observation was Chromium; quirks here are engine-sensitive | All Pass 0–2 evidence | Cross-browser matrix from day one | Would assert cross-engine behavior no evidence supports | **Proposed** |
| AD-18 | Worker count deliberately unspecified | No timing or concurrency evidence exists | — (absence of evidence) | Pick a number now | Would be inventing a fact; §19.5 | **Deferred by design** |
| AD-19 | CI concurrency lock required | One account; all state shared and persistent | `EV-P2-013`, `EV-P2-020` | Allow concurrent runs | Guarantees cross-run interference that no test-level isolation can fix | **Proposed** |
| AD-20 | `ProductFormModal` serves Add and Edit | Confirmed structurally identical | `EV-P2-036`, `EV-P2-047` | Separate Add/Edit modal objects | Duplicates every field and validation behavior | **Proposed** |
| AD-21 | Native dialogs in `support/`, not as components | Native `confirm()` has no DOM | `EV-P2-012`, `EV-P2-048` | Model them as modal components | Impossible — nothing to locate; would fail silently | **Proposed** |
| AD-22 | Thin `workflows/` layer for journeys | Avoids duplicating long sequences without adding a heavy tier | Feature Map journeys | Inline in tests; journey objects; API setup | Inline duplicates; journey objects drift to god objects; API setup violates scope | **Superseded by D-1** — `JRN-001` is inline (§17) |
| AD-23 | `/profile.html` artifact-hygiene controls | A live, non-regenerable API key is rendered in plaintext | `EV-P1-014` | Default artifact capture everywhere | Would publish a live credential in CI artifacts | **Proposed — mandatory** |
| AD-24 | Unknowns stay unmodeled | Encoding an unknown as a rule creates false confidence | `U-202`, `U-210`, `U-212`–`U-218` | Assume by analogy | Would convert open questions into silent assumptions | **Proposed** |

---

## 29. Explicitly Deferred Decisions

Deferred because they genuinely depend on Test Design or on evidence that only implementation can produce — **not** because they are unresolved architecture.

| Deferred item | Belongs to | Why it cannot be decided now |
|---|---|---|
| Exact test-case inventory and scenario list | Test Design | Architecture defines capability, not coverage |
| Which known defects are asserted-as-correct vs. `fixme` vs. documented | Test Design | An explicit product/QA decision (§14.8) |
| Exact selector strings | Implementation | Must be verified against the live DOM; strategy is fixed (§13) |
| Whether Sort/Zone/Type selects expose an accessible name or stable id — *resolved during implementation: stable ids, §13.5* | Implementation | Discovery evidence is silent; must be checked, not assumed (§13.5) |
| Whether card and basket quantity steppers share DOM structure | Implementation | Only that both exist is confirmed (§7.6) |
| Exact method and helper names | Implementation | Conventions are fixed (§23); specific names are not architectural |
| Exact fixture implementation | Implementation | Responsibilities, scopes, and cleanup are fixed (§9) |
| **Confirmation that storage state restores an authenticated session** | Implementation — **first task** | Session mechanism was never inspected; fallback is per-worker login (§8.2) |
| Concrete worker count | Implementation | Requires real timing/stability data (§19.5) |
| Concrete timeout values | Implementation | Requires measured latency (§15.7) |
| Whether `retries: 0` survives contact with reality | Implementation review | Starting position is evidence-based; revisiting requires data (§20.7) |
| Exact reporter configuration and artifact retention durations | Implementation / CI | Intent fixed (§21); values are operational |
| CI YAML, runner, triggers, scheduling policy | CI phase | Design fixed (§22); the scheduled-run cost is stated (§22.6) |
| Cross-browser expansion | Future, evidence-gathering | No non-Chromium evidence exists (§20.6) |
| Whether to add `data-testid` attributes | Application team | Out of scope — this project must not modify the application |

**Not deferred** (decided here, required before implementation): object tier model, directory structure, authentication strategy, isolation model, data strategy, cleanup ownership, locator hierarchy, assertion ownership, synchronization policy, error-handling policy, parallelism classification, secrets handling.

---

## 30. Implementation Readiness

> **Historical section.** §30 records readiness *at the time the Architecture was submitted for approval* and is preserved unchanged below. Its statements that no implementation exists, and its closing "not approved" status, were true then and are no longer true. Current status: §2, and `docs/project-history/PROJECT-HISTORY.md`.

### 30.1 Readiness checklist

| # | Item | Status | Where |
|---|---|---|---|
| 1 | Feature Map consumed | ✅ | §5 — all nine features mapped |
| 2 | Discovery evidence consumed | ✅ | §27 — `EV-P0`/`EV-P1`/`EV-P2` + `U-` + `BLOCKER-` references throughout |
| 3 | Feature boundaries mapped to architecture | ✅ | §5 |
| 4 | Page Object boundaries proposed | ✅ | §6 |
| 5 | Component boundaries proposed | ✅ | §7 |
| 6 | Fixture strategy proposed | ✅ | §9 |
| 7 | Authentication strategy proposed | ✅ | §8 |
| 8 | Test isolation strategy proposed | ✅ | §10 |
| 9 | Test-data strategy proposed | ✅ | §11 |
| 10 | Cleanup strategy proposed | ✅ | §12 |
| 11 | Locator strategy proposed | ✅ | §13 |
| 12 | Assertion strategy proposed | ✅ | §14 |
| 13 | Synchronization strategy proposed | ✅ | §15 |
| 14 | Error-handling strategy proposed | ✅ | §16 |
| 15 | Cross-feature workflow architecture proposed | ✅ | §17 |
| 16 | Known quirks documented with implications | ✅ | §18 |
| 17 | Parallelism strategy proposed | ✅ | §19 |
| 18 | Configuration/environment strategy proposed | ✅ | §20 |
| 19 | Reporting/debugging strategy proposed | ✅ | §21 |
| 20 | CI architecture proposed (design only) | ✅ | §22 |
| 21 | Naming conventions defined | ✅ | §23 |
| 22 | Abstraction boundaries defined | ✅ | §24 |
| 23 | Anti-patterns documented | ✅ | §25 |
| 24 | Secrets strategy proposed | ✅ | §8.6, §20.3, §21.5, §22.9 |
| 25 | Decisions recorded with rationale and alternatives | ✅ | §28 — AD-01…AD-24 |
| 26 | Deferred decisions explicitly listed | ✅ | §29 |
| 27 | Unknowns preserved, not resolved by assumption | ✅ | §18.4 — `U-202`, `U-210`–`U-218` |
| 28 | **No implementation started** | ✅ | No test, Page Object, Component, fixture, factory, selector, or CI file exists |

### 30.2 Integrity statements

- **No implementation exists.** This task created exactly one file: `docs/architecture/ARCHITECTURE.md`. No `src/`, no `tests/`, no `.github/`, no config change, no application change, no commit.
- **No evidence ID is invented.** Every `EV-`, `U-`, and `BLOCKER-` reference corresponds to a real entry in the approved documents.
- **No unknown is presented as resolved.** `U-202`, `U-210`, `U-211`, `U-212`, `U-213`, `U-214`, `U-215`, `U-216`, `U-217`, and `U-218` remain open and are designed around, not answered.
- **No confirmed defect is normalized.** Every known defect in §18.1 is marked for detection, with normalization reserved for an explicit Test Design decision.
- **Harness restrictions are not misrepresented.** `BLOCKER-P2-001`/`BLOCKER-P2-002` are consistently described as Claude Code harness permission-classifier restrictions encountered during Discovery — never as QACLOUD application authorization rules — and their non-existence at runtime is called out as an architectural risk (§10.5, §16.9).
- **Residual data state remains documented** (§18.3): Hass Avocado 9→8 unrestored; Orange Juice absent with unverified cause; the Discovery temp product fully cleaned.
- **No secrets are present.** This document contains no password, API key, token, cookie, session secret, or mailbox credential. Where credentials are discussed, only variable names and placeholders appear.

### 30.3 First implementation steps, once approved

In order: (1) verify storage-state authentication end to end (§8.2 — the one open technical risk); (2) establish the config projects and isolation classes (§19.4); (3) build `MarketPage` + `ProductsPanel` + `ProductCard` as the vertical slice that proves the locator strategy; (4) build the `temporaryProduct` and `emptyBasket` fixtures with verified cleanup; (5) only then begin whatever Test Design has approved.

---

## Architecture Status: APPROVED · IMPLEMENTED · RECONCILED (2026-09-27)

*FIL-021 reconciliation (2026-09-28):* §5.3, §15.4, §18.2 (row 13) and §27 were brought in line with the evidence on Clear Filters. No architectural decision or rule changed.

*Repository consistency review (2026-09-28):* all code comments were removed. The facts only they recorded are now in §7.6, §9.5, §13.2, §13.4, §13.5, §13.9, §15.3, §16.4, §19.5, §20.1 and §23.9, and the legacy label "one-step-late" was replaced by a description of the confirmed behavior. No architectural decision changed.

This document was approved by the project owner before Test Design began, and the framework was then implemented according to it, feature by feature. On 2026-09-27 the full suite (97 tests, 13 projects) passed, and the sections that had drifted from the implementation were reconciled: §1, §2, §4, §5.9, §7.9, §9.2–§9.5, §10.7, §12.3, §12.7, §14.6, §15.2–§15.6, §17, §18, §19.5, §20.1, §21.2, §21.5, §22, §24, §26–§28.

*Originally:* "READY FOR REVIEW / APPROVAL … **not approved** … none of the directories proposed in §4 may be created." Kept here as the record of the gate this document passed through.
