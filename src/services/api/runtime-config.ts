export type DataSourceMode = 'mock' | 'api'
export type PublicRuntimeConfig = { apiBaseUrl: string; apiTimeoutMs: number; dataSource: DataSourceMode; demoCourseId: string; demoExamId: string; demoCandidateIds: string[] }
export type RuntimeEnv = { VITE_API_BASE_URL?: string; VITE_API_TIMEOUT_MS?: string; VITE_DATA_SOURCE?: string; VITE_DEMO_COURSE_ID?: string; VITE_DEMO_EXAM_ID?: string; VITE_DEMO_CANDIDATE_IDS?: string }
export const DEFAULT_API_TIMEOUT_MS = 15_000
export function normalizeApiBaseUrl(value: string | undefined): string { return (value ?? '').trim().replace(/\/+$/, '') }
export function parseRuntimeConfig(env: RuntimeEnv): PublicRuntimeConfig { const rawSource = env.VITE_DATA_SOURCE?.trim().toLowerCase(); const dataSource: DataSourceMode = rawSource === 'api' ? 'api' : 'mock'; const parsedTimeout = Number(env.VITE_API_TIMEOUT_MS); const apiTimeoutMs = Number.isInteger(parsedTimeout) && parsedTimeout > 0 ? parsedTimeout : DEFAULT_API_TIMEOUT_MS; const demoCandidateIds = (env.VITE_DEMO_CANDIDATE_IDS ?? '').split(',').map((id) => id.trim()).filter(Boolean); return { apiBaseUrl: normalizeApiBaseUrl(env.VITE_API_BASE_URL), apiTimeoutMs, dataSource, demoCourseId: env.VITE_DEMO_COURSE_ID?.trim() ?? '', demoExamId: env.VITE_DEMO_EXAM_ID?.trim() ?? '', demoCandidateIds } }
const runtimeEnv = import.meta.env as RuntimeEnv

// Unit tests must be deterministic and must not inherit a developer's local
// .env (which may point at a deployed API). API repository tests opt in
// explicitly with parseRuntimeConfig and a mocked transport instead.
export const runtimeConfig = parseRuntimeConfig(import.meta.env.MODE === 'test'
  ? { ...runtimeEnv, VITE_DATA_SOURCE: 'mock' }
  : runtimeEnv)
