import { useEffect, useRef, useState, type ReactNode } from 'react'
import {
  BookOpen,
  Bot,
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  FileText,
  Headphones,
  Info,
  Layers,
  LayoutGrid,
  Mic,
  Monitor,
  User,
  Video,
  Volume2,
  Wifi,
} from 'lucide-react'
import { TranscriptMessage, type TranscriptMessageProps } from '../components/TranscriptMessage'
import { useOnline } from '../../../hooks/use-online'

function DeviceTile({
  icon,
  label,
  status,
  ok,
  onClick,
  title,
}: {
  icon: ReactNode
  label: string
  status: string
  ok: boolean
  onClick?: () => void
  title?: string
}) {
  const content = (
    <>
      <div className="flex items-center gap-2">
        <div
          className={`w-7 h-7 rounded-lg flex items-center justify-center ${
            ok ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
          }`}
        >
          {icon}
        </div>
        <div className="text-left">
          <p className="text-xs font-bold text-slate-800 leading-tight">{label}</p>
          <p className="text-[10px] text-slate-500">{status}</p>
        </div>
      </div>
      {ok ? (
        <CheckCircle2 size={13} className="text-emerald-500 fill-emerald-100 shrink-0" />
      ) : (
        <Circle size={13} className="text-slate-300 shrink-0" />
      )}
    </>
  )
  const base = 'p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between w-full'
  return onClick ? (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`${base} cursor-pointer hover:bg-slate-100/80 transition-colors`}
    >
      {content}
    </button>
  ) : (
    <div className={base}>{content}</div>
  )
}

function BotFaceIcon({ className = 'w-14 h-14' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Head */}
      <rect x="12" y="16" width="40" height="34" rx="16" fill="white" />
      {/* Antenna */}
      <line x1="32" y1="6" x2="32" y2="16" stroke="white" strokeWidth="3" strokeLinecap="round" />
      <circle cx="32" cy="5" r="3.5" fill="#38BDF8" />
      {/* Screen face */}
      <rect x="16" y="22" width="32" height="22" rx="10" fill="#1E3A8A" />
      {/* Smiling eyes */}
      <path d="M22 32 C23 29, 27 29, 28 32" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M36 32 C37 29, 41 29, 42 32" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      {/* Ear pods */}
      <rect x="8" y="27" width="4" height="12" rx="2" fill="white" />
      <rect x="52" y="27" width="4" height="12" rx="2" fill="white" />
    </svg>
  )
}

function WaveformBars({ active = false, count = 10 }: { active?: boolean; count?: number }) {
  const heights = [20, 45, 75, 95, 60, 85, 45, 65, 35, 15, 55, 30]
  return (
    <div className="flex items-center gap-1 h-10 overflow-hidden">
      {heights.slice(0, count).map((h, i) => (
        <span
          key={i}
          className={`w-1 rounded-full transition-all duration-150 ${
            active ? 'bg-blue-500 animate-pulse' : 'bg-blue-200/80'
          }`}
          style={{
            height: active ? `${Math.max(16, h * (0.6 + ((i % 3) * 0.2)))}%` : `${h * 0.35}%`,
            animationDelay: `${(i * 0.08).toFixed(2)}s`,
          }}
        />
      ))}
    </div>
  )
}

function StudentWaveformBars({
  active = false,
  level = 0,
  side = 'left',
}: {
  active?: boolean
  level?: number
  side?: 'left' | 'right'
}) {
  const barHeights = [20, 35, 55, 75, 95, 75]
  const dotsCount = 5
  const safeLevel = Math.max(0, Math.min(1, level))
  const isVocalizing = active && safeLevel > 0.04

  if (side === 'left') {
    return (
      <div className="flex items-center gap-1.5 h-10 overflow-hidden">
        {Array.from({ length: dotsCount }).map((_, i) => {
          const dotNearBars = i >= 3
          const dotActive = isVocalizing && dotNearBars && safeLevel > 0.25
          return (
            <span
              key={`dot-${i}`}
              className={`w-1 h-1 rounded-full transition-all duration-150 ${
                dotActive
                  ? 'bg-blue-500 scale-125'
                  : active
                    ? 'bg-blue-400'
                    : 'bg-blue-300'
              }`}
            />
          )
        })}
        {barHeights.map((h, i) => {
          const multiplier = 0.85 + ((i % 3) * 0.12)
          const barHeightPercent = active
            ? Math.min(100, Math.max(12, Math.round(h * (0.2 + safeLevel * 0.85 * multiplier))))
            : Math.max(10, Math.round(h * 0.35))

          return (
            <span
              key={`bar-${i}`}
              className={`w-1 rounded-full transition-all duration-75 ease-out ${
                isVocalizing ? 'bg-blue-600 shadow-2xs' : active ? 'bg-blue-400/90' : 'bg-blue-300'
              }`}
              style={{
                height: `${barHeightPercent}%`,
              }}
            />
          )
        })}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1.5 h-10 overflow-hidden">
      {[...barHeights].reverse().map((h, i) => {
        const revIndex = barHeights.length - 1 - i
        const multiplier = 0.85 + ((revIndex % 3) * 0.12)
        const barHeightPercent = active
          ? Math.min(100, Math.max(12, Math.round(h * (0.2 + safeLevel * 0.85 * multiplier))))
          : Math.max(10, Math.round(h * 0.35))

        return (
          <span
            key={`bar-${i}`}
            className={`w-1 rounded-full transition-all duration-75 ease-out ${
              isVocalizing ? 'bg-blue-600 shadow-2xs' : active ? 'bg-blue-400/90' : 'bg-blue-300'
            }`}
            style={{
              height: `${barHeightPercent}%`,
            }}
          />
        )
      })}
      {Array.from({ length: dotsCount }).map((_, i) => {
        const dotNearBars = i <= 1
        const dotActive = isVocalizing && dotNearBars && safeLevel > 0.25
        return (
          <span
            key={`dot-${i}`}
            className={`w-1 h-1 rounded-full transition-all duration-150 ${
              dotActive
                ? 'bg-blue-500 scale-125'
                : active
                  ? 'bg-blue-400'
                  : 'bg-blue-300'
            }`}
          />
        )
      })}
    </div>
  )
}

function SoundWaveIcon({ className = 'text-blue-600' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-0.5 ${className}`}>
      <span className="w-0.5 h-2 bg-current rounded-full" />
      <span className="w-0.5 h-3.5 bg-current rounded-full" />
      <span className="w-0.5 h-2.5 bg-current rounded-full" />
      <span className="w-0.5 h-1.5 bg-current rounded-full" />
    </span>
  )
}

export function VivaSessionView({
  name,
  title,
  phase,
  timer,
  progress: _progress,
  question,
  transcript,
  notice,
  controls,
  connection,
  draft,
  courseName,
  slotCode,
  startTime,
  duration,
  currentStep = 1,
  totalSteps = 3,
  liveTurns = false,
  questionConfig,
  isRecording = false,
  isAiSpeaking = false,
  isCompleted: isCompletedProp,
  isProcessing = false,
  audioLevel = 0,
}: {
  name: string
  title: string
  phase: string
  timer: ReactNode
  progress: string
  question?: ReactNode
  transcript: TranscriptMessageProps[]
  notice: ReactNode
  controls: ReactNode
  connection: string
  draft?: ReactNode
  timerLabel?: string
  courseName?: string
  slotCode?: string
  startTime?: string
  duration?: string
  currentStep?: number
  totalSteps?: number
  liveTurns?: boolean
  questionConfig?: { maxMainQuestions?: number; maxFollowUpQuestions?: number }
  isRecording?: boolean
  isAiSpeaking?: boolean
  isCompleted?: boolean
  isProcessing?: boolean
  audioLevel?: number
}) {
  const completed =
    isCompletedProp ??
    (phase.toLowerCase().includes('hoàn tất') ||
      phase.toLowerCase().includes('kết thúc') ||
      phase.toLowerCase().includes('completed'))
  const safeCurrentStep = Math.max(1, currentStep)
  const safeTotalSteps = Math.max(safeCurrentStep, totalSteps, 1)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [cameraActive, setCameraActive] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const streamRef = useRef<MediaStream | null>(null)
  const [recordingSeconds, setRecordingSeconds] = useState(0)
  const online = useOnline()

  useEffect(() => {
    if (!isRecording) return
    const interval = setInterval(() => {
      setRecordingSeconds((prev) => prev + 1)
    }, 1000)
    return () => {
      clearInterval(interval)
      setRecordingSeconds(0)
    }
  }, [isRecording])

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60)
    const s = sec % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    setCameraActive(false)
  }

  const startCamera = async () => {
    try {
      if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
        return
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      setCameraActive(true)
    } catch {
      setCameraActive(false)
    }
  }

  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  const displayCourse = courseName || title || '—'
  const displaySlotCode = slotCode || '—'
  const displayStartTime = startTime || '—'
  const displayDuration = duration || '—'

  return (
    <section className="source-screen max-w-7xl mx-auto viva-room p-3 md:p-6 space-y-4">
      {/* Main 2-Column Grid matching mockup exactly */}
      <div className="grid lg:grid-cols-12 gap-5 items-start">
        {/* Left Column (Main Interview Workflow): ~65% width (col-span-8) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Top Header Row matching mockup */}
          <header className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0 shadow-xs">
              <Mic size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
                  {completed ? (
                    <>
                      Phiên thi vấn đáp <span className="text-blue-600">AI</span> đã kết thúc
                    </>
                  ) : (
                    <>
                      Đang thi vấn đáp <span className="text-blue-600">AI</span>
                    </>
                  )}
                </h1>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                  <span className={`w-2 h-2 rounded-full bg-emerald-500 ${completed ? '' : 'animate-pulse'}`} />
                  <span>{completed ? 'Đã hoàn thành' : 'Đang diễn ra'}</span>
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                {completed
                  ? 'Cảm ơn bạn đã hoàn thành ca thi. Bạn có thể xem lại tình trạng kết quả bên dưới.'
                  : 'Phiên thi đang diễn ra. Hãy lắng nghe câu hỏi từ Giám khảo AI và trả lời rõ ràng, mạch lạc.'}
              </p>
            </div>
          </header>

          {notice}

          {/* Card 1: Giám khảo AI Card (ẩn sau khi phiên thi hoàn tất) */}
          {!completed && (
          <section className="rounded-2xl border border-slate-200/80 bg-gradient-to-b from-white via-white to-blue-50/20 p-5 md:p-6 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                  <Bot size={20} />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 leading-tight">Giám khảo AI</h2>
                  <p className="text-xs text-slate-500">Hệ thống giám khảo thông minh của AIVES</p>
                </div>
              </div>
            </div>

            {/* Glowing Bot Avatar with Waveform animation */}
            <div className="py-4 flex flex-col items-center justify-center">
              <div className="flex items-center justify-center gap-4 sm:gap-8 w-full max-w-md px-2">
                <WaveformBars active={isAiSpeaking} count={10} />

                <div className="relative shrink-0">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-b from-blue-100/90 to-indigo-100/50 p-2.5 flex items-center justify-center shadow-inner">
                    <div className="w-full h-full rounded-full bg-gradient-to-tr from-blue-600 via-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
                      <BotFaceIcon className="w-14 h-14 sm:w-16 sm:h-16" />
                    </div>
                  </div>
                </div>

                <WaveformBars active={isAiSpeaking} count={10} />
              </div>

              {/* Status pill below avatar */}
              <div className="mt-3.5 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50/90 border border-blue-200/80 text-blue-700 text-xs font-semibold shadow-2xs">
                <SoundWaveIcon className="text-blue-600" />
                <span>
                  {isAiSpeaking
                    ? 'AI đang đặt câu hỏi'
                    : isRecording
                      ? 'AI đang lắng nghe câu trả lời của bạn'
                      : phase || 'AI đang đặt câu hỏi'}
                </span>
              </div>
            </div>
          </section>
          )}

          {/* Card 2: Câu hỏi Card / Hoàn thành */}
          <section
            className={`rounded-2xl border p-4 md:p-5 flex items-start gap-3.5 shadow-xs ${
              completed
                ? 'border-emerald-200/70 bg-gradient-to-r from-emerald-50/40 via-teal-50/20 to-emerald-50/30'
                : 'border-blue-200/70 bg-[#f0f6ff]'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-xl text-white flex items-center justify-center shrink-0 font-bold text-base shadow-xs ${
                completed ? 'bg-emerald-600' : 'bg-blue-600'
              }`}
            >
              {completed ? <CheckCircle2 size={18} /> : '?'}
            </div>
            <div className="space-y-1 flex-1">
              <h3
                className={`text-xs font-bold tracking-wide uppercase ${
                  completed ? 'text-emerald-700' : 'text-blue-600'
                }`}
              >
                {completed ? 'Hoàn thành phiên thi' : liveTurns ? `Lượt hỏi ${safeCurrentStep}` : `Câu hỏi (Câu ${safeCurrentStep}/${safeTotalSteps})`}
              </h3>
              <div className="text-base md:text-lg font-bold text-slate-900 leading-snug">
                {question || 'Chờ câu hỏi được hệ thống cấp quyền.'}
              </div>
            </div>
          </section>

          {/* Sau khi hoàn tất: không còn mic/hướng dẫn trả lời, chỉ thông báo và các hành động tiếp theo */}
          {completed && (
            <section className="rounded-2xl border border-emerald-200/70 bg-white p-5 md:p-6 space-y-4 shadow-sm">
              <div className="flex items-start gap-3 rounded-xl bg-emerald-50/60 border border-emerald-100 px-4 py-3 text-xs text-emerald-800">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Phiên thi đã kết thúc và câu trả lời của bạn đã được hệ thống ghi nhận. Điểm AI chỉ mang tính gợi ý;
                  kết quả chính thức chỉ hiển thị sau khi giảng viên xác nhận và công bố.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3">{controls}</div>
            </section>
          )}

          {/* Card 3: Câu trả lời của bạn Card */}
          {!completed && (
          <section className="rounded-2xl border border-slate-200/80 bg-white p-5 md:p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <Mic size={18} className="text-blue-600" />
                <span>Câu trả lời của bạn</span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1">
                <Info size={13} />
                <span>Hãy trả lời ngắn gọn, rõ ràng và đúng trọng tâm.</span>
              </p>
            </div>

            {/* Student Microphone Visualizer & Controls */}
            <div className="py-2 flex flex-col items-center justify-center space-y-3">
              <div className="flex items-center justify-center gap-3 sm:gap-6 w-full max-w-md px-2">
                <StudentWaveformBars active={isRecording} level={audioLevel} side="left" />

                <div className="relative shrink-0">
                  <div
                    className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-all duration-75 shadow-md ${
                      isRecording
                        ? 'bg-blue-600 text-white shadow-blue-500/30 ring-4 ring-blue-100'
                        : 'bg-blue-50 text-blue-600 border border-blue-200'
                    }`}
                    style={{
                      transform:
                        isRecording && audioLevel > 0.04
                          ? `scale(${Math.min(1.15, 1.05 + audioLevel * 0.12)})`
                          : isRecording
                            ? 'scale(1.05)'
                            : 'scale(1)',
                      boxShadow:
                        isRecording && audioLevel > 0.06
                          ? `0 0 ${Math.round(10 + audioLevel * 22)}px rgba(37, 99, 235, 0.45)`
                          : undefined,
                    }}
                  >
                    <Mic size={24} />
                  </div>
                </div>

                <StudentWaveformBars active={isRecording} level={audioLevel} side="right" />
              </div>

              <div className="text-center">
                <div className="inline-flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-700">
                    {completed
                      ? 'Đã hoàn thành ca thi'
                      : isRecording
                        ? audioLevel > 0.05
                          ? 'Đang nhận diện giọng nói...'
                          : 'Đang lắng nghe câu trả lời...'
                        : 'Sẵn sàng trả lời'}
                  </span>
                  {isRecording && !completed && (
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                      {formatSeconds(recordingSeconds)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Live recognized draft content */}
            {draft}

            {/* Action buttons (controls) */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-3 border-t border-slate-100">
              {controls}
            </div>

            {/* Listening bar footer inside answer card */}
            <div className="rounded-xl px-4 py-2.5 flex items-center justify-between text-xs border bg-blue-50/60 border-blue-100 text-blue-700">
              <div className="flex items-center gap-2">
                <Headphones size={15} />
                <span>
                  {isRecording
                    ? 'AI đang lắng nghe câu trả lời của bạn...'
                    : 'Hệ thống sẵn sàng thu nhận câu trả lời.'}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          </section>
          )}

          {/* Collapsible Transcript History Section */}
          <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
            <button
              type="button"
              onClick={() => setHistoryOpen(!historyOpen)}
              className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-700 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <FileText size={15} className="text-blue-600" />
                <span>Biên bản hội thoại đã ghi nhận ({transcript.length} lượt)</span>
              </div>
              <span className="text-blue-600 text-xs font-medium lowercase">
                {historyOpen ? 'Thu gọn' : 'Xem chi tiết'}
              </span>
            </button>

            {historyOpen && (
              <div className="max-h-[360px] overflow-y-auto space-y-3 mt-4 pt-3 border-t border-slate-100 pr-1">
                {transcript.map((line, index) => (
                  <TranscriptMessage key={line.id ?? `${line.role}-${index}`} {...line} />
                ))}
                {!transcript.length && (
                  <p className="text-xs text-slate-400 text-center py-4">Chưa có lượt hội thoại nào.</p>
                )}
              </div>
            )}
          </section>
        </div>

        {/* Right Sidebar Column: ~35% width (col-span-4) */}
        <aside className="lg:col-span-4 space-y-4">
          {/* Card 1: Thời gian còn lại Card (top right in mockup) */}
          <div className="rounded-2xl bg-gradient-to-r from-blue-50/90 via-indigo-50/60 to-blue-50/90 border border-blue-100 p-4 md:p-5 flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2.5 text-slate-700 font-bold text-xs sm:text-sm">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <Clock size={18} />
              </div>
              <span>Thời gian còn lại:</span>
            </div>
            <span className="font-mono text-2xl md:text-3xl font-extrabold text-blue-600 tracking-tight">
              {timer}
            </span>
          </div>

          {/* Card 2: Tiến trình phiên thi */}
          <section className="rounded-2xl border border-slate-200/80 bg-white p-4 md:p-5 space-y-3.5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-800">
                <Layers size={16} className="text-blue-600" />
                <span>Tiến trình phiên thi</span>
              </div>
              <span className="text-xs font-bold text-slate-400">
                {liveTurns ? `${totalSteps} lượt hỏi` : completed ? `${safeTotalSteps}/${safeTotalSteps} câu` : `${safeCurrentStep}/${safeTotalSteps} câu`}
              </span>
            </div>

            {liveTurns && questionConfig?.maxMainQuestions !== undefined &&
              questionConfig.maxFollowUpQuestions !== undefined && (
                <p className="text-xs text-slate-600">
                  {questionConfig.maxMainQuestions} câu chính · Tối đa {questionConfig.maxFollowUpQuestions} câu đào sâu mỗi câu chính
                </p>
              )}

            {/* Progress bar */}
            {!liveTurns && <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-300"
                style={{
                  width: completed
                    ? '100%'
                    : `${Math.min(100, Math.max(10, (safeCurrentStep / safeTotalSteps) * 100))}%`,
                }}
              />
            </div>}

            {/* Question Step List */}
            <div className="space-y-2 pt-1 text-xs max-h-[320px] overflow-y-auto pr-1">
              {Array.from({ length: liveTurns ? totalSteps : safeTotalSteps }).map((_, idx) => {
                const qNum = idx + 1
                const isDone = completed ? true : qNum < safeCurrentStep
                const isCurrent = !completed && qNum === safeCurrentStep
                return (
                  <div
                    key={qNum}
                    className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                      isCurrent
                        ? 'bg-blue-50/60 border-blue-200 font-bold text-blue-900 shadow-2xs'
                        : isDone
                          ? 'bg-slate-50/60 border-slate-100 text-slate-700 font-medium'
                          : 'border-transparent text-slate-400 font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {isDone ? (
                        <CheckCircle2 size={16} className="text-emerald-500 fill-emerald-100 shrink-0" />
                      ) : isCurrent ? (
                        <div className="w-4 h-4 rounded-full border-2 border-blue-600 flex items-center justify-center shrink-0">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                        </div>
                      ) : (
                        <Circle size={16} className="text-slate-300 shrink-0" />
                      )}
                      <span>Câu {qNum}</span>
                    </div>
                    <div>
                      {isDone ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-700 text-[11px] font-semibold">
                          Đã hoàn thành
                        </span>
                      ) : isCurrent ? (
                        <span className="px-2 py-0.5 rounded-full bg-blue-100 border border-blue-200/60 text-blue-800 text-[11px] font-semibold">
                          {isProcessing ? 'Đang xử lý' : isRecording || !liveTurns ? 'Đang trả lời' : 'Chờ trả lời'}
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400">Chưa diễn ra</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

          {/* Card 3: Thông tin ca thi */}
          <section className="rounded-2xl border border-slate-200/80 bg-white p-4 md:p-5 space-y-3 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2.5">
              <FileText size={16} className="text-blue-600" />
              <span>Thông tin ca thi</span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Môn thi</span>
                <span className="text-slate-900 font-semibold flex items-center gap-1.5">
                  <BookOpen size={13} className="text-slate-400" />
                  {displayCourse}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Vai trò</span>
                <span className="text-slate-900 font-semibold flex items-center gap-1.5" title={name}>
                  <User size={13} className="text-slate-400" />
                  Thí sinh
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Thời gian bắt đầu</span>
                <span className="text-slate-900 font-semibold flex items-center gap-1.5">
                  <Calendar size={13} className="text-slate-400" />
                  {displayStartTime}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Thời lượng</span>
                <span className="text-slate-900 font-semibold flex items-center gap-1.5">
                  <Clock size={13} className="text-slate-400" />
                  {displayDuration}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Mã ca thi</span>
                <span className="text-slate-900 font-mono font-bold flex items-center gap-1.5">
                  <LayoutGrid size={13} className="text-slate-400" />
                  {displaySlotCode}
                </span>
              </div>
            </div>
          </section>

          {/* Card 4: Thiết bị & kết nối */}
          <section className="rounded-2xl border border-slate-200/80 bg-white p-4 md:p-5 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-800">
                <Monitor size={16} className="text-blue-600" />
                <span>Thiết bị &amp; kết nối</span>
              </div>
              {!completed && (
                <button
                  type="button"
                  onClick={() => {
                    if (cameraActive) stopCamera()
                    else void startCamera()
                  }}
                  className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
                >
                  {cameraActive ? 'Tắt cam' : 'Bật cam'}
                </button>
              )}
            </div>

            {/* Optional video stream preview if turned on */}
            {cameraActive && (
              <div className="aspect-video bg-slate-950 rounded-xl overflow-hidden relative shadow-inner">
                <video
                  ref={(node) => {
                    videoRef.current = node
                    if (node && streamRef.current && node.srcObject !== streamRef.current) {
                      node.srcObject = streamRef.current
                    }
                  }}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover -scale-x-100"
                />
                <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/60 text-[10px] text-white font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  <span>Trực tiếp</span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 pt-1">
              {/* Mic */}
              <DeviceTile
                icon={<Mic size={14} />}
                label="Mic"
                status={
                  isRecording
                    ? 'Đang thu'
                    : connection.includes('Đã kết nối')
                      ? 'Sẵn sàng'
                      : completed
                        ? 'Đã đóng'
                        : 'Chưa mở'
                }
                ok={isRecording || connection.includes('Đã kết nối')}
              />

              {/* Loa */}
              <DeviceTile
                icon={<Volume2 size={14} />}
                label="Loa"
                status={isAiSpeaking ? 'Đang phát' : completed ? 'Đã đóng' : 'Sẵn sàng'}
                ok={isAiSpeaking || (!completed && online)}
              />

              {/* Camera */}
              <DeviceTile
                icon={<Video size={14} />}
                label="Camera"
                status={cameraActive ? 'Đang mở' : 'Đang tắt'}
                ok={cameraActive}
                onClick={
                  !completed
                    ? () => {
                        if (cameraActive) stopCamera()
                        else void startCamera()
                      }
                    : undefined
                }
                title={!completed ? (cameraActive ? 'Bấm để tắt camera' : 'Bấm để bật camera') : undefined}
              />

              {/* Mạng */}
              <DeviceTile
                icon={<Wifi size={14} />}
                label="Mạng"
                status={online && !connection.toLowerCase().includes('mất') ? 'Kết nối ổn định' : 'Mất mạng'}
                ok={online && !connection.toLowerCase().includes('mất')}
              />
            </div>
          </section>
        </aside>
      </div>
    </section>
  )
}
