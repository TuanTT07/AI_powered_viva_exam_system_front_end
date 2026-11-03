import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { Button } from "../../../components/ui/primitives";
import { InlineNotice } from "../../../components/common/inline-notice";
import { UnsavedChangesGuard } from "../../../components/common/unsaved-changes-guard";
import type { StudentExamSlot } from "../../exams/api-student-exam-repository";
import { useOnline } from "../../../hooks/use-online";
import { useSpeechAnswer } from "../use-speech-answer";
import { speechDraft, type SpeechPhase } from "../speech-session-model";
import { VivaSessionView } from "./VivaSessionView";
import type { InterviewPrompt } from "../interview-api";
import type { AnswerReceipt } from "../speech-api";
import { studentExamPath } from "../../exams/student-exam-navigation";
import type { TranscriptMessageProps } from "../components/TranscriptMessage";

const phases: Record<SpeechPhase, string> = {
  idle: "Chưa kết nối speech",
  connecting: "Đang xác minh lượt hỏi và kết nối",
  ready: "Sẵn sàng trả lời",
  speaking: "Đang đọc câu hỏi",
  starting: "Đang mở micro và chờ máy chủ",
  recording: "Đang thu âm",
  finalizing: "Đang xác nhận lưu câu trả lời",
  checking: "Đang tra cứu kết quả lưu",
  saved: "Câu trả lời đã được lưu",
  disconnected: "Mất kết nối",
  error: "Cần kiểm tra lại kết nối",
};
export function ApiSpeechRoom({
  slot,
  prompt,
  onBusyChange,
  onAnswerSaved,
  userId,
  name,
  history = [],
  isProcessing = false,
}: {
  slot: StudentExamSlot;
  prompt: InterviewPrompt;
  onBusyChange: (busy: boolean) => void;
  onAnswerSaved: (receipt?: AnswerReceipt | null) => void;
  userId: string;
  name: string;
  history?: TranscriptMessageProps[];
  isProcessing?: boolean;
}) {
  const questionTurnId = prompt.questionTurnId;
  const { state, connect, speak, start, stop, clearStaleAnswer } = useSpeechAnswer(
    slot.attemptId,
    questionTurnId,
    userId,
    true,
  );
  const online = useOnline();

  // Accumulate history dialogue with current prompt and student receipt
  const transcript: TranscriptMessageProps[] = [...history];
  const hasPrompt = transcript.some(
    (t) => t.id === prompt.questionTurnId || (t.role === "ai" && t.text === prompt.text)
  );
  if (!hasPrompt) {
    transcript.push({
      id: prompt.questionTurnId,
      role: "ai",
      text: prompt.text,
      timestamp: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
    });
  }
  if (state.receipt) {
    const hasReceipt = transcript.some(
      (t) =>
        t.id === state.receipt?.transcriptTurnId ||
        (t.role === "student" && t.text === state.receipt?.text)
    );
    if (!hasReceipt) {
      transcript.push({
        id: state.receipt.transcriptTurnId,
        role: "student",
        text: state.receipt.text,
        timestamp: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
      });
    }
  }

  const draft = speechDraft(state);
  const awaiting =
    ["starting", "recording", "finalizing", "checking"].includes(state.phase) ||
    (!!state.answerId && !state.receipt);
  const busy = awaiting || ["connecting", "speaking"].includes(state.phase);
  useEffect(() => { onBusyChange(busy); }, [busy, onBusyChange]);
  useEffect(() => () => onBusyChange(false), [onBusyChange]);
  useEffect(() => {
    if (state.phase === "saved") onAnswerSaved(state.receipt);
  }, [state.phase, state.receipt, onAnswerSaved]);
  const retry = ["idle", "disconnected", "error"].includes(state.phase);
  return (
    <>
      <UnsavedChangesGuard when={awaiting} />
      <VivaSessionView
        name={name}
        title={slot.examTitle}
        question={
          isProcessing ? (
            <div className="py-6 space-y-2 text-center">
              <div className="inline-flex p-3 rounded-full bg-blue-50 text-blue-600 animate-spin mb-1">
                <Sparkles size={22} />
              </div>
              <h4 className="text-sm font-bold text-slate-900">
                Giám khảo AI đang xử lý câu trả lời...
              </h4>
              <p className="text-xs text-slate-500">
                Vui lòng chờ hệ thống cấp lượt hỏi tiếp theo hoặc xác nhận hoàn tất.
              </p>
            </div>
          ) : (
            prompt.text
          )
        }
        phase={isProcessing ? "Hệ thống đang xử lý lượt thi" : phases[state.phase]}
        timer={
          <AnswerCountdown
            key={state.deadline ?? prompt.deadlineAt ?? "none"}
            deadline={state.deadline ?? prompt.deadlineAt}
          />
        }
        timerLabel="Thời gian trả lời"
        progress={`Ca ${slot.slotNumber}`}
        transcript={transcript}
        connection={
          !online
            ? "Mất kết nối mạng"
            : [
                  "ready",
                  "speaking",
                  "starting",
                  "recording",
                  "finalizing",
                ].includes(state.phase)
              ? "Đã kết nối speech"
              : state.phase === "saved"
                ? "Đã nhận biên nhận lưu"
                : "Chưa kết nối speech"
        }
        notice={
          <div className="space-y-2">
            {state.error && <InlineNotice>{state.error}</InlineNotice>}
            {state.phase === "saved" ? (
              <InlineNotice>
                Câu trả lời đã được hệ thống xác nhận lưu. Hệ thống đang đồng bộ lượt hỏi tiếp theo.
              </InlineNotice>
            ) : (
              <InlineNotice>
                Âm thanh được gửi trong lúc thu. Câu trả lời chỉ được coi là đã
                lưu khi hệ thống xác nhận.
              </InlineNotice>
            )}
          </div>
        }
        draft={
          draft ? (
            <div className="rounded-lg bg-slate-50 p-4 text-sm">
              <p className="text-xs font-semibold text-slate-500 mb-2">
                {state.phase === "recording"
                  ? "Đang nhận diện · chưa xác nhận lưu"
                  : "Transcript chưa xác nhận lưu"}
              </p>
              <p className="whitespace-pre-wrap">{draft}</p>
            </div>
          ) : undefined
        }
        controls={
          isProcessing ? (
            <>
              <Button disabled>Đang chờ hệ thống…</Button>
              <Link
                className="button outline"
                to={studentExamPath(slot.examId, slot.attemptId)}
              >
                Về ca thi
              </Link>
            </>
          ) : (
            <>
              {retry && (
                <>
                  <Button disabled={!online} onClick={() => { onBusyChange(true); void connect(); }}>
                    {state.answerId
                      ? "Kiểm tra câu trả lời đã lưu"
                      : state.phase === "idle"
                        ? "Kết nối speech"
                        : "Kết nối lại"}
                  </Button>
                  {state.answerId && (
                    <Button variant="outline" onClick={clearStaleAnswer}>
                      Bỏ qua &amp; thu lại
                    </Button>
                  )}
                </>
              )}
              {state.phase === "ready" && (
                <>
                  <Button
                    variant="outline"
                    disabled={!online}
                    onClick={() => { onBusyChange(true); void speak(); }}
                  >
                    Đọc câu hỏi
                  </Button>
                  <Button disabled={!online} onClick={() => { onBusyChange(true); void start(); }}>
                    Bắt đầu trả lời
                  </Button>
                </>
              )}
              {state.phase === "recording" && (
                <Button onClick={() => void stop()}>Kết thúc câu trả lời</Button>
              )}
              {["connecting", "starting", "finalizing", "checking"].includes(
                state.phase,
              ) && <Button disabled>{phases[state.phase]}…</Button>}
              <Link
                className="button outline"
                to={studentExamPath(slot.examId, slot.attemptId)}
              >
                Về ca thi
              </Link>
            </>
          )
        }
      />
    </>
  );
}

function AnswerCountdown({ deadline }: { deadline: string | null }) {
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    if (!deadline) return;
    const timer = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(timer);
  }, [deadline]);
  if (!deadline) return "—";
  const remaining = Math.max(0, Math.ceil((Date.parse(deadline) - now) / 1000));
  return `${String(Math.floor(remaining / 60)).padStart(2, "0")}:${String(remaining % 60).padStart(2, "0")}`;
}
