import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { QuestionImportDialog } from './question-import-dialog'

function renderDialog(onClose = vi.fn(), onSuccess = vi.fn()) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  render(<QueryClientProvider client={client}><QuestionImportDialog open subjectId="java" onClose={onClose} onSuccess={onSuccess} /></QueryClientProvider>)
  return { onClose, onSuccess }
}

function csvFile(csv: string) {
  const file = new File([csv], 'questions.csv', { type: 'text/csv' })
  Object.defineProperty(file, 'text', { value: () => Promise.resolve(csv) })
  return file
}

describe('QuestionImportDialog', () => {
  it('protects selected work before closing', async () => {
    const { onClose } = renderDialog()
    const input = await screen.findByLabelText(/Chọn hoặc thả tệp CSV vào đây/)
    await userEvent.upload(input, csvFile('question_text,topic,bloom_level,suggested_answer,rubric_name\nCâu hỏi,Collections,APPLY,,'))
    await screen.findByText('Bảng kiểm chứng dữ liệu')
    await userEvent.click(screen.getByRole('button', { name: 'Đóng hộp thoại' }))
    expect(screen.getByRole('heading', { name: 'Bỏ dữ liệu import chưa lưu?' })).toBeInTheDocument()
    expect(onClose).not.toHaveBeenCalled()
  })

  it('imports valid rows, reports success, and closes the dialog', async () => {
    const { onClose, onSuccess } = renderDialog()
    const input = await screen.findByLabelText(/Chọn hoặc thả tệp CSV vào đây/)
    await userEvent.upload(input, csvFile('question_text,topic,bloom_level,suggested_answer,rubric_name\nCâu hỏi dialog test,Collections,APPLY,,\nCâu lỗi,Unknown topic,APPLY,,'))
    await screen.findByText('Bảng kiểm chứng dữ liệu')
    await userEvent.click(screen.getByRole('button', { name: 'Nhập 1 câu hợp lệ' }))
    await userEvent.click(screen.getByRole('button', { name: 'Xác nhận nhập' }))
    await waitFor(() => expect(onSuccess).toHaveBeenCalledWith({ imported: 1, skipped: 1, failed: 0 }))
    expect(onClose).toHaveBeenCalledOnce()
  })
})
