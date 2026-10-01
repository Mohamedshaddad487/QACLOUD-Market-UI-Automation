# PROJECT HISTORY — QACLOUD Market UI Automation

This file records how the project was built: the phases, the gates each feature passed, the approved decisions that shaped the implementation, and the execution evidence. It was created during the documentation reconciliation of 2026-09-27. Before then, this history existed only in working sessions and in code comments.

**Evidence labels** follow `docs/discovery/FEATURE-MAP.md` §0. Where a date or a decision's exact wording was not recorded in the repository, this file says so rather than reconstructing it.

---

## 1. Method

The project follows a gate-driven sequence. Each phase needed explicit approval from the project owner before the next began:

```
Project creation → Environment setup → Browser / Playwright setup → Full UI Discovery
→ Feature Map → Automation Architecture → Test Design
→ Feature-by-feature implementation (readiness gate → implementation → implementation gate → feature gate)
→ Cross-Feature Journeys → Full-suite execution → Documentation reconciliation
→ CAT-004–CAT-006 reconciliation → Repository cleanup → Full-suite runs → Portfolio demo and recording
→ Release readiness and publication preparation → Final review and corrections → Publication boundary
→ First commit and publication → Public repository hardening
```

The project is intentionally separate from the QACLOUD Market API automation project. It uses no API calls for setup or cleanup (Architecture §12.1); the browser's own requests are only observed.

## 2. Phase record

| Phase | Outcome | Where it is recorded | Date |
|---|---|---|---|
| Environment and Playwright setup | Node.js, TypeScript, Playwright Test (Chromium), ESLint, `.gitignore`, `.env` handling | `package.json`, `tsconfig.json`, `eslint.config.mjs`, `.gitignore`, `.env.example` | not recorded |
| UI Discovery (Pass 0, Pass 1, Pass 2 + 3 addenda) | Complete, approved; evidence `EV-P0-001`–`EV-P2-069` | `docs/discovery/EVIDENCE-LOG.md`, `DISCOVERY-STATE.md` | not recorded |
| Feature Map | Complete, approved; 9 features + 3 cross-feature journeys | `docs/discovery/FEATURE-MAP.md` | not recorded |
| Automation Architecture | Complete, approved | `docs/architecture/ARCHITECTURE.md` | not recorded |
| Test Design | Complete, approved; 116 scenario IDs | `docs/test-design/` | not recorded |
| Shopping Basket re-discovery and Pre-Implementation Verification | Register `D-01`–`D-39`; Basket Test Design reconciled | `FEATURE-MAP.md` → Shopping Basket → Re-discovery Reconciliation; `basket.md` | 2026-09-24 |
| Order Lifecycle evidence and Test Design reconciliation | Register `D-40`–`D-46`; `LIF-002` rewritten, `LIF-001` wording reconciled | `FEATURE-MAP.md` → Order Lifecycle → Evidence Reconciliation; `order-lifecycle.md` | 2026-09-26 |
| Full-suite execution | 97/97 passed | §5 below | 2026-09-27 |
| Architecture and documentation reconciliation | Status and drift reconciled across Discovery, Architecture, Test Design and README; this file created | §7 below | 2026-09-27 |
| `CAT-004`–`CAT-006` reconciliation and implementation | Mapped onto `PM-001` and `PM-017` (Option (a)); one reload assertion added; independent review passed with follow-ups | §8 below | 2026-09-27 |
| Repository cleanup and documentation reconciliation | Identity redacted, screenshots moved, stale comments cleaned, CAT status reconciled | §8 below | 2026-09-27 |
| Full-suite runs after the CAT mapping and cleanup | 41/1/55 (`FIL-021` failed on a timing race), then 97/97 with nothing changed | §5.3 below | 2026-09-27 |
| `FIL-021` evidence and Test Design reconciliation | Option A approved: `FIL-021` redefined around the settled Clear Filters workflow; the race evidence kept | §9 below | 2026-09-27 – 2026-09-28 |
| Search & Filtering Implementation Re-Alignment | Owner decisions D0–D7; `FIL-021` test re-aligned; `FIL-018` wording revised with an evidence boundary; full suite 97/97 | §9 below | 2026-09-28 |
| Repository consistency and cleanliness review | All code comments removed (701, no executable change except one equivalent `env.ts` rewrite); their facts moved into the documents; documentation reconciled with the implementation | §10 below | 2026-09-28 |
| Owner decisions on the review's exceptions | C-1: `PM-001` asserts the success banner; `networkidle` accepted and documented (Architecture §15.2, §15.3) | §11 below | 2026-09-28 |
| Portfolio demo and recording | Separate demo account and `demo/` harness; final recorded journey 2 passed, 0 retries; portfolio walkthrough video assembled and validated | §12 below | 2026-09-29 |
| Full-suite run for the walkthrough | 97/97 | §5.5 below | 2026-09-29 |
| Release readiness and publication preparation | Read-only audits; owner-approved metadata, ignore-rule, redaction and documentation changes; no commit | §13 below | 2026-09-30 |
| Market account unification | The dedicated automation account became the only Market account; one Delivered seed order created through the UI; seed-order constant `O52638` → `O62676` (owner-approved); full suite 97/97 | §14 below | 2026-09-30 |
| Environment variable rename | `DEMO_EMAIL`/`DEMO_PASSWORD`/`DEMO_USERNAME` → `MARKET_EMAIL`/`MARKET_PASSWORD`/`MARKET_USERNAME` | §15 below | 2026-09-30 |
| Post-rename full runs | Two runs failed: 40/2/55, then 75/2/20; the authentication failures were `load`-wait timeouts in `page.goto()` | §16 below | 2026-09-30 |
| Navigation synchronization investigation, decision and implementation | Read-only investigation; owner-approved explicit `DOMContentLoaded` boundary in the three Page Object `goto()` methods; Architecture §6.7 and §15.2 | §16 below | 2026-10-01 |
| Targeted validation and full-suite run | Targeted projects passed; full suite 97/97 | §16 below | 2026-10-01 |
| Final release readiness audit and documentation correction | Read-only audit; documentation consistency was the remaining blocker, corrected in README, this file, Test Design and Architecture | §16 below | 2026-10-01 |
| Final comprehensive read-only project review | BLOCKED — correction required: blocker B1 (a credential in a publishable file); high findings H1/H2 (authentication test effectiveness); the medium findings M1–M9 and lower findings recorded separately | §17 below | 2026-10-01 |
| B1 credential exposure correction design | Approved for implementation: a single redaction in `EVIDENCE-LOG.md` | §17 below | 2026-10-01 |
| B1 implementation and verification | PASS: only line 309 of `EVIDENCE-LOG.md` changed; B1 closed | §17 below | 2026-10-01 |
| H1/H2 test effectiveness decision | Approved for implementation; navigation architecture unchanged | §17 below | 2026-10-01 |
| H1/H2 implementation | PASS — H1/H2 implementation verified: six files; targeted run 10 passed; full suite 97/97 | §17 below | 2026-10-01 |
| H1/H2 verification and documentation reconciliation | CONDITIONAL PASS — documentation corrections identified; the corrections are documentation-only | §17 below | 2026-10-01 |
| Publication boundary | Discovery screenshots and the portfolio demo and recording harness excluded from the public repository and kept locally (owner decision) | §18 below | 2026-10-01 |
| First commit and publication | Public GitHub repository created; one commit of the 89 approved files, pushed to `main` and verified | §19 below | 2026-10-01 |
| Public repository hardening | Documentation cleanup, GitHub topics, a static-check CI workflow and the MIT license (owner-approved) | §19 below | 2026-10-01 |

## 3. Feature gates

Every feature went through readiness, implementation, and implementation and feature gate reviews. The gate reports themselves were delivered in working sessions and are **not stored in the repository**. The outcomes below are the recorded decisions.

| Feature | Test directory | Scenarios implemented | Gate outcome |
|---|---|---|---|
| Authentication & Session | `tests/auth/`, `tests/auth.setup.ts` | AUTH: 13 of 14 | Closed |
| Product Catalog | `tests/catalog/`; `CAT-004`/`CAT-006` = `PM-001`, `CAT-005` = `PM-017` | CAT: 6 of 6 (`CAT-004`–`CAT-006` implementation-deferred until 2026-09-27) | Closed; CAT Implementation Review Gate **CLOSED** (2026-09-27) |
| Search & Filtering | `tests/search-filtering/` | FIL: 20 of 22 | Closed; stayed closed for the separate Implementation Re-Alignment Gate (2026-09-28, §9) |
| Product Details | `tests/product-details/` | DET: 9 of 11 | Closed |
| Product Management | `tests/product-management/` | PM: 18 of 21 | Closed |
| Shopping Basket | `tests/basket/` | BSK: 18 of 21 | APPROVED / CLOSED |
| Checkout / Order Creation | `tests/checkout/` | CHK: 6 of 7 (`CHK-007` deferred) | APPROVED / CLOSED |
| Orders Management | `tests/orders/` | ORD: 7 of 7 | APPROVED / CLOSED |
| Order Lifecycle | `tests/order-lifecycle/` | LIF: 3 of 4 (`LIF-004` deferred) | First readiness gate **NOT READY** (the `LIF-002` expectation was contradicted by the application source). After the evidence reconciliation (2026-09-26) and the Test Design reconciliation: READY with non-blocking follow-up → implemented → independently verified → Feature Gate closed (with non-blocking documentation follow-ups) |
| Cross-Feature Journeys | `tests/journeys/` (`JRN-001`); `JRN-002` = `BSK-010`, `JRN-003` = `PM-017` | JRN: 3 of 3 | READY with non-blocking follow-up → implemented → Feature Gate **CLOSED** |

The per-feature totals are in TEST-DESIGN §11.1.

## 4. Approved decisions

Only decisions whose substance is recorded in the repository's documents are described here. Where the exact wording is not in the repository, the entry says so. The "Recorded in" column names the documents and the code that implement each decision; no decision is recorded in a code comment any more (until 2026-09-28 some were; those comments were removed and their substance moved into the documents, §10).

| ID | Decision (as recorded) | Recorded in |
|---|---|---|
| P-1 | The basket is one server-side singleton per account; Basket tests are a stateful (Class C) project serialized with `workers: 1` | `playwright.config.ts` (`basket` project) |
| P-2, P-3, P-4 | Basket fixtures: every Basket test must start and end with a verified-empty basket; the guard is an automatic fixture on a Basket-only `test` extension; it depends on `ownedProducts` so owned lines are removed before products are deleted. *Recorded collectively; the split between P-2, P-3 and P-4 is not in the repository* | `src/fixtures/basket.ts` (implementation); Architecture §9.2–§9.5 |
| P-5 | `QuantityStepper` is structure only, with no behavior; each stepper's owner (`BasketLine`, `ProductsPanel`) owns its clicks and requests | `src/components/QuantityStepper.ts` |
| P-6 | Nothing refreshes on its own. Each action waits for the request its own click issues, and nothing more; fresh basket state comes from opening the tab or an explicit Refresh | `BasketLine.ts`, `BasketPanel.ts`, `MarketPage.ts` |
| P-7 | Proving that an action sent **no** request uses an explicit Refresh as the closing barrier, never a time window | `basket-requests.ts` (`recordRequests`), `BasketLine.ts`, several specs |
| P-8 | `BSK-010` / `JRN-002` runs in its own `basket-session` project, with its own disposable session and two live logins | `playwright.config.ts`, `basket.session.spec.ts` |
| P-9 | `OrderSummary.placeOrderButton` is a locator only; placing the order belongs to Checkout (`BasketPanel.placeOrder`) | `OrderSummary.ts`, `BasketPanel.ts` |
| F-05 | Shopping Basket gate finding: a feature-specific fixture extension (`fixtures/basket.ts`) was accepted, and later reused for `fixtures/orders.ts`. *Exact wording not in the repository* | referenced in Architecture §9.2 |
| D-1 | `JRN-001` uses inline steps in its spec, not a `src/workflows/` layer, because the journey asserts intermediate states between steps | `journeys.purchase-lifecycle.spec.ts`; Architecture §17 |
| Option (a) | `CAT-004`–`CAT-006` are asserted inside existing Product Management tests, with no standalone CAT tests: `PM-001` carries `CAT-004` and `CAT-006` (one reload assertion added), `PM-017` carries `CAT-005` (title only). Owner decision, 2026-09-27 | TEST-DESIGN §9; `add-product.spec.ts`, `lifecycle.spec.ts` |
| D-2 | Orders created by a test body (Checkout, `JRN-001`) are deleted by that test after its assertions (the Checkout precedent), with the order number annotated as soon as it is known. No order-tracking fixture was added; the failure-path limitations are accepted | `journeys.purchase-lifecycle.spec.ts`; Architecture §12.7 |

## 5. Execution evidence

### 5.1 Full-suite run — 2026-09-27 (CONFIRMED FROM EXECUTION)

| Item | Result |
|---|---|
| Command | `npx playwright test` — normal dependency graph; no `--no-deps`, `--retries`, `--project` or `--grep` |
| Start / end | 2026-09-27 10:56:06 → 11:09:28 (UTC+3); **~13.37 min** |
| Exit code | **0** |
| Inventory | **97 tests, 34 files, 13 projects** (matches `npx playwright test --list`) |
| Result | **97 passed · 0 failed · 0 skipped · 0 flaky** · `retries: 0` · 6 workers (stateful projects limited to 1 by config) |

| Project | Passed | | Project | Passed |
|---|---:|---|---|---:|
| setup | 1 | | basket | 17 |
| auth | 9 | | basket-session | 1 |
| catalog | 3 | | checkout | 6 |
| search-filtering | 20 | | orders | 7 |
| product-details | 9 | | order-lifecycle | 3 |
| product-management | 18 | | journeys | 1 |
| | | | auth-session | 2 |

Other observations from the same run:
- `auth-session` passed; this was its first execution.
- `FIL-011`, `FIL-012` and `FIL-018` passed.
- The slowest test was `BSK-010` / `JRN-002` at 28.4 s, against a 60 s limit.
- After the run, a read-only check found 33 products, no `AUT-` products, an empty basket, and only orders `O52638` (seed) and `O64856` (foreign), both unchanged.
- The repository was unchanged apart from gitignored runtime artifacts.

**Preservation.** The console log of this run was kept outside the repository, in the working session's scratch area. `playwright-report/` is gitignored and replaced on every run. The table above is the preserved record.

### 5.2 Earlier recorded runs (CONFIRMED FROM EXECUTION)

| Date | Run | Result |
|---|---|---|
| 2026-09-26 | `order-lifecycle` alone; then checkout + orders + order-lifecycle, run in sequence | 3/3; 16/16 |
| 2026-09-26 | `journeys` alone; then checkout + orders + order-lifecycle + journeys, run in sequence | 1/1; 17/17 |
| 2026-09-27 | Pre-run check: `search-filtering` with its normal dependencies, after the leftover product was removed | 21/21 |

### 5.3 Later runs on 2026-09-27

| Time (UTC+3) | Run | Result | Evidence |
|---|---|---|---|
| 11:43:57 → 11:56:46 | Owner's full run, `npx playwright test` | 94 passed, 1 failed (`JRN-001`), 2 did not run (`auth-session`, dependency skipped) | CONFIRMED FROM EXECUTION. `JRN-001` failed in fixture setup with `ENOENT` on its trace files, before any business step, because a second Playwright run started at 11:56:40 cleared the shared `test-results/` folder. Not a test or application defect |
| 12:13:14 → 12:26:27 | `npx playwright test tests/journeys/… --project=journeys` (dependencies in full) | 95 passed | CONFIRMED FROM EXECUTION |
| ended about 13:05 | Owner's full run, `npx playwright test` | 97 passed, 0 failed, 0 skipped, 6 workers, about 13.5 min | Reported by the owner; the report has since been replaced. **The last full run before the `CAT-004`–`CAT-006` change** |
| 15:12 and 15:40 | `--project=product-management` with `PM-001` and `PM-017` selected (read-only dependencies in full), after the CAT change | 35 passed, twice | CONFIRMED FROM EXECUTION |
| 16:31:05 → 16:32:04 | Full run, `npx playwright test`, after the repository cleanup | 41 passed, 1 failed (`FIL-021`), 55 did not run, exit 1 | CONFIRMED FROM EXECUTION. `FIL-021` expected the 33-product catalog after Clear Filters and saw 2 products, with every control reset. The projects that depend on `search-filtering` did not run (§9) |
| 16:48:31 → 17:01:55 | Full run, `npx playwright test`, nothing changed (reproducibility rerun) | 97 passed, 0 failed, 0 skipped, exit 0, 13.4 min | CONFIRMED FROM EXECUTION. `FIL-021` passed (6.0 s): the failure was **not reproduced**. Account state identical before and after; repository unchanged |

The last two rows are the first full-suite runs after the `CAT-004`–`CAT-006` change.

An earlier full dependency-chain attempt on 2026-09-26 stopped at `search-filtering`: `FIL-011`, `FIL-012` and `FIL-018` failed because of the leftover product `AUT-3ba49d-24-bsk017b`, and the dependent projects did not run. After the product was removed by hand, the 2026-09-27 run above passed in full.

### 5.4 Runs on 2026-09-28

All CONFIRMED FROM EXECUTION. `tsc` and ESLint were clean and the inventory was 97 tests in 34 files before any run.

| Time (UTC+3) | Run | Result |
|---|---|---|
| 12:17:49 → 12:18:08 | `--project=search-filtering -g "FIL-021\|FIL-018"` | 3 passed (with `setup`) |
| 12:18:19 → 12:18:42 | The same selection with `--repeat-each=5` (repetition, not retries) | 11 passed (10 executions plus `setup`) |
| 12:18:42 → 12:18:54 | `FIL-021` with `--trace on` | Passed. The trace shows no catalog request in flight at any user action, including the Clear Filters click; typing the search term sent no catalog request; Clear Filters' own reload was the last request |
| 12:19:15 → 12:19:47 | `--project=search-filtering` | 21 passed |
| 12:20:21 → 12:34:02 | Full run, `npx playwright test` | 97 passed, 0 failed, 0 skipped, exit 0, 13.6 min; `FIL-021` 7.1 s, `FIL-018` 6.8 s. Account state identical before and after (33 products, no `AUT-` product, empty basket, both protected orders delivered); repository unchanged by the run |
| 13:35:12 → 13:49:21 | Full run, `npx playwright test`, after the repository consistency review (§10) | 97 passed, 0 failed, 0 skipped, exit 0, 14.1 min; `FIL-021` 6.1 s, `FIL-018` 6.7 s. Account state identical before and after; repository unchanged by the run |

### 5.5 Run on 2026-09-29 (CONFIRMED FROM EXECUTION)

| Item | Result |
|---|---|
| Command | `npx playwright test`, normal dependency graph, run off camera for the portfolio walkthrough (§12) |
| Start / end | 2026-09-29 16:11:48 → 16:25:49 (UTC+3); **14.0 min** |
| Exit code | **0** |
| Result | **97 passed · 0 failed · 0 flaky · 0 skipped** · `retries: 0`; `.last-run.json` status `passed` |
| Account state | Identical before and after: 33 products, no `AUT-` product, empty basket, the two protected delivered orders unchanged |

It was the most recent full run when this entry was written; later full runs are recorded in §14, §16 and §17. Its HTML report is the one shown in the walkthrough; `playwright-report/` is gitignored and replaced by the next run.

## 6. Known limitations and open items

| Item | Status |
|---|---|
| CI | **Static checks only** since 2026-10-01 (§19): dependency install, TypeScript, ESLint and the test inventory. The browser suite is not run in CI (no CI credentials; one shared, mutated account; Architecture §22) and has been run locally only |
| `CAT-004`–`CAT-006` | Implemented inside `PM-001` and `PM-017` (2026-09-27); passed in the 16:48 full run (the 16:31 run stopped before Product Management) |
| Concurrent runs | All projects share one `test-results/` folder, and every run clears it first. Two Playwright runs at once break the first one (§5.3). Run one at a time |
| 13 Exploratory / Deferred scenarios | Not implemented, by design (TEST-DESIGN §9, §11.1) |
| Order Lifecycle source-only behavior (`D-44`–`D-46`: Final Status modal, Cancelled lock, stock returned on cancel) | CONFIRMED FROM SOURCE INSPECTION only; `U-202` open in execution terms |
| Failure-path cleanup (D-2; `createdOrder` setup/cleanup failure) | Documented limitations (Architecture §12.7), not guarantees |
| Timeouts | 60 s for stateful projects. One earlier run reached 59.5 s (`ORD-006`) during a slow period; the 2026-09-27 maximum was 28.4 s |
| Search & Filtering sensitivity | `FIL-011`/`012`/`018` fail if any `AUT-` product is left in the first category |
| Stability | Nine clean full runs confirmed from execution (2026-09-27 10:56 and 16:48; 2026-09-28 12:20, 13:35 and 14:06; 2026-09-29 16:11 on the previous account; 2026-09-30 14:57 on the automation account; 2026-10-01 12:07 with the `DOMContentLoaded` navigation boundary, §16; 2026-10-01 14:24 after the authentication test changes, §17), one reported by the owner (2026-09-27 about 13:05), and two failed full runs: 2026-09-27 11:43 (`JRN-001`, a concurrent run cleared `test-results/`; not a test or application defect, §5.3) and 2026-09-27 16:31 (the `FIL-021` race, §9); and one on 2026-09-30 14:04 (`BSK-010` hit the login rate limit, `429`; §14); and two on 2026-09-30 after the rename, 20:52 and 21:06 (authentication tests timed out in `page.goto()` waiting for `load`; §16). Frequency across repeated runs and behavior in CI are NOT VERIFIED |
| Navigation boundary | Page Object `goto()` resolves at `DOMContentLoaded` since 2026-10-01 (§16; Architecture §6.7). It is a navigation boundary, not application readiness. `page.reload()` (`AUTH-006`) and the `networkidle` wait in `waitForCatalogLoaded()` are unchanged and still wait for page subresources. The slow-image condition behind the post-rename failures was not reproduced: resilience to it and `CAT-002`'s timing margin under slow conditions are NOT VERIFIED, as is repeated-run stability |
| C-1 (`PM-001` success banner) | The banner shows "Product created successfully!" (CONFIRMED FROM EXECUTION, 2026-09-28), contradicting `EV-P2-042`'s "no toast". `PM-001` asserts it since the owner decision of 2026-09-28 (§11) |
| HTML report | `npx playwright test --list` also rewrites `playwright-report/`, because the HTML reporter is configured. Inspect a run's report before listing (observed 2026-09-28). `npx playwright test --list --reporter=list` leaves it unchanged (report hash compared before and after, 2026-09-30) |
| `FIL-021` | Design revised and test re-aligned 2026-09-28 (§9). Any failure in `search-filtering` still stops the 55 tests that depend on it (§5.3) |
| `FIL-018` | Kept as is; its pass depends on response order (INFERRED, never observed failing). A failure is to be reported with its request timing, never retried (§9) |
| Documentation cleanup (owner decision D6) | Done in the repository consistency review (2026-09-28, §10) |
| Seed-data dependencies | `ORD-001`–`ORD-003` and `LIF-003` need the Delivered seed order (`O62676` since 2026-09-30, §14; `O52638` before); `ORD-007` needs one other order to remain, which the seed order satisfies; `FIL-004` needs a product whose hidden Details match "milk"; `DET-009` needs the first Low Stock card in catalog order to have stock 5–9 (card Low Stock for 1–9, modal only for 1–4, page source; §14). These are properties of the regression account's data, not of the application |
| Demo specs | Local only since §18. `shopper-journey.demo.spec.ts` and `order-lifecycle.demo.spec.ts` predate the combined journey and are kept; whether they are superseded is an open owner decision |

## 7. Documentation reconciliation — 2026-09-27

A read-only audit found the documentation still describing the project as it was before implementation, with several sections drifted from the code. The reconciliation made these changes:
- **Status and governance** brought up to date, with the original gate text kept and marked historical: Architecture §1, §2 and closing status (§30 marked historical); TEST-DESIGN §2, §3 and §11; FEATURE-MAP gate status; DISCOVERY-STATE status line; README.
- **Architecture aligned with the implementation:**
  - §4: layout; no `workflows/` or `types/`;
  - §5.9 and §7.9: Refresh belongs to `OrdersPanel`;
  - §9.2–§9.5: fixtures as implemented, `emptyBasket` as a guard, `createdOrder` → `ownedProducts`;
  - §10.7 and §12.3: stock, split into source and execution evidence;
  - §12.7: the D-2 convention;
  - §14.6, §15.2–§15.6 and §18: badge behavior and the observed endpoints;
  - §17: D-1;
  - §19.5 and §20.1: the real configuration;
  - §21.2 and §22: no CI;
  - §24 and §26–§28.
- **Order Lifecycle:**
  - "stale until Refresh" corrected in the Feature Map and Architecture;
  - register `D-40`–`D-46` added;
  - a new evidence label, **CONFIRMED FROM SOURCE INSPECTION**, defined for facts read from the application's page source.
- **`CAT-004`–`CAT-006`** marked implementation-deferred, with the reason recorded in the repository.
- **Residual-state record** updated for `AUT-3ba49d-24-bsk017b` (removed by hand by the owner) and the foreign order `O64856`.
- **`tests/auth.setup.ts`:** failure artifacts turned off (Architecture §21.5), because setup ends on `/profile.html`, which displays the account API key.
- **`.gitignore`:** now also ignores `*.log` and `.claude/settings.local.json`.

**Before the first commit (owner decisions):**
- the 9 root Discovery screenshots (`pass*.png`) are untracked and not ignored: keep them, move them under `docs/`, or ignore them;
- `DISCOVERY-STATE.md` ("Test identity") names the test account's username and email: consider redacting before publishing the repository.

*Both were resolved on 2026-09-27 (§8).*

## 8. CAT-004–CAT-006 and repository cleanup — 2026-09-27

- **Reconciliation (read-only).** The application re-fetches the catalog after every save and every accepted delete, so the catalog updates without a reload. `PM-001` already asserted `CAT-004`, and `PM-017` already asserted `CAT-005`. `CAT-006` was only exercised implicitly.
- **Implementation (Option (a)).** `PM-001` is now `PM-001 / CAT-004 / CAT-006` and gained one step: a full `/market.html` navigation, `waitForCatalogLoaded()`, then an explicit presence assertion. `PM-017` is now `PM-017 / JRN-003 / CAT-005` (title only). No test was added; the inventory is still 97 tests in 34 files.
- **Validation.** `tsc` and ESLint clean; focused `product-management` runs 35/35, twice (CONFIRMED FROM EXECUTION). An independent CAT Implementation Review Gate passed with follow-ups. A full-suite run was NOT VERIFIED at the time; two followed (§5.3).
- **Repository cleanup:**
  - the test account's email and handle replaced with `<TEST_ACCOUNT_EMAIL>` / `<TEST_ACCOUNT_HANDLE>` in `DISCOVERY-STATE.md`, `EVIDENCE-LOG.md`, `FEATURE-MAP.md` and `authentication.md`;
  - the 9 Discovery screenshots moved unchanged to `docs/discovery/screenshots/`, with the Evidence Log references updated;
  - the local `.playwright-mcp/` folder deleted;
  - stale, duplicate and narrating comments removed or corrected in `src/` and `tests/`, with no change to executable code;
  - TEST-DESIGN, `catalog.md`, `product-management.md` and README reconciled with the CAT mapping.

## 9. FIL-021 reconciliation — 2026-09-27 to 2026-09-28

- **Failure (CONFIRMED FROM EXECUTION).** In the 16:31 full run, `FIL-021` selected a Zone value and clicked "Clear Filters" about 54 ms later, while the Zone request was still in flight, as its design then required. The trace shows the Zone response completing about 27 ms after the response to the reload Clear Filters triggered, and no catalog request after it. The controls and the "No active filters" summary were reset, but the grid kept the Zone's 2 products until the 30 s timeout.
- **Rerun (CONFIRMED FROM EXECUTION).** The unchanged suite passed 97/97 at 16:48, `FIL-021` included: **not reproduced**. With 8 recorded passes and 1 failure, no frequency is claimed.
- **Evidence reconciliation (read-only).** `EV-P2-028`, the evidence behind `FIL-021`, was captured with snapshots only. It confirms the settled reset, but never observed a request in flight, a cancellation or the order of responses. The design's claims that Clear Filters "bypasses the delay defect entirely" and discards a pending change went further than the evidence. A read-only inspection of the application's page source found no cancellation of earlier catalog requests and no stale-response check; that this caused the failure is INFERRED.
- **Decision (owner, 2026-09-28): Option A.** `FIL-021` verifies Clear Filters after the preceding filter changes have completed. It no longer covers the in-flight case, and the race is not claimed fixed.
- **Owner decisions D0–D7 (2026-09-28).** D0: revise the `FIL-021` wording (Search sends no catalog request; Clear Filters described as an in-test reset). D1: keep P0, with its rationale stated. D2: record the race as a historical observed race/anomaly, not a confirmed application defect. D3: link it to `FIL-022` / `U-208` for traceability only. D4: keep `FIL-018`, revise its wording, and state the INFERRED response-order dependency as an evidence boundary. D5: no Search & Filtering source-inspection register. D6: the older documentation inconsistencies become separate cleanup items (§6). D7: keep the Feature Gate closed and run a separate Implementation Re-Alignment Gate.
- **Re-alignment (2026-09-28).** `FIL-021`'s test now settles every filter change before Clear Filters (the existing `applyAndAwaitCatalog`; Search on the summary showing the term, since it sends no request) and awaits Clear Filters' own reload. `FIL-018`'s test changed only in title. Comments in `ProductsPanel.ts` and `CategoryChips.ts` were corrected, with no executable change. Results in §5.4.
- **Documentation reconciled:** `search-filtering.md` (`FIL-021`); TEST-DESIGN §3 and §11; FEATURE-MAP (Search & Filtering → Negative / Validation Behavior, and Categories → Clear Filters); Architecture §5.3, §15.4, §18.2 row 13, §27 and its status note; README; this file. The Evidence Log is unchanged. On the re-alignment: `search-filtering.md` again (Feature Overview, `FIL-015` Steps, `FIL-018`, `FIL-021`, `FIL-022`), TEST-DESIGN §3, §10 and §11, README and this file.
- **Evidence classification of the race (D2):** symptom and request timing CONFIRMED FROM EXECUTION; source mechanism facts CONFIRMED FROM SOURCE INSPECTION; causal relationship INFERRED; frequency NOT VERIFIED; the later reproduction attempt (16:48) CONFIRMED FROM EXECUTION, not reproduced; that the race is fixed or absent NOT VERIFIED.
- **Not covered:** no scenario verifies request ordering or stale-response handling; `FIL-022` stays Exploratory / Deferred and `U-208` NOT VERIFIED.

## 10. Repository consistency and cleanliness review — 2026-09-28

- **Code comments removed.** All 701 comments in the 66 code files (`src/`, `tests/`, `playwright.config.ts`, `eslint.config.mjs`) were removed with a parser-based tool; strings, selectors, test titles and regular expressions were untouched. A transpile comparison shows identical executable output for 65 of the files. The exception is `src/support/env.ts`: its intentionally empty `catch` (a missing `.env` is normal in CI) held only a comment, so it became a small named helper with the same behavior, `loadDotEnvFileIfPresent()`. Test titles, projects and files are unchanged: 97 tests in 34 files.
- **Facts moved from comments into the documents:** locator and DOM facts (Architecture §7.6, §13.2, §13.4, §13.5, §13.9), synchronization behaviors (§15.3), the dialog guard (§16.4), teardown order (§9.5), measured timeouts and dependency rules (§20.1) and worker settings (§19.5). Comment claims with no record behind them were not carried over: that the chip-versus-count mismatch "reproduced deterministically", that the separate `basket-session` project avoids live-login rate limiting, and an unmeasured latency margin in `FIL-017` (all NOT VERIFIED).
- **Documentation reconciled with the implementation:** the older Search & Filtering statements (all filtering in one in-memory array, "always one interaction behind", a category click "flushing" a pending change) corrected in the Feature Map, the Test Design and Architecture, and the legacy label "one-step-late" replaced; statements that evidence is kept in code comments or annotations corrected (Architecture §3.2, §13.1, §14.8, §15.4, §23.6, §23.9, §24; TEST-DESIGN §9); the environment variables corrected (`TEST_EMAIL` is the login identity; `TEST_USERNAME` is in the template but is not read); `CHK-002`'s line-item format and `LIF-003`'s two open points recorded. The Evidence Log and the Discovery State are unchanged.
- **C-1.** The full run below recorded `PM-001`'s success banner as shown, reading "Product created successfully!" (CONFIRMED FROM EXECUTION). `EV-P2-042`'s "silent success — no toast" is therefore CONTRADICTED FROM EXECUTION for the current application, and the Feature Map and `PM-001` Notes now say so. `PM-001` still did not assert the banner at that point; whether it should was an owner decision (decided in §11).
- **Verification:** `tsc` and ESLint clean; 97 tests in 34 files; full suite 97/97 on 2026-09-28 at 13:35 (§5.4).

## 11. Owner decisions on the review's exceptions — 2026-09-28

- **C-1: yes.** `PM-001` now asserts the success banner: once the save's catalog reload has finished, `#alert` must be visible and read "Product created successfully!". The report attachment that recorded the banner was replaced by this assertion, and the page-object helper that read it was removed. No other step, title or ID changed.
- **`networkidle`: accepted.** `waitForCatalogLoaded()` is unchanged. Architecture §15.2 now lists the page load-state wait as a sanctioned mechanism, separates the principles from the implemented mechanisms, and states what the wait does not establish; §15.3 refers to it.
- **Verification (CONFIRMED FROM EXECUTION, 2026-09-28, UTC+3):** `tsc` and ESLint clean; 97 tests in 34 files with titles unchanged; `PM-001` alone passed (14:02, 7.7 s); the `product-management` project passed 18/18 (14:04); a full run, 14:06:55 → 14:21:36, passed 97/97 (0 failed, 0 skipped, exit 0, 14.7 min; `PM-001` 7.6 s). Account state identical before and after; repository unchanged by the runs.

## 12. Portfolio demo and recording — 2026-09-29

- **Demo harness.** `demo/` (files last modified 2026-09-29) runs business journeys for presentation, separate from the regression suite: its own account (`DEMO_*` variables), its own storage state (`playwright/.auth/demo-user.json`), and two configurations (`playwright.demo.config.ts`, `playwright.recording.config.ts`) whose `testDir` is `./demo`, so the regression's `tests/` inventory is unchanged at 97. A demo run creates one `AUT-` product and deletes it, every order containing it and its basket line afterwards, including when setup fails. The recording adds a preflight that stops before capture if the demo account holds leftover `AUT-` data.
- **Recording attempts.** The first final-recording attempt was BLOCKED: the video was saved after the browser had closed. An approved rerun passed with Playwright's built-in recorder (12.84 s, VP8). A read-only investigation of files reported as unplayable found one valid, playable file; the discrepancy was not reproduced. An approved revision for clarity and pacing then replaced the built-in recorder: headed Chromium with `slowMo` 1200 ms and presentation holds (`demo/recording-stage.ts`), screencast frames captured at full JPEG quality (`demo/recording-fixtures.ts`) and encoded by `demo/encode-recording.mjs` (requires an external ffmpeg with libvpx-vp9). The recording project's timeout became 300 s.
- **Final recorded run (CONFIRMED FROM EXECUTION).** `npx playwright test -c playwright.recording.config.ts`, 2026-09-29 about 15:31 → 15:33 (UTC+3): **2 passed** (`demo-setup` and the combined journey), **0 retries**. The order and product it created were removed by its own cleanup. Output: WebM, VP9, 1280×720, 30 fps, 68.7 s, 2,060 frames, no audio.
- **Portfolio walkthrough (CONFIRMED FROM VIDEO).** Assembled outside the repository from an isolated editor walkthrough of the repository, the recorded journey (unchanged, at 1:1 on a 1920×1080 canvas), and the HTML report of the 16:11 run (§5.5). The `-c playwright.recording.config.ts` command is shown typed but not executed. Output: MP4, H.264, 1920×1080, 30 fps, 234.3 s, 7,029 frames, no audio.
- **Validation.** Stream inspection and a full decode without errors; playback and seeking in Chromium, Microsoft Edge and Google Chrome (Windows Media Player NOT VERIFIED); a frame-by-frame review of the whole file at one frame per second found no credentials, API key, `/profile.html`, auth or `.env` files, account menus or personal paths. The recorded journey's 2 passed and the regression's 97 passed are shown and labelled as separate results.
- **Retention.** Both videos are kept in the gitignored `artifacts/portfolio/` and are not part of the repository. The regression suite, Page Objects, fixtures and `playwright.config.ts` were not changed by this phase.

## 13. Release readiness and publication preparation — 2026-09-30

- **Final release readiness audit (read-only):** CONDITIONAL PASS. No secret in any publishable file; `tsc` and ESLint clean; 97 tests in 34 files. Findings: stale run references, the undocumented demo harness, account-data dependencies, publishable `.mcp.json`, license metadata, the abandoned test-account handle, and the commit author identity.
- **Public repository manifest audit (read-only):** every publishable file and all nine screenshots reviewed; no credentials or account identity in any image.
- **Owner decisions:** no open-source license file; `.mcp.json` and `.claude/` stay local; the videos stay outside the repository; the two earlier demo specs stay under review; the commit identity and the first commit are handled by the owner.
- **Approved changes:** `.gitignore` ignores `.claude/` and `.mcp.json`; `package.json` loses `license` and `main` and gains a description; the abandoned test-account handle is replaced with `<ABANDONED_TEST_ACCOUNT>`; wording that identified the regression account as the owner's personal account is neutralised; the five Add Product validation screenshots are now cited in `EV-P2-037`–`EV-P2-040`; README, this file, Architecture, Feature Map and Test Design reconciled with the current state. No source or test code changed, and nothing was committed.

## 14. Market account unification — 2026-09-30

- **Why.** The regression suite ran on a separate, personal account; the demo and recording already used a dedicated automation account. The owner decided to keep one dedicated account for everything.
- **Suitability (CONFIRMED FROM EXECUTION).** The unchanged suite, run project by project on the dedicated account (12:31 → 12:47), passed 91/97. The 6 failures were all data preconditions: the account had no orders (`ORD-001`–`ORD-003`, `ORD-007`, `LIF-003`) and no Low Stock product (`DET-009`). No authentication, permission or cleanup failure occurred, and the account was identical before and after.
- **Stock thresholds (page source only).** The card shows "⚡ Low Stock" for stock 1–9; the details modal shows "⚠️ Low Stock" only for 1–4. This reconciles `EV-P2-045` (stock 1: the modal shows Low Stock) with `EV-P2-006`/`EV-P2-064` (stock 8 and 9: the modal shows In Stock); the statement that the modal "never" shows Low Stock is CONTRADICTED by `EV-P2-045`. `DET-009` therefore needs its first Low Stock card to have stock 5–9.
- **Seed data, created through the UI only (CONFIRMED FROM EXECUTION).** Order numbers are issued by the application, so the old seed order could not be recreated. One order was placed for one unit of an existing catalog product, "Earl Grey Loose Leaf Tea" ($3.50): order **`O62676`**. Through its Status control it went Pending → Processing → Shipped → Delivered; each change returned `200` and survived a full reload, and Delivered went through the "⚠️ Confirm Final Status" modal ("SHIPPED → DELIVERED", then Confirm), the first execution of `D-44`. It is now Delivered, with its select disabled and "Delete Order" still rendered. The order also left that product permanently at stock 9 (the only Low Stock product in the account: card "⚡ Low Stock: 9 left", modal "✅ In Stock"), which is the subject `DET-009` selects, and it is the other order `ORD-007` needs. No other data was created; the first checkout attempt left one basket line and no order, and that line became the order.
- **Test change (owner-approved, the only one).** The seed-order constant `O52638` → `O62676` in `tests/orders/orders.list.spec.ts` and `tests/order-lifecycle/order-lifecycle.delivered-lock.spec.ts`; both files are otherwise byte-identical. No step, assertion, selector, ID, fixture or Page Object changed.
- **Configuration.** `src/support/env.ts` `getCredentials()` reads `DEMO_EMAIL`/`DEMO_PASSWORD`; `.env.example` lists only the `DEMO_*` variables. Nothing reads `TEST_*` any more.
- **First full run (CONFIRMED FROM EXECUTION).** `npx playwright test`, 2026-09-30 14:04:47 → 14:12:51: 77 passed, 1 failed, 19 did not run. `BSK-010` / `JRN-002` failed at its second live login: `POST /api/login` returned `429`, so the application rate-limited the account's logins. That run followed about 20 logins to the account in the preceding two hours during this preparation (probes, the 12:31 run, the seed and verification scripts), 6 of them in the 10 minutes before it. The rate-limit cause is INFERRED from that timing; the `429` is CONFIRMED FROM EXECUTION. No cleanup failed. After 44 minutes without logins the unchanged suite was run again:
- **Full run (CONFIRMED FROM EXECUTION).** `npx playwright test`, 2026-09-30 14:57:02 → 15:10:01 (UTC+3): **97 passed, 0 failed, 0 flaky, 0 skipped**, exit 0, 12.9 min. The process was given deliberately invalid `TEST_EMAIL`/`TEST_PASSWORD` values, which take precedence over `.env`, so the run could not have used the old account.
- **Still NOT VERIFIED:** whether a Delivered order can be deleted (so the seed order is permanent by design); the Cancelled path; stability over repeated runs on this account.

## 15. Environment variable rename — 2026-09-30

The account's variables were named for the demo it first served. They were renamed to match its role as the single Market automation account: `DEMO_EMAIL` → `MARKET_EMAIL`, `DEMO_PASSWORD` → `MARKET_PASSWORD`, `DEMO_USERNAME` → `MARKET_USERNAME`, in `src/support/env.ts`, `demo/demo-env.ts`, `.env.example`, README, Architecture §20.3 and `authentication.md`. The account and its values are unchanged. §12 and §14 keep the names in use at the time. `DEMO_VISUAL_PAUSE_MS` (demo pacing only) and the `DEMO_STORAGE_STATE_PATH` constant keep their names, because they belong to the demo harness.

## 16. Post-rename regression and navigation boundary — 2026-09-30 to 2026-10-01

- **Run #1 (CONFIRMED FROM EXECUTION).** `npx playwright test`, 2026-09-30 20:52:13 → 20:53:49 (UTC+3), 1.6 min: 40 passed, 2 failed, 55 did not run. `setup` passed through the renamed `MARKET_*` variables, and no `429` occurred. `AUTH-001`/`AUTH-002` hit the 30 s test timeout in `page.goto('/')` while it waited for `load`, before any login action. `CAT-002` timed out later, waiting for the first product card after navigation had completed, on an authenticated page whose catalog data never rendered; its cause is NOT VERIFIED and is not attributed to the `load` wait.
- **Run #2 (CONFIRMED FROM EXECUTION).** One owner-approved rerun, 2026-09-30 21:06:38 → 21:18:10, 11.5 min: 75 passed, 2 failed, 20 did not run. `AUTH-011` and `AUTH-012` hit the 30 s test timeout in `page.goto()` on `/market.html` and `/profile.html`: after the expected `401` from `/api/profile` and the client-side redirect, the navigation was waiting for the `load` event of `/`. The 20 tests that depend on `auth` did not run; `AUTH-001`/`AUTH-002` passed.
- **Investigation (read-only).** From the Run #2 traces and the Playwright 1.63 source: `page.goto()` defaults to `waitUntil: 'load'`; a client-side redirect before the protected page's `load` moves the wait to `/`; the 30 s default test timeout governed, and no navigation timeout is set (CONFIRMED). The access-control behavior had already occurred before the timeout: the `401`, the redirect to `/` and the unauthenticated portal, about 26 s earlier (CONFIRMED FROM EXECUTION). Most of the portal's app images had not finished transferring; that this, or the environment, delayed `load` is INFERRED. Nothing establishes the rename as a cause: `AUTH-011`/`AUTH-012` read no credentials, Run #1's `AUTH-001` resolved the `MARKET_*` values before it timed out, and every login succeeded.
- **Decision.** The Architecture/Test Synchronization Decision Gate chose a shared navigation change: an explicit `DOMContentLoaded` boundary in `PortalPage.goto()`, `MarketPage.goto()` and `ProfilePage.goto()`. Rejected: longer timeouts, retries, `waitUntil: 'commit'` (too weak), test-level overrides (URL navigation lives only in Page Objects, Architecture §6.7) and a new navigation/readiness abstraction. The Implementation Approval Gate approved it with conditions: `AUTH-006` added to targeted validation; a `CAT-002` failure would stop the work rather than be repaired; documentation limited to Architecture §6.7 and §15.2.
- **Implementation (CONFIRMED).** Exactly three source lines changed: each `goto()` passes `{ waitUntil: 'domcontentloaded' }`. Architecture §6.7 and §15.2 document the boundary: navigation is not application readiness. No test, fixture, configuration or dependency changed.
- **Targeted validation (CONFIRMED FROM EXECUTION).** One run each: `tsc` and ESLint clean; inventory unchanged (97 tests in 34 files, demo 4, recording 2); `setup` passed; `auth` 10 passed (`setup` and the 9 auth tests, including `AUTH-006`); `catalog` 4 passed (including `CAT-002`); `demo-setup` passed; `search-filtering` 20 and `product-details` 9 passed. A traced run of `AUTH-011`/`AUTH-012` showed `goto()` resolving before the portal images finished, then the `401`, the redirect and the asserted final URL `/`.
- **Full run (CONFIRMED FROM EXECUTION).** `npx playwright test`, 2026-10-01 12:07:02 → 12:20:39 (UTC+3): **97 passed, 0 failed, 0 flaky, 0 skipped, 0 not run**, `retries: 0`, exit 0, 13.6 min, run locally; all 13 projects executed, including every stateful and journey project. The account state was unchanged afterwards: `O62676` Delivered, "Earl Grey Loose Leaf Tea" Low Stock at 9, 34 products, no `AUT-` product, empty basket.
- **Reading of the evidence.** The change removed the confirmed `load`-wait failure mode, and the suite subsequently passed 97/97. The slow-image condition was not reproduced during the validation or the full run, so any causal link between the change and the difference from the failed runs is INFERRED, and resilience to that condition is NOT VERIFIED. Also NOT VERIFIED: repeated-run stability, `CAT-002`'s timing margin under slow conditions, the exact login rate-limit thresholds, cleanup after a crash or a concurrent run (§6), and a recording run after the change.
- **Release readiness.** A read-only final release readiness audit (2026-10-01) found the repository publishable: no secret or credential in any publishable file, the ignore rules of §13 in place, the implementation within the approved scope and the inventory accurate. Documentation consistency was the remaining blocker; this update to README, this file, Test Design and Architecture is the correction. Release readiness is still to be re-confirmed (§17).

## 17. Final review, B1 and authentication test effectiveness — 2026-10-01

- **Release recheck (context).** After the §16 correction, a read-only recheck found two stale "most recent full run" claims, in the Architecture status table and the Feature Map's current status; after their owner-approved correction, the recheck concluded release ready with documented limitations. The review below superseded that outcome.
- **Final comprehensive review (read-only).** A repository-wide review of the documentation, architecture, test design, source, tests, execution evidence and repository safety: **BLOCKED — correction required**. Blocker B1: a literal password for the abandoned probe account was quoted in `docs/discovery/EVIDENCE-LOG.md` (`EV-P1-013`). High finding H1: `AUTH-010`'s assertions were already true when the login form was submitted, so the test could not detect a wrong password being accepted. High finding H2: `AUTH-003`, `AUTH-005` and `AUTH-006` asserted only static markup, the URL or the title, which hold before the page's own authentication check. The review's medium findings M1–M9 are listed below; neither they nor the lower findings are addressed by this section.
- **Medium findings M1–M9 (open).** Each was still present, unchanged, on 2026-10-01 after publication (§19):
  - **M1.** `FIL-001`, `FIL-003` and `FIL-012` do not check the term matching or the intersection count that their design requires (`search-filtering.md`).
  - **M2.** `CHK-005`'s persistence assertion, required by `checkout.md`, is not implemented in `checkout.state.spec.ts`.
  - **M3.** `waitForURL` (15 s, which waits for `load`) is used in `tests/auth.setup.ts`, `src/fixtures/index.ts` and `basket.session.spec.ts`, but the "Navigation boundary" row of §6 lists only `page.reload()` and `networkidle`.
  - **M4.** Architecture §12.5 (residual-state reporting), §12.6 (startup orphan report) and §16.6/§16.7 (a redirect reported as a setup failure) describe mechanisms that are not implemented.
  - **M5.** Three Product Management specs (`add-product`, `delete-product`, `lifecycle`) clean up through a module-level `createdNames` list and `afterEach`, not through a fixture as Architecture §12.1 states.
  - **M6.** Stale or contradictory current statements in the Feature Map: client-side filtering (contradicted later in the same file), personal-account wording, the stock-status behavior and card label that `EV-P2-045` contradicts, and "successful creation is silent" (contradicted by C-1, §10).
  - **M7.** `DET-009`'s design in `product-details.md` predates the stock thresholds recorded in §14 (card 1–9, modal 1–4; the test needs stock 5–9).
  - **M8.** DISCOVERY-STATE's "Test identity" line presents the Discovery-period account and `.env` contents as current.
  - **M9.** `OrdersPanel.ensureOrderAbsent()` decides from a single, non-retrying count, so an order cleanup could skip an order that has not rendered yet (INFERRED risk).

  The lower findings (assertion gaps, locator, synchronization and code-hygiene items, and wording and cross-reference errors) were reported in the review and are not itemized here.
- **B1.** A design gate approved a single redaction, and the implementation replaced the quoted value on line 309 of `EVIDENCE-LOG.md` with "throwaway probe password; value redacted", changing nothing else. An exact and case-insensitive scan of all 111 publishable files then found no copy of the value (CONFIRMED FROM EXECUTION). B1 is closed. Whether the value still authenticates, and any exposure outside the repository, are NOT VERIFIED; whether to rotate or retire that account is the owner's decision.
- **Correction to earlier records.** The statements in §13 and §16 that no secret was in any publishable file are CONTRADICTED by B1. Those scans compared the files with the configured account's values and the commit identity, so they did not detect the abandoned probe account's password. The value has since been redacted as above. §13 and §16 are kept as written.
- **H1/H2 decision (read-only).** Approved for implementation. `AUTH-010` needs an oracle on the real `POST /api/login` response. `AUTH-003`, `AUTH-005` and `AUTH-006` need assertions on the authenticated state itself: the header username, which the pages fill only after `GET /api/profile` succeeds (CONFIRMED FROM SOURCE INSPECTION), and its continuity across the route change and the reload. The architecture is unchanged: `goto()` resolves at `DOMContentLoaded`, readiness belongs to the caller (Architecture §6.7, §15.2), and no navigation, fixture, timeout or retry change was made. The decision also found a failure-message path in the current portal source for a rejected login (CONFIRMED FROM SOURCE INSPECTION), so `AUTH-010`'s design no longer treats the failure as silent; whether the message renders for the real account is NOT VERIFIED.
- **H1/H2 implementation.** Exactly six files changed. `AppHeader` gained the `username` locator (`#headerUsername`). `LoginModal` gained `loginAndAwaitResponse()`, which submits the form and returns the `POST /api/login` response through `awaitRequestFrom()`; `login()` is unchanged. `AUTH-010` requires `401`, then the portal root and "Login / Register". `AUTH-003` requires the username, then the existing header checks. `AUTH-005` and `AUTH-006` require the same username after the route change and after the reload. Architecture §13.9 and §15.2 and the `AUTH-010` design in `authentication.md` were updated. `tsc` and ESLint clean; 97 tests in 34 files. Gate: PASS — H1/H2 implementation verified.
- **Targeted validation (CONFIRMED FROM EXECUTION).** 2026-10-01 14:21 (UTC+3): the `auth` project with its `setup` dependency, 10 passed (`setup` 1, `auth` 9), 0 failed, 17.1 s.
- **Negative controls (CONFIRMED FROM EXECUTION; one run, from a scratch configuration outside the repository).** The new oracles failed when the state they assert was absent: `AUTH-003`, `AUTH-005` and `AUTH-006` without a session, and `AUTH-005` and `AUTH-006` with the session cookies cleared before the route change or the reload, each at a username assertion; `AUTH-010` with the valid credential failed at the `401` assertion with status `200`. The previous `AUTH-003` and `AUTH-010` assertions passed under the same conditions, which directly demonstrates those two gaps. The previous `AUTH-005` and `AUTH-006` assertions gave no clean demonstration (the page's own redirect aborted a navigation, and the reload's `load` wait caught the redirect), so those two gaps remain INFERRED.
- **Full run (CONFIRMED FROM EXECUTION).** `npx playwright test`, 2026-10-01 14:24:13 → 14:37:36 (UTC+3): **97 passed, 0 failed, 0 flaky, 0 skipped**, `retries: 0`, exit 0, 13.4 min, run locally, once; all 13 projects executed. Repeated-run stability is NOT VERIFIED.
- **Reconciliation (read-only).** CONDITIONAL PASS — documentation corrections identified. The implementation and its documentation agree. The remaining corrections were documentation-only: the latest-run statements, the clean-run count, this record, the `AUTH-010` evidence label, and the scope of Architecture's "no visible login error" statements, now limited to the Pass 1 observation. They are made in this update.

## 18. Publication boundary — 2026-10-01

- **Review (read-only).** A publication boundary review found the repository safe to publish, but its publishable set included the nine Discovery screenshots, contrary to the owner's decision that no screenshots or videos are published in this repository.
- **Decision (owner-approved).** Excluded from the public repository and kept locally: the nine Discovery screenshots (`docs/discovery/screenshots/`) and the portfolio demo and recording harness (`demo/`, `playwright.demo.config.ts`, `playwright.recording.config.ts`). This is an intentional portfolio boundary: the public repository holds the engineering system (configuration, `src/`, `tests/` and the documentation), while portfolio media and the presentation harness stay outside it. Nothing was deleted or moved.
- **Implementation.** `.gitignore` excludes those four paths. The Evidence Log keeps its screenshot references unchanged, with one note on their publication status. README, `.env.example` and Architecture §20.3 no longer describe the demo, the recording or the demo-only `MARKET_USERNAME`. No source, test, fixture or suite-configuration file changed, and the suite inventory is unchanged at 97 tests. Earlier sections that describe the demo, the recording and the screenshots remain historical records.

## 19. Publication and public repository hardening — 2026-10-01

- **Before the first commit (read-only).** A verification of the §17 documentation correction, a release readiness re-confirmation and a further comprehensive project review came before the publication boundary of §18.
- **First commit and publication (CONFIRMED FROM EXECUTION).** The 89 files of the approved boundary were staged by explicit path and checked against it: no demo, recording, screenshot, video, generated artifact, `.env` or authentication state, and no credential or secret in a scan of every staged file. The commit author is the owner's GitHub noreply address, set for this repository only (owner decision). The public repository `Mohamedshaddad487/QACLOUD-Market-UI-Automation` was created empty, and the single commit `b7dff98` was pushed to `main`. A fresh clone matched the 89 files exactly and passed `tsc`, ESLint and the inventory (97 tests in 34 files) without the local-only files.
- **Hardening (owner-approved).** Stale publication, run-history and next-step wording corrected (README, Architecture and Test Design status tables, this file); M1–M9 defined in §17; GitHub topics added; a CI workflow added; the MIT license added, superseding the §13 decision of no license file (`package.json` declares `MIT`, and the stale `ISC` in `package-lock.json` became `MIT`). No source, test, fixture, Page Object or suite-configuration file changed.
- **CI scope.** `.github/workflows/ci.yml` runs `npm ci`, `tsc`, ESLint and the test inventory on Node.js 24, for pushes to `main`, pull requests and manual runs. The browser suite is not run in CI: it needs the real account's credentials, which are not configured as CI secrets, and every run changes that one shared account, so runs must not overlap (Architecture §10.10, §22.6). Architecture §22 keeps the full browser pipeline as design.

## 20. Next steps

1. Open review findings M1–M9 (§17), each to be decided by the owner.
2. Owner: decide what to do with the portfolio walkthrough outside the repository: re-record it, re-edit it, or label it as of 2026-09-29. It shows pre-change code and a 2026-09-28 README.
3. Browser execution in CI (Architecture §22): needs CI credentials for the account and the concurrency control of §22.6. Not implemented.
