# Resolve PR 54 conflicts

## Goal
Merge origin/main into feature/lecturer-courses-api-integration and push a conflict-free, validated branch.

## Context
Main received independent admin/student UI refactors after the portal adaptation. Ten files conflict.

## Scope
Resolve dependencies, shared shell/styles, admin screens, student dashboard and Viva room; retain nonconflicting main changes.

## Non-goals
No merge into main, no new backend or speech contracts, no production mock fallback.

## Relevant Sources
AGENTS.md; .agent/PLANS.md; docs/architecture/VIVA_STATE_MACHINE.md; docs/architecture/REALTIME.md; docs/api/WEBSOCKET_EVENTS.md; docs/api/AI_CONTRACT.md; existing completed portal/navigation plans.

## Current Behavior
The feature has source-adapted navigation, explicit mock isolation and typed-answer demo. Main adds academic styling and independent Viva repository/state-machine seams.

## Target Behavior
Preserve the approved resource-scoped navigation, source dashboard with production-safe data and typed-answer demo. Keep incoming Viva modules and their tests available without replacing the explicit demo with automatically fabricated answers. Preserve main AudioVisualizer, TranscriptMessage and ExamCard improvements. Use incoming AdminUserDetail presentation while retaining lecturer-only queries and inline mutation/load errors. Account editor closes on success, disables pending saves and shows mutation errors in the existing shared dialogs, covering the same main bug fixes.

## Architecture Constraints
Keep existing query contracts and shared primitives; API Viva remains unavailable until a supported contract exists. Keep layered utilities rather than introducing global Tailwind preflight. Keep lucide 1.58 and the existing Tailwind plugin configuration.

## Milestones
1. Inspect both versions and record semantic decisions.
2. Resolve all conflicts and validate the merged tree.
3. Commit merge, restore excluded local .env, push and verify PR mergeability.

## Risks
Global reset regressions; fabricated production student metrics; losing local environment settings. The .env-only stash must be restored after committing.

## Validation
npm run typecheck; npm run lint; npm run test; npm run build; git diff --check; verify no unmerged entries or conflict markers.

## Definition of Done
Checks pass, regular merge commit is pushed, PR is mergeable and local .env changes are preserved and uncommitted.

## Progress Log
- Inspected all conflicts. Retained resource navigation, production-safe dashboard and typed demo as described above; integrated main admin detail presentation and retained all new independent Viva modules/tests.
- Validation passed: typecheck, lint, 47 test files / 168 tests, production build. Build retains the existing large-chunk advisory. All unmerged entries and conflict markers resolved. Final operational step is committing/pushing this merge and querying GitHub mergeability.
