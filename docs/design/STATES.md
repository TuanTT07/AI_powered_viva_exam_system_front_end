# UI States

Every implemented screen defines the states relevant to its data and actions. A separate Stitch frame is not required for each state, but implementation and tests must account for them.

## Global State Contract

| State | Required presentation / behavior |
|---|---|
| Default / ready | Current data and allowed actions are clear. |
| Initial loading | Use a route/panel skeleton that preserves layout; do not show an unexplained blank page. |
| Skeleton | Match the shape of the content being loaded and avoid false data. |
| Empty | Explain what is absent and provide the next authorized action. |
| Error | Name the failed scope, preserve safe user input and offer an appropriate recovery. |
| Disabled | Explain why when the reason is not obvious; do not rely on color alone. |
| Submitting | Prevent duplicate submission, retain context and expose progress. |
| Success | Show only after backend confirmation; keep the resulting state visible. |
| Unauthorized | Recover authentication without exposing protected content. |
| Forbidden | Explain lack of access and provide a safe destination. |
| Offline | Freeze unsafe actions and identify affected data/actions. |
| Reconnecting | Show ongoing recovery and avoid implying that work is saved. |
| Timeout | Distinguish client/network timeout from domain rejection. |
| Stale session | Stop high-impact actions and require authoritative refresh/re-authentication. |
| Partial data | Label incomplete sections and preserve usable confirmed data. |

## Feature State Coverage

### Learning Materials

- empty library,
- upload idle,
- choosing/dragging a file,
- uploading,
- upload validation error,
- processing/indexing,
- ready,
- processing failed,
- retry pending,
- delete pending/failed,
- unauthorized/forbidden,
- partial list failure.

STITCH-16 represents ready, processing and failed rows in one populated table. It does not cover route loading, empty, upload failure, delete confirmation/failure or permission states.

### AI Question Generation

- configuration,
- generating,
- streamed/partial result only if supported by backend,
- generated drafts,
- no usable drafts,
- citation/source warning,
- generation error,
- editing,
- selecting,
- approving/importing,
- reject/remove pending,
- save/approval error.

STITCH-15 represents generated drafts, a citation warning and an open evidence drawer. It does not represent configuration, generating, empty/no-output, service error or mutation failures.

### Question Import

- file selection,
- uploading/parsing,
- all valid,
- partially valid,
- all invalid,
- import pending,
- import success,
- import error/cancel.

STITCH-03 represents a partially valid preflight result. File schema and partial-import policy remain TBD.

### Exams

Conceptual product states:

- draft,
- scheduled,
- open/ready,
- in progress,
- completed,
- closed,
- cancelled.

Exact backend enums, editability and transition rules remain TBD. UI actions must be derived from backend capabilities/status rather than display labels alone.

### Grading

- attempt loading,
- evidence available,
- transcript/recording unavailable or forbidden,
- AI score pending,
- AI score available,
- AI score error,
- lecturer editing,
- unsaved local changes,
- saving final grade,
- save success,
- save failure with edits preserved,
- 409/stale conflict requiring reconciliation,
- finalized/locked if supported,
- publish pending/success/failure if separate publication exists.

The following must always be semantically distinct:

1. AI suggested score,
2. lecturer local edit,
3. backend-saved lecturer score,
4. lecturer-confirmed final score,
5. student-visible released result.

### Results

- grading pending,
- unreleased,
- released,
- partially available according to policy,
- unavailable/error,
- forbidden.

Do not expose an AI score or unreleased result as official student data.

## Viva Session State Matrix

Only one primary Viva phase is active at a time. Connection/media conditions may accompany the primary phase only when the state model explicitly permits them.

| Phase | Student-facing meaning | Primary action / UI | Allowed next (conceptual) | Stitch coverage |
|---|---|---|---|---|
| `PREPARING` | Loading authoritative attempt and devices | Progress; unsafe actions disabled | `READY` or controlled error | Missing |
| `READY` | Preflight complete; server allows start | Start exam | `AI_SPEAKING`, disconnect | Inferred from STITCH-13; runtime view missing |
| `AI_SPEAKING` | Official prompt is playing/presented | Playback status; recording disabled unless policy says otherwise | `WAITING_FOR_ANSWER`, AI/network error | Missing |
| `WAITING_FOR_ANSWER` | System is ready to accept speech | Start/automatic capture according to policy | `RECORDING`, timeout, disconnect | Missing |
| `RECORDING` | Microphone is capturing the answer | Prominent recording state, timer, stop/submit | `TRANSCRIBING`, mic/timeout/disconnect | Represented in STITCH-05 |
| `TRANSCRIBING` | Final transcript is being resolved | Mark transcript as partial/in-progress | `AI_PROCESSING`, STT/disconnect | Partially represented in STITCH-05; copy currently overlaps recording |
| `AI_PROCESSING` | Backend/AI is evaluating the final transcript | Processing indicator; no fabricated follow-up | `FOLLOW_UP`, `NEXT_QUESTION`, `COMPLETING`, error | Missing |
| `FOLLOW_UP` | Backend-confirmed follow-up is next | Label as AI follow-up and preserve parent question context | `AI_SPEAKING` | Represented in STITCH-05 |
| `NEXT_QUESTION` | Backend confirmed next main question | Transition/progress; no local question selection | `AI_SPEAKING` | Missing |
| `COMPLETING` | Server is sealing/completing the attempt | Prevent new capture; show completion progress | `COMPLETED` or controlled error | Missing |
| `COMPLETED` | Backend confirmed terminal success | Receipt/result-pending explanation | Terminal | Live-only TD-03, not confirmed baseline |

### Recovery / Error Matrix

| State | Required behavior | Exit rule | Stitch coverage |
|---|---|---|---|
| `RECONNECTING` | Freeze unsafe actions, show retry progress, preserve only explicitly local data | Resume only from authoritative snapshot | Missing |
| `SESSION_DISCONNECTED` | Explain loss of session transport and what is/is not confirmed | Reconnect or backend-directed escalation | Missing |
| `NETWORK_ERROR` | Distinguish transport loss from rejected command | Retry/resync according to bounded policy | Missing |
| `MIC_ERROR` | Identify denied/lost/unavailable device | Retry permission/device selection or backend-directed block/escalation | Missing |
| `STT_ERROR` | State that transcription failed; never fabricate text | Backend-defined retry/skip/escalation | Missing |
| `AI_ERROR` | Preserve confirmed evidence and identify failed AI step | Backend-defined retry or escalation | Missing |
| `TIMEOUT` | Explain timer expiry without inventing submission result | Backend determines submit/unanswered/proceed behavior | Missing |

## Viva Invariants

1. Only one primary phase is active.
2. Partial transcript is visibly and programmatically distinct from final transcript.
3. AI processing is not final grading.
4. The next official question and follow-up limit are backend-authoritative.
5. Reconnect resumes from a backend-confirmed snapshot.
6. An answer is not shown as saved until backend confirmation.
7. A completed attempt cannot locally return to recording.
8. Timer expiry, microphone failure and prolonged disconnect policies remain TBD until backend/product confirmation.

## Stitch State Coverage Summary

- **Represented:** populated data, selected filters, several status badges, material processing/failure, import partial validation, AI draft review/citation warning, active recording/partial transcript/follow-up, grading with AI suggestion and lecturer edit, result released/pending.
- **Inferable but not complete:** ready/preflight, AI draft approval, exam publish, grading finalization/publication and completed receipt (live-only).
- **Completely missing from confirmed baseline:** global loading/empty/permission families; Viva preparing, speaking, waiting, AI processing, next question, completing and every recovery/error state.
