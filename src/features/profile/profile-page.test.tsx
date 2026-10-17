import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SessionProvider } from '../../app/providers/app-providers'
import { ProfilePage } from './profile-page'
const config = vi.hoisted(() => ({ dataSource: 'mock' }))
const changePassword = vi.hoisted(() => vi.fn())
vi.mock('../../services/api/runtime-config', () => ({ runtimeConfig: config }))
vi.mock('../auth/api-auth-adapter', () => ({ apiChangePassword: changePassword }))
function renderProfile(role: 'student' | 'lecturer' | 'admin' = 'student') {
  return render(<SessionProvider adapter={{ getSession: async () => null, signIn: vi.fn(), signOut: vi.fn() }} initialSession={{ status: 'authenticated', user: { id: 'user-1', displayName: 'Nguyễn Văn An', roles: [role] } }}><MemoryRouter><ProfilePage /></MemoryRouter></SessionProvider>)
}
beforeEach(() => { config.dataSource = 'mock'; localStorage.clear(); changePassword.mockReset() })
describe('ProfilePage authority and persistence', () => {
  it.each(['student', 'lecturer', 'admin'] as const)('shows only confirmed identity for %s', role => {
    renderProfile(role)
    expect(screen.getByText('Nguyễn Văn An')).toBeInTheDocument()
    expect(screen.getByText('user-1')).toBeInTheDocument()
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    expect(screen.queryByText('Bảo vệ 2 lớp đang kích hoạt')).not.toBeInTheDocument()
    expect(screen.queryByText('94.8%')).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: /kiểm tra micro/i })).toHaveAttribute('href', '/device-check')
  })
  it('validates password data and explicitly avoids claiming a demo password changed', async () => {
    renderProfile(); const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: 'Bảo mật & Mật khẩu' }))
    await user.click(screen.getByRole('button', { name: 'Cập nhật mật khẩu' }))
    expect(screen.getByText('Vui lòng nhập mật khẩu hiện tại.')).toBeInTheDocument()
    await user.type(screen.getByLabelText('Mật khẩu hiện tại'), 'old-secret')
    await user.type(screen.getByLabelText('Mật khẩu mới', { exact: true }), '123')
    await user.click(screen.getByRole('button', { name: 'Cập nhật mật khẩu' }))
    expect(screen.getByText('Mật khẩu mới phải có tối thiểu 6 ký tự.')).toBeInTheDocument()
    await user.clear(screen.getByLabelText('Mật khẩu mới', { exact: true }))
    await user.type(screen.getByLabelText('Mật khẩu mới', { exact: true }), 'new-secret')
    await user.click(screen.getByRole('button', { name: 'Cập nhật mật khẩu' }))
    expect(screen.getByText('Mật khẩu xác nhận không khớp.')).toBeInTheDocument()
    await user.type(screen.getByLabelText('Xác nhận mật khẩu mới'), 'new-secret')
    await user.click(screen.getByRole('button', { name: 'Cập nhật mật khẩu' }))
    expect(screen.getByText(/Mật khẩu tài khoản demo không thay đổi/)).toBeInTheDocument()
    expect(changePassword).not.toHaveBeenCalled()
  })
  it('persists explicitly local demo preferences across remounts', async () => {
    const view = renderProfile(); const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: 'Tùy chọn & Thông báo' }))
    await user.type(screen.getByLabelText('Đơn vị mẫu'), 'Đơn vị demo')
    await user.click(screen.getByLabelText('Xem thử nhắc lịch thi qua email'))
    await user.click(screen.getByRole('button', { name: 'Lưu bản xem thử' }))
    expect(screen.getByText(/Đã lưu bản xem thử trên trình duyệt này/)).toBeInTheDocument()
    view.unmount(); renderProfile()
    await user.click(screen.getByRole('button', { name: 'Tùy chọn & Thông báo' }))
    expect(screen.getByLabelText('Đơn vị mẫu')).toHaveValue('Đơn vị demo')
    expect(screen.getByLabelText('Xem thử nhắc lịch thi qua email')).not.toBeChecked()
  })
  it('never exposes demo editing or fake save success in API mode', async () => {
    config.dataSource = 'api'; renderProfile(); const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: 'Tùy chọn & Thông báo' }))
    expect(screen.queryByRole('button', { name: 'Lưu bản xem thử' })).not.toBeInTheDocument()
    expect(screen.getByText(/chưa hỗ trợ lưu tùy chọn/)).toBeInTheDocument()
    expect(localStorage.length).toBe(0)
  })
  it('preserves API password inputs and displays failures from the backend', async () => {
    config.dataSource = 'api'; changePassword.mockRejectedValueOnce(new Error('Mật khẩu hiện tại không đúng'))
    renderProfile(); const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: 'Bảo mật & Mật khẩu' }))
    await user.type(screen.getByLabelText('Mật khẩu hiện tại'), 'old-secret')
    await user.type(screen.getByLabelText('Mật khẩu mới', { exact: true }), 'new-secret')
    await user.type(screen.getByLabelText('Xác nhận mật khẩu mới'), 'new-secret')
    await user.click(screen.getByRole('button', { name: 'Cập nhật mật khẩu' }))
    expect(await screen.findByText('Mật khẩu hiện tại không đúng')).toBeInTheDocument()
    expect(screen.getByLabelText('Mật khẩu hiện tại')).toHaveValue('old-secret')
    expect(screen.queryByText('Đã đổi mật khẩu.')).not.toBeInTheDocument()
  })
})
