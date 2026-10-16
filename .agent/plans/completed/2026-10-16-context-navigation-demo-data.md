# Context navigation and complete demo data
## Goal
Move exam/course tasks into their resource pages and populate the demonstration screens with coherent isolated mock data and lighter status presentation.
## Context
User approves resource-based navigation and requests mock data rather than large yellow unavailable/read-only banners.
## Scope
Compact sidebar, resource tabs, removal of context picker, mock exam setup/attempt/report content, restrained demo/read-only notices.
## Non-goals
No fake production evidence or API-error fallback, no backend/provider changes, dependencies or .env edits.
## Relevant sources
AGENTS.md; docs/product/{ROLES,BUSINESS_RULES,USER_FLOWS}.md; docs/design/{UI_RULES,STATES,COMPONENTS,DESIGN_SYSTEM}.md; docs/architecture/{DATA_FLOW,STATE_MANAGEMENT}.md; existing routes/repositories and approved source screens.
## Current behavior
Global sidebar exposes context actions through selection dialogs. Demo exams have historical dates, sparse rosters and no schedules/question configs. Missing data and read-only messages dominate screens in yellow.
## Target behavior
Sidebar links to list pages. Exam and course routes expose their own tabs. Demo exams have internally consistent dates, roster, schedule, question sets, attempt states and report scores. Small labelled demo indicators and inline informational notes preserve authority without dominating the UI.
## Architecture constraints
Preserve real API errors/permissions; mocks remain in dedicated fixtures and explicit mock composition. Keep locks for active/completed exams. Existing URLs remain valid.
## Milestones
1. Resource tabs and sidebar simplification.
2. Coherent mock setup, attempts and report.
3. Compact status/demo notices.
4. Safety/regression/build and visual checks.
## Risks
Inconsistent fixtures, demo scores mistaken for official grades, bypassed read-only rules, outdated navigation tests.
## Validation
Repository and UI tests; typecheck; lint; full test suite; build; diff check. Check role navigation, loading/error/empty and read-only behavior.
## Definition of done
Approved hierarchy implemented, demo screenshot routes populated, legitimate rules still enforced, no introduced validation failures.
## Progress log
- The first screenshot is a real read-only rule, not missing data. Preserve the restriction and restyle its explanation. Mock data will populate explicit demo mode; API failures continue to surface honestly.
- Implemented a four-entry global lecturer sidebar and resource-owned exam/course tabs. Removed the context-selection feature/dialog, keeping existing feature URLs and short action/confirmation dialogs. Added exam configuration sub-tabs and removed the duplicate detail-page tab bar.
- Explicit demo repositories now initialize roster/schedule/question configuration coherently for all eleven sample exams. Editable exam dates are generated in the future. Added approved sample questions across subjects, materials for assigned demo courses and rubric samples. Repository factories retain their small test/empty scenarios; application composition injects populated presentation fixtures.
- Added mock attempt progression, sample scores and score distributions. Demo grading starts with sample draft scores and uses explicitly labelled sample totals; production grading retains unavailable official scores and never falls back after API failures.
- Replaced yellow demo/read-only panels with a small sample label or inline informational note. Active-exam edit restrictions, empty/new-exam states, errors and final-score authority remain intact.
- Added coherence tests across every sample exam, UI assertions for the two screenshot scenarios and updated route-navigation tests. Resolved an initial useMatches compatibility regression using useMatch, preserving existing logout tests.
- Validation: typecheck passed, 154/154 tests passed in 45 files, lint preserves only the pre-existing AudioVisualizer warning, build passed with existing chunk-size warning, diff check passed after trimming a CSS trailing blank line. No .env or dependency changes. Browser inspection of the new screens was limited by the native test window no longer showing the application; screenshot-route presentation is covered by component assertions and styles were reviewed directly.
