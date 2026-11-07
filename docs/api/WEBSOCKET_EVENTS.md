# Speech WebSocket contract — source verified03/11/2026

Source: BE main `aef1275328acd6f97c67c27e780cd442fb6d263a`, SpeechController/SpeechProtocol/SpeechSessionService and doc/MODULE3_SPEECH.md. Deployment/provider operation not established by this source review.

REST issues one-use ticket (JWT STUDENT + owned IN_PROGRESS attempt); connect `/ws/interview/speech?ticket=...` with allowed browser Origin. No JWT/provider key in query; no logging tickets/audio/transcripts.

Client JSON requires UUID requestId:
- `answer.start`: questionTurnId (AI TranscriptTurn.id), audio `{encoding:'PCM_S16LE',sampleRate:16000,channels:1}`.
- `answer.end`: answerId from answer.started, separate requestId.
- `ping`: heartbeat, approximately10seconds between questions.

Wait session.ready then answer.started before binary capture. Raw mono16kHz signed16 little-endian; no container/base64. Recommended20–100ms frames, max32768bytes and even byte count. Client sends50ms frames, bounded bufferedAmount, flushes before answer.end.

Server envelope: `{type,requestId,answerId,data}`; IDs may be null.

| Type | Data / meaning |
|---|---|
| session.ready | encoding/sampleRate/channels/maxFrameBytes/maxAnswerSeconds, sttProvider, ttsProvider=browser, ttsLanguage. Only transport readiness. |
| answer.started | questionTurnId, deadline ISO. Permits audio. |
| transcript.partial | segmentId numeric string, revision, text. Replace same segment; not persisted. |
| transcript.final | Final recognition segment. Still not proof of DB commit. |
| answer.finalizing | Lock capture/audio; wait for persistence. |
| answer.finalized | transcriptTurnId/text receipt. One answer committed, no next question/score/completion. |
| speech.error | code/message/retryable. Preserve unknown-save state; no auto replay. |
| pong | Heartbeat acknowledgement. |

Only process current answerId and fresh segment revisions; final segments are not overwritten by later partials. Timer-triggered finalization can have null requestId. Backend is authoritative for deadlines; FE does not finish the exam on local clock zero. Ignore late-audio INVALID_STATE after known server finalizing so the client does not cancel its in-flight commit.

For lost ACK/reload: GET `/api/interview/attempts/{attemptId}/speech/answers/{answerId}`.404 may be temporary; keep uncertain state and allow checking again. No mid-answer resume/replay. Metadata stores only answerId scoped to authenticated user/attempt/prompt, never raw audio/text. NO_SPEECH can be retried only while backend still accepts the prompt.

## Not implemented / future interview contract
Old conceptual names session.snapshot/question.ready/followup.ready/attempt.completed are NOT speech events and are not consumed as real events. The backend has no complete start/current/next/finish contract yet. Full interview transitions require a future verified backend contract, not guessed FE events.


## Question audio update — 2026-11-07
TTS provider metadata is now `deepgram`. The student listen button calls
POST `/api/interview/attempts/{attemptId}/speech/questions/{questionTurnId}/audio`,
then downloads `audioPath` through the authenticated API client as an MP3 Blob.
Playback uses HTML audio, cancels when leaving/changing questions and releases its Blob URL.
Backend defaults to female `flux-hoa-vi` (Early Access). No provider key or browser voice installation is needed in FE.
Existing browser-TTS documentation above is superseded by this flow.


## Minh voice and latency update — 2026-11-07
The current backend default is male `flux-minh-vi`. The room prepares the current
question MP3 as soon as the active question arrives, before speech connection or listen.
Listen shares the pending request; replay reuses its Blob within the current question.
Preparation is aborted/discarded on question, user or active-state change and unmount.
Speculative errors are silent and retried on explicit listen. No recording starts during playback.
First playback may still wait for the provider if preparation has not finished.
