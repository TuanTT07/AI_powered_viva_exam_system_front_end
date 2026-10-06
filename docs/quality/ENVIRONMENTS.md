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

Public runtime variables are documented in `.env.example`:

- `VITE_API_BASE_URL`: optional public backend origin; empty means relative `/api` requests.
- `VITE_DATA_SOURCE`: `mock` (default) or `api`.
- `VITE_API_TIMEOUT_MS`: positive timeout in milliseconds; invalid values use 15000.

Vite development proxies only `/api` to `AIVES_API_PROXY_TARGET` (default `http://localhost:8080`). The proxy target is server-side Vite configuration and is not exposed as a browser variable. Deployed environments need same-origin routing or backend CORS.

Invalid data-source values fail safely to the documented `mock` default. API failures never trigger an automatic mock fallback. No `.env` or secret is committed.
