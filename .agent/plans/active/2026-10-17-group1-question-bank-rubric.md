# Group 1: Ngân hàng câu hỏi & Rubric API Integration

## 1. Goal
Connect the frontend Question Bank and Rubric modules to the newly released backend endpoints according to the functional specification for Group 1.

## 2. Context
The backend deployed at `https://aives-backend-xxhi.onrender.com` now exposes:
- Course-scoped Rubrics (`/api/courses/{courseId}/rubrics`)
- Course Documents with RAG indexing (`/api/courses/{courseId}/documents`)
- AI Question Generation (`/api/courses/{courseId}/questions/generate`)
- Question Import via Excel (`/api/courses/{courseId}/questions/import`) and template download (`/api/courses/{courseId}/questions/import-template`)
- Question Approve (`/api/questions/{id}/approve`) and Question CRUD without `createdById` in body.

Previously, parts of these features were mock-only or used legacy endpoints (e.g. global `/api/rubrics`). This plan aligns the frontend to the verified contracts and completes full API integration for Functional Group 1.

## 3. Scope
- **Rubrics**: Update `api-rubric-repository` to course-scoped `/api/courses/{courseId}/rubrics` endpoints (CRUD); adapt rubric screens and hooks.
- **Documents / Materials**: Implement `api-material-repository` for `/api/courses/{courseId}/documents` (list, upload via `FormData`, delete); display `indexingStatus` (`PENDING`, `INDEXING`, `READY`, `FAILED`) and `indexingError`; allow selection only for `READY` documents.
- **AI Question Generation**: Implement `api-generation-repository` for `/api/courses/{courseId}/questions/generate`; only allow `READY` documents and course rubrics; populate generated questions as `DRAFT` in Question Bank with review/approve capability.
- **Excel Import**: Implement API-backed import using `POST /api/courses/{courseId}/questions/import` (`multipart/form-data`) and template download `GET /api/courses/{courseId}/questions/import-template`; handle row-level error reporting (`data.errors`).
- **Question Bank**: Remove obsolete `createdById` from `QuestionRequestDto`; preserve `DRAFT` / `APPROVED` flow; ensure `POST /api/questions/{id}/approve` transitions to `APPROVED`; warn when editing `APPROVED` questions resets them to `DRAFT`.
- **Contracts**: Update `docs/api/API_CONTRACT.md` reflecting verified Group 1 contracts.

## 4. Non-goals
- No changes to Exam Scheduling, Monitoring, Viva Session or Grading (Group 2 / Dev2).
- No direct browser calls to Gemini or embedding `GEMINI_API_KEY` in frontend.
- No auto-approving questions upon AI generation or Excel import (must stay `DRAFT` until lecturer approves).
- No modifying `.env` unexpectedly.

## 5. Relevant Sources
- User guide: `question-bank-frontend-guide.md`
- Live OpenAPI spec: `https://aives-backend-xxhi.onrender.com/v3/api-docs`
- `AGENTS.md`
- `docs/api/API_CONTRACT.md`
- `src/features/rubrics/`
- `src/features/learning-materials/`
- `src/features/ai-question-generation/`
- `src/features/question-bank/`

## 6. Current Behavior
- Rubrics: Calls global `/api/rubrics`.
- Documents: Mock repository only (`createMaterialRepository`).
- AI Generation: Mock generator only (`mock-generation.ts`).
- Question Import: Client-side PapaParse / mock only.
- Question CRUD: Sends `createdById` in request body (which is no longer accepted/required in backend DTO).

## 7. Target Behavior
- Rubric operations are course-scoped under `/api/courses/{courseId}/rubrics`.
- Materials are loaded from and uploaded to `/api/courses/{courseId}/documents`; indexing statuses are accurately shown; failed status shows `indexingError`.
- AI Question Generation sends `{ count, topic, bloomLevels, rubricId, documentIds }` to `/api/courses/{courseId}/questions/generate`, stores results as `DRAFT`, and redirects to review.
- Question import uploads `.xlsx` to `/api/courses/{courseId}/questions/import` and renders backend row errors if `errors.length > 0`.
- All operations adhere to `selectRepository(runtimeConfig.dataSource, { mock, api })` and never fall back to mock on API errors.

## 8. Architecture Constraints
- Preserve existing TanStack Query key patterns and cache invalidation.
- Actor / user identity is handled by backend JWT; do not pass `createdById` in request bodies.
- Uploads must use `FormData` without setting `Content-Type: multipart/form-data` manually so the browser generates the boundary.
- Do not invent fields not present in Swagger.

## 9. Milestones
- **M1: Rubrics course-scoped alignment**: Update `api-rubric-repository` and its consumers/tests to use `/api/courses/{courseId}/rubrics`.
- **M2: Learning Materials API integration**: Create `api-material-repository`, connect upload/delete/list to backend, update hooks, display indexing status and errors.
- **M3: Question API cleanup & Excel Import**: Remove `createdById` from `QuestionRequestDto`, wire `POST /api/courses/{courseId}/questions/import` and template download in `question-import-dialog`.
- **M4: AI Question Generation integration**: Connect `POST /api/courses/{courseId}/questions/generate`, enforce selecting only `READY` documents, handle loading/error states, navigate to `DRAFT` review.
- **M5: Testing, Validation & Documentation**: Run typecheck, lint, and unit tests; update `docs/api/API_CONTRACT.md`.

## 10. Risks
- Course scoping: components without `courseId` in context must obtain it from URL params (`/subjects/:subjectId`) or active subject.
- File upload headers: explicit `Content-Type` header would break boundary generation; `apiClient` must allow omitting `Content-Type` when body is `FormData`.
- Import error parsing: Backend returns HTTP 200 even with validation failures; frontend must check `data.errors.length > 0`.

## 11. Validation
- `npm run typecheck`
- `npm run lint`
- `npm run test`
- `npm run build`

## 12. Definition of Done
- All Group 1 features operate with real API when `VITE_DATA_SOURCE=api`.
- Mock mode remains functional when `VITE_DATA_SOURCE=mock`.
- All test suites pass.
- `docs/api/API_CONTRACT.md` updated.

## 13. Progress Log
- 2026-10-17: Plan created based on backend Swagger verification and user Group 1 guide.
- 2026-10-17: [M1 Complete] Migrated `api-rubric-repository` to course-scoped `/api/courses/{courseId}/rubrics`, updated delete hook/page, passing unit tests.
- 2026-10-17: [M2 Complete] Implemented `api-material-repository` for `/api/courses/{courseId}/documents`, enabled document upload/list/delete in API mode, exposed `indexingStatus` and `indexingError`, added unit tests.
- 2026-10-17: [M3 Complete] Removed `createdById` from `QuestionRequestDto`, implemented template download and Excel import via `POST /api/courses/{courseId}/questions/import` with row-error rendering, added warning on editing approved questions, passing unit tests.
- 2026-10-17: [M4 Complete] Implemented `api-generation-repository` for `POST /api/courses/{courseId}/questions/generate`, wired UI to filter for `READY` documents only, direct lecturer to review/approve generated `DRAFT` questions, added unit tests.
- 2026-10-17: [M5 Complete] Added `apiChangePassword` to auth adapter. Updated `docs/api/API_CONTRACT.md` with verified Group 1 contracts. Running typecheck, lint, test, and build validation.
