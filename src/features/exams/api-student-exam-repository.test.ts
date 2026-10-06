import { describe, expect, it, vi } from 'vitest'
import { createApiStudentExamRepository } from './api-student-exam-repository'
const examId = '22222222-2222-4222-8222-222222222222'; const studentId = '44444444-4444-4444-8444-444444444444'
describe('API student my-slot repository', () => {
  it('passes the authenticated student UUID as a query parameter', async () => {
    const request = vi.fn().mockResolvedValue({ examId, status: 'READY' }); await createApiStudentExamRepository({ request }).getMySlot(examId, studentId)
    expect(request).toHaveBeenCalledWith(`/api/v1/student/exams/${examId}/my-slot`, { query: { studentId } })
  })
  it('rejects arbitrary mock identities', async () => { const request = vi.fn(); await expect(createApiStudentExamRepository({ request }).getMySlot(examId, 'demo-student')).rejects.toMatchObject({ code: 'INVALID_UUID' }); expect(request).not.toHaveBeenCalled() })
})
