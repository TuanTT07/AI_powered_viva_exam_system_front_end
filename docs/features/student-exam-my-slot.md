# Student Exam My Slot API Integration

`/student/exams/:examId` reads `GET /api/v1/student/exams/{examId}/my-slot?studentId={uuid}`. The student UUID comes only from the authenticated Student session; users cannot enter an arbitrary ID and mock IDs are rejected in API mode.

The page renders slot timing, status, access code when supplied, join eligibility and scheduled/completed/absent/error states. There is no Student Exam List endpoint in the verified Swagger contract, so the list remains a separate unsupported/demo surface.
