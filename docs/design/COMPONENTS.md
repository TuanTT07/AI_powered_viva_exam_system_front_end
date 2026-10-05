# Component Inventory

> Ownership plan derived from the 16-screen Stitch baseline and the current empty feature scaffolding. No production components are implemented in M0.

## A. Shared UI Primitives

Location: `src/components/ui/`

| Component | Stitch evidence / required behavior |
|---|---|
| Button | Primary, secondary, outlined, destructive and pending styles recur. |
| IconButton | Row actions, playback and navigation controls; always needs an accessible name. |
| Input | Search, grade entry and account forms. |
| Textarea | Question, model answer and lecturer feedback editing. |
| Select | Subject, status, Bloom level and source filters. |
| Checkbox | Batch selection, material selection and generated-question approval. |
| RadioGroup | Language/voice configuration and choice groups. |
| Switch | Configuration controls where a binary setting is confirmed. |
| Dialog | Import, high-impact confirmation and short account flows. |
| Drawer | Citation/source review and dense contextual detail. |
| Tabs | Question grading, list status and workspace sections. |
| Badge | Status, Bloom level, AI source and publication state. |
| Skeleton | Structured route and panel loading. |
| Spinner | Compact/pending actions only. |
| Progress | Upload, indexing, exam progress and completion. |
| Toast | Transient, non-critical action feedback. |
| Table primitives | Dense lecturer/admin/report data views. |
| Pagination | Question, exam, attempt, user and report lists. |
| Tooltip | Unlabelled icon explanation; never the only accessible name. |
| Avatar | User/student identity fallback. |
| Alert | Inline validation, error, warning and policy notices. |

Rules:

- no AIVES domain logic,
- token-driven styles,
- visible keyboard focus,
- semantic labels and status behavior,
- no second primitive library without an approved decision.

## B. Shared Application Components

Location: `src/components/common/`

| Component | Responsibility |
|---|---|
| PageHeader | Title, contextual metadata and actions. |
| Breadcrumbs | Role/subject/exam hierarchy. |
| AcademicRecordHeader | Record ID, semester, subject and verification metadata. |
| EmptyState | Explanation plus next action when authorized. |
| ErrorState | Page/panel error with recovery. |
| PermissionDenied | Unauthorized/forbidden fallback without leaking content. |
| LoadingPage | Route-level loading composition. |
| StatusBadge | Semantic status mapping with text/icon, not color only. |
| SearchFilterBar | Search, filters, reset and responsive overflow. |
| DataTable | Loading/empty/error/pagination shell around table primitives. |
| ConfirmationDialog | High-impact/destructive confirmation. |
| UnsavedChangesGuard | Warn before abandoning local edits. |
| SaveStatus | Unsaved/saving/saved/conflict state. |
| MetricCard | Repeated report/dashboard metric pattern. |
| FileDropzone | Accessible upload/drop/picker shell; feature rules remain outside. |
| ConnectionStatus | Generic connected/reconnecting/offline presentation. |

## Layout Components

Location: `src/app/layouts/`

- `AuthLayout`
- `LecturerLayout`
- `StudentLayout`
- `AdminLayout`
- `ExamLayout`

The first 16 Stitch frames show at least three inconsistent navigation variants. Production must normalize them into the role layouts above instead of copying each frame shell.

## C. Feature-Specific Components

Feature components live under their owning `src/features/<feature>/` folder.

### Learning Materials

- `LearningMaterialTable`
- `LearningMaterialStatusBadge`
- `MaterialProcessingProgress`
- `MaterialUploadPanel`
- `MaterialFailureActions`

### Question Bank

- `QuestionCard`
- `QuestionTable`
- `QuestionFilters`
- `BloomLevelBadge`
- `QuestionStatusBadge`
- `AIQuestionDraftCard`
- `AIProvenanceBadge`
- `QuestionImportDialog`
- `QuestionImportValidationTable`
- `CitationEvidenceDrawer`
- `QuestionEditorForm`
- `KeyPointEditor`

### Rubrics

- `RubricCard`
- `RubricCriteriaTable`
- `RubricCriterionEditor`
- `ScoreBandEditor`
- `RubricWeightSummary`

### Exams

- `ExamCard`
- `ExamTable`
- `ExamStatusBadge`
- `ExamScheduleSummary`
- `ExamConfigurationForm`
- `QuestionStrategyEditor`
- `StudentAssignmentTable`
- `ExamPublishChecklist`

### Viva Session

- `QuestionPanel`
- `ExamTimer`
- `ExamProgress`
- `AnswerRecorder`
- `TranscriptPanel`
- `TranscriptStatus`
- `AIProcessingIndicator`
- `FollowUpQuestion`
- `ConnectionIndicator`
- `MicrophoneIndicator`
- `DeviceCheckPanel`
- `ReconnectBanner`
- `ExamExitWarning`
- `SubmissionReceipt`

### Grading

- `AttemptQueueTable`
- `StudentAttemptHeader`
- `QuestionNavigator`
- `RecordingPlayer`
- `TranscriptReview`
- `RubricScorePanel`
- `AIScoreSuggestion`
- `AIFeedbackPanel`
- `FinalScoreEditor`
- `ScoreComparison`
- `GradingAuditTimeline`
- `GradeFinalizationPanel`
- `ResultPublicationDialog`

### Monitoring

- `AttemptProgressTable`
- `LiveAttemptStatus`
- `IncidentIndicator`
- `MonitoringSummary`

### Reports

- `ScoreDistributionChart`
- `QuestionDifficultyTable`
- `ReportMetricCard`
- `GradeLedgerTable`
- `ExportAction`

### Administration

- `UserTable`
- `UserFilters`
- `AccountEditorDialog`
- `RoleAssignmentEditor`
- `SubjectAssignmentEditor`
- `SystemSettingSection`

## Repeated Stitch Patterns to Consolidate

| Duplicate pattern | Observed across | Production owner |
|---|---|---|
| Left navigation + semester/user top bar | Lecturer, grading, reports and admin frames with several visual variants | Role layout components |
| Page heading + archive/semester metadata + actions | Nearly every lecturer/admin frame | `PageHeader` + `AcademicRecordHeader` |
| Search + filters + result count | Question bank, exams, attempts, users and materials | `SearchFilterBar` |
| Dense table + statuses + row actions + pagination | Question bank, exams, reports, users, attempts and materials | `DataTable` composition |
| AI source/suggestion treatment | Generated questions, Viva follow-up and grading | Shared semantic tokens; feature-specific cards |
| Academic ledger/verification strip | Reports, grading summary, completion and results | `AcademicRecordHeader` / feature composition |
| Transcript + recording evidence | Active Viva and grading | Different feature components over shared media/status primitives |
| Metric summary cards | Reports, attempts, users and materials | `MetricCard` |
| Save/publish/finalize action clusters | Question editor, exam editor and grading | `SaveStatus` plus feature-owned actions |
| Modal/drawer backdrop and shell | Import, user edit, citation review and publish confirm | `Dialog` / `Drawer` primitives |

## Architecture Boundaries

- Pages compose route-level features and extract route/search parameters.
- Feature hooks own queries, mutations, mappings and domain state.
- `src/services/` owns API, realtime and media transports.
- Shared primitives never import from features.
- AI provider SDKs and hidden prompts never belong in frontend components.
- `AIScoreSuggestion` and `FinalScoreEditor` must use different semantic labels and state models.
- Media and transcript components must be permission-aware and failure-aware.

## Reuse Checklist

Before creating a component:

1. search `src/components/ui/`,
2. search `src/components/common/`,
3. search the current and adjacent features,
4. verify ownership and state requirements,
5. create only when composition cannot cleanly provide the behavior.
