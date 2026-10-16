import { describe, expect, it, vi } from 'vitest'
import { createApiGenerationRepository } from './api-generation-repository'

const courseId = '22222222-2222-4222-8222-222222222222'
const rubricId = '33333333-3333-4333-8333-333333333333'
const docId = '66666666-6666-4666-8666-666666666666'

const questionDto = {
  id: '77777777-7777-4777-8777-777777777777',
  courseId,
  courseCode: 'INT2204',
  rubricId,
  rubricName: 'Rubric vấn đáp Java',
  createdById: '11111111-1111-4111-8111-111111111111',
  content: 'Phân biệt abstraction và encapsulation trong Java.',
  bloomLevel: 'UNDERSTAND' as const,
  aiGenerated: true,
  status: 'DRAFT' as const,
  createdAt: '2026-10-16T13:00:00Z',
  updatedAt: '2026-10-16T13:00:00Z',
}

describe('API Generation Repository', () => {
  it('calls POST /api/courses/{courseId}/questions/generate with correct body', async () => {
    const request = vi.fn().mockResolvedValue({
      success: true,
      status: 200,
      message: 'OK',
      data: [questionDto],
    })
    const repo = createApiGenerationRepository({ request })

    const result = await repo.generate(courseId, {
      count: 2,
      topic: 'Java OOP',
      bloomLevels: ['UNDERSTAND', 'APPLY'],
      rubricId,
      documentIds: [docId],
    })

    expect(result).toHaveLength(1)
    expect(result[0].id).toBe(questionDto.id)
    expect(result[0].bloom).toBe('HIỂU')
    expect(result[0].source).toBe('AI đề xuất')
    expect(result[0].status).toBe('BẢN NHÁP')

    expect(request).toHaveBeenCalledWith(
      `/api/courses/${courseId}/questions/generate`,
      expect.objectContaining({
        method: 'POST',
        body: {
          count: 2,
          topic: 'Java OOP',
          bloomLevels: ['UNDERSTAND', 'APPLY'],
          rubricId,
          documentIds: [docId],
        },
      })
    )
  })

  it('validates UUIDs before making request', async () => {
    const request = vi.fn()
    const repo = createApiGenerationRepository({ request })

    await expect(repo.generate('invalid-uuid', { count: 1 })).rejects.toMatchObject({ code: 'INVALID_UUID' })
    await expect(repo.generate(courseId, { count: 1, rubricId: 'bad-rubric' })).rejects.toMatchObject({ code: 'INVALID_UUID' })
    expect(request).not.toHaveBeenCalled()
  })
})
