import { describe, expect, it } from 'vitest'
import { summarizeAttempt, summarizeGrade } from './attempt-grade'
import type { EvaluationResponseDto } from './api-evaluation-service'
const q = (id: string, score = 9.5, max = 10) => ({ id, score, max, confirmed: true })
describe('complete attempt score', () => {
  it('never promotes one of two question scores to a total', () => {
    expect(summarizeGrade([q('1')], 2)).toEqual({ graded: 1, expected: 2, score: null })
  })
  it('normalizes different rubric totals before equal averaging', () => {
    expect(summarizeGrade([q('1', 8, 10), q('2', 12, 20)], 2).score).toBe(7)
  })
  it('preserves zero as a confirmed score', () => {
    expect(summarizeGrade([q('1', 0), q('2', 10)], 2).score).toBe(5)
  })
  it('rejects unknown counts, invalid scores, unconfirmed, duplicates and excess questions', () => {
    expect(summarizeGrade([q('1')]).score).toBeNull()
    for (const questions of [[q('1', NaN)], [q('1', 11)], [q('1', 1, 0)], [{ ...q('1'), confirmed: false }], [q('1'), q('1')], [q('1'), q('2')]]) {
      expect(summarizeGrade(questions, 1).score).toBeNull()
    }
  })
  it('does not mix another attempt of the same student', () => {
    const evaluation = { questionAttemptId: 'q', examAttemptId: 'other', studentId: 'same', finalScore: 9.5, maxScore: 10, status: 'GRADED' } as EvaluationResponseDto
    expect(summarizeAttempt([evaluation], 'target', 1).score).toBeNull()
  })
})
