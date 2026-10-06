# Route Map

> Planning contract only. No router is implemented in M0. Backend authorization and eligibility remain authoritative.

## Normalization Decisions

- Use resource-oriented nouns and stable IDs.
- Treat overlays and route states as part of their owning route, not as new routes.
- Keep one grading workspace route for transcript review, per-question scoring and final summary.
- Keep device check, instructions and ready confirmation as states of one preflight route.
- Use an account drawer/modal inside user management unless deep-link requirements later justify a user-detail route.
- Keep rubric routes subject-scoped so ownership is unambiguous.

These decisions remove the ambiguous concepts `/student/exams/:examId/ready`, `/lecturer/exams/:examId/attempts/:attemptId/grading` and `/admin/users/:userId` from the earlier proposal. They add an attempt-list route and a student results hub because both are independently navigable resources in the observed flow.

## Proposed Production Routes (33)

### Public / Authentication (1)

| Route | Screen | Guard / Contract | Stitch coverage |
|---|---|---|---|
| `/login` | Sign in | Anonymous-only; identity provider TBD | Live-only, unconfirmed node |

Additional recovery/callback routes depend on the identity-provider contract and remain TBD.

### Lecturer (20)

| Route | Screen | Guard / Contract | Stitch coverage |
|---|---|---|---|
| `/lecturer` | Lecturer dashboard | Lecturer | Missing design |
| `/lecturer/subjects` | Assigned subjects | Lecturer; backend assignment | Missing design |
| `/lecturer/subjects/:subjectId` | Subject overview | Lecturer; assigned subject | Missing design |
| `/lecturer/subjects/:subjectId/materials` | Learning materials | Lecturer; assigned subject | STITCH-16 |
| `/lecturer/subjects/:subjectId/questions` | Question bank | Lecturer; assigned subject | STITCH-02, STITCH-03 overlay |
| `/lecturer/subjects/:subjectId/questions/generate` | AI draft generation/review | Lecturer; AI output is draft | STITCH-15 |
| `/lecturer/subjects/:subjectId/questions/new` | Create question | Lecturer | Reuse STITCH-07 editor |
| `/lecturer/subjects/:subjectId/questions/:questionId` | Question editor | Lecturer | STITCH-07 |
| `/lecturer/subjects/:subjectId/rubrics` | Rubric list | Lecturer | Missing design |
| `/lecturer/subjects/:subjectId/rubrics/new` | Create rubric | Lecturer | Missing design; editor may share STITCH-07 patterns |
| `/lecturer/subjects/:subjectId/rubrics/:rubricId` | Rubric editor | Lecturer | Missing design |
| `/lecturer/exams` | Exam list | Lecturer | STITCH-04 |
| `/lecturer/exams/new` | Create exam | Lecturer | Missing design; reuse exam form shell |
| `/lecturer/exams/:examId` | Exam overview | Lecturer | Missing design |
| `/lecturer/exams/:examId/edit` | Exam configuration | Lecturer; draft/editability from backend | STITCH-08 |
| `/lecturer/exams/:examId/students` | Student assignments | Lecturer; policy TBD | STITCH-08 partial |
| `/lecturer/exams/:examId/monitor` | Live monitoring | Lecturer; authorized exam | Missing design |
| `/lecturer/exams/:examId/attempts` | Attempt queue/list | Lecturer/grader | STITCH-12 |
| `/lecturer/exams/:examId/attempts/:attemptId` | Grading workspace | Lecturer/grader; one route with review/summary states | STITCH-06, STITCH-11, STITCH-14 |
| `/lecturer/exams/:examId/report` | Exam report and export | Lecturer; export contract TBD | STITCH-01 |

### Student (8)

| Route | Screen | Guard / Contract | Stitch coverage |
|---|---|---|---|
| `/student` | Student dashboard | Student | Missing design |
| `/student/exams` | Eligible/upcoming exams | Student; backend eligibility | Missing design |
| `/student/exams/:examId` | Exam detail and instructions | Student; backend eligibility | Missing design |
| `/student/exams/:examId/check` | Device check / ready preflight | Student; microphone and optional camera policy | STITCH-13 |
| `/student/exams/:examId/session` | Active Viva session | Student; dedicated `ExamLayout`; backend session state | STITCH-05 state only |
| `/student/exams/:examId/completed` | Submission receipt | Student; backend-confirmed completion | Live-only, unconfirmed node |
| `/student/results` | Results and records hub | Student; released results only | STITCH-10 |
| `/student/exams/:examId/result` | Released result detail | Student; release-policy check | STITCH-10 partial |

### Admin (4)

| Route | Screen | Guard / Contract | Stitch coverage |
|---|---|---|---|
| `/admin` | Admin dashboard | Admin | Missing design |
| `/admin/users` | User management with account overlay | Admin; allowed transitions TBD | STITCH-09 |
| `/admin/subjects` | Subject and lecturer assignment | Admin | Missing design |
| `/admin/settings` | System configuration | Admin; settings exposed by backend only | Missing design; live voice-config node is unconfirmed |

## Route Guard Rules

1. Unauthenticated users enter the confirmed authentication recovery flow; exact redirects are TBD.
2. A wrong role receives a forbidden fallback or a safe role home. Sensitive content is not prefetched.
3. Student exam routes require backend-confirmed eligibility and attempt status, not local-clock inference.
4. `/student/exams/:examId/session` uses `ExamLayout` and must warn before any allowed exit.
5. Result routes require backend-confirmed release visibility.
6. Lecturer subject and exam routes require backend-confirmed assignment/authorization.
7. A stale or conflicting grading attempt must reconcile before final-grade actions are enabled.

## Deliberately Not Routes

- question import dialog (CSV-only MVP, owned by `/lecturer/subjects/:subjectId/questions`; no separate route),
- AI citation/source drawer,
- user account editor overlay,
- publish/finalize confirmation,
- Viva phase changes,
- loading, empty, error, permission and reconnect views,
- device-check substeps and ready confirmation,
- per-question versus final-summary tabs in the grading workspace.

## Duplicate / Ambiguous Concepts Resolved

| Earlier concept | Resolution | Reason |
|---|---|---|
| `/student/exams/:examId/ready` | State within `/check` | Same preflight workflow; avoids duplicate navigation and guard logic. |
| `.../attempts/:attemptId/grading` | State/tab within attempt route | Transcript, rubric, per-question review and finalization are one grading workspace. |
| `/admin/users/:userId` | Drawer/modal owned by `/admin/users` | Stitch shows contextual account editing; deep-link need is unconfirmed. |
| `/lecturer/rubrics/:rubricId` | Subject-scoped rubric route | Makes ownership and permission context explicit. |
| `/live` | `/monitor` | Names the lecturer monitoring resource without implying the student session route. |
| `/settings` for exam | `/edit` | The observed frame combines schedule, question policy and assignments, not generic system settings. |

Do not add aliases such as `/exam`, `/exam-page`, `/exam-detail` or `/student-exam` without an explicit migration decision.
