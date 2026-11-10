export type CriterionReview = {
  id: string
  name: string
  max: number
  ai: number
  evidence: string
  description?: string
}

export type EvidenceLine = {
  id?: string
  role: 'ai' | 'student' | string
  text: string
  time?: string
  audioUrl?: string
  turnType?: 'MAIN_QUESTION' | 'FOLLOW_UP' | 'ANSWER'
}

export type CandidateAttemptDetail = {
  attemptId: string
  examId: string
  studentId: string
  studentName: string
  studentCode: string
  studentEmail: string
  slotNumber?: number
  question?: string
  status: 'SCHEDULED' | 'READY' | 'IN_PROGRESS' | 'COMPLETED' | 'ABSENT' | 'CANCELLED' | string
  transcript: EvidenceLine[]
  criteria: CriterionReview[]
  aiOverallComment?: string
  lecturerScores?: Record<string, string>
  lecturerNotes?: string
  isFinalized?: boolean
  finalScore?: number
  finalizedAt?: string
  audioUrl?: string
  videoUrl?: string
}

export type FinalizeGradeDraft = {
  scores: Record<string, string>
  notes: string
  confirmed: boolean
}
