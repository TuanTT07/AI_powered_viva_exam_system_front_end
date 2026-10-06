import { describe, expect, it, vi } from 'vitest'
import { ApiError } from '../../services/api/client'
import { createApiExamRepository } from './api-exam-repository'

const courseId = '11111111-1111-4111-8111-111111111111'
const examId = '22222222-2222-4222-8222-222222222222'
const dto = { id: examId, courseId, courseCode: 'PRJ301', courseName: 'Project', title: 'Demo', startTime: '2026-12-01T08:00:00Z', endTime: '2026-12-01T08:30:00Z', status: 'DRAFT' as const, examConfig: { maxMainQuestions: 3, maxFollowUpQuestions: 2, timeLimitPerTurnSeconds: 1800 }, createdAt: '2026-11-01T00:00:00Z' }

describe('API exam repository', () => {
  it('maps Spring pagination and backend exam config into the domain model', async () => {
    const request = vi.fn().mockResolvedValue({ content: [dto], number: 0, size: 10, totalElements: 1, totalPages: 1 })
    const result = await createApiExamRepository({ request }).list({ q: '', subject: courseId, status: '', page: 1, pageSize: 10 })
    expect(request).toHaveBeenCalledWith('/api/v1/exams', { query: { courseId, status: undefined, page: 0, size: 10 } })
    expect(result).toMatchObject({ total: 1, page: 1, items: [{ id: examId, subjectId: courseId, durationMinutes: 30, mainQuestionCount: 3, maxFollowUpCount: 2 }] })
  })

  it('sends verified create/update/status payloads and handles empty delete', async () => {
    const request = vi.fn().mockResolvedValueOnce(dto).mockResolvedValueOnce(dto).mockResolvedValueOnce(dto).mockResolvedValueOnce(undefined)
    const repository = createApiExamRepository({ request })
    const draft = { title: 'Demo', subjectId: courseId, scheduledAt: dto.startTime, durationMinutes: 30, mainQuestionCount: 3, maxFollowUpCount: 2 }
    await repository.create(draft); await repository.update(examId, draft); await repository.updateStatus(examId, 'PUBLISHED'); await repository.delete(examId)
    expect(request.mock.calls[0][1]).toMatchObject({ method: 'POST', body: expect.objectContaining({ courseId, title: 'Demo', endTime: '2026-12-01T08:30:00.000Z', examConfig: expect.objectContaining({ maxMainQuestions: 3 }) }) })
    expect(request.mock.calls[1][1]).toMatchObject({ method: 'PUT', body: expect.not.objectContaining({ courseId }) })
    expect(request.mock.calls[2]).toEqual([`/api/v1/exams/${examId}/status`, { method: 'PATCH', body: { status: 'PUBLISHED' } }])
    expect(request.mock.calls[3]).toEqual([`/api/v1/exams/${examId}`, { method: 'DELETE' }])
  })

  it('rejects mock IDs before transport and does not fallback', async () => {
    const request = vi.fn()
    await expect(createApiExamRepository({ request }).get('EXAM-2024-COL-02')).rejects.toMatchObject({ code: 'INVALID_UUID' })
    expect(request).not.toHaveBeenCalled()
    expect(new ApiError('x', { status: 401 }).status).toBe(401)
  })
})
