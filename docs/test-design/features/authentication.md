# Feature: Authentication & Session

[← Back to Test Design master](../TEST-DESIGN.md)

## Feature Overview

**Purpose:** Establish and maintain the authenticated identity that every other Market feature depends on. Governs login, logout, session persistence, and the boundary between the public portal and the protected Market app ecosystem.

**Business scope:** Login with an existing, verified account; authenticated-state UI indicators; session persistence across navigation and reload; logout; protected-route access control before login, after logout, and never-authenticated.

**Authentication:** N/A for this feature itself — this *is* the authentication boundary every other feature depends on.

**Entry point:** Portal root `/` — "Login / Register" button, opening a modal with "Login" and "Register" tabs. Post-login destination: `/profile.html`.

**Dependencies:** None — foundational. All eight other features are gated behind this one.

## Coverage Scope

Covered: valid login with the project's real account, authenticated destination and UI indicators, session persistence (navigation + reload), logout, post-logout protected-route re-gating, unauthenticated protected-route access, and login rejection with incorrect credentials.

**Explicitly out of scope for this Test Design:** registration and email verification. The project's account is a pre-existing, already-verified account supplied directly by the user (`EV-P1-014`); the registration/verification workflow was explored structurally in Pass 1 but was never a functional objective, and this project does not have an email-verification mechanism to automate against. Any future decision to cover registration is a scope change requiring its own Test Design update, not an omission here.

Also out of scope: "Forgot Password" submission (structure only was confirmed, `EV-P1-006`; submission was deliberately never attempted — see `U-103`), and the `/profile.html` "Change Password" / "Copy API Key" controls (never exercised in Discovery beyond visual confirmation of their presence, `EV-P1-014`).

## Preconditions

- A real, verified QACLOUD account exists and its credentials are available via the project's git-ignored `.env` (per Architecture §8.6 / §20.3). No scenario in this file ever names, logs, or asserts on the actual credential values.
- The target application is reachable at the confirmed base URL.

## Test Data Requirements

| Kind | Detail |
|---|---|
| **Existing/seed data** | The one Market automation account (`MARKET_EMAIL` + `MARKET_PASSWORD` from `.env`). This is the project's only account — there is no second account to test cross-account behavior with (`U-006`, `U-217`, noted in the Feature Map, are out of scope here for the same reason). |
| **Temporary/generated data** | None — this feature creates no persistent application data. |
| **Ownership** | The account itself is the one already in use throughout this project; no scenario here creates, modifies, or deletes account data. |
| **Cleanup requirement** | None for most scenarios (login/logout leave no residual data). The one exception is noted on AUTH-010 below (a session-invalidating scenario must not be allowed to affect a shared/reused session — see Architecture §8.4 for the isolation rule this scenario must respect at implementation time). |

## Scenarios

### Positive

#### `AUTH-001 — Valid login with correct credentials succeeds`
- **Type:** Positive
- **Priority:** P0
- **Purpose:** Confirms the single most foundational capability in the application — without it, no other feature is reachable.
- **Preconditions:** Unauthenticated browser state; the real account's credentials are available.
- **Test Data:** The project account's username/email + password from `.env`.
- **Steps:** Open the portal root. Open "Login / Register" → "Login" tab. Enter "Username or Email" and "Password". Submit "Login".
- **Expected Outcome:** Login succeeds; the browser ends on `/profile.html`.
- **Business Assertions:** The authenticated destination is reached; no error state is shown.
- **Persistence / State Assertions:** N/A for this scenario (covered separately by AUTH-005/006).
- **Cleanup:** None required — logging in creates no persistent data.
- **Dependencies:** None.
- **Traceability:** Feature Map → Authentication & Session → Main Workflows ("Login"). Evidence: `EV-P1-014`.
- **Notes / Known Limitations:** None.

#### `AUTH-002 — Successful login redirects to the authenticated destination`
- **Type:** Positive
- **Priority:** P1
- **Purpose:** Confirms the specific post-login destination is `/profile.html`, not the portal root or the Market app directly — a concrete, checkable navigation contract.
- **Preconditions:** Same as AUTH-001.
- **Test Data:** Same as AUTH-001.
- **Steps:** Same as AUTH-001.
- **Expected Outcome:** The page title/route corresponds to `/profile.html` ("My Profile | qacloud").
- **Business Assertions:** Route/title matches the confirmed post-login destination.
- **Persistence / State Assertions:** N/A.
- **Cleanup:** None.
- **Dependencies:** None.
- **Traceability:** Feature Map → Authentication & Session → Entry Point. Evidence: `EV-P1-014`.
- **Notes / Known Limitations:** May be merged with AUTH-001 at implementation time as a single assertion set on one login action (Architecture §9's `authenticatedPage` fixture likely performs this exact check once, during storage-state verification — Architecture §8.2's "mandatory first implementation step"). Kept as a distinct design scenario here because it verifies a distinct business fact.

#### `AUTH-003 — Authenticated UI indicators replace the logged-out header state`
- **Type:** Positive
- **Priority:** P1
- **Purpose:** Confirms the user-visible signal that login succeeded — the header's username + "Logout" button replacing "Login / Register".
- **Preconditions:** Successfully logged in (AUTH-001).
- **Test Data:** Same as AUTH-001; the displayed username is read from the UI, never hardcoded from a credential value.
- **Steps:** After login, inspect the header.
- **Expected Outcome:** Header shows the account's username and a "Logout" button; "Login / Register" is no longer present.
- **Business Assertions:** Authenticated header state is present; unauthenticated header state is absent.
- **Persistence / State Assertions:** N/A.
- **Cleanup:** None.
- **Dependencies:** AUTH-001.
- **Traceability:** Feature Map → Authentication & Session → Entry Point / State Changes. Evidence: `EV-P1-014`.
- **Notes / Known Limitations:** None.

#### `AUTH-004 — Authenticated user can access the protected Market application`
- **Type:** Positive
- **Priority:** P0
- **Purpose:** Confirms the entire rest of the suite's precondition: an authenticated session actually unlocks `/market.html`, not just `/profile.html`.
- **Preconditions:** Successfully logged in.
- **Test Data:** None additional.
- **Steps:** Navigate directly to `/market.html`.
- **Expected Outcome:** The Market shell loads with real catalog data (not a stuck "Loading products..." / all-zero state) and no redirect occurs.
- **Business Assertions:** The Products panel populates with real product count.
- **Persistence / State Assertions:** N/A (see AUTH-005 for persistence).
- **Cleanup:** None.
- **Dependencies:** AUTH-001.
- **Traceability:** Feature Map → Product Catalog → Authentication Requirement. Evidence: `EV-P1-015`.
- **Notes / Known Limitations:** This scenario is the shared precondition every other feature file assumes; it is designed once here rather than re-verified in every other file.

### Persistence

#### `AUTH-005 — Session persists across navigation to another protected route`
- **Type:** Persistence
- **Priority:** P1
- **Purpose:** Confirms the session is not tied to a single page load — a real, common usage pattern (moving between Market and Profile).
- **Preconditions:** Successfully logged in.
- **Test Data:** None additional.
- **Steps:** From `/profile.html`, navigate to `/market.html`.
- **Expected Outcome:** No re-authentication is required; the Market shell loads authenticated.
- **Business Assertions:** Authenticated state (per AUTH-003's indicators) is unchanged after navigation.
- **Persistence / State Assertions:** Session survives a route change.
- **Cleanup:** None.
- **Dependencies:** AUTH-001.
- **Traceability:** Feature Map → Authentication & Session → Persistence. Evidence: `EV-P1-015`.
- **Notes / Known Limitations:** None.

#### `AUTH-006 — Session persists across a full page reload`
- **Type:** Persistence
- **Priority:** P1
- **Purpose:** Confirms the session is maintained server-side (cookie/token), not merely held in in-page JavaScript state — the distinction that makes storage-state-based automation viable at all (Architecture §8.2).
- **Preconditions:** Successfully logged in, on `/market.html`.
- **Test Data:** None additional.
- **Steps:** Reload the current page.
- **Expected Outcome:** No re-authentication is required; the page reloads in an authenticated state.
- **Business Assertions:** Authenticated state is unchanged after reload.
- **Persistence / State Assertions:** Session survives a full reload.
- **Cleanup:** None.
- **Dependencies:** AUTH-001.
- **Traceability:** Feature Map → Authentication & Session → Persistence. Evidence: `EV-P1-016`. Architecture: §8.2 (this exact fact is what justifies the storage-state strategy).
- **Notes / Known Limitations:** None.

### Logout

#### `AUTH-007 — Successful logout redirects to the portal root`
- **Type:** Positive
- **Priority:** P1
- **Purpose:** Confirms the logout control performs a real navigation back to the public portal, not just an in-page state change.
- **Preconditions:** Successfully logged in, on `/profile.html`.
- **Test Data:** None additional.
- **Steps:** Click "Logout".
- **Expected Outcome:** The browser ends on the portal root `/`.
- **Business Assertions:** Route corresponds to `/`.
- **Persistence / State Assertions:** N/A.
- **Cleanup:** None — see the isolation note under AUTH-009.
- **Dependencies:** AUTH-001.
- **Traceability:** Feature Map → Authentication & Session → Main Workflows ("Logout"). Evidence: `EV-P1-017`.
- **Notes / Known Limitations:** **Isolation-critical.** Per Architecture §8.4, this scenario invalidates the session server-side and must run against a *dedicated, disposable* session — never the shared storage-state session every other scenario in the suite depends on.

#### `AUTH-008 — Authenticated header state is replaced by the logged-out state after logout`
- **Type:** Positive
- **Priority:** P2
- **Purpose:** Confirms the visible logout signal, mirroring AUTH-003 for the opposite transition.
- **Preconditions:** AUTH-007 completed.
- **Test Data:** None additional.
- **Steps:** Inspect the header after logout.
- **Expected Outcome:** Header shows "Login / Register"; username and "Logout" are no longer present.
- **Business Assertions:** Unauthenticated header state is present.
- **Persistence / State Assertions:** N/A.
- **Cleanup:** None.
- **Dependencies:** AUTH-007.
- **Traceability:** Feature Map → Authentication & Session → State Changes. Evidence: `EV-P1-017`.
- **Notes / Known Limitations:** May be combined with AUTH-007 as one scenario's assertion set at implementation time; kept distinct here because it verifies a separate observable fact (UI state vs. navigation).

#### `AUTH-009 — Protected Market route is re-gated after logout`
- **Type:** Negative / Business Rule
- **Priority:** P0
- **Purpose:** Confirms logout is a **real, server-side session invalidation** — not a cosmetic UI change — by proving the same 401-then-redirect gate that applies pre-login also re-applies immediately post-logout.
- **Preconditions:** AUTH-007 completed (logged out).
- **Test Data:** None additional.
- **Steps:** Immediately navigate directly to `/market.html`.
- **Expected Outcome:** The protected route is not accessible; the request is rejected and the browser is redirected back to `/`.
- **Business Assertions:** No catalog data is shown; the route ends on `/`.
- **Persistence / State Assertions:** Confirms the session state genuinely ended, not just the header's presentation.
- **Cleanup:** None.
- **Dependencies:** AUTH-007.
- **Traceability:** Feature Map → Authentication & Session → State Changes. Evidence: `EV-P1-018`. Architecture: §8.4 (logout-isolation rationale).
- **Notes / Known Limitations:** This and AUTH-007 together form the reason Architecture mandates a dedicated, serialized, disposable-session project for any logout-family scenario (§8.4, §19.4) — running this against the shared session would invalidate every other currently-running scenario's authentication.

### Negative

#### `AUTH-010 — Login is rejected with an incorrect password`
- **Type:** Negative
- **Priority:** P1
- **Purpose:** Confirms the application rejects a wrong password for the real account. The scenario asserts neither the presence nor the absence of an on-page error message.
- **Preconditions:** Unauthenticated browser state.
- **Test Data:** The real account's username/email, with a deliberately incorrect password (never logged, never a near-miss of the real value).
- **Steps:** Open the Login tab. Enter the real account's identifier and an incorrect password. Submit.
- **Expected Outcome:** The login request the submission issues, `POST /api/login`, is answered with `401`; the browser remains on the portal root (`/`); the header still shows "Login / Register".
- **Business Assertions:** The `401` response establishes the rejection; no authenticated state is reached (the page stays on `/` and the header still shows "Login / Register").
- **Persistence / State Assertions:** N/A.
- **Cleanup:** None — no session was created.
- **Dependencies:** None.
- **Traceability:** Feature Map → Authentication & Session → Negative / Validation Behavior. Evidence: `EV-P1-012`, `EV-P1-013` (server returns `401 "Invalid username or password"`). **Important limitation, stated transparently:** `EV-P1-012/013` were captured against the project's original, now-abandoned disposable account (`<ABANDONED_TEST_ACCOUNT>`), not the current real account (`<TEST_ACCOUNT_HANDLE>`). The distinguishing HTTP status for bad credentials vs. an unverified account is treated as a general server trait rather than an account-specific one; for the real account, a wrong password received `401` on 2026-10-01, in the targeted `auth` run and in the full-suite run (CONFIRMED FROM EXECUTION; `docs/project-history/PROJECT-HISTORY.md` §17). Pass 1 recorded no visible error after a failed login (`EV-P1-012/013`); the current portal source shows a transient failure message on a rejected login, and whether it renders for the real account is **NOT VERIFIED**. Architecture: never assert "no error appeared" as a *positive* signal (§14.4) — this scenario asserts the absence of an authenticated state, not the absence of an error.
- **Notes / Known Limitations:** Per Architecture §14.4/§16.5, the assertion here is a **positive check that no authenticated state was reached**, not "no error was shown" — the latter would be indistinguishable from success in this application.

#### `AUTH-011 — Unauthenticated direct access to the Market app is denied and redirected`
- **Type:** Negative / Business Rule
- **Priority:** P0
- **Purpose:** Confirms the protected-route gate that every other feature's authentication precondition depends on, from the unauthenticated side.
- **Preconditions:** Unauthenticated browser state (a clean context with no stored session — Architecture §8.3's `unauthenticatedPage`).
- **Test Data:** None.
- **Steps:** Navigate directly to `/market.html` without logging in.
- **Expected Outcome:** Access is denied; the browser is redirected to `/`.
- **Business Assertions:** No catalog data is ever shown; final route is `/`.
- **Persistence / State Assertions:** N/A.
- **Cleanup:** None.
- **Dependencies:** None (must run with a clean, unauthenticated context — Architecture §8.3).
- **Traceability:** Feature Map → Authentication & Session → Authentication Requirement. Evidence: `EV-P0-010`, `EV-P0-011`.
- **Notes / Known Limitations:** None.

#### `AUTH-012 — Unauthenticated direct access to the Profile page is denied and redirected`
- **Type:** Negative / Business Rule
- **Priority:** P2
- **Purpose:** Confirms the same protected-route gate applies to `/profile.html`, not only `/market.html` — proving it is a shared pattern, not a one-off rule on a single route.
- **Preconditions:** Unauthenticated browser state.
- **Test Data:** None.
- **Steps:** Navigate directly to `/profile.html` without logging in.
- **Expected Outcome:** Access is denied; the browser is redirected to `/`.
- **Business Assertions:** Final route is `/`.
- **Persistence / State Assertions:** N/A.
- **Cleanup:** None.
- **Dependencies:** None.
- **Traceability:** Feature Map → Authentication & Session → Authentication Requirement. Evidence: `EV-P1-007`.
- **Notes / Known Limitations:** Lower priority than AUTH-011 because it verifies the *same* gating mechanism on a second route rather than a functionally distinct rule — kept as its own scenario because it is the only evidence that the gate is a shared pattern, not per-route logic (Architecture §24's "controlled abstraction" principle: this is a genuinely different fact, not appearance-driven duplication).

### Exploratory / Deferred Verification

#### `AUTH-013 — [Deferred] Distinct credential-error UI for the currently-used verified account`
- **Type:** Exploratory / Deferred Verification
- **Priority:** P3
- **Purpose:** Records, without asserting, whether a wrong-password attempt against the *specific* account now in use ever produces a different (non-silent) error presentation than has been observed so far.
- **Preconditions:** Unauthenticated browser state.
- **Test Data:** The real account's identifier with an incorrect password.
- **Steps:** Same mechanics as AUTH-010; this scenario differs only in intent — it is a deliberate re-observation, not a duplicate.
- **Expected Outcome:** **Not asserted as a pass/fail contract.** The scenario's purpose is to record what is actually observed (silent failure, matching the general pattern, or something new) so `U-102` can eventually be closed with real evidence.
- **Business Assertions:** None enforced — this is an observation scenario, per §"Not Everything Becomes a Test".
- **Persistence / State Assertions:** N/A.
- **Cleanup:** None.
- **Dependencies:** None.
- **Traceability:** Feature Map → Authentication & Session → Known Unknowns (`U-102`). Evidence basis for the open question: `EV-P1-005`.
- **Notes / Known Limitations:** This scenario is intentionally near-identical in mechanics to AUTH-010. It is retained separately, at low priority, specifically because its *purpose* differs (closing `U-102` vs. confirming a known rejection path) — implementation may reasonably fold it into AUTH-010's observation notes rather than run it as a second full scenario, per Test Design §9's implementation-planning guidance.

#### `AUTH-014 — [Structure only] Forgot Password sub-view is reachable and displays its confirmed static content`
- **Type:** Positive (structure) / Exploratory (behavior)
- **Priority:** P3
- **Purpose:** Confirms the one piece of this sub-flow that Discovery did establish (its static structure), while explicitly not testing submission, which was never attempted and remains `U-103`.
- **Preconditions:** Unauthenticated browser state, Login tab open.
- **Test Data:** None — no email is ever submitted.
- **Steps:** Click "Forgot password?". Read the resulting sub-view. Return via "← Back to Login" without submitting.
- **Expected Outcome:** A client-side sub-view replaces the login form in place (no page navigation) showing "Reset Password", explanatory text, an email field, "Send Reset Link", and "← Back to Login"; returning via the back link restores the Login tab.
- **Business Assertions:** The sub-view's confirmed static labels are present.
- **Persistence / State Assertions:** N/A.
- **Cleanup:** None — no submission occurs.
- **Dependencies:** None.
- **Traceability:** Feature Map → Authentication & Session → Alternate Workflows. Evidence: `EV-P1-006`. Related unknown: `U-103` (submission behavior — explicitly not covered here).
- **Notes / Known Limitations:** Deliberately excludes clicking "Send Reset Link" — per Discovery's own rule against triggering a real password reset, which this Test Design continues to respect.

## Scenario Count

14 scenarios (`AUTH-001`–`AUTH-014`): 4 Positive, 2 Persistence, 3 Logout-related (Positive/Negative/Business Rule), 3 Negative/Business Rule, 2 Exploratory/Deferred.
