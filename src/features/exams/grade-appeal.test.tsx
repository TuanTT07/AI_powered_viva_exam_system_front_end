import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import userEvent from '@testing-library/user-event'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, beforeEach, vi } from 'vitest'
import { StudentExamResultPage } from './student-exam-result-page'
import { cancelGradeAppeal } from './grade-appeal-storage'

describe('Student Grade Appeal Feature', () => {
  const examId = 'EXAM-2024-CORE-K21'

  beforeEach(() => {
    cancelGradeAppeal(examId)
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('allows student to open appeal dialog, validates input, and submits appeal successfully', async () => {
    const user = userEvent.setup()
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })

    render(
      <QueryClientProvider client={client}>
        <MemoryRouter initialEntries={[`/student/exams/${examId}/result`]}>
          <Routes>
            <Route path="/student/exams/:examId/result" element={<StudentExamResultPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    )

    // Wait for exam result to load
    expect(await screen.findByRole('heading', { name: 'Thi cuối kỳ Java Core K21' })).toBeInTheDocument()

    // Find appeal button and click
    const appealBtn = screen.getByRole('button', { name: 'Tạo đơn phúc khảo' })
    expect(appealBtn).toBeInTheDocument()
    await user.click(appealBtn)

    // Dialog opens
    expect(screen.getByRole('heading', { name: 'Đơn yêu cầu phúc khảo kết quả thi' })).toBeInTheDocument()

    // Try submitting with short reason
    const reasonInput = screen.getByLabelText(/Giải trình chi tiết lý do khiếu nại/i)
    await user.type(reasonInput, 'Ngắn')
    const submitBtn = screen.getByRole('button', { name: /Gửi đơn phúc khảo/i })
    await user.click(submitBtn)

    // Validation error should appear
    expect(screen.getByText(/Vui lòng nêu rõ lý do phúc khảo chi tiết/i)).toBeInTheDocument()

    // Type valid reason (>= 20 characters)
    await user.clear(reasonInput)
    await user.type(
      reasonInput,
      'Tôi nhận thấy phần trả lời câu hỏi 2 về đa hình trong Java đã giải thích đầy đủ các ý nhưng nhận diện giọng nói bị thiếu từ khóa.'
    )

    // Submit valid appeal
    await user.click(submitBtn)

    // Dialog closes and appeal banner is displayed
    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: 'Đơn yêu cầu phúc khảo kết quả thi' })).not.toBeInTheDocument()
    })

    expect(screen.getByRole('heading', { name: 'Đơn yêu cầu phúc khảo đã được tiếp nhận' })).toBeInTheDocument()
    expect(screen.getByText(/Đang thẩm định bản ghi âm & transcript/i)).toBeInTheDocument()
    expect(screen.getAllByText(/Nhận diện giọng nói \(STT\) chưa chính xác/i).length).toBeGreaterThanOrEqual(1)

    // The CTA to create appeal should no longer be rendered
    expect(screen.queryByRole('button', { name: 'Tạo đơn phúc khảo' })).not.toBeInTheDocument()
  })

  it('supports canceling a submitted appeal', async () => {
    const user = userEvent.setup()
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })

    // Mock confirm dialog
    vi.spyOn(window, 'confirm').mockReturnValue(true)

    render(
      <QueryClientProvider client={client}>
        <MemoryRouter initialEntries={[`/student/exams/${examId}/result`]}>
          <Routes>
            <Route path="/student/exams/:examId/result" element={<StudentExamResultPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    )

    expect(await screen.findByRole('heading', { name: 'Thi cuối kỳ Java Core K21' })).toBeInTheDocument()

    // Submit an appeal first
    await user.click(screen.getByRole('button', { name: 'Tạo đơn phúc khảo' }))
    const reasonInput = screen.getByLabelText(/Giải trình chi tiết lý do khiếu nại/i)
    await user.type(
      reasonInput,
      'Đề nghị hội đồng khảo thí nghe lại đoạn ghi âm câu hỏi 1 do đường truyền mạng bị gián đoạn.'
    )
    await user.click(screen.getByRole('button', { name: /Gửi đơn phúc khảo/i }))

    expect(await screen.findByRole('heading', { name: 'Đơn yêu cầu phúc khảo đã được tiếp nhận' })).toBeInTheDocument()

    // Cancel appeal
    const cancelBtn = screen.getByRole('button', { name: /Hủy đơn phúc khảo/i })
    await user.click(cancelBtn)

    // Should return to clean state
    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: 'Đơn yêu cầu phúc khảo đã được tiếp nhận' })).not.toBeInTheDocument()
    })
    expect(screen.getByText(/Đã hủy đơn phúc khảo thành công\./i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Tạo đơn phúc khảo' })).toBeInTheDocument()
  })
})
