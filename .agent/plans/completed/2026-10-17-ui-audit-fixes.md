# Fix audit findings and compact subject workspace

## Goal
Resolve UI-01 through UI-20 in docs/reviews/ui-audit-2026-10-17.md and make /lecturer/subjects substantially more space-efficient.

## Context
User authorized all audit fixes and supplied a screenshot showing tall cards, excessive spacing and scroll position under the sticky header.

## Scope
Shared primitives, responsive navigation/focus, route scroll and unsaved guards, AI demo validation, login/device-check links, safe profile state, coherent demo data, resource-context links, compact subject list.

## Non-goals
No invented API endpoints, production session/media/score contracts, new state library or dependency. Preserve local .env. No deployment or main merge.

## Relevant Sources
AGENTS.md; docs/design/{DESIGN_SYSTEM,COMPONENTS,UI_RULES,STATES}.md; docs/architecture/{STATE_MANAGEMENT,VIVA_STATE_MACHINE,REALTIME}.md; docs/api/{API_CONTRACT,AI_CONTRACT,WEBSOCKET_EVENTS}.md; audit report; current repository behavior and tests.

## Current Behavior
Audit records twenty issues, including shared prop overrides, blocked AI demo, unpersisted profile feedback, unverified security claims, route/context errors and mobile focus/timer problems.

## Target Behavior
Compact subject rows with clear counts/status/actions, responsive stacking and useful filters. API identity stays read-only where update contract is absent; demo-only profile edits persist with explicit labels. All feedback reflects actual supported behavior. Existing query contracts remain intact.

## Architecture Constraints
Mock-only storage is isolated under mocks. Server queries stay in existing Query repositories. Native dialog and shared controls remain reused. Guard meaningful drafts without blocking preserved rubric handoffs or successful saves.

## Milestones
1. Fix shared UI/navigation and compact subjects.
2. Align AI/auth/profile/demo data behavior.
3. Add regression checks for risky changes and run typecheck/lint/test/build.
4. Inspect desktop/mobile and update audit disposition.

## Risks
Router blockers in MemoryRouter tests; stale guard during successful navigation; fixture data cycles; hidden sidebar focus; API/mock leakage.

## Validation
Repository npm run typecheck/lint/test/build; targeted pending/input, generation, auth persistence, profile API isolation, unsaved navigation and fixture tests; browser subject list, active tab, mobile menu and Viva checks.

## Definition of Done
All findings mapped to concrete changes, checks pass, browser responsive review complete, no .env modification by task.

## Progress Log
- Started implementing all twenty findings and compact list. Reviewed source priorities and current test contracts; no backend endpoint will be invented.

- Implemented UI-01–UI-20 and compact subject rows. Actual starting HEAD was ef99870 (newer user commits since the audit); preserved those existing changes.
- Browser confirmed 1440px desktop / 390px mobile list, tab contrast, hidden-menu focus exclusion, successful default AI generation, safe rubric handoff and guarded exits. Viva timer remains at viewport top=0 alongside typed draft.
- Regression checks: 190 tests / 53 files pass; typecheck, lint and build pass. Build retains existing large-bundle advisory. Final refinements verified: 36 relevant tests and production build pass; no unresolved failures.
- Completed all implementation and browser milestones. Current branch is feature/role-profile-pages, based on ef99870. User requested commit/push; stage source, tests, plan and review docs, excluding local .env.
