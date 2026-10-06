import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import type { AuthenticatedUser } from '../../types/auth'
import { SessionProvider } from '../../app/providers/app-providers'
import type { AuthAdapter } from './auth-adapter'
import { authorizedReturnPath } from './auth-navigation'
import { LoginPage } from './login-page'

const lecturer: AuthenticatedUser = { id: 'lecturer-1', displayName: 'Lecturer', roles: ['lecturer'] }
const signedOutAdapter = (signIn: AuthAdapter['signIn']): AuthAdapter => ({ getSession: async () => null, signIn, signOut: async () => {} })

function renderLogin(adapter: AuthAdapter, from?: unknown) {
  return render(<SessionProvider adapter={adapter}><MemoryRouter initialEntries={[{ pathname: '/login', state: from ? { from } : undefined }]}><Routes><Route path="/login" element={<LoginPage />} /><Route path="/lecturer/*" element={<p>Lecturer destination</p>} /><Route path="/student/*" element={<p>Student destination</p>} /><Route path="/admin/*" element={<p>Admin destination</p>} /></Routes></MemoryRouter></SessionProvider>)
}

describe('LoginPage', () => {
  it('shows required and email-format validation without calling authentication', async () => {
    const signIn = vi.fn()
    renderLogin(signedOutAdapter(signIn))
    const user = userEvent.setup()
    await user.click(await screen.findByRole('button', { name: /đăng nhập vào hệ thống/i }))
    expect(screen.getByText('Nhập email học thuật của bạn.')).toBeInTheDocument()
    expect(screen.getByText('Nhập mật khẩu để tiếp tục.')).toBeInTheDocument()
    expect(signIn).not.toHaveBeenCalled()
  })

  it('changes password visibility without submitting the form', async () => {
    const signIn = vi.fn()
    renderLogin(signedOutAdapter(signIn))
    const user = userEvent.setup()
    const password = await screen.findByLabelText('Mật khẩu bảo mật')
    await user.type(password, 'not-a-real-password')
    await user.click(screen.getByRole('button', { name: 'Hiện mật khẩu' }))
    expect(password).toHaveAttribute('type', 'text')
    expect(signIn).not.toHaveBeenCalled()
  })

  it('keeps credentials available after a failed submission and supports retry', async () => {
    const signIn = vi.fn().mockRejectedValueOnce(new Error('rejected')).mockResolvedValueOnce(lecturer)
    renderLogin(signedOutAdapter(signIn), '/lecturer/exams')
    const user = userEvent.setup()
    await user.type(await screen.findByLabelText('Tài khoản Email học thuật'), 'lecturer@academia.edu.vn')
    await user.type(screen.getByLabelText('Mật khẩu bảo mật'), 'not-a-real-password')
    await user.click(screen.getByRole('button', { name: /đăng nhập vào hệ thống/i }))
    expect(await screen.findByText('Thông báo xác thực')).toBeInTheDocument()
    expect(screen.getByLabelText('Tài khoản Email học thuật')).toHaveValue('lecturer@academia.edu.vn')
    await user.click(screen.getByRole('button', { name: /đăng nhập vào hệ thống/i }))
    expect(await screen.findByText('Lecturer destination')).toBeInTheDocument()
    expect(signIn).toHaveBeenCalledTimes(2)
  })

  it('submits with Enter and prevents duplicate requests while pending', async () => {
    let complete: ((user: AuthenticatedUser) => void) | undefined
    const signIn = vi.fn(() => new Promise<AuthenticatedUser>((resolve) => { complete = resolve }))
    renderLogin(signedOutAdapter(signIn))
    const user = userEvent.setup()
    await user.type(await screen.findByLabelText('Tài khoản Email học thuật'), 'lecturer@academia.edu.vn')
    await user.type(screen.getByLabelText('Mật khẩu bảo mật'), 'not-a-real-password{Enter}')
    expect(await screen.findByRole('button', { name: 'Đang xử lý…' })).toBeDisabled()
    await user.click(screen.getByRole('button', { name: 'Đang xử lý…' }))
    expect(signIn).toHaveBeenCalledTimes(1)
    complete?.(lecturer)
    expect(await screen.findByText('Lecturer destination')).toBeInTheDocument()
  })

  it('shows an initialization state before the session is resolved', async () => {
    let complete: ((user: AuthenticatedUser | null) => void) | undefined
    const adapter: AuthAdapter = { getSession: () => new Promise((resolve: (user: AuthenticatedUser | null) => void) => { complete = resolve }), signIn: vi.fn(), signOut: vi.fn() }
    renderLogin(adapter)
    expect(screen.getAllByLabelText('Đang kiểm tra phiên đăng nhập')).toHaveLength(2)
    complete?.(null)
    expect(await screen.findByLabelText('Tài khoản Email học thuật')).toBeInTheDocument()
  })

  it('redirects an already authenticated visitor away from Login', async () => {
    render(<SessionProvider initialSession={{ status: 'authenticated', user: lecturer }}><MemoryRouter initialEntries={['/login']}><Routes><Route path="/login" element={<LoginPage />} /><Route path="/lecturer" element={<p>Lecturer destination</p>} /></Routes></MemoryRouter></SessionProvider>)
    expect(await screen.findByText('Lecturer destination')).toBeInTheDocument()
  })
})

describe('authorizedReturnPath', () => {
  it('accepts only supported destinations for the authenticated role', () => {
    expect(authorizedReturnPath('/lecturer/exams', lecturer)).toBe('/lecturer/exams')
    expect(authorizedReturnPath({ pathname: '/lecturer/exams', search: '?tab=open' }, lecturer)).toBe('/lecturer/exams?tab=open')
    expect(authorizedReturnPath('https://example.com', lecturer)).toBe('/lecturer')
    expect(authorizedReturnPath('//example.com', lecturer)).toBe('/lecturer')
    expect(authorizedReturnPath('/student/exams', lecturer)).toBe('/lecturer')
    expect(authorizedReturnPath('/login', lecturer)).toBe('/lecturer')
  })
})
