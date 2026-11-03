import { describe, expect, it, vi } from 'vitest'
import { createApiStudentExamRepository } from './api-student-exam-repository'
const examId = '22222222-2222-4222-8222-222222222222'
describe('API student my-slot repository', () => {
  it('derives ownership from JWT without a studentId query', async () => {
    const request = vi.fn().mockResolvedValue({ examId, status: 'READY' }); await createApiStudentExamRepository({ request }).getMySlot(examId)
    expect(request).toHaveBeenCalledWith(`/api/v1/student/exams/${examId}/my-slot`, undefined)
  })
  it('rejects a mock exam identifier', async () => { const request = vi.fn(); await expect(createApiStudentExamRepository({ request }).getMySlot('demo-exam')).rejects.toMatchObject({ code: 'INVALID_UUID' }); expect(request).not.toHaveBeenCalled() })
  it('loads page zero and preserves an empty success', async () => {
    const empty = { content: [], page: 0, size: 20, totalElements: 0, totalPages: 0 }
    const request = vi.fn().mockResolvedValue(empty)
    await expect(createApiStudentExamRepository({ request }).list()).resolves.toEqual(empty)
    expect(request).toHaveBeenCalledWith('/api/v1/student/exams', { query: { page: 0, size: 20 } })
  })
  it('forwards server pagination, READY filter and cancellation', async () => {
    const request = vi.fn().mockResolvedValue({ content: [] })
    const signal = new AbortController().signal
    await createApiStudentExamRepository({ request }).list({ page: 2, size: 100, status: 'READY' }, signal)
    expect(request).toHaveBeenCalledWith('/api/v1/student/exams', { query: { page: 2, size: 100, status: 'READY' }, signal })
  })
  it.each([{ page: -1 }, { page: 1.5 }, { size: 0 }, { size: 101 }, { size: 2.5 }])('rejects invalid pagination %j before transport', async input => {
    const request = vi.fn()
    await expect(createApiStudentExamRepository({ request }).list(input)).rejects.toMatchObject({ code: 'INVALID_QUERY' })
    expect(request).not.toHaveBeenCalled()
  })
  it('preserves backend errors instead of returning sample or empty data', async () => {
    const error = new Error('Schedule unavailable')
    const request = vi.fn().mockRejectedValue(error)
    await expect(createApiStudentExamRepository({ request }).list()).rejects.toBe(error)
  })
})
