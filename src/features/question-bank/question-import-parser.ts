import Papa from 'papaparse'
import type { Rubric } from '../rubrics/rubric-types'
import type { BloomLevel, ImportedQuestionDraft } from './question-types'

export const QUESTION_IMPORT_HEADERS = ['question_text', 'topic', 'bloom_level', 'suggested_answer', 'rubric_name'] as const
const REQUIRED_HEADERS = ['question_text', 'topic', 'bloom_level'] as const
export const MAX_IMPORT_FILE_SIZE = 5 * 1024 * 1024
export const MAX_IMPORT_ROWS = 500
const CSV_MIME_TYPES = new Set(['', 'text/csv', 'application/csv', 'text/plain', 'application/vnd.ms-excel'])
const bloomMap: Record<string, BloomLevel> = { REMEMBER: 'NHỚ', UNDERSTAND: 'HIỂU', APPLY: 'VẬN DỤNG', ANALYZE: 'PHÂN TÍCH' }

export type ImportIssue = { column: string; message: string }
export type ParsedImportRow = {
  id: string
  rowNumber: number
  raw: Record<string, string>
  draft: ImportedQuestionDraft | null
  issues: ImportIssue[]
}
export type QuestionImportPreview = { rows: ParsedImportRow[]; total: number; valid: number; invalid: number }
export type QuestionImportContext = { topics: string[]; rubrics: Rubric[] }
export type QuestionImportParseResult = { preview: QuestionImportPreview | null; fileErrors: string[] }

const normalize = (value: string) => value.trim().toLocaleLowerCase()
const isBlankRow = (row: string[]) => row.every((cell) => !cell.trim())

export function validateQuestionImportFile(file: File): string[] {
  const errors: string[] = []
  if (!file.name.toLocaleLowerCase().endsWith('.csv') || !CSV_MIME_TYPES.has(file.type.toLocaleLowerCase())) errors.push('Chỉ hỗ trợ tệp CSV (.csv).')
  if (file.size > MAX_IMPORT_FILE_SIZE) errors.push('Tệp CSV không được vượt quá 5 MB.')
  if (file.size === 0) errors.push('Tệp CSV đang trống.')
  return errors
}

export function parseQuestionCsv(csv: string, context: QuestionImportContext): QuestionImportParseResult {
  const source = csv.replace(/^\uFEFF/, '')
  if (!source.trim()) return { preview: null, fileErrors: ['Tệp CSV đang trống.'] }
  const parsed = Papa.parse<string[]>(source, { skipEmptyLines: false })
  const parseErrors = parsed.errors.filter((error) => error.code !== 'UndetectableDelimiter')
  if (parseErrors.length) return { preview: null, fileErrors: ['Không thể đọc cấu trúc CSV. Hãy kiểm tra dấu ngoặc kép và dấu phẩy trong tệp.'] }
  const data = parsed.data.map((row) => row.map((cell) => String(cell ?? '')))
  while (data.length > 1 && isBlankRow(data[data.length - 1])) data.pop()
  if (!data.length || isBlankRow(data[0])) return { preview: null, fileErrors: ['Tệp CSV thiếu hàng tiêu đề.'] }
  const headers = data[0].map((header) => header.trim())
  const duplicateHeaders = [...new Set(headers.filter((header, index) => header && headers.indexOf(header) !== index))]
  const missingHeaders = REQUIRED_HEADERS.filter((header) => !headers.includes(header))
  const fileErrors: string[] = []
  if (duplicateHeaders.length) fileErrors.push(`Tiêu đề bị trùng: ${duplicateHeaders.join(', ')}.`)
  if (missingHeaders.length) fileErrors.push(`Thiếu cột bắt buộc: ${missingHeaders.join(', ')}.`)
  const records = data.slice(1)
  if (!records.length) fileErrors.push('Tệp CSV chỉ có tiêu đề và chưa có dữ liệu.')
  if (records.length > MAX_IMPORT_ROWS) fileErrors.push(`Tệp CSV vượt quá giới hạn ${MAX_IMPORT_ROWS} dòng dữ liệu.`)
  if (fileErrors.length) return { preview: null, fileErrors }

  const topicLookup = new Map(context.topics.map((topic) => [normalize(topic), topic]))
  const rubricLookup = new Map<string, Rubric[]>()
  for (const rubric of context.rubrics) { const key = normalize(rubric.name); rubricLookup.set(key, [...(rubricLookup.get(key) ?? []), rubric]) }
  const seenQuestions = new Set<string>()
  const rows = records.map((cells, index): ParsedImportRow => {
    const raw = Object.fromEntries(headers.map((header, column) => [header, (cells[column] ?? '').trim()]))
    const issues: ImportIssue[] = []
    const questionText = raw.question_text ?? ''
    const topicValue = raw.topic ?? ''
    const bloomValue = (raw.bloom_level ?? '').toLocaleUpperCase()
    const suggestedAnswer = raw.suggested_answer ?? ''
    const rubricName = raw.rubric_name ?? ''
    if (!questionText) issues.push({ column: 'question_text', message: 'Nội dung câu hỏi là bắt buộc.' })
    const duplicateKey = normalize(questionText)
    if (questionText && seenQuestions.has(duplicateKey)) issues.push({ column: 'question_text', message: 'Nội dung câu hỏi bị trùng với một dòng trước trong tệp.' })
    if (questionText) seenQuestions.add(duplicateKey)
    const topic = topicLookup.get(normalize(topicValue))
    if (!topicValue) issues.push({ column: 'topic', message: 'Chủ đề là bắt buộc.' })
    else if (!topic) issues.push({ column: 'topic', message: 'Chủ đề không tồn tại trong học phần hiện tại.' })
    const bloom = bloomMap[bloomValue]
    if (!bloom) issues.push({ column: 'bloom_level', message: 'Bloom phải là REMEMBER, UNDERSTAND, APPLY hoặc ANALYZE.' })
    let rubricId: string | undefined
    if (rubricName) {
      const matches = rubricLookup.get(normalize(rubricName)) ?? []
      if (!matches.length) issues.push({ column: 'rubric_name', message: 'Không tìm thấy rubric trong học phần hiện tại.' })
      else if (matches.length > 1) issues.push({ column: 'rubric_name', message: 'Tên rubric không duy nhất trong học phần hiện tại.' })
      else rubricId = matches[0].id
    }
    const draft = issues.length || !topic || !bloom ? null : { content: questionText, topic, bloom, suggestedAnswer: suggestedAnswer || undefined, rubricId, rubric: rubricName || undefined }
    return { id: `import-row-${index + 2}`, rowNumber: index + 2, raw, draft, issues }
  })
  const valid = rows.filter((row) => row.draft).length
  return { preview: { rows, total: rows.length, valid, invalid: rows.length - valid }, fileErrors: [] }
}

export async function parseQuestionImportFile(file: File, context: QuestionImportContext): Promise<QuestionImportParseResult> {
  const fileErrors = validateQuestionImportFile(file)
  if (fileErrors.length) return { preview: null, fileErrors }
  return parseQuestionCsv(await file.text(), context)
}

export const questionImportTemplate = '\uFEFFquestion_text,topic,bloom_level,suggested_answer,rubric_name\r\n"Phân biệt interface và abstract class trong Java.","OOP & Đa hình",ANALYZE,"Nêu các khác biệt cốt lõi.","Rubric Java Core"\r\n'
export const questionImportTemplateUrl = `data:text/csv;charset=utf-8,${encodeURIComponent(questionImportTemplate)}`
