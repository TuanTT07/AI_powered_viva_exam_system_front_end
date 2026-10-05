# UI Rules

## Loading and Partial Data

- Never show an unexplained blank page.
- Use a skeleton for structured page/panel loading, an inline spinner for compact actions and a labelled pending state for form submission.
- Do not block the whole application while one secondary panel loads.
- When some panels succeed and others fail, keep confirmed content visible and label the failed/partial scope.
- Never render placeholder values that could be mistaken for real scores, transcripts, eligibility or exam status.

## Empty

Every data-driven list, table, chart and evidence panel defines an empty state. It explains what is missing and provides the next authorized action. “No results for this filter” is distinct from “no records exist.”

## Error and Recovery

- Do not use browser `alert()`.
- Use field errors for validation, inline/panel errors for scoped failures, page errors for primary-data failure and toasts only for transient feedback.
- Preserve safe user input after recoverable errors.
- Distinguish network/timeout failures from application rejection.
- Do not collapse microphone, STT, realtime, AI and session errors into one generic Viva toast.
- Never claim success before backend confirmation.

## Disabled, Pending and Success

- Disabled controls remain discoverable only when an explanation has product value.
- Pending actions prevent duplicate submission and retain the original action context.
- Success states identify what changed and whether it is saved, finalized, locked or published.
- A locally edited grade is not official until confirmed by backend data.

## Forms

- Provide persistent labels, required/optional indication and contextual help where needed.
- Show validation near the field and an error summary for long forms when helpful.
- Preserve entered values after recoverable server errors.
- Warn before discarding meaningful unsaved edits.
- Read-only and locked fields require semantic text, not styling alone.
- Date/time input and display must follow backend timezone-safe values; official eligibility is not derived from the browser clock alone.

## Confirmation

Require confirmation for destructive or high-impact actions such as:

- deleting/replacing learning material,
- removing consequential student assignments,
- publishing/closing an exam,
- finalizing a grade when locking applies,
- publishing a result to students,
- changing user roles/statuses when consequential.

Production dialogs require a labelled title, appropriate description, initial focus, focus trap, Escape policy, background inertness and focus restoration. Exact locking/reversibility behavior is TBD.

## Tables and Dense Data

Tables handle loading, empty, error, partial data, pagination and narrow-view overflow. Row actions have accessible names. Statuses are not color-only. On narrow screens, intentionally choose horizontal scrolling, column prioritization or a card/list alternative.

## Role and Permission UI

- Hide irrelevant navigation where possible, but never treat hiding as authorization.
- Do not prefetch protected content for unauthorized roles.
- Unauthorized handles authentication recovery; forbidden handles authenticated lack of access.
- Sensitive transcripts, recordings, rubrics, answer keys and results are rendered only after backend authorization/release checks.
- Student exam controls require backend-confirmed eligibility and attempt state.

## AI Content

- Label generated questions as drafts until lecturer approval.
- Label AI follow-ups as AI-generated prompts while retaining the backend-authoritative sequence.
- Label scores and feedback as AI suggested/assisted.
- Visually and semantically separate AI suggestions from lecturer edits and lecturer-confirmed final scores.
- Do not expose hidden prompts, private rubrics, answer keys or unsupported confidence data.
- Never stream partial AI output as a final question, score or decision.

## Viva Session

- Use one canonical primary phase from `VIVA_STATE_MACHINE.md`.
- Keep the current phase, timer, question progress, recording/transcript state and connectivity visible.
- Partial transcript and final transcript have different labels and behavior.
- Freeze unsafe actions during disconnect/reconciliation.
- Resume only from a backend-confirmed snapshot.
- Do not imply an answer is saved before acknowledgement.
- Do not permit local return to recording after confirmed completion.
- Use `ExamLayout`; ordinary navigation is removed. Any allowed exit explains consequences.
- Camera, microphone, timeout and prolonged-disconnect policy remain TBD.

## Accessibility

Minimum production requirements:

- semantic landmarks, headings, buttons, links, tables and form controls,
- programmatic labels and error relationships,
- full keyboard operation and logical focus order,
- visible `:focus-visible` treatment,
- WCAG AA contrast targets,
- status conveyed with text/icon as well as color,
- status changes announced with appropriately scoped live regions,
- captions/text alternative for audio prompts when policy permits,
- accessible playback/record controls,
- reduced-motion support for non-essential motion,
- no focus loss when dialogs/drawers close.

The generated Stitch source suppresses all focus outlines and includes no `aria-*` attributes in the 16 baseline frames. This is a reference limitation and must not be copied into production.

## Responsive Behavior

The confirmed Stitch baseline provides 1280px desktop frames only. Production must define and verify:

- navigation collapse for Lecturer/Admin/Student layouts,
- data-table behavior below desktop width,
- form section stacking,
- dialog/drawer sizing and scroll containment,
- sticky action behavior without obscuring content,
- grading evidence ordering on narrow screens,
- active Viva minimum supported viewport/orientation and device policy,
- minimum touch target size.

Breakpoints and small-screen exam policy remain TBD. Responsive behavior must not hide critical connection, timer, transcript or authority information.

## Motion

Use restrained motion. Avoid decorative loops during the exam. Processing/recording indicators may animate subtly, must respect reduced-motion preferences and must retain a non-motion cue.

## Navigation

- Route concepts follow `docs/ROUTES.md`.
- Active Viva does not expose ordinary workspace navigation.
- Overlay/state frames do not become routes merely because Stitch renders them separately.
- Preserve browser back/forward behavior where safe; guard unsaved or active-exam exits explicitly.
