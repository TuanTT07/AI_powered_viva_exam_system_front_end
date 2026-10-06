# Exam Question Configuration

## Goal

Implement the approved standalone lecturer route `/lecturer/exams/:examId/questions` for exam-scoped references to approved Question Bank questions.

## Scope

Use the shared Question repository and Exam repository. Support MANUAL exact-count selection, RANDOM_POOL minimum-count selection, subject/status eligibility, URL filters, preview, deterministic auto-fill, save, read-only locked exams, missing-reference warnings, and unsaved navigation protection.

## Non-goals

Per-student allocation, runtime random selection, adaptive follow-ups, publishing, Viva runtime, monitoring, grading, reports, backend APIs, or WebSockets.

## Baseline and branch

Scheduling merged via PR #21. Latest main was fetched and fast-forwarded to `e31506ace72d7e4434a87094efc6e924b37a013a`; local main matched origin/main. Baseline passed with 3 pre-existing lint warnings. Branch base is `e31506ace72d7e4434a87094efc6e924b37a013a` on `feature/exam-question-config`.

## Milestones

1. [x] Register route/docs/states and route builders.
2. [x] Extend shared question/exam repositories, types, validation and query hooks.
3. [x] Implement configuration UI, filters, preview, save/read-only/unsaved states.
4. [x] Add focused tests and browser verification.
5. [ ] Final checks, commit, and push.

## Visual reference

No dedicated Stitch Question Configuration frame is registered. INF-13 is inferred from the approved route and uses STITCH-08 as the nearest Exam Setup visual reference.
