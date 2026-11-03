# Student blue accents and results styling

## Goal
Add restrained blue emphasis to overview and align student results list/detail with the compact student portal.
## Context
Overview is too neutral; results still use large dark gradient heroes and verbose cards.
## Scope
Overview accents, results list/detail presentation, preserving demo/API boundaries and appeal flow.
## Non-goals
New results API, lecturer report changes, invented grades or publication state.
## Relevant Sources
AGENTS.md, docs/design/{DESIGN_SYSTEM,UI_RULES,STATES}.md, docs/api/API_CONTRACT.md, student-results.test.tsx.
## Current Behavior
Dark result banners, multi-color statistics, placeholder metrics when API is unavailable.
## Target Behavior
Light surfaces, blue header rules and icon backgrounds, compact cards/table; API unavailability remains explicit.
## Architecture Constraints
Existing stack and primitives, no dependencies; no mock grades in API mode.
## Milestones
1. Apply restrained overview accents and consistent results layout.
2. Verify API-empty and demo-detail/appeal states.
3. Run checks and review desktop/mobile.
## Risks
Do not imply grading or publication from a visual badge; retain explicit sample labels.
## Validation
npm run typecheck; npm run lint; npm run test; npm run build; browser desktop/mobile.
## Definition of Done
Consistent student styles, no exposed sample grades in API mode, existing tests pass.
## Progress Log
- Inspected student overview, result list/detail and existing authority tests.

- Completed blue overview accents and compact results list/detail. Preserved demo-only appeals and explicit API unavailability. Updated existing appeal assertions for shorter sample labels and checked persisted/cancelled storage.
- Validation: 250 tests pass; typecheck, lint and build pass. Desktop and mobile reviewed, including 390px table scrolling without document overflow. Existing Vite bundle-size advisory remains.
