import { describe, expect, it } from 'vitest'
import { evaluateBasicInformation, evaluateExamReadiness, evaluateQuestionConfig, evaluateRoster, evaluateSchedule } from './exam-readiness'
import type { ExamSession } from './exam-types'
import type { RosterStudent } from './roster-types'

const exam: ExamSession = { id: 'e1', title: 'Exam', subjectId: 'oop-java', subjectCode: 'INT2204', subjectName: 'Java', scheduledAt: '2027-01-01T01:00:00.000Z', durationMinutes: 15, studentCount: 2, mainQuestionCount: 2, maxFollowUpCount: 1, status: 'DRAFT' }
const roster: RosterStudent[] = [{ id: 'r1', examId: 'e1', studentCode: 'SV1', fullName: 'Một', email: 'one@example.com' }, { id: 'r2', examId: 'e1', studentCode: 'SV2', fullName: 'Hai', email: 'two@example.com' }]
const schedule = { examId: 'e1', breakMinutes: 5, strategy: 'ROSTER_ORDER' as const, updatedAt: '2026-10-06T00:00:00.000Z', slots: [{ id: 's1', examId: 'e1', startAt: '2027-01-01T01:00:00.000Z', endAt: '2027-01-01T01:15:00.000Z', rosterStudentId: 'r1' }, { id: 's2', examId: 'e1', startAt: '2027-01-01T01:20:00.000Z', endAt: '2027-01-01T01:35:00.000Z', rosterStudentId: 'r2' }] }
const questions = [{ id: 'q1', subjectId: 'oop-java', content: 'Q', topic: 'T', bloom: 'HIỂU' as const, source: 'Thủ công' as const, status: 'ĐÃ DUYỆT' as const }, { id: 'q2', subjectId: 'oop-java', content: 'Q2', topic: 'T', bloom: 'HIỂU' as const, source: 'Thủ công' as const, status: 'ĐÃ DUYỆT' as const }]

describe('exam readiness', () => {
  it('evaluates basic information and historical read-only exams safely', () => { expect(evaluateBasicInformation(exam, new Date('2026-01-01')).status).toBe('COMPLETE'); expect(evaluateBasicInformation({ ...exam, scheduledAt: '2020-01-01T01:00:00.000Z' }, new Date('2026-01-01')).status).toBe('INCOMPLETE'); expect(evaluateBasicInformation({ ...exam, status: 'COMPLETED', scheduledAt: '2020-01-01T01:00:00.000Z' }, new Date('2026-01-01')).status).toBe('COMPLETE') })
  it('marks empty roster and partial schedule incomplete', () => { expect(evaluateRoster([]).status).toBe('INCOMPLETE'); expect(evaluateSchedule(exam, roster, { ...schedule, slots: [schedule.slots[0]] }).status).toBe('INCOMPLETE'); expect(evaluateSchedule(exam, roster, schedule).status).toBe('COMPLETE') })
  it('marks missing and invalid question configurations', () => { expect(evaluateQuestionConfig(exam, null, questions).status).toBe('INCOMPLETE'); expect(evaluateQuestionConfig(exam, { examId: 'e1', mode: 'MANUAL', questionIds: ['q1'], updatedAt: '' }, questions).status).toBe('INCOMPLETE'); expect(evaluateQuestionConfig(exam, { examId: 'e1', mode: 'MANUAL', questionIds: ['q1', 'q2'], updatedAt: '' }, questions).status).toBe('COMPLETE') })
  it('prevents READY when a required section is unavailable', () => { const result = evaluateExamReadiness([evaluateBasicInformation(exam), evaluateRoster(roster), evaluateSchedule(exam, roster, schedule), evaluateQuestionConfig(exam, undefined, questions, true)]); expect(result.ready).toBe(false); expect(result.completedCount).toBe(3); expect(result.blockingIssues[0]).toContain('Không thể') })
})
