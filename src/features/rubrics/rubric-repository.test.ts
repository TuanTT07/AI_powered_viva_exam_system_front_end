import { describe, expect, it } from 'vitest'
import { rubricRepository } from './rubric-repository'

describe('rubricRepository', () => {
  it('returns data scoped to the requested subject', async () => {
    await expect(rubricRepository.list('java')).resolves.toHaveLength(1)
    await expect(rubricRepository.list('another-subject')).resolves.toEqual([])
  })

  it('persists a rubric with stable criterion identifiers', async () => {
    const saved = await rubricRepository.save({ subjectId: 'testing', name: 'Rubric kiểm thử', criteria: [{ id: 'criterion-test', name: 'Bao phủ', maximumScore: '5', description: '' }] })
    await expect(rubricRepository.get('testing', saved.id)).resolves.toMatchObject({ id: saved.id, criteria: [{ id: 'criterion-test' }] })
  })
})
