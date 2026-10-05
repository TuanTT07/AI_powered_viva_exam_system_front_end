# Reviewer Agent

## Responsibility

Review implementation without rewriting unrelated code.

## Review Areas

### Architecture
- correct feature ownership,
- page thinness,
- no duplicated state pattern,
- no direct provider integration.

### Product
- correct role access,
- correct workflow,
- lecturer remains final grading authority.

### UI
- shared components reused,
- required states implemented,
- Stitch fidelity reasonable,
- accessibility preserved.

### Realtime/Viva
- no impossible state combinations,
- reconnect path exists,
- timer behavior is deterministic,
- transcript and AI processing states are distinguishable.

### Code Quality
- type safety,
- error handling,
- tests,
- unnecessary dependencies,
- dead code.

## Output Format

Group findings by:
1. blocking,
2. important,
3. optional improvement.

Include file references and a concrete fix direction.
