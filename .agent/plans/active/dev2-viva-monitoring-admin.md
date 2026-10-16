# ExecPlan: Dev2 – Viva Session, Monitoring/Evidence, Administration

## 1. Goal
Close the UI and API-integration gaps in the Dev2 scope: AI viva session (item 3), monitoring and evidence (item 5), administration (item 7).

## 2. Context
Audit on 2026-10-16: user/course/role admin and exam monitoring use the real API. The viva room, settings, admin dashboard and exam-success page are static or mock. No recording/transcript/audit/settings UI exists. `API_CONTRACT.md` has no backend endpoints for viva, recordings, audit logs or settings.

## 3. Scope
- Viva room: canonical state machine, device-side TTS/STT, mic/disconnect errors, timer, completion.
- Admin: STT/TTS language config, real settings/dashboard wiring.
- Monitoring: recording playback, Q/A log, score history UI.

## 4. Non-goals
- No direct calls to AI providers from the frontend.
- No local generation of official follow-up/next questions in production paths.
- No inventing backend endpoints; no AI score labelled final.
- No changes to Dev1 features (question bank, exams, grading, reports).

## 5. Relevant Sources
- `docs/architecture/VIVA_STATE_MACHINE.md`, `REALTIME.md`
- `docs/api/API_CONTRACT.md`, `WEBSOCKET_EVENTS.md`, `AI_CONTRACT.md`, `ERROR_HANDLING.md`
- `docs/design/STATES.md`, `UI_RULES.md`, `SCREEN_REGISTRY.md`
- `src/features/viva-session`, `src/features/administration`, `src/features/exams/exam-monitoring-page.tsx`

## 6. Current Behavior
- `VivaInterviewRoom`: hard-coded question, fake typing STT, simulated follow-up, fixed 5 min timer, no error/reconnect states.
- `EquipmentCheckPage`: real `getUserMedia`, no speaker/network check.
- `ExamSuccessPage`: hard-coded student name.
- `SettingsPage`, `AdminDashboardPage`: static, no data, buttons inert.
- Monitoring: status/reset/absent via API only.

## 7. Target Behavior
- Viva uses a reducer with the documented phases; data comes through a repository (mock isolated, API when backend exists).
- TTS reads AI prompts; STT produces partial vs final transcript; no fabricated transcript.
- Language (vi/en) selectable by admin and applied to STT/TTS.
- Evidence pages show recordings, Q/A log and score history with permission, loading, empty and error states.

## 8. Architecture Constraints
- Domain logic in `src/features/viva-session` / `administration`; browser integrations in `src/services/`.
- Repository pattern with `selectRepository(runtimeConfig.dataSource, { mock, api })`; API failures never fall back to mock.
- TanStack Query for server state; one canonical Viva phase (no boolean soup).
- Reuse `components/ui/primitives` and `components/common/states`.

## 9. Milestones
1. **M1 Viva state machine + repository seam.** Reducer with phases, mock session repository isolated, timer, error states (MIC_ERROR, SESSION_DISCONNECTED), completion. Remove inline mock from the page.
2. **M2 Speech services.** `src/services/speech/` TTS (`speechSynthesis`) and STT (`SpeechRecognition`) wrappers; partial vs final transcript; unsupported-browser fallback; wire into M1.
3. **M3 Equipment check + exam success.** Add speaker and network checks; success page reads real attempt/session data.
4. **M4 Language config.** Admin settings tab for vi/en STT/TTS; stored via backend if available, otherwise clearly marked client preference; consumed by M2.
5. **M5 Settings + dashboard wiring.** Remove fake metrics and dead buttons; show real data where an endpoint exists, otherwise explicit "not available" state.
6. **M6 Evidence UI.** Recording playback, Q/A log, score history on monitoring; permission-aware, mock-isolated until backend contract exists.

## 10. Risks
- Backend endpoints for viva/recording/audit/settings are undefined (blocker for API mode in M1, M5, M6).
- `SpeechRecognition` is Chromium-centric; Vietnamese accuracy varies.
- Microphone permission revocation mid-session; timer drift; reconnect race.
- Role leakage on evidence pages (backend remains authoritative).

## 11. Validation
`npm run typecheck`, `npm run lint`, `npm run test`, `npm run build`; manual: mic permission, disconnect/reconnect, timer, transcript states, AI processing, follow-up transition, completion; loading/empty/error/disabled/permission states.

## 12. Definition of Done
Each milestone passes validation, has tests for reducer/services/repositories, introduces no new lint errors, and leaves no hard-coded production data.

## 13. Progress Log
- 2026-10-16: Plan created.
- 2026-10-16: Decision: backend contract for viva/recording/settings is missing; build UI against isolated mock repositories, API mode fails explicitly ("chưa được backend hỗ trợ"), never falls back to mock.
- 2026-10-16: **M1 done.** Added `viva-session-machine.ts` (reducer), `viva-session-repository.ts` (+ mock/api), `viva-speech-adapter.ts` (+ mock, to be replaced in M2), `use-viva-session.ts`; rewrote `VivaInterviewRoom.tsx`; removed the dev "simulate follow-up" button and inline mock. 14 new tests. `COMPLETING` calls `repository.complete()` even after a backend `COMPLETE` turn, so the backend must treat it as idempotent.
