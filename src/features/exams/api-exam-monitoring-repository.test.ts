import { describe, expect, it, vi } from 'vitest'
import { createApiExamMonitoringRepository } from './api-exam-monitoring-repository'
const examId = '22222222-2222-4222-8222-222222222222'; const attemptId = '33333333-3333-4333-8333-333333333333'
describe('API exam monitoring repository', () => {
  it('loads monitoring and sends reset/absent commands to verified endpoints', async () => {
    const request = vi.fn().mockResolvedValue({ candidateStatuses: [] }); const repository = createApiExamMonitoringRepository({ request })
    await repository.get(examId); await repository.reset(examId, attemptId); await repository.absent(examId, attemptId)
    expect(request.mock.calls.map((call) => call[0])).toEqual([`/api/v1/exams/${examId}/monitor`, `/api/v1/exams/${examId}/attempts/${attemptId}/reset`, `/api/v1/exams/${examId}/attempts/${attemptId}/absent`])
  })
})
