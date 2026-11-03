# Separate student overview from exam list

## Goal
Make /student an actionable overview and /student/exams the complete searchable/paginated personal schedule.
## Context
Both routes currently render StudentSchedulePortal with only a changed title.
## Scope
Dashboard composition, compact exam-list header, focused regression tests.
## Non-goals
Backend API changes, new statistics endpoints, changes to exam entry eligibility.
## Relevant Sources
AGENTS.md; docs/design/{DESIGN_SYSTEM,UI_RULES,STATES}.md; docs/architecture/{STATE_MANAGEMENT,DATA_FLOW}.md; docs/api/API_CONTRACT.md; StudentSchedulePortal, StudentPortalView, StudentDashboard.
## Current Behavior
Both pages contain the same hero, KPI cards, filters, complete schedule and preparation tips.
## Target Behavior
Overview shows one priority slot (IN_PROGRESS, then READY, then SCHEDULED) from the most recent 20 assignments, transparent about that scope when truncated; links to full schedule, results, device check. List shows full filtering/pagination without dashboard decoration.
## Architecture Constraints
Reuse account-scoped useStudentExams and existing navigation builder; API errors never fall back to demo records; keep mock mode explicit; derive eligibility only from backend status.
## Milestones
1. Separate overview view and retain existing paginated list.
2. Verify selection, empty/error/permission states and navigation.
3. Verify responsive UI, typecheck, lint, full tests and build.
## Risks
Incorrectly calling a sample a global nearest exam; avoid this with priority labels and a conditional recent-record scope label. Preserve attemptId in all links.
## Validation
npm run typecheck; npm run lint; npm run test; npm run build; browser desktop/mobile.
## Definition of Done
Different content for the two routes; list controls only on exam list; API ownership unchanged; validations pass.
## Progress Log
- Confirmed shared rendering caused duplication. Implemented separate overview and compact list header.

- Validation complete: 250 tests passed; typecheck, lint and build passed. Browser verified overview/list separation, attempt navigation and 390px mobile without horizontal overflow. Vite reports the existing large-bundle advisory.
