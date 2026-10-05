# AGENTS.md

## Mission

Build and maintain the AIVES frontend as a reliable, auditable and accessible examination system.

Preserve existing architecture unless an explicit approved decision says otherwise.

## Source-of-Truth Priority

When sources conflict, use this order:

1. Existing working repository behavior and current code contracts
2. This file
3. `docs/`
4. `.agent/state/DECISIONS.md`
5. Current active execution plan
6. `raw/` reference material

If a conflict is discovered, do not silently choose a new convention. Record it in the active plan or `KNOWN_ISSUES.md`.

## Context Routing

Read only what the current task needs.

### Product behavior
Read:
- `docs/product/PRODUCT.md`
- `docs/product/FEATURES.md`
- `docs/product/BUSINESS_RULES.md`

### Roles and permissions
Read:
- `docs/product/ROLES.md`
- `docs/ROUTES.md`

### User journeys
Read:
- `docs/product/USER_FLOWS.md`

### UI implementation
Read:
- `docs/design/DESIGN_SYSTEM.md`
- `docs/design/COMPONENTS.md`
- `docs/design/UI_RULES.md`
- `docs/design/STATES.md`

### Stitch implementation
Also read:
- `docs/design/SCREEN_REGISTRY.md`
- `raw/stitch/README.md`

### Architecture or refactor
Read:
- `docs/architecture/ARCHITECTURE.md`
- `docs/architecture/STATE_MANAGEMENT.md`
- `docs/architecture/DATA_FLOW.md`

### Viva Session
Read:
- `docs/architecture/VIVA_STATE_MACHINE.md`
- `docs/architecture/REALTIME.md`
- `docs/api/WEBSOCKET_EVENTS.md`
- `docs/api/AI_CONTRACT.md`

### API integration
Read:
- `docs/api/API_CONTRACT.md`
- `docs/api/ERROR_HANDLING.md`

## Planning Rules

For complex features, cross-feature changes, risky changes or architecture work, create an ExecPlan according to:

- `.agent/PLANS.md`

Store active plans in:

- `.agent/plans/active/`

Do not create a large ExecPlan for trivial changes.

## Architecture Rules

1. Pages compose features and should contain minimal business logic.
2. Domain logic belongs in `src/features/`.
3. Generic reusable UI belongs in `src/components/ui/`.
4. Domain-specific components belong inside their feature.
5. External integrations belong in `src/services/`.
6. Do not call external AI providers directly from frontend code.
7. Server state uses the existing server-state solution; recommended baseline is TanStack Query.
8. Cross-screen client state uses the existing client-state solution; recommended baseline is Zustand.
9. Local visual state stays local when possible.
10. Do not introduce a second state-management pattern without an approved decision.
11. Do not duplicate existing components.
12. Do not add a dependency unless existing utilities cannot solve the problem cleanly.
13. Role checks must not be UI-only when security is involved; backend authorization remains authoritative.

## AIVES Safety Rules

1. AI-generated scores are suggestions only.
2. UI must clearly distinguish AI suggestions from lecturer-confirmed final scores.
3. Never label an AI score as final unless backend data says the lecturer confirmed it.
4. Do not expose hidden prompts, answer keys, private rubrics or unauthorized transcripts.
5. Audio/video access must be permission-aware and failure-aware.
6. Viva Session must handle reconnect and failure states explicitly.
7. Do not fabricate transcript content, grading evidence or exam status in production paths.
8. Mock data must be clearly isolated from production data paths.

## Stitch Rules

Stitch is a visual reference, not automatic production architecture.

Before implementing a Stitch screen:

1. Find the screen in `SCREEN_REGISTRY.md`.
2. Identify its role, route and feature.
3. Search existing shared and feature components.
4. Check required UI states.
5. Check the user flow.
6. Implement within existing architecture.
7. Compare the result against Stitch after implementation.

Do not copy exported Stitch code directly into production without adapting it.

## Multi-Agent Rules

Use subagents only when work can be separated safely.

Good parallel work:
- repository exploration,
- component inventory,
- API contract review,
- visual review,
- test review.

Avoid parallel edits to the same files.

The coordinating agent owns final integration and validation.

## Before Coding

Confirm:
- task goal,
- role,
- route,
- feature,
- relevant states,
- existing components,
- relevant contracts,
- acceptance criteria.

## Validation

Run repository-supported equivalents of:

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

If a command does not exist, inspect `package.json` and use the closest existing check.

For UI changes, additionally verify:
- loading,
- empty,
- error,
- disabled,
- permission states,
- responsive behavior,
- keyboard/focus behavior where relevant.

For Viva changes, additionally verify:
- microphone permission,
- disconnect/reconnect,
- timer behavior,
- transcript states,
- AI processing state,
- follow-up transitions,
- completion state.

Do not mark a task complete while failures caused by the change remain unresolved.
