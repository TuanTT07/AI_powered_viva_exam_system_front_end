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
  it('does not expose locally cached transcripts without publication authorization', () => {
    runtimeConfig.dataSource = 'api'
    const attemptId = 'attempt-123'
    sessionStorage.setItem(
      `aives.interview.transcript.${attemptId}`,
      JSON.stringify([
        { id: 't1', role: 'ai', text: 'Em hãy giải thích tính đóng gói trong Java.', timestamp: '10:01' },
        { id: 't2', role: 'student', text: 'Đóng gói là việc ẩn giấu thuộc tính bên trong lớp.', timestamp: '10:02' },
      ])
    )
    render(
      <MemoryRouter initialEntries={[`/student/exams/exam-123/result?attemptId=${attemptId}`]}>
        <Routes>
          <Route path="/student/exams/:examId/result" element={<StudentExamResultPage />} />
        </Routes>
      </MemoryRouter>
    )
    expect(screen.queryByText('Em hãy giải thích tính đóng gói trong Java.')).not.toBeInTheDocument()
    expect(screen.queryByText('Đóng gói là việc ẩn giấu thuộc tính bên trong lớp.')).not.toBeInTheDocument()
    expect(screen.queryByText('2 lượt hội thoại')).not.toBeInTheDocument()
    sessionStorage.clear()
  })
})

 describe('result navigation and published data', () => {
  it('links compact demo cards to dedicated details and omits evaluation prose', () => {
    runtimeConfig.dataSource = 'mock'
    render(<MemoryRouter><StudentResultListPage /></MemoryRouter>)
    expect(screen.getAllByRole('link', { name: /Xem chi tiết/ })[0]).toHaveAttribute('href', expect.stringContaining('/result?attemptId='))
    expect(screen.queryByText(/Nắm vững kiến thức cơ bản/)).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /Kiểm tra thiết bị/ })).not.toBeInTheDocument()
  })
})
