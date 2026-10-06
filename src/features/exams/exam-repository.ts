import type { ExamDraft, ExamListRequest, ExamListResponse, ExamSession, ExamStatus } from './exam-types'
import type { RosterDraft, RosterStudent } from './roster-types'
import { rosterEditableStatuses } from './roster-types'
import type { ExamSchedule, ScheduleDraft } from './schedule-types'
import { validateSchedule } from './schedule-validation'
import type { ExamQuestionConfig, QuestionConfigDraft } from './question-config-types'
import { questionRepository } from '../question-bank/question-repository'
import { apiExamRepository } from './api-exam-repository'
import { runtimeConfig } from '../../services/api/runtime-config'
import { selectRepository } from '../../services/api/repository-selection'

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

export type ExamRepository = { list(request: ExamListRequest): Promise<ExamListResponse>; get(examId: string): Promise<ExamSession | undefined>; create(draft: ExamDraft): Promise<ExamSession>; update(examId: string, draft: ExamDraft): Promise<ExamSession>; delete(examId: string): Promise<void>; updateStatus(examId: string, status: ExamStatus): Promise<ExamSession>; subjects(): Promise<{ id: string; code: string; name: string }[]>; summary(): Promise<Record<ExamStatus, number>>; listRoster(examId: string): Promise<RosterStudent[]>; addRosterStudent(examId: string, draft: RosterDraft): Promise<RosterStudent>; importRosterStudents(examId: string, drafts: RosterDraft[]): Promise<RosterStudent[]>; removeRosterStudent(examId: string, rosterId: string): Promise<void>; getSchedule(examId: string): Promise<ExamSchedule | undefined>; saveSchedule(examId: string, draft: ScheduleDraft): Promise<ExamSchedule>; getQuestionConfig(examId: string): Promise<ExamQuestionConfig | undefined>; saveQuestionConfig(examId: string, draft: QuestionConfigDraft): Promise<ExamQuestionConfig> }

export function createExamRepository(records: ExamSession[] = seed): ExamRepository {
  const rosters = new Map<string, RosterStudent[]>(records.map((exam) => [exam.id, []]))
  const schedules = new Map<string, ExamSchedule>()
  const questionConfigs = new Map<string, ExamQuestionConfig>()
  rosters.set('EXAM-2025-DB-01', [
    { id: 'ROSTER-EXAM-2025-DB-01-001', examId: 'EXAM-2025-DB-01', studentCode: 'SV2025001', fullName: 'Trần Minh Anh', email: 'sv2025001@example.edu.vn' },
    { id: 'ROSTER-EXAM-2025-DB-01-002', examId: 'EXAM-2025-DB-01', studentCode: 'SV2025002', fullName: 'Lê Hoàng Nam', email: 'sv2025002@example.edu.vn' },
  ])
  const ensureEditable = (examId: string) => { const exam = records.find((item) => item.id === examId); if (!exam) throw new Error('Exam not found'); if (!rosterEditableStatuses.includes(exam.status)) throw new Error('Exam is not editable'); return exam }
  const normalize = (value: string) => value.trim().toLocaleLowerCase()
  const ensureUnique = (examId: string, draft: RosterDraft, ignoreId?: string) => { const current = rosters.get(examId) ?? []; if (current.some((item) => item.id !== ignoreId && normalize(item.studentCode) === normalize(draft.studentCode))) throw new Error('Mã sinh viên đã tồn tại trong kỳ thi'); if (current.some((item) => item.id !== ignoreId && normalize(item.email) === normalize(draft.email))) throw new Error('Email đã tồn tại trong kỳ thi') }
  const adjustCount = (examId: string, delta: number) => { const exam = records.find((item) => item.id === examId); if (exam) exam.studentCount = Math.max(0, exam.studentCount + delta) }
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
      rosters.set(exam.id, [])
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
    async delete(examId) { const index = records.findIndex((exam) => exam.id === examId); if (index < 0) throw new Error('Exam not found'); if (!['DRAFT', 'SCHEDULED'].includes(records[index].status)) throw new Error('Exam is not deletable'); records.splice(index, 1); rosters.delete(examId); schedules.delete(examId); questionConfigs.delete(examId) },
    async updateStatus(examId, status) { const exam = records.find((item) => item.id === examId); if (!exam) throw new Error('Exam not found'); const allowed: Record<ExamStatus, ExamStatus[]> = { DRAFT: ['PUBLISHED', 'CANCELLED'], PUBLISHED: ['IN_PROGRESS', 'CANCELLED'], SCHEDULED: ['IN_PROGRESS', 'CANCELLED'], IN_PROGRESS: ['COMPLETED', 'CANCELLED'], COMPLETED: [], CANCELLED: [] }; if (!allowed[exam.status].includes(status)) throw new Error('Chuyển trạng thái kỳ thi không hợp lệ'); exam.status = status; return exam },
    async subjects() { return [...new Map(records.map((exam) => [exam.subjectId, { id: exam.subjectId, code: exam.subjectCode, name: exam.subjectName }])).values()] },
    async summary() { return records.reduce((counts, exam) => ({ ...counts, [exam.status]: counts[exam.status] + 1 }), { DRAFT: 0, PUBLISHED: 0, SCHEDULED: 0, IN_PROGRESS: 0, COMPLETED: 0, CANCELLED: 0 }) },
    async listRoster(examId) { if (examId === '__ERROR__') throw new Error('Roster repository unavailable'); if (!records.some((exam) => exam.id === examId)) throw new Error('Exam not found'); return [...(rosters.get(examId) ?? [])] },
    async addRosterStudent(examId, draft) { const exam = ensureEditable(examId); if (draft.studentCode === '__ERROR__') throw new Error('Không thể thêm sinh viên'); ensureUnique(examId, draft); const current = rosters.get(examId) ?? []; const student: RosterStudent = { ...draft, id: `ROSTER-${exam.id}-${String(current.length + 1).padStart(3, '0')}`, examId, addedAt: '2026-10-06T00:00:00+07:00' }; current.push(student); rosters.set(examId, current); adjustCount(examId, 1); return student },
    async importRosterStudents(examId, drafts) { ensureEditable(examId); const imported: RosterStudent[] = []; for (const draft of drafts) { const student = await this.addRosterStudent(examId, draft); imported.push(student) } return imported },
    async removeRosterStudent(examId, rosterId) { ensureEditable(examId); const current = rosters.get(examId) ?? []; const index = current.findIndex((student) => student.id === rosterId); if (index < 0) throw new Error('Sinh viên không tồn tại trong kỳ thi'); current.splice(index, 1); adjustCount(examId, -1) },
    async getSchedule(examId) { if (examId === '__ERROR__') throw new Error('Schedule repository unavailable'); if (!records.some((exam) => exam.id === examId)) throw new Error('Exam not found'); const schedule = schedules.get(examId); return schedule ? { ...schedule, slots: schedule.slots.map((slot) => ({ ...slot })) } : undefined },
    async saveSchedule(examId, draft) { const exam = ensureEditable(examId); if (draft.breakMinutes === 13) throw new Error('Schedule save failed'); const roster = rosters.get(examId) ?? []; const issues = validateSchedule(exam, roster, draft); if (issues.length) throw new Error(issues[0].message); const schedule: ExamSchedule = { examId, breakMinutes: draft.breakMinutes, strategy: draft.strategy, slots: draft.slots.map((slot) => ({ ...slot })), updatedAt: '2026-10-06T00:00:00+07:00' }; schedules.set(examId, schedule); return { ...schedule, slots: schedule.slots.map((slot) => ({ ...slot })) } },
    async getQuestionConfig(examId) { if (!records.some((exam) => exam.id === examId)) throw new Error('Exam not found'); const config = questionConfigs.get(examId); return config ? { ...config, questionIds: [...config.questionIds] } : undefined },
    async saveQuestionConfig(examId, draft) { const exam = ensureEditable(examId); if (draft.mode === 'MANUAL' && draft.questionIds.length !== exam.mainQuestionCount) throw new Error(`Manual mode requires exactly ${exam.mainQuestionCount} questions`); if (draft.mode === 'RANDOM_POOL' && draft.questionIds.length < exam.mainQuestionCount) throw new Error(`Random pool requires at least ${exam.mainQuestionCount} questions`); if (new Set(draft.questionIds).size !== draft.questionIds.length) throw new Error('Duplicate question IDs are not allowed'); const questions = await questionRepository.list(exam.subjectId); const eligible = new Map(questions.filter((question) => question.status === 'ĐÃ DUYỆT').map((question) => [question.id, question])); if (draft.questionIds.some((id) => !eligible.has(id))) throw new Error('One or more questions are no longer eligible for this exam'); if (draft.questionIds.length && draft.questionIds[0] === '__ERROR__') throw new Error('Question configuration save failed'); const config: ExamQuestionConfig = { examId: exam.id, mode: draft.mode, questionIds: [...draft.questionIds], updatedAt: '2026-10-06T00:00:00+07:00' }; questionConfigs.set(examId, config); return { ...config, questionIds: [...config.questionIds] } },
  }
}

export const mockExamRepository = createExamRepository()
export const examRepository: ExamRepository = selectRepository(runtimeConfig.dataSource, { mock: mockExamRepository, api: apiExamRepository })
export const examSeed = seed
