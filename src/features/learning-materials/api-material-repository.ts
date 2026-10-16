import { ApiError, apiClient, type ApiClient } from '../../services/api/client'
import { unwrapApiEnvelope, type ApiEnvelope } from '../../services/api/transport-types'
import type { CourseMaterial, MaterialStatus } from './material-types'
import type { MaterialRepository } from './material-repository'

export type DocumentIndexStatus = 'PENDING' | 'INDEXING' | 'READY' | 'FAILED'

export type DocumentResponseDto = {
  id: string
  title: string
  originalFilename: string
  contentType: string
  fileSize: number
  indexingStatus: DocumentIndexStatus
  indexingError?: string | null
  createdAt: string
}

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
export const isMaterialUuid = (value: string) => uuidPattern.test(value)
function assertMaterialUuid(value: string, label = 'Mã học phần') {
  if (!isMaterialUuid(value)) throw new ApiError(`${label} phải là UUID của backend.`, { code: 'INVALID_UUID' })
}

function deriveExtension(filename: string, contentType?: string): CourseMaterial['extension'] {
  const ext = filename.split('.').pop()?.toUpperCase()
  if (ext === 'PDF' || ext === 'DOCX' || ext === 'PPTX' || ext === 'TXT') return ext
  if (contentType?.includes('pdf')) return 'PDF'
  if (contentType?.includes('word')) return 'DOCX'
  if (contentType?.includes('presentation') || contentType?.includes('powerpoint')) return 'PPTX'
  return 'PDF'
}

function mapStatus(indexStatus: DocumentIndexStatus): MaterialStatus {
  switch (indexStatus) {
    case 'READY':
      return 'READY'
    case 'FAILED':
      return 'FAILED'
    case 'INDEXING':
    case 'PENDING':
    default:
      return 'PROCESSING'
  }
}

export function mapDocumentDto(dto: DocumentResponseDto, subjectId: string): CourseMaterial {
  const filename = dto.originalFilename || dto.title || 'Tài liệu'
  return {
    id: dto.id,
    subjectId,
    filename,
    extension: deriveExtension(filename, dto.contentType),
    size: dto.fileSize || 0,
    status: mapStatus(dto.indexingStatus),
    uploadedAt: dto.createdAt || new Date().toISOString(),
    updatedAt: dto.createdAt || new Date().toISOString(),
    failureMessage: dto.indexingError ?? undefined,
  }
}

function unwrapResponse<T>(payload: unknown): T {
  if (payload && typeof payload === 'object' && 'data' in payload && 'success' in payload) {
    return unwrapApiEnvelope(payload as ApiEnvelope<T>)
  }
  return payload as T
}

export function createApiMaterialRepository(client: ApiClient = apiClient): MaterialRepository {
  return {
    async list(subjectId: string): Promise<CourseMaterial[]> {
      assertMaterialUuid(subjectId, 'Mã môn học')
      const raw = await client.request<unknown>(`/api/courses/${encodeURIComponent(subjectId)}/documents`)
      const list = unwrapResponse<DocumentResponseDto[]>(raw) || []
      return list.map((doc) => mapDocumentDto(doc, subjectId))
    },
    async upload(subjectId: string, files: File[]): Promise<CourseMaterial[]> {
      assertMaterialUuid(subjectId, 'Mã môn học')
      const uploaded: CourseMaterial[] = []
      for (const file of files) {
        const form = new FormData()
        form.append('file', file)
        form.append('title', file.name)
        const raw = await client.request<unknown>(`/api/courses/${encodeURIComponent(subjectId)}/documents`, {
          method: 'POST',
          body: form,
        })
        const dto = unwrapResponse<DocumentResponseDto>(raw)
        uploaded.push(mapDocumentDto(dto, subjectId))
      }
      return uploaded
    },
    async retry(_subjectId: string, _materialId: string): Promise<CourseMaterial> {
      // Backend does not have an explicit retry endpoint; client can re-upload or refresh
      throw new ApiError('Chức năng thử lại chưa được backend hỗ trợ. Vui lòng tải lại tệp mới.', { status: 400 })
    },
    async remove(subjectId: string, materialId: string): Promise<void> {
      assertMaterialUuid(subjectId, 'Mã môn học')
      assertMaterialUuid(materialId, 'Mã tài liệu')
      await client.request<void>(`/api/courses/${encodeURIComponent(subjectId)}/documents/${encodeURIComponent(materialId)}`, {
        method: 'DELETE',
      })
    },
  }
}

export const apiMaterialRepository = createApiMaterialRepository()
