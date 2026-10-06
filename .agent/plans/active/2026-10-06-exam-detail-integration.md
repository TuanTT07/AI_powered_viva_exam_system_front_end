# ExecPlan: Exam Detail and Group 2 Integration

## Goal

Implement the lecturer Exam Detail route as a read-only overview and readiness hub for the four existing Group 2 setup areas.

## Steps

1. Add a pure readiness evaluator that composes exam, roster, saved schedule and saved question configuration data using existing validators and canonical statuses.
2. Register the concrete `/lecturer/exams/:examId` route and build an accessible responsive overview with section-level loading/error/retry states and contextual links.
3. Add focused evaluator and route/component tests without changing existing repositories or out-of-scope routes.
4. Update route, registry, state and feature documentation, then run typecheck/lint/tests/build.
5. Start the dev server and complete browser verification of the detail route, setup links, readiness states and responsive layout.
6. Commit as `feat: implement exam detail integration` and push `feature/exam-detail-integration`.

## Constraints

- Readiness is derived, never persisted as a separate flag.
- Existing Exam/Roster/Schedule/Question repositories and validators remain authoritative.
- No publishing, runtime, monitoring, grading or backend integration is added.
- The screen is inferred from STITCH-08 because no dedicated detail frame exists.
