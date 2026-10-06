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
  it('creates a draft and updates only the selected record', async () => {
    const created = await repository.create({ title: 'Kỳ thi mới', subjectId: 'oop-java', scheduledAt: '2027-01-01T02:00:00.000Z', durationMinutes: 15, mainQuestionCount: 3, maxFollowUpCount: 2 })
    expect(created.status).toBe('DRAFT')
    const beforeOther = await repository.get('EXAM-2024-CORE-K21')
    const updated = await repository.update(created.id, { ...created, title: 'Kỳ thi đã sửa' })
    expect(updated.title).toBe('Kỳ thi đã sửa')
    expect((await repository.get('EXAM-2024-CORE-K21'))).toEqual(beforeOther)
  })
  it('rejects edits for non-editable statuses', async () => {
    const completed = await repository.get('EXAM-2024-CORE-K21')
    await expect(repository.update('EXAM-2024-CORE-K21', { ...completed!, title: 'Không được sửa' })).rejects.toThrow('not editable')
  })
})
