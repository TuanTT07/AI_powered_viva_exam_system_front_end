export type DataSourceMode = 'mock' | 'api'
export type PublicRuntimeConfig = { apiBaseUrl: string; apiTimeoutMs: number; dataSource: DataSourceMode }
export type RuntimeEnv = { VITE_API_BASE_URL?: string; VITE_API_TIMEOUT_MS?: string; VITE_DATA_SOURCE?: string }
export const DEFAULT_API_TIMEOUT_MS = 15_000
export function normalizeApiBaseUrl(value: string | undefined): string { return (value ?? '').trim().replace(/\/+$/, '') }
export function parseRuntimeConfig(env: RuntimeEnv): PublicRuntimeConfig { const rawSource = env.VITE_DATA_SOURCE?.trim().toLowerCase(); const dataSource: DataSourceMode = rawSource === 'api' ? 'api' : 'mock'; const parsedTimeout = Number(env.VITE_API_TIMEOUT_MS); const apiTimeoutMs = Number.isInteger(parsedTimeout) && parsedTimeout > 0 ? parsedTimeout : DEFAULT_API_TIMEOUT_MS; return { apiBaseUrl: normalizeApiBaseUrl(env.VITE_API_BASE_URL), apiTimeoutMs, dataSource } }
export const runtimeConfig = parseRuntimeConfig(import.meta.env as RuntimeEnv)
