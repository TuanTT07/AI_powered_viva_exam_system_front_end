# Publish attempt results once
## Goal
One lecturer action publishes all main-question results for a completed attempt.
## Context
Per-question publication is cumbersome and can leave partial released results.
## Scope
BE atomic manager endpoint; FE confirmation and button; regression tests.
## Non-goals
No automatic grading or changing saved scores. Legacy per-question endpoint retained.
## Relevant sources
AGENTS.md; docs/api/API_CONTRACT.md; UI_RULES.md; grading-workspace-page; BE EvaluationService and attempt/question repositories.
## Current behavior
Each saved question must be published individually.
## Target behavior
Save all question scores then confirm Publish results once. Incomplete/unsaved/loading/error states cannot publish; server validates independently.
## Architecture constraints
Existing transactions, TanStack Query, Dialog; no dependencies. Backend authorization authoritative.
## Milestones
1. BE transaction/locks/validation. 2. FE attempt-level action. 3. Integration and frontend regression checks.
## Risks
Partial publication, reset/concurrent grading, stale query, unsaved notes. Lock attempt then assigned questions; validate all before setting timestamps; invalidate related caches after success.
## Validation
BE full tests with isolated Postgres and package; FE typecheck/lint/test/build; missing grades rollback and idempotent repeated publication tests.
## Definition of done
Atomic publication of all assigned questions proven, FE one confirmation and safe error/pending states, deploy BE before FE documented.
## Progress
- Implementation started on fix/attempt-result-publication in BE and FE.
- Completed: BE full suite103 tests pass using isolated Postgres including atomic failure/success/idempotency; package passes. FE319 tests pass, typecheck/build pass; lint only3 pre-existing viva warnings. Publication panel visible in both workspace and summary. Disposable DB removed. Not deployed or tested with real user accounts.
