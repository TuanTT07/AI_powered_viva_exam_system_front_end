import { createContext } from 'react'
import type { AuthenticatedUser, LoginCredentials, SessionState } from '../../types/auth'

export type SessionContextValue = { session: SessionState; signIn(credentials: LoginCredentials): Promise<AuthenticatedUser>; signOut(): Promise<void> }
export const defaultSession: SessionState = { status: 'loading', user: null }
export const SessionContext = createContext<SessionContextValue>({ session: defaultSession, async signIn() { throw new Error('Session provider is unavailable.') }, async signOut() {} })
