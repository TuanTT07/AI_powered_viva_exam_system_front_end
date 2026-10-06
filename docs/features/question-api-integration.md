# Question API Integration

Question Bank uses the shared API client when `VITE_DATA_SOURCE=api`; mock mode remains the default and is still used by import, AI generation, exam question configuration and readiness.

Supported operations are raw Spring Page search (`GET /api/questions`), detail, approval and deletion. API DTOs are mapped to the existing question domain. The backend currently has no topic, suggested answer, response duration or lecturer-current-user contract, so those fields are read-only/unavailable and create/edit writes are intentionally blocked.

API mode requires a Course UUID in `/lecturer/subjects/:subjectId/questions`; mock slugs are rejected before any request. Search, status, Bloom and one-based URL pagination are sent server-side. API failures never fall back to mock data.
