# Screen Registry

> Audited against the approved Stitch project on 2026-10-05. The milestone's confirmed export baseline is 16 screens. See `raw/stitch/notes/SOURCE.md` for the live-canvas count discrepancy.

Status values:

- `reference`
- `planned`
- `missing-design`
- `ready-for-implementation`
- `implemented`
- `verified`

Source values: `Stitch`, `Inferred`, `Required State`.

Type values: `Route`, `Modal`, `Drawer`, `Layout`, `State`, `Component`.

No production AIVES component currently exists in `src/`; the current app is the Vite starter. Component names below are reuse targets from `COMPONENTS.md`, not implemented assets.

## A. Stitch-Provided Screens — Confirmed Baseline (16)

| ID | Screen | Source | Role | Feature | Type | Route | Stitch Reference | Status |
|---|---|---|---|---|---|---|---|---|
| STITCH-01 | Exam Results & Statistics Ledger | Stitch | Lecturer | Reports | Route | `/lecturer/exams/:examId/report` | Node `0fcb82680d7940e4bcf6e578eb921aa1` | reference |
| STITCH-02 | Question Bank | Stitch | Lecturer | Question Bank | Route | `/lecturer/subjects/:subjectId/questions` | Node `147e3e32d53e4e82aa56c450fe86e42b` | reference |
| STITCH-03 | Question Import Batch Validation | Stitch | Lecturer | Question Bank | Modal | — (owned by Question Bank) | Node `167fad4c3ce54fefb6dc8c70879cd3bb` | reference |
| STITCH-04 | Exam List | Stitch | Lecturer | Exams | Route | `/lecturer/exams` | Node `49a51fbd8174487d98b6c2335dc8a458` | reference |
| STITCH-05 | Active Viva — Recording a Follow-up | Stitch | Student | Viva Session | State | `/student/exams/:examId/session` | Node `506312ac1c0e45b18418bb051b24177c` | reference |
| STITCH-06 | Attempt Grading Review | Stitch | Lecturer | Grading | Route | `/lecturer/exams/:examId/attempts/:attemptId` | Node `55fdd2dd2a784af593a190e4eafe9cba` | reference |
| STITCH-07 | Question and Rubric Editor | Stitch | Lecturer | Question Bank / Rubrics | Route | `/lecturer/subjects/:subjectId/questions/:questionId` | Node `585c0cb02d4b4fbd9ca29cf0e25e3d92` | reference |
| STITCH-08 | Exam Configuration and Assignment | Stitch | Lecturer | Exams | Route | `/lecturer/exams/:examId/edit` | Node `6421e124837441fca29c2cffd5e09a46` | reference |
| STITCH-09 | User Management with Account Editor | Stitch | Admin | Administration | Route | `/admin/users` | Node `65aa25a9d615479e8efcbf5a469ce1ac` | reference |
| STITCH-10 | Student Results and Exam Record | Stitch | Student | Results | Route | `/student/results` | Node `6f3391a86cd146c09dffb7a7bdce73c9` | reference |
| STITCH-11 | Per-Question Grading Workspace | Stitch | Lecturer | Grading | State | `/lecturer/exams/:examId/attempts/:attemptId` | Node `962256be035446b68d17bbde4a089c57` | reference |
| STITCH-12 | Attempt Queue / Viva Records | Stitch | Lecturer | Grading | Route | `/lecturer/exams/:examId/attempts` | Node `9bb5df5ebc524371b3f990454e27ca09` | reference |
| STITCH-13 | Device Check, Instructions and Ready | Stitch | Student | Viva Session | Route | `/student/exams/:examId/check` | Node `a1d9e90cca944486b361aa63dbfe3a1e` | reference |
| STITCH-14 | Final Grade Summary and Publication | Stitch | Lecturer | Grading | State | `/lecturer/exams/:examId/attempts/:attemptId` | Node `a54f94b41e934a03bf1e84874acc7fe0` | reference |
| STITCH-15 | AI Question Review with Citation Drawer | Stitch | Lecturer | Question Bank | Route | `/lecturer/subjects/:subjectId/questions/generate` | Node `c751422c2b524ab79b1ce88993b8c2ac` | reference |
| STITCH-16 | Learning Materials and AI Knowledge Sources | Stitch | Lecturer | Learning Materials | Route | `/lecturer/subjects/:subjectId/materials` | Node `d016ceb171b34764945e37c7f6bc58fa` | implemented |

### Per-Screen Audit

| ID | Reuse targets | New feature candidates | Missing states | Accessibility / responsive issues | Architecture concern |
|---|---|---|---|---|---|
| STITCH-01 | PageHeader, MetricCard, DataTable, StatusBadge | GradeLedgerTable, ExportAction | Loading, empty, export failure, forbidden, partial totals | Dense desktop table; icon actions need names; no narrow layout | CSV/XLSX formats, final/released semantics and report DTOs are TBD. |
| STITCH-02 | SearchFilterBar, DataTable, Badge, Pagination | QuestionTable, BloomLevelBadge, AIProvenanceBadge | Loading, empty, error, unauthorized, generation/import pending | Wide table and icon-only row actions; filters need labels | AI drafts must not silently become approved questions. |
| STITCH-03 | Dialog, Progress, Alert, Table | QuestionImportDialog, ImportValidationTable | Uploading, parse failure, all-invalid, cancel, retry, submit failure | Exported overlay lacks dialog semantics/focus behavior; table overflows | Approved MVP: UTF-8 CSV, exact five-column schema, up to 500 data rows, partial import of valid rows, and imported questions remain drafts. |
| STITCH-04 | PageHeader, SearchFilterBar, DataTable, StatusBadge | ExamTable, ExamStatusBadge | Loading, empty, error, permission, publish pending | Desktop table needs responsive alternative; statuses need text+color | Exact exam enums and editability rules are TBD. |
| STITCH-05 | Alert, Progress, ConnectionStatus | QuestionPanel, AnswerRecorder, TranscriptPanel, ExamTimer | All Viva phases except recording/transcribing/follow-up; every recovery state | Mixed “recording” and “transcribing” copy can imply concurrent primary phases; live updates need announcements; desktop only | One canonical phase is required; transcript finality, timer, save confirmation and reconnect are backend-authoritative. |
| STITCH-06 | PageHeader, Tabs, SaveStatus | RecordingPlayer, TranscriptReview, AIScoreSuggestion, FinalScoreEditor | Transcript/AI unavailable, saving, conflict, locked, publish failure | Audio controls and score inputs need labels/keyboard support | AI suggestion and final score must be separate data and visual states. |
| STITCH-07 | PageHeader, Input, Select, Textarea, SaveStatus | QuestionEditorForm, KeyPointEditor, RubricCriterionEditor | Create mode, loading, validation, save error, conflict, locked | Long form needs landmark/error summary and responsive grouping | Question and rubric may be separately persisted; DTO and lock rules are TBD. |
| STITCH-08 | PageHeader, Input, Select, Tabs, SaveStatus | ExamConfigurationForm, StudentAssignmentTable | Create, loading, validation, empty students, conflict, publish blocked | Dense multi-section form; date/time and controls need explicit labels | Schedule timezone, selection strategy and follow-up limits are backend-owned. |
| STITCH-09 | SearchFilterBar, DataTable, Dialog, StatusBadge | UserTable, AccountEditorDialog, RoleAssignmentEditor | Loading, empty, error, save conflict, forbidden, locked account | Overlay needs dialog semantics; role/status not color-only; wide table | Allowed role/status transitions and subject scope are TBD. |
| STITCH-10 | PageHeader, StatusBadge, DataTable | ResultSummary, ScoreBreakdown, AppealAction | Pending, unreleased, loading, unavailable, forbidden | Charts/details need text equivalents; mobile hierarchy not shown | Student visibility and AI-feedback disclosure depend on release policy. |
| STITCH-11 | Tabs, Progress, SaveStatus | QuestionNavigator, TranscriptReview, RubricScorePanel | Evidence missing, AI pending/error, save conflict, locked | Three-column desktop layout needs reflow; evidence controls need accessible names | Keep as a state/tab of one grading route, not a duplicate route. |
| STITCH-12 | SearchFilterBar, DataTable, StatusBadge | AttemptQueueTable, GradingAuditTimeline | Loading, empty by filter, error, partial data, permission | Dense ledger table needs responsive alternative | Attempt, AI-evaluation, lecturer-review and release statuses must not be collapsed. |
| STITCH-13 | Alert, Progress, Button | DeviceCheckPanel, MicrophoneIndicator | Permission prompt/denied, no device, speaker failure, camera policy, offline, retry | Device results need semantic status; keyboard start path; mobile policy absent | Camera requirement, retry policy and eligibility remain TBD. |
| STITCH-14 | PageHeader, DataTable, Dialog, SaveStatus | ScoreComparison, GradeFinalizationPanel, PublicationDialog | Saving, conflict, partial grading, locked, publish pending/failure | Confirmation needs focus management; score differences need non-color cues | Finalize and publish are distinct operations only if backend confirms that workflow. |
| STITCH-15 | Checkbox, Drawer, Alert, Button | AIQuestionDraftCard, CitationEvidenceDrawer | Generating, no drafts, partial result, generation error, approval pending | Dense cards/drawer need heading order, labelled selection and small-screen treatment | AI text, confidence and citations are untrusted drafts until lecturer review. |
| STITCH-16 | FileDropzone, SearchFilterBar, DataTable, Progress | MaterialStatusBadge, ProcessingProgress, FailureActions | Empty, uploading, processing, failed, retry, delete pending, quota/error | Drag/drop needs keyboard picker; progress/status announcements; wide table | Accepted formats, size, storage quota and indexing lifecycle are TBD. |

## B. Required Inferred Route Screens (20)

These complete the 33-route map. “Missing design” means the production screen is required even though the confirmed 16-screen baseline does not provide a dedicated reference.

| ID | Screen | Source | Role | Feature | Type | Route | Stitch Reference | Status |
|---|---|---|---|---|---|---|---|---|
| INF-01 | Sign In | Inferred | Shared | Auth | Route | `/login` | Live-only node TD-01 is unconfirmed | missing-design |
| INF-02 | Lecturer Dashboard | Inferred | Lecturer | Dashboard | Route | `/lecturer` | — | missing-design |
| INF-03 | Assigned Subjects | Inferred | Lecturer | Subjects | Route | `/lecturer/subjects` | — | missing-design |
| INF-04 | Subject Overview | Inferred | Lecturer | Subjects | Route | `/lecturer/subjects/:subjectId` | — | missing-design |
| INF-05 | Create Question | Inferred | Lecturer | Question Bank | Route | `/lecturer/subjects/:subjectId/questions/new` | Reuse STITCH-07 structure | planned |
| INF-06 | Rubric List | Inferred | Lecturer | Rubrics | Route | `/lecturer/subjects/:subjectId/rubrics` | — | missing-design |
| INF-07 | Create Rubric | Inferred | Lecturer | Rubrics | Route | `/lecturer/subjects/:subjectId/rubrics/new` | Partial patterns in STITCH-07 | missing-design |
| INF-08 | Rubric Editor | Inferred | Lecturer | Rubrics | Route | `/lecturer/subjects/:subjectId/rubrics/:rubricId` | Partial patterns in STITCH-07 | missing-design |
| INF-09 | Create Exam | Inferred | Lecturer | Exams | Route | `/lecturer/exams/new` | Reuse STITCH-08 structure | planned |
| INF-10 | Exam Overview | Inferred | Lecturer | Exams | Route | `/lecturer/exams/:examId` | — | missing-design |
| INF-11 | Student Assignments | Inferred | Lecturer | Exams | Route | `/lecturer/exams/:examId/students` | STITCH-08 partial only | missing-design |
| INF-12 | Live Exam Monitoring | Inferred | Lecturer | Monitoring | Route | `/lecturer/exams/:examId/monitor` | — | missing-design |
| INF-13 | Student Dashboard | Inferred | Student | Dashboard | Route | `/student` | — | missing-design |
| INF-14 | Upcoming / Eligible Exams | Inferred | Student | Exams | Route | `/student/exams` | — | missing-design |
| INF-15 | Student Exam Detail | Inferred | Student | Exams | Route | `/student/exams/:examId` | — | missing-design |
| INF-16 | Submission Receipt | Inferred | Student | Viva Session | Route | `/student/exams/:examId/completed` | Live-only node TD-03 is unconfirmed | missing-design |
| INF-17 | Released Result Detail | Inferred | Student | Results | Route | `/student/exams/:examId/result` | STITCH-10 combines hub and detail | planned |
| INF-18 | Admin Dashboard | Inferred | Admin | Administration | Route | `/admin` | — | missing-design |
| INF-19 | Subject / Lecturer Assignment | Inferred | Admin | Administration | Route | `/admin/subjects` | — | missing-design |
| INF-20 | System Configuration | Inferred | Admin | Administration | Route | `/admin/settings` | Live-only node TD-02 is unconfirmed/partial | missing-design |

## C. State-Only Views

These are not routes. The 10 registry families cover all global states and the 18 Viva states defined in `STATES.md`.

| ID | Screen | Source | Role | Feature | Type | Route | Stitch Reference | Status |
|---|---|---|---|---|---|---|---|---|
| STATE-01 | Structured loading / skeleton | Required State | Shared | Cross-feature | State | Owning route | No dedicated frame | missing-design |
| STATE-02 | Empty data / no results | Required State | Shared | Cross-feature | State | Owning route | No dedicated frame | missing-design |
| STATE-03 | Error / retry / partial or stale data | Required State | Shared | Cross-feature | State | Owning route | Scattered examples only | missing-design |
| STATE-04 | Disabled / submitting / success | Required State | Shared | Cross-feature | State | Owning route | Scattered examples only | missing-design |
| STATE-05 | Unauthorized / forbidden | Required State | Shared | Auth | State | Owning route | No dedicated frame | missing-design |
| STATE-06 | Viva PREPARING / READY | Required State | Student | Viva Session | State | `/student/exams/:examId/session` | STITCH-13 is preflight, not runtime state | missing-design |
| STATE-07 | Viva AI_SPEAKING / WAITING_FOR_ANSWER | Required State | Student | Viva Session | State | `/student/exams/:examId/session` | No dedicated frame | missing-design |
| STATE-08 | Viva RECORDING / TRANSCRIBING / FOLLOW_UP | Required State | Student | Viva Session | State | `/student/exams/:examId/session` | STITCH-05 mixes these concepts | reference |
| STATE-09 | Viva AI_PROCESSING / NEXT_QUESTION / COMPLETING / COMPLETED | Required State | Student | Viva Session | State | Session/completed routes | Completed only in unconfirmed TD-03 | missing-design |
| STATE-10 | Viva RECONNECTING / SESSION_DISCONNECTED / NETWORK_ERROR / MIC_ERROR / STT_ERROR / AI_ERROR / TIMEOUT | Required State | Student | Viva Session | State | `/student/exams/:examId/session` | No dedicated frames | missing-design |

## D. TBD / Unconfirmed Live Stitch Frames (3)

These nodes were visible in the live canvas after the 16-node baseline. They are audited as provenance but are not counted as approved exports.

| ID | Screen | Source | Role | Feature | Type | Route | Stitch Reference | Status |
|---|---|---|---|---|---|---|---|---|
| TD-01 | Login — Invalid Credentials | Stitch | Shared | Auth | State | `/login` | Node `e96f0b09180449ef9c73749014bec0d2` | reference |
| TD-02 | AI Voice and Language Configuration | Stitch | Admin (TBD) | Administration | Route | `/admin/settings` (TBD) | Node `f095e581808a44158f18300913b4278a` | reference |
| TD-03 | Completed Viva Submission Receipt | Stitch | Student | Viva Session | Route | `/student/exams/:examId/completed` | Node `fff7456021a745d69a1f24081bb41226` | reference |

## Audit Totals

- Confirmed Stitch export baseline: **16 frames**.
- Live-only/unconfirmed Stitch nodes: **3**.
- Proposed production routes: **33**.
- Confirmed baseline frames map to: **13 unique production routes** plus overlays/states.
- Required inferred route screens: **20**.
- State-only registry families: **10**, covering the global state model and all **18 Viva states**.
- Route-level entries still lacking a confirmed dedicated design: **17** (`planned` reuse entries excluded).

The registry count is intentionally not treated as “number of pages”: route screens, overlays and state variants are different implementation units.
