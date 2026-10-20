import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type { SessionState } from '../../types/auth'
import { defaultAuthAdapter, type AuthAdapter } from '../../features/auth/auth-adapter'
import { defaultSession, SessionContext } from './session-context'
import { onApiUnauthorized } from '../../services/api/client'

export function SessionProvider({ children, initialSession, adapter = defaultAuthAdapter(), queryClient: providedQueryClient }: { children: ReactNode; initialSession?: SessionState; adapter?: AuthAdapter; queryClient?: QueryClient }) {
  const [session, setSession] = useState<SessionState>(initialSession ?? defaultSession)
  const [sessionExpired, setSessionExpired] = useState(false)
  const [localQueryClient] = useState(() => new QueryClient())
  const queryClient = providedQueryClient ?? localQueryClient
  const signingOut = useRef(false)
  useEffect(() => {
    if (initialSession) return
    let active = true
    adapter.getSession().then((user) => { if (active) setSession(user ? { status: 'authenticated', user } : { status: 'unauthenticated', user: null }) }).catch(() => { if (active) setSession({ status: 'unauthenticated', user: null }) })
    return () => { active = false }
  }, [adapter, initialSession])
  const endSession = useCallback(async (expired: boolean) => {
    if (signingOut.current) return
    signingOut.current = true
    // Update the local session before awaiting a remote sign-out. A 401 can cause
    // auth hydration to finish concurrently; delaying this update loses the expiry
    // flag before RequireAuth redirects to the login screen.
    queryClient.clear()
    setSessionExpired(expired)
    setSession({ status: 'unauthenticated', user: null })
    try { await adapter.signOut() } catch { /* Local cleanup is required even when a future remote sign-out fails. */ } finally { signingOut.current = false }
  }, [adapter, queryClient])
  useEffect(() => onApiUnauthorized(() => { void endSession(true) }), [endSession])
  const value = useMemo(() => ({ session, sessionExpired, async signIn(credentials: Parameters<AuthAdapter['signIn']>[0]) { const user = await adapter.signIn(credentials); setSessionExpired(false); setSession({ status: 'authenticated', user }); return user }, signOut() { return endSession(false) } }), [adapter, endSession, session, sessionExpired])
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

export function AppProviders({ children }: { children: ReactNode }) {
  const [client] = useState(() => new QueryClient({ defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false }, mutations: { retry: 0 } } }))
  return <QueryClientProvider client={client}><SessionProvider queryClient={client}>{children}</SessionProvider></QueryClientProvider>
}
