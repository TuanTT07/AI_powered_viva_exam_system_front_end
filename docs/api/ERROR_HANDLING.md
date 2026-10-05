# Error Handling

## Goals

- predictable UX,
- no silent data loss,
- clear recovery,
- no fabricated exam state.

## Generic Categories

### 400 Validation
Show field-level or contextual error.

### 401 Unauthenticated
Route to the repository auth recovery flow.

### 403 Forbidden
Show permission-aware fallback.

### 404 Not Found
Show resource-not-found state.

### 409 Conflict
Refresh/reconcile when state changed elsewhere.

Important for:
- grading finalization,
- exam status,
- concurrent edits.

### 422 Domain Validation
Show domain-specific reason when backend exposes it.

### 429 Capacity / Rate Limit
Show retry guidance according to backend metadata.

### 5xx Server Error
Keep user data when safe and offer retry.

### Timeout / Network
Distinguish transport failure from application rejection.

## Viva-Specific Errors

Never collapse all errors into a generic toast.

Examples:
- microphone permission denied,
- media device lost,
- STT unavailable,
- realtime disconnected,
- session invalidated,
- exam closed,
- AI processing failure,
- answer timeout.

Viva error UX should follow `VIVA_STATE_MACHINE.md`.

## Mutations

For destructive/high-impact mutations:
- use pending state,
- prevent duplicate submission,
- do not show success until backend confirms.

## Grading

If final grade save fails:
- preserve lecturer edits locally,
- clearly show unsaved status,
- do not display the unsaved value as confirmed official data.
