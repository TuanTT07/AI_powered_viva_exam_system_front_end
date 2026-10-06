import { describe, expect, it } from 'vitest'
import { parseRosterCsv } from './roster-import-parser'
import { validateRosterDraft } from './roster-validation'

describe('exam roster validation and import', () => {
  it('validates fields and case-insensitive duplicates', () => { expect(validateRosterDraft({ studentCode: 'A', fullName: 'A', email: 'bad' })).toHaveLength(3); expect(validateRosterDraft({ studentCode: 'SV01', fullName: 'Nguyễn An', email: 'A@EXAMPLE.COM' }, [{ studentCode: 'sv01', fullName: 'Khác', email: 'other@example.com' }]).some((issue) => issue.column === 'studentCode')).toBe(true) })
  it('handles BOM, quoted CSV and mixed rows with first duplicate kept', () => { const result = parseRosterCsv('\uFEFFstudent_code,full_name,email\nSV001,"Nguyễn, An",a@example.com\nSV001,Người khác,b@example.com\nSV002,Bình,bad'); expect(result.preview?.total).toBe(3); expect(result.preview?.valid).toBe(1); expect(result.preview?.rows[1].issues[0].message).toContain('trùng'); expect(result.preview?.rows[2].issues[0].column).toBe('email') })
  it('rejects missing, duplicate headers and header-only files', () => { expect(parseRosterCsv('student_code,email\nSV001,A,a@example.com').fileErrors[0]).toContain('Thiếu cột'); expect(parseRosterCsv('student_code,student_code,full_name,email\nSV001,SV001,A,a@example.com').fileErrors[0]).toContain('trùng'); expect(parseRosterCsv('student_code,full_name,email\n').fileErrors[0]).toContain('chưa có dữ liệu') })
})
