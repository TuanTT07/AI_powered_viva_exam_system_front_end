# State Management

Follow existing repository tools first.

Recommended ownership model:

## Local UI State

Use component/local reducer state for:
- modal open/close,
- selected tab,
- unsaved local form controls,
- hover/focus,
- temporary visual toggles.

## URL State

Use route/search params for shareable/navigation state:
- exam ID,
- subject ID,
- page/filter/search when appropriate.

## Server State

Use the repository server-state solution; recommended baseline is TanStack Query.

Examples:
- subjects,
- learning materials,
- questions,
- rubrics,
- exams,
- attempts,
- grades,
- reports.

Do not duplicate server entities into a global client store without a clear offline/workflow reason.

## Cross-Screen Client State

Use the repository global client state solution; recommended baseline is Zustand.

Possible examples:
- auth/session metadata if not provider-owned,
- temporary exam-creation wizard draft,
- narrowly scoped client preferences.

## Viva Runtime State

Use an explicit reducer/state machine model for session state.

Examples:
- current exam phase,
- current question,
- current follow-up count,
- recording state,
- transcript lifecycle,
- reconnect lifecycle.

Backend remains authoritative for:
- official question assignment,
- saved answer status,
- attempt status,
- exam completion,
- official grading.

## Derived State

Prefer deriving:
- progress percentage,
- remaining question labels,
- button enablement,

from canonical state rather than storing redundant copies.

## Anti-Patterns

Avoid:
- putting all API responses in Zustand,
- storing the same exam in Query cache and multiple global stores,
- many independent booleans for mutually exclusive Viva phases,
- silently trusting stale local attempt state after reconnect.
