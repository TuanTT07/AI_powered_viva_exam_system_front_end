import type { ExamStatus } from './exam-types'
export type QuestionConfigMode = 'MANUAL' | 'RANDOM_POOL'
export type ExamQuestionConfig = { examId: string; mode: QuestionConfigMode; questionIds: string[]; updatedAt: string }
export type QuestionConfigDraft = Pick<ExamQuestionConfig, 'mode' | 'questionIds'>
export type QuestionConfigIssue = { code: string; message: string }
export const editableQuestionConfigStatuses: ExamStatus[] = ['DRAFT', 'SCHEDULED']
