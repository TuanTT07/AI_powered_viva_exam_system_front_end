# Feature Catalog

## F01 — Authentication and Session

Purpose:
- sign in,
- maintain authenticated session,
- resolve user role and permissions,
- route users to the correct workspace.
- explicitly sign out from every authenticated workspace and remove local session/cache data.

Primary roles:
- All

---

## F02 — Learning Materials

Purpose:
- manage course documents used as references for question generation/RAG.

Lecturer actions:
- upload,
- inspect processing status,
- remove/replace when allowed.

Key states:
- uploaded,
- processing,
- ready,
- failed.

---

## F03 — Question Bank

Purpose:
- manage approved Viva questions.

Capabilities:
- create manually,
- import,
- AI-generate draft questions from learning materials,
- edit,
- approve/reject,
- tag by subject/topic,
- tag by Bloom level,
- connect to rubric criteria.

Bloom baseline:
- remember,
- understand,
- apply,
- analyze.

---

## F04 — Rubrics

Purpose:
- define grading criteria and score scales.

Capabilities:
- create/edit rubric,
- attach criteria,
- define score bands,
- associate with questions/exams.

---

## F05 — Exam Management

Purpose:
- create and configure Viva exams.

Capabilities:
- choose subject,
- assign students,
- define schedule,
- define duration,
- define number of main questions,
- define maximum follow-ups,
- configure question selection strategy,
- publish/close exam.

---

## F06 — Adaptive Viva Session

Purpose:
- conduct the oral exam.

Capabilities:
- TTS question playback,
- microphone capture,
- STT transcription,
- adaptive AI follow-up,
- answer timer,
- question progress,
- connection status,
- reconnect recovery,
- session completion.

This is the core differentiating feature.

---

## F07 — AI-Assisted Grading

Purpose:
- assist lecturers with evidence-based scoring.

Capabilities:
- show transcript,
- show question/rubric,
- show AI suggested score,
- show strengths,
- show weaknesses/missing concepts,
- show timing/fluency signals when available,
- allow lecturer adjustment,
- save lecturer final score.

---

## F08 — Monitoring and Audit

Purpose:
- make the examination traceable.

Capabilities:
- exam progress,
- question history,
- transcript history,
- AI suggestion history,
- final grade history,
- recording/video evidence when enabled.

---

## F09 — Student Feedback and Results

Purpose:
- provide released outcomes to students.

Capabilities:
- final score,
- per-question score when policy allows,
- lecturer/AI feedback according to release policy,
- exam status.

---

## F10 — Reports and Export

Purpose:
- provide cohort-level insight.

Examples:
- score distribution,
- hardest questions,
- response quality rates,
- completion rates,
- grade export.

---

## F11 — Administration

Purpose:
- operate AIVES.

Capabilities:
- users,
- roles,
- subject assignments,
- system configuration,
- supported languages.
