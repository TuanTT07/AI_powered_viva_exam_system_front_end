# Exam Scheduling and Time Slots

## Goal

Implement the approved standalone lecturer route `/lecturer/exams/:examId/schedule` for deterministic sequential time-slot generation, roster assignment, validation, local drafts, save/regenerate, and read-only locked exams.

## Scope and non-goals

Use the shared Exam/Roster mock repository and TanStack Query. Support break minutes 0–30, `ROSTER_ORDER` and `UNASSIGNED`, duplicate/overlap/membership validation, unsaved navigation protection, and responsive accessible UI. Do not implement question allocation, publishing, runtime, monitoring, grading, reports, calendar, notifications, or backend APIs.

## Authoritative route/design decision

The user explicitly approved `/lecturer/exams/:examId/schedule` as a standalone route and requested INF-12 registration. No dedicated Stitch Scheduling frame exists; STITCH-08 is the nearest visual reference and is documented as an inferred reference.

## Baseline and branch

Student Roster is merged via PR #20. Latest main was fetched and fast-forwarded to `da1364484138fc5cfcc341fff3771ebcd801441a`; local main matched origin/main. Baseline passed with 3 pre-existing lint warnings. Branch base is `da1364484138fc5cfcc341fff3771ebcd801441a` on `feature/exam-scheduling`.

## Milestones

1. [x] Register route/docs/states and shared route builders.
2. [x] Add typed schedule model, pure slot generation, validation, repository persistence, and query hooks.
3. [x] Implement responsive scheduling page, assignment controls, dialogs, empty/read-only/error states, and roster navigation.
4. [x] Add focused tests and run browser/Stitch verification.
5. [ ] Final checks, commit, and push.

## Risks

- Saved schedules are frontend mock persistence and intentionally deterministic.
- Roster changes are not auto-regenerated; current saved slots remain and membership validation exposes review needs.
- The nearest visual reference is STITCH-08 rather than a dedicated schedule frame.
