# Question Import ExecPlan

## Goal
Provide a subject-scoped CSV import dialog inside Question Bank with parsing, validation, partial import, shared mock persistence, and browser-verified accessibility.

## Context
The approved MVP contract resolves the file schema and partial-import decisions previously marked TBD for STITCH-03.

## Scope
CSV template download, file selection/drop, parsing, preview, row validation, confirmation, import result, shared Question Bank repository/query invalidation, documentation, tests, and browser verification.

## Non-goals
XLSX, backend endpoints, AI transformation, inline row editing, cross-bank duplicate detection, RAG, exams, or grading.

## Relevant Sources
`AGENTS.md`, `docs/ROUTES.md`, `docs/design/{SCREEN_REGISTRY,STATES,DESIGN_SYSTEM,COMPONENTS,UI_RULES}.md`, `docs/product/{FEATURES,BUSINESS_RULES}.md`, `src/features/question-bank/`, `src/features/rubrics/`, and STITCH-03 node `167fad4c3ce54fefb6dc8c70879cd3bb`.

## Current Behavior
Question Bank owns an inline mock array and shows a disabled Import label. No parser, shared repository, import dialog, or persistence boundary exists.

## Target Behavior
The Import button opens an accessible dialog. UTF-8 CSV files up to 5 MB and 500 rows are parsed and validated. Valid rows can be imported while invalid rows are skipped. Imported drafts appear only in the active subject's Question Bank.

## Architecture Constraints
Keep import as Question Bank state, use typed feature boundaries and TanStack Query, reuse the rubric repository, preserve route guards, and avoid speculative API contracts.

## Milestones
1. Document approved contract and add parser dependency.
2. Extract shared Question Bank types/repository/query hooks.
3. Implement parser, validation, template, and unit tests.
4. Implement dialog workflow and integration tests.
5. Run full checks and browser/Stitch verification.

## Risks
CSV edge cases, disconnected mock data, stale queries, dialog focus/close behavior, large preview overflow, and subject leakage.

## Validation
`npm run typecheck`, `npm run lint`, `npm run test`, `npm run build`, browser workflow on desktop/narrow viewport, console inspection, and visual comparison with STITCH-03.

## Definition of Done
Approved workflow is implemented and documented, tests/checks pass without new warnings, browser verification passes, branch is committed and pushed.

## Progress Log
- 2026-10-06: Synced `main`, baseline passed, created `feature/question-import`, confirmed approved contract, and inspected STITCH-03 live.
- 2026-10-06: Documented the CSV contract, implemented shared repository/query boundaries, parser, dialog workflow and focused tests.
- 2026-10-06: Browser-verified mixed validation, reset, unsaved confirmation, partial import, Question Bank refresh, imported-question editing, responsive layout, and a clean console.
