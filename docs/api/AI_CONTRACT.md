# AI Contract — Frontend Boundary

Frontend interacts with AI capabilities through AIVES backend services.

## AI Capabilities

### Question Generation
Input conceptually includes:
- subject/context,
- source material references,
- topic,
- Bloom level preferences,
- desired count.

Output:
- draft questions,
- metadata,
- optional suggested rubric linkage.

All generated questions are drafts until lecturer approval.

### Adaptive Follow-up

Input is backend-owned and may include:
- current question,
- final transcript,
- previous follow-ups,
- rubric/context,
- limits.

Output conceptually:
- follow-up required: yes/no,
- follow-up text if yes,
- reason/category if exposed,
- next action.

Frontend does not construct hidden prompts.

### AI-Assisted Grading

Output conceptually may include:
- suggested score,
- criterion-level suggestions,
- strengths,
- missing concepts,
- explanatory feedback,
- confidence/flags when supported.

The UI must label all of this as AI-assisted/suggested.

## Streaming

Streaming behavior: TBD.

If partial output is streamed:
- render as in-progress,
- do not treat partial grading as official,
- preserve deterministic transition to final result.

## Errors

Expected categories may include:
- generation unavailable,
- provider timeout,
- insufficient context,
- content processing failure,
- rate/capacity limitation.

Exact backend error codes: TBD.

## Privacy

Do not send sensitive assessment data directly to third-party provider SDKs from frontend code.
