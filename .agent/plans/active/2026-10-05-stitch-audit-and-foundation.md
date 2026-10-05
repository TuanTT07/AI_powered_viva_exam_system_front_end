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
- `docs/product/`
- `docs/design/`
- `docs/ROUTES.md`
- `raw/stitch/`

## Current Behavior

Documentation foundation exists. Actual Stitch frame-to-route mapping is incomplete.

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

### M2 — Routes
Normalize frames into production routes.

### M3 — Components
Identify repeated primitives, application components and feature components.

### M4 — States
Identify loading, empty, error, disabled, permission and Viva-specific missing states.

### M5 — Design Tokens
Extract typography, color, spacing, radius, shadow and major patterns.

### M6 — Foundation Plan
Produce implementation order for:
- routing,
- layouts,
- shared UI,
- auth/role guards,
- feature shells.

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
