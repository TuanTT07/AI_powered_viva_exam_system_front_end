# Exam Session List

## 1. Goal

Implement the lecturer Exam Session List at `/lecturer/exams` with deterministic feature-level mock data, URL-driven search/filter/pagination, accessible responsive presentation, and registered navigation to create/detail/edit destinations.

## 2. Context

The current main branch has lecturer navigation and route shells but no concrete exam list page. This is the first Functional Group 2 Exams feature and must establish a safe repository/query boundary without pretending to integrate backend exam APIs.

## 3. Scope

- Exam domain types, status labels and deterministic mock repository.
- TanStack Query hooks for exam list and subject options.
- Lecturer exam list page with loading, success, empty, no-results, error/retry, permission and responsive states.
- URL query parameters `q`, `subject`, `status`, `page`, including safe parsing and filter/page synchronization.
- Status-aware table/card rows, pagination and create/detail/edit links.
- Router registration and focused tests/documentation.
- Stitch STITCH-04 visual comparison and browser verification.

## 4. Non-goals

Exam create/edit/detail forms, roster assignment, scheduling mutation, publish/cancel/start/end actions, Viva runtime, realtime/media, grading, backend API integration, and new dependencies.

## 5. Relevant Sources

- `docs/product/FEATURES.md`, `docs/product/ROLES.md`, `docs/product/PERMISSION_MATRIX.md`
- `docs/design/SCREEN_REGISTRY.md` (STITCH-04), `docs/design/STATES.md`, `docs/design/COMPONENTS.md`, `docs/design/DESIGN_SYSTEM.md`, `docs/design/UI_RULES.md`
- `docs/ROUTES.md`, `docs/api/API_CONTRACT.md`, `docs/architecture/STATE_MANAGEMENT.md`, `docs/architecture/DATA_FLOW.md`
- Existing question-bank and learning-material feature repository/query/page patterns
- Stitch project node `49a51fbd8174487d98b6c2335dc8a458`

## 6. Current Behavior

`/lecturer/exams` is a generic placeholder route. Lecturer navigation already exposes the route, while the repository contains shared state primitives and TanStack Query patterns from Question Bank, Learning Materials, and AI Question Generation.

## 7. Target Behavior

The route renders an Exam List page matching the Stitch baseline: heading, summary, search/filter controls, create CTA, semantic desktop table and mobile cards, status text, responsive row actions, URL-driven pagination and explicit state/permission handling. Mock data covers every approved status and multiple pages/subjects/dates.

## 8. Architecture Constraints

- Pages compose features; domain logic stays in `src/features/`.
- Server state uses existing TanStack Query; no second state pattern or dependency.
- No inline JSX data arrays, random values, network calls or fabricated production API data.
- Backend authorization remains authoritative; UI permission guard is only presentation.
- Status labels must remain distinct from backend enum values and never imply unsupported actions.
- Existing unrelated changes must be preserved.

## 9. Milestones

1. Add plan and inspect sources/Stitch.
2. Implement exam types, deterministic repository, query hooks and URL helpers.
3. Implement page, responsive styling, route and docs.
4. Add focused tests and run typecheck/lint/test/build.
5. Start dev server, run browser verification and compare against STITCH-04.
6. Commit exact message and push dedicated branch.

## 10. Risks

- Route ordering could leave `/lecturer/exams` on the placeholder.
- Filter/page URL synchronization can create history loops or invalid-page states.
- Responsive table could lose semantic/accessibility coverage.
- Existing lint warnings and bundle warning must be distinguished from regressions.

## 11. Validation

Run `npm run typecheck`, `npm run lint`, `npm run test`, `npm run build`; run browser verification against the dev server with page/content/overlay/console/interactive checks; manually verify search, filters, reset, pagination, status rows, empty/error and action destinations.

## 12. Definition of Done

Feature is implemented on `feature/exam-session-list`, tests and baseline checks pass (excluding documented pre-existing warnings), browser verification reports no errors, docs/plan are updated, and commit `feat: implement exam session list` is pushed to origin.

## 13. Progress Log

- 2026-10-06: Synced `main` at `503e245`, confirmed previous feature merged, created clean branch `feature/exam-session-list`, baseline checks passed.
- 2026-10-06: Read STITCH-04 DOM reference and confirmed heading, summary filters, create CTA, columns, status/action variants and pagination.
- 2026-10-06: Implemented exam types/repository/hooks, URL-driven responsive list, router registration, focused tests and feature documentation.
- 2026-10-06: Typecheck, lint, 40 tests and build passed; lint remains at the same three pre-existing warnings and build retains the existing chunk-size warning.
- 2026-10-06: Browser verification passed after demo lecturer login: page content, heading, summary, filters, pagination and action links rendered with no error overlay.
