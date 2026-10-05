# UI States

Every implemented screen must define its relevant states.

## Global State Categories

- initial/loading,
- ready/default,
- empty,
- error,
- disabled,
- success,
- unauthorized,
- forbidden,
- offline/disconnected where relevant.

## Learning Material States

- upload idle,
- uploading,
- processing,
- ready,
- processing failed,
- delete pending.

## AI Question Generation States

- configuration,
- generating,
- generated drafts,
- generation error,
- partial result if backend supports it,
- approving,
- rejecting/editing.

## Exam States

Product-level examples:
- draft,
- scheduled,
- open/ready,
- in progress,
- completed,
- closed,
- cancelled.

Exact backend enum: TBD.

## Student Attempt States

Examples:
- not eligible,
- upcoming,
- device check required,
- ready,
- active,
- reconnecting,
- completed,
- grading pending,
- result released.

Exact backend enum: TBD.

## Viva Session UI States

At minimum:

1. PREPARING
2. READY
3. AI_SPEAKING
4. WAITING_FOR_ANSWER
5. RECORDING
6. TRANSCRIBING
7. AI_PROCESSING
8. FOLLOW_UP_READY / FOLLOW_UP
9. NEXT_QUESTION
10. COMPLETING
11. COMPLETED
12. NETWORK_ERROR
13. MIC_ERROR
14. STT_ERROR
15. AI_ERROR
16. SESSION_DISCONNECTED
17. RECONNECTING
18. TIMEOUT

See `docs/architecture/VIVA_STATE_MACHINE.md`.

## Grading States

- attempt loading,
- transcript available,
- transcript unavailable/error,
- AI score pending,
- AI score available,
- lecturer editing,
- saving final grade,
- saved,
- locked/finalized if backend supports locking.

## Result States

- pending,
- unreleased,
- released,
- unavailable/error.
