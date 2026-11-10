# Correct the live Viva turn flow

## Goal
Show real question turns and start the answer countdown only when recording is accepted.

## Context
Student Viva room, /student/exams/:examId/session. The reported attempt showed five turns with two main questions and one follow-up configured.

## Scope
Production interview and speech room progress, answer receipt and deadline; check the sibling backend's enforcement.

## Non-goals
Change grading, demo behavior, or reinterpret the configured follow-up policy.

## Relevant sources
PBL Topics row 2; docs/product/BUSINESS_RULES.md; docs/architecture/VIVA_STATE_MACHINE.md; docs/api/WEBSOCKET_EVENTS.md; viva-session views and backend InterviewFlow and SpeechSessionService. No Stitch change.

## Current behavior
Frontend enlarges its denominator using answer history and starts a local timer when a prompt appears. Backend assigns a deadline at prompt creation.

## Target behavior
Live progress counts server-issued turn IDs. Configured maximum is explicit and separate from observed turns. Timer shows no countdown until answer.started. Backend persists one deadline at accepted answer start and retains it through retries.

## Architecture constraints
Backend owns prompts, deadlines, follow-up policy and completion. Keep current room, query and speech boundaries.

## Milestones
1. Correct frontend timer and progress; only confirmed receipts enter history.
2. Correct backend deadline lifecycle and verify configured limits where workspace permissions permit.
3. Run frontend checks and record remaining deployment verification.

## Risks
Stale history from another attempt, repeated question text, retries resetting deadlines, and legacy deployed API behavior. The sheet mentions both a per-student maximum (group 2) and a per-question maximum (group 3). Current backend applies the latter; 2 + 1 means at most four turns. No live snapshot or transcript verifies the cause of the reported fifth turn.

## Validation
Run npm run typecheck, lint, test and build. Exercise waiting, recording, retries, reconnect, follow-up and completion with integration tests.

## Definition of done
Frontend renders authoritative progress and deadline; backend honors the configured limits and never spends answer time before an accepted start; report any deployment limitations.

## Progress log
Traced both codebases; confirmed prompt creation starts the backend timer and the frontend has a second mount-based timer.

Frontend now counts received AI turn IDs, shows configured limits separately, and waits for confirmed receipts. Removed exam-wide fallback history so a separate attempt cannot inflate progress. Backend saves a deadline at the first accepted recording start and caps it at the scheduled end; an unanswered prompt can still expire when the slot ends.

Verified frontend Viva tests (51), typecheck, lint and build; verified backend speech/access unit tests (19) and PostgreSQL integration tests (10), including the four-turn maximum for 2 + 1 and retry deadline reuse. The reported deployed attempt was not inspected or changed. Deployment must include both apps; verify with a fresh attempt.
Full frontend suite passed on the bounded worker run (299 tests across 71 files).
