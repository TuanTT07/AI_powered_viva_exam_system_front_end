# Roles and Permissions

This document describes frontend-visible role responsibilities. Backend authorization remains authoritative.

## Admin

### Can
- manage user accounts,
- assign roles,
- manage lecturer/subject relationships,
- manage system configuration,
- configure supported languages,
- manage STT/TTS-related configuration exposed by backend,
- view administrative system status where authorized.

### Should Not
- grade students unless also explicitly assigned a lecturer role,
- access exam recordings without appropriate policy permission.

---

## Lecturer

Lecturers may act as:
- question author,
- exam creator,
- examiner,
- grader.

### Can
- manage learning materials for assigned subjects,
- create/import/edit questions,
- request AI-generated draft questions,
- approve/reject AI-generated questions,
- manage rubrics,
- create exams,
- assign students,
- configure Viva limits,
- monitor exam progress,
- inspect transcripts and evidence,
- inspect AI score suggestions,
- adjust and confirm final grades,
- view reports,
- export grades.

### Authority
Lecturer-confirmed score is the official final score.

---

## Student

### Can
- view eligible/upcoming exams,
- view exam instructions,
- run device checks,
- participate in the Viva session,
- submit spoken answers,
- view result/feedback when released.

### Cannot
- access question banks,
- access hidden rubrics/answer keys,
- access other students' transcripts or recordings,
- edit official grades,
- view unreleased results.

---

## Permission Design Rules

1. Hide irrelevant navigation when possible.
2. Do not rely on hiding as the only security mechanism.
3. Forbidden route access must show an appropriate fallback or redirect.
4. Sensitive content should not be prefetched for unauthorized roles.
5. Student exam routes should verify current eligibility/status before showing active exam controls.
