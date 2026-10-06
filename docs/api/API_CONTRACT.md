# REST API Contract — Frontend Expectations

> The current backend is described by OpenAPI at `http://localhost:8080/v3/api-docs` and the deployed demo at `https://aives-backend-xxhi.onrender.com/v3/api-docs`. Group 1 Question/Rubric and the verified Group 2 Exam, Monitoring, Scheduling and Student My Slot repositories select API or mock explicitly through `VITE_DATA_SOURCE`.

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

The Question Bank integration connects search/list, detail, create, update, approve and delete. `POST /api/questions` and `PUT /api/questions/{id}` use the verified `QuestionRequest` fields (`courseId`, nullable `rubricId`, `createdById`, `content`, `bloomLevel`, `aiGenerated`) and raw `QuestionResponse` payloads. Responses are mapped in `src/features/question-bank/api-question-repository.ts`; localized Bloom labels are converted to backend enums and `DRAFT`/`APPROVED` statuses are preserved.

Create/edit requires real UUIDs for course, question, rubric (when selected) and authenticated user. The UI never exposes `createdById` as an editable field. Manual create sends `aiGenerated=false`, and backend-created records are expected to be `DRAFT`. The backend currently does not support topic, suggested answer, explanation, keywords or course-scoped Rubrics; API mode labels those fields unavailable and does not send them. Import and AI generation remain mock-only.

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
- delete (`DELETE /api/rubrics/{id}`, HTTP 204 No Content)

Rubric deletion requires a real Rubric UUID and uses the shared API client. The frontend waits for the 204 response before removing cached Rubrics. Questions referencing the deleted Rubric remain intact; the backend may set `rubricId`/`rubricName` to null. Rubrics are global in the current API rather than course-scoped, so deletion invalidates Rubric caches and affected Question caches across subject contexts. API failures never fall back to mock data.

### Exams
- list (`GET /api/v1/exams`, Spring `PageExamResponse`)
- create (`POST /api/v1/exams`), update (`PUT /api/v1/exams/{id}`), delete (`DELETE /api/v1/exams/{id}`)
- detail (`GET /api/v1/exams/{id}`) and status (`PATCH /api/v1/exams/{id}/status`)
- Monitoring (`GET /api/v1/exams/{examId}/monitor`, reset/absent attempt commands)
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

## Exam candidate assignment and scheduling (confirmed backend contract)

The frontend scheduling integration uses only these confirmed endpoints:

| Method | Path | Request | Response |
|---|---|---|---|
| `POST` | `/api/v1/exams/{examId}/candidates` | `{ studentIds: UUID[] }` | `CandidateScheduleResponse[]` |
| `GET` | `/api/v1/exams/{examId}/schedule` | — | `CandidateScheduleResponse[]` |
| `POST` | `/api/v1/exams/{examId}/schedule/auto` | `{ studentIds: UUID[], slotDurationMinutes: integer >= 5, breakDurationMinutes?: integer >= 0 }` | `CandidateScheduleResponse[]` |
| `PUT` | `/api/v1/exams/{examId}/schedule/reschedule` | `{ studentId: UUID, newScheduledStartTime: ISO date-time, newScheduledEndTime: ISO date-time }` | `CandidateScheduleResponse` |

`CandidateScheduleResponse` contains `attemptId`, `examId`, `studentId`, student identity fields, `slotNumber`, scheduled/actual timestamps, `status` (`SCHEDULED`, `READY`, `IN_PROGRESS`, `COMPLETED`, `ABSENT`, `CANCELLED`) and `accessCode`.

The current backend does not expose a lecturer student-search/roster-read endpoint, candidate delete endpoint, or CSV import endpoint. In API mode the roster screen therefore explains the limitation and Scheduling accepts only real backend UUIDs. API failures never fall back to mock data. Authentication is provided by the centralized API client/token boundary.

### Functional Group 2 capability matrix

| Capability | Source in API mode | Endpoint |
|---|---|---|
| Candidate assignment | API | `POST /api/v1/exams/{examId}/candidates` |
| Candidate listing | Mock, labelled `Dữ liệu demo` | No verified lecturer roster endpoint |
| Candidate removal | Mock, labelled `Dữ liệu demo` | No verified delete endpoint |
| CSV roster import | Mock, labelled `Dữ liệu demo` | No verified import endpoint |
| Rubric deletion | API | `DELETE /api/rubrics/{id}` (204 No Content) |
| Exam management CRUD/status | API | `/api/v1/exams`, `/api/v1/exams/{id}`, `/api/v1/exams/{id}/status` |
| Exam monitoring | API | `/api/v1/exams/{examId}/monitor` and attempt reset/absent |
| Student My Slot | API | `GET /api/v1/student/exams/{examId}/my-slot?studentId={studentUuid}` |
| Schedule loading | API | `GET /api/v1/exams/{examId}/schedule` |
| Automatic scheduling | API | `POST /api/v1/exams/{examId}/schedule/auto` |
| Manual rescheduling | API | `PUT /api/v1/exams/{examId}/schedule/reschedule` |

Only `mock` and `api` are supported data-source modes. There is no hybrid mode and a failed API request never changes source. Optional public demo configuration is provided by `VITE_DEMO_COURSE_ID`, `VITE_DEMO_EXAM_ID` and comma-separated `VITE_DEMO_CANDIDATE_IDS`; these values must be real UUIDs and are never hardcoded in components.

The following areas remain unavailable in the verified Swagger contract and are not presented as API-backed: Lecturer Courses discovery, lecturer roster read/remove/import, Student Exam List, Exam Question Configuration, Course Materials, bulk Question Import, AI Question Generation, Viva runtime/WebSocket, Grading and Reports.

## Lecturer course assignment (not yet available)

Swagger currently has no verified Lecturer-scoped course endpoint. The preferred future contract is `GET /api/lecturer/courses` (and optionally `GET /api/lecturer/courses/{courseId}`), deriving the Lecturer from the bearer token and enforcing assignment authorization server-side. Lecturer pages must not call the Admin `/api/admin/courses` endpoints.

## Date/Time

Backend should provide timezone-safe timestamps.

Frontend should not assume local timezone for official exam eligibility unless contract says so.

## Money

Not core to current AIVES scope.

## DTO Mapping

If backend uses transport-oriented DTOs, map them into feature view models explicitly rather than leaking unstable shapes across UI components.
