# Source UI and API migration

## Goal
Use the supplied AI Studio source screens in AIVES, retaining real API behavior and organizing presentation by feature.
## Context
The earlier CSS-only shell refresh does not reproduce the supplied screen composition. User explicitly requests adapting the source itself and reconnecting APIs. Existing UI edits belong to this task. User authorized continuing with their modified `.env`; leave it byte-for-byte untouched.
## Scope
Source header/sidebar/footer and screen components, feature presentation, contextual navigation, Question/Rubric CRUD, Exam/Scheduling/Monitoring and Admin presentation. Preserve Student and Viva permissions/states.
## Non-goals
No backend changes, guessed endpoints, source mock provider, fake scores/transcripts, commits or pushes.
## Relevant sources
AGENTS.md; docs/design; docs/architecture; docs/api; supplied Downloads/JAVA/aives source; deployed /v3/api-docs checked 2026-10-16.
## Current behavior
131 tests pass; 3 existing lint warnings; build succeeds with existing chunk warning. Source prototype uses a monolithic mock provider, hardcoded course/council/metrics and Tailwind/lucide. Existing production app owns domain/query/API boundaries.
## Target behavior
Source JSX/utility styling lives in feature views; route containers supply query data and mutations. Header/sidebar are source components adapted to guarded role/context routes. Unsupported prototype fields display unavailable instead of fabricated data.
## Architecture constraints
Retain repositories, domain types, token/auth boundary, query invalidation and real UUID handling. API errors never fall back. Tailwind compiler and lucide are justified to reproduce the provided source utilities and icons without hand-maintaining another utility system. No source AI SDK or mock context is imported.
## Milestones
1. Baseline and live contract verification.
2. Source rendering tools and shared source shell.
3. Feature-owned source views with existing data/mutations.
4. API correctness tests and representative browser checks.
## Risks
Legacy global CSS overriding source utilities; missing backend fields in prototype; sensitive role navigation; cache regression.
## Validation
npm run typecheck; npm test; VITE_DATA_SOURCE=api npm test; npm run lint; npm run build; git diff --check; browser desktop/mobile and role navigation. Read-only backend verification; temporary live mutations only if authenticated demo context is available.
## Definition of done
Source-based screens render, existing workflows and checks pass, missing capabilities accurately represented, `.env` untouched, no commit/push.
## Progress log
- Baseline passed 131 tests, typecheck/build; 3 pre-existing lint warnings and chunk warning.
- Live Swagger confirms existing endpoints; source includes unsupported RAG/council/grading metrics. Keep API authority over these fields.
- Added Tailwind compilation (without global preflight reset) and lucide source icons.
