import { afterEach, expect, it, vi } from 'vitest'
import { apiEvaluationService } from './api-evaluation-service'
import { loadExamEvaluations } from './load-exam-evaluations'
afterEach(() => vi.restoreAllMocks())
it('loads every page so later questions are not omitted', async () => {
  const request = vi.spyOn(apiEvaluationService, 'findByExam').mockImplementation(async (_exam, params) => ({
    content: [{ questionAttemptId: `q${params?.page ?? 0}` }] as never,
    page: params?.page ?? 0, size: 1, totalPages: 3, totalElements: 3,
  }))
  expect((await loadExamEvaluations('exam')).content.map(q => q.questionAttemptId)).toEqual(['q0', 'q1', 'q2'])
  expect(request).toHaveBeenCalledWith('exam', { page: 2 })
})
it('rejects a later-page error instead of returning a complete-looking partial list', async () => {
  vi.spyOn(apiEvaluationService, 'findByExam')
    .mockResolvedValueOnce({ content: [], page: 0, size: 1, totalPages: 2, totalElements: 2 })
    .mockRejectedValueOnce(new Error('Forbidden'))
  await expect(loadExamEvaluations('exam')).rejects.toThrow('Forbidden')
})
