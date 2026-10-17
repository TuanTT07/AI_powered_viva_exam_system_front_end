# Course-scoped rubric repair

## Goal
Create, list, edit and delete rubrics from lecturer navigation using deployed course-scoped APIs.
## Context
The deployed OpenAPI exposes only /api/courses/{courseId}/rubrics; global /api/rubrics requests return static-resource 404.
## Scope
Rubric repository, hooks, global form course selector, deletion context, regression tests and contract documentation.
## Non-goals
Backend changes, mock fallback, changing credentials or submitting user's in-progress rubric.
## Relevant Sources
AGENTS.md; docs/api/API_CONTRACT.md; docs/api/ERROR_HANDLING.md; docs/architecture/{ARCHITECTURE,STATE_MANAGEMENT,DATA_FLOW}.md; docs/design/{UI_RULES,STATES}.md; src/features/rubrics; deployed /v3/api-docs inspected 2026-10-17.
## Current Behavior
Global operations use obsolete unscoped routes; global list suppresses 404 as empty; scoped deletion sometimes loses course context.
## Target Behavior
Global API list aggregates assigned courses. Creation requires a selected assigned course; editing preserves original course. All API CRUD validates UUID context. Errors remain errors; form input survives failure. Explicit mock mode retains current behavior.
## Architecture Constraints
Existing repository/TanStack Query boundary, session-scoped assignment, backend authorization, no second state pattern or new dependency.
## Milestones
1. Repair repository paths and global query composition.
2. Add selector and pass deletion context.
3. Regression checks and documentation.
## Risks
Lost editor input on reload; existing user browser form must remain untouched. Assignment failure must not appear as an empty rubric list.
## Validation
npm run typecheck; npm run lint; npm run test; npm run build. API-mode form tests cover course requirement, empty/error/loading, failure input preservation, global edit/delete context.
## Definition of Done
No unscoped rubric API transport remains; regression tests and supported checks pass.
## Progress Log
- Confirmed deployed Swagger contract; repaired transport, aggregation and form scope.
- Regression tests cover missing course context, transport failures, selection loading/error/empty, failed-save input preservation, locked course on edit, aggregation across assigned courses, and scoped global deletion.
- Passed typecheck, lint, full suite (198 tests / 54 files), build; final rubric suite 19 tests / 4 files. Existing build chunk-size warning remains.
- Shared responsive form grid and labelled native selector retained. No live backend mutation was submitted. Native browser was on an unrelated window; live visual/keyboard inspection was not performed and the user browser was left untouched.
