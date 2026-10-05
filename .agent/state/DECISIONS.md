# Architecture Decisions

This file stores durable decisions that future agents must preserve unless explicitly superseded.

---

## ADR-001 — Feature-Based Architecture

**Decision:** Organize business logic by domain feature rather than by role.

Examples:
- `question-bank`
- `rubrics`
- `exams`
- `viva-session`
- `grading`

Role-specific behavior is handled through permissions, routes and layouts.

**Reason:** Avoid duplicating the same business domain under Admin/Lecturer/Student folders.

---

## ADR-002 — AI Is Assistive, Lecturer Is Authoritative

**Decision:** AI may suggest questions, follow-ups, comments and scores. The lecturer owns the final grade.

**UI consequence:** AI suggestions and final lecturer decisions must be visually and semantically distinct.

---

## ADR-003 — Frontend Does Not Call AI Providers Directly

**Decision:** LLM, RAG, STT and TTS are accessed through AIVES backend/orchestration services.

**Reason:** Security, auditability, prompt governance, provider switching, rate limiting and exam evidence.

---

## ADR-004 — Viva Session Uses Explicit State Modeling

**Decision:** The Viva workflow must use an explicit state machine/reducer model rather than unrelated booleans.

**Reason:** Prevent impossible combinations such as simultaneously recording, transcribing and playing AI audio.

---

## ADR-005 — Stitch Is a Visual Reference

**Decision:** Stitch output is not copied directly as production architecture.

**Reason:** Production code must preserve routing, state, reuse, accessibility, error handling and domain boundaries.

---

## ADR-006 — Server State and Client State Stay Separate

**Decision:** Remote backend data uses the repository server-state mechanism. Cross-screen ephemeral client state uses the repository client-state mechanism.

**Recommended baseline:** TanStack Query + Zustand.

**Reason:** Avoid duplicated caches and inconsistent ownership.

---

## ADR-007 — Exam Layout Is Isolated

**Decision:** Active student Viva sessions use a dedicated `ExamLayout`.

**Reason:** Remove distracting navigation and reduce accidental exam exits.

---

## ADR-008 — Documentation Uses Context Routing

**Decision:** Agents read only task-relevant documentation by default.

**Reason:** Reduce context pollution and token waste.

---

## ADR-009 — M1 Foundation Stack

**Decision:** Use React Router for route/layout composition, TanStack Query for server-state infrastructure and Zustand only for narrow cross-screen UI state.

**Reason:** This implements the approved ownership model without storing backend entities in a client store. API/realtime contracts remain behind service boundaries until confirmed.

**Testing baseline:** Vitest, Testing Library and jsdom.
