import type { AuthenticatedUser, LoginCredentials } from '../../types/auth'
import { runtimeConfig } from '../../services/api/runtime-config'
import { selectRepository } from '../../services/api/repository-selection'
import { apiAuthAdapter } from './api-auth-adapter'
export class AuthenticationError extends Error {
  constructor(message = 'Không thể xác thực thông tin đăng nhập.') {
    super(message)
    this.name = 'AuthenticationError'
  }
}

export interface AuthAdapter {
  getSession(): Promise<AuthenticatedUser | null>
  signIn(credentials: LoginCredentials): Promise<AuthenticatedUser>
  signOut(): Promise<void>
}

const demoPassword = 'AivesDemo!2026'
const developmentUsers: Record<string, AuthenticatedUser> = {
  'lecturer@academia.edu.vn': { id: 'demo-lecturer', displayName: 'Giảng viên demo', roles: ['lecturer'] },
  'student@academia.edu.vn': { id: 'demo-student', displayName: 'Sinh viên demo', roles: ['student'] },
  'admin@academia.edu.vn': { id: 'demo-admin', displayName: 'Quản trị viên demo', roles: ['admin'] },
}

export const developmentAuthAdapter: AuthAdapter = {
  async getSession() { return null },
  async signIn({ email, password }) {
    const user = developmentUsers[email]
    if (!user || password !== demoPassword) throw new AuthenticationError('Email hoặc mật khẩu không chính xác.')
    return user
  },
  async signOut() {},
}

export const unavailableAuthAdapter: AuthAdapter = {
  async getSession() { return null },
  async signIn() { throw new AuthenticationError('Đăng nhập chưa được cấu hình cho môi trường này.') },
  async signOut() {},
}

export const defaultAuthAdapter = (): AuthAdapter => selectRepository(runtimeConfig.dataSource, { mock: import.meta.env.DEV ? developmentAuthAdapter : unavailableAuthAdapter, api: apiAuthAdapter })
