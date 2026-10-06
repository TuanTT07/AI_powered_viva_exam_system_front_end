import { describe, expect, it, vi } from 'vitest'
import { ApiError } from '../../services/api/client'
import { createApiQuestionRepository, mapQuestionDto } from './api-question-repository'

const dto = (overrides: Partial<Parameters<typeof mapQuestionDto>[0]> = {}) => ({ id: '11111111-1111-4111-8111-111111111111', courseId: '22222222-2222-4222-8222-222222222222', courseCode: 'INT2204', rubricId: null, rubricName: null, createdById: '33333333-3333-4333-8333-333333333333', content: 'Câu hỏi', bloomLevel: 'ANALYZE' as const, aiGenerated: false, status: 'DRAFT' as const, createdAt: '', updatedAt: '', ...overrides })
describe('Question API mapping', () => {
  it('maps all backend Bloom values and honest missing fields', () => {
    expect(mapQuestionDto(dto({ bloomLevel: 'REMEMBER' })).bloom).toBe('NHỚ')
    expect(mapQuestionDto(dto({ bloomLevel: 'UNDERSTAND' })).bloom).toBe('HIỂU')
    expect(mapQuestionDto(dto({ bloomLevel: 'APPLY' })).bloom).toBe('VẬN DỤNG')
    expect(mapQuestionDto(dto({ bloomLevel: 'ANALYZE' })).bloom).toBe('PHÂN TÍCH')
    expect(mapQuestionDto(dto({ bloomLevel: 'EVALUATE' })).bloom).toBe('ĐÁNH GIÁ')
    expect(mapQuestionDto(dto({ bloomLevel: 'CREATE', aiGenerated: true, status: 'APPROVED', rubricId: 'r', rubricName: 'R' })).bloom).toBe('SÁNG TẠO')
    expect(mapQuestionDto(dto()).topic).toBe('Chưa phân loại')
    expect(mapQuestionDto(dto()).suggestedAnswer).toBeUndefined()
    expect(mapQuestionDto(dto()).source).toBe('Thủ công')
  })
})
describe('Question API repository', () => {
  it('creates and updates with the verified backend request contract', async () => {
    const request = vi.fn().mockResolvedValue(dto())
    const repo = createApiQuestionRepository({ request })
    const input = { courseId: dto().courseId, rubricId: '55555555-5555-4555-8555-555555555555', createdById: dto().createdById, content: '  Nội dung mới  ', bloomLevel: 'PHÂN TÍCH' as const, aiGenerated: false }
    await repo.create(input)
    await repo.update(dto().id, input)
    expect(request).toHaveBeenNthCalledWith(1, '/api/questions', { method: 'POST', body: { ...input, content: 'Nội dung mới', bloomLevel: 'ANALYZE' } })
    expect(request).toHaveBeenNthCalledWith(2, `/api/questions/${dto().id}`, { method: 'PUT', body: { ...input, content: 'Nội dung mới', bloomLevel: 'ANALYZE' } })
  })
  it('rejects mock IDs and invalid write fields before transport', async () => {
    const request = vi.fn(); const repo = createApiQuestionRepository({ request })
    await expect(repo.create({ courseId: 'oop-java', rubricId: null, createdById: dto().createdById, content: 'x', bloomLevel: 'PHÂN TÍCH', aiGenerated: false })).rejects.toMatchObject({ code: 'INVALID_UUID' })
    await expect(repo.create({ courseId: dto().courseId, rubricId: null, createdById: dto().createdById, content: ' ', bloomLevel: 'PHÂN TÍCH', aiGenerated: false })).rejects.toMatchObject({ code: 'INVALID_CONTENT' })
    expect(request).not.toHaveBeenCalled()
  })
  it('maps search params and page indexes', async () => {
    const request = vi.fn().mockResolvedValue({ content: [dto()], number: 0, size: 20, totalElements: 1, totalPages: 1 })
    const repo = createApiQuestionRepository({ request })
    const result = await repo.search({ courseId: dto().courseId, keyword: 'abc', status: 'ĐÃ DUYỆT', bloom: 'ĐÁNH GIÁ', page: 1 })
    expect(request).toHaveBeenCalledWith('/api/questions', expect.objectContaining({ query: expect.objectContaining({ page: 0, keyword: 'abc', status: 'APPROVED', bloomLevel: 'EVALUATE' }) }))
    expect(result.items[0].id).toBe(dto().id)
  })
  it('rejects invalid UUIDs without making a request and rejects course mismatches', async () => {
    const request = vi.fn()
    const repo = createApiQuestionRepository({ request })
    await expect(repo.search({ courseId: 'java' })).rejects.toMatchObject({ code: 'INVALID_UUID' })
    expect(request).not.toHaveBeenCalled()
    request.mockResolvedValue(dto({ courseId: '44444444-4444-4444-8444-444444444444' }))
    await expect(repo.get(dto().courseId, dto().id)).rejects.toMatchObject({ code: 'INVALID_CONTEXT' })
  })
  it('uses approve and delete endpoints', async () => {
    const request = vi.fn().mockResolvedValueOnce(dto({ status: 'APPROVED' })).mockResolvedValueOnce(undefined)
    const repo = createApiQuestionRepository({ request })
    await repo.approve(dto().courseId, dto().id); await repo.delete(dto().courseId, dto().id)
    expect(request.mock.calls.map(([path, options]) => [path, options?.method])).toEqual([['/api/questions/' + dto().id + '/approve', 'POST'], ['/api/questions/' + dto().id, 'DELETE']])
  })
  it('does not fallback when the API fails', async () => { const repo = createApiQuestionRepository({ request: vi.fn().mockRejectedValue(new ApiError('down', { code: 'NETWORK_ERROR' })) }); await expect(repo.search({ courseId: dto().courseId })).rejects.toMatchObject({ code: 'NETWORK_ERROR' }) })
})
