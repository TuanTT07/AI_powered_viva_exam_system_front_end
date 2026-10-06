import Papa from 'papaparse'
const MAX_IMPORT_FILE_SIZE = 5 * 1024 * 1024
const MAX_IMPORT_ROWS = 500
import { normalizeRosterDraft, validateRosterDraft } from './roster-validation'
import type { RosterDraft, RosterImportRow, RosterParseResult } from './roster-types'
import { rosterHeaders } from './roster-types'

const mimeTypes = new Set(['', 'text/csv', 'application/csv', 'text/plain', 'application/vnd.ms-excel'])
const blank = (row: string[]) => row.every((cell) => !cell.trim())
export function validateRosterFile(file: File): string[] { const errors: string[] = []; if (!file.name.toLocaleLowerCase().endsWith('.csv') || !mimeTypes.has(file.type.toLocaleLowerCase())) errors.push('Chỉ hỗ trợ tệp CSV (.csv).'); if (file.size > MAX_IMPORT_FILE_SIZE) errors.push('Tệp CSV không được vượt quá 5 MB.'); if (!file.size) errors.push('Tệp CSV đang trống.'); return errors }
export function parseRosterCsv(csv: string, existing: RosterDraft[] = []): RosterParseResult {
  const parsed = Papa.parse<string[]>(csv.replace(/^\uFEFF/, ''), { skipEmptyLines: false }); if (parsed.errors.length) return { preview: null, fileErrors: ['Không thể đọc cấu trúc CSV. Hãy kiểm tra dấu ngoặc kép và dấu phẩy.'] }
  const data = parsed.data.map((row) => row.map((cell) => String(cell ?? ''))); while (data.length > 1 && blank(data[data.length - 1])) data.pop(); if (!data.length || blank(data[0])) return { preview: null, fileErrors: ['Tệp CSV thiếu hàng tiêu đề.'] }
  const headers = data[0].map((header) => header.trim()); const errors: string[] = []; const duplicates = [...new Set(headers.filter((header, index) => header && headers.indexOf(header) !== index))]; const missing = rosterHeaders.filter((header) => !headers.includes(header)); if (duplicates.length) errors.push(`Tiêu đề bị trùng: ${duplicates.join(', ')}.`); if (missing.length) errors.push(`Thiếu cột bắt buộc: ${missing.join(', ')}.`)
  const records = data.slice(1); if (!records.length) errors.push('Tệp CSV chỉ có tiêu đề và chưa có dữ liệu.'); if (records.length > MAX_IMPORT_ROWS) errors.push(`Tệp CSV vượt quá giới hạn ${MAX_IMPORT_ROWS} dòng dữ liệu.`); if (errors.length) return { preview: null, fileErrors: errors }
  const seenCodes = new Set<string>(); const seenEmails = new Set<string>(); const rows = records.map((cells, index): RosterImportRow => { const raw = Object.fromEntries(headers.map((header, column) => [header, (cells[column] ?? '').trim()])); const draft = normalizeRosterDraft({ studentCode: raw.student_code ?? '', fullName: raw.full_name ?? '', email: raw.email ?? '' }); const issues = validateRosterDraft(draft, existing); const code = draft.studentCode.toLocaleLowerCase(); const email = draft.email.toLocaleLowerCase(); if (code && seenCodes.has(code)) issues.push({ column: 'studentCode', message: 'Mã sinh viên bị trùng trong tệp.' }); if (email && seenEmails.has(email)) issues.push({ column: 'email', message: 'Email bị trùng trong tệp.' }); if (code) seenCodes.add(code); if (email) seenEmails.add(email); return { id: `roster-import-${index + 2}`, rowNumber: index + 2, raw, draft: issues.length ? null : draft, issues } }); const valid = rows.filter((row) => row.draft).length; return { preview: { rows, total: rows.length, valid, invalid: rows.length - valid }, fileErrors: [] }
}
export async function parseRosterFile(file: File, existing: RosterDraft[] = []): Promise<RosterParseResult> { const errors = validateRosterFile(file); return errors.length ? { preview: null, fileErrors: errors } : parseRosterCsv(await file.text(), existing) }
export const rosterImportTemplate = '\uFEFFstudent_code,full_name,email\r\nSV000,Nguyễn Văn A,student@example.edu.vn\r\n'
export const rosterImportTemplateUrl = `data:text/csv;charset=utf-8,${encodeURIComponent(rosterImportTemplate)}`
