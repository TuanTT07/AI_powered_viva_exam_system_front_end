import { describe, expect, it, vi } from 'vitest'
import { createApiRubricRepository } from './api-rubric-repository'

const response = {
  id: '30000000-0000-4000-8000-000000000001',
  rubricName: 'OOP Viva Rubric',
  description: 'OOP assessment',
  criteria: [{ id: 'criterion-1', criterionName: 'Correctness', description: 'Correct concepts', maxScore: 10 }],
  totalMaxScore: 10,
  createdAt: '2026-01-01T00:00:00Z',
}

describe('Rubric API repository', () => {
  it('uses the API transport and maps list DTOs', async () => {
    const request = vi.fn().mockResolvedValue([response])
    const repository = createApiRubricRepository({ request })

    await expect(repository.list('40000000-0000-4000-8000-000000000001')).resolves.toEqual([{
      id: response.id,
      subjectId: '40000000-0000-4000-8000-000000000001',
      name: 'OOP Viva Rubric',
      criteria: [{ id: 'criterion-1', name: 'Correctness', description: 'Correct concepts', maximumScore: '10' }],
    }])
    expect(request).toHaveBeenCalledWith('/api/rubrics')
  })

  it('sends create and update requests without contacting a real backend', async () => {
    const request = vi.fn()
      .mockResolvedValueOnce(response)
      .mockResolvedValueOnce({ ...response, rubricName: 'Updated rubric' })
    const repository = createApiRubricRepository({ request })
    const draft = { subjectId: '40000000-0000-4000-8000-000000000001', name: 'OOP Viva Rubric', criteria: [{ id: 'criterion-1', name: 'Correctness', description: 'Correct concepts', maximumScore: '10' }] }

    await repository.save(draft)
    await repository.save({ ...draft, id: response.id, name: 'Updated rubric' })

    expect(request).toHaveBeenNthCalledWith(1, '/api/rubrics', expect.objectContaining({ method: 'POST', body: expect.objectContaining({ rubricName: 'OOP Viva Rubric' }) }))
    expect(request).toHaveBeenNthCalledWith(2, `/api/rubrics/${response.id}`, expect.objectContaining({ method: 'PUT', body: expect.objectContaining({ rubricName: 'Updated rubric' }) }))
  })

  it('deletes a valid UUID and handles the empty 204 response', async () => {
    const request = vi.fn().mockResolvedValue(undefined)
    const repository = createApiRubricRepository({ request })
    await expect(repository.delete(response.id)).resolves.toBeUndefined()
    expect(request).toHaveBeenCalledWith(`/api/rubrics/${response.id}`, { method: 'DELETE' })
  })

  it('rejects mock IDs before making a delete request', async () => {
    const request = vi.fn()
    const repository = createApiRubricRepository({ request })
    await expect(repository.delete('rubric-java-core')).rejects.toMatchObject({ code: 'INVALID_UUID' })
    expect(request).not.toHaveBeenCalled()
  })
})
