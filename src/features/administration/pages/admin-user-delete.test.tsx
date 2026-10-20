import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import userEvent from '@testing-library/user-event'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { UserManagementPage } from './UserManagementPage'
import { AdminUserDetailPage } from './AdminUserDetailPage'

describe('Admin User Delete Confirmation', () => {
  it('opens confirmation modal in UserManagementPage and supports cancel & confirm', async () => {
    const user = userEvent.setup()
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
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

    // Wait for users to load
    expect(await screen.findByText('TS. Nguyễn Văn An')).toBeInTheDocument()

    // Dialog should not be visible initially
    expect(screen.queryByRole('heading', { name: 'Xác nhận xóa tài khoản' })).not.toBeInTheDocument()

    // Click delete on TS. Nguyễn Văn An
    const deleteBtn = screen.getByRole('button', { name: /Xóa TS\. Nguyễn Văn An/i })
    await user.click(deleteBtn)

    // Confirmation dialog should appear
    expect(screen.getByRole('heading', { name: 'Xác nhận xóa tài khoản' })).toBeInTheDocument()
    expect(screen.getByText('Bạn có chắc chắn muốn xóa tài khoản này?')).toBeInTheDocument()

    // Click "Hủy bỏ"
    const cancelBtn = screen.getByRole('button', { name: 'Hủy bỏ' })
    await user.click(cancelBtn)

    // Dialog should close
    expect(screen.queryByRole('heading', { name: 'Xác nhận xóa tài khoản' })).not.toBeInTheDocument()
    expect(screen.getByText('TS. Nguyễn Văn An')).toBeInTheDocument()

    // Click delete again and confirm
    await user.click(deleteBtn)
    expect(screen.getByRole('heading', { name: 'Xác nhận xóa tài khoản' })).toBeInTheDocument()
    const confirmBtn = screen.getByRole('button', { name: 'Xác nhận xóa tài khoản' })
    await user.click(confirmBtn)

    // Feedback should show
    await waitFor(() => {
      expect(screen.getByText(/Đã xóa tài khoản "TS\. Nguyễn Văn An"\./)).toBeInTheDocument()
    })
  })

  it('opens confirmation modal in AdminUserDetailPage and supports cancel & confirm', async () => {
    const user = userEvent.setup()
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })

    render(
      <QueryClientProvider client={client}>
        <MemoryRouter initialEntries={['/admin/users/2']}>
          <Routes>
            <Route path="/admin/users" element={<div>Danh sách người dùng</div>} />
            <Route path="/admin/users/:userId" element={<AdminUserDetailPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    )

    // Wait for user details to load
    expect(await screen.findByRole('heading', { name: 'TS. Lê Quang Dũng' })).toBeInTheDocument()

    // Find "Xóa tài khoản" button
    const deleteBtn = screen.getByRole('button', { name: 'Xóa tài khoản' })
    expect(deleteBtn).toBeInTheDocument()

    // Dialog not visible initially
    expect(screen.queryByRole('heading', { name: 'Xác nhận xóa tài khoản' })).not.toBeInTheDocument()

    // Click "Xóa tài khoản"
    await user.click(deleteBtn)

    // Confirmation dialog should appear
    expect(screen.getByRole('heading', { name: 'Xác nhận xóa tài khoản' })).toBeInTheDocument()
    expect(screen.getByText('Bạn có chắc chắn muốn xóa tài khoản này?')).toBeInTheDocument()

    // Cancel
    const cancelBtn = screen.getByRole('button', { name: 'Hủy bỏ' })
    await user.click(cancelBtn)
    expect(screen.queryByRole('heading', { name: 'Xác nhận xóa tài khoản' })).not.toBeInTheDocument()

    // Click again and confirm
    await user.click(deleteBtn)
    const confirmBtn = screen.getByRole('button', { name: 'Xác nhận xóa tài khoản' })
    await user.click(confirmBtn)

    // Should navigate to /admin/users
    await waitFor(() => {
      expect(screen.getByText('Danh sách người dùng')).toBeInTheDocument()
    })
  })
})
