# Grading completeness
## Goal
Never present one question score as the complete attempt grade.
## Context
AttemptTable finds one evaluation and trusts local confirmation. Queue ignores missing evaluations.
## Scope
Lecturer queue/summary, paginated evaluation loading, student result completeness, regression tests.
## Non-goals
No invented question IDs, no new weighting contract or backend mutations. No AI provider changes.
## Relevant Sources
AGENTS.md; docs/product/BUSINESS_RULES.md; docs/design/UI_RULES.md; docs/api/API_CONTRACT.md; grading and exams features; BE EvaluationController/EvaluationService main reviewed via GitHub.
## Current Behavior
First evaluation can be displayed as official attempt score. Backend exam evaluation list contains only existing evaluation rows; no lecturer question-attempt listing endpoint.
## Target Behavior
Exact attempt ownership; all pages; complete valid backend-finalized question set required. Normalize each rubric score to /10 and use existing equal-average policy. Unknown or missing expected count is incomplete, never assumed to be one. Keep incomplete attempts in queue.
## Architecture Constraints
Feature-local helpers, existing TanStack Query, backend confirmation authoritative. Do not substitute localStorage for API scores.
## Milestones
1. Aggregation and pagination helpers. 2. Lecturer and student integration. 3. Regression checks and acceptance report.
## Risks
Configured maximum can exceed actual assigned count; without authoritative assigned count, fail closed. BE lacks endpoint for missing evaluation question IDs; FE cannot create those IDs. Existing mapExam defaults maxMainQuestions to one: add explicit optional verified count for aggregation.
## Validation
npm run typecheck; npm run lint; npm run test; npm run build; focused table and aggregation tests. Live signed-in verification requires accounts.
## Definition of Done
Automated tests cover partial/full/invalid/duplicate/cross-attempt/local-cache cases; report clearly records live and backend limitations.
## Progress Log
- Confirmed first-row aggregation and local confirmation bug. Implementing frontend guard; missing backend question list remains a contract limitation.
- Implemented shared aggregation and complete pagination, lecturer queue/table, API confirmation guard, student publication completeness.
- Validation: 312 tests / 75 files pass; typecheck/build pass; lint only existing warnings; diff check clean. Acceptance report: docs/reviews/grading-completeness-acceptance-2026-11-11.md.
- Remaining: actual signed-in two-question verification and backend listing/initialization for question attempts lacking Evaluation. Plan remains active; no claim of complete end-to-end acceptance.
