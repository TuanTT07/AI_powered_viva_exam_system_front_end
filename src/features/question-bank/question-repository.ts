import type { ImportedQuestionDraft, Question } from './question-types'

export type QuestionImportResult = { imported: number; failed: number }
export type QuestionRepository = {
  list(subjectId: string): Promise<Question[]>
  get(subjectId: string, questionId: string): Promise<Question | null>
  topics(subjectId: string): Promise<string[]>
  import(subjectId: string, drafts: ImportedQuestionDraft[]): Promise<QuestionImportResult>
  save(question: Question): Promise<Question>
}

const questions: Question[] = [
  { id: 'Q-JAVA-0104', subjectId: 'java', content: 'Phân biệt interface và abstract class trong Java. Khi nào nên dùng loại nào?', topic: 'OOP & Đa hình', bloom: 'PHÂN TÍCH', suggestedAnswer: 'Interface tập trung vào hợp đồng hành vi; abstract class phù hợp khi cần chia sẻ trạng thái và triển khai chung.', rubric: '3 tiêu chí (10đ)', source: 'AI đề xuất', status: 'ĐÃ DUYỆT' },
  { id: 'Q-JAVA-0089', subjectId: 'java', content: 'Trình bày cơ chế giải quyết xung đột băm (Hash Collision) trong HashMap Java 8+.', topic: 'Collections', bloom: 'HIỂU', rubric: '2 tiêu chí (10đ)', source: 'Thủ công', status: 'ĐÃ DUYỆT' },
  { id: 'Q-JAVA-0112', subjectId: 'java', content: 'Phân biệt Checked Exception và Unchecked Exception; cho ví dụ minh họa.', topic: 'Exception', bloom: 'VẬN DỤNG', rubric: '2 tiêu chí (10đ)', source: 'Import', status: 'CHỜ DUYỆT' },
  { id: 'Q-JAVA-0118', subjectId: 'java', content: 'Nguyên lý hoạt động của Garbage Collection trong JVM và thuật toán Mark-and-Sweep.', topic: 'JVM Core', bloom: 'HIỂU', source: 'AI đề xuất', status: 'BẢN NHÁP' },
  { id: 'Q-JAVA-0121', subjectId: 'java', content: 'So sánh ArrayList và LinkedList khi chèn, xoá và truy xuất ngẫu nhiên.', topic: 'Collections', bloom: 'PHÂN TÍCH', rubric: '3 tiêu chí (10đ)', source: 'Thủ công', status: 'ĐÃ DUYỆT' },
  { id: 'Q-JAVA-0130', subjectId: 'java', content: 'Giải thích cơ chế đóng gói và lợi ích đối với khả năng bảo trì hệ thống.', topic: 'OOP & Đa hình', bloom: 'HIỂU', rubric: '2 tiêu chí (10đ)', source: 'Import', status: 'CHỜ DUYỆT' },
  { id: 'Q-OOP-0001', subjectId: 'oop-java', content: 'Phân biệt interface và abstract class trong Java.', topic: 'OOP & Đa hình', bloom: 'PHÂN TÍCH', rubric: '3 tiêu chí (10đ)', source: 'Thủ công', status: 'ĐÃ DUYỆT' },
  { id: 'Q-OOP-0002', subjectId: 'oop-java', content: 'Giải thích tính đa hình và ví dụ trong Java.', topic: 'OOP & Đa hình', bloom: 'HIỂU', source: 'Thủ công', status: 'ĐÃ DUYỆT' },
  { id: 'Q-OOP-0003', subjectId: 'oop-java', content: 'So sánh HashMap và TreeMap trong Java.', topic: 'Collections', bloom: 'VẬN DỤNG', source: 'Import', status: 'ĐÃ DUYỆT' },
  { id: 'Q-OOP-0004', subjectId: 'oop-java', content: 'Mô tả xử lý exception và nguyên tắc thiết kế.', topic: 'Exception', bloom: 'HIỂU', source: 'AI đề xuất', status: 'BẢN NHÁP' },
  { id: 'Q-OOP-0005', subjectId: 'oop-java', content: 'Giải thích nguyên lý đóng gói trong lập trình hướng đối tượng.', topic: 'OOP & Đa hình', bloom: 'HIỂU', source: 'Thủ công', status: 'ĐÃ DUYỆT' },
  { id: 'Q-OOP-0006', subjectId: 'oop-java', content: 'So sánh kế thừa và composition trong thiết kế Java.', topic: 'OOP & Đa hình', bloom: 'PHÂN TÍCH', source: 'Thủ công', status: 'ĐÃ DUYỆT' },
  { id: 'Q-DB-0001', subjectId: 'database', content: 'Phân biệt chuẩn hóa và phi chuẩn hóa dữ liệu.', topic: 'Mô hình dữ liệu', bloom: 'PHÂN TÍCH', source: 'Thủ công', status: 'ĐÃ DUYỆT' },
  { id: 'Q-DB-0002', subjectId: 'database', content: 'Giải thích transaction và các tính chất ACID.', topic: 'Transaction', bloom: 'HIỂU', source: 'Thủ công', status: 'ĐÃ DUYỆT' },
]

const subjectTopics: Record<string, string[]> = { java: ['OOP & Đa hình', 'Collections', 'Exception', 'JVM Core', 'OOP & Tính kế thừa', 'Java Collections Framework', 'Xử lý Ngoại lệ'] }
const clone = <T,>(value: T): T => structuredClone(value)

export const questionRepository: QuestionRepository = {
  async list(subjectId) { return clone(questions.filter((question) => question.subjectId === subjectId)) },
  async get(subjectId, questionId) { return clone(questions.find((question) => question.subjectId === subjectId && question.id === questionId) ?? null) },
  async topics(subjectId) { return clone(subjectTopics[subjectId] ?? []) },
  async import(subjectId, drafts) {
    const imported = drafts.map((draft): Question => ({ ...clone(draft), id: `Q-${subjectId.toUpperCase()}-${crypto.randomUUID()}`, subjectId, source: 'Import', status: 'BẢN NHÁP' }))
    questions.unshift(...imported)
    return { imported: imported.length, failed: 0 }
  },
  async save(question) {
    const index = questions.findIndex((item) => item.subjectId === question.subjectId && item.id === question.id)
    if (index >= 0) questions[index] = clone(question)
    else questions.unshift(clone(question))
    return clone(question)
  },
}
