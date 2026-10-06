# Data Flow

## Standard CRUD Flow

```text
Page
→ Feature Hook
→ Query/Mutation
→ Shared API Client
→ AIVES Backend
```

Response:

```text
Backend DTO
→ Validation/Mapping if needed
→ Server State Cache
→ Feature View Model
→ UI

## API/mock composition

Feature repositories remain the boundary between pages and data sources. They select either the existing mock repository or a future API repository using the shared runtime `dataSource` and `selectRepository` helper. Components never read `import.meta.env` or call the API client directly. API failures propagate to feature error states; they never fall back to mock data. TanStack Query owns request caching and targeted invalidation, while logout clears the entire query cache.

Question Bank is the first real feature integration: API mode owns raw Spring Page search, UUID validation, DTO mapping, detail, approve and delete. Import, AI generation, exam question configuration and exam readiness remain explicitly mock-backed until their backend contracts exist. API query keys include datasource, course and server filters so mock and API caches cannot mix.
```

## AI Question Generation

```text
Lecturer UI
→ Generation Request
→ AIVES Backend
→ AI Orchestrator / RAG
→ Draft Questions
→ Frontend Draft Review
→ Lecturer Approve/Edit/Reject
→ Backend Question Bank
```

Draft AI output does not become official automatically.

## Viva Answer Flow

```text
Student Microphone
→ Approved Media Capture Path
→ STT path managed by AIVES architecture
→ Partial Transcript Events
→ Final Transcript
→ AI Analysis
→ Follow-up OR Next Question
→ TTS Question/Prompt
→ Student
```

Exact streaming topology is backend-dependent and TBD.

## Grading Flow

```text
Attempt Evidence
+ Rubric
→ AI Scoring Service
→ AI Suggested Score + Feedback
→ Lecturer Review
→ Lecturer Adjustment
→ Final Grade Save
→ Official Result
```

## Reconnect Flow

```text
Client loses realtime connection
→ mark UI reconnecting
→ reconnect transport
→ request/receive authoritative session snapshot
→ reconcile local temporary state
→ resume only from confirmed backend state
```

Never assume locally buffered answer data is officially recorded unless confirmed.

## Exam scheduling API flow

```text
Exam Scheduling page
→ TanStack Query scheduling hooks
→ exam scheduling repository
→ centralized API client (base URL, bearer token, timeout, errors)
→ /api/v1/exams/{examId}/candidates|schedule|schedule/auto|schedule/reschedule
→ CandidateScheduleResponse DTOs
→ scheduling view model/table
```

The repository validates UUIDs and request constraints before transport. Query invalidation is scoped to the exam schedule and related exam caches. API mode is explicit: a request failure remains an error and does not select the mock repository. Because the backend currently lacks lecturer roster lookup, delete and CSV endpoints, those actions remain available only in the mock repository and are surfaced as unsupported in API mode.

For API mode, the roster capability intentionally composes the existing mock repository and returns a visible `Dữ liệu demo` indicator. This is a capability-level decision, not a runtime fallback: Scheduling assignment, schedule loading, auto scheduling and rescheduling always use the API repository and preserve API errors.
