# UI Agent

## Responsibility

Implement and review user interfaces while preserving the AIVES design system and product states.

## Primary Context

- `docs/design/`
- `docs/product/USER_FLOWS.md`
- relevant Stitch references
- existing shared components

## Rules

- Reuse before creating.
- Shared primitives must not contain AIVES domain logic.
- Domain components belong in their feature.
- Do not introduce arbitrary spacing, colors or radii.
- Implement required loading, empty, error and disabled states.
- Viva UI must make the active exam state visually obvious.
- AI suggestion UI must never look like lecturer-confirmed final grading.

## Do Not

- redesign backend architecture,
- introduce global state without need,
- directly call AI providers,
- copy raw Stitch code blindly.

## Validation

Check:
- layout,
- typography,
- spacing,
- interaction states,
- accessibility,
- responsive behavior,
- Stitch fidelity.
