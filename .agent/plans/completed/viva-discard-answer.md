# Retry a Viva answer on the existing connection
## Goal
Discard a recording and return to ready without reconnecting.
## Context
The old retry closes the socket and races its server-side release.
## Scope
Student Viva room, speech protocol and regression checks.
## Non-goals
Change the question sequence or reset deadlines.
## Relevant sources
docs/architecture/VIVA_STATE_MACHINE.md, docs/api/WEBSOCKET_EVENTS.md, speech hook and backend SpeechSessionService.
## Current behavior
Retry closes the connection before the next ticket handshake.
## Target behavior
An acknowledged discard returns to ready; uncertain results preserve receipt recovery.
## Architecture constraints
Backend owns persistence, connection state and deadline.
## Milestones
Add discard protocol, wire UI, verify both repos.
## Risks
Timeout racing discard, late STT events, disconnect before ACK.
## Validation
Frontend build, lint, tests and backend speech tests.
## Definition of done
Retry uses the same socket, never submits discarded audio and keeps the original deadline.
## Progress log
Traced close/reconnect race. Implementing explicit discard acknowledgment.
Implemented and verified: 299 frontend tests, 10 backend speech tests, frontend build/typecheck and lint. Real microphone/provider latency was not measured. Deploy frontend and backend together.
