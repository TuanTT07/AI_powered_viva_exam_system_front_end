import type { ExamDraft, ExamListRequest, ExamListResponse, ExamSession, ExamStatus } from './exam-types'

const seed: ExamSession[] = [
  { id: 'EXAM-2024-OOP-01', title: 'Vấn đáp OOP Java - Đợt 1', subjectId: 'oop-java', subjectCode: 'INT2204', subjectName: 'Lập trình Java', scheduledAt: '2024-10-15T08:00:00+07:00', durationMinutes: 15, studentCount: 45, mainQuestionCount: 5, maxFollowUpCount: 2, status: 'IN_PROGRESS' },
  { id: 'EXAM-2024-COL-02', title: 'Vấn đáp Java Collections & Exception', subjectId: 'oop-java', subjectCode: 'INT2204', subjectName: 'Lập trình Java', scheduledAt: '2024-10-25T08:00:00+07:00', durationMinutes: 20, studentCount: 38, mainQuestionCount: 5, maxFollowUpCount: 2, status: 'DRAFT' },
  { id: 'EXAM-2024-CORE-K21', title: 'Thi cuối kỳ Java Core K21', subjectId: 'java-core', subjectCode: 'INT2201', subjectName: 'Java Core', scheduledAt: '2024-09-01T08:00:00+07:00', durationMinutes: 15, studentCount: 120, mainQuestionCount: 4, maxFollowUpCount: 2, status: 'COMPLETED' },
  { id: 'EXAM-2025-DB-01', title: 'Vấn đáp Cơ sở dữ liệu - Đợt 1', subjectId: 'database', subjectCode: 'INT2210', subjectName: 'Cơ sở dữ liệu', scheduledAt: '2025-01-12T13:30:00+07:00', durationMinutes: 18, studentCount: 52, mainQuestionCount: 5, maxFollowUpCount: 3, status: 'SCHEDULED' },
  { id: 'EXAM-2025-OS-01', title: 'Kiểm tra vấn đáp Hệ điều hành', subjectId: 'operating-systems', subjectCode: 'INT2220', subjectName: 'Hệ điều hành', scheduledAt: '2025-02-18T09:00:00+07:00', durationMinutes: 12, studentCount: 64, mainQuestionCount: 4, maxFollowUpCount: 2, status: 'CANCELLED' },
  { id: 'EXAM-2025-DSA-01', title: 'Đánh giá Giải thuật & Cấu trúc dữ liệu', subjectId: 'dsa', subjectCode: 'INT2203', subjectName: 'Cấu trúc dữ liệu & Giải thuật', scheduledAt: '2025-03-08T08:30:00+07:00', durationMinutes: 20, studentCount: 80, mainQuestionCount: 6, maxFollowUpCount: 2, status: 'SCHEDULED' },
  { id: 'EXAM-2025-AI-01', title: 'Vấn đáp Nhập môn AI', subjectId: 'intro-ai', subjectCode: 'INT2301', subjectName: 'Nhập môn Trí tuệ nhân tạo', scheduledAt: '2025-04-21T14:00:00+07:00', durationMinutes: 15, studentCount: 36, mainQuestionCount: 5, maxFollowUpCount: 2, status: 'DRAFT' },
  { id: 'EXAM-2025-NET-01', title: 'Thi giữa kỳ Mạng máy tính', subjectId: 'networks', subjectCode: 'INT2230', subjectName: 'Mạng máy tính', scheduledAt: '2025-05-16T08:00:00+07:00', durationMinutes: 15, studentCount: 70, mainQuestionCount: 5, maxFollowUpCount: 2, status: 'COMPLETED' },
  { id: 'EXAM-2025-SE-01', title: 'Vấn đáp Công nghệ phần mềm', subjectId: 'software-engineering', subjectCode: 'INT2240', subjectName: 'Công nghệ phần mềm', scheduledAt: '2025-06-10T10:00:00+07:00', durationMinutes: 18, studentCount: 48, mainQuestionCount: 5, maxFollowUpCount: 3, status: 'SCHEDULED' },
  { id: 'EXAM-2025-SEC-01', title: 'Đánh giá An toàn thông tin', subjectId: 'security', subjectCode: 'INT2250', subjectName: 'An toàn thông tin', scheduledAt: '2025-07-05T13:00:00+07:00', durationMinutes: 15, studentCount: 42, mainQuestionCount: 4, maxFollowUpCount: 2, status: 'IN_PROGRESS' },
  { id: 'EXAM-2025-UX-01', title: 'Vấn đáp Thiết kế tương tác', subjectId: 'ux', subjectCode: 'INT2260', subjectName: 'Thiết kế tương tác', scheduledAt: '2025-08-12T08:00:00+07:00', durationMinutes: 12, studentCount: 30, mainQuestionCount: 4, maxFollowUpCount: 2, status: 'CANCELLED' },
]

export type ExamRepository = { list(request: ExamListRequest): Promise<ExamListResponse>; get(examId: string): Promise<ExamSession | undefined>; create(draft: ExamDraft): Promise<ExamSession>; update(examId: string, draft: ExamDraft): Promise<ExamSession>; subjects(): Promise<{ id: string; code: string; name: string }[]>; summary(): Promise<Record<ExamStatus, number>> }

export function createExamRepository(records: ExamSession[] = seed): ExamRepository {
  return {
    async list(request) {
      if (request.q === '__ERROR__') throw new Error('Exam repository unavailable')
      const needle = request.q.trim().toLocaleLowerCase()
      const filtered = records.filter((exam) => (!needle || `${exam.id} ${exam.title} ${exam.subjectCode} ${exam.subjectName}`.toLocaleLowerCase().includes(needle)) && (!request.subject || exam.subjectId === request.subject) && (!request.status || exam.status === request.status))
      const totalPages = Math.max(1, Math.ceil(filtered.length / request.pageSize))
      const page = Math.min(Math.max(1, request.page), totalPages)
      return { items: filtered.slice((page - 1) * request.pageSize, page * request.pageSize), total: filtered.length, page, pageSize: request.pageSize, totalPages }
    },
    async get(examId) { if (examId === '__ERROR__') throw new Error('Exam repository unavailable'); return records.find((exam) => exam.id === examId) },
    async create(draft) {
      if (draft.title === '__ERROR__') throw new Error('Exam create failed')
      const subject = records.find((exam) => exam.subjectId === draft.subjectId)
      if (!subject) throw new Error('Subject is not available to this lecturer')
      let sequence = records.length + 1
      let id = `EXAM-MOCK-${String(sequence).padStart(3, '0')}`
      while (records.some((exam) => exam.id === id)) { sequence += 1; id = `EXAM-MOCK-${String(sequence).padStart(3, '0')}` }
      const exam: ExamSession = { id, title: draft.title, subjectId: subject.subjectId, subjectCode: subject.subjectCode, subjectName: subject.subjectName, scheduledAt: draft.scheduledAt, durationMinutes: draft.durationMinutes, studentCount: 0, mainQuestionCount: draft.mainQuestionCount, maxFollowUpCount: draft.maxFollowUpCount, status: 'DRAFT' }
      records.push(exam)
      return exam
    },
    async update(examId, draft) {
      if (draft.title === '__ERROR__') throw new Error('Exam update failed')
      const index = records.findIndex((exam) => exam.id === examId)
      if (index < 0) throw new Error('Exam not found')
      const current = records[index]
      if (current.status !== 'DRAFT' && current.status !== 'SCHEDULED') throw new Error('Exam is not editable')
      const subject = records.find((exam) => exam.subjectId === draft.subjectId)
      if (!subject) throw new Error('Subject is not available to this lecturer')
      const updated: ExamSession = { ...current, title: draft.title, subjectId: subject.subjectId, subjectCode: subject.subjectCode, subjectName: subject.subjectName, scheduledAt: draft.scheduledAt, durationMinutes: draft.durationMinutes, mainQuestionCount: draft.mainQuestionCount, maxFollowUpCount: draft.maxFollowUpCount }
      records[index] = updated
      return updated
    },
    async subjects() { return [...new Map(records.map((exam) => [exam.subjectId, { id: exam.subjectId, code: exam.subjectCode, name: exam.subjectName }])).values()] },
    async summary() { return records.reduce((counts, exam) => ({ ...counts, [exam.status]: counts[exam.status] + 1 }), { DRAFT: 0, SCHEDULED: 0, IN_PROGRESS: 0, COMPLETED: 0, CANCELLED: 0 }) },
  }
}

export const examRepository = createExamRepository()
export const examSeed = seed
