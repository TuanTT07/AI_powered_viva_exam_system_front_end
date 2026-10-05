# Screen Registry

> This is the initial architecture registry. Replace placeholders and add exact Stitch screen IDs after auditing the approved Stitch project.

Status values:
- `reference-only`
- `planned`
- `in-progress`
- `implemented`
- `verified`

| ID | Screen | Role | Feature | Proposed Route | Status |
|---|---|---|---|---|---|
| AU-01 | Login | All | Auth | `/login` | planned |
| LE-01 | Lecturer Dashboard | Lecturer | Dashboard | `/lecturer` | planned |
| LE-02 | Subject Detail | Lecturer | Subjects | `/lecturer/subjects/:subjectId` | planned |
| LE-03 | Learning Materials | Lecturer | Learning Materials | `/lecturer/subjects/:subjectId/materials` | planned |
| LE-04 | Question Bank | Lecturer | Question Bank | `/lecturer/subjects/:subjectId/questions` | planned |
| LE-05 | Create/Edit Question | Lecturer | Question Bank | `/lecturer/subjects/:subjectId/questions/:questionId?` | planned |
| LE-06 | AI Question Generation | Lecturer | Question Bank | `/lecturer/subjects/:subjectId/questions/generate` | planned |
| LE-07 | Rubric List | Lecturer | Rubrics | `/lecturer/subjects/:subjectId/rubrics` | planned |
| LE-08 | Rubric Editor | Lecturer | Rubrics | `/lecturer/rubrics/:rubricId?` | planned |
| LE-09 | Exam List | Lecturer | Exams | `/lecturer/exams` | planned |
| LE-10 | Create Exam | Lecturer | Exams | `/lecturer/exams/new` | planned |
| LE-11 | Exam Detail | Lecturer | Exams | `/lecturer/exams/:examId` | planned |
| LE-12 | Student Assignment | Lecturer | Exams | `/lecturer/exams/:examId/students` | planned |
| LE-13 | Exam Configuration | Lecturer | Exams | `/lecturer/exams/:examId/settings` | planned |
| LE-14 | Live Monitoring | Lecturer | Monitoring | `/lecturer/exams/:examId/live` | planned |
| LE-15 | Attempt Detail | Lecturer | Grading | `/lecturer/exams/:examId/attempts/:attemptId` | planned |
| LE-16 | Grade Review | Lecturer | Grading | `/lecturer/exams/:examId/attempts/:attemptId/grading` | planned |
| LE-17 | Exam Report | Lecturer | Reports | `/lecturer/exams/:examId/report` | planned |
| ST-01 | Student Dashboard | Student | Dashboard | `/student` | planned |
| ST-02 | Upcoming Exams | Student | Exams | `/student/exams` | planned |
| ST-03 | Exam Detail | Student | Exams | `/student/exams/:examId` | planned |
| ST-04 | Device Check | Student | Viva Session | `/student/exams/:examId/check` | planned |
| ST-05 | Exam Instructions / Ready | Student | Viva Session | `/student/exams/:examId/ready` | planned |
| ST-06 | Active Viva Session | Student | Viva Session | `/student/exams/:examId/session` | planned |
| ST-07 | Exam Completed | Student | Viva Session | `/student/exams/:examId/completed` | planned |
| ST-08 | Result | Student | Results | `/student/exams/:examId/result` | planned |
| AD-01 | Admin Dashboard | Admin | Administration | `/admin` | planned |
| AD-02 | User Management | Admin | Administration | `/admin/users` | planned |
| AD-03 | User Detail | Admin | Administration | `/admin/users/:userId` | planned |
| AD-04 | Subject Management | Admin | Administration | `/admin/subjects` | planned |
| AD-05 | System Configuration | Admin | Administration | `/admin/settings` | planned |

## Audit Instructions

For every actual Stitch screen, record:
- Stitch screen name/ID,
- screenshot/reference path,
- role,
- route,
- owning feature,
- reusable components,
- required non-happy states,
- implementation status.

Do not create a production route solely because Stitch has a standalone visual screen. Some Stitch frames may represent a modal, drawer, empty state or variation of the same route.
