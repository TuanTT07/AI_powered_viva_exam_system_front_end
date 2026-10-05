# Realtime Architecture

The active Viva Session requires near-real-time behavior.

## Goals

- low perceived latency,
- deterministic state transitions,
- reconnect support,
- authoritative backend state,
- clear degraded-mode UI.

## Transport

Preferred transport depends on backend:

- WebSocket for bidirectional event-heavy session control,
- SSE for server-to-client streaming when client commands use HTTP,
- WebRTC only if media architecture requires it.

Exact transport: TBD.

## Frontend Responsibilities

- connect with authenticated session context,
- subscribe to the correct attempt/session,
- process typed events,
- maintain connection status,
- deduplicate events when required,
- recover after disconnect,
- request authoritative snapshot on reconnect,
- update Viva state machine.

## Frontend Must Not

- generate official follow-up questions locally,
- decide official next question,
- mark an answer saved without backend confirmation,
- finalize attempt status locally.

## Connection States

Suggested:
- `connecting`
- `connected`
- `reconnecting`
- `degraded`
- `disconnected`
- `failed`

## Reconnect Strategy

1. detect loss,
2. stop unsafe actions,
3. show reconnect status,
4. retry according to bounded policy,
5. after reconnect, obtain latest authoritative session snapshot,
6. reconcile client state,
7. resume.

## Event Ordering

If backend provides:
- sequence number,
- event ID,
- server timestamp,

use them for deduplication/order checks.

Exact protocol: TBD.

## Partial Transcripts

Partial STT text is ephemeral.

UI should distinguish:
- partial transcript,
- final transcript.

Do not persist/display a partial transcript as finalized evidence.

## Latency

The interface should show a clear AI processing state when a follow-up takes longer than conversational expectations.

Do not fake a generated follow-up before backend sends it.
