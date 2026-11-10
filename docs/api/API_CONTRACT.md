# REST API Contract — Frontend Expectations

> The current backend is described by OpenAPI at `http://localhost:8080/v3/api-docs` and the deployed demo at `https://aives-backend-xxhi.onrender.com/v3/api-docs`. Group 1 Question Bank, Rubric, Documents, AI Generation, and the verified Group 2 Exam, Monitoring, Scheduling and Student My Slot repositories select API or mock explicitly through `VITE_DATA_SOURCE`.

## Contract Rule

Prefer generated or shared OpenAPI types when available.

Do not invent fields because a screen needs them.

## Shared API foundation

Browser requests use the native fetch client in `src/services/api/client.ts`. Relative `/api/...` paths are preserved and proxied by Vite to `http://localhost:8080` during development. Deployed environments need same-origin routing or correct backend CORS configuration.

The client supports query parameters, repeated values, JSON bodies, caller headers, abort signals, timeouts, empty/204 responses, binary/blob responses, `FormData` multipart uploads and safe normalized `ApiError` failures. It does not log request bodies, store tokens or fall back to mock data after an API failure.

Backend responses are typically wrapped in the `{ success, status, message, data }` envelope (`ApiEnvelope<T>`). Repositories use `unwrapResponse` to handle enveloped data seamlessly while tolerating direct payloads. `PaginatedResult<T>` normalizes both Spring `Page` (`number`) and Admin `PageResponse` (`page`) shapes.

## Common Concepts

Potential entities:
- User
- Subject / Course
- CourseDocument (Learning Material)
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
- change password (`POST /api/auth/change-password`)

The deployed backend exposes `POST /api/auth/login` with `{ email, password }`, `GET /api/auth/me`, and `POST /api/auth/change-password` with `{ currentPassword, newPassword }`. Responses return the shared `{ success, status, message, data }` envelope. Login `data` contains `accessToken`, `tokenType: Bearer`, `expiresIn` seconds and a `UserResponse`; supported roles are `ADMIN`, `LECTURER` and `STUDENT`. The frontend maps these to `admin`, `lecturer` and `student`. There is no logout or refresh endpoint; logout clears the client session and token.

## Question API integration (Group 1 - Verified)

The Question Bank integration connects search/list, detail, create, update, approve, delete, template download, Excel import, and AI generation:

- **Create / Edit**: `POST /api/questions` and `PUT /api/questions/{id}` use the verified `QuestionRequest` fields (`courseId`, optional `rubricId`, `content`, `bloomLevel`, `aiGenerated`). Actor identity is extracted from backend JWT claims; `createdById` is not passed in the request body. Manual creation sends `aiGenerated: false`.
- **Status Lifecycle**: Questions have statuses `DRAFT` and `APPROVED`. Editing an approved question resets its status to `DRAFT`.
- **Approve**: `POST /api/questions/{id}/approve` transitions a `DRAFT` question to `APPROVED`.
- **Excel Import**:
  - `GET /api/courses/{courseId}/questions/import-template`: Downloads the `.xlsx` question import template binary.
  - `POST /api/courses/{courseId}/questions/import`: Accepts `multipart/form-data` with `file`. Returns `QuestionImportResult` (`{ importedCount: number, errors: [{ row, field, message }] }`). Even if backend returns HTTP 200, when `errors.length > 0`, the import is treated as failed with detailed row-by-row validation feedback. Imported questions default to `DRAFT`.
- **AI Question Generation**:
  - `POST /api/courses/{courseId}/questions/generate`: Generates questions based on course documents using RAG.
  - Request body: `{ documentIds: UUID[], rubricId?: UUID, bloomLevel?: BloomLevel, count: number, additionalInstructions?: string }`.
  - Only documents with `indexingStatus: "READY"` may be selected.
  - Backend saves generated questions into the database as `DRAFT` with `aiGenerated: true`.
  - The UI presents generated questions and directs the lecturer to review and approve them before they can be used in exams.

### Course Documents / Learning Materials (Group 1 - Verified)
- `GET /api/courses/{courseId}/documents`: Lists all uploaded documents for the course.
- `POST /api/courses/{courseId}/documents`: Uploads a document via `multipart/form-data` (`file`).
- `DELETE /api/courses/{courseId}/documents/{id}`: Deletes a document.
- Document fields include `id`, `fileName`, `fileType`, `fileSize`, `indexingStatus` (`PENDING`, `INDEXING`, `READY`, `FAILED`), `indexingError`, and `uploadedAt`. Only documents with `indexingStatus: "READY"` can be used for AI Question Generation.

### Course-Scoped Rubrics (Group 1 - Verified)

The deployed contract has no `/api/rubrics` endpoint. The global lecturer list aggregates rubric lists from assigned courses using the current session identity. Global creation requires selecting an assigned course; updates and deletions retain the rubric course ID. Missing course UUIDs are rejected before transport, and list failures are never converted into an empty success.
- `GET /api/courses/{courseId}/rubrics`: Lists rubrics scoped to a specific course.
- `POST /api/courses/{courseId}/rubrics`: Creates a rubric under a course with criteria and scoring scales.
- `GET /api/courses/{courseId}/rubrics/{id}`: Retrieves rubric details.
- `PUT /api/courses/{courseId}/rubrics/{id}`: Updates rubric details and criteria.
- `DELETE /api/courses/{courseId}/rubrics/{id}`: Deletes a rubric under a course (HTTP 204 or 200). Deletion invalidates rubric and question caches for that course context.

### Subjects
- list assigned subjects
- subject detail

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

Pagination is endpoint-specific. The student schedule contract below uses `page`; lecturer exam responses use the existing Spring Page contract.

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
| Rubric deletion | API | `DELETE /api/courses/{courseId}/rubrics/{id}` |
| Exam management CRUD/status | API | `/api/v1/exams`, `/api/v1/exams/{id}`, `/api/v1/exams/{id}/status` |
| Exam monitoring | API | `/api/v1/exams/{examId}/monitor` and attempt reset/absent |
| Student personal schedule | API | `GET /api/v1/student/exams` |
| Student My Slot | API | `GET /api/v1/student/exams/{examId}/my-slot` (identity from JWT) |
| Schedule loading | API | `GET /api/v1/exams/{examId}/schedule` |
| Automatic scheduling | API | `POST /api/v1/exams/{examId}/schedule/auto` |
| Manual rescheduling | API | `PUT /api/v1/exams/{examId}/schedule/reschedule` |

Only `mock` and `api` are supported data-source modes. There is no hybrid mode and a failed API request never changes source. Optional public demo configuration is provided by `VITE_DEMO_COURSE_ID`, `VITE_DEMO_EXAM_ID` and comma-separated `VITE_DEMO_CANDIDATE_IDS`; these values must be real UUIDs and are never hardcoded in components.

## Student personal schedule (Render OpenAPI verified 2026-11-03)

`GET /api/v1/student/exams` uses the existing bearer JWT client. The server selects the authenticated student's attempts; the frontend sends no student ID.

- Query: zero-based `page` (default 0), `size` (default 20, maximum 100), optional `status`: `SCHEDULED`, `READY`, `IN_PROGRESS`, `COMPLETED`, `ABSENT`, `CANCELLED`.
- Response: `{ content, page, size, totalElements, totalPages }`. Each entry contains `examId`, `attemptId`, `examTitle`, `courseCode`, `courseName`, `slotNumber`, `scheduledStartTime`, `scheduledEndTime`, `status`.
- Entries are metadata only, ordered by scheduled start descending by the server. HTTP 200 with `content: []` is a successful empty schedule. Missing scheduling times/numbers display as not assigned.
- Dashboard and My Exams load this list automatically. Filters and page changes request the server. Counts distinguish filtered totals from joinable attempts on the current page. API errors and 403 never substitute mock data.
- `GET /api/v1/student/exams/{examId}/my-slot` has no `studentId` query. Account identity is used only for client cache isolation; ownership is enforced by the JWT backend.
- Existing exam routes carry `?attemptId=<assigned attempt UUID>` through detail, equipment check and session. Before entering speech, it must match JWT-derived `my-slot.attemptId`. Legacy exam-only links resolve through my-slot. A URL never grants attempt ownership.
- Only `READY` and `IN_PROGRESS` entries offer room entry. The schedule does not include an active question turn; the existing speech room still waits until the backend supplies one. No question IDs or content are fabricated.

Validation uses mocked transport/session data for the schedule UI and repository checks. Authenticated Render requests, real microphone/voice and multiple real accounts have not been verified for this change. No Supabase seed was written; the cancelled local seed files were removed.

The following areas remain unavailable in the verified Swagger contract and are not presented as API-backed: lecturer roster read/remove/import, Exam Question Configuration and Reports. See the speech update below; the older blanket WebSocket limitation is superseded for speech. Grading endpoints now exist in BE main and require a separate FE2 review.

## Lecturer course assignment (temporary demo contract)

The deployed Swagger currently exposes `GET /api/lecturers/{lecturerId}/courses` under `Lecturer - Courses`. It returns the standard `{ success, status, message, data }` envelope with `CourseResponse[]` (`id`, `courseCode`, `courseName`, `department`, `createdAt`). The frontend takes `lecturerId` only from `session.user.id`, validates it as a UUID and never accepts it from URL/query input or hard-codes a demo identity. Lecturer pages call this endpoint directly and never call `/api/admin/**`.

This endpoint is temporary for demo purposes while backend JWT authentication is unavailable. The planned replacement is `GET /api/lecturer/courses`, which must derive the Lecturer UUID from the JWT `sub` claim and enforce assignment authorization server-side. API failures remain errors; they never fall back to mock data. Mock mode continues to use the existing local fixtures.

## Date/Time

## Admin management (verified)

Admin repositories use the envelope `{ success, status, message, data }` and map transport DTOs to UI models. The implemented capabilities are:

| Capability | Endpoint |
|---|---|
| User detail | `GET /api/admin/users/{id}` |
| Reset password | `PATCH /api/admin/users/{id}/password` with `{ newPassword }` |
| User courses | `GET /api/admin/users/{id}/courses` |
| Roles | `GET /api/admin/roles` |
| Course delete | `DELETE /api/admin/courses/{id}` |
| Course lecturers | `GET /api/admin/courses/{courseId}/lecturers` |
| Assign lecturer | `PUT /api/admin/courses/{courseId}/lecturers/{lecturerId}` |
| Remove lecturer | `DELETE /api/admin/courses/{courseId}/lecturers/{lecturerId}` |

Admin UI routes are `/admin`, `/admin/users`, `/admin/users/:userId`, `/admin/courses` and `/admin/courses/:courseId`. API mode never falls back to mock data; mock mode remains available through the repository selection boundary.

Backend should provide timezone-safe timestamps.

Frontend should not assume local timezone for official exam eligibility unless contract says so.

## Money

Not core to current AIVES scope.

## DTO Mapping

If backend uses transport-oriented DTOs, map them into feature view models explicitly rather than leaking unstable shapes across UI components.

## FE1 speech subset —03/11/2026

Verified BE main source `aef1275`: POST `/api/interview/attempts/{attemptId}/speech-ticket`, GET `/api/interview/attempts/{attemptId}/speech/questions/{questionTurnId}/playback`, GET `/api/interview/attempts/{attemptId}/speech/answers/{answerId}` and ticketed `/ws/interview/speech`. FE API room now integrates these three REST endpoints and speech WS through dedicated adapters; start/current are now integrated as described below; advancement is owned by the backend worker. `questionTurnId` must be an existing AI TranscriptTurn UUID from BE, not a Question/QuestionAttempt ID. The room obtains it from the JWT-owned current interview response; URL questionTurnId metadata is ignored. Backend enforces ownership/current-prompt access.

Playback uses Browser TTS (vi), not generated MP3. Receipt confirms only one answer. See [speech integration](../features/fe1-speech-integration.md) and [actual events](WEBSOCKET_EVENTS.md). Source availability is not proof of deployed provider/DB operation; no live audio/account run was made.

## Interview start/current — Render verified 2026-11-03

- POST `/api/interviews/{attemptId}/start`, no body: student JWT, explicit start button, no automatic POST on mount/reload or retries.
- GET `/api/interviews/{attemptId}/current`: student JWT; response envelope `ApiResponse<InterviewState>` with `{ attemptId, status, prompt }`.
- `status`: READY (prompt null), AWAITING_ANSWER (validated prompt), PROCESSING (prompt null), COMPLETED (prompt null).
- `prompt`: `{ questionAttemptId, questionTurnId, text, deadlineAt }`; deadline may be null. It supplies only the currently authorized question, not a question bank or historical transcript.
- The FE reads current on entry/reload and after a saved answer. Safe online polling checks for backend advancement/completion; polling and prompt replacement pause during active speech or an unresolved answer receipt. Permission errors stop the room; errors never use URL/mock prompts.
- Start cancels in-flight current reads; the current response supersedes cached my-slot READY metadata for the active speech session. Completed attempts can reopen a read-only completion view.
- Backend InterviewWorker selects follow-up/next question and completes the attempt. The FE does not invent next/finish endpoints or interpret a receipt/clock expiry as attempt completion.

Automated tests simulate HTTP, speech WS, PCM and Browser TTS. Actual student JWT/Render voice/provider persistence still require a signed-in live run.

## Complete grading inventory (BE/FE coordinated fix, 2026-11-11)

Deploy corresponding BE branch `fix/complete-attempt-grading` before this frontend. No compatibility fallback to first-question lookup is used.

- `GET /api/exams/{examId}/attempts/{attemptId}/grading`: manager-only envelope of `[{ questionOrder, questionStatus, evaluation: EvaluationResponseDto }]`. Returns actual assigned questions including drafts with null evaluation id and current-run transcript/rubric. Read-only; does not trigger AI. Workspace selects from this inventory and sends selected questionAttemptId to save/AI/publish. Summary derives per-attempt count from actual inventory, not configured maximum or persisted evaluations.
- `GET /api/v1/student/exams/{attemptId}/result-summary`: student-owner envelope `{ totalQuestions, questions: StudentResultDto[] }`. Count is actual assignment count; questions are published-only. Used to gate whole-result display without configured 1/3 ratios.

Reading draft data does not prove AI has evaluated it. Saving a question does not publish it. Publication still uses existing per-question endpoint; there is no atomic publish-entire-attempt contract.

## Whole-attempt publication

`PUT /api/exams/{examId}/attempts/{attemptId}/publish`, no body, manager JWT. Publishes all assigned main-question evaluations in one transaction. Requires completed exam attempt, at least one assigned question, and all evaluations GRADED with non-null final scores. Returns standard success envelope. Missing grade/incomplete attempt is409; wrong exam scope is404; unauthorized manager is403. Locks attempt then questions, validates the entire set before writing, and preserves timestamps of already published questions on retries. Deploy BE endpoint before FE publication button. Legacy per-question endpoint remains for compatibility; FE now uses the whole-attempt action only.
