import { useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Mic,
  Volume2,
  Clock,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  AlertCircle,
  WifiOff,
  Radio,
  FileText,
  ShieldCheck,
} from 'lucide-react';
import { useSession } from '../../../app/providers/use-session';
import { AudioVisualizer } from '../components/AudioVisualizer';
import { TranscriptMessage } from '../components/TranscriptMessage';
import { useVivaSession } from '../use-viva-session';
import type { VivaPhase } from '../viva-session-machine';

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

function PhaseIndicator({ phase }: { phase: VivaPhase }) {
  switch (phase) {
    case 'AI_SPEAKING':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">
          <Volume2 className="w-3.5 h-3.5 animate-pulse" /> Giám khảo AI đang nói
        </span>
      );
    case 'WAITING_FOR_ANSWER':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
          <Clock className="w-3.5 h-3.5" /> Tới lượt bạn
        </span>
      );
    case 'RECORDING':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 animate-pulse">
          <Mic className="w-3.5 h-3.5" /> Đang ghi âm câu trả lời
        </span>
      );
    case 'AI_PROCESSING':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-800 border border-indigo-200">
          <Sparkles className="w-3.5 h-3.5 animate-spin" /> AI đang phân tích
        </span>
      );
    case 'COMPLETING':
    case 'COMPLETED':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">
          Đang hoàn tất phiên thi
        </span>
      );
    case 'MIC_ERROR':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200">
          <AlertCircle className="w-3.5 h-3.5" /> Lỗi micro
        </span>
      );
    case 'AI_ERROR':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200">
          <AlertCircle className="w-3.5 h-3.5" /> Lỗi AI
        </span>
      );
    case 'SESSION_DISCONNECTED':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200">
          <WifiOff className="w-3.5 h-3.5" /> Mất kết nối
        </span>
      );
    case 'TIMEOUT':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200">
          <Clock className="w-3.5 h-3.5" /> Hết thời gian
        </span>
      );
    default:
      return null;
  }
}

export function VivaInterviewRoom() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { session } = useSession();
  const {
    state,
    notice,
    reconnectError,
    startAnswer,
    stopAnswer,
    retryAi,
    retryMic,
    reconnect,
    endEarly,
  } = useVivaSession(examId);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { phase } = state;

  useEffect(() => {
    if (phase === 'COMPLETED') {
      navigate(`/student/exams/${examId}/completed`, { replace: true });
    }
  }, [phase, examId, navigate]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView?.({ behavior: 'smooth' });
  }, [state.transcript, state.partialAnswer]);

  if (phase === 'PREPARING') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-xs">
        <div className="w-10 h-10 border-3 border-[var(--soft)] border-t-[var(--navy)] rounded-full animate-spin mb-4" />
        <h2 className="text-xl font-serif font-bold text-[var(--navy-dark)] mb-2">Đang thiết lập phòng thi vấn đáp...</h2>
        <p className="text-sm text-stone-600 max-w-md">
          Hệ thống đang khởi tạo kênh âm thanh hai chiều và kết nối với Giám khảo AI. Vui lòng giữ kết nối mạng ổn định.
        </p>
      </div>
    );
  }

  if (phase === 'LOAD_FAILED') {
    return (
      <div role="alert" className="max-w-xl mx-auto p-8 bg-[var(--surface)] border border-rose-200 rounded-2xl shadow-xs text-center">
        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 mx-auto flex items-center justify-center mb-4">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-serif font-bold text-[var(--navy-dark)] mb-2">Không thể mở phiên vấn đáp</h1>
        <p className="text-sm text-stone-600 mb-6">{state.error}</p>
        <button
          className="inline-flex items-center justify-center px-5 py-2.5 bg-[var(--navy)] hover:bg-[var(--navy-dark)] text-white font-medium rounded-xl text-sm transition-colors shadow-xs"
          onClick={() => navigate(`/student/exams/${examId}`)}
        >
          Quay lại kỳ thi
        </button>
      </div>
    );
  }

  const isRecording = phase === 'RECORDING';
  const inputLocked = phase !== 'WAITING_FOR_ANSWER' && phase !== 'RECORDING';
  const lowTime = state.timeLeftSeconds < 60;

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Header Card - Exam Session Information */}
      <section className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold tracking-tight text-[var(--navy-dark)] mb-2">
            Phòng thi Vấn đáp Trực tiếp
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-xs md:text-sm text-stone-600">
            <span>
              Thí sinh: <strong className="text-[var(--navy-dark)] font-semibold">{session.user?.displayName || 'Sinh viên'}</strong>
            </span>
            <span className="text-[var(--border)]">•</span>
            <span className="flex items-center gap-1">
              Mã đề:{' '}
              <span className="font-mono font-bold bg-[var(--muted)] text-stone-800 px-2 py-0.5 rounded border border-[var(--border)]">
                EXAM-{examId || 'TEST'}
              </span>
            </span>
            <span className="text-[var(--border)]">•</span>
            <span className="inline-flex items-center gap-1.5 font-semibold text-xs text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
              <HelpCircle className="w-3.5 h-3.5" />
              Hỏi thêm: {state.followUpCount}/{state.maxFollowUps} lần
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-4 md:pt-0 border-[var(--border)]">
          <div className="flex flex-col items-start md:items-end bg-[var(--muted)]/40 px-4 py-2 rounded-xl border border-[var(--border)]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
              Thời gian còn lại
            </span>
            <span
              aria-label="Thời gian còn lại"
              className={`text-2xl md:text-3xl font-mono font-bold tracking-tight ${
                lowTime ? 'text-rose-600 animate-pulse' : 'text-[var(--navy-dark)]'
              }`}
            >
              {formatTime(state.timeLeftSeconds)}
            </span>
          </div>

          <button
            className={`inline-flex items-center justify-center font-medium rounded-xl text-sm transition-all px-4 py-2.5 ${
              phase === 'TIMEOUT'
                ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs animate-bounce'
                : 'border border-rose-300 text-rose-700 hover:bg-rose-50 hover:border-rose-400'
            }`}
            onClick={() => void endEarly()}
            disabled={phase === 'COMPLETING'}
          >
            {phase === 'TIMEOUT' ? 'Nộp bài' : 'Nộp bài sớm'}
          </button>
        </div>
      </section>

      {/* 2. Alert notifications */}
      {phase === 'MIC_ERROR' && (
        <div role="alert" className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-sm font-semibold text-rose-900 block">Không thể sử dụng micro.</strong>
              <p className="text-xs text-rose-700 mt-0.5">{state.error}</p>
            </div>
          </div>
          <button
            className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold transition-colors shrink-0"
            onClick={retryMic}
          >
            Thử lại
          </button>
        </div>
      )}

      {phase === 'AI_ERROR' && (
        <div role="alert" className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-sm font-semibold text-rose-900 block">Hệ thống AI gặp sự cố.</strong>
              <p className="text-xs text-rose-700 mt-0.5">{state.error} Bản ghi câu trả lời hiện tại được giữ nguyên.</p>
            </div>
          </div>
          <button
            className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold transition-colors shrink-0"
            onClick={() => void retryAi()}
          >
            Thử lại
          </button>
        </div>
      )}

      {phase === 'SESSION_DISCONNECTED' && (
        <div role="alert" className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <WifiOff className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-sm font-semibold text-rose-900 block">Mất kết nối máy chủ.</strong>
              <p className="text-xs text-rose-700 mt-0.5">
                Các thao tác trả lời đã tạm dừng. Trạng thái sẽ được đồng bộ lại từ máy chủ khi kết nối trở lại.
              </p>
              {reconnectError && <div className="text-xs text-rose-600 mt-1 font-semibold">{reconnectError}</div>}
            </div>
          </div>
          <button
            className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold transition-colors shrink-0"
            onClick={() => void reconnect()}
          >
            Kết nối lại
          </button>
        </div>
      )}

      {phase === 'TIMEOUT' && (
        <div role="alert" className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3">
          <Clock className="w-5 h-5 text-amber-600 shrink-0" />
          <p className="text-sm text-amber-900">
            <strong>Đã hết thời gian làm bài.</strong> Vui lòng nhấn &quot;Nộp bài&quot; để kết thúc phiên thi vấn đáp.
          </p>
        </div>
      )}

      {notice && (
        <div role="status" className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-900">
          {notice}
        </div>
      )}

      {/* 3. AI Oral Studio - Interactivity Center */}
      <section className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-xs overflow-hidden">
        {/* Studio Status Bar */}
        <div className="px-6 py-3.5 bg-[var(--muted)]/50 border-b border-[var(--border)] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isRecording
                  ? 'bg-rose-500 animate-ping'
                  : phase === 'AI_SPEAKING'
                  ? 'bg-indigo-600'
                  : 'bg-stone-400'
              }`}
            />
            <span className="text-xs font-semibold text-stone-700">
              {isRecording
                ? 'Đang ghi nhận giọng nói của bạn...'
                : phase === 'AI_SPEAKING'
                ? 'Giám khảo AI đang đặt câu hỏi'
                : phase === 'AI_PROCESSING'
                ? 'Hệ thống đang xử lý câu trả lời'
                : 'Micro đang ở trạng thái chờ'}
            </span>
          </div>

          <PhaseIndicator phase={phase} />
        </div>

        {/* Studio Stage */}
        <div className="p-8 md:p-10 flex flex-col items-center gap-6 bg-gradient-to-b from-white to-[var(--bg)]/30">
          <AudioVisualizer
            isActive={phase === 'AI_SPEAKING' || isRecording}
            status={phase === 'AI_SPEAKING' ? 'ai_speaking' : isRecording ? 'student_speaking' : 'idle'}
          />

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 w-full">
            <button
              type="button"
              onClick={() => void startAnswer()}
              disabled={phase !== 'WAITING_FOR_ANSWER'}
              className={`inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl font-medium text-sm transition-all shadow-xs ${
                phase === 'WAITING_FOR_ANSWER'
                  ? 'bg-[var(--navy)] hover:bg-[var(--navy-dark)] text-white cursor-pointer active:scale-95'
                  : 'bg-stone-100 text-stone-400 border border-stone-200 cursor-not-allowed'
              }`}
            >
              <Mic className="w-4 h-4" />
              <span>Bắt đầu trả lời</span>
            </button>

            <button
              type="button"
              onClick={() => void stopAnswer()}
              disabled={!isRecording}
              className={`inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl font-medium text-sm transition-all shadow-xs ${
                isRecording
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer active:scale-95 animate-pulse'
                  : 'bg-stone-100 text-stone-400 border border-stone-200 cursor-not-allowed'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Hoàn tất câu trả lời</span>
            </button>
          </div>

          {/* Prompt status guidance */}
          <div className="text-xs text-stone-500 text-center min-h-[20px]">
            {inputLocked && phase === 'AI_PROCESSING' && (
              <span role="status" className="inline-flex items-center gap-2 text-indigo-700 font-medium">
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                Giám khảo AI đang phân tích lập luận và chuẩn bị câu hỏi tiếp theo...
              </span>
            )}
            {phase === 'WAITING_FOR_ANSWER' && (
              <span className="text-amber-800 font-medium">
                💡 Đã đến lượt bạn. Nhấn &quot;Bắt đầu trả lời&quot; để bật micro và trình bày ý kiến.
              </span>
            )}
            {isRecording && (
              <span className="text-emerald-700 font-medium">
                🎙️ Micro đang thu âm. Trình bày rõ ràng và nhấn &quot;Hoàn tất câu trả lời&quot; khi xong.
              </span>
            )}
            {phase === 'AI_SPEAKING' && (
              <span className="text-blue-800 font-medium">
                🔊 Giám khảo AI đang trình bày câu hỏi. Vui lòng chú ý lắng nghe.
              </span>
            )}
          </div>
        </div>
      </section>

      {/* 4. Live Oral Transcript */}
      <section className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-xs p-6 flex flex-col min-h-[320px]">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[var(--soft)]/50 text-[var(--navy)] flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-serif font-bold text-[var(--navy-dark)]">
                Biên bản hội thoại (Transcript)
              </h2>
              <p className="text-xs text-stone-500">
                Ghi nhận trực tiếp theo thời gian thực để đảm bảo tính khách quan và minh bạch
              </p>
            </div>
          </div>

          {isRecording && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 animate-pulse">
              <Radio className="w-3.5 h-3.5" />
              Bản nháp trực tiếp
            </span>
          )}
        </div>

        <div className="flex-1 overflow-y-auto max-h-[420px] pr-2 space-y-1">
          {state.transcript.map((msg) => (
            <TranscriptMessage
              key={msg.id}
              role={msg.role}
              text={msg.text}
              timestamp={msg.timestamp}
              isFollowUp={msg.isFollowUp}
            />
          ))}

          {isRecording && state.partialAnswer && (
            <TranscriptMessage
              role="student"
              text={state.partialAnswer}
              timestamp=""
              isPartial
            />
          )}

          <div style={{ height: '8px' }} ref={scrollRef} />
        </div>
      </section>

      {/* 5. Exam Rules & Integrity Assurance Card */}
      <div className="bg-[var(--muted)]/40 border border-[var(--border)] rounded-xl p-4 text-xs text-stone-600 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
        <div>
          <strong className="text-stone-800 block mb-0.5">Quy chế phòng thi vấn đáp bảo mật AIVES</strong>
          <p className="text-stone-600 leading-relaxed">
            Mọi diễn biến âm thanh và câu trả lời trong phiên thi được mã hóa và lưu trữ an toàn. Điểm số đề xuất bởi AI sẽ được giảng viên đối soát và xác nhận cuối cùng trước khi công bố.
          </p>
        </div>
      </div>
    </div>
  );
}
