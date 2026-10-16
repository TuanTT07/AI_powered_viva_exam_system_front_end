import type { ExamSession } from '../exam-types'
import type { RosterStudent } from '../roster-types'
import type { ExamSchedule } from '../schedule-types'
import type { ExamQuestionConfig } from '../question-config-types'
import { demoQuestionIds } from '../../question-bank/mocks/question-demo-extras'

export type ExamDemoSetup = { rosters: RosterStudent[]; schedules: ExamSchedule[]; questionConfigs: ExamQuestionConfig[] }
const names = ['Trần Minh Anh', 'Lê Hoàng Nam', 'Nguyễn Thu Hà', 'Phạm Đức Minh', 'Võ Khánh Linh', 'Đặng Hải Đăng', 'Bùi Ngọc Mai', 'Đỗ Tuấn Kiệt', 'Hoàng Phương Thảo', 'Vũ Gia Huy', 'Lý Bảo Ngọc', 'Mai Quang Hưng']
export function createDemoExamSeed(records: ExamSession[], now = new Date()): ExamSession[] {
  const base = new Date(now); base.setUTCHours(1, 0, 0, 0)
  return records.map((exam, index) => {
    const days = ['DRAFT', 'SCHEDULED', 'PUBLISHED'].includes(exam.status) ? 7 + index : exam.status === 'IN_PROGRESS' ? 0 : -7 - index
    return { ...exam, scheduledAt: new Date(base.getTime() + days * 86400000).toISOString() }
  })
}
export function createExamDemoSetup(exams: ExamSession[]): ExamDemoSetup {
  const rosters: RosterStudent[] = [], schedules: ExamSchedule[] = [], questionConfigs: ExamQuestionConfig[] = []
  for (const [examIndex, exam] of exams.entries()) {
    const roster = Array.from({ length: exam.studentCount }, (_, index): RosterStudent => ({
      id: `ROSTER-${exam.id}-${String(index + 1).padStart(3, '0')}`, examId: exam.id,
      studentCode: `SV${String(examIndex + 1).padStart(2, '0')}${String(index + 1).padStart(4, '0')}`,
      fullName: names[index % names.length], email: `sv${examIndex + 1}${String(index + 1).padStart(4, '0')}@example.edu.vn`,
    }))
    rosters.push(...roster)
    schedules.push({ examId: exam.id, strategy: 'ROSTER_ORDER', breakMinutes: 5, updatedAt: exam.scheduledAt, slots: roster.map((student, index) => {
      const start = Date.parse(exam.scheduledAt) + index * (exam.durationMinutes + 5) * 60000
      return { id: `SLOT-${exam.id}-${index + 1}`, examId: exam.id, rosterStudentId: student.id, startAt: new Date(start).toISOString(), endAt: new Date(start + exam.durationMinutes * 60000).toISOString() }
    }) })
    questionConfigs.push({ examId: exam.id, mode: 'MANUAL', questionIds: demoQuestionIds(exam.subjectId).slice(0, exam.mainQuestionCount), updatedAt: exam.scheduledAt })
  }
  return { rosters, schedules, questionConfigs }
}
