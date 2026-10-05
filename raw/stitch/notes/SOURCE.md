# Stitch Source Record

- **Project:** AIVES — AI-powered Viva Exam System
- **Approved Stitch project:** https://stitch.withgoogle.com/projects/16463711942931628972
- **Purpose:** Approved visual reference for the AIVES frontend.
- **Confirmed export baseline:** 16 screens.
- **Audit date:** 2026-10-05.

## Source Rules

1. Stitch is a visual reference, not the production architecture.
2. Do not copy Stitch-generated code blindly into `src/`.
3. Normalize frames into routes, layouts, states, overlays and reusable components before implementation.
4. Unknown backend behavior remains **TBD**. A visual label or sample value is not an API or business-rule contract.
5. AI output remains advisory. Only a lecturer-confirmed grade may be presented as the official final grade.

## Availability and Provenance

`raw/stitch/` contained no exported screenshots or generated code at audit time; only placeholder files were present. The approved project was therefore inspected directly in the authenticated Stitch canvas.

The milestone brief declares 16 exported screens. The live canvas exposed 19 screen nodes during the audit. Node order identifies the first 16 as the confirmed export baseline and three later nodes as live-only additions:

- login with an invalid-credentials error,
- AI voice/language configuration,
- student completion receipt.

These three nodes are retained as **unconfirmed/TBD references** in `docs/design/SCREEN_REGISTRY.md`. They do not silently expand the approved 16-screen milestone scope. Product ownership must confirm whether they are approved additions, replacements or work-in-progress frames.

## Visual System Observed

- Stitch theme label: `Academic Retro Viva`
- Headline font: `Newsreader`
- Body font: `Hanken Grotesk`
- Label/code font: `JetBrains Mono`
- Primary family anchor: `#1E2749`
- Secondary family anchor: `#C96A52` (generated frame tokens commonly use `#994530` for the semantic secondary role)
- Tertiary family anchor: `#2B3A67`
- Neutral family anchor: `#F7F4EE`

Exact normalized production tokens and unresolved differences are recorded in `docs/design/DESIGN_SYSTEM.md`.
