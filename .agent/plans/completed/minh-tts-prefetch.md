# Minh TTS latency improvement
## Goal
Use male Minh and reduce wait after clicking listen.
## Context
MP3 synthesis and download currently start only on click.
## Scope
Backend model/config; per-question frontend prefetch and Blob reuse; tests and documentation.
## Non-goals
Change STT, question generation, grading or provider streaming transport.
## Relevant Sources
AGENTS.md; .agent/PLANS.md; docs/architecture/VIVA_STATE_MACHINE.md;
docs/architecture/REALTIME.md; docs/api/WEBSOCKET_EVENTS.md; docs/api/AI_CONTRACT.md;
docs/api/API_CONTRACT.md; docs/api/ERROR_HANDLING.md; src/features/viva-session.
## Current Behavior
Each listen fetches metadata and the MP3; first click waits for provider synthesis.
## Target Behavior
Prefetch on active question arrival, reuse pending/completed audio on listen and replay;
abort and discard on question/user/unmount change. Prefetch failure is retried on listen.
## Architecture Constraints
No global audio cache or provider key in FE. Preserve ready/speaking and recording gates.
## Milestones
Switch model; prefetch lifecycle; regression verification; reload local backend.
## Risks
Initial generation latency remains if listen is clicked before prefetch finishes.
Speculative requests consume provider quota only for the current question.
## Validation
Backend speech tests; frontend typecheck/lint/build and targeted speech tests;
live provider Minh request and local configuration reload.
## Definition of Done
Checks pass; male model active; reuse and cancellation verified; actual limits documented.
## Progress Log
2026-11-07: Implementation added. Validation completed.

2026-11-07: Backend speech suite passed 36/36. Frontend typecheck/build passed;
lint has only three pre-existing ApiInterviewRoom warnings. Four-file speech run passed
22/22; after adding retry/disposal coverage the interview suite passed 9/9 (24 unique
speech tests across the runs). Live Minh call returned HTTP 200 audio/mpeg, 14688 bytes,
in 2.61 seconds for one short sentence; this is provider generation time, not a playback
latency benchmark. Backend API returned 200 and Vite 5174 serves preparedAudio code.
No authenticated browser interview timing was measured. Prefetch cannot remove provider
latency when playback is requested immediately. Completed without changing recording gates.
