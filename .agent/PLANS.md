# Execution Plans

ExecPlans are persistent implementation plans for work that is too large or risky to keep only in chat context.

## When an ExecPlan Is Required

Create one for:
- a new major feature,
- a cross-feature workflow,
- Viva Session changes,
- routing or state-management restructuring,
- API/realtime integration spanning multiple modules,
- large Stitch-to-code implementation,
- significant refactoring,
- migration work.

Do not create one for:
- text changes,
- small isolated styling fixes,
- obvious one-file bug fixes.

## Required Structure

Every ExecPlan must contain:

### 1. Goal
What user or system outcome must exist after completion?

### 2. Context
Why is this change needed?

### 3. Scope
What is included?

### 4. Non-goals
What must not be implemented as part of this task?

### 5. Relevant Sources
List:
- product docs,
- design docs,
- architecture docs,
- source folders,
- API contracts,
- Stitch references.

### 6. Current Behavior
Describe what exists today.

### 7. Target Behavior
Describe the intended result.

### 8. Architecture Constraints
List rules that implementation must preserve.

### 9. Milestones
Break work into independently verifiable steps.

### 10. Risks
Examples:
- route regression,
- duplicated components,
- stale server state,
- realtime race condition,
- microphone permission failures,
- role leakage.

### 11. Validation
Exact checks to run.

### 12. Definition of Done
Objective completion conditions.

### 13. Progress Log
Update the plan while work is ongoing.

## Plan Lifecycle

1. Create under `.agent/plans/active/`.
2. Keep it updated while implementation changes.
3. Record important architecture decisions in `DECISIONS.md`.
4. When verified, move it to `.agent/plans/completed/`.

A new agent should be able to continue work using the repository plus the active plan without needing the original conversation.
