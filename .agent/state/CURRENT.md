# Current Project State

> Update this file whenever the primary implementation milestone changes.

## Current Milestone

M0 — Stitch Audit & Frontend Foundation Planning.

## Current Goal

Convert the approved Stitch visual reference and AIVES requirements into an auditable route, screen, component, state and implementation plan before production coding begins.

## Audit Progress

- Confirmed the milestone baseline of 16 Stitch exports.
- Audited all 16 baseline frames in the authenticated Stitch canvas.
- Recorded three additional live-only nodes as unconfirmed/TBD rather than silently expanding scope.
- Normalized the production route proposal to 33 resource-oriented routes.
- Classified Stitch frames as routes, modal/state views and overlays.
- Mapped repeated patterns into shared primitives, shared application components and feature components.
- Extracted the core palette, typography, spacing and radius values from Stitch.
- Compared Viva coverage with the state machine and realtime rules.
- Audited Lecturer, Student and Admin flows.
- Created the M1 frontend-foundation ExecPlan.

## Complete for M0

- Stitch source/provenance record.
- Screen registry and per-screen audit.
- Route normalization and duplicate-concept decisions.
- Component inventory and duplicate-pattern consolidation.
- Design-system extraction with unresolved tokens marked TBD.
- Global and Viva state coverage audit.
- User-flow coverage and gap audit.
- Architecture review: the intended feature-based structure remains valid; no source reorganization is required in M0.
- M1 implementation plan.

## Remaining Before M1 Execution

1. Product owner confirms whether the three live-only Stitch nodes are approved.
2. Backend/auth owners confirm identity, REST, realtime and media contracts needed by foundation interfaces.
3. Team approves the 33-route map and the route-merging decisions.
4. Team approves the normalized token mapping, especially the style-guide/generated secondary and tertiary differences.
5. M1 is explicitly authorized; dependencies are not installed in M0.

## Next Step

Review and approve `.agent/plans/active/M1-frontend-foundation.md`, then implement the foundation in milestone order without feature screens or backend integration beyond typed boundaries/mocks isolated to tests.

## Blockers / TBD

See `.agent/state/KNOWN_ISSUES.md` for the complete list. Major blockers remain backend contracts, auth provider, responsive policy, Viva recovery policy and result/recording privacy rules.

## Last Validation

Documentation audit validated on 2026-10-05. Repository scripts available today: `npm run lint` and `npm run build`; there are no `typecheck` or `test` scripts yet.
