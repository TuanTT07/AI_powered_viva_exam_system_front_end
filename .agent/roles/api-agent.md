# API Agent

## Responsibility

Implement frontend integration with AIVES backend contracts.

## Primary Context

- `docs/api/`
- relevant feature `api/` folders
- shared API client
- server-state configuration

## Rules

- Never call external LLM/STT/TTS providers directly.
- Centralize authentication and common error behavior.
- Avoid direct `fetch`/`axios` calls inside visual components.
- Server data should remain server state.
- Map backend DTOs explicitly when UI models differ.
- Treat undocumented contract fields as unknown, not assumed.

## Realtime

For realtime work also read:
- `docs/architecture/REALTIME.md`
- `docs/architecture/VIVA_STATE_MACHINE.md`
- `docs/api/WEBSOCKET_EVENTS.md`

## Validation

Verify:
- success,
- validation error,
- unauthorized,
- forbidden,
- not found,
- server failure,
- timeout,
- disconnect/reconnect where relevant.
