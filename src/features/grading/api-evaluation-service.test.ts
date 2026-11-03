import { describe, expect, it, vi } from 'vitest'
import { createApiEvaluationService } from './api-evaluation-service'

describe('apiEvaluationService', () => {
  it('calls getByQuestionAttempt, gradeWithAi, finalizeEvaluation, findByCourse, and findByExam', async () => {
    const request = vi.fn().mockImplementation((path: string) => {
      if (path.includes('/evaluations')) {
        return Promise.resolve({ data: { content: [], totalElements: 0, page: 0, size: 20, totalPages: 0 } })
      }
      return Promise.resolve({
        data: {
          id: 'eval-1',
          questionAttemptId: 'qa-1',
          questionId: 'q-1',
          questionContent: 'Question test',
          criteria: [],
          status: 'PENDING_REVIEW',
          transcript: [
            {
              id: 'turn-1',
              turnOrder: 1,
              speaker: 'AI',
              textContent: 'What is OOP?',
              audioUrl: null,
              turnType: 'MAIN_QUESTION',
              createdAt: '2026-11-03T10:00:00Z',
            },
          ],
        },
      })
    })

    const service = createApiEvaluationService({ request })

    await service.getByQuestionAttempt('qa-1')
    expect(request).toHaveBeenCalledWith('/api/question-attempts/qa-1/evaluation')

    await service.gradeWithAi('qa-1')
    expect(request).toHaveBeenCalledWith('/api/question-attempts/qa-1/evaluation/ai-grade', { method: 'POST' })

    await service.finalizeEvaluation('qa-1', { criteria: [{ criterionId: 'crit-1', finalScore: 9 }] })
    expect(request).toHaveBeenCalledWith('/api/question-attempts/qa-1/evaluation/final', {
      method: 'PUT',
      body: { criteria: [{ criterionId: 'crit-1', finalScore: 9 }] },
    })

    await service.findByCourse('course-1')
    expect(request).toHaveBeenCalledWith('/api/courses/course-1/evaluations', {
      query: { status: undefined, page: 0, size: 20 },
    })

    await service.findByExam('exam-1', { status: 'GRADED' })
    expect(request).toHaveBeenCalledWith('/api/exams/exam-1/evaluations', {
      query: { status: 'GRADED', page: 0, size: 20 },
    })
  })
})
