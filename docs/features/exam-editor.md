# Exam Editor

Implemented routes:

- `/lecturer/exams/new`
- `/lecturer/exams/:examId/edit`

Both routes share `ExamEditorForm` and the typed `examRepository` boundary used by Exam Session List. The approved MVP fields are exam name, assigned subject, local start date/time, duration per student, main-question count and maximum follow-up count. The form intentionally excludes roster, time slots, question allocation, rubrics, AI settings, publishing and runtime controls.

Validation rules: title is trimmed and required at 3–120 characters; subject must be in the current lecturer's subject query; create start must be a valid future local date/time; edit permits an unchanged existing historical timestamp but rejects newly changed past times; duration is an integer 5–120; main questions are an integer 1–20; follow-ups are an integer 0–10. Defaults are 15 minutes, 3 main questions and 2 follow-ups.

Create stores canonical status `DRAFT` with a deterministic mock ID. Edit preserves ID/status and is allowed only for `DRAFT` and `SCHEDULED`; other statuses show a blocked state linking to the registered detail route. Create/update mutations invalidate only exam list and summary queries and seed the individual detail cache. The list therefore reads the same in-memory record set and reflects changes without a second mock dataset.

The form uses browser `beforeunload` plus React Router blocking for unsaved changes. The dialog offers “Ở lại chỉnh sửa” and “Bỏ thay đổi và rời trang”; it is not shown for untouched forms or after successful save. Recoverable subject/exam/mutation failures preserve entered values and expose retry/actionable states.

Visual reference: live Stitch project `https://stitch.withgoogle.com/projects/16463711942931628972`, registered STITCH-08 node `6421e124837441fca29c2cffd5e09a46`. The comparison used its lecturer rail, breadcrumb, form grouping, dark primary actions and warm Academic Retro tokens. Stitch’s roster, question-bank, AI and “Mở kỳ thi” controls were not implemented because they are outside this branch's approved scope.

This remains a typed deterministic mock repository with no backend persistence. Student roster, scheduling/time slots, question allocation and remaining Group 2 backend contracts are still pending.
