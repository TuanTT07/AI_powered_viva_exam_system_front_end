import { useCallback, useEffect, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { CheckCircle2, Bot, Sparkles, FileText, Calendar, RefreshCw, LogOut, Play } from 'lucide-react'
import { Button, Dialog } from '../../../components/ui/primitives'
import { ErrorState, LoadingPage, PermissionDenied } from '../../../components/common/states'
import { InlineNotice } from '../../../components/common/inline-notice'
import { ApiError } from '../../../services/api/client'
import { useOnline } from '../../../hooks/use-online'
import type { StudentExamSlot } from '../../exams/api-student-exam-repository'
import { studentExamPath } from '../../exams/student-exam-navigation'
import { interviewApi, type InterviewPrompt } from '../interview-api'
import type { AnswerReceipt } from '../speech-api'
import type { TranscriptMessageProps } from '../components/TranscriptMessage'
import { ApiSpeechRoom } from './ApiSpeechRoom'
import { VivaSessionView } from './VivaSessionView'

const transcriptStorageKey = (attemptId: string) => `aives.interview.transcript.${attemptId}`

function loadStoredTranscript(attemptId: string, examId?: string): TranscriptMessageProps[] {
  try {
    const raw = sessionStorage.getItem(transcriptStorageKey(attemptId)) || (examId ? sessionStorage.getItem(`aives.interview.transcript.${examId}`) : null)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) return parsed
    }
  } catch {
    // Ignore storage errors
  }
  return []
}

function saveStoredTranscript(attemptId: string, examId: string | undefined, items: TranscriptMessageProps[]) {
  try {
    sessionStorage.setItem(transcriptStorageKey(attemptId), JSON.stringify(items))
    if (examId) {
      sessionStorage.setItem(`aives.interview.transcript.${examId}`, JSON.stringify(items))
    }
  } catch {
    // Ignore storage errors
  }
}

function readViolations(key: string) {
  try {
    const count = Number(localStorage.getItem(key) ?? 0)
    return Number.isInteger(count) && count >= 0 ? count : 0
  } catch {
    return 0
  }
}

export function ApiInterviewRoom({ slot, userId, name }: { slot: StudentExamSlot; userId: string; name: string }) {
  const client = useQueryClient()
  const navigate = useNavigate()
  const online = useOnline()
  const [busy, setBusy] = useState(false)
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false)
  const [history, setHistory] = useState<TranscriptMessageProps[]>(() => loadStoredTranscript(slot.attemptId, slot.examId))
  const [activePrompt, setActivePrompt] = useState<InterviewPrompt | null>(null)
  const violationKey = `aives.interview.violations.${userId}.${slot.attemptId}`
  const [violations, setViolations] = useState(() => readViolations(violationKey))
  const [fullscreen, setFullscreen] = useState(() => !!document.fullscreenElement)
  const [fullscreenFailed, setFullscreenFailed] = useState(false)
  const lastViolation = useRef(-Infinity)
  const locked = violations >= 4
  const enterFullscreen = () => {
    if (!document.fullscreenEnabled || document.fullscreenElement) return
    void document.documentElement.requestFullscreen()
      .then(() => setFullscreenFailed(false))
      .catch(() => setFullscreenFailed(true))
  }
  const key = ['student-interview', userId, slot.attemptId] as const

  const appendHistory = useCallback(
    (message: TranscriptMessageProps) => {
      setHistory((prev) => {
        const exists = prev.some(
          (m) =>
            m.role === message.role &&
            ((message.id && m.id === message.id) || m.text === message.text)
        )
        if (exists) return prev
        const next = [...prev, message]
        saveStoredTranscript(slot.attemptId, slot.examId, next)
        return next
      })
    },
    [slot.attemptId, slot.examId]
  )

  const start = useMutation({
    mutationFn: () => interviewApi.start(slot.attemptId),
    retry: false,
    onMutate: () => client.cancelQueries({ queryKey: key }),
    onSuccess: data => client.setQueryData(key, data),
    onError: () => { void client.invalidateQueries({ queryKey: key }) },
  })
  const current = useQuery({
    queryKey: key,
    queryFn: ({ signal }) => interviewApi.current(slot.attemptId, signal),
    enabled: !locked && !busy && online && !start.isPending,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: 'always',
    refetchInterval: query => busy || start.isPending || query.state.status === 'error' || query.state.data?.status === 'COMPLETED' ? false : 2000,
  })
  const snapshot = current.data
  const monitoring = !locked && (snapshot?.status === 'AWAITING_ANSWER' || snapshot?.status === 'PROCESSING')

  useEffect(() => {
    const sync = (event: StorageEvent) => {
      if (event.key === violationKey) setViolations(count => Math.max(count, readViolations(violationKey)))
    }
    window.addEventListener('storage', sync)
    return () => window.removeEventListener('storage', sync)
  }, [violationKey])

  useEffect(() => {
    if (!monitoring) return
    let wasFullscreen = !!document.fullscreenElement
    const record = () => {
      const now = performance.now()
      if (now - lastViolation.current < 750) return
      lastViolation.current = now
      const next = Math.max(violations, readViolations(violationKey)) + 1
      try {
        localStorage.setItem(violationKey, String(next))
      } catch {
        // Keep enforcing the counter in this page if storage is unavailable.
      }
      setViolations(next)
    }
    const onVisibility = () => {
      if (document.hidden) record()
    }
    const onFullscreen = () => {
      const active = !!document.fullscreenElement
      setFullscreen(active)
      if (wasFullscreen && !active) record()
      wasFullscreen = active
    }
    setFullscreen(wasFullscreen)
    document.addEventListener('visibilitychange', onVisibility)
    document.addEventListener('fullscreenchange', onFullscreen)
    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
      document.removeEventListener('fullscreenchange', onFullscreen)
    }
  }, [monitoring, violationKey, violations])

  useEffect(() => {
    if ((locked || snapshot?.status === 'COMPLETED') && document.fullscreenElement)
      void document.exitFullscreen().catch(() => {})
  }, [locked, snapshot?.status])

  useEffect(() => {
    if (snapshot?.status === 'AWAITING_ANSWER' && snapshot.prompt) {
      appendHistory({
        id: snapshot.prompt.questionTurnId,
        role: 'ai',
        text: snapshot.prompt.text,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      })
    }
  }, [snapshot, appendHistory])

  useEffect(() => {
    if (snapshot?.prompt) setActivePrompt(snapshot.prompt)
  }, [snapshot?.prompt])

  const busyChanged = useCallback((next: boolean) => {
    // Cancel a read before media starts so a late response cannot replace its prompt.
    if (next) void client.cancelQueries({ queryKey: ['student-interview', userId, slot.attemptId] })
    setBusy(next)
  }, [client, userId, slot.attemptId])

  const answerSaved = useCallback(
    (receipt?: AnswerReceipt | null) => {
      if (receipt) {
        appendHistory({
          id: receipt.transcriptTurnId,
          role: 'student',
          text: receipt.text,
          timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        })
      }
      void client.invalidateQueries({ queryKey: ['student-interview', userId, slot.attemptId] })
    },
    [client, slot.attemptId, userId, appendHistory]
  )
  const leaveButton = (
    <Button
      variant="outline"
      onClick={() => setLeaveDialogOpen(true)}
      className="text-slate-500 hover:text-slate-700 ml-auto inline-flex items-center gap-1.5"
    >
      <LogOut size={14} />
      <span>Rời phòng thi</span>
    </Button>
  )

  if (locked) return <section className="state mx-auto max-w-xl p-6">
    <ErrorState description="Lượt thi đã bị khóa trên trình duyệt vì vượt quá 3 lần rời tab hoặc thoát toàn màn hình." />
    <Link className="button outline" to={studentExamPath(slot.examId, slot.attemptId)}>Quay lại chi tiết ca thi</Link>
  </section>

  if (current.error instanceof ApiError && [401, 403].includes(current.error.status ?? 0)) return <PermissionDenied />
  if (current.isError && !busy) return (
    <section className="state" style={{ maxWidth: 640, margin: '40px auto', padding: '24px' }}>
      <ErrorState description={current.error.message} />
      <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
        <Button
          aria-label="Đồng bộ lại phiên thi"
          disabled={!online || current.isFetching}
          onClick={() => void current.refetch()}
        >
          <RefreshCw size={14} className="mr-1.5" />
          <span>Làm mới trạng thái</span>
        </Button>
        <Link className="button outline inline-flex items-center gap-1.5" to={studentExamPath(slot.examId, slot.attemptId)}>
          <LogOut size={14} />
          <span>Quay lại chi tiết ca thi</span>
        </Link>
      </div>
    </section>
  )

  if (!snapshot || !current.isFetchedAfterMount) return online ? <LoadingPage label="Đang lấy trạng thái phiên thi" /> : (
    <section className="state" style={{ maxWidth: 640, margin: '40px auto', padding: '24px' }}>
      <ErrorState description="Mất kết nối mạng. Hãy kết nối lại để tiếp tục phiên thi." />
      <Link className="button outline inline-flex items-center gap-1.5" to={studentExamPath(slot.examId, slot.attemptId)}>
        <LogOut size={14} />
        <span>Quay lại chi tiết ca thi</span>
      </Link>
    </section>
  )
  if (snapshot.status !== 'READY' && snapshot.status !== 'COMPLETED' && (snapshot.prompt ?? activePrompt)) {
    return (
      <>
      {(violations > 0 || !fullscreen) && <aside role="status" className="mx-4 mb-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        <span>{violations > 0 ? `Cảnh báo ${violations}/3. Lần thứ tư sẽ khóa phòng thi.` : 'Hãy bật toàn màn hình trong khi thi.'}
          {fullscreenFailed && ' Trình duyệt chưa cho phép mở toàn màn hình.'}</span>
        {!fullscreen && document.fullscreenEnabled && <Button variant="outline" onClick={enterFullscreen}>Bật toàn màn hình</Button>}
      </aside>}
      <ApiSpeechRoom
        key={`${userId}:${slot.attemptId}`}
        slot={slot}
        prompt={(snapshot.prompt ?? activePrompt)!}
        userId={userId}
        name={name}
        history={history}
        isProcessing={snapshot.status === 'PROCESSING'}
        onBusyChange={busyChanged}
        onAnswerSaved={answerSaved}
      />
      </>
    )
  }

  const isCompleted = snapshot.status === 'COMPLETED'
  const isReady = snapshot.status === 'READY'
  const isProcessing = snapshot.status === 'PROCESSING'

  const customQuestion = isCompleted ? (
    <div className="py-4 space-y-3 text-center">
      <div className="w-14 h-14 mx-auto rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shadow-xs">
        <CheckCircle2 size={30} />
      </div>
      <div className="space-y-1 max-w-lg mx-auto">
        <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
          Phiên thi đã hoàn tất
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
          Hệ thống đã xác nhận hoàn thành ca thi. Toàn bộ câu trả lời và transcript đã được lưu trữ an toàn. Bạn có thể xem kết quả bài thi hoặc quay về danh sách lịch thi.
        </p>
      </div>
    </div>
  ) : isReady ? (
    <div className="py-2 space-y-3">
      <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200/80 flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
          <Bot size={18} />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-slate-900">Sẵn sàng nhận câu hỏi từ Giám khảo AI</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Nhấn <strong>Bắt đầu phiên thi</strong> bên dưới để mở phiên. Giám khảo AI sẽ đọc câu hỏi và hệ thống cấp thời gian để bạn trả lời.
          </p>
        </div>
      </div>
    </div>
  ) : isProcessing ? (
    <div className="py-6 space-y-2 text-center">
      <div className="inline-flex p-3 rounded-full bg-blue-50 text-blue-600 animate-spin mb-1">
        <Sparkles size={22} />
      </div>
      <h4 className="text-sm font-bold text-slate-900">Giám khảo AI đang xử lý câu trả lời...</h4>
      <p className="text-xs text-slate-500">Vui lòng chờ hệ thống cấp lượt hỏi tiếp theo hoặc xác nhận hoàn tất.</p>
    </div>
  ) : undefined

  const answeredCount = history.filter((h) => h.role === 'student').length
  const aiQuestionsCount = Math.max(
    history.filter((h) => h.role === 'ai').length,
    activePrompt ? 1 : 0
  )
  const configuredMax =
    slot.examConfig?.maxMainQuestions ??
    (slot as any).examConfig?.questionCount ??
    (slot as any).mainQuestionCount ??
    (slot as any).questionCount ??
    (slot as any).maxQuestions ??
    (slot as any).totalQuestions ??
    3
  const totalSteps = Math.max(configuredMax, answeredCount, aiQuestionsCount, 1)
  const currentStep = isCompleted
    ? totalSteps
    : Math.max(1, answeredCount + 1)
  const startTimeFormatted = slot.scheduledStartTime
    ? new Date(slot.scheduledStartTime).toLocaleString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : '—'
  const durationFormatted =
    slot.scheduledStartTime && slot.scheduledEndTime
      ? `${Math.round((Date.parse(slot.scheduledEndTime) - Date.parse(slot.scheduledStartTime)) / 60000)} phút`
      : '—'
  const slotCodeFormatted =
    slot.accessCode ||
    (slot.courseCode
      ? `${slot.courseCode}-${String(slot.slotNumber ?? 1).padStart(3, '0')}`
      : slot.slotNumber
        ? `AIVES-CA-${slot.slotNumber}`
        : '—')

  return (
    <>
      <VivaSessionView
        name={name}
        title={slot.examTitle}
        courseName={slot.courseName || slot.examTitle || '—'}
        slotCode={slotCodeFormatted}
        startTime={startTimeFormatted}
        duration={durationFormatted}
        currentStep={currentStep}
        totalSteps={totalSteps}
        isCompleted={isCompleted}
        isProcessing={isProcessing}
        isAiSpeaking={false}
        isRecording={false}
        phase={isReady ? 'Sẵn sàng bắt đầu phiên thi' : isCompleted ? 'Phiên thi đã hoàn tất' : 'Hệ thống đang xử lý lượt thi'}
        timer="—"
        timerLabel="Thời gian trả lời"
        progress={slot.slotNumber == null ? 'Ca thi của bạn' : `Ca ${slot.slotNumber}`}
        question={customQuestion}
        transcript={history}
        connection={online ? 'Đã kết nối máy chủ khảo thí' : 'Mất kết nối mạng'}
        notice={
          <div className="space-y-2">
            {start.isError && (
              <InlineNotice>
                <span className="text-red-700 font-semibold">Lỗi bắt đầu: </span>
                {start.error.message} Hãy kiểm tra trạng thái phiên trước khi thử lại.
              </InlineNotice>
            )}
            <InlineNotice>
              {isReady
                ? 'Nhấn Bắt đầu phiên thi để hệ thống kích hoạt câu hỏi đầu tiên.'
                : isCompleted
                  ? 'Hệ thống đã xác nhận phiên thi kết thúc an toàn. Kết quả sẽ hiển thị khi được công bố.'
                  : 'Vui lòng chờ. Giám khảo AI đang phân tích câu trả lời và chuẩn bị lượt hỏi tiếp theo.'}
            </InlineNotice>
          </div>
        }
        controls={
          <>
            {isReady && (
              <Button
                disabled={!online || start.isPending || current.isFetching}
                onClick={() => { enterFullscreen(); start.mutate() }}
                className="inline-flex items-center gap-1.5"
              >
                <Play size={15} fill="currentColor" />
                <span>{start.isPending ? 'Đang mở phiên thi…' : 'Bắt đầu phiên thi'}</span>
              </Button>
            )}
            {isProcessing && (
              <Button disabled className="inline-flex items-center gap-1.5">
                <Sparkles size={14} className="animate-spin" />
                <span>Đang chờ hệ thống…</span>
              </Button>
            )}
            {isCompleted && (
              <>
                <Link className="button primary inline-flex items-center gap-1.5" to={`/student/exams/${encodeURIComponent(slot.examId)}/result?attemptId=${encodeURIComponent(slot.attemptId)}`}>
                  <FileText size={15} />
                  <span>Xem kết quả &amp; phúc khảo</span>
                </Link>
                <Link className="button outline inline-flex items-center gap-1.5" to="/student/exams">
                  <Calendar size={15} />
                  <span>Lịch thi của tôi</span>
                </Link>
              </>
            )}
            {!isCompleted && (
              <Button
                variant="outline"
                aria-label="Đồng bộ phiên thi"
                disabled={!online || current.isFetching || start.isPending}
                onClick={() => void current.refetch()}
                className="inline-flex items-center gap-1.5"
              >
                <RefreshCw size={14} className={current.isFetching ? 'animate-spin' : ''} />
                <span>{current.isFetching ? 'Đang kiểm tra…' : 'Làm mới trạng thái'}</span>
              </Button>
            )}
            {!isCompleted && leaveButton}
          </>
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
  )
}
