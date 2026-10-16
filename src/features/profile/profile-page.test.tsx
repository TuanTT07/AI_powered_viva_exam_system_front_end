import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import type { AuthenticatedUser } from '../../types/auth'
import { SessionProvider } from '../../app/providers/app-providers'
import { ProfilePage } from './profile-page'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const studentUser: AuthenticatedUser = {
  id: 'student-1',
  displayName: 'Nguyễn Văn An',
  roles: ['student'],
}

const lecturerUser: AuthenticatedUser = {
  id: 'lecturer-1',
  displayName: 'TS. Trần Văn Bình',
  roles: ['lecturer'],
}

const adminUser: AuthenticatedUser = {
  id: 'admin-1',
  displayName: 'Quản trị viên Vũ',
  roles: ['admin'],
}

function renderProfile(user: AuthenticatedUser) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  const adapter = {
    getSession: async () => user,
    signIn: vi.fn(),
    signOut: vi.fn(),
  }

  return render(
    <QueryClientProvider client={queryClient}>
      <SessionProvider adapter={adapter} queryClient={queryClient} initialSession={{ status: 'authenticated', user }}>
        <MemoryRouter initialEntries={['/profile']}>
          <Routes>
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
        </MemoryRouter>
      </SessionProvider>
    </QueryClientProvider>
  )
}

describe('ProfilePage', () => {
  it('renders student profile overview correctly', async () => {
    renderProfile(studentUser)

    expect(screen.getAllByText('Nguyễn Văn An').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('Thí sinh Vấn đáp')).toBeInTheDocument()
    expect(screen.getAllByText(/SV-2026-889/).length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('Thiết bị phòng thi & Môi trường Viva')).toBeInTheDocument()
    expect(screen.getByText('KỲ THI ĐỦ ĐIỀU KIỆN')).toBeInTheDocument()
  })

  it('renders lecturer profile overview correctly', async () => {
    renderProfile(lecturerUser)

    expect(screen.getAllByText('TS. Trần Văn Bình').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('Giảng viên / Giám khảo')).toBeInTheDocument()
    expect(screen.getAllByText(/GV-4021/).length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('MÔN HỌC PHỤ TRÁCH')).toBeInTheDocument()
  })

  it('renders admin profile overview correctly', async () => {
    renderProfile(adminUser)

    expect(screen.getAllByText('Quản trị viên Vũ').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('Quản trị viên hệ thống')).toBeInTheDocument()
    expect(screen.getAllByText(/AD-001/).length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('Tình trạng máy chủ & Giám sát toàn hệ thống')).toBeInTheDocument()
  })

  it('switches to Security tab and validates password changes', async () => {
    renderProfile(studentUser)
    const user = userEvent.setup()

    await user.click(screen.getByRole('tab', { name: /bảo mật & mật khẩu/i }))
    expect(screen.getByRole('heading', { name: /đổi mật khẩu tài khoản học thuật/i })).toBeInTheDocument()

    // Submit empty form
    await user.click(screen.getByRole('button', { name: /cập nhật mật khẩu/i }))
    expect(screen.getByText('Vui lòng nhập mật khẩu hiện tại.')).toBeInTheDocument()

    // Short new password
    await user.type(screen.getByPlaceholderText(/nhập mật khẩu hiện tại/i), 'old-password')
    await user.type(screen.getByPlaceholderText(/nhập mật khẩu mới/i), '123')
    await user.click(screen.getByRole('button', { name: /cập nhật mật khẩu/i }))
    expect(screen.getByText('Mật khẩu mới phải có tối thiểu 6 ký tự.')).toBeInTheDocument()

    // Mismatched passwords
    await user.clear(screen.getByPlaceholderText(/nhập mật khẩu mới/i))
    await user.type(screen.getByPlaceholderText(/nhập mật khẩu mới/i), 'new-password-123')
    await user.type(screen.getByPlaceholderText(/nhập lại mật khẩu mới/i), 'different-password')
    await user.click(screen.getByRole('button', { name: /cập nhật mật khẩu/i }))
    expect(screen.getByText('Mật khẩu xác nhận không khớp.')).toBeInTheDocument()
  })

  it('switches to Preferences tab and toggles options', async () => {
    renderProfile(studentUser)
    const user = userEvent.setup()

    await user.click(screen.getByRole('tab', { name: /tùy chọn & thông báo/i }))
    expect(screen.getByRole('heading', { name: /tùy chọn trải nghiệm & thông báo/i })).toBeInTheDocument()

    const checkboxes = screen.getAllByRole('checkbox')
    expect(checkboxes.length).toBeGreaterThanOrEqual(4)

    await user.click(screen.getByRole('button', { name: /lưu cài đặt/i }))
    expect(screen.getByText('Đã lưu cài đặt tùy chọn thành công!')).toBeInTheDocument()
  })

  it('allows inline personal info editing', async () => {
    renderProfile(studentUser)
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: /cập nhật thông tin/i }))
    expect(screen.getByLabelText('Họ và tên hiển thị')).toBeInTheDocument()

    await user.clear(screen.getByLabelText('Họ và tên hiển thị'))
    await user.type(screen.getByLabelText('Họ và tên hiển thị'), 'Nguyễn Văn An Cập Nhật')
    await user.click(screen.getByRole('button', { name: /lưu thông tin/i }))

    expect(screen.getByText('Đã cập nhật thông tin cá nhân thành công!')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1, name: 'Nguyễn Văn An Cập Nhật' })).toBeInTheDocument()
  })
})
