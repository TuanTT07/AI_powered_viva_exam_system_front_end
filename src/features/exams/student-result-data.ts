import { useQuery } from '@tanstack/react-query'
import { useSession } from '../../app/providers/use-session'
import { runtimeConfig } from '../../services/api/runtime-config'
import { apiStudentExamRepository, type StudentExamSummary } from './api-student-exam-repository'
import { apiEvaluationService } from '../grading/api-evaluation-service'
import { studentResultsDemo } from './mocks/student-results-demo'

type PublishedQuestion = Awaited<ReturnType<typeof apiEvaluationService.studentResults>>[number]
export type StudentResult = {
  examId: string; attemptId: string; title: string; code: string; course: string; date: string | null
  score: number | null; feedback: string | null; questions: PublishedQuestion[]; demo: boolean
}
export function publishedQuestions(questions: PublishedQuestion[]) {
  return questions.filter(q => Boolean(q.publishedAt) && Number.isFinite(Date.parse(q.publishedAt)) && Number.isFinite(q.finalScore))
}
export function apiResult(exam: StudentExamSummary, questions: PublishedQuestion[]): StudentResult {
  const published = publishedQuestions(questions)
  const score = published.length ? Number((published.reduce((sum, question) => sum + question.finalScore, 0) / published.length).toFixed(1)) : null
  return { examId: exam.examId, attemptId: exam.attemptId, title: exam.examTitle, code: exam.examId, course: [exam.courseCode, exam.courseName].filter(Boolean).join(' · '), date: exam.scheduledStartTime, score, feedback: null, questions: published, demo: false }
}
export const demoResults: StudentResult[] = studentResultsDemo.map(r => ({ examId: r.id, attemptId: r.id, title: r.title, code: r.id, course: r.subject, date: r.date, score: r.score, feedback: r.feedback, questions: [], demo: true }))
export function resultPath(result: StudentResult) {
  return `/student/exams/${encodeURIComponent(result.examId)}/result?${new URLSearchParams({ attemptId: result.attemptId })}`
}
export function resultDate(date: string | null) {
  return date && Number.isFinite(Date.parse(date)) ? new Date(date).toLocaleDateString('vi-VN') : 'Chưa có ngày thi'
}
export function useResultList(page: number) {
  const { session } = useSession()
  return useQuery({ queryKey: ['student-results', runtimeConfig.dataSource, session.user?.id, page], enabled: runtimeConfig.dataSource === 'api' && Boolean(session.user), queryFn: async ({ signal }) => {
    const exams = await apiStudentExamRepository.list({ status: 'COMPLETED', page }, signal)
    const rows = await Promise.all(exams.content.map(async exam => apiResult(exam, await apiEvaluationService.studentResults(exam.attemptId, signal))))
    return { rows, totalPages: exams.totalPages }
  } })
}
export function useResultDetail(examId: string, requestedAttempt: string | null) {
  const { session } = useSession()
  return useQuery({ queryKey: ['student-result', runtimeConfig.dataSource, session.user?.id, examId, requestedAttempt], enabled: runtimeConfig.dataSource === 'api' && Boolean(session.user) && Boolean(examId), queryFn: async ({ signal }) => {
    const slot = await apiStudentExamRepository.getMySlot(examId, signal)
    if ((requestedAttempt !== null && requestedAttempt !== slot.attemptId) || slot.status !== 'COMPLETED') throw new Error('Không có quyền xem kết quả của lượt thi này.')
    return apiResult(slot, await apiEvaluationService.studentResults(slot.attemptId, signal))
  } })
}

export function resultOutcome(result?: StudentResult) {
  return result?.score !== null && result?.score !== undefined
    ? result.score >= 5 ? 'passed' : 'failed'
    : 'pending'
}
