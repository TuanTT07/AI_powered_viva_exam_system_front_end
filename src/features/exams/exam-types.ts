export const examStatuses = ['DRAFT', 'PUBLISHED', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] as const
export type ExamStatus = (typeof examStatuses)[number]

export type ExamConfig = {
  maxMainQuestions: number
  maxFollowUpQuestions: number
  timeLimitPerTurnSeconds: number
  bloomRatios?: Record<string, number>
  antiOverlapEnabled: boolean
}

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
  timeLimitPerTurnSeconds?: number
  antiOverlapEnabled?: boolean
  bloomRatios?: Record<string, number>
}

export type ExamListRequest = { q: string; subject: string; status: ExamStatus | ''; page: number; pageSize: number }
export type ExamListResponse = { items: ExamSession[]; total: number; page: number; pageSize: number; totalPages: number }
export type ExamDraft = Pick<ExamSession, 'title' | 'subjectId' | 'scheduledAt' | 'durationMinutes' | 'mainQuestionCount' | 'maxFollowUpCount'> & {
  timeLimitPerTurnSeconds?: number
  antiOverlapEnabled?: boolean
  bloomRatios?: Record<string, number>
}

export const examStatusMeta: Record<ExamStatus, { label: string; tone: 'neutral' | 'info' | 'success' | 'warning' | 'danger' }> = {
  DRAFT: { label: 'NHÁP', tone: 'neutral' },
  PUBLISHED: { label: 'ĐÃ CÔNG BỐ', tone: 'info' },
  SCHEDULED: { label: 'ĐÃ LÊN LỊCH', tone: 'info' },
  IN_PROGRESS: { label: 'ĐANG DIỄN RA', tone: 'warning' },
  COMPLETED: { label: 'ĐÃ KẾT THÚC', tone: 'success' },
  CANCELLED: { label: 'ĐÃ HỦY', tone: 'danger' },
}

// Action names describe the operation; status badges retain the resulting state.
export const examStatusActionLabels: Record<ExamStatus, string> = {
  DRAFT: 'Chuyển về nháp',
  PUBLISHED: 'Công bố',
  SCHEDULED: 'Lên lịch',
  IN_PROGRESS: 'Bắt đầu kỳ thi',
  COMPLETED: 'Kết thúc kỳ thi',
  CANCELLED: 'Hủy kỳ thi',
}
