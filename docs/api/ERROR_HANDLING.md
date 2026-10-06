# Error Handling

## Goals

- predictable UX,
- no silent data loss,
- clear recovery,
- no fabricated exam state.

## API foundation normalization

`ApiError` preserves a safe backend message, HTTP status, optional code and string field errors without exposing stack traces or HTML proxy pages. It distinguishes network failure, timeout and caller cancellation. Timeouts use `VITE_API_TIMEOUT_MS` (default 15000 ms), caller abort signals are respected, and timers are cleaned up. Feature repositories must pass these errors to existing error states and must not silently switch from API mode to mock mode.

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

Admin detail, password, delete and lecturer assignment mutations show pending state, invalidate targeted TanStack Query keys after success and preserve backend errors. A failed assignment or destructive action is not retried against mock data.

For destructive/high-impact mutations:
- use pending state,
- prevent duplicate submission,
- do not show success until backend confirms.

Question Bank API mode validates Course and Question UUIDs before requests, keeps detail read-only, and never falls back to mock after network, timeout, 404 or 409 failures. Delete is confirmed and non-optimistic; approval invalidates detail and matching list queries.

Authentication API mode treats 401/403 from `/api/auth/me` as logged out, while network, timeout and 5xx errors remain recoverable session-initialization errors. Invalid credentials use a generic message. JWTs are stored only in `sessionStorage` with an expiry timestamp; no password or token is logged or rendered.

## Grading

If final grade save fails:
- preserve lecturer edits locally,
- clearly show unsaved status,
- do not display the unsaved value as confirmed official data.
