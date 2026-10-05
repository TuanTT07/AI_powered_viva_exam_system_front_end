# Viva Session State Machine

This document defines the frontend conceptual state model for an active oral exam.

Exact backend enums/events may differ; adapt mappings without losing the state semantics.

## Primary Flow

```text
PREPARING
    ↓
READY
    ↓
AI_SPEAKING
    ↓
WAITING_FOR_ANSWER
    ↓
RECORDING
    ↓
TRANSCRIBING
    ↓
AI_PROCESSING
    ↓
┌───────────────────────┐
│                       │
▼                       ▼
FOLLOW_UP           NEXT_QUESTION
│                       │
└───────────┬───────────┘
            ↓
       AI_SPEAKING
```

At final question:

```text
AI_PROCESSING
→ COMPLETING
→ COMPLETED
```

## State Definitions

### PREPARING
Initialize attempt/session data and required devices.

Allowed next:
- READY
- MIC_ERROR
- NETWORK_ERROR
- AI_ERROR

### READY
Student is cleared to start.

Allowed next:
- AI_SPEAKING
- SESSION_DISCONNECTED

### AI_SPEAKING
Question/follow-up is being spoken or presented.

Do not start answer recording unless product rules explicitly allow interruption.

Allowed next:
- WAITING_FOR_ANSWER
- AI_ERROR
- SESSION_DISCONNECTED

### WAITING_FOR_ANSWER
System is ready for the student's answer.

Allowed next:
- RECORDING
- TIMEOUT
- SESSION_DISCONNECTED

### RECORDING
Capture answer.

UI:
- prominent recording state,
- timer,
- stop/submit behavior according to policy.

Allowed next:
- TRANSCRIBING
- MIC_ERROR
- TIMEOUT
- SESSION_DISCONNECTED

### TRANSCRIBING
Final transcript is being resolved.

Allowed next:
- AI_PROCESSING
- STT_ERROR
- SESSION_DISCONNECTED

### AI_PROCESSING
Backend/AI analyzes transcript against question/context.

Allowed next:
- FOLLOW_UP
- NEXT_QUESTION
- COMPLETING
- AI_ERROR
- SESSION_DISCONNECTED

### FOLLOW_UP
A generated follow-up becomes the next spoken prompt.

Allowed next:
- AI_SPEAKING

Must respect configured follow-up limit.

### NEXT_QUESTION
Backend has selected/confirmed the next main question.

Allowed next:
- AI_SPEAKING

### COMPLETING
Final server-side attempt completion is in progress.

Allowed next:
- COMPLETED
- AI_ERROR
- SESSION_DISCONNECTED

### COMPLETED
Terminal successful state.

No further answer capture.

---

## Error / Recovery States

### MIC_ERROR
Microphone unavailable or permission revoked.

Recovery depends on exam policy:
- retry permission/device selection,
- escalate,
- terminate/block.

### STT_ERROR
Speech recognition/transcription failed.

Do not fabricate transcript.

Recovery policy: TBD.

### AI_ERROR
Question/follow-up/analysis service failed.

Preserve session evidence and show controlled recovery.

### NETWORK_ERROR / SESSION_DISCONNECTED
Realtime or required network path unavailable.

Transition to:
- RECONNECTING,
then after authoritative sync return to the backend-confirmed state.

### TIMEOUT
Answer timer exceeded.

Backend policy determines whether:
- answer auto-submits,
- question is marked unanswered,
- examiner proceeds.

Frontend must not invent policy.

---

## Invariants

1. Only one primary Viva phase is active at a time.
2. Official question/follow-up sequence is backend authoritative.
3. Final transcript is distinguishable from partial transcript.
4. AI processing does not equal final grading.
5. Reconnect resumes from backend state, not guessed local state.
6. Follow-up count cannot exceed backend-configured maximum.
7. Completed attempts cannot return to recording locally.

## Recommended Implementation

Use:
- reducer with discriminated unions,
- or a state-machine library already present in the repository.

Avoid unrelated booleans such as:

`isRecording + isSpeaking + isThinking + isTranscribing`

without a canonical phase.
