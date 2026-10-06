# Exam Detail and Group 2 integration

The lecturer overview is registered at `/lecturer/exams/:examId` (INF-10). No dedicated Stitch Exam Detail frame exists, so the page is inferred from the approved STITCH-08 Exam Configuration visual language and the completed Group 2 screens. This inference does not redesign STITCH-08.

## Readiness model

The page derives, without persisting a readiness flag, four required sections:

- Basic information: valid title, subject, start time, duration (5–120), main questions (1–20) and follow-ups (0–10). A past start blocks editable exams but is allowed for historical read-only exams.
- Student roster: at least one valid roster entry.
- Scheduling: a saved schedule with valid non-overlapping slots, matching duration, valid unique roster references and every current roster student assigned exactly once.
- Question configuration: saved references that still resolve to approved questions from the exam subject; MANUAL matches the exact main-question count and RANDOM_POOL meets the minimum.

`READY` is shown only when all four sections are complete. It means frontend configuration is complete, not published, running, assigned to a backend room or production-ready without backend validation.

Each secondary query is independent. A roster, schedule or question query failure preserves the exam header and marks only that section unavailable with retry. Missing data is incomplete and navigates to the owning setup screen. Question eligibility warnings can recover through the subject Question Bank.

## Navigation and scope

The overview links to the list, edit, roster, scheduling and question configuration routes while preserving `examId`. DRAFT/SCHEDULED exams expose setup actions; IN_PROGRESS/COMPLETED/CANCELLED exams remain read-only. The page does not implement publishing, runtime allocation, monitoring, attendance, media, grading, reports, notifications or backend APIs/WebSockets.

The complete frontend Group 2 flow is list → detail → edit → roster → schedule → question configuration → detail. Shared TanStack Query keys and mock repositories keep updates visible within the SPA session.
