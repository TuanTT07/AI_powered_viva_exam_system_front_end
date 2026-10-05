import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, type ReactNode } from 'react'
import type { SessionState } from '../../types/auth'
import { defaultSession, SessionContext } from './session-context'

export function SessionProvider({ children, initialSession = defaultSession }: { children: ReactNode; initialSession?: SessionState }) {
  return <SessionContext.Provider value={initialSession}>{children}</SessionContext.Provider>
}

export function AppProviders({ children }: { children: ReactNode }) {
  const [client] = useState(() => new QueryClient({ defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false }, mutations: { retry: 0 } } }))
  return <QueryClientProvider client={client}><SessionProvider>{children}</SessionProvider></QueryClientProvider>
}
