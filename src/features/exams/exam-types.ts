export const examStatuses = ['DRAFT', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] as const
export type ExamStatus = (typeof examStatuses)[number]

export type ExamSession = {
  id: string
  title: string
  subjectId: string
  subjectCode: string
  subjectName: string
  scheduledAt: string
  durationMinutes: number
  studentCount: number
  mainQuestionCount: number
  maxFollowUpCount: number
  status: ExamStatus
}

export type ExamListRequest = { q: string; subject: string; status: ExamStatus | ''; page: number; pageSize: number }
export type ExamListResponse = { items: ExamSession[]; total: number; page: number; pageSize: number; totalPages: number }
export type ExamDraft = Pick<ExamSession, 'title' | 'subjectId' | 'scheduledAt' | 'durationMinutes' | 'mainQuestionCount' | 'maxFollowUpCount'>

export const examStatusMeta: Record<ExamStatus, { label: string; tone: 'neutral' | 'info' | 'success' | 'warning' | 'danger' }> = {
  DRAFT: { label: 'NHÁP', tone: 'neutral' },
  SCHEDULED: { label: 'ĐÃ LÊN LỊCH', tone: 'info' },
  IN_PROGRESS: { label: 'ĐANG DIỄN RA', tone: 'warning' },
  COMPLETED: { label: 'ĐÃ KẾT THÚC', tone: 'success' },
  CANCELLED: { label: 'ĐÃ HỦY', tone: 'danger' },
}
