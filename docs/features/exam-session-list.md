# Exam Session List

Route: `/lecturer/exams` (lecturer guard). Stitch reference: STITCH-04, node `49a51fbd8174487d98b6c2335dc8a458`.

The page currently uses a typed, deterministic feature repository boundary in `src/features/exams/exam-repository.ts`; it is intentionally a mock until the backend OpenAPI contract is finalized. The view model contains exam id/title, subject id/code/name, schedule timestamp, per-student duration, student count, main-question count, maximum follow-up count and status.

Supported statuses are `DRAFT`, `SCHEDULED`, `IN_PROGRESS`, `COMPLETED` and `CANCELLED`. Display labels are Vietnamese and status badges include text plus semantic tone; no status is treated as a publish/start/end command.

Search/filter/pagination are URL state: `q`, `subject`, `status`, `page`. Filter changes reset to page 1, invalid status/page values are ignored safely, and pagination preserves active filters. The reset action clears all four parameters. The list exposes only registered destinations: `/lecturer/exams/new`, `/lecturer/exams/:examId`, and `/lecturer/exams/:examId/edit`; edit is shown only for draft/scheduled mock records.

The deterministic fixture covers all five statuses, multiple subjects/dates and three pages. `q=__ERROR__` is a test-only repository failure fixture for retry-state verification. Empty collection, no-results, loading and permission branches remain explicit in the page composition. Backend list/create/edit, roster, scheduling mutation, publish/cancel and runtime behavior remain Group 2 follow-up work.
