# UI Audit Remediation

## Goal
Resolve the defects found by the mock-mode UI audit so all tested role workspaces have usable mobile navigation, safe invalid routes, accessible settings cards, and a compiling shared unavailable-state component.

## Context
The 2026-10-19 mock audit reported four UI failures: mobile navigation did not visibly open for lecturer and student, an invalid student exam route surfaced a TanStack Query implementation error, and Admin Settings had six serious contrast violations. A malformed import in a shared component also blocks static checks.

## Scope
- Repair responsive workspace drawer state and its test coverage.
- Normalize missing exams at the query boundary and render the existing not-found state.
- Raise contrast for Admin Settings content.
- Correct the malformed shared-component import.

## Non-goals
- No changes to API contracts, authentication, domain data, or navigation structure.
- Do not commit the user's `.env` mock-mode choice or generated UI reports.

## Relevant Sources
- `docs/design/UI_RULES.md`, `docs/design/STATES.md`
- `docs/architecture/ARCHITECTURE.md`, `docs/architecture/STATE_MANAGEMENT.md`
- `src/app/layouts/`, `src/features/exams/`, `src/features/administration/`, `src/components/common/`

## Current Behavior
Mobile CSS presents the menu trigger, but the drawer was not observable after activation. Missing mock exam records return `undefined` from a query function, which TanStack Query treats as an error. Settings uses low-contrast foreground colors on tinted surfaces.

## Target Behavior
On screens up to 767px, the menu trigger opens an accessible drawer and Escape/close restores focus. Missing exam IDs show the app's safe not-found UI without a query error. Settings meets Axe contrast checks. Static validation compiles.

## Architecture Constraints
Keep layout state local, preserve existing React Query and route patterns, and use the shared error state rather than exposing transport details.

## Milestones
1. Fix the query/component source defects and contrast tokens.
2. Make drawer state deterministic across viewport changes and add focused regression coverage.
3. Run static checks, test suite, build, and direct mock-mode verification.

## Risks
- Mobile viewport behavior can differ between browser emulation and CSS media queries.
- Null normalization must not mask real transport errors.

## Validation
`npm run typecheck`, `npm run lint`, `npm run test`, `npm run build`; verify lecturer/student drawer, invalid student exam route, and Admin Settings with the mock runtime.

## Definition of Done
The four reported UI failures and malformed import are fixed, relevant checks pass, and direct route verification succeeds.

## Progress Log
- 2026-10-19: Created after reviewing the mock-mode UI audit findings and affected sources.
- 2026-10-19: Added deterministic viewport initialization and conditional `inert` attributes to the workspace drawer; covered trigger and Escape behavior in `workspace-menu.test.tsx`.
- 2026-10-19: Normalized missing exam records to `null` at the React Query boundary, raised the six low-contrast Admin Settings foreground tokens, and corrected the malformed shared import.
- 2026-10-19: Verified mock Student and Lecturer menus at 375px, verified `/student/exams/not-real` renders the safe not-found state without console errors, and opened Admin Settings with the updated styles. `typecheck`, `lint`, 199 tests, and production build pass.
