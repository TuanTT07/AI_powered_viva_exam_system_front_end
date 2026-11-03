import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { AIQuestionGenerationPage } from './ai-question-generation-page'

describe('AI Question Generation - Quick Exam Assignment', () => {
  it('allows lecturer to quickly select an exam and assign generated questions directly', async () => {
    const user = userEvent.setup()
    const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })

    render(
      <QueryClientProvider client={client}>
        <MemoryRouter initialEntries={['/lecturer/subjects/oop-java/questions/generate']}>
          <Routes>
            <Route path="/lecturer/subjects/:subjectId/questions/generate" element={<AIQuestionGenerationPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    )

    // Verify page loads
    expect(await screen.findByRole('heading', { name: 'Sinh câu hỏi AI' })).toBeInTheDocument()

    // Trigger AI generation
    const generateBtn = screen.getByRole('button', { name: /Sinh 5 câu hỏi bằng AI/ })
    await user.click(generateBtn)

    // Wait for questions to be generated
    expect(await screen.findByRole('heading', { name: 'Rà soát câu hỏi sinh bởi AI' })).toBeInTheDocument()
    expect(await screen.findByText('CHỌN NHANH KỲ THI MONG MUỐN')).toBeInTheDocument()

    // Exam selector dropdown should be present
    const examSelect = screen.getByRole('combobox', { name: 'Chọn kỳ thi mong muốn' })
    expect(examSelect).toBeInTheDocument()

    // Select an exam
    await user.selectOptions(examSelect, 'EXAM-2024-COL-02')

    // Click quick assign button
    const assignBtn = screen.getByRole('button', { name: /Gán 5 câu vào kỳ thi này/ })
    expect(assignBtn).toBeEnabled()
    await user.click(assignBtn)

    // Verify confirmation and success banner
    expect(await screen.findByText(/Đã gán thành công 5 câu hỏi vào kỳ thi/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Xem cấu hình câu hỏi kỳ thi/ })).toHaveAttribute(
      'href',
      '/lecturer/exams/EXAM-2024-COL-02/questions'
    )
  })
})
