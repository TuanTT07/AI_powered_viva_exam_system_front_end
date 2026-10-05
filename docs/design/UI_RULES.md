# UI Rules

## Loading

Do not show unexplained blank pages.

Use:
- skeleton for structured page loading,
- inline spinner for compact actions,
- button pending state for form submission.

Avoid blocking the entire app when only one panel is loading.

## Empty

Every data-driven list/table should define an empty state.

An empty state should:
- explain what is missing,
- provide the next useful action when allowed.

## Error

Do not use browser `alert()` for application errors.

Use:
- inline errors,
- toast for transient actions,
- page/panel error state for failed primary data.

Errors should be actionable when possible.

## Forms

- show validation near the relevant field,
- disable duplicate submission while pending,
- preserve entered values after recoverable server errors,
- clearly mark required fields.

## Confirmation

Require confirmation for destructive or high-impact actions such as:
- delete learning material,
- remove student assignment when consequential,
- publish/close exam when irreversible,
- finalize grade when backend policy treats it as locked.

Exact lock behavior: TBD.

## Tables

Tables must handle:
- loading,
- empty,
- error,
- pagination if needed,
- narrow viewport overflow.

## Role-Aware UI

Do not show controls users cannot use unless a disabled explanation has product value.

Forbidden content should not be fetched unnecessarily.

## Viva Session

During active exam:
- keep focus on the exam,
- make the current state obvious,
- never hide connection failure,
- never imply transcript is final while still partial,
- never imply an answer is saved before backend confirmation.

## Accessibility

Minimum expectations:
- semantic buttons,
- labels for inputs,
- keyboard focus,
- visible focus styles,
- sufficient contrast,
- status changes announced where appropriate,
- do not encode status by color alone.

## Motion

Use restrained motion.

Do not use distracting looping animations during the exam except subtle state indicators.

## Navigation

Active Viva Session should not expose ordinary application navigation that encourages accidental exit.

If leaving the exam is possible, show an explicit consequence warning.
