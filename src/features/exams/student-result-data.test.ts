import { describe, expect, it } from 'vitest'
import { apiResult, publishedQuestions, resultOutcome } from './student-result-data'
describe('published student result mapping', () => {
  it('excludes missing publication and invalid scores', () => {
    const valid = { questionAttemptId: 'qa-1', questionOrder: 1, questionContent: 'Q1', finalScore: 8, maxScore: 10, feedback: 'Released', criteria: [], transcript: [], audioUrl: null, publishedAt: '2026-11-01T00:00:00Z' }
    expect(publishedQuestions([valid, { ...valid, publishedAt: '' }, { ...valid, finalScore: NaN }])).toEqual([valid])
  })
  it('keeps partial published results visible without assigning a whole-exam score', () => {
    const result = apiResult({ examId: 'exam', attemptId: 'attempt', examTitle: 'Exam', courseCode: 'CS', courseName: 'Course', status: 'COMPLETED', examConfig: { maxMainQuestions: 2 }, slotNumber: 1, scheduledStartTime: null, scheduledEndTime: null }, [{ questionAttemptId: 'qa-1', questionContent: 'Q1', criteria: [], transcript: [], audioUrl: null, questionOrder: 1, maxScore: 10, finalScore: 9.5, feedback: null, publishedAt: '2026-11-01T00:00:00Z' }])
    expect(result.score).toBeNull()
    expect(resultOutcome(result)).toBe('pending')
    expect(result.questions).toHaveLength(1)
    expect(result.expectedQuestions).toBe(2)
  })
  it('restores the published-question average without inventing overall feedback', () => {
    const result = apiResult({ examId: 'exam', attemptId: 'attempt', examTitle: 'Exam', courseCode: 'CS', courseName: 'Course', status: 'COMPLETED', examConfig: { maxMainQuestions: 1 }, slotNumber: 1, scheduledStartTime: null, scheduledEndTime: null }, [{ questionAttemptId: 'qa-1', questionContent: 'Q1', criteria: [], transcript: [], audioUrl: null, questionOrder: 1, maxScore: 10, finalScore: 8, feedback: 'Question feedback', publishedAt: '2026-11-01T00:00:00Z' }])
    expect(result.score).toBe(8)
    expect(result.feedback).toBeNull()
    expect(result.questions).toHaveLength(1)
  })
})

describe('score color boundaries', () => {
  it.each([[null, 'pending'], [0, 'failed'], [4.9, 'failed'], [5, 'passed'], [8, 'passed']])('maps %s to %s', (score, outcome) => {
    expect(resultOutcome({ score } as Parameters<typeof resultOutcome>[0])).toBe(outcome)
  })
})
