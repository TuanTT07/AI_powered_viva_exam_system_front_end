import { beforeEach, describe, expect, it } from 'vitest'
import {
  getStoredGrading,
  saveStoredGrading,
  gradingRepository,
} from './grading-repository'
import type { FinalizeGradeDraft, CriterionReview } from './grading-types'

describe('gradingRepository and storage', () => {
  const examId = 'exam-test-123'
  const attemptId = 'attempt-test-456'

  beforeEach(() => {
    localStorage.clear()
  })

  it('saves and retrieves stored grading draft and confirmation', () => {
    expect(getStoredGrading(examId, attemptId)).toBeNull()

    const draft = {
      scores: { criterion1: '2.5', criterion2: '3.0' },
      notes: 'Good performance',
      confirmed: false,
    }

    saveStoredGrading(examId, attemptId, draft)
    const stored = getStoredGrading(examId, attemptId)
    expect(stored).toEqual(draft)
  })

  it('finalizes grading with computed total score and timestamp', async () => {
    const criteria: CriterionReview[] = [
      { id: 'c1', name: 'Knowledge', max: 5, ai: 4, evidence: 'Good' },
      { id: 'c2', name: 'Analysis', max: 5, ai: 3.5, evidence: 'Adequate' },
    ]

    const draft: FinalizeGradeDraft = {
      scores: { c1: '4.5', c2: '4.0' },
      notes: 'Clear and detailed explanation',
      confirmed: true,
    }

    const result = await gradingRepository.finalize(examId, attemptId, draft, criteria)
    expect(result.finalScore).toBe(8.5)
    expect(result.finalizedAt).toBeDefined()

    const stored = getStoredGrading(examId, attemptId)
    expect(stored?.confirmed).toBe(true)
    expect(stored?.finalScore).toBe(8.5)
    expect(stored?.scores).toEqual(draft.scores)
  })

  it('loads candidate attempt detail with stored or demo defaults', async () => {
    const detail = await gradingRepository.getAttemptDetail(examId, attemptId)
    expect(detail.attemptId).toBe(attemptId)
    expect(detail.examId).toBe(examId)
    expect(detail.criteria).toBeDefined()
    expect(detail.transcript).toBeDefined()
  })
})

