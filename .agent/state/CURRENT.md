# Current Project State

> Update this file whenever the primary implementation milestone changes.

## Current Milestone

M1 — Frontend Foundation.

## Current Goal

Establish the reusable frontend foundation required before feature-page implementation.

## Foundation Progress

- React Router, TanStack Query and Zustand installed and recorded in ADR-009.
- Vitest/Testing Library baseline and explicit `typecheck`/`test` scripts added.
- Centralized design tokens, focus styles and reduced-motion behavior added.
- Initial primitives, common states, provider composition and typed API boundary added.
- Provider-agnostic session state, role guards, five layouts and 33 route shells added.
- No feature data, backend endpoint, realtime protocol or AI provider is implemented.

## Complete

- M0 audit and foundation plan.
- M1.1–M1.9 frontend foundation implementation and validation baseline.

## Remaining Before Feature Implementation

1. Product owner confirms whether the three live-only Stitch nodes are approved.
2. Backend/auth owners confirm identity, REST, realtime and media contracts.
3. Implement the first authorized vertical feature slice using the foundation.
4. Add route/guard integration tests once an auth adapter is chosen.

## Next Step

Choose and plan the first feature slice. Recommended start: authentication/role adapter after contract confirmation, or Lecturer learning-material shell when a backend contract is available.

## Blockers / TBD

See `.agent/state/KNOWN_ISSUES.md` for the complete list. Major blockers remain backend contracts, auth provider, responsive policy, Viva recovery policy and result/recording privacy rules.

## Last Validation

M1 validated on 2026-10-05: `npm run typecheck`, `npm run lint`, `npm run test` and `npm run build` pass.
