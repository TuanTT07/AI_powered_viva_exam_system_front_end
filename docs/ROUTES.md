# Route Map

> Proposed route architecture. Align with existing repository and approved Stitch flow before implementation.

## Public / Auth

```text
/login
```

Additional auth routes depend on identity provider.

## Lecturer

```text
/lecturer
/lecturer/subjects
/lecturer/subjects/:subjectId
/lecturer/subjects/:subjectId/materials
/lecturer/subjects/:subjectId/questions
/lecturer/subjects/:subjectId/questions/generate
/lecturer/subjects/:subjectId/questions/new
/lecturer/subjects/:subjectId/questions/:questionId
/lecturer/subjects/:subjectId/rubrics
/lecturer/rubrics/new
/lecturer/rubrics/:rubricId

/lecturer/exams
/lecturer/exams/new
/lecturer/exams/:examId
/lecturer/exams/:examId/students
/lecturer/exams/:examId/settings
/lecturer/exams/:examId/live
/lecturer/exams/:examId/attempts/:attemptId
/lecturer/exams/:examId/attempts/:attemptId/grading
/lecturer/exams/:examId/report
```

## Student

```text
/student
/student/exams
/student/exams/:examId
/student/exams/:examId/check
/student/exams/:examId/ready
/student/exams/:examId/session
/student/exams/:examId/completed
/student/exams/:examId/result
```

## Admin

```text
/admin
/admin/users
/admin/users/:userId
/admin/subjects
/admin/settings
```

## Route Guard Rules

- unauthenticated → auth flow,
- wrong role → forbidden/role home,
- student exam route → backend eligibility check,
- active session route → dedicated `ExamLayout`,
- result route → backend release check.

## Route Design Rule

Do not create multiple aliases for the same concept without a migration reason.

Prefer resource-oriented paths over names such as:
- `/question-page`,
- `/exam-screen`,
- `/student-viva-page`.
