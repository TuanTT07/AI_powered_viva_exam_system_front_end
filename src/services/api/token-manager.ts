export const tokenManager = {
  getToken(): string | null {
    return localStorage.getItem('aives_access_token')
  },
  setToken(token: string): void {
    localStorage.setItem('aives_access_token', token)
  },
  clearToken(): void {
    localStorage.removeItem('aives_access_token')
  },
}
