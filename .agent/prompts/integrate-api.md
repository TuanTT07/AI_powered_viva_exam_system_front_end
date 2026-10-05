# Prompt Pattern — Integrate API

Connect `<FEATURE/SCREEN>` to the AIVES backend.

Before changing code:
1. Read `docs/api/API_CONTRACT.md`.
2. Read `docs/api/ERROR_HANDLING.md`.
3. Inspect the shared API client.
4. Inspect current feature query/mutation patterns.
5. Confirm whether contract fields are finalized.

Rules:
- do not invent undocumented backend fields,
- keep DTO mapping explicit,
- keep API calls outside visual components,
- use existing server-state conventions,
- handle expected error states,
- preserve loading and optimistic/pessimistic behavior intentionally.

If a required backend field or endpoint is missing, mark it as a blocker rather than silently mocking production behavior.
