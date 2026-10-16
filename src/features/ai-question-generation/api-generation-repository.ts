import { ApiError, apiClient, type ApiClient } from '../../services/api/client'
import { unwrapApiEnvelope, type ApiEnvelope } from '../../services/api/transport-types'
import { mapQuestionDto, type QuestionApiBloomLevel, type QuestionResponseDto } from '../question-bank/api-question-repository'
import type { Question } from '../question-bank/question-types'

export type GenerateQuestionsRequestDto = {
  count: number
  topic?: string
  bloomLevels?: QuestionApiBloomLevel[]
  rubricId?: string | null
  documentIds?: string[]
}

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
export const isUuid = (value: string) => uuidPattern.test(value)
function assertUuid(value: string, label = 'Mã học phần') {
  if (!isUuid(value)) throw new ApiError(`${label} phải là UUID của backend.`, { code: 'INVALID_UUID' })
}

function unwrapResponse<T>(payload: unknown): T {
  if (payload && typeof payload === 'object' && 'data' in payload && 'success' in payload) {
    return unwrapApiEnvelope(payload as ApiEnvelope<T>)
  }
  return payload as T
}

export function createApiGenerationRepository(client: ApiClient = apiClient) {
  return {
    async generate(courseId: string, request: GenerateQuestionsRequestDto): Promise<Question[]> {
      assertUuid(courseId, 'Mã học phần')
      if (request.rubricId) assertUuid(request.rubricId, 'Mã rubric')
      if (request.documentIds) {
        request.documentIds.forEach((id) => assertUuid(id, 'Mã tài liệu'))
      }

      const body: GenerateQuestionsRequestDto = {
        count: Math.min(20, Math.max(1, request.count || 1)),
        topic: request.topic?.trim() || undefined,
        bloomLevels: request.bloomLevels && request.bloomLevels.length > 0 ? request.bloomLevels : undefined,
        rubricId: request.rubricId || undefined,
        documentIds: request.documentIds && request.documentIds.length > 0 ? request.documentIds : undefined,
      }

      const raw = await client.request<unknown>(`/api/courses/${encodeURIComponent(courseId)}/questions/generate`, {
        method: 'POST',
        body,
        timeoutMs: 120000, // Generation with Gemini can take up to 2 minutes
      })

      const dtoList = unwrapResponse<QuestionResponseDto[]>(raw) || []
      return dtoList.map(mapQuestionDto)
    },
  }
}

export const apiGenerationRepository = createApiGenerationRepository()
