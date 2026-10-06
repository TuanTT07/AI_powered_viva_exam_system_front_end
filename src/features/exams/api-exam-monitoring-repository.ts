import { ApiError, apiClient, type ApiClient } from '../../services/api/client'
import { isExamUuid } from './api-exam-scheduling-repository'

export type MonitoringStatus = 'SCHEDULED' | 'READY' | 'IN_PROGRESS' | 'COMPLETED' | 'ABSENT' | 'CANCELLED'
export type MonitoringCandidate = { attemptId: string; examId: string; studentId: string; studentCode: string; studentName: string; studentEmail: string; slotNumber: number; scheduledStartTime: string; scheduledEndTime: string; actualStartTime: string | null; actualEndTime: string | null; status: MonitoringStatus; accessCode: string | null }
export type MonitoringDashboard = { examId: string; examTitle: string; totalCandidates: number; scheduledCount: number; readyCount: number; inProgressCount: number; completedCount: number; absentCount: number; cancelledCount: number; candidateStatuses: MonitoringCandidate[] }
function validateIds(examId: string, attemptId?: string) { if (!isExamUuid(examId)) throw new ApiError('Mã kỳ thi phải là UUID của backend.', { code: 'INVALID_UUID' }); if (attemptId && !isExamUuid(attemptId)) throw new ApiError('Mã lượt thi phải là UUID của backend.', { code: 'INVALID_UUID' }) }
export function createApiExamMonitoringRepository(client: Pick<ApiClient, 'request'> = apiClient) {
  return { get(examId: string) { validateIds(examId); return client.request<MonitoringDashboard>(`/api/v1/exams/${encodeURIComponent(examId)}/monitor`) }, reset(examId: string, attemptId: string) { validateIds(examId, attemptId); return client.request<MonitoringCandidate>(`/api/v1/exams/${encodeURIComponent(examId)}/attempts/${encodeURIComponent(attemptId)}/reset`, { method: 'POST' }) }, absent(examId: string, attemptId: string) { validateIds(examId, attemptId); return client.request<MonitoringCandidate>(`/api/v1/exams/${encodeURIComponent(examId)}/attempts/${encodeURIComponent(attemptId)}/absent`, { method: 'POST' }) } }
}
export const apiExamMonitoringRepository = createApiExamMonitoringRepository()
