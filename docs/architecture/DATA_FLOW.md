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
