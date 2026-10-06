import { ApiError, apiClient } from '../../services/api/client'
import type { Rubric, RubricCriterion, RubricDraft } from './rubric-types'
import type { RubricRepository } from './rubric-repository'

type RubricCriterionResponseDto = {
  id: string
  criterionName: string
  description: string
  maxScore: number
}

type RubricResponseDto = {
  id: string
  rubricName: string
  description: string
  criteria: RubricCriterionResponseDto[]
  totalMaxScore: number
  createdAt: string
}

type RubricCriterionRequestDto = {
  criterionName: string
  description: string
  maxScore: number
}

type RubricRequestDto = {
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
    subjectId,
    name: dto.rubricName,
    criteria: (dto.criteria || []).map(mapCriterionDto),
  }
}

function mapToRequest(draft: RubricDraft): RubricRequestDto {
  return {
    rubricName: draft.name,
    description: '',
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
function assertRubricUuid(value: string) { if (!isRubricUuid(value)) throw new ApiError('Mã rubric phải là UUID của backend.', { code: 'INVALID_UUID' }) }

export function createApiRubricRepository(client: RubricApiClient = apiClient): RubricRepository {
  return {
    async list(subjectId: string): Promise<Rubric[]> {
    const response = await client.request<RubricResponseDto[]>('/api/rubrics')
    // Backend doesn't filter rubrics by course, so we return all of them
    // and attach the requested subjectId to satisfy the frontend interface
    return response.map((dto) => mapRubricDto(dto, subjectId))
  },
  async get(subjectId: string, rubricId: string): Promise<Rubric | null> {
    try {
      const response = await client.request<RubricResponseDto>(`/api/rubrics/${encodeURIComponent(rubricId)}`)
      return mapRubricDto(response, subjectId)
    } catch (error: any) {
      if (error?.status === 404) return null
      throw error
    }
  },
    async save(draft: RubricDraft & { id?: string }): Promise<Rubric> {
    const payload = mapToRequest(draft)
    let response: RubricResponseDto
    if (draft.id) {
      response = await client.request<RubricResponseDto>(`/api/rubrics/${encodeURIComponent(draft.id)}`, {
        method: 'PUT',
        body: payload,
      })
    } else {
      response = await client.request<RubricResponseDto>('/api/rubrics', {
        method: 'POST',
        body: payload,
      })
    }
      return mapRubricDto(response, draft.subjectId)
    },
    async delete(rubricId: string): Promise<void> {
      assertRubricUuid(rubricId)
      await client.request<void>(`/api/rubrics/${encodeURIComponent(rubricId)}`, { method: 'DELETE' })
    },
  }
}

export const apiRubricRepository: RubricRepository = createApiRubricRepository()
