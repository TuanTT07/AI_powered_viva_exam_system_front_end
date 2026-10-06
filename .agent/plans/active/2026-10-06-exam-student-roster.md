# Exam Student Roster

## Goal

Implement the lecturer exam student roster at `/lecturer/exams/:examId/students` with scoped viewing, searching, manual add, CSV preview/partial import, and confirmed removal.

## Scope

- Reuse the existing Exam repository, TanStack Query keys, lecturer guard, UI primitives, and mock persistence.
- Support editable `DRAFT`/`SCHEDULED` exams and read-only `IN_PROGRESS`/`COMPLETED`/`CANCELLED` exams.
- Keep roster data scoped by `examId` and synchronize `ExamSession.studentCount`.
- Add focused validation/parser/repository/page tests and browser/Stitch verification.

## Non-goals

Scheduling, question allocation, publishing, runtime/Viva, attendance, grading, media/WebSocket, backend student accounts, invitations, or deployment.

## Sources and constraints

- Product and architecture rules in `AGENTS.md` and existing repository behavior.
- Route registry: `docs/ROUTES.md`, `docs/design/SCREEN_REGISTRY.md` (INF-11, STITCH-08 partial).
- Existing exam editor/repository/hooks and question import Papa Parse patterns.
- CSV: UTF-8/BOM, exact required headers `student_code`, `full_name`, `email`, max 5 MB and 500 data rows; unknown columns ignored; blank trailing rows ignored.

## Current state

Exam Editor is merged into `main`; branch was based on fetched `origin/main` at `cfb90a72d6799b4a9f69a7aa279f138c431a28a8`. Baseline checks passed with three pre-existing lint warnings.

## Implementation milestones

1. Extend shared exam repository/types with deterministic scoped roster records and count synchronization.
2. Add manual validation, CSV parser/row validation, query hooks, and focused unit tests.
3. Build roster page/dialogs/responsive states and register the concrete route/list entry point.
4. Update focused docs/registry, run typecheck/lint/tests/build, verify with browser and direct Stitch comparison.
5. Commit and push `feat: implement exam student roster` to `feature/exam-student-roster`.

## Risks and mitigations

- Existing exam list counts are aggregate seed values; roster seed records remain representative while all mutations adjust the shared count.
- Generic route currently catches the roster path; register the concrete route before the generic exam detail route.
- CSV parser must preserve row numbers and quoted fields; reuse installed `papaparse`.
- Read-only enforcement is implemented in the repository as well as hidden/disabled UI actions.

## Definition of done

All requested roster states and mutations are implemented and scoped, existing routes remain accessible, focused and existing tests pass, browser verification has no overlay/console errors, the registered Stitch reference was inspected, and the feature is committed/pushed without merging.

## Progress

- [x] Latest main sync and dedicated branch
- [x] Repository/types/hooks
- [x] Validation/CSV
- [x] UI/route
- [x] Tests/docs
- [x] Browser/Stitch verification
- [ ] Commit/push
