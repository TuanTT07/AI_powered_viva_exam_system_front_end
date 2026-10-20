import { ApiError, apiClient } from '../../services/api/client'
import { runtimeConfig } from '../../services/api/runtime-config'
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
    const controller = new AbortController()

    // Multi-strategy check to verify if user was already committed to DB (handles slow SMTP / Render hang)
    const checkDbForUser = async (): Promise<User | null> => {
      try {
        // Strategy 1: Search by userCode keyword
        if (payload.userCode) {
          const byCode = await apiUserRepository.search({ keyword: payload.userCode, size: 10 })
          const matchCode = byCode.content.find(
            u => u.identifier.toLowerCase() === payload.userCode.toLowerCase() ||
                 u.email.toLowerCase() === payload.email.toLowerCase()
          )
          if (matchCode) return matchCode
        }

        // Strategy 2: Search recent users without keyword (bypasses keyword query bugs in backend)
        const recent = await apiUserRepository.search({ size: 20 })
        const matchRecent = recent.content.find(
          u => u.email.toLowerCase() === payload.email.toLowerCase() ||
               (payload.userCode && u.identifier.toLowerCase() === payload.userCode.toLowerCase())
        )
        if (matchRecent) return matchRecent

        // Strategy 3: Search by email keyword
        const byEmail = await apiUserRepository.search({ keyword: payload.email, size: 10 })
        const matchEmail = byEmail.content.find(
          u => u.email.toLowerCase() === payload.email.toLowerCase() ||
               u.identifier.toLowerCase() === payload.userCode.toLowerCase()
        )
        if (matchEmail) return matchEmail

        return null
      } catch {
        return null
      }
    }

    let resolvedUser: User | null = null
    const timerIds: ReturnType<typeof setTimeout>[] = []
    const clearTimers = () => timerIds.forEach(clearTimeout)

    // Poll DB at 3s, 6s, 10s, 15s in case backend hangs on external email/SMTP service after DB insert
    const delays = [3_000, 6_000, 10_000, 15_000]
    delays.forEach(delay => {
      const timer = setTimeout(async () => {
        if (resolvedUser) return
        const found = await checkDbForUser()
        if (found && !resolvedUser) {
          resolvedUser = found
          clearTimers()
          controller.abort()
        }
      }, delay)
      timerIds.push(timer)
    })

    try {
      const raw = await apiClient.request<unknown>('/api/admin/users', {
        method: 'POST',
        body: payload,
        signal: controller.signal,
        timeoutMs: Math.max(runtimeConfig.apiTimeoutMs, 60_000),
      })
      clearTimers()
      const data = extractResponsePayload(raw)
      return mapUserDto(data, payload)
    } catch (err: any) {
      clearTimers()

      // If poll timer already found the created user in DB and aborted the hanging POST request
      if (resolvedUser) {
        return resolvedUser
      }

      // If 409 Conflict: check if the user is already in DB (from a previous attempt)
      if (err?.status === 409 || err?.message?.includes('409') || err?.message?.toLowerCase().includes('conflict')) {
        const found = await checkDbForUser()
        if (found) {
          return found
        }
        throw new Error('Email hoặc Mã định danh đã tồn tại trong hệ thống. Vui lòng kiểm tra lại.')
      }

      // If timeout, abort, or network error: do a search check to see if DB was already updated
      const isTimeoutOrNetwork = err?.code === 'TIMEOUT' || err?.code === 'NETWORK_ERROR' || err?.code === 'ABORTED' || err?.message?.includes('hết thời gian chờ')
      if (isTimeoutOrNetwork) {
        const found = await checkDbForUser()
        if (found) {
          return found
        }
      }

      throw err
    }
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
