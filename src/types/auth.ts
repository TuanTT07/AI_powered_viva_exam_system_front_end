export const appRoles = ['admin', 'lecturer', 'student'] as const
export type AppRole = (typeof appRoles)[number]
export type AuthenticatedUser = { id: string; displayName: string; roles: AppRole[] }
export type LoginCredentials = { email: string; password: string }
export type SessionState = { status: 'loading' | 'authenticated' | 'unauthenticated'; user: AuthenticatedUser | null }
