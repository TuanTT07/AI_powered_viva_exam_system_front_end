import type { CourseMaterial } from '../learning-materials/material-types'
import type { Rubric } from '../rubrics/rubric-types'
import type { GenerationLanguage, GenerationRequest, GeneratedQuestion } from './generation-types'

export const validateGenerationRequest = (request: GenerationRequest, materials: CourseMaterial[], topics: string[], rubrics: Rubric[]) => {
  const errors: Partial<Record<'materials' | 'topic' | 'bloom' | 'count' | 'language' | 'rubric', string>> = {}
  const ready = new Set(materials.filter((item) => item.status === 'READY' && item.subjectId === request.subjectId).map((item) => item.id))
  if (!request.materialIds.length) errors.materials = 'Chọn ít nhất một tài liệu đã sẵn sàng.'
  else if (request.materialIds.length > 5 || request.materialIds.some((id) => !ready.has(id))) errors.materials = 'Chỉ được chọn tối đa 5 tài liệu Sẵn sàng của học phần hiện tại.'
  if (!request.topic || !topics.includes(request.topic)) errors.topic = 'Chọn chủ đề thuộc học phần hiện tại.'
  if (!['NHỚ', 'HIỂU', 'VẬN DỤNG', 'PHÂN TÍCH'].includes(request.bloom)) errors.bloom = 'Chọn mức Bloom hợp lệ.'
  if (!Number.isInteger(request.count) || request.count < 1 || request.count > 10) errors.count = 'Số câu phải là số nguyên từ 1 đến 10.'
  if (!(['vi', 'en'] as GenerationLanguage[]).includes(request.language)) errors.language = 'Chọn ngôn ngữ được hỗ trợ.'
  if (request.rubricId && !rubrics.some((rubric) => rubric.id === request.rubricId && rubric.subjectId === request.subjectId)) errors.rubric = 'Rubric không thuộc học phần hiện tại.'
  return errors
}

export function validateGeneratedQuestions(questions: GeneratedQuestion[]) {
  const seen = new Set<string>()
  return questions.map((question) => {
    const issues: string[] = []
    const key = question.content.trim().toLocaleLowerCase()
    if (!key) issues.push('Nội dung câu hỏi là bắt buộc.')
    if (question.content.length > 500) issues.push('Nội dung câu hỏi không được vượt quá 500 ký tự.')
    if (question.suggestedAnswer && question.suggestedAnswer.length > 2000) issues.push('Đáp án gợi ý không được vượt quá 2.000 ký tự.')
    if (seen.has(key)) issues.push('Câu hỏi trùng với một câu khác trong batch.')
    if (key) seen.add(key)
    return { ...question, issues }
  })
}
