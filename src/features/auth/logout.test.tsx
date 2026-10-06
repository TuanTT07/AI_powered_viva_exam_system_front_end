import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { SessionProvider } from '../../app/providers/app-providers'
import { useSession } from '../../app/providers/use-session'
import { WorkspaceLayout } from '../../app/layouts/layouts'
import type { AuthenticatedUser } from '../../types/auth'
import type { AuthAdapter } from './auth-adapter'
import { developmentAuthAdapter, unavailableAuthAdapter } from './auth-adapter'

const lecturer: AuthenticatedUser = { id: 'l1', displayName: 'Giảng viên A', roles: ['lecturer'] }
const adapterFor = (overrides: Partial<AuthAdapter> = {}): AuthAdapter => ({ getSession: async () => lecturer, signIn: async () => lecturer, signOut: async () => {}, ...overrides })

function renderWorkspace(role: 'lecturer' | 'student' | 'admin', adapter = adapterFor()) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  client.setQueryData(['private'], { secret: true })
  return { client, ...render(<QueryClientProvider client={client}><SessionProvider initialSession={{ status: 'authenticated', user: { ...lecturer, roles: [role], displayName: `${role} user` } }} adapter={adapter} queryClient={client}><MemoryRouter initialEntries={[`/${role}`]}><Routes><Route path={`/${role}`} element={<WorkspaceLayout role={role} title={role} />}><Route index element={<p>Protected content</p>} /></Route><Route path="/login" element={<p>Login page</p>} /></Routes></MemoryRouter></SessionProvider></QueryClientProvider>) }
}

describe('logout', () => {
  it('is available and resolves on both current adapters', async () => { await expect(developmentAuthAdapter.signOut()).resolves.toBeUndefined(); await expect(unavailableAuthAdapter.signOut()).resolves.toBeUndefined() })
  it.each(['lecturer', 'student', 'admin'] as const)('renders shared logout for %s', (role) => { renderWorkspace(role); expect(screen.getByRole('button', { name: 'Đăng xuất' })).toBeInTheDocument(); expect(screen.getByText(new RegExp(`${role} user`))).toBeInTheDocument() })
  it('clears the session/cache and replaces the protected route', async () => {
    const signOut = vi.fn(async () => {})
    const { client } = renderWorkspace('lecturer', adapterFor({ signOut }))
    await userEvent.setup().click(screen.getByRole('button', { name: 'Đăng xuất' }))
    expect(await screen.findByText('Login page')).toBeInTheDocument()
    expect(signOut).toHaveBeenCalledTimes(1)
    expect(client.getQueryData(['private'])).toBeUndefined()
  })
  it('prevents duplicate logout requests and cleans up after adapter failure', async () => {
    let resolve: (() => void) | undefined
    const signOut = vi.fn(() => new Promise<void>((finish) => { resolve = finish }))
    renderWorkspace('lecturer', adapterFor({ signOut }))
    const user = userEvent.setup(); const button = screen.getByRole('button', { name: 'Đăng xuất' }); await user.click(button); expect(await screen.findByRole('button', { name: 'Đang xử lý…' })).toBeDisabled(); await user.click(screen.getByRole('button', { name: 'Đang xử lý…' })); expect(signOut).toHaveBeenCalledTimes(1); resolve?.(); expect(await screen.findByText('Login page')).toBeInTheDocument()
  })
  it('still logs out when the adapter rejects', async () => { const client = new QueryClient(); const adapter = adapterFor({ signOut: async () => { throw new Error('remote unavailable') } }); render(<QueryClientProvider client={client}><SessionProvider initialSession={{ status: 'authenticated', user: lecturer }} adapter={adapter} queryClient={client}><TestSignOut /></SessionProvider></QueryClientProvider>); await userEvent.setup().click(screen.getByRole('button', { name: 'Sign out test' })); await waitFor(() => expect(screen.getByText('unauthenticated')).toBeInTheDocument()) })
})

function TestSignOut() { const { session, signOut } = useSession(); return <><span>{session.status}</span><button onClick={() => void signOut()}>Sign out test</button></> }
