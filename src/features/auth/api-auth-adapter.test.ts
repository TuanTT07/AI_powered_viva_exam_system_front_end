import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError, apiClient } from '../../services/api/client'
import { tokenManager } from '../../services/api/token-manager'
import { apiAuthAdapter } from './api-auth-adapter'

const user = { id: '11111111-1111-4111-8111-111111111111', userCode: 'GV001', fullName: 'Nguyễn Văn A', email: 'lecturer@university.edu.vn', roleName: 'LECTURER' }
describe('api auth adapter', () => {
  beforeEach(() => { sessionStorage.clear(); vi.restoreAllMocks() })
  it('logs in without stale Authorization and stores only token plus expiry', async () => {
    tokenManager.setToken('stale', 3600)
    const request = vi.spyOn(apiClient, 'request').mockResolvedValue({ success: true, status: 200, message: 'ok', data: { accessToken: 'jwt', tokenType: 'Bearer', expiresIn: 7200, user } })
    await expect(apiAuthAdapter.signIn({ email: user.email, password: 'password' })).resolves.toMatchObject({ id: user.id, roles: ['lecturer'] })
    expect(request).toHaveBeenCalledWith('/api/auth/login', expect.objectContaining({ method: 'POST', authenticated: false, body: { email: user.email, password: 'password' } }))
    expect(sessionStorage.getItem('aives_access_token')).toBe('jwt')
    expect(sessionStorage.getItem('aives_access_token_expires_at')).toBeTruthy()
    expect(sessionStorage.getItem('password')).toBeNull()
  })
  it.each([['ADMIN', 'admin'], ['LECTURER', 'lecturer'], ['STUDENT', 'student']] as const)('maps %s role', async (role, expected) => {
    vi.spyOn(apiClient, 'request').mockResolvedValue({ success: true, status: 200, message: 'ok', data: { accessToken: 'jwt', tokenType: 'Bearer', expiresIn: 60, user: { ...user, roleName: role } } })
    await expect(apiAuthAdapter.signIn({ email: user.email, password: 'password' })).resolves.toMatchObject({ roles: [expected] })
  })
  it('rejects unsupported roles and malformed token responses', async () => {
    vi.spyOn(apiClient, 'request').mockResolvedValue({ success: true, status: 200, message: 'ok', data: { accessToken: 'jwt', tokenType: 'Bearer', expiresIn: 60, user: { ...user, roleName: 'OWNER' } } })
    await expect(apiAuthAdapter.signIn({ email: user.email, password: 'password' })).rejects.toMatchObject({ code: 'INVALID_AUTH_RESPONSE' })
    expect(sessionStorage.getItem('aives_access_token')).toBeNull()
  })
  it('restores session with /me and clears token on unauthorized', async () => {
    tokenManager.setToken('jwt', 60)
    const request = vi.spyOn(apiClient, 'request').mockResolvedValue({ success: true, status: 200, message: 'ok', data: user })
    await expect(apiAuthAdapter.getSession()).resolves.toMatchObject({ displayName: user.fullName, roles: ['lecturer'] })
    expect(request).toHaveBeenCalledWith('/api/auth/me')
    request.mockRejectedValueOnce(new ApiError('unauthorized', { status: 401 }))
    await expect(apiAuthAdapter.getSession()).resolves.toBeNull()
    expect(tokenManager.getToken()).toBeNull()
  })
  it('does not clear a token on recoverable network errors', async () => {
    tokenManager.setToken('jwt', 60)
    vi.spyOn(apiClient, 'request').mockRejectedValue(new Error('network'))
    await expect(apiAuthAdapter.getSession()).rejects.toThrow('network')
    expect(sessionStorage.getItem('aives_access_token')).toBe('jwt')
  })
})
