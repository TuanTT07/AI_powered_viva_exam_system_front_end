import { describe, expect, it } from 'vitest'
import type { Rubric } from '../rubrics/rubric-types'
import { MAX_IMPORT_ROWS, parseQuestionCsv, questionImportTemplate, validateQuestionImportFile } from './question-import-parser'

const rubrics: Rubric[] = [{ id: 'rubric-java', subjectId: 'java', name: 'Rubric Java Core', criteria: [] }]
const context = { topics: ['OOP & Đa hình', 'Collections'], rubrics }
const header = 'question_text,topic,bloom_level,suggested_answer,rubric_name'

describe('question import parser', () => {
  it('parses UTF-8, quoted commas, and maps all supported Bloom values', () => {
    const csv = `${header}\n"Câu hỏi, có dấu phẩy",OOP & Đa hình,remember,,\nCâu 2,Collections,UNDERSTAND,,\nCâu 3,Collections,APPLY,,\nCâu 4,Collections,ANALYZE,,`
    const result = parseQuestionCsv(csv, context)
    expect(result.preview?.rows.map((row) => row.draft?.bloom)).toEqual(['NHỚ', 'HIỂU', 'VẬN DỤNG', 'PHÂN TÍCH'])
    expect(result.preview?.rows[0].draft?.content).toBe('Câu hỏi, có dấu phẩy')
  })

  it('supports UTF-8 BOM and trims values', () => {
    const result = parseQuestionCsv(`\uFEFF${header}\n  Câu hỏi tiếng Việt  ,  Collections  , analyze ,  Đáp án  ,`, context)
    expect(result.preview?.rows[0].draft).toMatchObject({ content: 'Câu hỏi tiếng Việt', topic: 'Collections', bloom: 'PHÂN TÍCH', suggestedAnswer: 'Đáp án' })
  })

  it('reports missing and duplicate headers', () => {
    expect(parseQuestionCsv('question_text,topic\nCâu hỏi,Collections', context).fileErrors[0]).toContain('bloom_level')
    expect(parseQuestionCsv('question_text,topic,bloom_level,topic\nCâu hỏi,Collections,APPLY,Collections', context).fileErrors[0]).toContain('topic')
  })

  it('rejects header-only files and files over the row limit', () => {
    expect(parseQuestionCsv(`${header}\n`, context).fileErrors[0]).toContain('chỉ có tiêu đề')
    const rows = Array.from({ length: MAX_IMPORT_ROWS + 1 }, (_, index) => `Câu ${index},Collections,APPLY,,`).join('\n')
    expect(parseQuestionCsv(`${header}\n${rows}`, context).fileErrors[0]).toContain('500')
  })

  it('marks invalid Bloom values and unknown topics as row errors', () => {
    const result = parseQuestionCsv(`${header}\nCâu hỏi,Chủ đề lạ,EVALUATE,,`, context)
    expect(result.preview).toMatchObject({ valid: 0, invalid: 1 })
    expect(result.preview?.rows[0].issues.map((issue) => issue.column)).toEqual(['topic', 'bloom_level'])
  })

  it('resolves a rubric by case-insensitive exact name', () => {
    const result = parseQuestionCsv(`${header}\nCâu hỏi,Collections,APPLY,, rubric java core `, context)
    expect(result.preview?.rows[0].draft?.rubricId).toBe('rubric-java')
  })

  it('rejects ambiguous rubric names', () => {
    const duplicate = { ...rubrics[0], id: 'rubric-java-2' }
    const result = parseQuestionCsv(`${header}\nCâu hỏi,Collections,APPLY,,Rubric Java Core`, { ...context, rubrics: [...rubrics, duplicate] })
    expect(result.preview?.rows[0].issues[0].message).toContain('không duy nhất')
  })

  it('invalidates later duplicate questions and supports a partially valid batch', () => {
    const csv = `${header}\nCâu hỏi,Collections,APPLY,,\n câu hỏi ,Collections,APPLY,,\nCâu hợp lệ khác,Collections,ANALYZE,,`
    const result = parseQuestionCsv(csv, context)
    expect(result.preview).toMatchObject({ total: 3, valid: 2, invalid: 1 })
    expect(result.preview?.rows[1].issues[0].message).toContain('bị trùng')
  })

  it('reports a zero-valid-row batch', () => {
    const result = parseQuestionCsv(`${header}\n,Collections,UNKNOWN,,`, context)
    expect(result.preview).toMatchObject({ total: 1, valid: 0, invalid: 1 })
  })

  it('produces the approved BOM template schema', () => {
    expect(questionImportTemplate.startsWith('\uFEFF')).toBe(true)
    expect(questionImportTemplate).toContain(header)
  })

  it('rejects unsupported files and files larger than 5 MB', () => {
    expect(validateQuestionImportFile(new File(['x'], 'questions.xlsx', { type: 'application/vnd.ms-excel' }))).toContain('Chỉ hỗ trợ tệp CSV (.csv).')
    const oversized = new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'questions.csv', { type: 'text/csv' })
    expect(validateQuestionImportFile(oversized)).toContain('Tệp CSV không được vượt quá 5 MB.')
  })
})
