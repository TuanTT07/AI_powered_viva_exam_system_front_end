# Frontend Architecture

## Architectural Style

Use feature-based architecture.

Recommended dependency direction:

```text
pages
  ↓
features
  ↓
shared components / hooks
  ↓
services / lib
```

Avoid reverse dependencies from shared layers into domain features.

## Suggested Source Structure

```text
src/
├── app/
│   ├── router/
│   ├── providers/
│   ├── layouts/
│   └── guards/
├── pages/
├── features/
│   ├── auth/
│   ├── dashboard/
│   ├── subjects/
│   ├── learning-materials/
│   ├── question-bank/
│   ├── rubrics/
│   ├── exams/
│   ├── viva-session/
│   ├── grading/
│   ├── monitoring/
│   ├── reports/
│   ├── students/
│   └── administration/
├── components/
│   ├── ui/
│   └── common/
├── services/
│   ├── api/
│   ├── realtime/
│   ├── storage/
│   └── media/
├── hooks/
├── store/
├── lib/
├── types/
├── constants/
└── styles/
```

Adapt to the existing repository instead of forcing a migration without a plan.

## Pages

Responsibilities:
- route-level composition,
- route param extraction,
- high-level feature composition.

Avoid:
- complex grading logic,
- raw API calls,
- WebSocket protocol handling,
- large reusable UI blocks.

## Features

A feature owns:
- domain components,
- domain hooks,
- feature-specific state,
- query/mutation wrappers,
- domain types/mappers,
- feature tests.

## Shared Components

Shared UI must remain domain-agnostic.

Bad:
`components/ui/FinalGradeCard`

Good:
`features/grading/components/FinalGradeCard`

## Services

Services own integration infrastructure:
- API client,
- authentication transport,
- realtime transport,
- media interfaces.

## External AI

Frontend → AIVES Backend → AI Orchestration → LLM/STT/TTS/RAG

Frontend must not own provider secrets or official exam selection/grading logic.

## Role Layouts

Use role-oriented layouts for navigation:
- LecturerLayout
- StudentLayout
- AdminLayout

Use `ExamLayout` for active Viva Session.

## Error Boundaries

Use route/feature error boundaries where the framework supports them.

An error in a secondary panel should not unnecessarily crash the entire workspace.
