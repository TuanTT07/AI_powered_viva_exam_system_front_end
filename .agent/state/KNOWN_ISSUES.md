# Known Issues and Open Questions

Use this file for unresolved issues that affect implementation. Unknown behavior remains TBD; do not infer contracts from sample Stitch copy.

## Stitch Provenance and Scope

- The milestone brief confirms 16 exported screens, while the live canvas exposed 19 screen nodes on 2026-10-05.
- Login error, AI voice configuration and completed submission receipt are recorded as live-only/unconfirmed additions. Product ownership must confirm their status.
- `raw/stitch/` has no local screenshots or generated exports, and the `raw/stitch/README.md` referenced by `AGENTS.md` is missing.
- Exact frame names were not stored in local assets; registry names are normalized from visible headings and content.
- Several frames combine a route with a modal/drawer/state. They must not be implemented as one monolithic page.

## Missing Route-Level Designs

- Lecturer dashboard, subject list and subject overview.
- Rubric list, create and editor screens.
- Create exam, exam overview and dedicated assignment workflow.
- Lecturer live monitoring.
- Student dashboard, upcoming exams and exam detail.
- Admin dashboard, subject assignment and general system configuration.
- Confirmed-baseline login and completion receipt.
- No dedicated narrow/mobile/tablet frames exist.

## Missing Global UI States

- Route/panel loading and skeleton.
- Empty and no-filter-results.
- Primary and partial-data error.
- Unauthorized and forbidden.
- Disabled, submitting, mutation success/failure and conflict.
- Offline, stale-session and timeout patterns outside the Viva context.

## Missing Viva Designs

- `PREPARING`, runtime `READY`, `AI_SPEAKING`, `WAITING_FOR_ANSWER`.
- `AI_PROCESSING`, `NEXT_QUESTION`, `COMPLETING`.
- Confirmed-baseline `COMPLETED`.
- `RECONNECTING`, `SESSION_DISCONNECTED`, `NETWORK_ERROR`.
- `MIC_ERROR`, `STT_ERROR`, `AI_ERROR`, `TIMEOUT`.
- STITCH-05 visually combines recording and transcribing language; production must enforce one canonical primary phase and distinguish partial transcript from final transcript.

## Product Decisions

- Final visibility timing and granularity of student results.
- Whether per-question score, AI feedback and lecturer feedback are visible to students.
- Whether lecturer comments are mandatory.
- Whether finalization and publication are one or two backend operations.
- Whether completed results can be appealed and what the UI may expose.
- Whether students may replay/download audio or video after release.
- Whether account/user editing requires a deep-linkable route or remains an overlay.

## Exam and Viva Behavior

- Maximum main questions and default maximum follow-ups.
- Answer timeout defaults and timeout outcome.
- Microphone permission denial/device loss behavior during an active answer.
- Camera requirement and fallback by exam type.
- Prolonged network-loss and retry/escalation policy.
- Whether AI speech can be interrupted/replayed and any replay limits.
- Answer cancellation/re-record policy.
- Server-driven versus client-derived timer source.
- Exact definition of answer accepted/saved.

## AI and Knowledge Processing

- LLM, STT and TTS providers/models are backend concerns and TBD.
- Vietnamese academic terminology adaptation and confidence behavior.
- RAG document indexing lifecycle, accepted formats, size/quota and retry rules.
- Citation/confidence fields and thresholds exposed by backend.
- Streaming behavior for generation, transcript and grading.
- The live voice-config frame contains provider/security claims that are not approved contracts.

## Backend Contracts

- REST endpoint paths and DTOs.
- Pagination and filtering format.
- Realtime transport and event/command names.
- Authentication/identity provider and callback/recovery routes.
- Exam, attempt, question, material and grading enums/capabilities.
- Concurrency/409 reconciliation rules.
- Export formats and generated-file behavior.
- Server timestamp/timezone and eligibility rules.

## Security and Privacy

- Recording retention and deletion policy.
- Recording/video access, replay and download permissions.
- Consent wording and proof.
- Transcript correction policy and audit history.
- Sensitive-data caching/prefetch restrictions.
- Accessibility alternative policy for audio prompts without leaking restricted content.

## Design System and Accessibility

- Normalize the Stitch style-guide anchors versus generated semantic color values.
- Success/warning/info palettes and contrast are unresolved.
- Focus ring, disabled, hover and pressed tokens are unresolved.
- Shadow/elevation, breakpoints, icon sizing and motion tokens are unresolved.
- Stitch exports suppress focus outlines and contain no `aria-*` attributes; this must not carry into production.
- Dense desktop tables and three-column grading layouts have no responsive specification.
- Minimum supported viewport/orientation for active Viva is TBD.

## Tooling / Quality

- No `typecheck` script; `npm run build` currently runs `tsc -b`.
- No test script or test framework is configured.
- Accessibility automation and browser verification are not configured.
- Dependency choices in the M1 plan are proposals only; none are installed.
