import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SessionContext } from '../../app/providers/session-context'
import { ExamQuestionConfigPage } from './exam-question-config-page'

function mount(examId: string) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const router = createMemoryRouter(
    [{ path: '/lecturer/exams/:examId/questions', element: <ExamQuestionConfigPage /> }],
    { initialEntries: [`/lecturer/exams/${examId}/questions`] }
  )
  return render(
    <QueryClientProvider client={client}>
      <SessionContext.Provider
        value={{
          session: {
            status: 'authenticated',
            user: { id: 'demo-lecturer', displayName: 'Demo Lecturer', roles: ['lecturer'] },
          },
          signIn: vi.fn(),
          signOut: vi.fn(),
        }}
      >
        <RouterProvider router={router} />
      </SessionContext.Provider>
    </QueryClientProvider>
  )
}

afterEach(cleanup)

describe('ExamQuestionConfigPage', () => {
  it('renders question configuration with KPI metrics and mode switch', async () => {
    mount('EXAM-2024-COL-02')

    expect(await screen.findByRole('heading', { name: /Cấu hình câu hỏi/ })).toBeInTheDocument()
    expect(screen.getByText('Câu hỏi chính yêu cầu')).toBeInTheDocument()
    expect(screen.getByText('Hỏi xoáy / Đào sâu tối đa')).toBeInTheDocument()

    // Mode selection radio buttons
    const manualRadio = screen.getByLabelText(/Chọn thủ công:/)
    const poolRadio = screen.getByLabelText(/Random pool:/)
    expect(manualRadio).toBeInTheDocument()
    expect(poolRadio).toBeInTheDocument()

    const user = userEvent.setup()
    await user.click(poolRadio)
    expect(poolRadio).toBeChecked()
  })

  it('supports auto-fill and enables save when questions are satisfied', async () => {
    mount('EXAM-2024-COL-02')
    const user = userEvent.setup()

    expect(await screen.findByRole('heading', { name: /Cấu hình câu hỏi/ })).toBeInTheDocument()

    const autoFillBtn = screen.getByRole('button', { name: 'Điền tự động theo thứ tự' })
    expect(autoFillBtn).toBeInTheDocument()
    await user.click(autoFillBtn)

    const saveBtn = screen.getByRole('button', { name: 'Lưu cấu hình câu hỏi' })
    expect(saveBtn).not.toBeDisabled()
  })

  it('shows read-only message when exam is not in draft or scheduled status', async () => {
    mount('EXAM-2024-OOP-01')

    expect(await screen.findByText('Chế độ chỉ đọc.')).toBeInTheDocument()
    const saveBtn = screen.getByRole('button', { name: 'Lưu cấu hình câu hỏi' })
    expect(saveBtn).toBeDisabled()
  })
})

