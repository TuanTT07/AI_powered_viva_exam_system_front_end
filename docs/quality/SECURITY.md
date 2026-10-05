# Frontend Security Rules

## Principles

- Backend authorization is authoritative.
- Never expose provider secrets in frontend code.
- Never call LLM/STT/TTS providers directly from the browser.
- Avoid storing sensitive exam evidence in persistent browser storage unless explicitly approved.
- Do not log transcripts, tokens, answer keys or grading evidence to production console logs.

## Authentication

Exact provider: TBD.

Frontend responsibilities:
- handle authenticated session,
- handle expiry,
- route unauthorized users safely,
- avoid flashing protected content before permission resolution.

## Sensitive Data

Sensitive examples:
- recordings,
- video,
- transcript,
- answer keys,
- hidden rubric details,
- unreleased grades.

Only request/display them when necessary for the authorized role.

## XSS / Rendering

Do not render model-generated or user-generated HTML without sanitization.

Prefer plain text rendering for AI feedback unless a safe renderer is explicitly used.

## Tokens

Do not place long-lived secrets in:
- source code,
- Vite public environment variables,
- localStorage without architecture approval.
