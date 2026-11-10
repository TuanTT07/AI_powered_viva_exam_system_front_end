# Recover recording retry across Viva question changes
## Goal
Allow a fresh recording after discard on later questions and remove the dedicated receipt lookup button.
## Context
A reused socket was still processing speech events with the first question's storage key.
## Scope
Student speech hook, controls and interview regression coverage.
## Non-goals
Change server deadlines or retry uncertain audio automatically.
## Relevant sources
VIVA_STATE_MACHINE.md, WEBSOCKET_EVENTS.md and the interview integration tests.
## Current behavior
Recovery IDs can be stored under the wrong question, and receipt lookup requires a dedicated action.
## Target behavior
Use the active question key and automatically check uncertain receipts once.
## Architecture constraints
Keep server acknowledgment and receipt lookup authoritative.
## Milestones
Update event routing and UI, then verify later-question discard and recovery.
## Risks
A lost save acknowledgment must not allow a duplicate submission.
## Validation
Interview integration tests, build and lint.
## Definition of done
Retry works on a reused socket and the dedicated lookup button is absent.
## Progress log
Updated event routing and automatic recovery.
Verified 10 interview integration tests, frontend build/typecheck, and lint with existing warnings. Real microphone not exercised.
Follow-up: an unconfirmed discard now reconnects automatically. The replacement socket must be accepted before receipt lookup, and only a confirmed missing receipt permits re-recording. Covered by a regression test for rejected discard; Viva suite passed 53 tests.
Latency follow-up: reuse the validated prompt metadata for same-turn discard recovery and start fallback after 3 seconds without an acknowledgment. Receipt lookup still follows the replacement socket handshake. Regression test asserts playback metadata is fetched only once.
