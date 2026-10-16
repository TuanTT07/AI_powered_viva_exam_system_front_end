# Complete workspace menu
## Goal
Keep all lecturer source menu entries visible on root/list routes and navigate safely through an explicit context choice.
## Context
Screenshot shows only four entries because subject/exam menus depended on URL IDs.
## Scope
Lecturer sidebar/shortcuts, authorized subject/exam selector, direct grading summary navigation and regression checks.
## Non-goals
No persona switching, role bypass, invented IDs, new API or dependencies.
## Relevant sources
AGENTS.md, docs/design, docs/product/ROLES.md, docs/ROUTES.md, current repositories and supplied Sidebar.tsx.
## Current behavior
Contextual entries disappear on /lecturer/exams and /lecturer. Source grading labels are missing.
## Target behavior
All lecturer feature labels remain visible. Missing context opens a searchable picker using existing assigned-subject/exam queries. Existing context navigates directly. Student/admin menus remain role-specific.
## Architecture constraints
Layout composes a feature-owned selector. Reuse Query caches, repositories and shared Dialog. Backend authorization remains authoritative.
## Milestones
Menu configuration; selector integration; summary continuation; checks.
## Risks
Duplicate active items, missing selection context, dialog/mobile focus, wrong-role fetching.
## Validation
Navigation/picker tests, typecheck, lint, full tests, build, diff check; inspect responsive menu styles.
## Definition of done
Source lecturer labels visible everywhere with working context-aware destinations and no introduced check failures.
## Progress log
- Confirmed source contains static lecturer navigation; production code hid groups when URL IDs were absent.
- Replaced conditional groups with complete source-labelled lecturer groups, retaining extra supported setup routes. Missing context renders a labelled button opening the shared Dialog instead of hiding the entry or guessing an ID.
- Added a feature-owned subject/exam picker using assigned-subject and exam Query/repository contracts, search, loading, empty/error/retry, pagination and API UUID checks. Closed dialogs restore focus to the trigger (or mobile menu button).
- Context-bearing routes navigate directly; summary destinations preserve the choice through the attempt queue into ?tab=summary. Active grading/summary menu entries are mutually exclusive. Student/Admin menus remain role-specific.
- Browser accessibility inspection confirms all menu groups remain on /lecturer/exams. Native automation had unstable element IDs/capture during modal clicks; component integration tests verify modal selection and destinations.
- Validation: typecheck passed; 150/150 tests passed in 43 files; lint preserves one unrelated AudioVisualizer warning; build passed with existing chunk-size warning; diff check passed. No .env or dependency changes.
