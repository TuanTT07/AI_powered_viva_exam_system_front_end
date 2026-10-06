import { describe, expect, it } from 'vitest'
import { createExamRepository, examSeed } from './exam-repository'

describe('exam repository', () => {
  const repository = createExamRepository()
  it('returns deterministic paginated records with all approved statuses', async () => {
    const result = await repository.list({ q: '', subject: '', status: '', page: 1, pageSize: 5 })
    expect(result.items).toHaveLength(5)
    expect(result.total).toBe(examSeed.length)
    expect(new Set(examSeed.map((exam) => exam.status))).toEqual(new Set(['DRAFT', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']))
    expect(result.totalPages).toBe(3)
  })
  it('filters by search, subject and status and clamps invalid pages', async () => {
    const result = await repository.list({ q: 'collections', subject: 'oop-java', status: 'DRAFT', page: 99, pageSize: 5 })
    expect(result.items.map((exam) => exam.id)).toEqual(['EXAM-2024-COL-02'])
    expect(result.page).toBe(1)
  })
  it('supports an explicit deterministic error fixture', async () => {
    await expect(repository.list({ q: '__ERROR__', subject: '', status: '', page: 1, pageSize: 5 })).rejects.toThrow('Exam repository unavailable')
  })
})
