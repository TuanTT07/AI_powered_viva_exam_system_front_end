import { describe, expect, it } from 'vitest'
import { mockGenerationAdapter } from './mock-generation'

describe('mock generation adapter', () => {
  it('returns deterministic selected drafts without document content', async () => {
    const request = { subjectId: 'java', materialIds: ['ready'], topic: 'Collections', bloom: 'HIỂU' as const, count: 2, language: 'vi' as const }
    const first = await mockGenerationAdapter.generate(request, ['java.pdf'])
    const second = await mockGenerationAdapter.generate(request, ['java.pdf'])
    expect(first).toEqual(second)
    expect(first).toHaveLength(2)
    expect(first.every((question) => question.selected)).toBe(true)
  })
  it('exposes a deterministic failure switch for tests', async () => {
    await expect(mockGenerationAdapter.generate({ subjectId: 'java', materialIds: ['ready'], topic: 'MOCK_FAILURE', bloom: 'HIỂU', count: 1, language: 'vi' }, ['java.pdf'])).rejects.toThrow('Mock generation failure')
  })
})
