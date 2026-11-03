import { useEffect, useRef, useState, type ReactNode } from 'react'
import { FileText, Mic, ShieldCheck, Video, VideoOff, Wifi, CheckCircle2 } from 'lucide-react'
import { TranscriptMessage, type TranscriptMessageProps } from '../components/TranscriptMessage'

export function VivaSessionView({
  name,
  title,
  phase,
  timer,
  progress,
  question,
  transcript,
  notice,
  controls,
  connection,
  draft,
  timerLabel = 'Thời gian còn lại',
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
}) {
  const isCompleted = phase.includes('hoàn tất') || phase.includes('kết thúc')
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [cameraActive, setCameraActive] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    setCameraActive(false)
  }

  const startCamera = async () => {
    setCameraError(null)
    try {
      if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
        setCameraError('Trình duyệt chưa hỗ trợ camera hoặc chưa cấp quyền.')
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
      setCameraError('Chưa cấp quyền truy cập camera hoặc không tìm thấy webcam.')
      setCameraActive(false)
    }
  }

  useEffect(() => {
    if (isCompleted) {
      stopCamera()
      return
    }
    void startCamera()

    return () => {
      stopCamera()
    }
  }, [isCompleted])

  return (
    <section className="source-screen max-w-7xl mx-auto viva-room p-4 md:p-6 space-y-4">
      {/* Session Header Card */}
      <div className="viva-session-header bg-white border border-slate-200 rounded-2xl p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[11px] font-bold tracking-wide uppercase">
            <span>Cổng khảo thí • Phòng vấn đáp</span>
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 mt-2 tracking-tight">{title}</h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Thí sinh: <span className="text-slate-800 font-semibold">{name}</span> • <span className="text-blue-700">{progress}</span>
          </p>
          <div className="inline-flex items-center gap-2 mt-2">
            <span className={`w-2 h-2 rounded-full ${isCompleted ? 'bg-emerald-500' : 'bg-blue-600 animate-pulse'}`} />
            <span role="status" className={`text-xs font-bold ${isCompleted ? 'text-emerald-700' : 'text-blue-700'}`}>
              {phase}
            </span>
          </div>
        </div>

        <div className="rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50/50 border border-blue-100 px-6 py-3.5 shrink-0 text-center md:text-right shadow-2xs">
          <p className="text-[11px] uppercase text-blue-700 font-bold tracking-wider">{timerLabel}</p>
          <strong className="font-mono text-2xl md:text-3xl text-blue-900 font-extrabold block mt-0.5">{timer}</strong>
        </div>
      </div>

      {notice}

      <div className="grid lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Camera & Status Sidebar */}
        <aside className="viva-camera-panel lg:col-span-4 space-y-4">
          <section className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
            <div className="p-3.5 px-4 text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Video size={16} className="text-blue-600" />
                <span>Không gian thí sinh</span>
              </div>
              {!isCompleted && (
                <button
                  type="button"
                  onClick={() => {
                    if (cameraActive) stopCamera()
                    else void startCamera()
                  }}
                  className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                >
                  {cameraActive ? (
                    <>
                      <VideoOff size={13} />
                      <span>Tắt cam</span>
                    </>
                  ) : (
                    <>
                      <Video size={13} />
                      <span>Bật cam</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {isCompleted ? (
              <div className="aspect-video bg-gradient-to-br from-slate-900 to-slate-950 flex flex-col gap-2.5 items-center justify-center text-slate-300 p-4 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Phiên thi đã hoàn tất</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Camera và micro đã đóng an toàn</p>
                </div>
              </div>
            ) : cameraActive ? (
              <div className="aspect-video bg-slate-950 relative overflow-hidden flex items-center justify-center">
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
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-xs text-[10px] font-semibold text-white">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  <span>Trực tiếp</span>
                </div>
              </div>
            ) : (
              <div className="aspect-video bg-slate-900 flex flex-col gap-2.5 items-center justify-center text-slate-300 p-4 text-center">
                <div className="w-11 h-11 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center">
                  <VideoOff size={22} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-200">
                    {cameraError ? 'Chưa kết nối camera' : 'Camera đang tắt'}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5 max-w-[220px]">
                    {cameraError || 'Nhấn nút bật camera để mở hình ảnh giám sát của bạn'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void startCamera()}
                  className="mt-1 px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-all inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Video size={13} />
                  <span>Bật camera</span>
                </button>
              </div>
            )}

            <div className="p-4 space-y-2.5 text-xs text-slate-600 bg-slate-50/60 border-t border-slate-100">
              <p className="flex items-center gap-2">
                <Wifi size={14} className="text-blue-600 shrink-0" />
                <span>{connection}</span>
              </p>
              <p className="flex items-center gap-2">
                <ShieldCheck size={14} className="text-emerald-600 shrink-0" />
                <span>Biên bản thi được ký số bảo mật</span>
              </p>
            </div>
          </section>

          <section className="border border-slate-200 rounded-2xl bg-white p-5 space-y-2.5 shadow-sm">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex gap-2 items-center">
              <Mic size={15} className="text-blue-600" />
              <span>Trạng thái phiên thi</span>
            </h2>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <p className="text-xs font-bold text-blue-700">{phase}</p>
              <p className="text-[11px] text-slate-500">
                {isCompleted
                  ? 'Toàn bộ dữ liệu phiên thi đã được gửi lên hệ thống khảo thí.'
                  : 'Không rời trang khi hệ thống đang xử lý câu trả lời.'}
              </p>
            </div>
          </section>
        </aside>

        {/* Right Column: Question & Transcript Area */}
        <div className="viva-answer-panel lg:col-span-8 space-y-4">
          <section className="border border-slate-200 rounded-2xl bg-white p-5 md:p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-xs uppercase tracking-wider text-slate-500 font-bold">
                {isCompleted ? 'Tổng kết phiên thi' : 'Câu hỏi đang trình bày'}
              </h2>
              <span className="text-[11px] font-semibold text-slate-600">AIVES AI Engine</span>
            </div>

            <div className="text-base text-slate-900 leading-relaxed font-medium">
              {question || 'Chờ câu hỏi được hệ thống cấp quyền.'}
            </div>

            {draft}

            <div className="flex flex-wrap gap-2.5 pt-2 border-t border-slate-100">
              {controls}
            </div>
          </section>

          <section className="border border-slate-200 rounded-2xl bg-white p-5 md:p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-xs uppercase tracking-wider text-slate-700 font-bold flex items-center gap-2">
                <FileText size={15} className="text-blue-600" />
                <span>Biên bản hội thoại</span>
              </h2>
              <span className="text-[11px] text-slate-600 font-medium">
                {transcript.length} lượt tương tác
              </span>
            </div>

            <div className="max-h-[520px] overflow-y-auto space-y-3 pr-1">
              {transcript.map((line, index) => (
                <TranscriptMessage key={line.id ?? `${line.role}-${index}`} {...line} />
              ))}
              {!transcript.length && (
                <div className="py-12 text-center space-y-2">
                  <div className="w-10 h-10 mx-auto rounded-full bg-slate-100 text-slate-600 flex items-center justify-center">
                    <FileText size={18} />
                  </div>
                  <p className="text-xs text-slate-500 font-medium">Chưa có hội thoại được xác nhận.</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </section>
  )
}
