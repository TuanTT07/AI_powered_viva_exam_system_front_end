import { isExamUuid } from './api-exam-scheduling-repository'

export function studentExamPath(examId: string, attemptId: string, step: '' | 'check' | 'session' = '', questionTurnId?: string | null) {
  const query = new URLSearchParams({ attemptId })
  if (questionTurnId && isExamUuid(questionTurnId)) query.set('questionTurnId', questionTurnId)
  return `/student/exams/${encodeURIComponent(examId)}${step ? `/${step}` : ''}?${query}`
}

export function studentRoomSearch(search: URLSearchParams) {
  const next = new URLSearchParams()
  const attemptId = search.get('attemptId')
  const questionTurnId = search.get('questionTurnId')
  // Carry even a malformed attempt ID so the room rejects it rather than silently choosing another attempt.
  if (attemptId !== null) next.set('attemptId', attemptId)
  if (questionTurnId && isExamUuid(questionTurnId)) next.set('questionTurnId', questionTurnId)
  return next.size ? `?${next}` : ''
}

export function matchesRequestedAttempt(requested: string | null, actual: string) {
  return requested === null || (isExamUuid(requested) && requested === actual)
}
