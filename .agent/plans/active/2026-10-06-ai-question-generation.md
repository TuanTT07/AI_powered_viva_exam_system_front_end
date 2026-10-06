# AI Question Generation and Review

## Goal

Provide the lecturer route `/lecturer/subjects/:subjectId/questions/generate` with a subject-scoped configuration form, deterministic mock generation, editable/selectable review batch, and save-as-draft integration with the existing Question Bank repository.

## Scope and non-goals

The feature supports READY material selection (1–5), topic, Bloom, count (1–10), Vietnamese/English, optional rubric, review/edit/select, and atomic save as drafts. It does not call AI/RAG/backend services, parse documents, stream, cite, or change Viva/Exam behavior.

## Sources and architecture

- Registered route and STITCH-15 `c751422c2b524ab79b1ce88993b8c2ac`.
- Existing question/material/rubric typed repositories and TanStack Query keys.
- `docs/design/STATES.md`, `docs/design/UI_RULES.md`, `docs/api/AI_CONTRACT.md`.

Domain types, deterministic mock generator, validation, hooks, mapping and review UI live under `src/features/ai-question-generation/`. Existing material/topic/rubric/question repositories remain the shared boundaries.

## Validation

Run typecheck, lint (record 3 pre-existing Viva/Rubric warnings), full tests, build, browser route/status/edit/save checks, console check and live STITCH-15 comparison.

## Progress Log

- 2026-10-06: Confirmed Course Materials merged in `main` at `01d1832`; baseline 31 tests pass and branch `feature/ai-question-generation` created. Inspected route/docs and current repositories; live STITCH-15 is the approved generated-question review workspace.
