import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Mic, Volume2, RotateCcw, RefreshCw, LogOut, Square } from "lucide-react";
import { Button, Dialog } from "../../../components/ui/primitives";
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
  idle: "Chưa kết nối âm thanh",
  connecting: "Đang xác minh lượt hỏi và kết nối",
  ready: "Sẵn sàng trả lời",
  speaking: "Đang chuẩn bị và phát audio câu hỏi",
  starting: "Đang mở micro thu âm",
  recording: "Đang thu âm câu trả lời",
  finalizing: "Đang xác nhận lưu câu trả lời",
  checking: "Đang tra cứu kết quả lưu",
  saved: "Câu trả lời đã được lưu",
  disconnected: "Mất kết nối âm thanh",
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
  const navigate = useNavigate();
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const [answerResetNotice, setAnswerResetNotice] = useState(false);
  const questionTurnId = prompt.questionTurnId;
  const { state, clientDraft, audioLevel, connect, speak, start, stop, restartAnswer } = useSpeechAnswer(
    slot.attemptId,
    questionTurnId,
    userId,
    true,
  );
  const online = useOnline();

  const [currentTime] = useState(() =>
    new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
  );

  const draft = speechDraft(state) || clientDraft;
  const handleRestartAnswer = async () => {
    setAnswerResetNotice(true);
    await restartAnswer();
  };

  // Accumulate history dialogue with current prompt and student receipt
  const transcript: TranscriptMessageProps[] = [...history];
  const hasPrompt = transcript.some(
    (t) =>
      t.role === "ai" &&
      (t.id === `ai-${prompt.questionTurnId}` ||
        t.id === prompt.questionTurnId)
  );
  if (!hasPrompt) {
    transcript.push({
      id: `ai-${prompt.questionTurnId}`,
      role: "ai",
      text: prompt.text,
      timestamp: currentTime,
    });
  }
  const currentReceipt = state.receipt;
  if (currentReceipt) {
    const hasReceipt = transcript.some(
      (t) =>
        t.role === "student" &&
        ((currentReceipt.transcriptTurnId &&
          (t.id === currentReceipt.transcriptTurnId ||
            t.id === `student-${currentReceipt.transcriptTurnId}`)))
    );
    if (!hasReceipt) {
      transcript.push({
        id: `student-${currentReceipt.transcriptTurnId || prompt.questionTurnId}`,
        role: "student",
        text: currentReceipt.text,
        timestamp: currentTime,
      });
    }
  }

  const awaiting =
    ["starting", "recording", "finalizing", "checking"].includes(state.phase) ||
    (!!state.answerId && !state.receipt);
  const busy = awaiting || ["connecting", "speaking"].includes(state.phase);
  useEffect(() => { onBusyChange(busy); }, [busy, onBusyChange]);
  useEffect(() => () => onBusyChange(false), [onBusyChange]);
  useEffect(() => {
    if (state.phase === "saved" && state.receipt) onAnswerSaved(state.receipt);
  }, [state.phase, state.receipt, onAnswerSaved]);
  const retry = ["idle", "disconnected", "error"].includes(state.phase);

  const turnCount = transcript.filter((entry) => entry.role === "ai").length;
  const startTimeFormatted = slot.scheduledStartTime
    ? new Date(slot.scheduledStartTime).toLocaleString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "—";
  const durationFormatted =
    slot.scheduledStartTime && slot.scheduledEndTime
      ? `${Math.round((Date.parse(slot.scheduledEndTime) - Date.parse(slot.scheduledStartTime)) / 60000)} phút`
      : "—";
  const slotCodeFormatted =
    slot.accessCode ||
    (slot.courseCode
      ? `${slot.courseCode}-${String(slot.slotNumber ?? 1).padStart(3, "0")}`
      : slot.slotNumber
        ? `AIVES-CA-${slot.slotNumber}`
        : "—");

  return (
    <>
      <UnsavedChangesGuard when={awaiting} />
      <VivaSessionView
        name={name}
        title={slot.examTitle}
        courseName={slot.courseName || slot.examTitle || "—"}
        slotCode={slotCodeFormatted}
        startTime={startTimeFormatted}
        duration={durationFormatted}
        currentStep={turnCount}
        totalSteps={turnCount}
        liveTurns
        questionConfig={slot.examConfig}
        isRecording={state.phase === "recording"}
        isAiSpeaking={state.phase === "speaking"}
        isProcessing={isProcessing}
        audioLevel={state.phase === "recording" ? audioLevel : 0}
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
        phase={isProcessing ? "Hệ thống đang xử lý lượt thi"
          : answerResetNotice && state.phase === "finalizing" ? "Đang hủy bản thu"
          : phases[state.phase]}
        timer={
          <TurnQuestionCountdown
            key={state.phase === "recording" ? state.deadline : prompt.questionTurnId}
            turnDeadline={state.phase === "recording" ? state.deadline : null}
            isProcessing={isProcessing || ["finalizing", "checking", "saved"].includes(state.phase)}
          />
        }
        timerLabel="Thời gian trả lời"
        progress={`Ca ${slot.slotNumber ?? 1}`}
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
              ? "Đã kết nối âm thanh phòng thi"
              : state.phase === "saved"
                ? "Đã nhận biên nhận lưu"
                : "Chưa kết nối âm thanh phòng thi"
        }
        notice={
          <div className="space-y-2">
            {state.error && (
              <InlineNotice>
                <span className="font-semibold text-red-700">Lưu ý: </span>
                {state.error}
              </InlineNotice>
            )}
            {answerResetNotice && state.phase === "ready" && (
              <InlineNotice>
                🔄 <strong>Đã hủy bản thu trước.</strong> Hãy nhấn <strong>Bắt đầu trả lời</strong> khi bạn sẵn sàng nói lại.
              </InlineNotice>
            )}
            {state.phase === "saved" ? (
              <InlineNotice>
                ✅ Câu trả lời đã được hệ thống xác nhận lưu. Hệ thống đang đồng bộ lượt hỏi tiếp theo.
              </InlineNotice>
            ) : state.phase === "recording" ? (
              <InlineNotice>
                🎙️ Micro đang thu âm trực tiếp. Hãy nói rõ ràng, tự tin. Nhấn <strong>Xác nhận câu trả lời</strong> khi nói xong, hoặc <strong>Bắt sai? Trả lời lại</strong> nếu cần nói lại từ đầu.
              </InlineNotice>
            ) : (
              <InlineNotice>
                Âm thanh được gửi trong lúc thu. Hãy nhấn <strong>Bắt đầu trả lời</strong> khi sẵn sàng.
              </InlineNotice>
            )}
          </div>
        }
        draft={
          draft ? (
            <div className="rounded-xl bg-blue-50/60 border border-blue-200/80 p-4 text-sm space-y-2 shadow-2xs">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                  <span>
                    {state.phase === "recording"
                      ? "Nội dung đang nhận diện trực tiếp"
                      : "Bản ghi âm câu trả lời"}
                  </span>
                </p>
                <span className="text-[11px] font-semibold text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded-full">
                  {state.phase === "recording" ? "Đang thu âm" : "Chưa xác nhận lưu"}
                </span>
              </div>
              <p className="text-slate-900 font-medium leading-relaxed whitespace-pre-wrap min-h-[44px]">
                {draft}
              </p>
              {state.phase === "recording" && (
                <div className="pt-2 border-t border-blue-100/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
                  <span>Hệ thống nhận diện giọng nói tiếng Việt theo thời gian thực.</span>
                  <span className="text-amber-700 font-semibold">
                    Nhận diện chưa chuẩn? Nhấn "Bắt sai? Trả lời lại" bên dưới
                  </span>
                </div>
              )}
            </div>
          ) : state.phase === "recording" ? (
            <div className="rounded-xl bg-slate-50 border border-dashed border-slate-300 p-4 text-sm text-center text-slate-500">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-blue-600 mb-1">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                <span>Đang lắng nghe... Hãy bắt đầu trình bày câu trả lời của bạn</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Văn bản nhận diện sẽ hiển thị tại đây ngay khi bạn cất tiếng nói.
              </p>
            </div>
          ) : undefined
        }
        controls={
          isProcessing ? (
            <>
              <Button disabled className="inline-flex items-center gap-1.5">
                <Sparkles size={14} className="animate-spin" />
                <span>Đang chờ hệ thống…</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => setLeaveDialogOpen(true)}
                className="text-slate-500 hover:text-slate-700 ml-auto inline-flex items-center gap-1.5"
              >
                <LogOut size={14} />
                <span>Rời phòng thi</span>
              </Button>
            </>
          ) : (
            <>
              {retry && (
                <>
                  <Button
                    aria-label={state.answerId ? "Kiểm tra câu trả lời đã lưu" : "Kết nối speech"}
                    disabled={!online}
                    onClick={() => {
                      onBusyChange(true);
                      void connect();
                    }}
                    className="inline-flex items-center gap-1.5"
                  >
                    <RefreshCw size={14} />
                    <span>
                      {state.answerId
                        ? "Kiểm tra câu trả lời đã lưu"
                        : state.phase === "idle"
                          ? "Kết nối âm thanh phòng thi"
                          : "Kết nối lại âm thanh"}
                    </span>
                  </Button>
                </>
              )}
              {state.phase === "ready" && (
                <>
                  <Button
                    variant="outline"
                    disabled={!online}
                    onClick={() => {
                      onBusyChange(true);
                      void speak();
                    }}
                    className="inline-flex items-center gap-1.5"
                  >
                    <Volume2 size={15} className="text-blue-600" />
                    <span>Nghe câu hỏi</span>
                  </Button>
                  <Button
                    disabled={!online}
                    onClick={() => {
                      setAnswerResetNotice(false);
                      onBusyChange(true);
                      void start();
                    }}
                    className="inline-flex items-center gap-1.5"
                  >
                    <Mic size={15} />
                    <span>Bắt đầu trả lời</span>
                  </Button>
                </>
              )}
              {state.phase === "recording" && (
                <>
                  <Button
                    aria-label="Xác nhận câu trả lời"
                    onClick={() => void stop()}
                    className="border border-slate-300 hover:bg-slate-50 font-bold text-slate-800 bg-white inline-flex items-center gap-2 shadow-2xs px-5 py-2"
                  >
                    <Square size={13} className="fill-slate-800 text-slate-800" />
                    <span>Xác nhận câu trả lời</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => void handleRestartAnswer()}
                    className="border-amber-300 text-amber-800 hover:bg-amber-50 inline-flex items-center gap-1.5"
                  >
                    <RotateCcw size={15} className="text-amber-600" />
                    <span>Bắt sai? Trả lời lại</span>
                  </Button>
                </>
              )}
              {["connecting", "starting", "finalizing", "checking"].includes(
                state.phase,
              ) && (
                <Button disabled className="inline-flex items-center gap-1.5">
                  <Sparkles size={14} className="animate-spin" />
                  <span>{phases[state.phase]}…</span>
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => setLeaveDialogOpen(true)}
                className="text-slate-500 hover:text-slate-700 ml-auto inline-flex items-center gap-1.5"
              >
                <LogOut size={14} />
                <span>Rời phòng thi</span>
              </Button>
            </>
          )
        }
      />
      <Dialog
        open={leaveDialogOpen}
        onClose={() => setLeaveDialogOpen(false)}
        title="Tạm rời phòng thi vấn đáp?"
      >
        <div className="space-y-4 p-1">
          <p className="text-sm text-slate-600 leading-relaxed">
            Phiên thi của bạn vẫn đang diễn ra. Bạn có thể quay lại phòng thi bất kỳ lúc nào nếu ca thi vẫn còn trong khung giờ hiệu lực.
          </p>
          <div className="flex justify-end gap-2.5 pt-2">
            <Button variant="outline" onClick={() => setLeaveDialogOpen(false)}>
              Ở lại tiếp tục thi
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                setLeaveDialogOpen(false);
                navigate(studentExamPath(slot.examId, slot.attemptId));
              }}
            >
              Xác nhận rời phòng
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  );
}

function TurnQuestionCountdown({
  turnDeadline,
  isProcessing,
}: {
  turnDeadline: string | null;
  isProcessing: boolean;
}) {
  const deadline = turnDeadline ? Date.parse(turnDeadline) : NaN;
  const ticking = Number.isFinite(deadline) && !isProcessing;
  const [now, setNow] = useState(Date.now);

  useEffect(() => {
    if (!ticking) return;
    const timer = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(timer);
  }, [ticking, deadline]);

  if (isProcessing) return <span className="text-sm font-semibold text-blue-600">Đang xử lý...</span>;
  if (!ticking) return <span className="text-sm font-semibold">Chưa bắt đầu</span>;

  const remaining = Math.max(0, Math.ceil((deadline - now) / 1000));
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const isUrgent = remaining <= 15 && remaining > 0;
  return (
    <span className={isUrgent ? "text-red-600 animate-pulse font-mono" : "font-mono"}>
      {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
    </span>
  );
}
