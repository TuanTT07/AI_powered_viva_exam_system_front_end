const TOKEN_KEY = 'aives_access_token'
const EXPIRY_KEY = 'aives_access_token_expires_at'
export const tokenManager = {
  getToken(): string | null {
    const token = sessionStorage.getItem(TOKEN_KEY)
    const expiry = Number(sessionStorage.getItem(EXPIRY_KEY))
    if (!token || !Number.isFinite(expiry) || expiry <= Date.now()) { this.clearToken(); return null }
    return token
  },
  setToken(token: string, expiresInSeconds: number): void {
    sessionStorage.setItem(TOKEN_KEY, token)
    sessionStorage.setItem(EXPIRY_KEY, String(Date.now() + expiresInSeconds * 1000))
  },
  clearToken(): void {
    sessionStorage.removeItem(TOKEN_KEY)
    sessionStorage.removeItem(EXPIRY_KEY)
  },
}
