# REST API Contract — Frontend Expectations

> The current local backend is described by OpenAPI at `http://localhost:8080/v3/api-docs`. Feature repositories are still mock-first; the API foundation adds shared transport infrastructure without connecting pages to real endpoints.

## Contract Rule

Prefer generated or shared OpenAPI types when available.

Do not invent fields because a screen needs them.

## Shared API foundation

Browser requests use the native fetch client in `src/services/api/client.ts`. Relative `/api/...` paths are preserved and proxied by Vite to `http://localhost:8080` during development. Deployed environments need same-origin routing or correct backend CORS configuration.

The client supports query parameters, repeated values, JSON bodies, caller headers, abort signals, timeouts, empty/204 responses and safe normalized `ApiError` failures. It does not log request bodies, store tokens or fall back to mock data after an API failure.

Question/Rubric responses are raw payloads. Admin responses use the explicit `{ success, status, message, data }` envelope. Repositories must call `unwrapApiEnvelope` only for enveloped responses. `PaginatedResult<T>` normalizes both Spring `Page` (`number`) and Admin `PageResponse` (`page`) shapes.

## Common Concepts

Potential entities:
- User
- Subject
- LearningMaterial
- Question
- Rubric
- Exam
- ExamAssignment
- VivaAttempt
- Answer
- Transcript
- AIScoreSuggestion
- FinalGrade
- Report

## Suggested Endpoint Areas

### Auth
- session/current user
- login/logout depending on auth architecture

The current backend Swagger does not expose authentication or logout endpoints. Until that contract exists, frontend logout is implemented through `AuthAdapter.signOut()` as local session termination and TanStack Query cache clearing. No JWT, refresh-token or revocation endpoint is assumed.

## Question API integration

The Question Bank integration currently connects only search/list, detail, approve and delete. Question responses are raw Spring `Page` payloads and are mapped from transport DTOs in `src/features/question-bank/api-question-repository.ts`. The backend does not provide topic, suggested answer, response duration or a current lecturer UUID; API create/edit, import and AI generation therefore remain mock-only.

## Authentication API

The deployed backend exposes `POST /api/auth/login` with `{ email, password }` and `GET /api/auth/me`. Both return the shared `{ success, status, message, data }` envelope. Login `data` contains `accessToken`, `tokenType: Bearer`, `expiresIn` seconds and a `UserResponse`; supported roles are `ADMIN`, `LECTURER` and `STUDENT`. The frontend maps these to `admin`, `lecturer` and `student`. There is no logout or refresh endpoint; logout clears the client session and token.

## Integration order for the next developers

Dev1 should compose Question and Rubric repositories with `selectRepository(runtimeConfig.dataSource, { mock, api })`, call `apiClient.request`, explicitly unwrap only Admin-style envelopes (not Question/Rubric raw responses), map DTOs and preserve existing query keys. Dev2 should follow the same pattern for Admin Users, Roles, Courses and Lecturer Assignment. Neither integration should switch to mock after a network/API error.

### Subjects
- list assigned subjects
- subject detail

### Learning Materials
- list
- upload
- processing status
- delete/replace

### Questions
- list/filter
- create
- update
- import
- generate AI drafts
- approve/reject draft

### Rubrics
- list
- create/update
- detail

### Exams
- list
- create/update
- assign students
- configure
- publish
- status

### Attempts
- create/start eligibility
- detail
- session snapshot
- transcript/evidence

### Grading
- AI suggestion detail
- save lecturer grade
- finalize if backend supports separate finalization

### Reports
- exam summary
- distributions
- export

## Pagination

Contract: TBD.

If backend uses cursor pagination, do not convert to page-number assumptions in shared abstractions.

## Date/Time

Backend should provide timezone-safe timestamps.

Frontend should not assume local timezone for official exam eligibility unless contract says so.

## Money

Not core to current AIVES scope.

## DTO Mapping

If backend uses transport-oriented DTOs, map them into feature view models explicitly rather than leaking unstable shapes across UI components.
