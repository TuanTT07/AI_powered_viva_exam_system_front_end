# Environments

Expected environments:

- local
- development
- staging
- production

## Environment Variables

Use Vite-compatible environment handling according to the repository setup.

Only variables intended to be public may be exposed to browser code.

Never expose:
- AI provider API keys,
- backend signing secrets,
- privileged service credentials.

## Recommended Public Configuration

Examples:
- backend base URL,
- realtime base URL,
- environment name,
- feature flags intended for clients.

Exact names: TBD.
