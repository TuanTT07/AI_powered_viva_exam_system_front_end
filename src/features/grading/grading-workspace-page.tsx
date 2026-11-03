import { useEffect, useState } from 'react'
import { Link, useParams, useSearchParams, useBlocker } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { DemoLabel } from '../../components/common/inline-notice'
import { Alert, Button, Dialog } from '../../components/ui/primitives'
import { ErrorState, LoadingPage } from '../../components/common/states'
import { runtimeConfig } from '../../services/api/runtime-config'
import { useExamMonitoring, useExamRoster } from '../exams/exam-hooks'
import { GradingWorkspaceView } from './views/GradingWorkspaceView'
import { gradingDemo } from './mocks/grading-demo'
import { getStoredGrading, saveStoredGrading } from './grading-repository'
import { apiEvaluationService } from './api-evaluation-service'
import type { CriterionReview, EvidenceLine } from './grading-types'

export function GradingWorkspacePage() {
  const { examId = '', attemptId = '' } = useParams()
  return runtimeConfig.dataSource === 'mock' ? (
    <DemoGrading key={`${examId}/${attemptId}`} examId={examId} attemptId={attemptId} />
  ) : (
    <ApiGrading examId={examId} attemptId={attemptId} />
  )
}

function useSummaryTab() {
  const [params, setParams] = useSearchParams()
  return {
    summary: params.get('tab') === 'summary',
    toggle: () => setParams(params.get('tab') === 'summary' ? {} : { tab: 'summary' }),
  }
}

function ApiGrading({ examId, attemptId }: { examId: string; attemptId: string }) {
  const query = useExamMonitoring(examId)
  const tab = useSummaryTab()
  const [triggering, setTriggering] = useState(false)
  const [actionMessage, setActionMessage] = useState<string | null>(null)

  // Dev3 API call: GET /api/question-attempts/{questionAttemptId}/evaluation
  const evalQuery = useQuery({
    queryKey: ['dev3-evaluation', attemptId],
    queryFn: async () => {
      try {
        return await apiEvaluationService.getByQuestionAttempt(attemptId)
      } catch {
        return null
      }
    },
    enabled: Boolean(attemptId),
    retry: false,
  })

  const evaluation = evalQuery.data
  const candidate = query.data?.candidateStatuses.find(c => c.attemptId === attemptId)
  const stored = getStoredGrading(examId, attemptId)

  const defaultScores = evaluation
    ? Object.fromEntries(evaluation.criteria.map(c => [c.criterionId, String(c.finalScore ?? c.aiScore ?? '')]))
    : {}
  const [userScores, setUserScores] = useState<Record<string, string> | null>(null)
  const [userNotes, setUserNotes] = useState<string | null>(null)
  const [confirmed, setConfirmed] = useState<boolean>(() => stored?.confirmed ?? false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [isFinalizing, setIsFinalizing] = useState(false)

  const scores = userScores ?? stored?.scores ?? defaultScores
  const notes = userNotes ?? stored?.notes ?? evaluation?.overallFeedback ?? ''

  const criteria: CriterionReview[] = evaluation
    ? evaluation.criteria.map(c => ({
        id: c.criterionId,
        name: c.criterionName,
        max: c.maxScore,
        ai: c.aiScore ?? 0,
        evidence: c.comment ?? '',
      }))
    : []

  const handleTriggerAi = async () => {
    setTriggering(true)
    setActionMessage(null)
    try {
      await apiEvaluationService.gradeWithAi(attemptId)
      await evalQuery.refetch()
      setActionMessage('Đã kích hoạt AI chấm điểm thành công từ Backend Dev3!')
    } catch (err: unknown) {
      setActionMessage(err instanceof Error ? err.message : 'Không thể kích hoạt AI chấm điểm.')
    } finally {
      setTriggering(false)
    }
  }

  const handleConfirmFinalize = async () => {
    if (!evaluation) return
    setIsFinalizing(true)
    try {
      const criteriaPayload = criteria.map(c => ({
        criterionId: c.id,
        finalScore: Number(scores[c.id]) || 0,
        comment: c.evidence,
      }))
      const res = await apiEvaluationService.finalizeEvaluation(attemptId, {
        criteria: criteriaPayload,
        overallFeedback: notes,
      })
      setConfirmed(true)
      setConfirmOpen(false)
      const finalScore = res.finalScore ?? Object.values(scores).reduce((sum, v) => sum + (Number(v) || 0), 0)
      saveStoredGrading(examId, attemptId, {
        scores,
        notes,
        confirmed: true,
        finalScore,
        finalizedAt: res.updatedAt ?? new Date().toISOString(),
      })
      setActionMessage('Đã chốt điểm thành công qua API Backend Dev3!')
      await evalQuery.refetch()
    } catch (err: unknown) {
      setActionMessage(err instanceof Error ? err.message : 'Chốt điểm thất bại.')
    } finally {
      setIsFinalizing(false)
    }
  }

  if (query.isPending || evalQuery.isPending) return <LoadingPage label="Đang tải lượt thi và kết quả chấm điểm" />
  if (query.isError) {
    return (
      <div className="max-w-7xl mx-auto p-6 space-y-4">
        <ErrorState description={query.error.message} />
        <Button onClick={() => void query.refetch()}>Thử lại</Button>
      </div>
    )
  }

  if (!candidate && !evaluation) {
    return <ErrorState description="Không tìm thấy lượt thi trong kỳ thi được cấp quyền xem." />
  }

  const transcript: EvidenceLine[] = (evaluation?.transcript ?? []).map(t => ({
    id: t.id,
    role: t.speaker.toLowerCase() === 'ai' ? 'ai' : 'student',
    text: t.textContent,
    time: t.createdAt
      ? new Date(t.createdAt).toLocaleTimeString('vi-VN', {
          minute: '2-digit',
          second: '2-digit',
        })
      : undefined,
    audioUrl: t.audioUrl ?? undefined,
  }))

  return (
    <section className="source-screen max-w-7xl mx-auto pb-12">
      <GradingWorkspaceView
        name={candidate?.studentName ?? 'Thí sinh (Đánh giá Dev3)'}
        code={candidate?.studentCode ?? attemptId}
        question={evaluation?.questionContent}
        transcript={transcript}
        audioUrl={evaluation?.audioUrl}
        criteria={criteria}
        scores={scores}
        notes={notes}
        onScore={(id, value) => setUserScores(prev => ({ ...(prev ?? scores), [id]: value }))}
        onNotes={setUserNotes}
        summary={tab.summary}
        confirmed={confirmed}
        status={candidate?.status ?? evaluation?.status}
        notice={
          <div className="space-y-2">
            {evaluation ? (
              <Alert tone="info">
                <strong>Kết nối API Dev3:</strong> Điểm AI đề xuất: <strong>{evaluation.aiSuggestedScore ?? '—'} / {evaluation.maxScore}</strong>. Trạng thái: <strong>{evaluation.status}</strong>.
              </Alert>
            ) : (
              <Alert>
                Đã tải thông tin lượt thi. Transcript, rubric chấm điểm và lưu điểm chưa được hệ thống hỗ trợ.
              </Alert>
            )}
            {actionMessage && <Alert tone={confirmed ? 'success' : 'info'}>{actionMessage}</Alert>}
          </div>
        }
        actions={
          <>
            <Link className="button outline" to={`/lecturer/exams/${examId}/attempts`}>
              Danh sách lượt thi
            </Link>
            <Button variant="outline" onClick={tab.toggle}>
              {tab.summary ? 'Không gian chấm điểm' : 'Tổng kết hồ sơ'}
            </Button>
            {!evaluation && (
              <Button variant="outline" disabled={triggering} onClick={handleTriggerAi}>
                {triggering ? 'Đang gọi AI...' : 'Gọi AI chấm điểm (API Dev3)'}
              </Button>
            )}
            <Button
              disabled={confirmed || !criteria.length}
              onClick={() => setConfirmOpen(true)}
            >
              {confirmed ? 'ĐÃ CHỐT ĐIỂM' : 'Chốt điểm'}
            </Button>
          </>
        }
      />

      {/* Confirm Final Grade Dialog */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} title="Xác nhận & Chốt điểm (API Dev3)?">
        <p>Bạn sẽ chốt điểm chính thức cho câu hỏi này và đồng bộ lên server Backend Dev3.</p>
        <div className="dialog-actions">
          <Button variant="outline" disabled={isFinalizing} onClick={() => setConfirmOpen(false)}>
            Hủy
          </Button>
          <Button pending={isFinalizing} onClick={handleConfirmFinalize}>
            Xác nhận chốt điểm
          </Button>
        </div>
      </Dialog>
    </section>
  )
}

function DemoGrading({ examId, attemptId }: { examId: string; attemptId: string }) {
  const roster = useExamRoster(examId)
  const candidate = roster.data?.find(student => student.id === attemptId)
  const tab = useSummaryTab()

  const stored = getStoredGrading(examId, attemptId)
  const initialScores = stored?.scores ?? Object.fromEntries(gradingDemo.criteria.map(c => [c.id, String(c.ai)]))
  const initialNotes = stored?.notes ?? ''
  const initialConfirmed = stored?.confirmed ?? false

  const [scores, setScores] = useState<Record<string, string>>(() => initialScores)
  const [notes, setNotes] = useState(initialNotes)
  const [confirmed, setConfirmed] = useState(initialConfirmed)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [saved, setSaved] = useState<string | null>(() =>
    JSON.stringify({ scores: initialScores, notes: initialNotes })
  )
  const [message, setMessage] = useState('')

  const snapshot = JSON.stringify({ scores, notes })
  const dirty = saved === null ? Object.keys(scores).length > 0 || notes.length > 0 : saved !== snapshot
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      dirty && !confirmed && currentLocation.pathname !== nextLocation.pathname
  )

  useEffect(() => {
    if (!dirty || confirmed) return
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty, confirmed])

  const valid = gradingDemo.criteria.every(
    c =>
      scores[c.id]?.trim() &&
      Number.isFinite(Number(scores[c.id])) &&
      Number(scores[c.id]) >= 0 &&
      Number(scores[c.id]) <= c.max
  )

  const handleSaveDraft = () => {
    setSaved(snapshot)
    saveStoredGrading(examId, attemptId, {
      scores,
      notes,
      confirmed: false,
    })
    setMessage('Đã lưu nháp trong phiên demo.')
  }

  const handleConfirmFinalize = () => {
    const finalScore = gradingDemo.criteria.reduce((sum, c) => sum + (Number(scores[c.id]) || 0), 0)
    setConfirmed(true)
    setSaved(snapshot)
    setConfirmOpen(false)
    saveStoredGrading(examId, attemptId, {
      scores,
      notes,
      confirmed: true,
      finalScore,
      finalizedAt: new Date().toISOString(),
    })
    setMessage('Đã xác nhận điểm demo. Chưa có điểm chính thức trên hệ thống.')
  }

  return (
    <section className="source-screen max-w-7xl mx-auto pb-12">
      <GradingWorkspaceView
        name={candidate?.fullName ?? 'Hồ sơ chấm điểm mẫu'}
        code={`DEMO · ${candidate?.studentCode ?? attemptId}`}
        question={gradingDemo.question}
        transcript={gradingDemo.transcript}
        criteria={gradingDemo.criteria}
        demo
        scores={scores}
        notes={notes}
        onScore={(id, value) => {
          setScores(s => ({ ...s, [id]: value }))
          setMessage('')
        }}
        onNotes={val => {
          setNotes(val)
          setMessage('')
        }}
        summary={tab.summary}
        confirmed={confirmed}
        notice={
          <div className="space-y-2">
            <DemoLabel
              label="Bản xem thử chấm điểm"
              detail="Transcript và rubric mẫu để thử giao diện, không phải câu trả lời của thí sinh này. Bản lưu chỉ tồn tại trong màn."
            />
            <p className="text-xs text-slate-500" role="status">
              {message ||
                (confirmed
                  ? 'Đã xác nhận điểm demo.'
                  : dirty
                    ? 'Có thay đổi chưa lưu trong phiên demo.'
                    : saved === null
                      ? 'Chưa nhập điểm trong phiên demo.'
                      : 'Đã lưu nháp trong phiên demo.')}
            </p>
          </div>
        }
        actions={
          <>
            <Link className="button outline" to={`/lecturer/exams/${examId}/attempts`}>
              Danh sách lượt thi
            </Link>
            <Button variant="outline" onClick={tab.toggle}>
              {tab.summary ? 'Chấm điểm' : 'Tổng kết hồ sơ'}
            </Button>
            <Button
              variant="outline"
              disabled={confirmed || !dirty}
              onClick={handleSaveDraft}
            >
              Lưu nháp demo
            </Button>
            <Button
              disabled={confirmed}
              onClick={() =>
                valid ? setConfirmOpen(true) : setMessage('Nhập đầy đủ điểm từ 0 đến điểm tối đa của từng tiêu chí.')
              }
            >
              {confirmed ? 'Đã xác nhận demo' : 'Xác nhận điểm demo'}
            </Button>
          </>
        }
      />

      {/* Unsaved Changes Guard Dialog */}
      <Dialog
        open={blocker.state === 'blocked'}
        onClose={() => blocker.state === 'blocked' && blocker.reset()}
        title="Rời bản chấm điểm chưa lưu?"
      >
        <p>Các chỉnh sửa demo chưa lưu sẽ bị mất khi rời màn này.</p>
        <div className="dialog-actions">
          <Button variant="outline" onClick={() => blocker.state === 'blocked' && blocker.reset()}>
            Tiếp tục chỉnh sửa
          </Button>
          <Button variant="danger" onClick={() => blocker.state === 'blocked' && blocker.proceed()}>
            Rời màn hình
          </Button>
        </div>
      </Dialog>

      {/* Confirm Final Grade Dialog */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} title="Xác nhận điểm demo?">
        <p>
          Bạn sẽ khóa chỉnh sửa điểm trong phiên demo này. Đây không phải điểm chính thức và không công bố cho sinh viên.
        </p>
        <div className="dialog-actions">
          <Button variant="outline" onClick={() => setConfirmOpen(false)}>
            Hủy
          </Button>
          <Button onClick={handleConfirmFinalize}>Xác nhận demo</Button>
        </div>
      </Dialog>
    </section>
  )
}
