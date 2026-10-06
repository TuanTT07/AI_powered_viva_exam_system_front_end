import type { ExamStatus } from './exam-types'
export type AssignmentStrategy = 'ROSTER_ORDER' | 'UNASSIGNED'
export type ScheduleSlot = { id: string; examId: string; startAt: string; endAt: string; rosterStudentId?: string }
export type ExamSchedule = { examId: string; breakMinutes: number; strategy: AssignmentStrategy; updatedAt: string; slots: ScheduleSlot[] }
export type ScheduleDraft = Pick<ExamSchedule, 'breakMinutes' | 'strategy' | 'slots'>
export type ScheduleIssue = { code: string; message: string; slotId?: string }
export const editableScheduleStatuses: ExamStatus[] = ['DRAFT', 'SCHEDULED']
