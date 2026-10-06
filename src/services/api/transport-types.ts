import { ApiError } from './client'
export type ApiEnvelope<T> = { success: boolean; status: number; message: string; data: T }
export type ApiFieldErrors = Record<string, string>
export type SpringPage<T> = { content: T[]; number: number; size: number; totalElements: number; totalPages: number }
export type ApiPage<T> = { content: T[]; page: number; size: number; totalElements: number; totalPages: number }
export type PaginatedResult<T> = { items: T[]; page: number; pageSize: number; totalItems: number; totalPages: number }
export function unwrapApiEnvelope<T>(response: ApiEnvelope<T>): T { if (!response || typeof response !== 'object' || typeof response.success !== 'boolean' || typeof response.status !== 'number' || !('data' in response)) throw new ApiError('Phản hồi API không hợp lệ.', { code: 'INVALID_RESPONSE' }); if (!response.success) throw new ApiError(response.message || 'Yêu cầu API thất bại.', { status: response.status, fieldErrors: extractFieldErrors(response.data) }); return response.data }
export function normalizeSpringPage<T>(page: SpringPage<T>): PaginatedResult<T> { return normalizePage(page.content, page.number, page.size, page.totalElements, page.totalPages) }
export function normalizeApiPage<T>(page: ApiPage<T>): PaginatedResult<T> { return normalizePage(page.content, page.page, page.size, page.totalElements, page.totalPages) }
function normalizePage<T>(items: T[], page: number, pageSize: number, totalItems: number, totalPages: number): PaginatedResult<T> { return { items: Array.isArray(items) ? items : [], page: Number.isFinite(page) ? page : 0, pageSize: Number.isFinite(pageSize) ? pageSize : 0, totalItems: Number.isFinite(totalItems) ? totalItems : 0, totalPages: Number.isFinite(totalPages) ? totalPages : 0 } }
function extractFieldErrors(value: unknown): ApiFieldErrors | undefined { if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined; const entries = Object.entries(value).filter(([, message]) => typeof message === 'string'); return entries.length ? Object.fromEntries(entries) : undefined }
