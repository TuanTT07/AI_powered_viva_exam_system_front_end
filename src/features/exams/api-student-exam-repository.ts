import { ApiError, apiClient, type ApiClient } from '../../services/api/client'
import { isExamUuid } from './api-exam-scheduling-repository'
export type StudentSlotStatus = 'SCHEDULED' | 'READY' | 'IN_PROGRESS' | 'COMPLETED' | 'ABSENT' | 'CANCELLED'
export type StudentExamSlot = { attemptId: string; examId: string; examTitle: string; courseCode: string; courseName: string; slotNumber: number; scheduledStartTime: string; scheduledEndTime: string; actualStartTime: string | null; actualEndTime: string | null; status: StudentSlotStatus; accessCode: string | null; examConfig?: { maxMainQuestions?: number; maxFollowUpQuestions?: number; timeLimitPerTurnSeconds?: number; antiOverlapEnabled?: boolean } }
function validate(examId: string, studentId: string) { if (!isExamUuid(examId) || !isExamUuid(studentId)) throw new ApiError('Exam và Student ID phải là UUID của backend.', { code: 'INVALID_UUID' }) }
export function createApiStudentExamRepository(client: Pick<ApiClient, 'request'> = apiClient) { return { async getMySlot(examId: string, studentId: string) { validate(examId, studentId); return client.request<StudentExamSlot>(`/api/v1/student/exams/${encodeURIComponent(examId)}/my-slot`, { query: { studentId } }) } } }
export const apiStudentExamRepository = createApiStudentExamRepository()
