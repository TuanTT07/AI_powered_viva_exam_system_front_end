# API Session Expiry Recovery

## Goal
Recover safely when an authenticated API request returns HTTP 401 by clearing client state, returning the user to login, and explaining that the session expired.

## Context
The API client currently normalizes 401 responses but only initial `/api/auth/me` recovery clears the session. A later expired token leaves protected pages displaying raw request errors.

## Scope
- Publish an internal unauthorized event from authenticated API requests that receive HTTP 401.
- Have `SessionProvider` clear token/query/session state and mark the expiry reason.
- Route guards preserve the requested location and Login displays a re-authentication message.
- Cover the client, provider, and guard behavior with tests.

## Non-goals
- No refresh-token mechanism or backend contract changes.
- HTTP 403 remains permission handling, not global logout.

## Relevant Sources
- `docs/api/API_CONTRACT.md`, `docs/api/ERROR_HANDLING.md`
- `src/services/api/client.ts`, `src/app/providers/`, `src/app/guards/`, `src/features/auth/`

## Architecture Constraints
Keep authentication transport at the centralized API boundary and preserve backend-authoritative authorization.

## Validation
Run typecheck, lint, affected tests, full test suite, and build.

## Progress Log
- 2026-10-21: Created after confirming API-mode 401 recovery only occurs during initial session restoration.
- 2026-10-21: Added a centralized authenticated-401 event, session/cache cleanup in `SessionProvider`, preserved return location through the guard, and added the re-authentication notice on Login.
- 2026-10-21: Added client, provider, and login coverage. Typecheck, lint, all 202 tests, and production build pass.
