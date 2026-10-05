# Design System

> Extracted from the 16-screen Stitch baseline on 2026-10-05. Normalize these values into production tokens during M1; do not copy generated Tailwind/runtime code into `src/`.

## Design Direction

The observed Stitch theme is **Academic Retro Viva**: professional, academic, calm, trustworthy, clear and evidence-oriented. It uses warm paper surfaces, ink-like navy, restrained terracotta accents and editorial typography.

Avoid:

- neon or sci-fi AI treatments,
- decorative gradients,
- excessive elevation,
- distracting animation during exams,
- visual language that makes AI appear more authoritative than the lecturer.

## Core Color Tokens

The following values recur consistently in the generated frame token configuration.

| Production token | Stitch semantic token | Value | Use |
|---|---|---:|---|
| `color-background` | `background` / `surface` | `#FCF9F3` | Warm page background |
| `color-surface` | `surface-container-lowest` | `#FFFFFF` | Cards, dialogs, data surfaces |
| `color-surface-muted` | `surface-container-low` | `#F6F3ED` | Subtle grouped areas |
| `color-surface-raised` | `surface-container` | `#F0EEE8` | Secondary panels |
| `color-surface-strong` | `surface-container-high` | `#EBE8E2` | Selected/strong grouping |
| `color-text-primary` | `on-surface` | `#1C1C18` | Primary body text |
| `color-text-secondary` | `on-surface-variant` | `#45464E` | Supporting text |
| `color-border` | `outline-variant` | `#C6C5CF` | Default dividers/borders |
| `color-border-strong` | `outline` | `#76767F` | Focused/important boundaries |
| `color-primary` | `primary-container` | `#1E2749` | Main brand/action navy |
| `color-primary-strong` | `primary` | `#081234` | High-emphasis navy |
| `color-primary-soft` | `primary-fixed` | `#DCE1FF` | Informational/selected surface |
| `color-secondary` | `secondary` | `#994530` | Terracotta semantic accent |
| `color-secondary-soft` | `secondary-fixed` | `#FFDAD2` | Warm highlighted surface |
| `color-tertiary` | `tertiary-container` | `#162652` | Secondary navy grouping |
| `color-error` | `error` | `#BA1A1A` | Destructive/error status |
| `color-error-soft` | `error-container` | `#FFDAD6` | Error surface |

The Stitch style-guide anchors also show `#C96A52` (secondary), `#2B3A67` (tertiary) and `#F7F4EE` (neutral). Their mismatch with generated semantic tokens must be resolved before implementation. Do not introduce both sets without a documented mapping.

### Status and AI Colors

- Success, warning and informational colors are used in individual frames but are not consistently named across exports. Exact normalized values remain **TBD** pending contrast checks.
- AI content primarily reuses navy/soft-primary surfaces plus explicit labels such as “AI đề xuất.” There is no need for a new futuristic accent.
- Never use color alone to distinguish AI suggestions, lecturer edits, saved final scores, draft status or publication status.

## Typography

| Role | Font | Size / line height | Weight / tracking |
|---|---|---|---|
| Display | Newsreader | `48px / 56px` | 500, `-0.02em` |
| Mobile display | Newsreader | `32px / 40px` | 500, `-0.01em` |
| Headline large | Newsreader | `32px / 40px` | 500, `-0.01em` |
| Mobile headline large | Newsreader | `26px / 34px` | 500 |
| Headline medium | Newsreader | `24px / 32px` | 500 |
| Headline small | Newsreader | `20px / 28px` | 600 |
| Title | Hanken Grotesk | `16px / 24px` | 600, `0.01em` |
| Body large | Hanken Grotesk | `16px / 26px` | 400 |
| Body | Hanken Grotesk | `14px / 22px` | 400 |
| Body small | Hanken Grotesk | `12px / 18px` | 400 |
| Label | JetBrains Mono | `13px / 18px` | 500, `0.04em` |
| Label small | JetBrains Mono | `11px / 16px` | 500, `0.06em` |

Use the label face selectively for IDs, statuses, timestamps and academic ledger metadata; long prose and controls remain in the body face.

## Spacing

Observed semantic values:

| Token | Value |
|---|---:|
| `space-xs` | `4px` |
| `space-sm` | `8px` |
| `space-md` | `16px` |
| `space-lg` | `24px` |
| `space-xl` | `40px` |
| `gutter` | `20px` |
| `gutter-desktop` | `24px` |
| `margin` | `20px` |
| `margin-desktop` | `40px` |

Keep the normalized production scale to `4, 8, 12, 16, 20, 24, 32, 40, 48` and map semantic tokens onto it.

## Radius and Elevation

| Token | Value |
|---|---:|
| default | `2px` |
| large | `4px` |
| extra large | `8px` |
| pill/badge | `12px` in exports; production pill behavior should be content-based |

The visual language is mostly flat with thin borders. Use a small shadow set only for true overlays or raised navigation. Exact shadow values remain **TBD** because the screen exports do not expose one consistent named scale.

## Component Treatments

### Buttons

- Primary: dark navy fill, white label, compact radius.
- Secondary: warm or muted surface with a visible border.
- Outlined: transparent/warm surface with strong navy/neutral border.
- Destructive: error semantic colors and explicit action text.
- Icon-only controls require accessible names and a visible focus indicator.
- Pending buttons retain their label context, block duplicate submission and expose progress semantically.

### Inputs and Selects

- Persistent visible labels; placeholders do not replace labels.
- Warm/white surface, neutral border and compact radius.
- Validation belongs next to the field; preserve values on recoverable errors.
- Read-only/locked fields need text or an icon with an accessible label, not color alone.

### Cards

- Paper-like white or muted surface, thin divider/border, restrained or no shadow.
- Group academic metadata consistently: record ID, subject, semester, status and timestamps.
- Avoid turning every section into an elevated card.

### Tables

- Clear header hierarchy, thin row dividers and explicit status text.
- Numeric grading columns align consistently.
- Row actions need text/tooltips and accessible names.
- On narrow viewports use horizontal scroll, priority-column reduction or a card/list alternative. Do not squeeze the desktop table.

### Badges and Statuses

- Use label typography, short text and an icon when helpful.
- Statuses must remain understandable without color.
- AI-related badges must say “AI draft,” “AI suggestion” or equivalent.
- Lecturer-confirmed final status must use explicit authoritative wording.

### Dialogs and Drawers

- Observed overlays include question import, account editing, citation/source review and result publication confirmation.
- Production overlays require a semantic dialog, labelled title, focus trap, initial focus, Escape policy, focus restoration and background inertness.
- Long review content such as citation evidence is better suited to a drawer; short high-impact confirmations use a dialog.

### Navigation and Layout

- Lecturer/Admin: left rail plus top contextual bar.
- Student: lighter top navigation and focused examination shell.
- Active Viva uses a dedicated `ExamLayout`; ordinary navigation must not encourage accidental exit.
- Breadcrumbs and academic record identifiers recur and should be shared application components.

## AI and Grading Hierarchy

### AI Suggested Score

- Label exactly as an AI suggestion.
- Show supporting evidence/confidence only when the backend provides it.
- Editable lecturer fields must not appear pre-confirmed merely because they contain an AI value.

### Lecturer Confirmed Final Score

- Use explicit “Lecturer confirmed” or equivalent status.
- Show unsaved, saved, locked and published as distinct states.
- Do not display an unsaved local edit as official.
- Publication is separate from final-score confirmation when the backend contract supports that distinction.

## Exam Environment

Prioritize question, speaker/listener state, timer, answer capture, transcript lifecycle, progress and connection status. Status changes that affect the exam must be announced through an appropriate live region without repeatedly interrupting speech/audio.

## Accessibility and Responsive Findings

The generated Stitch source globally suppresses focus outlines and contains no `aria-*` attributes across the 16 baseline frames. Production code must not inherit that behavior. All controls require visible `:focus-visible` styling, accessible names and semantic status handling.

All baseline frames are 1280px desktop canvases; no dedicated mobile/tablet frames were present. Responsive breakpoints, navigation collapse, table alternatives, dialog sizing and active-Viva small-screen policy remain **TBD** and require explicit verification in M1/M2.

## Unresolved Tokens

- normalized success, warning and information palettes,
- hover/pressed/disabled/focus colors,
- focus-ring color and thickness,
- named elevation/shadow scale,
- icon sizing scale,
- responsive breakpoints and content max-widths,
- dark mode (not evidenced as a product requirement),
- motion durations/easing,
- final mapping between style-guide anchors and generated semantic colors.
