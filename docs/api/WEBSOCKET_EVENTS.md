# Realtime Event Contract

> Event names are placeholders until backend protocol is finalized.

## Envelope Recommendation

```ts
type RealtimeEvent<T> = {
  id: string;
  type: string;
  sessionId: string;
  sequence?: number;
  serverTimestamp: string;
  payload: T;
};
```

Use backend's actual schema when available.

## Conceptual Server → Client Events

### session.snapshot
Authoritative current Viva session state.

### question.ready
Current main question is ready.

### tts.started
AI question playback started.

### tts.completed
AI question playback completed.

### transcript.partial
Ephemeral partial STT text.

### transcript.final
Final transcript for the answer.

### ai.processing.started
AI analysis has started.

### followup.ready
Adaptive follow-up generated.

### next_question.ready
Next main question selected.

### answer.accepted
Backend confirms answer/evidence saved.

### timer.updated
Only if timer is server-driven.

### attempt.completing
Completion started.

### attempt.completed
Attempt officially completed.

### session.error
Structured exam/session failure.

## Conceptual Client → Server Commands

Depending on transport:
- start attempt,
- start answer,
- stop/submit answer,
- acknowledge playback,
- reconnect/resume.

Exact commands: TBD.

## Reconnect

After reconnect, prefer an authoritative snapshot rather than replaying guessed UI transitions.

## Deduplication

If event IDs or sequence numbers are provided:
- ignore duplicates,
- detect gaps where practical,
- resync on invalid sequence.

## Security

Every realtime connection must be scoped to the authenticated user's authorized session/attempt.
