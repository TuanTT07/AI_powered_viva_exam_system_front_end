import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import userEvent from '@testing-library/user-event'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { UserManagementPage } from './UserManagementPage'

describe('Admin User Creation Flow', () => {
  it('opens create modal, fills form, submits, closes modal, and shows success alert', async () => {
    const user = userEvent.setup()
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    })

    render(
      <QueryClientProvider client={client}>
        <MemoryRouter initialEntries={['/admin/users']}>
          <Routes>
            <Route path="/admin/users" element={<UserManagementPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    )

    // Wait for users table to load
    expect(await screen.findByText('TS. Nguyễn Văn An')).toBeInTheDocument()

    // Dialog should not be present initially
    expect(screen.queryByRole('heading', { name: 'Cấp tài khoản mới' })).not.toBeInTheDocument()

    // Click "Cấp tài khoản mới"
    const openBtn = screen.getByRole('button', { name: /Cấp tài khoản mới/i })
    await user.click(openBtn)

    // Dialog should be visible
    expect(screen.getByRole('heading', { name: 'Cấp tài khoản mới' })).toBeInTheDocument()

    // Fill form
    const nameInput = screen.getByLabelText(/Họ và tên/i)
    const emailInput = screen.getByLabelText(/Email/i)
    const codeInput = screen.getByLabelText(/Mã định danh/i)
    const passInput = screen.getByLabelText(/Mật khẩu khởi tạo/i)

    await user.type(nameInput, 'Giảng Viên Test')
    await user.type(emailInput, 'gvtest@academia.edu.vn')
    await user.type(codeInput, 'CB-99999')
    await user.type(passInput, 'Password123!')

    // Submit via "Tạo tài khoản" button
    const submitBtn = screen.getByRole('button', { name: 'Tạo tài khoản' })
    await user.click(submitBtn)

    // Modal should close and success feedback should display
    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: 'Cấp tài khoản mới' })).not.toBeInTheDocument()
      expect(screen.getByText('Đã tạo tài khoản mới thành công.')).toBeInTheDocument()
    })

    // Dismiss feedback
    const closeFeedback = screen.getByRole('button', { name: 'Đóng' })
    await user.click(closeFeedback)
    expect(screen.queryByText('Đã tạo tài khoản mới thành công.')).not.toBeInTheDocument()
  })
})
