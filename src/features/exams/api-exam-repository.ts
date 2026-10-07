import { ApiError, apiClient, type ApiClient } from '../../services/api/client'
import type { ExamDraft, ExamListRequest, ExamSession, ExamStatus } from './exam-types'
import type { ExamRepository } from './exam-repository'

type ExamConfigDto = { maxMainQuestions?: number; maxFollowUpQuestions?: number; timeLimitPerTurnSeconds?: number; bloomRatios?: Record<string, number>; antiOverlapEnabled?: boolean }
type ExamDto = { id: string; courseId: string; courseCode?: string; courseName?: string; title: string; startTime: string; endTime: string; status: ExamStatus; examConfig?: ExamConfigDto; createdAt?: string }
type ExamDetailDto = ExamDto & { totalCandidates?: number; candidates?: Array<{ studentId: string }> }
type PageExamDto = { content: ExamDto[]; number: number; size: number; totalElements: number; totalPages: number }
type CreateExamDto = { courseId: string; title: string; startTime: string; endTime: string; examConfig: ExamConfigDto }
type UpdateExamDto = Omit<CreateExamDto, 'courseId'>
type StatusDto = { status: ExamStatus }

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
export const isExamManagementUuid = (value: string) => uuidPattern.test(value)
function assertUuid(value: string, label: string) { if (!isExamManagementUuid(value)) throw new ApiError(`${label} phải là UUID của backend.`, { code: 'INVALID_UUID' }) }
function durationMinutes(start: string, end: string) { const minutes = Math.round((Date.parse(end) - Date.parse(start)) / 60000); return Number.isFinite(minutes) && minutes > 0 ? minutes : 15 }
function mapExam(dto: ExamDto | ExamDetailDto): ExamSession {
  return { id: dto.id, title: dto.title, subjectId: dto.courseId, subjectCode: dto.courseCode ?? '—', subjectName: dto.courseName ?? 'Học phần', scheduledAt: dto.startTime, durationMinutes: durationMinutes(dto.startTime, dto.endTime), studentCount: 'totalCandidates' in dto ? dto.totalCandidates ?? dto.candidates?.length ?? 0 : 0, mainQuestionCount: dto.examConfig?.maxMainQuestions ?? 1, maxFollowUpCount: dto.examConfig?.maxFollowUpQuestions ?? 0, status: dto.status }
}
function payload(draft: ExamDraft): CreateExamDto { const start = Date.parse(draft.scheduledAt); const end = new Date(start + draft.durationMinutes * 60000).toISOString(); assertUuid(draft.subjectId, 'Course'); return { courseId: draft.subjectId, title: draft.title, startTime: draft.scheduledAt, endTime: end, examConfig: { maxMainQuestions: draft.mainQuestionCount, maxFollowUpQuestions: draft.maxFollowUpCount, timeLimitPerTurnSeconds: Math.max(10, draft.durationMinutes * 60), antiOverlapEnabled: true } } }

export function createApiExamRepository(client: Pick<ApiClient, 'request'> = apiClient): ExamRepository {
  return {
    async list(request: ExamListRequest) {
      if (request.subject) assertUuid(request.subject, 'Course')
      const response = await client.request<PageExamDto>('/api/v1/exams', { query: { courseId: request.subject || undefined, status: request.status || undefined, page: Math.max(0, request.page - 1), size: request.pageSize } })
      return { items: response.content.map(mapExam), total: response.totalElements, page: response.number + 1, pageSize: response.size, totalPages: Math.max(1, response.totalPages) }
    },
    async get(examId) { assertUuid(examId, 'Exam'); try { return mapExam(await client.request<ExamDetailDto>(`/api/v1/exams/${encodeURIComponent(examId)}`)) } catch (error) { if (error instanceof ApiError && error.status === 404) return undefined; throw error } },
    async create(draft) { return mapExam(await client.request<ExamDto>('/api/v1/exams', { method: 'POST', body: payload(draft) })) },
    async update(examId, draft) { assertUuid(examId, 'Exam'); const body = payload(draft); const { courseId: _courseId, ...update } = body; return mapExam(await client.request<ExamDto>(`/api/v1/exams/${encodeURIComponent(examId)}`, { method: 'PUT', body: update as UpdateExamDto })) },
    async delete(examId) { assertUuid(examId, 'Exam'); await client.request<void>(`/api/v1/exams/${encodeURIComponent(examId)}`, { method: 'DELETE' }) },
    async updateStatus(examId, status) { assertUuid(examId, 'Exam'); return mapExam(await client.request<ExamDto>(`/api/v1/exams/${encodeURIComponent(examId)}/status`, { method: 'PATCH', body: { status } satisfies StatusDto })) },
    async subjects() { return [] },
    async summary() { const page = await this.list({ q: '', subject: '', status: '', page: 1, pageSize: 100 }); return page.items.reduce((counts, exam) => { counts[exam.status] += 1; return counts }, { DRAFT: 0, PUBLISHED: 0, SCHEDULED: 0, IN_PROGRESS: 0, COMPLETED: 0, CANCELLED: 0 } as Record<ExamStatus, number>) },
    async listRoster() { throw new ApiError('Backend chưa có API đọc roster giảng viên.', { code: 'CAPABILITY_UNAVAILABLE', status: 501 }) },
    async addRosterStudent() { throw new ApiError('Backend chưa có API roster giảng viên.', { code: 'CAPABILITY_UNAVAILABLE', status: 501 }) },
    async importRosterStudents() { throw new ApiError('Backend chưa có API import roster.', { code: 'CAPABILITY_UNAVAILABLE', status: 501 }) },
    async removeRosterStudent() { throw new ApiError('Backend chưa có API xóa roster.', { code: 'CAPABILITY_UNAVAILABLE', status: 501 }) },
    async getSchedule() { throw new ApiError('Dùng scheduling repository API riêng.', { code: 'USE_API_SCHEDULING' }) },
    async saveSchedule() { throw new ApiError('Dùng scheduling repository API riêng.', { code: 'USE_API_SCHEDULING' }) },
    async getQuestionConfig() { return undefined },
    async saveQuestionConfig() { throw new ApiError('Backend chưa có API cấu hình câu hỏi kỳ thi.', { code: 'CAPABILITY_UNAVAILABLE', status: 501 }) },
  }
}
export const apiExamRepository = createApiExamRepository()
