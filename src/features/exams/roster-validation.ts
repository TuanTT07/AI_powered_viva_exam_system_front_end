import type { RosterDraft, RosterIssue } from './roster-types'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export function normalizeRosterDraft(draft: RosterDraft): RosterDraft { return { studentCode: draft.studentCode.trim(), fullName: draft.fullName.trim(), email: draft.email.trim().toLocaleLowerCase() } }
export function validateRosterDraft(draft: RosterDraft, existing: RosterDraft[] = []): RosterIssue[] {
  const value = normalizeRosterDraft(draft); const issues: RosterIssue[] = []
  if (!value.studentCode) issues.push({ column: 'studentCode', message: 'Mã sinh viên là bắt buộc.' })
  else if (value.studentCode.length < 3 || value.studentCode.length > 30 || !/^[\p{L}\d_-]+$/u.test(value.studentCode)) issues.push({ column: 'studentCode', message: 'Mã sinh viên dài 3–30 ký tự, chỉ gồm chữ, số, - hoặc _.' })
  if (!value.fullName || value.fullName.length < 2 || value.fullName.length > 100) issues.push({ column: 'fullName', message: 'Họ tên dài 2–100 ký tự và là bắt buộc.' })
  if (!value.email || value.email.length > 254 || !emailPattern.test(value.email)) issues.push({ column: 'email', message: 'Email không hợp lệ.' })
  if (existing.some((item) => item.studentCode.trim().toLocaleLowerCase() === value.studentCode.toLocaleLowerCase())) issues.push({ column: 'studentCode', message: 'Mã sinh viên đã tồn tại trong kỳ thi.' })
  if (existing.some((item) => item.email.trim().toLocaleLowerCase() === value.email)) issues.push({ column: 'email', message: 'Email đã tồn tại trong kỳ thi.' })
  return issues
}
