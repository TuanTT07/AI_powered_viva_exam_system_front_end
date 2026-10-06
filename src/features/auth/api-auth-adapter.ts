import { apiClient } from '../../services/api/client'
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
  return {
    id: dto.id,
    displayName: dto.fullName,
    roles: [dto.roleName.toLowerCase() as AppRole],
  }
}

export const apiAuthAdapter: AuthAdapter = {
  async getSession() {
    if (!tokenManager.getToken()) return null
    try {
      const response = await apiClient.request<ApiResponse<UserResponseDto>>('/api/auth/me')
      if (!response.success || !response.data) throw new Error('Unauthenticated')
      return mapUserDto(response.data)
    } catch {
      tokenManager.clearToken()
      return null
    }
  },
  async signIn(credentials: LoginCredentials) {
    const response = await apiClient.request<ApiResponse<LoginResponseDto>>('/api/auth/login', {
      method: 'POST',
      body: credentials,
    })
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Đăng nhập thất bại')
    }
    tokenManager.setToken(response.data.accessToken)
    return mapUserDto(response.data.user)
  },
  async signOut() {
    // Optionally call BE signout endpoint here if they add one in the future
    tokenManager.clearToken()
  },
}
