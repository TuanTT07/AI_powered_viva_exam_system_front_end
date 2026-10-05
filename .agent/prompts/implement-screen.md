# Prompt Pattern — Implement Screen

Use this pattern when implementing one approved screen.

## Instruction

Implement `<SCREEN_ID> — <SCREEN_NAME>`.

Before coding:
1. Read `AGENTS.md`.
2. Read the screen entry in `docs/design/SCREEN_REGISTRY.md`.
3. Read the relevant user flow.
4. Read `DESIGN_SYSTEM.md`, `COMPONENTS.md`, `UI_RULES.md`, and relevant states.
5. Inspect the existing route and feature.
6. Search for reusable components.
7. Inspect the Stitch reference.

Do not redesign the workflow.

Implement:
- screen structure,
- required interactions,
- responsive behavior,
- loading/empty/error/disabled states,
- accessibility requirements.

Use mock data only if backend integration is not part of the task, and isolate mocks from production paths.

After coding:
- run relevant validation,
- compare visually against Stitch,
- report reused and newly-created components.
