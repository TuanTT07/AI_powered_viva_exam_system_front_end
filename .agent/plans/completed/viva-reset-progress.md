# Clear stale progress when restarting a reset Viva attempt
## Goal
A student starting a reset attempt sees turn one.
## Context
Reset reuses the attempt ID, so the tab can carry old display history.
## Scope
Student session route and restart regression.
## Non-goals
Changing server reset or resume behavior.
## Relevant sources
VIVA_STATE_MACHINE.md, ApiInterviewRoom, InterviewFlow and ExamMonitoringServiceImpl.
## Current behavior
Cached AI prompts inflate the restarted room's turn count.
## Target behavior
Hide old progress while READY and clear it when explicit start succeeds.
## Architecture constraints
Use the server snapshot and existing mutation; retain resume history.
## Milestones
Correct restart handling and test a reset attempt with cached turns.
## Risks
Clearing on mount could erase valid resume history, so clearing is tied to explicit start from READY.
## Validation
Interview flow tests, frontend build and lint.
## Definition of done
Two cached prompts plus a fresh first prompt display one turn.
## Progress log
Implemented restart cleanup and regression coverage.
Verified 10 interview flow tests, build/typecheck and lint with existing warnings.
