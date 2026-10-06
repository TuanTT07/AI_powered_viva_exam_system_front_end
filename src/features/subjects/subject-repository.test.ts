import { describe, expect, it } from 'vitest'
import { createMockSubjectRepository } from './subject-repository'

describe('lecturer subject repository', () => {
  it('returns scoped mock subjects with source metadata', async () => {
    const subjects = await createMockSubjectRepository().list()
    expect(subjects.length).toBeGreaterThan(1)
    expect(subjects.every((subject) => subject.source === 'mock')).toBe(true)
    expect(subjects.map((subject) => subject.id)).toContain('oop-java')
  })

  it('uses the configured demo course UUID only for the designated course', async () => {
    const repository = createMockSubjectRepository({ dataSource: 'api', apiBaseUrl: '', apiTimeoutMs: 15000, demoCourseId: '11111111-1111-4111-8111-111111111111', demoExamId: '', demoCandidateIds: [] })
    const subjects = await repository.list()
    expect(subjects[0]).toMatchObject({ id: '11111111-1111-4111-8111-111111111111', code: 'INT2204', source: 'mock' })
    expect(subjects[1].id).toBe('java-core')
  })
})
