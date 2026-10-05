import type { AuthenticatedUser, LoginCredentials } from '../../types/auth'

export class AuthenticationError extends Error {
  constructor(message = 'Không thể xác thực thông tin đăng nhập.') {
    super(message)
    this.name = 'AuthenticationError'
  }
}

export interface AuthAdapter {
  getSession(): Promise<AuthenticatedUser | null>
  signIn(credentials: LoginCredentials): Promise<AuthenticatedUser>
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
}

export const unavailableAuthAdapter: AuthAdapter = {
  async getSession() { return null },
  async signIn() { throw new AuthenticationError('Đăng nhập chưa được cấu hình cho môi trường này.') },
}

export const defaultAuthAdapter = (): AuthAdapter => import.meta.env.DEV ? developmentAuthAdapter : unavailableAuthAdapter
