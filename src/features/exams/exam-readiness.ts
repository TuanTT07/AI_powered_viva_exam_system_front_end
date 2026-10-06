import type { Question } from '../question-bank/question-types'
import type { ExamSession } from './exam-types'
import type { RosterStudent } from './roster-types'
import { validateSchedule } from './schedule-validation'
import type { ExamSchedule } from './schedule-types'
import type { ExamQuestionConfig } from './question-config-types'

export type ReadinessStatus = 'COMPLETE' | 'INCOMPLETE' | 'WARNING' | 'UNAVAILABLE'
export type ReadinessSection = { key: 'basic' | 'roster' | 'schedule' | 'questions'; title: string; status: ReadinessStatus; summary: string; issues: string[] }
export type ExamReadiness = { sections: ReadinessSection[]; ready: boolean; completedCount: number; blockingIssues: string[]; warnings: string[] }

const editableStatuses = new Set(['DRAFT', 'SCHEDULED'])

export function evaluateBasicInformation(exam: ExamSession, now = new Date()): ReadinessSection {
  const issues: string[] = []
  if (!exam.title.trim()) issues.push('Tên kỳ thi chưa được thiết lập.')
  if (!exam.subjectId || !exam.subjectName) issues.push('Học phần chưa được thiết lập.')
  if (!Number.isFinite(new Date(exam.scheduledAt).getTime())) issues.push('Thời gian bắt đầu không hợp lệ.')
  if (!Number.isInteger(exam.durationMinutes) || exam.durationMinutes < 5 || exam.durationMinutes > 120) issues.push('Thời lượng phải từ 5 đến 120 phút.')
  if (!Number.isInteger(exam.mainQuestionCount) || exam.mainQuestionCount < 1 || exam.mainQuestionCount > 20) issues.push('Số câu hỏi chính phải từ 1 đến 20.')
  if (!Number.isInteger(exam.maxFollowUpCount) || exam.maxFollowUpCount < 0 || exam.maxFollowUpCount > 10) issues.push('Số câu hỏi đào sâu phải từ 0 đến 10.')
  if (editableStatuses.has(exam.status) && new Date(exam.scheduledAt).getTime() < now.getTime()) issues.push('Thời gian bắt đầu đã ở trong quá khứ.')
  return { key: 'basic', title: 'Thông tin cơ bản', status: issues.length ? 'INCOMPLETE' : 'COMPLETE', summary: `${exam.subjectCode} · ${exam.durationMinutes} phút / sinh viên`, issues }
}

export function evaluateRoster(roster: RosterStudent[] | undefined, failed = false): ReadinessSection {
  if (failed || !roster) return { key: 'roster', title: 'Sinh viên dự thi', status: 'UNAVAILABLE', summary: 'Chưa thể tải danh sách sinh viên.', issues: ['Không thể xác nhận roster. Vui lòng thử lại.'] }
  const issues = roster.length ? [] : ['Chưa có sinh viên trong roster.']
  return { key: 'roster', title: 'Sinh viên dự thi', status: issues.length ? 'INCOMPLETE' : 'COMPLETE', summary: `${roster.length} sinh viên`, issues }
}

export function evaluateSchedule(exam: ExamSession, roster: RosterStudent[] | undefined, schedule: ExamSchedule | null | undefined, failed = false): ReadinessSection {
  if (failed || !roster || schedule === undefined) return { key: 'schedule', title: 'Lịch vấn đáp', status: 'UNAVAILABLE', summary: 'Chưa thể tải lịch đã lưu.', issues: ['Không thể xác nhận lịch. Vui lòng thử lại.'] }
  if (!schedule) return { key: 'schedule', title: 'Lịch vấn đáp', status: 'INCOMPLETE', summary: 'Chưa có lịch được lưu.', issues: ['Tạo và lưu time slot cho kỳ thi.'] }
  const issues = validateSchedule(exam, roster, { breakMinutes: schedule.breakMinutes, strategy: schedule.strategy, slots: schedule.slots }).map((issue) => issue.message)
  const rosterIds = new Set(roster.map((student) => student.id))
  const assigned = schedule.slots.flatMap((slot) => slot.rosterStudentId ? [slot.rosterStudentId] : [])
  if (assigned.length !== roster.length || roster.some((student) => !assigned.includes(student.id))) issues.push('Vẫn còn sinh viên chưa được gán vào slot.')
  if (new Set(assigned).size !== assigned.length) issues.push('Sinh viên đang bị gán trùng.')
  const uniqueIssues = [...new Set(issues)]
  const assignedCount = assigned.filter((id) => rosterIds.has(id)).length
  return { key: 'schedule', title: 'Lịch vấn đáp', status: uniqueIssues.length ? 'INCOMPLETE' : 'COMPLETE', summary: `${schedule.slots.length} slot · ${assignedCount}/${roster.length} đã gán`, issues: uniqueIssues }
}

export function evaluateQuestionConfig(exam: ExamSession, config: ExamQuestionConfig | null | undefined, questions: Question[] | undefined, failed = false): ReadinessSection {
  if (failed || !questions || config === undefined) return { key: 'questions', title: 'Cấu hình câu hỏi', status: 'UNAVAILABLE', summary: 'Chưa thể tải cấu hình câu hỏi.', issues: ['Không thể xác nhận cấu hình câu hỏi. Vui lòng thử lại.'] }
  if (!config) return { key: 'questions', title: 'Cấu hình câu hỏi', status: 'INCOMPLETE', summary: `Chưa có cấu hình · cần ${exam.mainQuestionCount} câu`, issues: ['Chọn và lưu bộ câu hỏi cho kỳ thi.'] }
  const byId = new Map(questions.map((question) => [question.id, question]))
  const issues: string[] = []
  if (new Set(config.questionIds).size !== config.questionIds.length) issues.push('Cấu hình có câu hỏi bị trùng.')
  const missing = config.questionIds.filter((id) => !byId.has(id))
  if (missing.length) issues.push(`${missing.length} câu hỏi không còn tồn tại.`)
  const ineligible = config.questionIds.filter((id) => { const question = byId.get(id); return !question || question.subjectId !== exam.subjectId || question.status !== 'ĐÃ DUYỆT' })
  if (ineligible.length) issues.push(`${ineligible.length} câu hỏi không còn đủ điều kiện.`)
  if (config.mode === 'MANUAL' && config.questionIds.length !== exam.mainQuestionCount) issues.push(`MANUAL cần đúng ${exam.mainQuestionCount} câu hỏi.`)
  if (config.mode === 'RANDOM_POOL' && config.questionIds.length < exam.mainQuestionCount) issues.push(`RANDOM_POOL cần ít nhất ${exam.mainQuestionCount} câu hỏi.`)
  const label = config.mode === 'MANUAL' ? 'MANUAL' : 'RANDOM_POOL'
  return { key: 'questions', title: 'Cấu hình câu hỏi', status: issues.length ? (ineligible.length ? 'WARNING' : 'INCOMPLETE') : 'COMPLETE', summary: `${label} · ${config.questionIds.length}/${exam.mainQuestionCount} câu`, issues: [...new Set(issues)] }
}

export function evaluateExamReadiness(sections: ReadinessSection[]): ExamReadiness {
  const completedCount = sections.filter((section) => section.status === 'COMPLETE').length
  const ready = sections.length === 4 && completedCount === 4
  return { sections, ready, completedCount, blockingIssues: sections.flatMap((section) => section.status === 'INCOMPLETE' || section.status === 'UNAVAILABLE' ? section.issues : []), warnings: sections.flatMap((section) => section.status === 'WARNING' ? section.issues : []) }
}
