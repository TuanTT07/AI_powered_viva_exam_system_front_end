import { describe, expect, it } from 'vitest'
import { createRubricRepository, mockRubricRepository } from './rubric-repository'
import { apiRubricRepository } from './api-rubric-repository'

describe('rubricRepository', () => {
  it('selects mock and API repositories explicitly without mode leakage', () => {
    expect(createRubricRepository({ dataSource: 'mock' })).toBe(mockRubricRepository)
    expect(createRubricRepository({ dataSource: 'api' })).toBe(apiRubricRepository)
    expect(createRubricRepository({ dataSource: 'mock' })).toBe(mockRubricRepository)
  })

  it('returns data scoped to the requested subject', async () => {
    await expect(mockRubricRepository.list('java')).resolves.toHaveLength(1)
    await expect(mockRubricRepository.list('another-subject')).resolves.toEqual([])
  })

  it('persists a rubric with stable criterion identifiers', async () => {
    const saved = await mockRubricRepository.save({ subjectId: 'testing', name: 'Rubric kiểm thử', criteria: [{ id: 'criterion-test', name: 'Bao phủ', maximumScore: '5', description: '' }] })
    await expect(mockRubricRepository.get('testing', saved.id)).resolves.toMatchObject({ id: saved.id, criteria: [{ id: 'criterion-test' }] })
  })
})
