# QACLOUD-Market-UI-Automation

UI test automation for the QACLOUD Market web application (`https://www.qacloud.dev/market.html`), written with Playwright Test and TypeScript. It is a separate project from the QACLOUD Market API automation project, and is designed independently of it: all setup, actions and cleanup go through the real UI.

## Status

- **Scope implemented:** 9 features plus cross-feature journeys, derived from a documented UI discovery. See [`docs/`](docs/).
- **Suite:** 97 tests in 34 files across 13 Playwright projects (96 scenario tests plus the `setup` login step). 103 of the 116 designed scenarios are automated; the other 13 are deliberately deferred pending further discovery ([Test Design §11.1](docs/test-design/TEST-DESIGN.md)). `CAT-004`–`CAT-006` are asserted inside the Product Management tests `PM-001` and `PM-017`.
- **Last full run:** 2026-10-01 at 14:24 (UTC+3), on the single Market automation account: 97 passed, 0 failed, 0 flaky, 0 skipped, `retries: 0`, exit 0, 13.4 min, all 13 projects executed, run locally ([project history](docs/project-history/PROJECT-HISTORY.md) §17).
- **Run history and limits:** nine clean full runs are confirmed from execution (plus one reported by the owner), and two full runs failed on 2026-09-27: one because a second, concurrent Playwright run cleared the shared `test-results/` folder (run one suite at a time), and one on a timing race in the previous design of `FIL-021`, which has since been redefined around the settled Clear Filters workflow; the race is kept on record as a historical observation, not a confirmed defect. Stability across repeated runs is not verified. A third full run failed on 2026-09-30 because the application rate-limited logins (`429` on `POST /api/login`, after many logins to the account in a short time); the unchanged suite passed 97/97 once logins had paused, so avoid login-heavy runs back to back. Two more full runs failed on 2026-09-30 after the environment variable rename: at 20:52 (40 passed, 2 failed, 55 did not run) and at 21:06 (75 passed, 2 failed, 20 did not run). In both, authentication tests (`AUTH-001`/`AUTH-002`, then `AUTH-011`/`AUTH-012`) timed out while `page.goto()` waited for the browser `load` event of the portal page `/`; the first run's other failure, `CAT-002`, timed out waiting for the first product card after navigation had completed, and its cause is not verified. Page Object navigation now resolves at `DOMContentLoaded` (Architecture §6.7), which removed the confirmed `load`-wait failure mode, and the suite subsequently passed 97/97. The slow-image condition behind those failures was not reproduced, so resilience to it is not verified.
- **Reporting:** console `list` output and an HTML report (`npx playwright show-report`); traces, videos and screenshots are kept only for failing tests.
- **Not yet in place:** CI. No CI is currently configured; the suite has been run locally only.
- **Code style:** `src/` and `tests/` carry no comments; design rationale, evidence and known application behavior are documented under [`docs/`](docs/).

## Documentation

| Document | Contents |
|---|---|
| [`docs/discovery/FEATURE-MAP.md`](docs/discovery/FEATURE-MAP.md) | Features, workflows, UI labels, and the reconciliation evidence registers (`D-01`–`D-46`) |
| [`docs/discovery/EVIDENCE-LOG.md`](docs/discovery/EVIDENCE-LOG.md) | The original discovery evidence (`EV-` IDs; historical, closed at `EV-P2-069`) |
| [`docs/discovery/DISCOVERY-STATE.md`](docs/discovery/DISCOVERY-STATE.md) | Discovery checklists, unknowns and the residual data-state record |
| [`docs/architecture/ARCHITECTURE.md`](docs/architecture/ARCHITECTURE.md) | Framework architecture: object model, fixtures, isolation, synchronization, cleanup, configuration |
| [`docs/test-design/TEST-DESIGN.md`](docs/test-design/TEST-DESIGN.md) | Scenario selection, priorities, coverage matrix and implementation status |
| [`docs/project-history/PROJECT-HISTORY.md`](docs/project-history/PROJECT-HISTORY.md) | Phases, gates, approved decisions and execution evidence |

## Layout

```text
src/pages/        PortalPage, MarketPage, ProfilePage
src/panels/       ProductsPanel, BasketPanel, OrdersPanel (tabs inside /market.html)
src/components/   repeated UI structures (ProductCard, BasketLine, OrderRow, …)
src/modals/       in-page modals (ProductFormModal, OrderConfirmationModal, …)
src/fixtures/     base test + Basket / Orders fixture extensions
src/data/         reference constants and the unique AUT- product builder
src/support/      env, native dialogs, failure evidence, request predicates
tests/            one directory per feature, plus journeys/ and auth.setup.ts

playwright.config.ts            the regression suite (tests/)
```

## Setup

Requires Node.js (the project was run on Node 24) and a QACLOUD account that the suite may use exclusively while it runs.

```bash
npm install
npx playwright install chromium
cp .env.example .env    # fill in the values below — never commit .env
```

| Variable | Used by | Notes |
|---|---|---|
| `MARKET_EMAIL`, `MARKET_PASSWORD` | regression suite | Login identity of the single Market automation account (required) |
| `BASE_URL` | all | Optional, not in the template: defaults to `https://www.qacloud.dev` |

## Running

```bash
npx tsc --noEmit -p .
npx eslint .
npx playwright test --list --reporter=list   # inventory
npx playwright test                          # full suite, dependency order as configured
npx playwright show-report
```

A plain `npx playwright test --list` also rewrites `playwright-report/`, because the HTML reporter is configured; `--reporter=list` leaves the last run's report in place.

The suite creates, orders and deletes its own uniquely named `AUT-` products, and places and deletes its own orders. It shares one account-wide basket and order list, which is why the stateful projects run on a single worker. Before a full run:

- the account's basket should be empty;
- no `AUT-` products should be left in the catalog;
- nothing else should be using the account at the same time.

### Test-data dependencies

Some tests read data that already exists in the regression account. These are assumptions about that account's data, not requirements of the application, and a different account needs equivalent data:

- `ORD-001`–`ORD-003` and `LIF-003` read the account's Delivered seed order `O62676`, and `ORD-007` expects at least one other order to remain after it deletes its own (the seed order satisfies this);
- `FIL-004` expects a search for "milk" to match at least one product through its hidden Details data rather than its name or category;
- `DET-009` opens the first product card, in catalog order, that shows Low Stock. The card shows Low Stock for stock 1–9 but the details modal only for 1–4, so that product must have stock 5–9 for the scenario's mismatch to appear. In the automation account the only such product is the seed order's, at 9.

### Cleanup

Products, basket lines and fixture-created orders are removed in fixture teardown, which also runs when a test fails; a cleanup that cannot finish fails with `cleanup FAILED` and names what to remove by hand. The Checkout tests (`CHK-001`–`CHK-006`) and `JRN-001` are the exception: they place an order in the test body and delete it as that test's last step, so a failure before that step leaves the order in the account, to be deleted through the Orders tab. `JRN-001` records the order number in its report annotations ([Architecture §12.7](docs/architecture/ARCHITECTURE.md)).

## Portfolio material

The portfolio demo journeys, their recording harness, the Discovery screenshots and the walkthrough video are kept outside this public repository. None of them is part of the regression suite or its 97 tests.

## Stack

Node.js · TypeScript · Playwright Test (Chromium) · ESLint
