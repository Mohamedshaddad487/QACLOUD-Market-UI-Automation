# TEST DESIGN — QACLOUD Market UI Automation

---

## 1. Purpose

This is the canonical Test Design reference for the QACLOUD Market UI Automation project. It answers the question the Architecture document deliberately left open: **which scenarios, cases, and assertions will actually be automated, and why.**

It exists because neither Discovery, the Feature Map, nor the Architecture decides test coverage:

- Discovery established *what the application does*, with evidence.
- The Feature Map organized that evidence *by business feature*.
- The Architecture defined *how a framework would represent and execute* any workflow the application supports.
- None of the three selected a single scenario, assigned a priority, or decided what "done" means for a feature's coverage.

This document does that selection, deliberately and traceably. Every scenario in every feature file exists because it protects a specific, evidence-backed business behavior — not because a template asked for it. Where Discovery left a question open, this document says so explicitly rather than quietly testing an assumption.

This is a **design document**. It contains no Playwright code, no selectors, no Page Object references, and no fixture implementation. A scenario here describes *behavior to verify*, not *how to verify it in code* — that translation is Implementation's job, guided by the Architecture's strategies (locator hierarchy, assertion ownership, isolation model, synchronization rules).

---

## 2. Relationship to Other Documents

```
Discovery (Pass 0 / Pass 1 / Pass 2 + 3 addenda)   — APPROVED
        ↓  evidence, organized by observation
Feature Map                                          — APPROVED
        ↓  evidence, organized by business feature
Architecture                                         — APPROVED
        ↓  HOW the framework represents and executes features
Test Design  (this document)                         — APPROVED (reconciled 2026-09-26/27)
        ↓  WHICH scenarios/assertions get automated, and at what priority
Implementation                                        — COMPLETE for the approved scope (§11)
```

| Phase | Question it answers | Canonical file(s) |
|---|---|---|
| Discovery | What does the application do, with what evidence? | `docs/discovery/EVIDENCE-LOG.md`, `docs/discovery/DISCOVERY-STATE.md` |
| Feature Map | What business features exist and how do they relate? | `docs/discovery/FEATURE-MAP.md` |
| Architecture | How will the framework represent and execute workflows? | `docs/architecture/ARCHITECTURE.md` |
| **Test Design** | **Which scenarios will be automated, at what priority, with what data/cleanup?** | **This document + `docs/test-design/features/*.md` + `docs/test-design/journeys.md`** |
| Implementation | The actual framework and test code | `src/`, `tests/`, `playwright.config.ts` — status in §11 |

Each phase consumes the one before it and adds exactly one new kind of decision. Test Design does not re-derive application facts (that is Discovery's job, already done) and does not decide code structure (that is Architecture's job, already done). It decides **coverage**: which confirmed behaviors are worth automating, at what priority, with what data and cleanup obligations, and it explicitly declines to encode behaviors that are not yet confirmed.

---

## 3. Test Design Governance

| | |
|---|---|
| **Project** | QACLOUD-Market-UI-Automation |
| **Current phase** | Release readiness and publication preparation. This Test Design was approved and implemented; implementation is complete for the approved scope, and the explicit navigation boundary introduced on 2026-10-01 passed targeted validation and a 97/97 full run |
| **Approved inputs** | PASS 1 (Authentication & Session) — APPROVED · PASS 2 (Full UI Discovery, base + 3 addenda) — APPROVED · Feature Map — APPROVED · Architecture — APPROVED |
| **Discovery evidence boundary** | `EV-P0-001`–`EV-P0-012`, `EV-P1-001`–`EV-P1-018`, `EV-P2-001`–`EV-P2-069`. No discovery has occurred beyond `EV-P2-069`. |
| **Later evidence** | Reconciliation registers `D-01`–`D-39` (Shopping Basket, 2026-09-24) and `D-40`–`D-46` (Order Lifecycle, 2026-09-26) in `FEATURE-MAP.md` |
| **Current gate** | Final release readiness — documentation correction; next, release re-confirmation, then the owner's first commit and publication |
| **Implementation status** | **Implemented for the approved scope:** 103 of the 116 scenario IDs, in 96 tests (plus the `setup` project). Breakdown in §11 |

### Explicit approval requirement

> **Historical governance text.** The rules below were written before approval and are kept as the record of that discipline. The approval was given (its date was not recorded in the repository), and implementation then proceeded feature by feature through readiness, implementation and feature gates (`docs/project-history/PROJECT-HISTORY.md`).

**Test Design is not approved automatically by being generated.** This document and the files under `docs/test-design/` being complete and internally consistent does **not** constitute approval. A human reviewer must explicitly approve this Test Design before any implementation work begins.

**Implementation must not start from an unapproved Test Design.** If a future session is asked to "start writing the tests" or "start automation" without evidence that this Test Design was explicitly approved, it should stop and confirm the gate status rather than assume permission. This mirrors the same governance discipline the Architecture document applied to itself, and the Feature Map before it.

```
Test Design (approved) → [explicit human approval — given] → Implementation (complete for the approved scope)
```

---

## 4. Feature Inventory

Every approved Feature Map feature maps to exactly one design file. No feature is omitted; no feature is invented. The file boundaries match the Feature Map's nine features exactly, because no evidence suggested a different boundary would serve better.

| # | Feature (Feature Map) | Design file | Scenario ID prefix |
|---|---|---|---|
| 1 | Authentication & Session | `features/authentication.md` | `AUTH-` |
| 2 | Product Catalog | `features/catalog.md` | `CAT-` |
| 3 | Search & Filtering (incl. Categories) | `features/search-filtering.md` | `FIL-` |
| 4 | Product Details / View Details | `features/product-details.md` | `DET-` |
| 5 | Product Management | `features/product-management.md` | `PM-` |
| 6 | Shopping Basket | `features/basket.md` | `BSK-` |
| 7 | Checkout / Order Creation | `features/checkout.md` | `CHK-` |
| 8 | Orders Management | `features/orders.md` | `ORD-` |
| 9 | Order Lifecycle | `features/order-lifecycle.md` | `LIF-` |
| — | Cross-Feature Business Journeys | `journeys.md` | `JRN-` |

Registration and email verification are **explicitly out of scope** for this Test Design. The project's authenticated identity is a pre-existing, already-verified account supplied directly by the user (`EV-P1-014`); the registration/verification workflow itself was never a project objective beyond the structural Pass 1 discovery already recorded, and automating it would require an email-verification mechanism this project does not have. If registration coverage is wanted later, that is a scope change requiring its own approval, not an omission from this Test Design.

---

## 5. Scenario Conventions

### 5.1 IDs

`<PREFIX>-<NNN>`, zero-padded to three digits, sequential within each feature, starting at `001`. IDs are assigned once and **never reused or renumbered** — if a scenario is later removed, its ID is retired, not recycled, so historical references (implementation comments, defect reports) never point at the wrong thing.

### 5.2 Priority

A project-specific four-level model. Priority reflects **execution/planning order and business impact of failure** — it is not a statement about product quality, and a low priority does not mean a behavior is unimportant to the business, only that its failure is less urgent to detect first.

| Priority | Meaning | Assignment criteria |
|---|---|---|
| **P0** | Critical core business path | The application's primary purpose fails if this breaks: authentication, adding to basket, placing an order, an order becoming visible. A P0 failure blocks the core journey (Feature Map "Journey 1") for every user. |
| **P1** | Important functional / regression behavior | A confirmed feature or a confirmed defect that materially affects usability or data correctness, but does not block the core purchase path outright: filtering, validation, persistence, edit/delete, confirmed staleness defects with real user impact. |
| **P2** | Secondary / edge behavior | Confirmed but narrower-impact behavior: specific boundary values, secondary UI affordances, less-traveled combinations (e.g. a specific three-category filter combination beyond what already proves the rule). |
| **P3** | Low-value, exploratory, or deferred coverage | Structural-only confirmation, or scenarios classified Exploratory/Deferred Verification because the underlying behavior is `NOT VERIFIED`. Valuable to keep on record; not urgent to automate first. |

### 5.3 Scenario type

Applied per §"Scenario Types" below — a scenario carries only the types that genuinely apply; most carry one or two, some carry three.

### 5.4 Naming

`<SCENARIO-ID> — <Business-readable scenario name>`. The name states the business behavior under test in plain language (matching Architecture §23.6's test-title convention exactly, since scenario names are the direct ancestor of future test titles). A name must be understandable by a reader who has never seen the application's code.

### 5.5 Expected-result conventions

Every scenario's "Expected Outcome" states the **observable, business-meaningful result**, not an implementation detail. Where the application's confirmed behavior is a defect (e.g. the Zone/Type/Sort display delay), the Expected Outcome states the **currently-observed** behavior accurately, explicitly labeled as a known defect, rather than the behavior a reasonable user would want — per Architecture §14.8 and §3.4, defects are exposed, never silently normalized into "correct."

### 5.6 Precondition conventions

Preconditions state only **confirmed, evidence-backed prerequisites** (an authenticated session, a non-empty basket, an existing order, etc.). A precondition is never a guess about internal implementation state.

### 5.7 Data conventions

Every scenario's "Test Data" states, explicitly:
- Whether it uses **existing seed/read-only catalog data** (queried by attribute, never by hardcoded identity — per Architecture §11.2, since a previously-baseline product is confirmed permanently gone) or **temporary self-created data**.
- The **ownership** of any data it creates.
- Whether the scenario is read-only or state-changing.

### 5.8 Cleanup conventions

Every state-changing scenario states what it created, how it is removed (always a real UI path — never an API shortcut, per Architecture §12.1), and how removal is verified. A scenario that cannot state a cleanup path does not get to mutate shared data.

### 5.9 Traceability conventions

Every scenario cites the real Evidence Log ID(s) that establish the behavior, and the relevant Unknown ID(s) where the scenario intentionally treats something as unresolved. **No evidence or unknown ID in this Test Design is invented** — every citation was checked against `EVIDENCE-LOG.md`.

---

## 6. Coverage Model

Nine coverage dimensions, applied only where the underlying evidence actually supports them — a feature file does not force a dimension it has nothing genuine to say about.

| Dimension | What it verifies |
|---|---|
| **Happy path (Positive)** | The confirmed, intended behavior succeeds as designed |
| **Negative** | A confirmed rejection/failure path behaves as observed (including this application's confirmed *silent*-failure pattern) |
| **Boundary** | Confirmed edge values (e.g. `Price`/`Stock` at the `min="0"` boundary) |
| **Validation** | Confirmed native/application validation rules |
| **Business rules** | Confirmed domain logic (OR/AND filter semantics, stock consumption, terminal-state locking) |
| **Persistence** | State confirmed to survive navigation, reload, or logout/login |
| **Regression / Defect detection** | A confirmed anomaly is watched, not fixed or hidden |
| **Cross-feature journey** | Confirmed integration across feature boundaries (`journeys.md`) |
| **Exploratory / Deferred verification** | A `NOT VERIFIED` behavior worth a lightweight, honestly-labeled placeholder |

---

## 7. Traceability Model

```
Scenario (<ID>)
   → Feature (this Test Design's feature file)
        → Feature Map section (business description)
             → Discovery Evidence ID(s)  (EV-P#-###, and U-### / BLOCKER-P#-### where relevant)
                  → Architecture section(s)  (execution strategy the scenario assumes)
                       → Future Implementation  (a test file — NOT a 1:1 mapping, see §9)
```

Every scenario in this Test Design carries a **Traceability** field naming the Feature Map section, the Evidence ID(s), any relevant Unknown ID, and — where it meaningfully constrains implementation — the Architecture section that governs how it should eventually be executed (e.g. "Architecture §10.5 — self-owned data only" on any product-mutating scenario). This chain is what lets a future session, or a human reviewer, verify that a scenario is not invented: it can be walked backward to the exact observation that justified it.

---

## 8. Overall Coverage Matrix

`✓` = at least one scenario exists for this dimension in this feature · `—` = dimension not applicable / no evidence supports one (not a gap, a deliberate absence) · `(D)` = represented only as a Deferred/Exploratory placeholder, not a confirmed scenario.

| Feature | Happy Path | Negative | Boundary | Validation | Business Rules | Persistence | Regression/Defect | Journey | Exploratory |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| Authentication & Session | ✓ | ✓ | — | — | — | ✓ | — | — | (D) |
| Product Catalog | ✓ | — | — | — | — | ✓ | — | — | — |
| Search & Filtering | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | — | (D) |
| Product Details / View Details | ✓ | — | — | — | ✓ | ✓ | ✓ | — | (D) |
| Product Management | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — | — | (D) |
| Shopping Basket | ✓ | ✓ | ✓ | — | ✓ | ✓ | (D) | — | (D) |
| Checkout / Order Creation | ✓ | — | — | — | ✓ | ✓ | — | — | (D) |
| Orders Management | ✓ | — | — | — | — | ✓ | — | — | — |
| Order Lifecycle | ✓ | — | — | — | ✓ | ✓ | — | — | (D) |
| Cross-Feature Journeys | ✓ | — | — | — | ✓ | ✓ | — | ✓ | — |

Exact scenario IDs backing every mark above are in each feature file; this matrix is a navigation aid, not a substitute for reading the underlying scenarios. It was cross-checked against the finished feature files during Stage E validation (§11 references the outcome), and re-reconciled during the Pre-Approval Revision Pass. After the Shopping Basket Pre-Implementation Verification (2026-09-24), the Basket's Regression/Defect cell is `(D)`: `BSK-019` and `BSK-020` now assert confirmed correct behavior, which leaves only the deferred `BSK-011`–`BSK-013` in that dimension. The Product Catalog marks include `CAT-004`–`CAT-006`, which are implemented inside Product Management tests (`PM-001` carries `CAT-004` and `CAT-006`, `PM-017` carries `CAT-005`; §9, §11.1). After the LIF-002 Evidence Reconciliation (2026-09-26), the Order Lifecycle Regression/Defect cell is `—` (previously `✓`): `LIF-002` now asserts the confirmed automatic badge update rather than the stale-until-Refresh defect, which was contradicted from execution, so no Order Lifecycle scenario remains in that dimension. Its Happy Path and Persistence marks are unchanged.

**Scenario count underlying this matrix:** 113 feature-level scenarios (`AUTH`×14, `CAT`×6, `FIL`×22, `DET`×11, `PM`×21, `BSK`×21, `CHK`×7, `ORD`×7, `LIF`×4) plus 3 cross-feature journeys (`JRN-001`–`JRN-003`) = **116 total design scenarios**. `PM` rose from 20 to 21 during the post-implementation `PM-009` reconciliation, which added `PM-021`. `BSK` rose from 13 to 21 during the Shopping Basket re-discovery reconciliation (2026-09-24), which added `BSK-014`–`BSK-021` and gave the Basket a Boundary dimension; no other feature's count changed. This total was verified by direct extraction of every scenario heading across every file — sequential per prefix, zero gaps, zero duplicates. **This number describes design coverage, not implementation test count** — see §9 immediately below for why those two counts are expected to diverge, and by how much.

---

## 9. Implementation Planning Guidance

- **Design scenario count is not necessarily equal to independent implementation test count.** Two pairs of scenario IDs in this Test Design are intentional, explicitly-documented overlaps rather than additive coverage:
  - `BSK-010` (Shopping Basket's own basket-survives-logout/login scenario) and `JRN-002` (the identical fact, framed as the named Feature Map cross-feature journey).
  - `PM-017` (Product Management's own create→view→edit→delete lifecycle scenario) and `JRN-003` (the identical path, framed as the named Feature Map cross-feature journey).
  
  Each pair may be satisfied by **one underlying Playwright test**, with both scenario IDs named in its title (e.g. `BSK-010 / JRN-002 — …`), rather than implemented as two separate tests. This is by design: each ID remains independently traceable to its own framing (a single-feature-owned fact vs. a named cross-feature journey) in this document, even when one test satisfies both at implementation time. Implementation must not silently drop either ID's traceability by picking only one to reference.
- **Owner-approved overlaps (2026-09-27, CAT reconciliation, Option (a)).** The Product Catalog's catalog-level consequences of creating and deleting a product are asserted in the Product Management tests that perform those actions, not in separate tests:
  - `PM-001` / `CAT-004` / `CAT-006` — the created product is listed at once, with no reload (`CAT-004`), and is still listed after a full `/market.html` reload (`CAT-006`).
  - `PM-017` / `JRN-003` / `CAT-005` — after the accepted delete, with no reload, the product is gone and the Products count and Inventory Value are back to their pre-creation values.

  Every ID is named in the test title, as for the pairs above.
- **Each feature-level design file is the source of truth for that feature's intended coverage.** Implementation sessions should read the specific file(s) relevant to what they are building, not necessarily this entire Test Design in one sitting.
- **One design file does NOT require one implementation spec file.** `search-filtering.md`, the richest file, may reasonably split into several spec files (e.g. by Search / Categories / Cross-filter / Zone-Type-Sort / Clear-Filters) if that improves spec readability — Architecture §4's `tests/search-filtering/` directory already anticipates this. Conversely, a thin file could combine into a neighboring spec. The Markdown boundary is a documentation convenience; the spec-file boundary is an implementation judgment call, governed by Architecture §4 and §23, not by this document.
- **Scenario IDs must remain traceable into implementation.** A test's title names the scenario ID(s) it implements (e.g. `FIL-014 — …`), so a reviewer can walk from a failing test back to this design and from there back to the original evidence. The code carries no comments (owner requirement, 2026-09-28), so evidence IDs are cited in this Test Design, not in the code.
- **Implementation must not invent additional business coverage without updating this Test Design first.** If, during implementation, a genuinely new, valuable scenario becomes obvious, the correct order is: propose the addition here (with a new, next-sequential ID and full traceability), get it reviewed, then implement it — not the reverse. This preserves the property that every automated scenario has a paper trail back to real evidence.
- Scenarios marked **Exploratory / Deferred Verification** are not implementation-ready. They exist to prevent the underlying `NOT VERIFIED` question from being silently forgotten. Promoting one to a real automated scenario requires new Discovery evidence resolving the unknown, not a decision made inside implementation.

---

## 10. Open / Deferred Coverage

The following remain `NOT VERIFIED` in Discovery and are **not** encoded anywhere in this Test Design as confirmed expected behavior. Each is represented, where valuable, only as an Exploratory/Deferred Verification scenario in its feature file — never as a Positive, Business Rule, or Persistence scenario that would assume an answer.

| Unknown | Description | Feature | Test Design treatment |
|---|---|---|---|
| `U-006` | Who can access "+ Add Product" (role restriction) | Product Catalog / Product Management | Not designed — untestable with one account; not fabricated |
| `U-102` | Whether a verified account shows a distinct credential-error UI | Authentication & Session | Deferred/Exploratory only |
| `U-103` | "Reset Password" flow beyond static structure | Authentication & Session | Not designed — submission intentionally never attempted in Discovery; out of scope here too |
| `U-201` | Exact trigger for the basket `404` decrement anomaly | Shopping Basket | Regression scenario (`BSK-012`, deferred) documents the *observed* occurrence only; trigger condition not asserted. One further attempt under the hypothesized condition did not reproduce it (re-discovery `D-27`, 2026-09-24) |
| `U-202` | Whether "Cancelled" order status is also terminal/locked | Order Lifecycle | Deferred/Exploratory only — **never modeled as locked** |
| `U-203` | Whether Zone/Type can be set via any UI path other than Add Product | Product Management | Not designed — no such path is confirmed to exist |
| `U-204` | Basket quantity vs. available-stock boundary validation | Shopping Basket / Checkout | **Partially designed** after re-discovery (2026-09-24): the UI stock cap (`BSK-014`, `D-14`) and stock falling below a basket quantity (`BSK-021`, `D-24`) are now confirmed from execution. Server-side over-stock handling and checkout with an over-stock quantity remain NOT VERIFIED and are not designed |
| `U-206` | Whether the filter-delay bug also affects tab-switch buttons | Search & Filtering | Not designed — scope stays limited to Zone/Type/Sort, as confirmed |
| `U-208` | Exact mechanism of the one-time chip/count mismatch | Search & Filtering | Deferred/Exploratory only — one occurrence is insufficient for a reproducible scenario. A second instance of the symptom was observed in automation on 2026-09-27 (`FIL-021` Notes); it is linked to `FIL-022` for traceability only and is not coverage (`search-filtering.md` → `FIL-022`) |
| `U-209` | Whether the original basket bug deletes items server-side | Shopping Basket | Substantially resolved by `EV-P2-057`; regression scenario reflects the resolved (display-staleness) understanding, cited precisely |
| `U-210` | Category + Type cross-filter semantics | Search & Filtering | Deferred/Exploratory only — **never assumed to be AND by analogy** |
| `U-211` / `U-215` | Cause of the missing "100% Florida Orange Juice" product | Product Catalog | Not designed as a reproducible scenario — cause unconfirmed; drives the no-hardcoded-identity rule instead (§5.7) |
| `U-212` | Whether Zone="Standard" is truly unreachable under every Zone filter | Product Management / Search & Filtering | Deferred/Exploratory only |
| `U-213` | Price/Stock behavior at extreme values or malformed input | Product Management | Deferred/Exploratory only |
| `U-214` | Multiple/duplicate Details key-value pairs | Product Management | Deferred/Exploratory only |
| `U-216` | Empty/duplicate-key Specifications rendering | Product Details / View Details | Deferred/Exploratory only |
| `U-217` | Cross-ownership card-action visibility | Product Catalog | Not designed — untestable with one account |
| `U-218` | True backdrop-click close behavior for View Details | Product Details / View Details | Deferred/Exploratory only |

No scenario in this Test Design treats any row above as confirmed. Where a feature file includes a Deferred/Exploratory scenario for one of these, its Expected Outcome explicitly states that the result is being *observed and recorded*, not *asserted as correct*.

---

## 11. Test Design Status

This Test Design was built exclusively from the approved Discovery evidence, the approved Feature Map, and the approved Architecture. No new application facts were invented; no unknown was resolved by assumption; no scenario was designed to mutate shared or seed data.

**TEST DESIGN STATUS: APPROVED · IMPLEMENTED FOR THE APPROVED SCOPE · RECONCILED 2026-09-27 · `FIL-018` / `FIL-021` REVISED AND RE-ALIGNED 2026-09-28**

*Originally:* "READY FOR REVIEW / APPROVAL" — kept as the record of the gate this document passed through.

### 11.1 Implementation status (reconciled 2026-09-27)

Every one of the 116 designed scenario IDs is in exactly one of three states. IDs were not changed.

| State | Meaning |
|---|---|
| **Implemented** | A test whose title carries the ID exists and has passed (see *Execution* below) |
| **Deferred (Exploratory / Deferred Verification)** | The scenario's own Type is Exploratory / Deferred; by §9 it is not implementation-ready until new Discovery evidence resolves its unknown |
| **Implementation-deferred** | Designed and implementation-ready, but deliberately outside the current implementation scope (reason recorded in the feature file) |

A fourth category has no scenario ID: behaviors §10 marks **Not designed** were **not selected** for coverage at all.

| Feature | Designed | Implemented | Deferred (Exploratory) | Implementation-deferred |
|---|---:|---:|---|---|
| Authentication & Session (`AUTH`) | 14 | 13 | `AUTH-013` | — |
| Product Catalog (`CAT`) | 6 | 6 | — | — |
| Search & Filtering (`FIL`) | 22 | 20 | `FIL-014`, `FIL-022` | — |
| Product Details (`DET`) | 11 | 9 | `DET-010`, `DET-011` | — |
| Product Management (`PM`) | 21 | 18 | `PM-018`, `PM-019`, `PM-020` | — |
| Shopping Basket (`BSK`) | 21 | 18 | `BSK-011`, `BSK-012`, `BSK-013` | — |
| Checkout (`CHK`) | 7 | 6 | `CHK-007` | — |
| Orders Management (`ORD`) | 7 | 7 | — | — |
| Order Lifecycle (`LIF`) | 4 | 3 | `LIF-004` | — |
| Cross-Feature Journeys (`JRN`) | 3 | 3 | — | — |
| **Total** | **116** | **103** | **13** | **0** |

**Implemented IDs vs. tests.** The 103 implemented IDs are carried by **96 tests**, as §9 permits: three tests carry two IDs each (`AUTH-001`/`AUTH-002`, `AUTH-007`/`AUTH-008`, `BSK-010`/`JRN-002`) and two tests carry three (`PM-001`/`CAT-004`/`CAT-006`, `PM-017`/`JRN-003`/`CAT-005`). With the `setup` project that makes **97 tests in 34 files across 13 Playwright projects**. No test exists without a designed scenario ID (`setup` is infrastructure), and no deferred scenario is implemented.

**Execution.** Full suite on 2026-09-27 at 10:56: 97 passed, 0 failed, 0 skipped, retries 0 (CONFIRMED FROM EXECUTION; `docs/project-history/PROJECT-HISTORY.md`). That run predates the `CAT-004`–`CAT-006` mapping, which renamed the `PM-001` and `PM-017` tests and added one reload assertion to `PM-001`; both then passed in focused `product-management` runs (35/35). After the mapping and the repository cleanup, two full-suite runs followed the same day (CONFIRMED FROM EXECUTION): at 16:31, 41 passed, 1 failed (`FIL-021`) and 55 did not run; at 16:48, with nothing changed, 97 passed, 0 failed, 0 skipped. The `FIL-021` failure came from a timing race and did not reproduce in the second run (`search-filtering.md` → `FIL-021`, Notes).

**`FIL-021` and `FIL-018` re-aligned (2026-09-28).** `FIL-021`'s design was revised (owner-approved Option A, then owner decision D0) and its test re-aligned: each filter change is settled before "Clear Filters" is clicked, Search is synchronized on the summary showing the term, and the reload Clear Filters triggers is awaited. `FIL-018`'s wording was revised with an explicit evidence boundary (owner decision D4); its test changed only in title. Targeted runs passed (`FIL-018` and `FIL-021` once and 5× repeated, the `search-filtering` project 21/21), and a full suite on 2026-09-28 at 12:20 (UTC+3): 97 passed, 0 failed, 0 skipped, `retries: 0`, exit 0, 13.6 min (CONFIRMED FROM EXECUTION). No scenario ID or count changes. After the repository consistency review removed every code comment, a full suite on 2026-09-28 at 13:35 again passed 97/97 (14.1 min, CONFIRMED FROM EXECUTION). Two later full suites also passed 97/97: 2026-09-28 at 14:06 (14.7 min) and 2026-09-29 at 16:11 (14.0 min) (CONFIRMED FROM EXECUTION; `docs/project-history/PROJECT-HISTORY.md` §5.4–§5.5). Later executions, including the two failed post-rename runs and the 2026-10-01 full run that passed 97/97, are recorded in `docs/project-history/PROJECT-HISTORY.md` §14 and §16.
