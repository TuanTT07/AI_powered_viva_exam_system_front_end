import type { ExamStatus } from './exam-types'

export type RosterStudent = { id: string; examId: string; studentCode: string; fullName: string; email: string; addedAt?: string }
export type RosterDraft = Pick<RosterStudent, 'studentCode' | 'fullName' | 'email'>
export type RosterIssue = { column: keyof RosterDraft | 'row'; message: string }
export type RosterImportRow = { id: string; rowNumber: number; raw: Record<string, string>; draft: RosterDraft | null; issues: RosterIssue[] }
export type RosterImportPreview = { rows: RosterImportRow[]; total: number; valid: number; invalid: number }
export type RosterParseResult = { preview: RosterImportPreview | null; fileErrors: string[] }
export const rosterEditableStatuses: ExamStatus[] = ['DRAFT', 'SCHEDULED']
export const rosterHeaders = ['student_code', 'full_name', 'email'] as const
