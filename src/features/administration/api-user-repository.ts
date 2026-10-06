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

type UserResponseDto = {
  id: string
  userCode: string
  fullName: string
  email: string
  roleName: string
  createdAt?: string
  updatedAt?: string
}

type ApiResponse<T> = {
  success: boolean
  status: number
  message: string
  data: T
}

function mapUserDto(dto: UserResponseDto): User {
  const roleStr = (dto.roleName || '').toLowerCase()
  const role: UserRole = roleStr === 'admin' ? 'admin' : roleStr === 'student' ? 'student' : 'lecturer'
  
  // Create initials from name
  const nameParts = (dto.fullName || '').split(' ')
  const initials = nameParts.length >= 2 
    ? (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
    : (dto.fullName?.substring(0, 2) || 'US').toUpperCase()

  return {
    id: dto.id,
    name: dto.fullName,
    identifier: dto.userCode,
    email: dto.email,
    role,
    status: 'active', // Backend doesn't support user status yet
    initials,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  }
}

export const apiUserRepository = {
  async search(params: { keyword?: string; role?: string; page?: number; size?: number }): Promise<Page<User>> {
    const query: Record<string, any> = {}
    if (params.keyword) query.keyword = params.keyword
    if (params.role && params.role !== 'all') query.role = params.role.toUpperCase()
    query.page = Math.max(0, (params.page ?? 1) - 1)
    query.size = params.size ?? 10

    const response = await apiClient.request<ApiResponse<Page<UserResponseDto>>>('/api/admin/users', { query })
    if (!response.success) throw new Error(response.message || 'Lỗi lấy danh sách người dùng')
    
    const pageData = response.data
    return {
      content: pageData.content.map(mapUserDto),
      totalElements: pageData.totalElements,
      totalPages: pageData.totalPages,
      page: pageData.page + 1,
      size: pageData.size,
    }
  },
  
  async create(payload: { fullName: string; email: string; roleName: string; userCode: string; password?: string }): Promise<User> {
    const response = await apiClient.request<ApiResponse<UserResponseDto>>('/api/admin/users', {
      method: 'POST',
      body: payload,
    })
    if (!response.success) throw new Error(response.message || 'Lỗi tạo người dùng')
    return mapUserDto(response.data)
  },

  async update(id: string, payload: { fullName: string; email: string; roleName: string }): Promise<User> {
    if (!isUuid(id)) throw new ApiError('Mã tài khoản phải là UUID của backend.', { code: 'INVALID_UUID' })
    const response = await apiClient.request<ApiResponse<UserResponseDto>>(`/api/admin/users/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: payload,
    })
    if (!response.success) throw new Error(response.message || 'Lỗi cập nhật người dùng')
    return mapUserDto(response.data)
  },

  async getById(id: string): Promise<User> {
    if (!isUuid(id)) throw new ApiError('Mã tài khoản phải là UUID của backend.', { code: 'INVALID_UUID' })
    const response = await apiClient.request<ApiResponse<UserResponseDto>>(`/api/admin/users/${encodeURIComponent(id)}`)
    if (!response.success) throw new Error(response.message || 'Lỗi lấy chi tiết người dùng')
    return mapUserDto(response.data)
  },

  async resetPassword(id: string, newPassword: string): Promise<void> {
    if (!isUuid(id)) throw new ApiError('Mã tài khoản phải là UUID của backend.', { code: 'INVALID_UUID' })
    const response = await apiClient.request<ApiResponse<unknown>>(`/api/admin/users/${encodeURIComponent(id)}/password`, { method: 'PATCH', body: { newPassword } })
    if (!response.success) throw new Error(response.message || 'Lỗi đặt lại mật khẩu')
  },

  async getCourses(id: string): Promise<UserCourse[]> {
    if (!isUuid(id)) throw new ApiError('Mã tài khoản phải là UUID của backend.', { code: 'INVALID_UUID' })
    const response = await apiClient.request<ApiResponse<{ id: string; courseCode: string; courseName: string; department: string }[]>>(`/api/admin/users/${encodeURIComponent(id)}/courses`)
    if (!response.success) throw new Error(response.message || 'Lỗi lấy môn học phụ trách')
    return response.data.map(course => ({ id: course.id, code: course.courseCode, name: course.courseName, department: course.department }))
  },

  async delete(id: string): Promise<void> {
    if (!isUuid(id)) throw new ApiError('Mã tài khoản phải là UUID của backend.', { code: 'INVALID_UUID' })
    const response = await apiClient.request<ApiResponse<any>>(`/api/admin/users/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    })
    if (!response.success) throw new Error(response.message || 'Lỗi xóa người dùng')
  }
}
