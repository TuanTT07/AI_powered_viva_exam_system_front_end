# Exam Management API Integration

The lecturer Exam List, Create, Edit and Detail flows use the verified `/api/v1/exams` endpoints when `VITE_DATA_SOURCE=api`. DTOs are mapped from `ExamResponse`, `ExamDetailResponse`, `PageExamResponse`, `ExamConfigDto` and `UpdateExamStatusRequest`; the UI keeps backend UUIDs and never sends mock IDs.

Integrated operations are list, create, detail, update, delete and status. The frontend maps the backend status enum (`DRAFT`, `PUBLISHED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`) and supports only UUID-backed API routes. Lecturer course discovery is still unavailable; creation requires a real UUID supplied through `VITE_DEMO_COURSE_ID` until a Lecturer Courses endpoint exists.

Mock mode keeps the existing seed flows. API errors never fall back to mock. Exam mutations invalidate only affected list/detail/summary/schedule/monitoring query keys.
