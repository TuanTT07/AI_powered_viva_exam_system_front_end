# AIVES portal UI refresh

## Goal

Apply the supplied AIVES interface direction consistently across lecturer, student, and admin portals while preserving all routes, roles, server-state hooks, API repositories, and accessibility behavior.

## Context

The supplied source folder introduces the approved product shell: full-width white top header, white left rail below the header, thin cool-gray borders, compact sans-serif interface typography, slate canvas, blue primary actions, grouped navigation and flat operational cards. The current app has the right functionality but a mixed academic-editorial visual treatment and an underdeveloped Admin shell.

## Scope

- Build a shared responsive application shell for all authenticated roles.
- Refresh global tokens, controls, tables, cards, dialogs, forms, states, and auth presentation.
- Add contextual icon navigation and compact role-aware header actions.
- Give Admin the same complete product-shell treatment without changing its API or routes.
- Use existing content and feature components; preserve API behavior.
- Verify desktop and mobile navigation and the existing critical routes.

## Non-goals

- No endpoint, repository, data-source or auth-contract changes.
- No removal of mocks or API integrations.
- No new backend APIs, feature workflows, or route changes.
- No changes to `.env` files.

## Relevant sources

- `AGENTS.md`
- `docs/design/DESIGN_SYSTEM.md`, `COMPONENTS.md`, `UI_RULES.md`, `STATES.md`, `SCREEN_REGISTRY.md`
- Supplied source folder: `/Users/ducanh/Downloads/JAVA/aives-—-hệ-thống-khảo-thí-vấn-đáp-&-chấm-điểm-ai/`
- `src/app/layouts/`, `src/index.css`, `src/components/ui/`, `src/features/administration/`

## Current behavior

- Role layouts provide a simple text navigation rail and a basic header.
- Feature views are functional but use inconsistent spacing, corners, and page-shell treatment.
- Administration has pages and APIs but lacks the visual navigation and content hierarchy of the supplied design.

## Target behavior

- A visibly unified, responsive app with the approved white header, left rail, slate content canvas and blue primary actions.
- Accessible controls retain labels, focus rings and semantic states.
- Existing API calls and query state remain unchanged.
- Admin pages live inside the same high-quality shell as Lecturer and Student views.

## Architecture constraints

- Layout and generic styling stay in `src/app/layouts/`, `src/index.css`, and `src/components/ui/`.
- Do not move feature business logic into pages or layouts.
- Preserve React Router role guards and TanStack Query data ownership.
- Do not add dependencies.

## Milestones

1. Record visual-source analysis and establish shared token/primitive overrides.
2. Implement responsive role-aware shell and global nav/header.
3. Align page, form, table, dialog, and state surfaces with the new system.
4. Review Administration pages inside the new shell and make targeted responsive refinements.
5. Typecheck, lint, test, build, and visually verify representative routes.

## Risks

- Shell CSS can affect dense feature tables and mobile layouts.
- Changing semantic colors may reduce contrast; retain strong text contrast and visible focus styles.
- Layout changes must not disturb role routing or logout behavior.

## Validation

- `npm run typecheck`
- `npm test`
- `npm run lint`
- `npm run build`
- Browser verification for login, Lecturer, Admin users/courses, and Student dashboard on desktop and mobile widths.

## Definition of done

- All roles render within the new shell with contextual navigation.
- API-connected components are untouched functionally.
- Admin is responsive and visually cohesive without a reference-page dependency.
- No introduced validation failures and no console errors on verified pages.

## Progress log

- 2026-10-16: Reviewed supplied ZIP and generated/analysed a standalone visual reference. The approved source layout is now the implementation target: full-width white top header, a white sidebar below it, grouped icon navigation, a compact profile area, slate canvas and blue primary actions.
- 2026-10-16: Replaced the role shell with a responsive source-matched header/sidebar composition, including desktop collapse and mobile drawer behavior. Updated global semantic styling so existing feature forms, tables, cards, dialogs and Admin inline styles inherit the new product surface without changing data hooks.
- 2026-10-16: Local browser checks confirm Lecturer dashboard uses the source-matched layout and sidebar collapse/expand works. Production API configuration was not modified.
- 2026-10-16: Regression validation passes: typecheck, 131/131 unit tests, build and diff check. Lint preserves three unrelated existing warnings and the existing Vite chunk-size warning. Browser verification confirms the Lecturer exam route renders with the approved source-matched shell.
- 2026-10-16: Re-read the supplied prototype code and replaced the shared shell with its actual layout conventions: 64px top bar, 256px/72px source-style rail, grouped navigation, source-style operational seal and application footer. Router guards, API repositories and TanStack Query ownership remain untouched; mock-only persona switching from the prototype was intentionally not transplanted into authenticated production navigation.
