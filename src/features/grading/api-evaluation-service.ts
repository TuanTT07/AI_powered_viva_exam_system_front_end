import { apiClient, type ApiClient } from '../../services/api/client'

export type ApiResponse<T> = {
  success: boolean
  status: number
  message: string
  data: T
}

export type PageResponse<T> = {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export type CriterionScoreDto = {
  criterionId: string
  criterionName: string
  maxScore: number
  aiScore: number | null
  finalScore: number | null
  comment: string | null
}

export type TranscriptTurnDto = {
  id: string
  turnOrder: number
  speaker: 'AI' | 'STUDENT'
  textContent: string
  audioUrl: string | null
  turnType: 'MAIN_QUESTION' | 'ANSWER' | 'FOLLOW_UP'
  createdAt: string
}

export type EvaluationResponseDto = {
  id: string
  questionAttemptId: string
  questionId: string
  questionContent: string
  gradedById: string | null
  gradedByName: string | null
  aiSuggestedScore: number | null
  finalScore: number | null
  maxScore: number
  overallFeedback: string | null
  criteria: CriterionScoreDto[]
  status: 'PENDING_REVIEW' | 'GRADED'
  transcript?: TranscriptTurnDto[]
  audioUrl?: string | null
  createdAt: string
  updatedAt: string
  publishedAt?: string | null
  examAttemptId?: string | null
  studentId?: string | null
  studentName?: string | null
  studentCode?: string | null
}

export type CriterionFinalScoreRequest = {
  criterionId: string
  finalScore: number
  comment?: string | null
}

export type FinalizeEvaluationRequest = {
  criteria: CriterionFinalScoreRequest[]
  overallFeedback?: string | null
}

export function createApiEvaluationService(client: Pick<ApiClient, 'request'> = apiClient) {
  return {
    async getByQuestionAttempt(questionAttemptId: string): Promise<EvaluationResponseDto> {
      const res = await client.request<ApiResponse<EvaluationResponseDto>>(
        `/api/question-attempts/${encodeURIComponent(questionAttemptId)}/evaluation`
      )
      return res.data
    },

    async gradeWithAi(questionAttemptId: string): Promise<EvaluationResponseDto> {
      const res = await client.request<ApiResponse<EvaluationResponseDto>>(
        `/api/question-attempts/${encodeURIComponent(questionAttemptId)}/evaluation/ai-grade`,
        { method: 'POST' }
      )
      return res.data
    },

    async finalizeEvaluation(
      questionAttemptId: string,
      request: FinalizeEvaluationRequest
    ): Promise<EvaluationResponseDto> {
      const res = await client.request<ApiResponse<EvaluationResponseDto>>(
        `/api/question-attempts/${encodeURIComponent(questionAttemptId)}/evaluation/final`,
        { method: 'PUT', body: request }
      )
      return res.data
    },

    async publish(questionAttemptId: string): Promise<void> {
      await client.request(
        `/api/question-attempts/${encodeURIComponent(questionAttemptId)}/evaluation/publish`,
        { method: 'PUT' },
      )
    },

    async studentResults(attemptId: string, signal?: AbortSignal) {
      const res = await client.request<ApiResponse<{
        questionAttemptId?: string
        maxScore?: number
        questionOrder: number
        questionContent?: string | null
        transcript?: TranscriptTurnDto[]
        finalScore: number
        feedback: string | null
        publishedAt: string
      }[]>>(`/api/v1/student/exams/${encodeURIComponent(attemptId)}/results`, signal ? { signal } : undefined)
      return res.data
    },

    async findByCourse(
      courseId: string,
      params?: { status?: string; page?: number; size?: number }
    ): Promise<PageResponse<EvaluationResponseDto>> {
      const res = await client.request<ApiResponse<PageResponse<EvaluationResponseDto>>>(
        `/api/courses/${encodeURIComponent(courseId)}/evaluations`,
        {
          query: {
            status: params?.status,
            page: params?.page ?? 0,
            size: params?.size ?? 20,
          },
        }
      )
      return res.data
    },

    async findByExam(
      examId: string,
      params?: { status?: string; page?: number; size?: number }
    ): Promise<PageResponse<EvaluationResponseDto>> {
      const res = await client.request<ApiResponse<PageResponse<EvaluationResponseDto>>>(
        `/api/exams/${encodeURIComponent(examId)}/evaluations`,
        {
          query: {
            status: params?.status,
            page: params?.page ?? 0,
            size: params?.size ?? 20,
          },
        }
      )
      return res.data
    },
  }
}

export const apiEvaluationService = createApiEvaluationService()
