import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { AttemptTable } from './AttemptTable'
import type { EvaluationResponseDto } from '../../grading/api-evaluation-service'
const row = { attemptId: 'attempt', studentId: 'student', studentName: 'Candidate', studentCode: 'S1', studentEmail: 's@test', status: 'COMPLETED' as const, scheduledStartTime: null }
const evaluation = (id: string, score: number) => ({ questionAttemptId: id, examAttemptId: 'attempt', finalScore: score, maxScore: 10, status: 'GRADED' } as EvaluationResponseDto)
afterEach(() => { cleanup(); localStorage.clear() })
function mount(evaluations: EvaluationResponseDto[], expectedQuestions?: number) {
  render(<MemoryRouter><AttemptTable rows={[row]} examId="exam" allowReview summary evaluations={evaluations} expectedQuestions={expectedQuestions} /></MemoryRouter>)
}
describe('attempt total presentation', () => {
  it('shows 1/2 instead of the first score even with a local confirmation', () => {
    localStorage.setItem('aives_grading_exam_attempt', JSON.stringify({ confirmed: true, finalScore: 10 }))
    mount([evaluation('q1', 9.5)], 2)
    expect(screen.getByText('Đã chấm 1/2 câu chính')).toBeInTheDocument()
    expect(screen.queryByText('9.5')).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Xem tổng kết' })).toHaveAttribute('href', '/lecturer/exams/exam/attempts/attempt?tab=summary')
  })
  it('averages all finalized questions', () => {
    mount([evaluation('q1', 9.5), evaluation('q2', 6.5)], 2)
    expect(screen.getByText('8.0 / 10')).toBeInTheDocument()
  })
  it('fails closed when the backend does not provide expected count', () => {
    mount([evaluation('q1', 9.5)])
    expect(screen.getByText('Đã chấm 1/? câu chính')).toBeInTheDocument()
  })
})
