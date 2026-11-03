import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../../components/ui/primitives";
import { InlineNotice } from "../../../components/common/inline-notice";
import { UnsavedChangesGuard } from "../../../components/common/unsaved-changes-guard";
import type { StudentExamSlot } from "../../exams/api-student-exam-repository";
import { useOnline } from "../../../hooks/use-online";
import { useSpeechAnswer } from "../use-speech-answer";
import { speechDraft, type SpeechPhase } from "../speech-session-model";
import { VivaSessionView } from "./VivaSessionView";
import type { InterviewPrompt } from "../interview-api";
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
}: {
  slot: StudentExamSlot;
  prompt: InterviewPrompt;
  onBusyChange: (busy: boolean) => void;
  onAnswerSaved: () => void;
  userId: string;
  name: string;
}) {
  const questionTurnId = prompt.questionTurnId;
  const { state, connect, speak, start, stop } = useSpeechAnswer(
    slot.attemptId,
    questionTurnId,
    userId,
    true,
  );
  const online = useOnline();
  const transcript: TranscriptMessageProps[] = [];
  transcript.push({
      id: prompt.questionTurnId,
      role: "ai",
      text: prompt.text,
      timestamp: "",
    });
  if (state.receipt)
    transcript.push({
      id: state.receipt.transcriptTurnId,
      role: "student",
      text: state.receipt.text,
      timestamp: "",
    });
  const draft = speechDraft(state);
  const awaiting =
    ["starting", "recording", "finalizing", "checking"].includes(state.phase) ||
    (!!state.answerId && !state.receipt);
  const busy = awaiting || ["connecting", "speaking"].includes(state.phase);
  useEffect(() => { onBusyChange(busy); }, [busy, onBusyChange]);
  useEffect(() => () => onBusyChange(false), [onBusyChange]);
  useEffect(() => { if (state.phase === "saved") onAnswerSaved(); }, [state.phase, onAnswerSaved]);
  const retry = ["idle", "disconnected", "error"].includes(state.phase);
  return (
    <>
      <UnsavedChangesGuard when={awaiting} />
      <VivaSessionView
        name={name}
        title={slot.examTitle}
        question={prompt.text}
        phase={phases[state.phase]}
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
          <>
            {retry && (
              <Button disabled={!online} onClick={() => { onBusyChange(true); void connect(); }}>
                {state.answerId
                  ? "Kiểm tra câu trả lời đã lưu"
                  : state.phase === "idle"
                    ? "Kết nối speech"
                    : "Kết nối lại"}
              </Button>
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
