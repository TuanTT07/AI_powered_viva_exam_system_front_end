# Question countdown
## 1. Goal
Count each main/follow-up question from server opening, including thinking time.
## 2. Context
Deadline was assigned on recording; expired prompt deadline reset locally.
## 3. Scope
Backend question persistence and frontend countdown, regression checks.
## 4. Non-goals
Change grading or automatically start an entire attempt on page navigation.
## 5. Relevant Sources
VIVA_STATE_MACHINE.md, REALTIME.md, WEBSOCKET_EVENTS.md, AI_CONTRACT.md; interview and viva-session sources.
## 6. Current Behavior
Recording sets deadline; frontend can restart expired countdown.
## 7. Target Behavior
Question creation persists deadline, recording/retry/reload preserves it. Expired countdown stays zero.
## 8. Architecture Constraints
Backend authoritative; retain speech state and existing transport.
## 9. Milestones
Implement server deadline, correct display, verify regressions.
## 10. Risks
Follow-up timeout, reconnect reset, expired prompt capture.
## 11. Validation
FE typecheck/lint/test/build; BE Maven tests/package. Main/follow-up deadline and expiry/remount regressions.
## 12. Definition of Done
Checks pass and unchanged deadline confirmed before recording and on retries.
## 13. Progress Log
Created branches fix/question-countdown-on-open in FE and BE. Implemented deadline persistence and expiry display correction.

Validation: FE 322 tests passed, typecheck/lint/build passed (3 existing lint warnings). BE full suite 105 tests passed with disposable PostgreSQL; added slot-end regression then TranscriptServiceTest and package passed. No deployment performed.

Conflict resolution with origin/main: preserve main's recording-only countdown and answer.discard protocol. Backend opening-deadline change was withdrawn by user. This PR now supplies expired-deadline/remount regression coverage; FE-only opening countdown/expiry blocking is not implemented. Earlier target and validation entries describe the original pre-merge scope.

Post-merge validation: 324 FE tests passed; typecheck/lint/build passed with existing warnings.
