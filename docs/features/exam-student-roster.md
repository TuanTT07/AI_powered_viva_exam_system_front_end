# Exam Student Roster

Route: `/lecturer/exams/:examId/students` (INF-11), protected by the lecturer guard. The page is scoped to one exam and provides search by student code, name, or email.

`DRAFT` and `SCHEDULED` exams allow Manual Add, CSV import, and removal. `IN_PROGRESS`, `COMPLETED`, and `CANCELLED` exams are read-only; the repository rejects mutations as well as the UI hiding destructive controls.

Manual Add accepts trimmed student code, full name, and lower-cased email. Codes are 3–30 characters using letters/numbers/hyphen/underscore; names are 2–100 characters; emails are validated and duplicates are case-insensitive within the selected exam.

CSV uses UTF-8/BOM and required headers `student_code`, `full_name`, `email`; unknown columns are ignored. Files are limited to 5 MB and 500 data rows. Every row is previewed with row/column issues. Batch and existing-roster duplicates are invalid, the first valid duplicate is retained, and mixed imports add valid rows only. The template is `aives-exam-student-roster-template.csv`.

The existing exam repository owns roster records and adjusts only the selected exam's `studentCount`. TanStack Query keys include `examId`; successful mutations invalidate that roster, the affected exam detail, and exam list queries. This is frontend mock persistence only: no student account, backend import, slot, question allocation, or invitation email is created.

The registered route is an inferred Group 2 screen; Stitch has only a partial assignment reference in STITCH-08, so the implementation reuses the existing editorial table/dialog primitives. Remaining Group 2 work includes scheduling, question configuration, monitoring, grading, and reports; backend persistence and authorization remain dependencies.
