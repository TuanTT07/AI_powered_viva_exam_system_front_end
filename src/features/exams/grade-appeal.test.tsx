import { render, screen, cleanup } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import { StudentExamResultPage } from './student-exam-result-page'
import { cancelGradeAppeal, getGradeAppeal, saveGradeAppeal } from './grade-appeal-storage'
import { runtimeConfig } from '../../services/api/runtime-config'
const source = runtimeConfig.dataSource
const examId = 'EXAM-2024-CORE-K21'
afterEach(() => { cleanup(); cancelGradeAppeal(examId); runtimeConfig.dataSource = source })
function renderResult() {
  runtimeConfig.dataSource = 'mock'
  render(<MemoryRouter initialEntries={[`/student/exams/${examId}/result`]}><Routes><Route path="/student/exams/:examId/result" element={<StudentExamResultPage />} /></Routes></MemoryRouter>)
}
describe('read-only results and existing appeals', () => {
  it('does not offer appeal mutations on the read-only result page', () => {
    renderResult()
    expect(screen.getByRole('heading', { name: 'Thi cuối kỳ Java Core K21' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Tạo đơn phúc khảo/ })).not.toBeInTheDocument()
    expect(getGradeAppeal(examId)).toBeNull()
  })
  it('preserves an existing appeal without exposing cancellation on results', () => {
    const appeal = saveGradeAppeal({ examId, currentScore: 8.8, category: 'technical_issue', reason: 'Đề nghị kiểm tra sự cố đường truyền.', contactEmail: 'student@example.test' })
    renderResult()
    expect(screen.queryByRole('button', { name: /Hủy đơn phúc khảo/ })).not.toBeInTheDocument()
    expect(getGradeAppeal(examId)).toEqual(appeal)
  })
})
