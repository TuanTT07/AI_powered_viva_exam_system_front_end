import { apiClient, ApiError } from "../../services/api/client";
import {
  unwrapApiEnvelope,
  type ApiEnvelope,
} from "../../services/api/transport-types";
export type QuestionPlayback = {
  questionTurnId: string;
  text: string;
  ttsProvider: "browser";
  language: string;
};
export type SpeechTicket = {
  ticket: string;
  expiresAt: string;
  websocketPath: string;
};
export type AnswerReceipt = { transcriptTurnId: string; text: string };
export const isSpeechUuid = (v: unknown): v is string =>
  typeof v === "string" && /^[a-f\d]{8}(-[a-f\d]{4}){3}-[a-f\d]{12}$/i.test(v);
function path(attemptId: string) {
  if (!isSpeechUuid(attemptId)) throw new ApiError("Mã lượt thi không hợp lệ.");
  return `/api/interview/attempts/${attemptId}`;
}
export const speechApi = {
  async playback(
    attemptId: string,
    turnId: string,
    signal?: AbortSignal,
  ): Promise<QuestionPlayback> {
    if (!isSpeechUuid(turnId)) throw new ApiError("Chưa có lượt hỏi hợp lệ.");
    const data = unwrapApiEnvelope(
      await apiClient.request<ApiEnvelope<QuestionPlayback>>(
        `${path(attemptId)}/speech/questions/${turnId}/playback`,
        { signal },
      ),
    );
    if (
      !data ||
      data.questionTurnId !== turnId ||
      typeof data.text !== "string" ||
      !data.text.trim() ||
      data.ttsProvider !== "browser" ||
      typeof data.language !== "string" ||
      !/^vi(?:-|$)/i.test(data.language)
    )
      throw new ApiError("Dữ liệu đọc câu hỏi không hợp lệ.");
    return data;
  },
  async ticket(attemptId: string, signal?: AbortSignal): Promise<SpeechTicket> {
    const data = unwrapApiEnvelope(
      await apiClient.request<ApiEnvelope<SpeechTicket>>(
        `${path(attemptId)}/speech-ticket`,
        { method: "POST", signal },
      ),
    );
    if (
      !data ||
      typeof data.ticket !== "string" ||
      !data.ticket ||
      data.websocketPath !== "/ws/interview/speech" ||
      !Number.isFinite(Date.parse(data.expiresAt))
    )
      throw new ApiError("Ticket speech không hợp lệ hoặc đã hết hạn.");
    return data;
  },
  async answer(
    attemptId: string,
    answerId: string,
    signal?: AbortSignal,
  ): Promise<AnswerReceipt> {
    if (!isSpeechUuid(answerId))
      throw new ApiError("Mã câu trả lời không hợp lệ.");
    const data = unwrapApiEnvelope(
      await apiClient.request<ApiEnvelope<AnswerReceipt>>(
        `${path(attemptId)}/speech/answers/${answerId}`,
        { signal },
      ),
    );
    if (
      !data ||
      !isSpeechUuid(data.transcriptTurnId) ||
      typeof data.text !== "string" ||
      !data.text.trim()
    )
      throw new ApiError("Biên nhận câu trả lời không hợp lệ.");
    return data;
  },
};
