import { describe, expect, it } from 'vitest'
import { createMaterialRepository } from './material-repository'

describe('material repository', () => {
  it('keeps material records scoped by subject and turns retry failures into ready records', async () => {
    const repo = createMaterialRepository([{ id: 'failed', subjectId: 'java', filename: 'bad.pdf', extension: 'PDF', size: 1, status: 'FAILED', uploadedAt: '', updatedAt: '', failureMessage: 'safe failure' }, { id: 'other', subjectId: 'other', filename: 'other.txt', extension: 'TXT', size: 1, status: 'READY', uploadedAt: '', updatedAt: '' }])
    await expect(repo.retry('java', 'failed')).resolves.toMatchObject({ status: 'READY', failureMessage: undefined })
    await repo.remove('java', 'failed')
    await expect(repo.list('java')).resolves.toEqual([])
    await expect(repo.list('other')).resolves.toHaveLength(1)
  })
})
