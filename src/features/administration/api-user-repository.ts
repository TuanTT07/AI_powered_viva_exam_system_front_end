import { ApiError, apiClient } from '../../services/api/client'
import { isUuid } from '../question-bank/api-question-repository'

export type UserRole = 'admin' | 'lecturer' | 'student'
export type UserStatus = 'active' | 'inactive'
export type UserCourse = { id: string; code: string; name: string; department: string }

export interface User {
  id: string
  name: string
  identifier: string
  email: string
  role: UserRole
  status: UserStatus
  subjects?: string[]
  initials: string
  createdAt?: string
  updatedAt?: string
}

export type Page<T> = {
  content: T[]
  totalElements: number
  totalPages: number
  page: number
  size: number
}

export type UserResponseDto = {
  id: string
  userCode: string
  fullName: string
  email: string
  roleName: string
  createdAt?: string
  updatedAt?: string
}

export type ApiResponse<T> = {
  success: boolean
  status: number
  message: string
  data: T
}

function extractResponsePayload<T>(raw: unknown): T | null {
  if (raw === null || raw === undefined) return null
  if (typeof raw === 'object') {
    if ('success' in raw) {
      const envelope = raw as { success: boolean; data?: unknown; message?: string }
      if (!envelope.success) {
        throw new Error(envelope.message || 'Yêu cầu API thất bại.')
      }
      return (envelope.data !== undefined ? envelope.data : null) as T | null
    }
    return raw as T
  }
  return raw as T
}

export function mapUserDto(
  dto: unknown,
  fallback?: { fullName?: string; email?: string; roleName?: string; userCode?: string; id?: string }
): User {
  const obj = dto && typeof dto === 'object' ? (dto as Record<string, any>) : {}
  const rawId = obj.id || (typeof dto === 'string' && dto ? dto : '') || fallback?.id || Math.random().toString()
  
  const rawRole = String(obj.roleName || obj.role || fallback?.roleName || '').toLowerCase()
  const role: UserRole = rawRole.includes('admin') ? 'admin' : rawRole.includes('student') ? 'student' : 'lecturer'

  const fullName = String(obj.fullName || obj.name || fallback?.fullName || 'Người dùng').trim()
  const userCode = String(obj.userCode || obj.code || obj.identifier || fallback?.userCode || '').trim()
  const email = String(obj.email || fallback?.email || '').trim()

  const words = fullName.split(/\s+/).filter(Boolean)
  const initials = words.length >= 2
    ? (words[0][0] + words[words.length - 1][0]).toUpperCase()
    : (fullName.substring(0, 2) || 'US').toUpperCase()

  return {
    id: String(rawId),
    name: fullName,
    identifier: userCode,
    email,
    role,
    status: 'active',
    initials,
    createdAt: obj.createdAt ? String(obj.createdAt) : undefined,
    updatedAt: obj.updatedAt ? String(obj.updatedAt) : undefined,
  }
}

export const apiUserRepository = {
  async search(params: { keyword?: string; role?: string; page?: number; size?: number }): Promise<Page<User>> {
    const query: Record<string, any> = {}
    if (params.keyword) query.keyword = params.keyword
    if (params.role && params.role !== 'all') query.role = params.role.toUpperCase()
    query.page = Math.max(0, (params.page ?? 1) - 1)
    query.size = params.size ?? 10

    const raw = await apiClient.request<unknown>('/api/admin/users', { query })
    const pageData = extractResponsePayload<any>(raw) || {}

    const rawContent = Array.isArray(pageData.content)
      ? pageData.content
      : Array.isArray(pageData)
      ? pageData
      : []

    const content = rawContent.map((item: any) => mapUserDto(item))
    const totalElements = typeof pageData.totalElements === 'number' ? pageData.totalElements : content.length
    const totalPages = typeof pageData.totalPages === 'number' ? pageData.totalPages : Math.max(1, Math.ceil(totalElements / (params.size ?? 10)))
    const page = typeof pageData.page === 'number'
      ? pageData.page + 1
      : typeof pageData.number === 'number'
      ? pageData.number + 1
      : (params.page ?? 1)
    const size = typeof pageData.size === 'number' ? pageData.size : params.size ?? 10

    return {
      content,
      totalElements,
      totalPages,
      page,
      size,
    }
  },

  async create(payload: { fullName: string; email: string; roleName: string; userCode: string; password?: string }): Promise<User> {
    const raw = await apiClient.request<unknown>('/api/admin/users', {
      method: 'POST',
      body: payload,
    })
    const data = extractResponsePayload(raw)
    return mapUserDto(data, payload)
  },

  async update(id: string, payload: { fullName: string; email: string; roleName: string }): Promise<User> {
    if (!isUuid(id)) throw new ApiError('Mã tài khoản phải là UUID của backend.', { code: 'INVALID_UUID' })
    const raw = await apiClient.request<unknown>(`/api/admin/users/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: payload,
    })
    const data = extractResponsePayload(raw)
    return mapUserDto(data, { ...payload, id, userCode: '' })
  },

  async getById(id: string): Promise<User> {
    if (!isUuid(id)) throw new ApiError('Mã tài khoản phải là UUID của backend.', { code: 'INVALID_UUID' })
    const raw = await apiClient.request<unknown>(`/api/admin/users/${encodeURIComponent(id)}`)
    const data = extractResponsePayload(raw)
    if (!data) throw new Error('Không tìm thấy người dùng')
    return mapUserDto(data, { id })
  },

  async resetPassword(id: string, newPassword: string): Promise<void> {
    if (!isUuid(id)) throw new ApiError('Mã tài khoản phải là UUID của backend.', { code: 'INVALID_UUID' })
    const raw = await apiClient.request<unknown>(`/api/admin/users/${encodeURIComponent(id)}/password`, {
      method: 'PATCH',
      body: { newPassword },
    })
    extractResponsePayload(raw)
  },

  async getCourses(id: string): Promise<UserCourse[]> {
    if (!isUuid(id)) throw new ApiError('Mã tài khoản phải là UUID của backend.', { code: 'INVALID_UUID' })
    const raw = await apiClient.request<unknown>(`/api/admin/users/${encodeURIComponent(id)}/courses`)
    const data = extractResponsePayload<any[]>(raw) || []
    const list = Array.isArray(data) ? data : []
    return list.map(course => ({
      id: course.id,
      code: course.courseCode || course.code || '',
      name: course.courseName || course.name || '',
      department: course.department || '',
    }))
  },

  async delete(id: string): Promise<void> {
    if (!isUuid(id)) throw new ApiError('Mã tài khoản phải là UUID của backend.', { code: 'INVALID_UUID' })
    const raw = await apiClient.request<unknown>(`/api/admin/users/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    })
    extractResponsePayload(raw)
  },
}
