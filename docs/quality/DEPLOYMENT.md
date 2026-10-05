# Frontend Deployment

Deployment platform: TBD.

## Required Pipeline

1. install locked dependencies,
2. typecheck,
3. lint,
4. test,
5. production build,
6. deploy artifact,
7. smoke test critical routes.

## Environment Separation

Production must not use:
- local mock API,
- test auth bypass,
- debug transcript logging.

## Rollback

Deployment platform should support a simple rollback path before production launch.
