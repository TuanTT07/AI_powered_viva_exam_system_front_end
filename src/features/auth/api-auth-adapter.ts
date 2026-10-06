import { ApiError, apiClient } from '../../services/api/client'
import { tokenManager } from '../../services/api/token-manager'
import type { AuthenticatedUser, LoginCredentials, AppRole } from '../../types/auth'
import type { AuthAdapter } from './auth-adapter'

type UserResponseDto = {
  id: string
  userCode: string
  fullName: string
  email: string
  roleName: string
  createdAt?: string
  updatedAt?: string
}

type LoginResponseDto = {
  accessToken: string
  tokenType: string
  expiresIn: number
  user: UserResponseDto
}

type ApiResponse<T> = {
  success: boolean
  status: number
  message: string
  data: T
}

function mapUserDto(dto: UserResponseDto): AuthenticatedUser {
  const roleMap: Record<string, AppRole> = { ADMIN: 'admin', LECTURER: 'lecturer', STUDENT: 'student' }
  const role = roleMap[dto.roleName?.toUpperCase()]
  if (!dto.id || !dto.fullName || !dto.email || !role) throw new ApiError('Phản hồi xác thực không hợp lệ.', { code: 'INVALID_AUTH_RESPONSE' })
  return {
    id: dto.id,
    displayName: dto.fullName,
    roles: [role],
  }
}

export const apiAuthAdapter: AuthAdapter = {
  async getSession() {
    if (!tokenManager.getToken()) return null
    try {
      const response = await apiClient.request<ApiResponse<UserResponseDto>>('/api/auth/me')
      if (!response.success || !response.data) throw new Error('Unauthenticated')
      return mapUserDto(response.data)
    } catch (error) {
      if (!(error instanceof ApiError) || (error.status !== 401 && error.status !== 403)) throw error
      tokenManager.clearToken(); return null
    }
  },
  async signIn(credentials: LoginCredentials) {
    const response = await apiClient.request<ApiResponse<LoginResponseDto>>('/api/auth/login', {
      method: 'POST',
      body: credentials,
      authenticated: false,
    })
    if (!response.success || !response.data || typeof response.data.accessToken !== 'string' || !response.data.accessToken || response.data.tokenType !== 'Bearer' || !Number.isFinite(response.data.expiresIn) || response.data.expiresIn <= 0) throw new ApiError('Thông tin xác thực từ máy chủ không hợp lệ.', { code: 'INVALID_AUTH_RESPONSE' })
    const mappedUser = mapUserDto(response.data.user)
    tokenManager.setToken(response.data.accessToken, response.data.expiresIn)
    return mappedUser
  },
  async signOut() {
    // Optionally call BE signout endpoint here if they add one in the future
    tokenManager.clearToken()
  },
}
