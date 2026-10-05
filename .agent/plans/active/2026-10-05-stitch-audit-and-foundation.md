# ExecPlan — Stitch Audit and Frontend Foundation

## Goal

Transform the approved AIVES Stitch UI into a reliable implementation map and prepare the frontend foundation without blindly copying generated code.

## Context

AIVES requirements are defined, but the actual Stitch project must be normalized into:
- routes,
- features,
- shared components,
- UI states,
- role access,
- implementation order.

## Scope

- audit all Stitch screens,
- update Screen Registry,
- update Route Map,
- update Component Inventory,
- extract design tokens,
- identify missing production states,
- verify role/user flows,
- propose foundation implementation structure.

## Non-goals

- full feature implementation,
- backend API integration,
- realtime Viva integration,
- final AI provider integration.

## Relevant Sources

- `AGENTS.md`
- `.agent/PLANS.md`
- `.agent/state/`
- `docs/product/`
- `docs/design/`
- `docs/architecture/`
- `docs/api/`
- `docs/ROUTES.md`
- `raw/stitch/`
- approved Stitch project `16463711942931628972`

## Current Behavior

Documentation foundation existed with placeholder registry entries. `src/` contains only feature-folder scaffolding and the Vite starter; no AIVES production component or routing/state library is implemented.

## Target Behavior

Every approved Stitch frame has a known:
- screen/state ID,
- role,
- route or modal/state ownership,
- feature,
- component dependencies,
- implementation status.

## Architecture Constraints

- feature-based architecture,
- Stitch is visual reference only,
- shared primitives remain domain-agnostic,
- role layouts remain separate,
- active Viva uses ExamLayout.

## Milestones

### M1 — Inventory
List every Stitch frame and classify it.

**Status:** Complete. Sixteen baseline frames are classified; three live-only nodes are retained as unconfirmed/TBD.

### M2 — Routes
Normalize frames into production routes.

**Status:** Complete. The proposal contains 33 routes and removes duplicate ready/grading/user-detail concepts.

### M3 — Components
Identify repeated primitives, application components and feature components.

**Status:** Complete. Ownership and duplicate patterns are recorded in `docs/design/COMPONENTS.md`.

### M4 — States
Identify loading, empty, error, disabled, permission and Viva-specific missing states.

**Status:** Complete. Global states and all 18 Viva primary/recovery states are covered in documentation.

### M5 — Design Tokens
Extract typography, color, spacing, radius, shadow and major patterns.

**Status:** Complete with explicit TBDs. Palette, type, spacing and radius were extracted; interaction, shadow and responsive tokens need approval/verification.

### M6 — Foundation Plan
Produce implementation order for:
- routing,
- layouts,
- shared UI,
- auth/role guards,
- feature shells.

**Status:** Complete. See `.agent/plans/active/M1-frontend-foundation.md`.

## Risks

- treating visual variants as separate routes,
- duplicating components,
- copying generated Stitch architecture,
- missing exam/reconnect/error states,
- inconsistent role navigation.

## Validation

- all Stitch frames accounted for,
- no duplicate route concepts,
- every screen has role + feature,
- component ownership is clear,
- missing states recorded,
- docs agree with one another.

## Definition of Done

The repository contains an implementation-ready design/product map and a clear next ExecPlan for foundation coding.

## Progress Log

- 2026-10-05: Initial plan created.
- 2026-10-05: Read product, role, flow, design, architecture, API and realtime sources; inspected the Vite-only source scaffold and package scripts.
- 2026-10-05: Audited the authenticated Stitch canvas. The brief confirms 16 exports; the live canvas contains 19 screen nodes. Recorded the three additional nodes as unconfirmed rather than expanding scope.
- 2026-10-05: Completed the screen registry, 33-route normalization, component inventory, design-token extraction, UI-state/Viva audit and user-flow coverage review.
- 2026-10-05: Reviewed architecture boundaries and preserved the feature-based structure; no production source or dependencies changed.
- 2026-10-05: Created the M1 frontend foundation plan. M0 documentation work is complete pending stakeholder approval of recorded TBDs.
