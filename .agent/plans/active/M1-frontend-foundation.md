# ExecPlan — M1 Frontend Foundation

## 1. Goal

Establish a tested, accessible AIVES frontend foundation that can host role-based product features without committing to unconfirmed backend, identity, realtime or AI-provider contracts.

## 2. Context

M0 normalized the approved Stitch reference into 33 production routes, shared design tokens, component ownership and explicit UI/Viva states. The repository currently contains React 19 and Vite scaffolding only. M1 should replace the starter shell with architecture foundations, not implement end-user feature screens.

## 3. Scope

- application router and route metadata,
- provider composition,
- authentication/session boundary interfaces,
- role and permission guards,
- Auth, Lecturer, Student, Admin and Exam layouts,
- design-token and global-style foundation,
- initial shared UI primitives,
- common loading, empty, error and permission states,
- server-state and cross-screen client-state foundations,
- typed service boundaries without invented endpoints/DTOs,
- unit/component/router test baseline,
- accessibility and build/lint/type validation baseline.

## 4. Non-goals

- feature-complete screens,
- real authentication integration,
- REST endpoint implementation,
- WebSocket/SSE/media integration,
- AI/STT/TTS provider integration,
- production mock behavior or fabricated DTOs,
- implementation of the full Viva runtime state machine,
- copying Stitch-generated code,
- resolving backend-owned product policy in frontend code.

## 5. Relevant Sources

- `AGENTS.md`
- `.agent/state/DECISIONS.md`
- `.agent/state/KNOWN_ISSUES.md`
- `docs/ROUTES.md`
- `docs/product/PRODUCT.md`
- `docs/product/ROLES.md`
- `docs/product/PERMISSION_MATRIX.md`
- `docs/product/BUSINESS_RULES.md`
- `docs/product/USER_FLOWS.md`
- `docs/design/SCREEN_REGISTRY.md`
- `docs/design/DESIGN_SYSTEM.md`
- `docs/design/COMPONENTS.md`
- `docs/design/UI_RULES.md`
- `docs/design/STATES.md`
- `docs/architecture/ARCHITECTURE.md`
- `docs/architecture/STATE_MANAGEMENT.md`
- `docs/architecture/DATA_FLOW.md`
- `docs/architecture/VIVA_STATE_MACHINE.md`
- `docs/api/API_CONTRACT.md`
- `docs/api/ERROR_HANDLING.md`
- `raw/stitch/notes/SOURCE.md`
- `package.json`
- `src/`

## 6. Current Behavior

- `App.tsx` is the Vite starter demonstration.
- `src/app/`, `src/features/`, `src/components/`, `src/services/` and related architecture folders contain `.gitkeep` files only.
- React Router, TanStack Query, Zustand and test libraries are not installed.
- `npm run build` runs TypeScript build plus Vite build.
- `npm run lint` runs oxlint.
- No standalone `typecheck` or `test` script exists.
- No AIVES route, layout, guard, provider, token or shared-state implementation exists.

## 7. Target Behavior

- The app boots through one provider composition root.
- The normalized route tree is represented once and can render route shells/placeholders without feature logic.
- Authentication and authorization are expressed through typed interfaces and guards, with backend authority explicit.
- Each role has a stable layout; active Viva uses an isolated `ExamLayout`.
- Server state, cross-screen client state, URL state and local UI state have documented/implemented ownership boundaries.
- Shared primitives use extracted design tokens, keyboard focus and semantic states.
- Loading, empty, error, unauthorized and forbidden patterns are reusable.
- A baseline test suite proves route guards, layout selection and key shared-state/accessibility behavior.
- No unconfirmed endpoint, DTO, realtime event or provider choice is encoded as fact.

## 8. Architecture Constraints

1. Preserve the feature-based dependency direction: pages → features → shared/services.
2. Pages contain route composition, not domain logic.
3. Domain components remain in features; generic primitives remain in `src/components/ui/`.
4. External integrations remain behind `src/services/`.
5. Frontend never calls AI providers directly.
6. Server state and client state remain separate.
7. Role checks are UX gates only; backend authorization remains authoritative.
8. Active Viva uses one explicit runtime phase model and a dedicated layout when implemented.
9. AI suggestions and lecturer-confirmed final data use distinct semantics.
10. Do not introduce a second state-management pattern without an approved decision.

## 9. Dependencies (Proposal Only)

Do not install until the M1 plan is approved and existing utilities have been rechecked.

### Runtime candidates

- `react-router-dom` — normalized route tree, nested layouts and route error boundaries.
- `@tanstack/react-query` — server-state cache, queries/mutations and error/loading ownership.
- `zustand` — narrowly scoped cross-screen client state only.

### Test candidates

- `vitest` — unit/component test runner aligned with Vite.
- `@testing-library/react` and `@testing-library/user-event` — behavior and keyboard tests.
- `jsdom` — DOM test environment.
- `msw` — test-only network boundary simulation after actual contracts exist; do not define production-shaped fake contracts prematurely.
- accessibility checker such as `axe-core` integration — candidate pending team preference.

### Decision gates

- Confirm whether the auth solution supplies its own provider/router integration before adding custom session state.
- Confirm whether an existing component library is approved before building primitives from scratch.
- Confirm schema/form needs before adding validation or form libraries.
- Record each accepted dependency and reason in `DECISIONS.md` if it materially shapes architecture.

## 10. Milestones

### M1.1 — Tooling and Validation Baseline

- Add explicit `typecheck` and `test` scripts.
- Configure test environment and one smoke test.
- Keep lint/build green.

Validation:

- `npm run typecheck`
- `npm run lint`
- `npm run test`
- `npm run build`

### M1.2 — Design Tokens and Global Styles

- Convert approved M0 tokens into CSS variables/the existing styling mechanism.
- Implement typography, surface, border, focus and semantic-state foundations.
- Resolve or explicitly defer secondary/tertiary token mismatch.
- Add reduced-motion and base focus-visible behavior.

Validation:

- token references are centralized,
- contrast/focus checks for representative controls,
- no copied Stitch reset that suppresses focus.

### M1.3 — Shared UI Primitives

- Implement the minimal primitives needed by route shells and common states: Button, Input, Select, Checkbox, Badge, Alert, Skeleton, Spinner, Progress, Dialog and basic table primitives.
- Add keyboard/focus and accessible-name tests.
- Avoid feature terminology in primitives.

### M1.4 — Providers and State Boundaries

- Create `AppProviders` composition.
- Configure Query client defaults without endpoints.
- Establish the narrow client-store pattern with no duplicated server entities.
- Add top-level error boundary strategy.

### M1.5 — Auth Interfaces and Guards

- Define provider-agnostic session/role/capability interfaces.
- Implement unauthenticated, forbidden and loading guard states.
- Avoid fabricated login endpoints or identity-provider callbacks.
- Test role routing and protected-content non-rendering.

### M1.6 — Layouts

- Implement Auth, Lecturer, Student, Admin and Exam layout shells.
- Normalize navigation from the inconsistent Stitch shells.
- Ensure ExamLayout removes ordinary navigation and exposes an exit-warning integration point.
- Verify keyboard landmarks and responsive collapse behavior.

### M1.7 — Route Tree and Route Shells

- Encode all 33 routes once from `docs/ROUTES.md`.
- Use route metadata for role/layout/feature ownership.
- Add safe not-found and error boundaries.
- Route components remain placeholders/shells; no feature behavior or fake API data.
- Test representative deep links and forbidden cases.

### M1.8 — Common Application States

- Implement PageHeader, LoadingPage, EmptyState, ErrorState, PermissionDenied, StatusBadge and ConfirmationDialog.
- Cover loading, empty, error, disabled, submitting, success, unauthorized and forbidden variants.
- Document extension points for offline/reconnecting/stale/partial data.

### M1.9 — Verification and Handoff

- Run all repository checks.
- Perform keyboard/focus and responsive smoke checks across each layout.
- Confirm no backend/AI/realtime contract was invented.
- Update current state, known issues, decisions and plan progress.
- Prepare the next feature ExecPlan; recommended first vertical slice is authentication/role shell only after identity contract confirmation, otherwise lecturer subject/material shell.

## 11. Risks and Mitigations

| Risk | Mitigation |
|---|---|
| Route regression or duplicate concepts | Generate/maintain one route definition aligned with `docs/ROUTES.md`; add deep-link tests. |
| UI-only authorization mistaken for security | Document guards as UX gates; do not fetch protected data before backend authorization. |
| Dependency sprawl | Install only approved candidates after checking existing utilities; record decisions. |
| Server/client state duplication | Keep query data out of Zustand; review ownership in tests/code review. |
| Inaccessible copied Stitch behavior | Implement semantic primitives and visible focus; never import the generated focus reset. |
| Desktop-only foundation | Verify layout shells at representative narrow and wide viewports. |
| Fake contracts becoming permanent | Use provider/service interfaces and test-local fixtures only; mark unknown DTO/event fields TBD. |
| AI authority ambiguity | Bake semantic distinction into common status/grading patterns before feature work. |
| Exam layout leakage | Test that active Viva shell excludes ordinary role navigation. |

## 12. Validation

Required repository checks after implementation:

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

Required behavior checks:

- unauthenticated, wrong-role and correct-role routing,
- not-found and route-error behavior,
- loading, empty, error, disabled and success common states,
- keyboard navigation and visible focus,
- dialog focus trap/restoration,
- responsive layout behavior,
- ExamLayout isolation,
- no unauthorized content prefetch/render,
- no direct AI-provider calls or fabricated API/realtime contracts.

## 13. Definition of Done

- Approved runtime/test dependencies are installed and recorded.
- All 33 normalized routes are represented by tested route shells.
- Provider composition, auth boundary, role guards and five layouts are implemented.
- Approved design tokens and minimum shared primitives/common states are implemented accessibly.
- Typecheck, lint, tests and build pass without failures caused by M1.
- Documentation reflects final implementation decisions and remaining TBDs.
- No feature screen, backend integration, realtime transport or AI provider integration was smuggled into foundation work.

## Progress Log

- 2026-10-05: Plan created from completed M0 Stitch audit. No dependencies installed and no production source changed.
- 2026-10-05: M1.1 complete — added `typecheck` and `test` scripts; configured Vitest, Testing Library and jsdom with initial primitive tests.
- 2026-10-05: M1.2–M1.4 complete — centralized the approved visual foundation in CSS tokens; implemented initial accessible primitives/common states, Query provider, narrow Zustand UI state and typed API client boundary.
- 2026-10-05: M1.5–M1.8 complete — added provider-agnostic session boundary, role guards, five layouts and all 33 normalized route shells. No endpoint, DTO, realtime event or AI provider was invented.
- 2026-10-05: Validation passed: `npm run typecheck`, `npm run lint`, `npm run test`, `npm run build`.
- 2026-10-05: M1.9 complete — verified unauthenticated and wrong-role guards plus accessible primitive states; inspected the login foundation route in the browser. M1 is complete.
