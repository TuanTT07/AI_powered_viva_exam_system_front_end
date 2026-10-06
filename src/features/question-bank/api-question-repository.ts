import { ApiError, apiClient, type ApiClient } from '../../services/api/client'
import { normalizeSpringPage, type PaginatedResult, type SpringPage } from '../../services/api/transport-types'
import type { BloomLevel, Question, QuestionStatus } from './question-types'

export type QuestionApiBloomLevel = 'REMEMBER' | 'UNDERSTAND' | 'APPLY' | 'ANALYZE' | 'EVALUATE' | 'CREATE'
export type QuestionApiStatus = 'DRAFT' | 'APPROVED'
export type QuestionResponseDto = {
  id: string; courseId: string; courseCode: string; rubricId: string | null; rubricName: string | null; createdById: string
  content: string; bloomLevel: QuestionApiBloomLevel; aiGenerated: boolean; status: QuestionApiStatus; createdAt: string; updatedAt: string
}
export type QuestionRequestDto = {
  courseId: string
  rubricId: string | null
  createdById: string
  content: string
  bloomLevel: QuestionApiBloomLevel
  aiGenerated: boolean
}
export type QuestionWriteInput = {
  courseId: string
  rubricId: string | null
  createdById: string
  content: string
  bloomLevel: BloomLevel
  aiGenerated: boolean
}
export type QuestionSearchParams = { courseId: string; keyword?: string; status?: QuestionStatus; bloom?: BloomLevel; page?: number; size?: number }

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
export const isUuid = (value: string) => uuidPattern.test(value)
const bloomToApi: Partial<Record<BloomLevel, QuestionApiBloomLevel>> = { NHỚ: 'REMEMBER', HIỂU: 'UNDERSTAND', 'VẬN DỤNG': 'APPLY', 'PHÂN TÍCH': 'ANALYZE', 'ĐÁNH GIÁ': 'EVALUATE', 'SÁNG TẠO': 'CREATE' }
const bloomToDomain: Record<QuestionApiBloomLevel, BloomLevel> = { REMEMBER: 'NHỚ', UNDERSTAND: 'HIỂU', APPLY: 'VẬN DỤNG', ANALYZE: 'PHÂN TÍCH', EVALUATE: 'ĐÁNH GIÁ', CREATE: 'SÁNG TẠO' }
const statusToApi: Partial<Record<QuestionStatus, QuestionApiStatus>> = { 'BẢN NHÁP': 'DRAFT', 'ĐÃ DUYỆT': 'APPROVED' }
const statusToDomain: Record<QuestionApiStatus, QuestionStatus> = { DRAFT: 'BẢN NHÁP', APPROVED: 'ĐÃ DUYỆT' }

export function mapQuestionDto(dto: QuestionResponseDto): Question {
  return { id: dto.id, subjectId: dto.courseId, content: dto.content, topic: 'Chưa phân loại', bloom: bloomToDomain[dto.bloomLevel], suggestedAnswer: undefined, rubricId: dto.rubricId ?? undefined, rubric: dto.rubricName ?? undefined, source: dto.aiGenerated ? 'AI đề xuất' : 'Thủ công', status: statusToDomain[dto.status], createdById: dto.createdById, aiGenerated: dto.aiGenerated }
}
function assertUuid(value: string, label: string) { if (!isUuid(value)) throw new ApiError(`${label} phải là UUID của backend.`, { code: 'INVALID_UUID' }) }
function mapWriteInput(input: QuestionWriteInput): QuestionRequestDto {
  assertUuid(input.courseId, 'Mã học phần'); assertUuid(input.createdById, 'Mã người tạo')
  if (input.rubricId) assertUuid(input.rubricId, 'Mã rubric')
  const bloomLevel = bloomToApi[input.bloomLevel]
  if (!bloomLevel) throw new ApiError('Mức Bloom không hợp lệ.', { code: 'INVALID_BLOOM' })
  const content = input.content.trim()
  if (!content) throw new ApiError('Nội dung câu hỏi không được để trống.', { code: 'INVALID_CONTENT' })
  return { courseId: input.courseId, rubricId: input.rubricId, createdById: input.createdById, content, bloomLevel, aiGenerated: input.aiGenerated }
}
function assertContext(courseId: string, question: QuestionResponseDto) { if (question.courseId !== courseId) throw new ApiError('Câu hỏi không thuộc học phần này.', { code: 'INVALID_CONTEXT', status: 404 }) }

export function createApiQuestionRepository(client: ApiClient = apiClient) {
  return {
    async search(params: QuestionSearchParams): Promise<PaginatedResult<Question>> {
      assertUuid(params.courseId, 'Mã học phần')
      const query = { courseId: params.courseId, keyword: params.keyword || undefined, status: params.status ? statusToApi[params.status] : undefined, bloomLevel: params.bloom ? bloomToApi[params.bloom] : undefined, page: Math.max(0, (params.page ?? 1) - 1), size: params.size ?? 20 }
      const page = await client.request<SpringPage<QuestionResponseDto>>('/api/questions', { query })
      return { ...normalizeSpringPage(page), items: page.content.map(mapQuestionDto) }
    },
    async get(courseId: string, questionId: string): Promise<Question | null> {
      assertUuid(courseId, 'Mã học phần'); assertUuid(questionId, 'Mã câu hỏi')
      try { const dto = await client.request<QuestionResponseDto>(`/api/questions/${encodeURIComponent(questionId)}`); assertContext(courseId, dto); return mapQuestionDto(dto) } catch (error) { if (error instanceof ApiError && error.status === 404 && error.code !== 'INVALID_CONTEXT') return null; throw error }
    },
    async create(input: QuestionWriteInput): Promise<Question> {
      const dto = await client.request<QuestionResponseDto>('/api/questions', { method: 'POST', body: mapWriteInput(input) })
      assertContext(input.courseId, dto); return mapQuestionDto(dto)
    },
    async update(questionId: string, input: QuestionWriteInput): Promise<Question> {
      assertUuid(questionId, 'Mã câu hỏi')
      const dto = await client.request<QuestionResponseDto>(`/api/questions/${encodeURIComponent(questionId)}`, { method: 'PUT', body: mapWriteInput(input) })
      assertContext(input.courseId, dto); return mapQuestionDto(dto)
    },
    async approve(courseId: string, questionId: string): Promise<Question> {
      assertUuid(courseId, 'Mã học phần'); assertUuid(questionId, 'Mã câu hỏi')
      const dto = await client.request<QuestionResponseDto>(`/api/questions/${encodeURIComponent(questionId)}/approve`, { method: 'POST' }); assertContext(courseId, dto); return mapQuestionDto(dto)
    },
    async delete(courseId: string, questionId: string): Promise<void> {
      assertUuid(courseId, 'Mã học phần'); assertUuid(questionId, 'Mã câu hỏi'); await client.request<void>(`/api/questions/${encodeURIComponent(questionId)}`, { method: 'DELETE' })
    },
  }
}
export const apiQuestionRepository = createApiQuestionRepository()
export const questionApiStatus = statusToApi
export const questionApiBloom = bloomToApi
