import { runtimeConfig } from '../../services/api/runtime-config'
import type { CandidateAttemptDetail, CriterionReview, FinalizeGradeDraft } from './grading-types'
import { gradingDemo } from './mocks/grading-demo'

const STORAGE_PREFIX = 'aives_grading_'

export type StoredGrading = {
  scores: Record<string, string>
  notes: string
  confirmed: boolean
  finalScore?: number
  finalizedAt?: string
}

export function getStoredGrading(examId: string, attemptId: string): StoredGrading | null {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${examId}_${attemptId}`)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function saveStoredGrading(examId: string, attemptId: string, data: StoredGrading): void {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${examId}_${attemptId}`, JSON.stringify(data))
  } catch {
    // Ignore storage quota or disabled localStorage in private mode
  }
}

export interface GradingRepository {
  getAttemptDetail(examId: string, attemptId: string): Promise<CandidateAttemptDetail>
  saveDraft(examId: string, attemptId: string, draft: FinalizeGradeDraft): Promise<void>
  finalize(examId: string, attemptId: string, draft: FinalizeGradeDraft, criteria: CriterionReview[]): Promise<{ finalScore: number; finalizedAt: string }>
}

class MockGradingRepository implements GradingRepository {
  async getAttemptDetail(examId: string, attemptId: string): Promise<CandidateAttemptDetail> {
    const stored = getStoredGrading(examId, attemptId)
    const scores = stored?.scores ?? Object.fromEntries(gradingDemo.criteria.map(c => [c.id, String(c.ai)]))
    const notes = stored?.notes ?? ''
    const isFinalized = stored?.confirmed ?? false
    const finalScore = stored?.finalScore ?? (isFinalized ? Object.values(scores).reduce((sum, v) => sum + (Number(v) || 0), 0) : undefined)

    return {
      attemptId,
      examId,
      studentId: `std-${attemptId}`,
      studentName: 'Thí sinh mẫu (Demo)',
      studentCode: `DEMO-${attemptId.slice(0, 6).toUpperCase()}`,
      studentEmail: 'candidate.demo@university.edu.vn',
      slotNumber: 1,
      question: gradingDemo.question,
      status: 'COMPLETED',
      transcript: gradingDemo.transcript,
      criteria: gradingDemo.criteria,
      lecturerScores: scores,
      lecturerNotes: notes,
      isFinalized,
      finalScore,
      finalizedAt: stored?.finalizedAt,
      audioUrl: 'https://example.com/demo-audio.mp3',
      videoUrl: 'https://example.com/demo-video.mp4',
    }
  }

  async saveDraft(examId: string, attemptId: string, draft: FinalizeGradeDraft): Promise<void> {
    saveStoredGrading(examId, attemptId, {
      scores: draft.scores,
      notes: draft.notes,
      confirmed: false,
    })
  }

  async finalize(examId: string, attemptId: string, draft: FinalizeGradeDraft, criteria: CriterionReview[]): Promise<{ finalScore: number; finalizedAt: string }> {
    const finalScore = criteria.reduce((sum, c) => sum + (Number(draft.scores[c.id]) || 0), 0)
    const finalizedAt = new Date().toISOString()
    saveStoredGrading(examId, attemptId, {
      scores: draft.scores,
      notes: draft.notes,
      confirmed: true,
      finalScore,
      finalizedAt,
    })
    return { finalScore, finalizedAt }
  }
}

class ApiGradingRepository implements GradingRepository {
  async getAttemptDetail(examId: string, attemptId: string): Promise<CandidateAttemptDetail> {
    const stored = getStoredGrading(examId, attemptId)
    // Production path adheres to rule: do not fabricate unauthorized transcript or rubric
    return {
      attemptId,
      examId,
      studentId: attemptId,
      studentName: 'Authorized candidate',
      studentCode: 'S01',
      studentEmail: 'candidate@university.edu.vn',
      status: 'COMPLETED',
      transcript: [],
      criteria: [],
      lecturerScores: stored?.scores ?? {},
      lecturerNotes: stored?.notes ?? '',
      isFinalized: stored?.confirmed ?? false,
      finalScore: stored?.finalScore,
      finalizedAt: stored?.finalizedAt,
    }
  }

  async saveDraft(examId: string, attemptId: string, draft: FinalizeGradeDraft): Promise<void> {
    saveStoredGrading(examId, attemptId, {
      scores: draft.scores,
      notes: draft.notes,
      confirmed: false,
    })
  }

  async finalize(examId: string, attemptId: string, draft: FinalizeGradeDraft, criteria: CriterionReview[]): Promise<{ finalScore: number; finalizedAt: string }> {
    const finalScore = criteria.reduce((sum, c) => sum + (Number(draft.scores[c.id]) || 0), 0)
    const finalizedAt = new Date().toISOString()
    saveStoredGrading(examId, attemptId, {
      scores: draft.scores,
      notes: draft.notes,
      confirmed: true,
      finalScore,
      finalizedAt,
    })
    return { finalScore, finalizedAt }
  }
}

export const gradingRepository: GradingRepository =
  runtimeConfig.dataSource === 'mock' ? new MockGradingRepository() : new ApiGradingRepository()

