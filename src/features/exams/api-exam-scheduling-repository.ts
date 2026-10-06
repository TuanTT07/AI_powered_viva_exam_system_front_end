import { ApiError, apiClient, type ApiClient } from '../../services/api/client'

export type CandidateScheduleDto = {
  attemptId: string
  examId: string
  studentId: string
  studentCode: string
  studentName: string
  studentEmail: string
  slotNumber: number
  scheduledStartTime: string
  scheduledEndTime: string
  actualStartTime: string | null
  actualEndTime: string | null
  status: 'SCHEDULED' | 'READY' | 'IN_PROGRESS' | 'COMPLETED' | 'ABSENT' | 'CANCELLED'
  accessCode: string | null
}
export type AssignCandidatesRequestDto = { studentIds: string[] }
export type AutoScheduleRequestDto = { studentIds: string[]; slotDurationMinutes: number; breakDurationMinutes?: number }
export type RescheduleCandidateRequestDto = { studentId: string; newScheduledStartTime: string; newScheduledEndTime: string }

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
export const isExamUuid = (value: string) => uuid.test(value)
function validateExamId(examId: string) { if (!isExamUuid(examId)) throw new ApiError('Mã kỳ thi phải là UUID của backend.', { code: 'INVALID_UUID' }) }
function validateStudentIds(studentIds: string[]) { if (!studentIds.length || studentIds.some((id) => !uuid.test(id))) throw new ApiError('Danh sách sinh viên phải chứa UUID hợp lệ.', { code: 'INVALID_UUID' }) }

export function createApiExamSchedulingRepository(client: ApiClient = apiClient) {
  return {
    async assignCandidates(examId: string, studentIds: string[]) {
      validateExamId(examId); validateStudentIds(studentIds)
      return client.request<CandidateScheduleDto[]>(`/api/v1/exams/${encodeURIComponent(examId)}/candidates`, { method: 'POST', body: { studentIds } satisfies AssignCandidatesRequestDto })
    },
    async getSchedule(examId: string) {
      validateExamId(examId)
      return client.request<CandidateScheduleDto[]>(`/api/v1/exams/${encodeURIComponent(examId)}/schedule`)
    },
    async autoSchedule(examId: string, request: AutoScheduleRequestDto) {
      validateExamId(examId); validateStudentIds(request.studentIds)
      if (!Number.isInteger(request.slotDurationMinutes) || request.slotDurationMinutes < 5) throw new ApiError('Thời lượng mỗi slot tối thiểu là 5 phút.', { code: 'VALIDATION_ERROR' })
      if (request.breakDurationMinutes !== undefined && (!Number.isInteger(request.breakDurationMinutes) || request.breakDurationMinutes < 0)) throw new ApiError('Thời gian nghỉ không hợp lệ.', { code: 'VALIDATION_ERROR' })
      return client.request<CandidateScheduleDto[]>(`/api/v1/exams/${encodeURIComponent(examId)}/schedule/auto`, { method: 'POST', body: request })
    },
    async reschedule(examId: string, request: RescheduleCandidateRequestDto) {
      validateExamId(examId); validateStudentIds([request.studentId])
      const start = Date.parse(request.newScheduledStartTime); const end = Date.parse(request.newScheduledEndTime)
      if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) throw new ApiError('Khung giờ mới không hợp lệ.', { code: 'VALIDATION_ERROR' })
      return client.request<CandidateScheduleDto>(`/api/v1/exams/${encodeURIComponent(examId)}/schedule/reschedule`, { method: 'PUT', body: request })
    },
  }
}
export const apiExamSchedulingRepository = createApiExamSchedulingRepository()
