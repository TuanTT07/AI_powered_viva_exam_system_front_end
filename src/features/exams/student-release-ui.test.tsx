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

it('keeps released dialogue and criteria readable without a duplicate assessment record', async () => {
  runtimeConfig.dataSource = 'api'
  vi.spyOn(data, 'useResultDetail').mockReturnValue({ data: {
    score: 8, title: 'Exam', course: 'CS', demo: false, questions: [{
      questionAttemptId: 'q1', questionOrder: 1, questionContent: 'Main question', finalScore: 8, maxScore: 10,
      publishedAt: '2026-11-11T00:00:00Z', feedback: 'Lecturer feedback',
      criteria: [{ criterionId: 'c1', criterionName: 'Knowledge', finalScore: 8, maxScore: 10, comment: 'Criterion feedback' }],
      transcript: [
        { id: 't1', speaker: 'AI', turnType: 'MAIN_QUESTION', textContent: 'Main question' },
        { id: 't2', speaker: 'STUDENT', turnType: 'ANSWER', textContent: 'Student main answer' },
        { id: 't3', speaker: 'AI', turnType: 'FOLLOW_UP', textContent: 'Follow-up question' },
        { id: 't4', speaker: 'STUDENT', turnType: 'ANSWER', textContent: 'Student follow-up answer' },
      ],
    }],
  }, isError: false, isFetching: false } as unknown as ReturnType<typeof data.useResultDetail>)
  render(<MemoryRouter><StudentExamResultPage /></MemoryRouter>)
  screen.getByText('Câu hỏi chính 1').closest('summary')!.click()
  expect(screen.getAllByText('Main question')).toHaveLength(1)
  expect(screen.getByText('Student main answer')).toBeVisible()
  expect(screen.getByText('câu hỏi phụ 1.1')).toBeVisible()
  expect(screen.getByText('Student follow-up answer')).toBeVisible()
  expect(screen.getByText('Criterion feedback')).toBeVisible()
  expect(screen.getByText('Lecturer feedback')).toBeVisible()
  expect(screen.queryByRole('link', { name: 'Xem biên bản đánh giá' })).not.toBeInTheDocument()
  expect(screen.queryByText('Biên bản đánh giá')).not.toBeInTheDocument()
})
