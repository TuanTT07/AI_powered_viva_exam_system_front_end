import type { ExamDraft, ExamSession } from './exam-types'

export type ExamFormValues = { title: string; subjectId: string; startDate: string; startTime: string; durationMinutes: string; mainQuestionCount: string; maxFollowUpCount: string }
export type ExamField = keyof ExamFormValues
export type ExamFieldErrors = Partial<Record<ExamField, string>>
export type ExamSubject = { id: string; code: string; name: string }

export const examDefaults: ExamFormValues = { title: '', subjectId: '', startDate: '', startTime: '', durationMinutes: '15', mainQuestionCount: '3', maxFollowUpCount: '2' }

export function examToForm(exam: ExamSession): ExamFormValues {
  const date = new Date(exam.scheduledAt)
  const pad = (value: number) => String(value).padStart(2, '0')
  return { title: exam.title, subjectId: exam.subjectId, startDate: `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`, startTime: `${pad(date.getHours())}:${pad(date.getMinutes())}`, durationMinutes: String(exam.durationMinutes), mainQuestionCount: String(exam.mainQuestionCount), maxFollowUpCount: String(exam.maxFollowUpCount) }
}

export function toExamDraft(values: ExamFormValues): ExamDraft {
  const scheduledAt = new Date(`${values.startDate}T${values.startTime}`).toISOString()
  return { title: values.title.trim(), subjectId: values.subjectId, scheduledAt, durationMinutes: Number(values.durationMinutes), mainQuestionCount: Number(values.mainQuestionCount), maxFollowUpCount: Number(values.maxFollowUpCount) }
}

export function validateExamForm(values: ExamFormValues, subjects: ExamSubject[], options: { mode: 'create' | 'edit'; initialScheduledAt?: string; now?: Date } = { mode: 'create' }): ExamFieldErrors {
  const errors: ExamFieldErrors = {}
  const title = values.title.trim()
  if (!title) errors.title = 'Nhập tên kỳ thi.'
  else if (title.length < 3) errors.title = 'Tên kỳ thi phải có ít nhất 3 ký tự.'
  else if (title.length > 120) errors.title = 'Tên kỳ thi không được vượt quá 120 ký tự.'
  if (!values.subjectId || !subjects.some((subject) => subject.id === values.subjectId)) errors.subjectId = 'Chọn học phần được phân công.'
  const dateTime = `${values.startDate}T${values.startTime}`
  const parsedDate = new Date(dateTime)
  if (!isValidLocalDateTime(values.startDate, values.startTime, parsedDate)) errors.startDate = 'Nhập ngày và giờ bắt đầu hợp lệ.'
  else if (options.mode === 'create' || !options.initialScheduledAt || new Date(options.initialScheduledAt).getTime() !== parsedDate.getTime()) {
    if (parsedDate.getTime() < (options.now ?? new Date()).getTime()) errors.startDate = 'Thời gian bắt đầu không được ở quá khứ.'
  }
  validateInteger(values.durationMinutes, 5, 120, 'Thời lượng', 'durationMinutes', errors)
  validateInteger(values.mainQuestionCount, 1, 20, 'Số câu hỏi chính', 'mainQuestionCount', errors)
  validateInteger(values.maxFollowUpCount, 0, 10, 'Số câu hỏi đào sâu', 'maxFollowUpCount', errors)
  return errors
}

function isValidLocalDateTime(date: string, time: string, parsed: Date) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time) || Number.isNaN(parsed.getTime())) return false
  const [year, month, day] = date.split('-').map(Number)
  const [hour, minute] = time.split(':').map(Number)
  return parsed.getFullYear() === year && parsed.getMonth() + 1 === month && parsed.getDate() === day && parsed.getHours() === hour && parsed.getMinutes() === minute
}

function validateInteger(value: string, min: number, max: number, label: string, field: ExamField, errors: ExamFieldErrors) {
  if (!value || !/^\d+$/.test(value)) errors[field] = `${label} phải là số nguyên.`
  else if (Number(value) < min || Number(value) > max) errors[field] = `${label} phải từ ${min} đến ${max}.`
}

export function hasExamErrors(errors: ExamFieldErrors) { return Object.keys(errors).length > 0 }
