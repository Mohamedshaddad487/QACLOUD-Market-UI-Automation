# QACLOUD-Market-UI-Automation

UI test automation for the QACLOUD Market web application (`https://www.qacloud.dev/market.html`), written with Playwright Test and TypeScript. The suite was built from a documented UI discovery of the live application, then designed, implemented and verified feature by feature. All setup, actions and cleanup go through the real UI; the browser's own requests are observed, never called directly. It is a separate project from the QACLOUD Market API automation project and is designed independently of it.

## Scope

- **Features:** Authentication & Session, Product Catalog, Search & Filtering, Product Details, Product Management, Shopping Basket, Checkout / Order Creation, Orders Management and Order Lifecycle, plus cross-feature journeys.
- **Suite:** 97 tests in 34 files across 13 Playwright projects: 96 scenario tests plus the `setup` login step. 103 of the 116 designed scenario IDs are automated; the other 13 are deliberately deferred pending further discovery ([Test Design §11.1](docs/test-design/TEST-DESIGN.md)). `CAT-004`–`CAT-006` are asserted inside the Product Management tests `PM-001` and `PM-017`.
- **Browser:** Chromium (Desktop Chrome device profile).
- **Latest full run:** 2026-10-01, 97 passed, 0 failed, 0 flaky, 0 skipped, `retries: 0`, run locally. Earlier runs, including the failed ones and their analysis, are recorded in the [project history](docs/project-history/PROJECT-HISTORY.md) (§5, §14, §16, §17). Stability across repeated runs is not verified.

## Architecture

- **Page Objects in four layers:** pages (`PortalPage`, `MarketPage`, `ProfilePage`), panels for the Market's tabs (`ProductsPanel`, `BasketPanel`, `OrdersPanel`), repeated components (`ProductCard`, `BasketLine`, `OrderRow`, …) and in-page modals. URL navigation lives only in the page objects.
- **Feature-first tests:** one directory per feature under `tests/`, plus `journeys/`. Each feature is its own Playwright project, and the project dependencies fix the execution order.
- **Fixtures** provide sessions, temporary products and orders, and their cleanup (`src/fixtures/`).
- **Synchronization:** each action waits for the request its own click issues, or for an explicit UI state; there are no fixed sleeps. Page navigation resolves at `DOMContentLoaded`, and readiness is asserted by the caller.
- **No retries:** `retries: 0` everywhere, because the application has confirmed intermittent-looking defects that retries would turn green.

The full design, with its evidence and decisions, is in [Architecture](docs/architecture/ARCHITECTURE.md).

## Authentication

The `setup` project logs in once through the portal's login modal and stores the browser session in `playwright/.auth/user.json` (gitignored). Tests take a session from fixtures: the stored session for most tests, a fresh unauthenticated context for the login and access-control tests, and a disposable session with its own live login for the logout tests and `BSK-010`. Logout invalidates the session server-side, so the logout tests never use the stored session and run serialized in the last project, `auth-session` ([Architecture §8.4](docs/architecture/ARCHITECTURE.md)). Setup records no trace, screenshot or video, because the post-login profile page displays the account's API key.

## Test data and isolation

The suite runs against one dedicated QACLOUD account and shares its single basket and order list. The projects that change that state run on one worker, in dependency order.

- Tests create, order and delete their own uniquely named `AUT-` products, and place and delete their own orders.
- Products, basket lines and fixture-created orders are removed in fixture teardown, which also runs when a test fails. A cleanup that cannot finish fails with `cleanup FAILED` and names what to remove by hand.
- The Checkout tests (`CHK-001`–`CHK-006`) and `JRN-001` place an order in the test body and delete it as that test's last step, so a failure before that step leaves the order in the account, to be deleted through the Orders tab. `JRN-001` records the order number in its report annotations ([Architecture §12.7](docs/architecture/ARCHITECTURE.md)).

Some tests read data that already exists in the account. These are assumptions about that account's data, not requirements of the application, and a different account needs equivalent data:

- `ORD-001`–`ORD-003` and `LIF-003` read the account's Delivered seed order `O62676`, and `ORD-007` expects at least one other order to remain after it deletes its own (the seed order satisfies this);
- `FIL-004` expects a search for "milk" to match at least one product through its hidden Details data rather than its name or category;
- `DET-009` opens the first product card, in catalog order, that shows Low Stock. The card shows Low Stock for stock 1–9 but the details modal only for 1–4, so that product must have stock 5–9 for the scenario's mismatch to appear. In the automation account the only such product is the seed order's, at 9.

## Reporting

Console `list` output and an HTML report (`npx playwright show-report`). Traces, videos and screenshots are kept only for failing tests.

## Continuous integration

[`.github/workflows/ci.yml`](.github/workflows/ci.yml) runs on every push to `main`, on pull requests and on demand. It installs the locked dependencies (`npm ci`) on Node.js 24, then runs the TypeScript check, ESLint and the test inventory (`npx playwright test --list`), which loads the configuration and every spec without opening a browser.

The browser suite is not run in CI. It runs against the live public application with the real credentials of one shared account whose basket, orders and stock it changes, so runs must never overlap, and the application rate-limits repeated logins. No CI credentials are configured. The browser suite is run locally.

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
docs/             discovery, architecture, test design and project history

playwright.config.ts   the 13 projects and their dependency order
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
| `MARKET_EMAIL`, `MARKET_PASSWORD` | regression suite | Login identity of the single Market automation account (required for browser runs) |
| `BASE_URL` | all | Optional, not in the template: defaults to `https://www.qacloud.dev` |

## Running

```bash
npx tsc --noEmit -p .
npm run lint
npx playwright test --list --reporter=list   # inventory
npx playwright test                          # full suite, dependency order as configured
npx playwright show-report
```

A plain `npx playwright test --list` also rewrites `playwright-report/`, because the HTML reporter is configured; `--reporter=list` leaves the last run's report in place.

Before a full run:

- the account's basket should be empty;
- no `AUT-` products should be left in the catalog;
- nothing else should be using the account at the same time, including a second Playwright run: runs share `test-results/`, and a second run clears it.

## Known limitations

- **CI runs static checks only;** the browser suite is run locally (see [Continuous integration](#continuous-integration)).
- **One shared account:** one run at a time. Many logins in a short period have been rate-limited by the application (`429` on `POST /api/login`), so avoid login-heavy runs back to back.
- **Account data dependencies:** see [Test data and isolation](#test-data-and-isolation).
- **Not verified:** stability across repeated runs, and behavior under slow network conditions.
- **Deferred scenarios and open review findings:** 13 scenario IDs are deferred by design ([Test Design §11.1](docs/test-design/TEST-DESIGN.md)); the medium findings of the final project review (M1–M9) are listed with their status in the [project history](docs/project-history/PROJECT-HISTORY.md) §17.

## Documentation

| Document | Contents |
|---|---|
| [`docs/discovery/FEATURE-MAP.md`](docs/discovery/FEATURE-MAP.md) | Features, workflows, UI labels, and the reconciliation evidence registers (`D-01`–`D-46`) |
| [`docs/discovery/EVIDENCE-LOG.md`](docs/discovery/EVIDENCE-LOG.md) | The original discovery evidence (`EV-` IDs; historical, closed at `EV-P2-069`) |
| [`docs/discovery/DISCOVERY-STATE.md`](docs/discovery/DISCOVERY-STATE.md) | Discovery checklists, unknowns and the residual data-state record |
| [`docs/architecture/ARCHITECTURE.md`](docs/architecture/ARCHITECTURE.md) | Framework architecture: object model, fixtures, isolation, synchronization, cleanup, configuration |
| [`docs/test-design/TEST-DESIGN.md`](docs/test-design/TEST-DESIGN.md) | Scenario selection, priorities, coverage matrix and implementation status |
| [`docs/project-history/PROJECT-HISTORY.md`](docs/project-history/PROJECT-HISTORY.md) | Phases, gates, approved decisions and execution evidence |

`src/` and `tests/` carry no comments; design rationale, evidence and known application behavior are documented under `docs/`.

## Portfolio material

The portfolio demo journeys, their recording harness, the Discovery screenshots and the walkthrough video are kept outside this public repository. None of them is part of the regression suite or its 97 tests.

## Stack

Node.js · TypeScript · Playwright Test (Chromium) · ESLint · GitHub Actions

## License

[MIT](LICENSE). The license covers this repository's code and documentation; the QACLOUD Market application under test is a third-party service and is not covered by it.
