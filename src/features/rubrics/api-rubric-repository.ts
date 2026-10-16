import { ApiError, apiClient } from '../../services/api/client'
import { unwrapApiEnvelope, type ApiEnvelope } from '../../services/api/transport-types'
import type { Rubric, RubricCriterion, RubricDraft } from './rubric-types'
import type { RubricRepository } from './rubric-repository'

export type RubricCriterionResponseDto = {
  id: string
  criterionName: string
  description: string
  maxScore: number
}

export type RubricResponseDto = {
  id: string
  courseId?: string
  rubricName: string
  description: string
  criteria: RubricCriterionResponseDto[]
  totalMaxScore: number
  createdAt: string
}

export type RubricCriterionRequestDto = {
  criterionName: string
  description: string
  maxScore: number
}

export type RubricRequestDto = {
  rubricName: string
  description: string
  criteria: RubricCriterionRequestDto[]
}

function mapCriterionDto(dto: RubricCriterionResponseDto): RubricCriterion {
  return {
    id: dto.id,
    name: dto.criterionName,
    description: dto.description || '',
    maximumScore: dto.maxScore.toString(),
  }
}

function mapRubricDto(dto: RubricResponseDto, subjectId: string): Rubric {
  return {
    id: dto.id,
    subjectId: dto.courseId || subjectId,
    name: dto.rubricName,
    description: dto.description || '',
    criteria: (dto.criteria || []).map(mapCriterionDto),
  }
}

function mapToRequest(draft: RubricDraft): RubricRequestDto {
  return {
    rubricName: draft.name,
    description: draft.description ?? '',
    criteria: draft.criteria.map((c) => ({
      criterionName: c.name,
      description: c.description,
      maxScore: Number(c.maximumScore) || 0,
    })),
  }
}

type RubricApiClient = Pick<typeof apiClient, 'request'>
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
export const isRubricUuid = (value: string) => uuidPattern.test(value)
function assertRubricUuid(value: string, label = 'Mã rubric') {
  if (!isRubricUuid(value)) throw new ApiError(`${label} phải là UUID của backend.`, { code: 'INVALID_UUID' })
}

function unwrapResponse<T>(payload: unknown): T {
  if (payload && typeof payload === 'object' && 'data' in payload && 'success' in payload) {
    return unwrapApiEnvelope(payload as ApiEnvelope<T>)
  }
  return payload as T
}

export function createApiRubricRepository(client: RubricApiClient = apiClient): RubricRepository {
  return {
    async list(subjectId: string): Promise<Rubric[]> {
      const path = isRubricUuid(subjectId)
        ? `/api/courses/${encodeURIComponent(subjectId)}/rubrics`
        : '/api/rubrics'
      try {
        const raw = await client.request<unknown>(path)
        const response = unwrapResponse<RubricResponseDto[]>(raw)
        return (response || []).map((dto) => mapRubricDto(dto, subjectId))
      } catch (error: any) {
        if (error?.status === 404 && !isRubricUuid(subjectId)) return []
        throw error
      }
    },
    async get(subjectId: string, rubricId: string): Promise<Rubric | null> {
      assertRubricUuid(rubricId, 'Mã rubric')
      const path = isRubricUuid(subjectId)
        ? `/api/courses/${encodeURIComponent(subjectId)}/rubrics/${encodeURIComponent(rubricId)}`
        : `/api/rubrics/${encodeURIComponent(rubricId)}`
      try {
        const raw = await client.request<unknown>(path)
        const response = unwrapResponse<RubricResponseDto>(raw)
        return mapRubricDto(response, subjectId)
      } catch (error: any) {
        if (error?.status === 404) return null
        throw error
      }
    },
    async save(draft: RubricDraft & { id?: string }): Promise<Rubric> {
      const payload = mapToRequest(draft)
      const isCourseScoped = isRubricUuid(draft.subjectId)
      let raw: unknown
      if (draft.id) {
        assertRubricUuid(draft.id, 'Mã rubric')
        const path = isCourseScoped
          ? `/api/courses/${encodeURIComponent(draft.subjectId)}/rubrics/${encodeURIComponent(draft.id)}`
          : `/api/rubrics/${encodeURIComponent(draft.id)}`
        raw = await client.request<unknown>(path, {
          method: 'PUT',
          body: payload,
        })
      } else {
        const path = isCourseScoped
          ? `/api/courses/${encodeURIComponent(draft.subjectId)}/rubrics`
          : '/api/rubrics'
        raw = await client.request<unknown>(path, {
          method: 'POST',
          body: payload,
        })
      }
      const response = unwrapResponse<RubricResponseDto>(raw)
      return mapRubricDto(response, draft.subjectId)
    },
    async delete(rubricId: string, subjectId?: string): Promise<void> {
      assertRubricUuid(rubricId, 'Mã rubric')
      const path = subjectId && isRubricUuid(subjectId)
        ? `/api/courses/${encodeURIComponent(subjectId)}/rubrics/${encodeURIComponent(rubricId)}`
        : `/api/rubrics/${encodeURIComponent(rubricId)}`
      await client.request<void>(path, { method: 'DELETE' })
    },
  }
}

export const apiRubricRepository: RubricRepository = createApiRubricRepository()
