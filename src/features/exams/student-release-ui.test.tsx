import { afterEach, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { StudentExamResultPage } from './student-exam-result-page'
import * as data from './student-result-data'
import { runtimeConfig } from '../../services/api/runtime-config'
const source = runtimeConfig.dataSource
afterEach(() => { cleanup(); runtimeConfig.dataSource = source; vi.restoreAllMocks() })
it('shows one clear pending state instead of partial scores and a configured denominator', () => {
  runtimeConfig.dataSource = 'api'
  vi.spyOn(data, 'useResultDetail').mockReturnValue({ data: { score: null, title: 'Exam', course: 'CS', questions: [{ questionOrder: 1, finalScore: 9.5, transcript: [{ textContent: 'Private pending answer' }] }], expectedQuestions: 3, demo: false }, isError: false, isFetching: false } as unknown as ReturnType<typeof data.useResultDetail>)
  render(<MemoryRouter><StudentExamResultPage /></MemoryRouter>)
  expect(screen.getByText('Đang chờ giảng viên hoàn tất và công bố kết quả.')).toBeInTheDocument()
  expect(screen.queryByText('Private pending answer')).not.toBeInTheDocument()
  expect(screen.queryByText(/1\/3/)).not.toBeInTheDocument()
  expect(screen.queryByText('9.5')).not.toBeInTheDocument()
})
