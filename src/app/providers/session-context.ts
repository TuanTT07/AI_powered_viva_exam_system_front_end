import { createContext } from 'react'
import type { SessionState } from '../../types/auth'

export const defaultSession: SessionState = { status: 'unauthenticated', user: null }
export const SessionContext = createContext(defaultSession)
