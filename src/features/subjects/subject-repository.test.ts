import { describe, expect, it, vi } from 'vitest'
import { createApiSubjectRepository, createMockSubjectRepository, mapCourseResponse } from './subject-repository'

describe('lecturer subject repository', () => {
  it('returns scoped mock subjects with source metadata', async () => {
    const subjects = await createMockSubjectRepository().list()
    expect(subjects.length).toBeGreaterThan(1)
    expect(subjects.every((subject) => subject.source === 'mock')).toBe(true)
    expect(subjects.map((subject) => subject.id)).toContain('oop-java')
  })

  it('does not replace mock identifiers with demo environment identifiers', async () => {
    const repository = createMockSubjectRepository({ dataSource: 'api', apiBaseUrl: '', apiTimeoutMs: 15000, demoCourseId: '11111111-1111-4111-8111-111111111111', demoExamId: '', demoCandidateIds: [] })
    const subjects = await repository.list()
    expect(subjects[0]).toMatchObject({ id: 'oop-java', code: 'INT2204', source: 'mock' })
    expect(subjects[1].id).toBe('java-core')
  })

  it('maps the verified CourseResponse DTO', () => {
    expect(mapCourseResponse({ id: '11111111-1111-4111-8111-111111111111', courseCode: 'PRJ301', courseName: 'Project', department: 'CNTT' })).toMatchObject({ id: '11111111-1111-4111-8111-111111111111', code: 'PRJ301', name: 'Project', status: 'ACTIVE', source: 'api' })
  })

  it('calls the temporary lecturer courses endpoint with the session UUID', async () => {
    const request = vi.fn().mockResolvedValue({ success: true, status: 200, message: 'ok', data: [{ id: '11111111-1111-4111-8111-111111111111', courseCode: 'PRJ301', courseName: 'Project', department: 'CNTT' }] })
    const repository = createApiSubjectRepository({ request })
    await expect(repository.list('22222222-2222-4222-8222-222222222222')).resolves.toHaveLength(1)
    expect(request).toHaveBeenCalledWith('/api/lecturers/22222222-2222-4222-8222-222222222222/courses')
  })

  it('rejects an invalid lecturer UUID without calling the backend', async () => {
    const request = vi.fn()
    const repository = createApiSubjectRepository({ request })
    await expect(repository.list('demo-lecturer')).rejects.toMatchObject({ code: 'INVALID_UUID' })
    expect(request).not.toHaveBeenCalled()
  })

  it('preserves an empty response and API errors', async () => {
    const empty = createApiSubjectRepository({ request: vi.fn().mockResolvedValue({ success: true, status: 200, message: 'ok', data: [] }) })
    await expect(empty.list('22222222-2222-4222-8222-222222222222')).resolves.toEqual([])
    const failed = createApiSubjectRepository({ request: vi.fn().mockRejectedValue(new Error('network')) })
    await expect(failed.list('22222222-2222-4222-8222-222222222222')).rejects.toThrow('network')
  })
})
