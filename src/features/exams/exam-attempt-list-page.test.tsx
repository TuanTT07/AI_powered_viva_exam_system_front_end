import { afterEach, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ExamAttemptListPage } from './exam-attempt-list-page'
import { runtimeConfig } from '../../services/api/runtime-config'
import { apiEvaluationService } from '../grading/api-evaluation-service'
vi.mock('./exam-hooks', () => ({ useExam: () => ({ data: { title: 'Exam', expectedMainQuestionCount: 1 }, isPending: false, isError: false }) }))
vi.mock('./use-assessment-overview', () => ({ useAssessmentOverview: () => ({ isPending: false, isError: false, data: { total: 1, demo: false, rows: [{ attemptId: 'attempt', studentName: 'Candidate still needs review', studentCode: 'S1', studentEmail: 's@test', status: 'COMPLETED' }] } }) }))
const source = runtimeConfig.dataSource
afterEach(() => { cleanup(); runtimeConfig.dataSource = source; vi.restoreAllMocks() })
it('retains the candidate after failed refresh even with cached complete grading', async () => {
  runtimeConfig.dataSource = 'api'
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  client.setQueryData(['exam-attempt-grading', 'exam', ['attempt']], { content: [{ questionAttemptId: 'q', examAttemptId: 'attempt', status: 'GRADED', finalScore: 9.5, maxScore: 10 }], counts: { attempt: 1 } })
  vi.spyOn(apiEvaluationService, 'attemptQuestions').mockRejectedValue(new Error('503'))
  const router = createMemoryRouter([{ path: '/lecturer/exams/:examId/attempts', element: <ExamAttemptListPage /> }], { initialEntries: ['/lecturer/exams/exam/attempts'] })
  render(<QueryClientProvider client={client}><RouterProvider router={router} /></QueryClientProvider>)
  expect(await screen.findByText('Không thể tải trạng thái chấm điểm.')).toBeInTheDocument()
  expect(screen.getByText('Candidate still needs review')).toBeInTheDocument()
  expect(screen.queryByText('9.5 / 10')).not.toBeInTheDocument()
})
