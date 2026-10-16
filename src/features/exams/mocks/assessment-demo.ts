import type { ExamSession } from '../exam-types'
import type { RosterStudent } from '../roster-types'
import type { AttemptRow } from '../use-assessment-overview'
const scores = [8.5, 7.2, 9.1, 6.8, 8, 9.4, 5.6, 7.8, 8.7, 4.8, 7, 8.2]
export function createDemoAssessment(exam: ExamSession | undefined, roster: RosterStudent[]) {
  if (!exam) return { rows: roster.map(s => ({ attemptId: s.id, studentName: s.fullName, studentCode: s.studentCode, studentEmail: s.email, status: null, scheduledStartTime: null } as AttemptRow)), total: roster.length, completed: null, active: null, absent: null, demo: true }
  const completed = exam.status === 'COMPLETED' ? roster.length : exam.status === 'IN_PROGRESS' ? Math.floor(roster.length * 0.4) : 0
  const active = exam.status === 'IN_PROGRESS' && roster.length > completed ? 1 : 0
  const rows: AttemptRow[] = roster.map((s, index) => ({
    attemptId: s.id, studentName: s.fullName, studentCode: s.studentCode, studentEmail: s.email,
    status: exam.status === 'CANCELLED' ? 'CANCELLED' : index < completed ? 'COMPLETED' : index < completed + active ? 'IN_PROGRESS' : 'SCHEDULED',
    scheduledStartTime: new Date(Date.parse(exam.scheduledAt) + index * (exam.durationMinutes + 5) * 60000).toISOString(),
    demoScore: index < completed ? scores[index % scores.length] : undefined,
  }))
  return { rows, total: roster.length, completed, active, absent: 0, demo: true }
}
