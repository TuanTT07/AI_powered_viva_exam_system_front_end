# Deepgram female question audio
## Goal
Play backend-generated Vietnamese female audio in the student viva room.
## Context
User requested Deepgram instead of browser-installed voices.
## Scope
Speech REST audio integration, media lifecycle, protocol metadata, regression tests.
## Non-goals
Change interview orchestration, STT recording or grading.
## Relevant Sources
AGENTS.md; docs/architecture/VIVA_STATE_MACHINE.md; docs/architecture/REALTIME.md;
docs/api/WEBSOCKET_EVENTS.md; docs/api/AI_CONTRACT.md; docs/api/API_CONTRACT.md;
docs/api/ERROR_HANDLING.md; src/features/viva-session; src/services/media.
## Current Behavior
Browser SpeechSynthesis required a locally installed Vietnamese voice.
## Target Behavior
POST authorized question audio, GET MP3 with JWT, play with cancellation and URL cleanup.
## Architecture Constraints
Provider calls remain backend-only. Preserve speaking/ready and answer save state machine.
## Milestones
Implement provider and frontend transport; verify cancellation, errors and interview regressions.
## Risks
Vietnamese Flux is Early Access; live access and pronunciation require a real account test.
## Validation
npm run typecheck; npm run lint; npm run test; npm run build; backend Maven tests.
## Definition of Done
Automated checks pass; audio has no browser voice dependency; remaining live checks documented.
## Progress Log
2026-11-07: Integrated backend MP3 transport and cancellable playback. Validation complete.

2026-11-07 validation: backend speech suite 36/36 passed. Frontend typecheck and build passed;
lint has three existing ApiInterviewRoom warnings, no errors. Full suite 287/288 passed with
an unrelated grading loading-state timeout; the five-file targeted rerun, including that grading
test and all changed speech tests, passed 25/25. Earlier appeal timeout also passed on rerun.
Live Deepgram call returned HTTP 200, audio/mpeg, 17136 bytes for female flux-hoa-vi.
No authenticated browser exam was exercised; microphone, responsive and keyboard behavior
retain the existing UI implementation and require a live student attempt for end-to-end QA.
Decision: replace browser provider metadata with deepgram in REST/WS and deploy both repos together.
