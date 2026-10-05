# Business Rules

## BR-001 — Final Grade Authority

AI-generated grades are suggestions.

Only lecturer-confirmed grades can be presented as final official grades.

---

## BR-002 — Question Approval

AI-generated questions are drafts until approved by an authorized lecturer.

Draft questions must not silently enter the official question bank.

---

## BR-003 — Follow-up Limits

AI follow-up questions are bounded by exam configuration.

The frontend must display progress based on backend-authoritative limits.

---

## BR-004 — Exam Eligibility

A student may enter an exam only when backend eligibility/status allows it.

The frontend must not derive eligibility only from local time.

---

## BR-005 — Question Selection

Question selection may be random or adaptive.

Selection logic is backend-owned unless explicitly specified otherwise.

Frontend displays assigned questions; it does not choose official exam questions independently.

---

## BR-006 — Auditability

The system should preserve:
- question sequence,
- answer transcript,
- AI follow-up sequence,
- AI grading suggestion,
- lecturer final decision,
- relevant timestamps.

Frontend must avoid overwriting audit history with unsaved local assumptions.

---

## BR-007 — Sensitive Evidence

Recordings, video and transcripts are sensitive assessment data.

Access depends on role and policy.

---

## BR-008 — Results Release

Students see results only after backend release policy permits them.

Exact release policy is TBD.

---

## BR-009 — Recording

Recording/video behavior depends on exam configuration and privacy policy.

If recording is required and permission is denied, frontend must block or escalate according to backend policy rather than silently continuing.

---

## BR-010 — Language

STT/TTS language is configured by exam/system policy.

The UI must show the effective language when it affects the exam experience.
