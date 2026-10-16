import { describe, expect, it, vi } from 'vitest'
import { createApiMaterialRepository } from './api-material-repository'

const courseId = '40000000-0000-4000-8000-000000000001'
const docId = '50000000-0000-4000-8000-000000000001'

const docResponse = {
  id: docId,
  title: 'Giao_trinh_Java.pdf',
  originalFilename: 'Giao_trinh_Java.pdf',
  contentType: 'application/pdf',
  fileSize: 1024 * 1024,
  indexingStatus: 'READY' as const,
  indexingError: null,
  createdAt: '2026-10-16T13:00:00Z',
}

describe('API Material Repository', () => {
  it('fetches documents for a course and maps DTOs', async () => {
    const request = vi.fn().mockResolvedValue({
      success: true,
      status: 200,
      message: 'OK',
      data: [docResponse],
    })
    const repo = createApiMaterialRepository({ request })

    const list = await repo.list(courseId)
    expect(list).toEqual([{
      id: docId,
      subjectId: courseId,
      filename: 'Giao_trinh_Java.pdf',
      extension: 'PDF',
      size: 1024 * 1024,
      status: 'READY',
      uploadedAt: '2026-10-16T13:00:00Z',
      updatedAt: '2026-10-16T13:00:00Z',
      failureMessage: undefined,
    }])
    expect(request).toHaveBeenCalledWith(`/api/courses/${courseId}/documents`)
  })

  it('uploads files using FormData without manual Content-Type', async () => {
    const request = vi.fn().mockResolvedValue({
      success: true,
      status: 200,
      message: 'OK',
      data: docResponse,
    })
    const repo = createApiMaterialRepository({ request })

    const fakeFile = new File(['content'], 'test.pdf', { type: 'application/pdf' })
    const result = await repo.upload(courseId, [fakeFile])

    expect(result).toHaveLength(1)
    expect(request).toHaveBeenCalledWith(
      `/api/courses/${courseId}/documents`,
      expect.objectContaining({
        method: 'POST',
        body: expect.any(FormData),
      })
    )
  })

  it('deletes document with valid UUID', async () => {
    const request = vi.fn().mockResolvedValue({ success: true, status: 200, message: 'Deleted', data: null })
    const repo = createApiMaterialRepository({ request })

    await expect(repo.remove(courseId, docId)).resolves.toBeUndefined()
    expect(request).toHaveBeenCalledWith(`/api/courses/${courseId}/documents/${docId}`, { method: 'DELETE' })
  })

  it('rejects invalid UUIDs for courseId or documentId', async () => {
    const request = vi.fn()
    const repo = createApiMaterialRepository({ request })

    await expect(repo.list('invalid-id')).rejects.toMatchObject({ code: 'INVALID_UUID' })
    await expect(repo.remove(courseId, 'invalid-doc-id')).rejects.toMatchObject({ code: 'INVALID_UUID' })
    expect(request).not.toHaveBeenCalled()
  })
})
