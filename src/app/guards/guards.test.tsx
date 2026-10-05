import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { RequireAuth, RequireRole } from './guards'
import { SessionProvider } from '../providers/app-providers'

describe('route guards', () => {
  it('redirects unauthenticated visitors to login', () => {
    render(<SessionProvider initialSession={{ status: 'unauthenticated', user: null }}><MemoryRouter initialEntries={['/lecturer']}><Routes><Route element={<RequireAuth />}><Route path="/lecturer" element={<p>Protected</p>} /></Route><Route path="/login" element={<p>Login</p>} /></Routes></MemoryRouter></SessionProvider>)
    expect(screen.getByText('Login')).toBeInTheDocument()
  })

  it('keeps users out of a role they do not hold', () => {
    render(<SessionProvider initialSession={{ status: 'authenticated', user: { id: 'student-1', displayName: 'Student', roles: ['student'] } }}><MemoryRouter initialEntries={['/lecturer']}><Routes><Route element={<RequireRole roles={['lecturer']} />}><Route path="/lecturer" element={<p>Lecturer content</p>} /></Route></Routes></MemoryRouter></SessionProvider>)
    expect(screen.getByRole('heading', { name: 'Không có quyền truy cập' })).toBeInTheDocument()
  })
})
