import type { EvaluationResponseDto } from './api-evaluation-service'

export function attemptEvaluations(evaluations: EvaluationResponseDto[], attemptId: string) {
  return evaluations.filter(e => e.examAttemptId === attemptId)
}

export function summarizeGrade(
  questions: { id: string; score: number | null; max: number; confirmed: boolean }[],
  expected?: number,
) {
  const unique = new Map(questions.map(q => [q.id, q]))
  const duplicates = unique.size !== questions.length
  const valid = [...unique.values()].filter(q => q.confirmed && q.score !== null &&
    Number.isFinite(q.score) && Number.isFinite(q.max) && q.max > 0 && q.score >= 0 && q.score <= q.max)
  const known = expected !== undefined && Number.isInteger(expected) && expected > 0
  const complete = known && !duplicates && unique.size === expected && valid.length === expected
  return {
    graded: valid.length,
    expected: known ? expected : null,
    score: complete ? Math.round(valid.reduce((sum, q) => sum + q.score! / q.max * 10, 0) / expected * 10) / 10 : null,
  }
}

export function summarizeAttempt(evaluations: EvaluationResponseDto[], attemptId: string, expected?: number) {
  return summarizeGrade(attemptEvaluations(evaluations, attemptId).map(e => ({
    id: e.questionAttemptId, score: e.finalScore, max: e.maxScore, confirmed: e.status === 'GRADED',
  })), expected)
}
