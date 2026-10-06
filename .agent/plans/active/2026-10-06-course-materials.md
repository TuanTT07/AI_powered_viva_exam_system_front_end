# Course Materials / RAG Documents

## Goal

Deliver a lecturer-only, subject-scoped materials workspace at `/lecturer/subjects/:subjectId/materials` where lecturers can validate, upload, monitor, retry, and delete document metadata for future AI question generation.

## Context

Learning Materials (F02) is the upstream subject resource for future RAG-backed question generation. The frontend must expose a typed, mock-only processing boundary without claiming that parsing, embeddings, indexing, or retrieval are real.

## Scope

- Register the existing materials route with the lecturer layout and guards.
- Add domain types, validation, an in-memory typed repository, TanStack Query hooks, and focused tests.
- Support PDF, DOCX, PPTX, and TXT selections; enforce 25 MB/file, ten files/selection, non-empty files, and normalized filename+size duplicate detection per subject.
- Provide loading, empty, error, upload selection/validation/pending, processing, ready, failed, retry, deletion confirmation, mutation error, and responsive states.
- Simulate deterministic processing: ordinary files become `READY`; a seeded failed material supports retry and predictable transition to `READY`.
- Update route/design/state documentation with the implemented frontend contract and backend limitations.

## Non-goals

- Real upload, parsing/OCR, storage, extraction, embeddings, vector DB, RAG retrieval, question generation, WebSockets, previews, downloads, renames, folders, tags, or bulk deletion.

## Relevant Sources

- `AGENTS.md`, `docs/ROUTES.md`, `docs/product/FEATURES.md`, `docs/product/USER_FLOWS.md`, `docs/product/ROLES.md`
- `docs/design/SCREEN_REGISTRY.md`, `docs/design/STATES.md`, `docs/design/DESIGN_SYSTEM.md`, `docs/design/COMPONENTS.md`, `docs/design/UI_RULES.md`
- `docs/architecture/ARCHITECTURE.md`, `docs/architecture/STATE_MANAGEMENT.md`, `docs/architecture/DATA_FLOW.md`, `docs/api/API_CONTRACT.md`
- Existing Question Bank/repository/hook/import conventions.
- Live Stitch project, STITCH-16 node `d016ceb171b34764945e37c7f6bc58fa`.

## Current Behavior

The route is registered in planning documentation and currently resolves to a lecturer placeholder. Question Bank establishes the current typed in-memory repository and subject-scoped TanStack Query pattern. No materials feature exists.

## Target Behavior

The materials route uses the existing lecturer shell, reads `subjectId`, and renders a compact upload panel plus material table. The table uses subject-scoped records only, semantic statuses, retry for failed records, and destructive deletion confirmation. Accepted `File` objects exist only during the local upload mutation.

## Architecture Constraints

- Feature code stays under `src/features/learning-materials/`.
- Server-style entities belong to the query/repository boundary, never Zustand or browser storage.
- Query keys and mutation invalidation include exactly the affected subject.
- No raw file contents are persisted.
- Existing role guards remain authoritative.
- User-facing UI does not claim mock processing is real RAG indexing.

## Milestones

1. Inspect the registered route, existing boundaries, and live STITCH-16 frame.
2. Add the route, domain/repository/query/validation layers and focused tests.
3. Compose accessible upload, status list, retry and deletion UI with responsive styles.
4. Update scoped documentation and run static, test, build, browser, and Stitch checks.
5. Commit and push only after all checks pass.

## Risks

- Route order can let the generic lecturer placeholder shadow the concrete page.
- Mutable in-memory mock records can leak across tests if isolation is not explicit.
- File validation must preserve mixed selections and never retain raw file content after the mutation.
- Stitch advertises real RAG/OCR and different limits; those claims must not leak into the approved mock UI contract.

## Validation

- `npm run typecheck`, `npm run lint`, `npm run test`, `npm run build`.
- Browser verification of the route, list states, selection/dragging, validations, upload/processing/failure/retry/delete, subject isolation, mobile and keyboard behavior, console logs.
- Live comparison against STITCH-16.

## Definition of Done

- Materials route is guarded and subject-scoped.
- The approved file contract and deterministic mock lifecycle are covered by tests and UI.
- No raw files are persisted, all new checks pass, and documentation names the remaining backend/RAG work.

## Progress Log

- 2026-10-06: Verified Question Import was merged as `ef4cc7f`; synchronized `main` and baseline passed (one pre-existing Rubric lint warning). Created `feature/course-materials`.
- 2026-10-06: Confirmed route and inspected STITCH-16 directly in the approved live project. The frame has an academic heading, bordered dropzone, compact knowledge summary/filter strip, wide document ledger, ready/processing/failed rows and retry/delete actions. Its shown OCR/vector claims and 50 MB limit conflict with the approved MVP and will not be reproduced.
- 2026-10-06: Implemented the route, typed subject-scoped repository/query boundary, validation, deterministic seeded failure/retry flow, upload panel, ledger and confirmation dialog. Static checks pass; browser verified the protected route, status rows/progress, retry, delete cancel and clean console. Browser file-chooser automation did not expose a chooser for the hidden input, while mixed-selection validation is covered by focused tests.
