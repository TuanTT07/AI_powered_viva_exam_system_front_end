export const appRoles = ['admin', 'lecturer', 'student'] as const
export type AppRole = (typeof appRoles)[number]
export type SessionState = { status: 'loading' | 'authenticated' | 'unauthenticated'; user: { id: string; displayName: string; roles: AppRole[] } | null }
