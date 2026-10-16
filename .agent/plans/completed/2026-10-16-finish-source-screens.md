# Finish source screen adaptation

## Goal
Complete the unfinished source-inspired Viva, preflight, grading, summary, attempts, results and analytics presentation.
## Context
User requests completing the outstanding adaptation after a direct source comparison. Existing uncommitted changes belong to earlier work and must be preserved.
## Scope
Feature-owned views, existing guarded routes, demo-only interactive grading/session, API monitoring-backed attempt queue and operational report, accurate unavailable evidence states.
## Non-goals
No invented endpoints, provider integration, fabricated production evidence, dependencies, .env changes, commits or pushes.
## Relevant sources
AGENTS.md; docs/product; docs/design/DESIGN_SYSTEM.md, COMPONENTS.md, UI_RULES.md, STATES.md; docs/ROUTES.md; docs/architecture/{ARCHITECTURE,STATE_MANAGEMENT,DATA_FLOW,VIVA_STATE_MACHINE,REALTIME}.md; docs/api/{API_CONTRACT,AI_CONTRACT,WEBSOCKET_EVENTS,ERROR_HANDLING}.md; supplied Downloads/JAVA AIVES source.
## Current behavior
Grading/session/results have older hardcoded presentation; API mode replaces them with generic unavailable screens. Attempt queue and report are placeholders. Monitoring API provides candidate statuses but no scores, transcripts or finalization endpoints.
## Target behavior
Source card/banner/column/table composition across unfinished screens. Protected production data stays authoritative. Missing scoring/realtime data has contextual empty states in the complete screen. Demo actions and evidence are explicitly labelled.
## Architecture constraints
Retain guards, repositories, Query ownership, feature boundaries and existing state tools. Summary remains a tab of grading. No second global state pattern.
## Milestones
1. Inventory source and contracts.
2. Adapt attempts/report, grading/summary and student views.
3. Adapt preflight/session with cleanup, timer and disconnect handling.
4. Regression checks and browser desktop/mobile review.
## Risks
Demo leakage, accidental official score claims, sensitive content, media lifecycle, route duplication, global CSS conflicts.
## Validation
npm run typecheck; npm run lint; npm test; npm run build; git diff --check; targeted UI checks for narrow viewport, keyboard, denied media, missing data and grading validation.
## Definition of done
Outstanding source screens have adapted route compositions, controls accurately reflect supported capability, no introduced validation failures, .env unchanged.
## Progress log
- Read source and current contracts. Grading/results/realtime contracts remain TBD; use existing monitoring only for operational counts and candidate states. Source mock council, telemetry, signatures and grades cannot be treated as backend data.
- Conflict recorded: docs route planning differs from working user-detail/rubric routes; preserve working router per source-of-truth priority.
- Implemented source-style attempt queue and report with shared monitoring/roster caches, source-style grading evidence/rubric columns and summary tab, preflight/slot view, demo Viva reducer, results hub/detail and guarded completion receipt.
- Reused existing route guards and API repositories. Added contextual unavailable states instead of transplanting prototype council, proctoring, signature or grade claims. No .env, dependency or backend changes in this task.
- Verified criterion bounds, demo-only confirmation, API evidence isolation, monitoring cache updates/failure propagation, follow-up/timeout terminal behavior, denied/retried microphone permissions, late permission cleanup, track/context cleanup, speaker confirmation and student result/receipt authority.
- Validation: typecheck passed; 144/144 tests passed in 41 files; lint has only the pre-existing AudioVisualizer warning; build passed with existing bundle-size warning; git diff --check passed. Fixed the pre-existing trailing blank line in question-editor-page.tsx to allow the diff check.
- Desktop browser inspection confirmed the attempt roster and three-column grading composition; no application errors were shown in the inspected console. Corrected filter sizing and criterion inputs affected by existing global .input width. Mobile CSS breakpoints were reviewed, but a mobile browser spot-check remains unverified: native automation repeatedly reported lost active state/capture and did not reliably apply viewport changes. This limitation is recorded in docs/design/STATES.md.
- Implementation complete. Remaining runtime capabilities (grading persistence/release, realtime/STT and signatures) require backend contracts; they are explicit UI capability states, not simulated production implementations.
