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
  id: string | null
  questionAttemptId: string
  questionId: string
  questionContent: string
  gradedById: string | null
  gradedByName: string | null
  aiSuggestedScore: number | null
  finalScore: number | null
  maxScore: number
  overallFeedback: string | null
  aiOverallFeedback: string | null
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

export type StudentResultDto = {
  questionAttemptId: string
  questionOrder: number
  questionContent: string | null
  finalScore: number
  maxScore: number
  feedback: string | null
  criteria: CriterionScoreDto[]
  transcript: TranscriptTurnDto[]
  audioUrl: string | null
  publishedAt: string
}

export type AttemptQuestionGradingDto = {
  questionOrder: number
  questionStatus: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED'
  evaluation: EvaluationResponseDto
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
    async attemptQuestions(examId: string, attemptId: string): Promise<AttemptQuestionGradingDto[]> {
      const res = await client.request<ApiResponse<AttemptQuestionGradingDto[]>>(
        `/api/exams/${encodeURIComponent(examId)}/attempts/${encodeURIComponent(attemptId)}/grading`
      )
      if (!Array.isArray(res.data) || res.data.some(q => !q.evaluation || q.evaluation.examAttemptId !== attemptId))
        throw new Error('Danh sách câu hỏi không khớp lượt thi.')
      return res.data
    },
    async studentResultSummary(attemptId: string): Promise<{ totalQuestions: number; questions: StudentResultDto[] }> {
      const res = await client.request<ApiResponse<{ totalQuestions: number; questions: StudentResultDto[] }>>(
        `/api/v1/student/exams/${encodeURIComponent(attemptId)}/result-summary`
      )
      if (!Number.isInteger(res.data.totalQuestions) || res.data.totalQuestions < 1 || !Array.isArray(res.data.questions))
        throw new Error('Kết quả lượt thi không hợp lệ.')
      return res.data
    },
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

    async studentResults(attemptId: string, signal?: AbortSignal): Promise<StudentResultDto[]> {
      const res = await client.request<ApiResponse<StudentResultDto[]>>(
        `/api/v1/student/exams/${encodeURIComponent(attemptId)}/results`,
        signal ? { signal } : undefined
      )
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
