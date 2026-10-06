export const bloomLevels = ['NHỚ', 'HIỂU', 'VẬN DỤNG', 'PHÂN TÍCH'] as const
export type BloomLevel = typeof bloomLevels[number]
export type QuestionStatus = 'ĐÃ DUYỆT' | 'CHỜ DUYỆT' | 'BẢN NHÁP'
export type QuestionSource = 'AI đề xuất' | 'Thủ công' | 'Import'

export type Question = {
  id: string
  subjectId: string
  content: string
  topic: string
  bloom: BloomLevel
  suggestedAnswer?: string
  rubricId?: string
  rubric?: string
  source: QuestionSource
  status: QuestionStatus
}

export type ImportedQuestionDraft = Pick<Question, 'content' | 'topic' | 'bloom' | 'suggestedAnswer' | 'rubricId' | 'rubric'>
