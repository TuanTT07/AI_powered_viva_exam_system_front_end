# Student results redesign
## Goal
Compact results list and dedicated read-only published assessment details.
## Context
List duplicates evaluation content and links to preflight; detail reads unapproved local transcripts.
## Scope
Student results routes, feature query/model, responsive styling and regression tests.
## Non-goals
Grading, approval, publication mutations and new API endpoints.
## Relevant Sources
AGENTS.md; docs/design/{DESIGN_SYSTEM,COMPONENTS,UI_RULES,STATES}.md; docs/ROUTES.md; docs/product/{BUSINESS_RULES,ROLES,USER_FLOWS}.md; docs/architecture/{ARCHITECTURE,STATE_MANAGEMENT,DATA_FLOW}.md; docs/api/{API_CONTRACT,ERROR_HANDLING}.md; src/features/exams and grading/api-evaluation-service.ts.
## Current Behavior
Oversized cards synthesize demo question scores; API list computes an average as final. Detail only supports mock scores and reads arbitrary cached transcripts.
## Target Behavior
Compact cards link to result route. Details expose only student endpoint published question scores, with explicit unavailable total/overall feedback states. Existing demo totals remain isolated.
## Architecture Constraints
TanStack Query; existing repositories and role guards; no new dependencies or grading logic.
## Milestones
1. Shared result query/model. 2. List/detail composition. 3. Checks and regression tests.
## Risks
API contract has no exam total, pass status, overall feedback, question text or separate approved record URL. Do not infer these. Course code is not an exam code; use exam ID as available identifier. Existing docs claiming no result endpoint conflict with working studentResults service: current code contract takes priority.
## Validation
npm run typecheck; npm run lint; npm run test; npm run build. Verify loading/empty/error, missing fields, mismatched attempts, unpublished scores, navigation and native keyboard accordion semantics.
## Definition of Done
Dedicated safe routes, responsive UI, no fabricated assessment details or preflight controls; required checks pass.
## Progress Log
- Created branch student-results-redesign and inspected contracts. Implementation in progress.

- Implemented shared publication-filtered query/model; detail validates requested attempt against student-owned completed slot. Removed locally cached transcript exposure and result-page mock mutations; existing appeal storage remains unchanged.
- API contract limitation: no official total or pass decision is derived from question scores. Existing isolated demo totals retained; invented demo question scores removed.
- Validation: typecheck, lint and production build passed. Lint retains three pre-existing ApiInterviewRoom effect warnings; build retains bundle size advisory. All 281 tests across 69 files passed, including publication filtering, no invented totals, transcript exclusion, dedicated navigation and read-only appeal preservation.
- Browser verified mock list, dedicated result navigation and detail at 390px mobile width. API live data not exercised without authenticated backend credentials; API permission and failure UI remains explicit.

- User correction: restore the pre-existing average of published question final scores, rounded to one decimal. Display green for >=5 and red for <5 on list and details. Label API average explicitly rather than claiming a backend-provided official exam total. This supersedes the earlier decision to suppress the API score.

- User requested interview dialogue on the result details page. Added a read-only transcript section using the existing per-attempt tab cache only after the backend student-owned completed slot query succeeds. No exam/global storage fallback, no hidden/system or partial transcript rows. Clearly identified as local, possibly incomplete conversation rather than an approved assessment record. Missing/invalid storage stays empty. This supersedes the earlier blanket exclusion of local transcripts, while retaining backend ownership checks.

- Follow-up diagnosis: deployed OpenAPI checked at https://aives-backend-xxhi.onrender.com/v3/api-docs. StudentResult schema contains only questionOrder/finalScore/feedback/publishedAt, no transcript. Local backend EvaluationService.getByQuestionAttempt requires courseAccess.requireManager; findByExam also requires manager and must not be used by Student results. Existing evaluation GET may trigger AI grading, so it is not an appropriate read-only Student fallback. Historical server transcript integration is blocked on an authorized Student API. Corrected empty message to describe unavailable server replay rather than implying absence of the recorded interview.

- User explicitly requested removing the interview conversation section. Removed the section and its newly added cache reader, styles and tests. Results remain limited to published assessment data.

- Visual follow-up: result detail now reuses Student Portal hero, dashboard-section, section-header-row and course badge. Main feedback/question column and secondary overview/record column stack responsively. Unpublished main content has one consolidated state. No data or grading changes. Typecheck, lint, 286 tests and production build passed.
