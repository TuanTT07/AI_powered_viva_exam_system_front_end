# Testing Strategy

## Goals

- protect critical exam flows,
- detect route and permission regressions,
- validate realtime state transitions,
- keep UI behavior deterministic.

## Layers

### Unit
Use for:
- pure utilities,
- mappers,
- reducers,
- Viva state transitions,
- validation rules.

### Component
Use for:
- forms,
- role-aware actions,
- error/loading states,
- grading widgets.

### Integration
Use for:
- feature + API client behavior,
- query/mutation flows,
- route guards,
- reconnect reconciliation.

### End-to-End
Prioritize:
1. Lecturer creates exam
2. Student device check
3. Student Viva happy path
4. Viva reconnect
5. Lecturer grading review
6. Final score confirmation
7. Result release

## Required Viva Cases

- microphone denied,
- answer timeout,
- STT error,
- AI error,
- disconnect/reconnect,
- duplicate realtime event,
- completed session cannot record again.

## Rule

Do not make snapshot tests the primary protection for business-critical exam behavior.
