# Component Inventory

This file defines expected ownership. Update it after auditing the actual Stitch UI and source code.

## Shared UI Primitives

Location:

`src/components/ui/`

Expected examples:
- Button
- IconButton
- Input
- Textarea
- Select
- Checkbox
- RadioGroup
- Switch
- Badge
- Tooltip
- Modal/Dialog
- Drawer/Sheet
- Tabs
- Table primitives
- Pagination
- Skeleton
- Spinner
- Toast
- Progress
- Avatar

Rules:
- no AIVES domain logic,
- reusable across multiple features,
- uses design tokens.

---

## Shared Application Components

Suggested location:

`src/components/common/`

Examples:
- PageHeader
- EmptyState
- ErrorState
- PermissionDenied
- ConfirmationDialog
- StatusBadge
- DataTable
- SearchFilterBar
- Breadcrumbs
- LoadingPage

---

## Layout Components

Suggested location:

`src/app/layouts/`

- AuthLayout
- LecturerLayout
- StudentLayout
- AdminLayout
- ExamLayout

---

## Domain Components

### Question Bank
- QuestionCard
- QuestionTable
- BloomLevelBadge
- QuestionStatusBadge
- AIQuestionDraftCard
- QuestionFilters

### Rubrics
- RubricCard
- RubricCriteriaTable
- ScoreBandEditor

### Exams
- ExamCard
- ExamStatusBadge
- ExamScheduleSummary
- StudentAssignmentTable
- ExamConfigSummary

### Viva Session
- QuestionPanel
- ExamTimer
- ExamProgress
- AnswerRecorder
- TranscriptPanel
- AIProcessingIndicator
- FollowUpQuestion
- ConnectionIndicator
- MicrophoneIndicator
- DeviceCheckPanel
- ReconnectBanner

### Grading
- TranscriptReview
- RubricScorePanel
- AIScoreSuggestion
- AIFeedbackPanel
- FinalScoreEditor
- GradingAuditTimeline

### Reports
- ScoreDistributionChart
- QuestionDifficultyTable
- ExportAction

## Reuse Rule

Before creating a component:
1. search `src/components`,
2. search the current feature,
3. search adjacent features,
4. create only when existing behavior cannot be composed cleanly.
