# Question API Integration

Question Bank uses the shared API client when `VITE_DATA_SOURCE=api`; mock mode remains the default and is still used by import, AI generation, exam question configuration and readiness.

Supported operations are raw Spring Page search (`GET /api/questions`), detail, approval, deletion, creation (`POST /api/questions`) and update (`PUT /api/questions/{id}`). API DTOs are mapped to the existing question domain. Create and update send only the verified backend fields: `courseId`, `rubricId`, `createdById`, `content`, `bloomLevel` and `aiGenerated`.

API mode requires a Course UUID in `/lecturer/subjects/:subjectId/questions`; mock slugs are rejected before any request. Search, status, Bloom and one-based URL pagination are sent server-side. Create and edit require an authenticated Lecturer UUID and use real Rubric UUIDs. Manual questions are always sent with `aiGenerated=false` and are created as backend drafts. API failures never fall back to mock data.

The backend does not support topic, suggested answer, explanation, keywords or course-scoped Rubrics, so those fields are labelled unavailable in API mode and are not sent. Mock mode keeps the existing richer editor. CSV import and AI generation remain mock-backed until their backend contracts exist.

Rubric deletion is integrated separately through the Rubric repository and its confirmation flow. It is API-backed only for real Rubric UUIDs; mock mode keeps local deletion. Successful deletion waits for HTTP 204, invalidates global Rubric and affected Question queries, and never deletes Questions.
