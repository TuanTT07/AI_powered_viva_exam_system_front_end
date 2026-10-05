# Prompt Pattern — Implement Feature

Implement `<FEATURE>` according to the approved product flow and architecture.

Before coding:
1. Inspect existing feature structure.
2. Read relevant product and business rules.
3. Read all screen registry entries belonging to this feature.
4. Read required API/realtime contracts.
5. Search for reusable components and utilities.

Create an ExecPlan first if the feature spans multiple screens or workflows.

Requirements:
- pages remain thin,
- domain behavior stays inside the feature,
- server state and client state remain separate,
- permission behavior is explicit,
- all required UI states are implemented,
- no external AI provider is called directly.

Complete only after repository checks pass.
