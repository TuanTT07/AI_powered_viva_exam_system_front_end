import type { AppRole, AuthenticatedUser } from '../../types/auth'

const roleHomes: Record<AppRole, string> = { admin: '/admin', lecturer: '/lecturer', student: '/student' }

export function roleHome(user: AuthenticatedUser): string { return roleHomes[user.roles[0]] ?? '/login' }

function pathFromLocation(value: unknown): string | null {
  if (typeof value === 'string') return value
  if (!value || typeof value !== 'object' || !('pathname' in value)) return null
  const { pathname, search = '', hash = '' } = value as { pathname?: unknown; search?: unknown; hash?: unknown }
  return typeof pathname === 'string' && typeof search === 'string' && typeof hash === 'string' ? `${pathname}${search}${hash}` : null
}

export function authorizedReturnPath(from: unknown, user: AuthenticatedUser): string {
  const path = pathFromLocation(from)
  const home = roleHome(user)
  if (!path || !path.startsWith('/') || path.startsWith('//') || path === '/login' || path.startsWith('/login?') || path.startsWith('/login#')) return home
  return path === home || path.startsWith(`${home}/`) ? path : home
}
