import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { runtimeConfig } from '../../services/api/runtime-config'
import { StudentExamResultPage } from './student-exam-result-page'
import { StudentResultListPage } from './student-result-list-page'
import { ExamSuccessPage } from '../viva-session/pages/ExamSuccessPage'
const source = runtimeConfig.dataSource
afterEach(() => { cleanup(); runtimeConfig.dataSource = source })
describe('student result and receipt authority', () => {
  it('does not expose sample grades when API result release is unavailable', () => {
    runtimeConfig.dataSource = 'api'
    render(<MemoryRouter><StudentResultListPage /><StudentExamResultPage /></MemoryRouter>)
    expect(screen.queryByText('8.8')).not.toBeInTheDocument()
    expect(screen.queryByText('9.2')).not.toBeInTheDocument()
    expect(screen.getByText('Chưa có kết quả được hệ thống công bố')).toBeInTheDocument()
  })
  it('does not claim submission success on a directly visited completion route', () => {
    runtimeConfig.dataSource = 'mock'
    render(<MemoryRouter initialEntries={['/student/exams/demo/completed']}><Routes><Route path="/student/exams/:examId/completed" element={<ExamSuccessPage />} /></Routes></MemoryRouter>)
    expect(screen.getByRole('heading', { name: 'Chưa có biên nhận nộp bài' })).toBeInTheDocument()
    expect(screen.queryByText('Đã hoàn tất phiên mô phỏng')).not.toBeInTheDocument()
  })
})
