import { describe, expect, it, vi } from 'vitest'
import { ApiError } from '../../services/api/client'
import { createApiExamSchedulingRepository } from './api-exam-scheduling-repository'

const examId = '11111111-1111-4111-8111-111111111111'
const studentId = '22222222-2222-4222-8222-222222222222'
const slot = { attemptId: '33333333-3333-4333-8333-333333333333', examId, studentId, studentCode: 'SV1', studentName: 'Student', studentEmail: 's@example.com', slotNumber: 1, scheduledStartTime: '2026-10-20T08:00:00+07:00', scheduledEndTime: '2026-10-20T08:15:00+07:00', actualStartTime: null, actualEndTime: null, status: 'SCHEDULED' as const, accessCode: null }
describe('exam scheduling API repository', () => {
  it('maps assignment, schedule and auto endpoints with UUIDs', async () => {
    const request = vi.fn().mockResolvedValue([slot]); const repo = createApiExamSchedulingRepository({ request })
    await repo.assignCandidates(examId, [studentId]); await repo.getSchedule(examId); await repo.autoSchedule(examId, { studentIds: [studentId], slotDurationMinutes: 15, breakDurationMinutes: 5 })
    expect(request.mock.calls.map(([path, options]) => [path, options?.method])).toEqual([
      [`/api/v1/exams/${examId}/candidates`, 'POST'], [`/api/v1/exams/${examId}/schedule`, undefined], [`/api/v1/exams/${examId}/schedule/auto`, 'POST'],
    ])
    expect(request.mock.calls[0][1]).toEqual(expect.objectContaining({ body: { studentIds: [studentId] } }))
  })
  it('maps reschedule and rejects invalid IDs/slots without fallback', async () => {
    const request = vi.fn().mockResolvedValue(slot); const repo = createApiExamSchedulingRepository({ request })
    await repo.reschedule(examId, { studentId, newScheduledStartTime: '2026-10-20T08:00:00+07:00', newScheduledEndTime: '2026-10-20T08:15:00+07:00' })
    expect(request).toHaveBeenCalledWith(`/api/v1/exams/${examId}/schedule/reschedule`, expect.objectContaining({ method: 'PUT' }))
    await expect(repo.assignCandidates('EXAM-MOCK', [studentId])).rejects.toMatchObject({ code: 'INVALID_UUID' })
    await expect(repo.autoSchedule(examId, { studentIds: [studentId], slotDurationMinutes: 3 })).rejects.toMatchObject({ code: 'VALIDATION_ERROR' })
    const failed = createApiExamSchedulingRepository({ request: vi.fn().mockRejectedValue(new ApiError('down', { code: 'NETWORK_ERROR' })) })
    await expect(failed.getSchedule(examId)).rejects.toMatchObject({ code: 'NETWORK_ERROR' })
  })
})
