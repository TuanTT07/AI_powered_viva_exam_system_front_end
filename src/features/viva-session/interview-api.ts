import { apiClient, ApiError, type ApiClient } from '../../services/api/client'
import { unwrapApiEnvelope, type ApiEnvelope } from '../../services/api/transport-types'
import { isSpeechUuid } from './speech-api'

export type InterviewPrompt = {
  questionAttemptId: string
  questionTurnId: string
  text: string
  deadlineAt: string | null
}
export type InterviewState = {
  attemptId: string
  status: 'READY' | 'AWAITING_ANSWER' | 'PROCESSING' | 'COMPLETED'
  prompt: InterviewPrompt | null
}

function validate(value: InterviewState, attemptId: string) {
  if (!value || value.attemptId !== attemptId || !['READY', 'AWAITING_ANSWER', 'PROCESSING', 'COMPLETED'].includes(value.status)) {
    throw new ApiError('Trạng thái phiên thi không hợp lệ.', { code: 'INVALID_RESPONSE' })
  }
  if (value.status === 'AWAITING_ANSWER') {
    const prompt = value.prompt
    if (!prompt || !isSpeechUuid(prompt.questionTurnId) || !isSpeechUuid(prompt.questionAttemptId)
      || typeof prompt.text !== 'string' || !prompt.text.trim()
      || (prompt.deadlineAt !== null && (typeof prompt.deadlineAt !== 'string' || !Number.isFinite(Date.parse(prompt.deadlineAt))))) {
      throw new ApiError('Lượt hỏi hiện tại không hợp lệ.', { code: 'INVALID_RESPONSE' })
    }
  } else if (value.prompt != null) {
    throw new ApiError('Phản hồi chứa lượt hỏi không khớp trạng thái.', { code: 'INVALID_RESPONSE' })
  }
  return value
}

export function createInterviewApi(client: Pick<ApiClient, 'request'> = apiClient) {
  async function request(attemptId: string, command: 'current' | 'start', signal?: AbortSignal) {
    if (!isSpeechUuid(attemptId)) throw new ApiError('Mã lượt thi không hợp lệ.', { code: 'INVALID_UUID' })
    const result = await client.request<ApiEnvelope<InterviewState>>(`/api/interviews/${attemptId}/${command}`, {
      method: command === 'start' ? 'POST' : 'GET', signal,
    })
    return validate(unwrapApiEnvelope(result), attemptId)
  }
  return {
    current: (attemptId: string, signal?: AbortSignal) => request(attemptId, 'current', signal),
    start: (attemptId: string) => request(attemptId, 'start'),
  }
}
export const interviewApi = createInterviewApi()
