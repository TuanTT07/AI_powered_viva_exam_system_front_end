# Exam Editor (Create / Edit)

## 1. Goal

Implement a shared lecturer Exam Editor for `/lecturer/exams/new` and `/lecturer/exams/:examId/edit`, integrated with the existing Exam Session List repository and query cache.

## 2. Context

The Exam Session List is merged into `main` at `origin/main` `a177170`. Its route links already point to create/edit shells, and its typed mock repository is the single source for deterministic exam records. This feature adds configuration-only create/edit behavior without roster, scheduling slots, question allocation or runtime workflows.

## 3. Scope

- Extend `src/features/exams/exam-repository.ts` with get/create/update operations and deterministic controlled failures.
- Add shared form types/defaults/validation for name, subject, start date/time, duration, main questions and follow-ups.
- Add TanStack Query hooks/mutations with targeted list/detail invalidation.
- Add shared create/edit page/form architecture, loading/error/empty/not-found/non-editable states, field errors and pending states.
- Add unsaved browser-exit protection and explicit discard/cancel dialog using existing primitives.
- Wire registered create/edit routes and document the feature.
- Add focused repository, validation and page tests; run browser verification and Stitch comparison.

## 4. Non-goals

Student roster/import, time-slot scheduling, per-student appointments, question selection/allocation, exam detail workspace, monitoring, Viva/WebSocket/media, AI grading, publishing/opening/starting/ending/cancelling actions and backend API integration.

## 5. Relevant Sources

- `docs/ROUTES.md`, `docs/design/SCREEN_REGISTRY.md` (STITCH-08 node `6421e124837441fca29c2cffd5e09a46`), `docs/design/STATES.md`, `docs/design/COMPONENTS.md`, `docs/design/DESIGN_SYSTEM.md`, `docs/design/UI_RULES.md`
- `docs/product/FEATURES.md`, `docs/product/ROLES.md`, `docs/product/PERMISSION_MATRIX.md`
- Existing `src/features/exams/*` list/repository/hooks, question editor and rubric editor form patterns, common states/primitives, lecturer layout/router
- Live Stitch project `https://stitch.withgoogle.com/projects/16463711942931628972`, setup frame for the registered Exam Configuration screen

## 6. Current Behavior

`/lecturer/exams` is implemented and reads deterministic records from `examRepository`. `/lecturer/exams/new`, `/lecturer/exams/:examId`, and `/lecturer/exams/:examId/edit` are still generic placeholders. The repository has list/subjects/summary but no get/create/update mutation boundary.

## 7. Target Behavior

Create opens a clean form with defaults and available lecturer subjects; valid save creates a `DRAFT` record and returns to the list. Edit loads the requested record, preserves id/status, blocks non-editable statuses, validates updates, and returns to the list after targeted cache invalidation. Recoverable failures preserve user input. Unsaved changes warn before exit and support stay/discard.

## 8. Architecture Constraints

- Preserve existing route names and layout/role guards.
- One shared form component and validation boundary for create/edit.
- Feature domain logic remains under `src/features/exams/`.
- TanStack Query owns server-style exam state; no Zustand form state and no broad cache reset.
- No inline mock arrays in pages, random IDs, network calls or fabricated backend endpoints.
- Status enum remains `DRAFT | SCHEDULED | IN_PROGRESS | COMPLETED | CANCELLED`; only DRAFT is created, and only DRAFT/SCHEDULED are editable.
- Preserve unrelated changes and existing lint baseline.

## 9. Milestones

1. Create plan, complete latest-main baseline and inspect Stitch/route/contracts.
2. Extend shared exam repository/types/hooks and add validation tests.
3. Implement shared form, create/edit pages, states, unsaved guard and routes.
4. Add docs and focused tests.
5. Run typecheck/lint/test/build, browser verification and direct Stitch comparison.
6. Commit `feat: implement exam editor` and push `feature/exam-editor`.

## 10. Risks

- In-memory repository mutations must be shared between list and editor without disconnected datasets.
- Date/time parsing must avoid double timezone conversion and reject past create starts.
- Route links and cancel navigation must preserve the registered paths.
- Unsaved navigation protection must not warn on initial load or successful save.
- Non-editable status must never expose an update mutation.

## 11. Validation

Run `npm run typecheck`, `npm run lint`, `npm run test`, `npm run build`; run browser verification for create/edit/validation/navigation/recovery/responsive states; inspect console and error overlays; compare the form with STITCH-08 directly.

## 12. Definition of Done

Create and edit routes use the shared form and repository, all approved validation/state requirements are covered by tests, Exam Session List reflects mutations, baseline warnings are unchanged, browser and Stitch checks pass, docs are updated, and the exact commit is pushed.

## 13. Progress Log

- 2026-10-06: Confirmed previous Exam Session List commit `0cd8e6c` merged into `origin/main` via PR #17; fast-forwarded local `main` to `a177170`; baseline passed; created `feature/exam-editor` at the same base.
- 2026-10-06: Inspected live Stitch project and registered STITCH-08 setup frame. It contains title/subject/start/end/AI/roster sections; this feature intentionally implements only the approved configuration subset.
- 2026-10-06: Extended the shared repository with deterministic get/create/update operations and targeted TanStack Query invalidation; added shared validation and editor form/routes.
- 2026-10-06: Added repository/validation tests; final checks pass with 47 tests and the same three pre-existing lint warnings.
- 2026-10-06: Browser verified create defaults/validation, deterministic draft creation and list visibility, edit load/update/list reflection, unsaved stay/discard, non-editable status, and no error overlay. Directly compared form structure/tokens against live STITCH-08 DOM/frame.
