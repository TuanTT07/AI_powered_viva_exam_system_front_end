import { ApiError, apiClient, type ApiClient } from '../../services/api/client'
import { isExamUuid } from './api-exam-scheduling-repository'
export const studentSlotStatuses = ['SCHEDULED', 'READY', 'IN_PROGRESS', 'COMPLETED', 'ABSENT', 'CANCELLED'] as const
export type StudentSlotStatus = typeof studentSlotStatuses[number]
export type StudentExamSummary = {
  examId: string
  attemptId: string
  examTitle: string
  courseCode: string
  courseName: string
  slotNumber: number | null
  scheduledStartTime: string | null
  scheduledEndTime: string | null
  status: StudentSlotStatus
}
export type StudentExamListRequest = { page?: number; size?: number; status?: StudentSlotStatus }
export type StudentExamPage = { content: StudentExamSummary[]; page: number; size: number; totalElements: number; totalPages: number }
export type StudentExamSlot = StudentExamSummary & { actualStartTime: string | null; actualEndTime: string | null; accessCode: string | null; examConfig?: { maxMainQuestions?: number; maxFollowUpQuestions?: number; timeLimitPerTurnSeconds?: number; antiOverlapEnabled?: boolean } }
export function createApiStudentExamRepository(client: Pick<ApiClient, 'request'> = apiClient) {
  return {
    async list({ page = 0, size = 20, status }: StudentExamListRequest = {}, signal?: AbortSignal) {
      if (!Number.isInteger(page) || page < 0 || !Number.isInteger(size) || size < 1 || size > 100
          || (status !== undefined && !studentSlotStatuses.includes(status))) {
        throw new ApiError('Bộ lọc hoặc phân trang lịch thi không hợp lệ.', { code: 'INVALID_QUERY' })
      }
      return client.request<StudentExamPage>('/api/v1/student/exams', { query: { page, size, ...(status ? { status } : {}) }, ...(signal ? { signal } : {}) })
    },
    async getMySlot(examId: string, signal?: AbortSignal) {
      if (!isExamUuid(examId)) throw new ApiError('Mã kỳ thi phải là UUID của backend.', { code: 'INVALID_UUID' })
      return client.request<StudentExamSlot>(`/api/v1/student/exams/${encodeURIComponent(examId)}/my-slot`, signal ? { signal } : undefined)
    },
  }
}
export const apiStudentExamRepository = createApiStudentExamRepository()
