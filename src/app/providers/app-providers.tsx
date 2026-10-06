import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type { SessionState } from '../../types/auth'
import { defaultAuthAdapter, type AuthAdapter } from '../../features/auth/auth-adapter'
import { defaultSession, SessionContext } from './session-context'

export function SessionProvider({ children, initialSession, adapter = defaultAuthAdapter(), queryClient: providedQueryClient }: { children: ReactNode; initialSession?: SessionState; adapter?: AuthAdapter; queryClient?: QueryClient }) {
  const [session, setSession] = useState<SessionState>(initialSession ?? defaultSession)
  const [localQueryClient] = useState(() => new QueryClient())
  const queryClient = providedQueryClient ?? localQueryClient
  const signingOut = useRef(false)
  useEffect(() => {
    if (initialSession) return
    let active = true
    adapter.getSession().then((user) => { if (active) setSession(user ? { status: 'authenticated', user } : { status: 'unauthenticated', user: null }) }).catch(() => { if (active) setSession({ status: 'unauthenticated', user: null }) })
    return () => { active = false }
  }, [adapter, initialSession])
  const value = useMemo(() => ({ session, async signIn(credentials: Parameters<AuthAdapter['signIn']>[0]) { const user = await adapter.signIn(credentials); setSession({ status: 'authenticated', user }); return user }, async signOut() { if (signingOut.current) return; signingOut.current = true; try { await adapter.signOut() } catch { /* Local cleanup is required even when a future remote sign-out fails. */ } finally { queryClient.clear(); setSession({ status: 'unauthenticated', user: null }); signingOut.current = false } } }), [adapter, queryClient, session])
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

export function AppProviders({ children }: { children: ReactNode }) {
  const [client] = useState(() => new QueryClient({ defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false }, mutations: { retry: 0 } } }))
  return <QueryClientProvider client={client}><SessionProvider queryClient={client}>{children}</SessionProvider></QueryClientProvider>
}
