# REST API Contract — Frontend Expectations

> Endpoint paths below are architectural placeholders until backend OpenAPI/contract is finalized. Do not implement them as facts without confirmation.

## Contract Rule

Prefer generated or shared OpenAPI types when available.

Do not invent fields because a screen needs them.

## Common Concepts

Potential entities:
- User
- Subject
- LearningMaterial
- Question
- Rubric
- Exam
- ExamAssignment
- VivaAttempt
- Answer
- Transcript
- AIScoreSuggestion
- FinalGrade
- Report

## Suggested Endpoint Areas

### Auth
- session/current user
- login/logout depending on auth architecture

The current backend Swagger does not expose authentication or logout endpoints. Until that contract exists, frontend logout is implemented through `AuthAdapter.signOut()` as local session termination and TanStack Query cache clearing. No JWT, refresh-token or revocation endpoint is assumed.

### Subjects
- list assigned subjects
- subject detail

### Learning Materials
- list
- upload
- processing status
- delete/replace

### Questions
- list/filter
- create
- update
- import
- generate AI drafts
- approve/reject draft

### Rubrics
- list
- create/update
- detail

### Exams
- list
- create/update
- assign students
- configure
- publish
- status

### Attempts
- create/start eligibility
- detail
- session snapshot
- transcript/evidence

### Grading
- AI suggestion detail
- save lecturer grade
- finalize if backend supports separate finalization

### Reports
- exam summary
- distributions
- export

## Pagination

Contract: TBD.

If backend uses cursor pagination, do not convert to page-number assumptions in shared abstractions.

## Date/Time

Backend should provide timezone-safe timestamps.

Frontend should not assume local timezone for official exam eligibility unless contract says so.

## Money

Not core to current AIVES scope.

## DTO Mapping

If backend uses transport-oriented DTOs, map them into feature view models explicitly rather than leaking unstable shapes across UI components.
