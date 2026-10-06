import { runtimeConfig } from './runtime-config'

export type QueryValue = string | number | boolean | null | undefined
export type ApiRequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  query?: Record<string, QueryValue | QueryValue[]>
  body?: unknown
  headers?: HeadersInit
  signal?: AbortSignal
  timeoutMs?: number
}
export type ApiErrorOptions = { status?: number; code?: string; fieldErrors?: Record<string, string>; cause?: unknown }

export class ApiError extends Error {
  readonly status?: number
  readonly code?: string
  readonly fieldErrors?: Record<string, string>
  readonly cause?: unknown
  constructor(message: string, options: ApiErrorOptions = {}) { super(message); this.name = 'ApiError'; this.status = options.status; this.code = options.code; this.fieldErrors = options.fieldErrors; this.cause = options.cause }
}

export type ApiClient = { request<T>(path: string, options?: ApiRequestOptions): Promise<T> }

export function buildApiUrl(baseUrl: string, path: string, query?: ApiRequestOptions['query']): string {
  if (/^[a-z][a-z\d+.-]*:/i.test(path) || path.startsWith('//')) throw new ApiError('Đường dẫn API không hợp lệ.', { code: 'INVALID_PATH' })
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const url = baseUrl ? `${baseUrl.replace(/\/+$/, '')}${normalizedPath}` : normalizedPath
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query ?? {})) for (const item of Array.isArray(value) ? value : [value]) if (item !== null && item !== undefined) params.append(key, String(item))
  const serialized = params.toString()
  return serialized ? `${url}?${serialized}` : url
}

function isJsonBody(body: unknown): body is Record<string, unknown> | unknown[] { return typeof body === 'object' && body !== null && !(body instanceof FormData) && !(body instanceof Blob) && !(body instanceof ArrayBuffer) }
function isHtml(value: string) { return /<\s*!doctype html|<html[\s>]/i.test(value) }
async function readJsonOrEmpty(response: Response): Promise<unknown> { const text = await response.text(); if (!text.trim()) return undefined; try { return JSON.parse(text) } catch { throw new ApiError('Phản hồi JSON từ máy chủ không hợp lệ.', { status: response.status, code: 'INVALID_RESPONSE' }) } }
async function parseApiError(response: Response): Promise<ApiError> { const text = await response.text(); let payload: unknown; try { payload = text.trim() ? JSON.parse(text) : undefined } catch { payload = undefined } if (payload && typeof payload === 'object' && !Array.isArray(payload)) { const candidate = payload as { message?: unknown; status?: unknown; code?: unknown; data?: unknown }; const fieldErrors = candidate.data && typeof candidate.data === 'object' && !Array.isArray(candidate.data) ? Object.fromEntries(Object.entries(candidate.data).filter(([, value]) => typeof value === 'string')) : undefined; return new ApiError(typeof candidate.message === 'string' ? candidate.message : `Yêu cầu thất bại (${response.status}).`, { status: typeof candidate.status === 'number' ? candidate.status : response.status, code: typeof candidate.code === 'string' ? candidate.code : undefined, fieldErrors, cause: payload }) } return new ApiError(text && !isHtml(text) ? text : `Yêu cầu thất bại (${response.status}).`, { status: response.status, cause: payload }) }

export const apiClient: ApiClient = {
  async request<T>(path: string, options: ApiRequestOptions = {}) {
    const controller = new AbortController()
    const timeoutMs = options.timeoutMs ?? runtimeConfig.apiTimeoutMs
    let timedOut = false
    const onAbort = () => controller.abort()
    if (options.signal?.aborted) controller.abort()
    else options.signal?.addEventListener('abort', onAbort, { once: true })
    const timer = setTimeout(() => { timedOut = true; controller.abort() }, timeoutMs)
    const headers = new Headers(options.headers)
    headers.set('Accept', headers.get('Accept') ?? 'application/json')
    let body: BodyInit | undefined
    if (isJsonBody(options.body)) { body = JSON.stringify(options.body); headers.set('Content-Type', headers.get('Content-Type') ?? 'application/json') }
    else if (options.body !== undefined) body = options.body as BodyInit
    try {
      const response = await fetch(buildApiUrl(runtimeConfig.apiBaseUrl, path, options.query), { method: options.method ?? 'GET', headers, body, signal: controller.signal })
      if (!response.ok) throw await parseApiError(response)
      return await readJsonOrEmpty(response) as T
    } catch (error) {
      if (error instanceof ApiError) throw error
      if (timedOut) throw new ApiError('Yêu cầu API đã hết thời gian chờ.', { code: 'TIMEOUT', cause: error })
      if (options.signal?.aborted) throw new ApiError('Yêu cầu API đã bị hủy.', { code: 'ABORTED', cause: error })
      throw new ApiError('Không thể kết nối tới máy chủ API.', { code: 'NETWORK_ERROR', cause: error })
    } finally { clearTimeout(timer); options.signal?.removeEventListener('abort', onAbort) }
  },
}
