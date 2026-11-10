import { loadExamEvaluations } from './load-exam-evaluations'
import { useEffect, useState } from 'react'
import { Link, useParams, useSearchParams, useBlocker } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
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
  const [params] = useSearchParams()
  return runtimeConfig.dataSource === 'mock' ? (
    <DemoGrading key={`${examId}/${attemptId}`} examId={examId} attemptId={attemptId} />
  ) : (
    <ApiGrading key={`${examId}/${attemptId}/${params.get('question') ?? ''}`} examId={examId} attemptId={attemptId} />
  )
}

function useSummaryTab() {
  const [params, setParams] = useSearchParams()
  return {
    summary: params.get('tab') === 'summary',
    toggle: () => {
      const next = new URLSearchParams(params)
      if (params.get('tab') === 'summary') next.delete('tab')
      else next.set('tab', 'summary')
      setParams(next)
    },
  }
}

function ApiGrading({ examId, attemptId }: { examId: string; attemptId: string }) {
  const [params] = useSearchParams()
  const query = useExamMonitoring(examId)
  const tab = useSummaryTab()
  const [triggering, setTriggering] = useState(false)
  const [actionMessage, setActionMessage] = useState<string | null>(null)

  // Dev3 API: Query evaluations of this exam to resolve questionAttemptId if needed
  const examEvals = useQuery({
    queryKey: ['dev3-exam-evaluations', examId],
    queryFn: () => loadExamEvaluations(examId),
    enabled: Boolean(examId),
    retry: false,
  })

  // Old question-level links resolve via existing evaluation metadata only.
  const legacy = examEvals.data?.content.find(e => e.questionAttemptId === attemptId || e.id === attemptId)
  const examAttemptId = legacy?.examAttemptId ?? attemptId
  const evalQuery = useQuery({
    queryKey: ['attempt-grading', examId, examAttemptId],
    queryFn: () => apiEvaluationService.attemptQuestions(examId, examAttemptId),
    enabled: Boolean(examAttemptId) && !examEvals.isPending,
    retry: false,
  })
  const questions = evalQuery.isSuccess ? evalQuery.data.map(q => ({ ...q.evaluation, questionOrder: q.questionOrder, questionStatus: q.questionStatus })) : []
  const selected = questions.find(e => e.questionAttemptId === params.get('question'))
    ?? questions.find(e => e.questionAttemptId === legacy?.questionAttemptId)
    ?? questions[0]
  const resolvedQuestionAttemptId = selected?.questionAttemptId ?? ''

  const publication = useMutation({
    mutationFn: () => apiEvaluationService.publish(resolvedQuestionAttemptId),
    onSuccess: () => evalQuery.refetch(),
  })
  const evaluation = selected
  const targetQuestionAttemptId = evaluation?.questionAttemptId ?? resolvedQuestionAttemptId

  const candidate = query.data?.candidateStatuses.find(
    c =>
      c.attemptId === attemptId ||
      c.attemptId === resolvedQuestionAttemptId ||
      (evaluation && (
        (evaluation.studentId && c.studentId === evaluation.studentId) ||
        (evaluation.studentCode && c.studentCode === evaluation.studentCode) ||
        (evaluation.examAttemptId && c.attemptId === evaluation.examAttemptId)
      ))
  ) ?? (query.data?.candidateStatuses && query.data.candidateStatuses.length === 1 ? query.data.candidateStatuses[0] : undefined)


  const defaultScores = Object.fromEntries(
    (evaluation?.criteria ?? []).map(c => [c.criterionId, String(c.finalScore ?? c.aiScore ?? '')])
  )

  const [userScores, setUserScores] = useState<Record<string, string> | null>(null)
  const [userNotes, setUserNotes] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState<boolean>(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [isFinalizing, setIsFinalizing] = useState(false)

  const isGraded = evaluation?.status === 'GRADED'
  const confirmed = isGraded && !isEditing

  const scores = userScores ?? defaultScores
  const notes = userNotes ?? evaluation?.overallFeedback ?? ''

  const blocker = useBlocker(({ currentLocation, nextLocation }) =>
    (isFinalizing || triggering || publication.isPending || (!confirmed && (userScores !== null || userNotes !== null))) &&
    (currentLocation.pathname !== nextLocation.pathname ||
      new URLSearchParams(currentLocation.search).get('question') !== new URLSearchParams(nextLocation.search).get('question'))
  )

  const criteria: CriterionReview[] = evaluation
    ? evaluation.criteria.map(c => ({
        id: c.criterionId,
        name: c.criterionName,
        max: c.maxScore,
        ai: c.aiScore ?? 0,
        evidence: c.comment ?? '',
      }))
    : []

  const handleResetToAi = () => {
    if (!evaluation) return
    const aiScores = Object.fromEntries(
      evaluation.criteria.map(c => [c.criterionId, String(c.aiScore ?? '')])
    )
    setUserScores(aiScores)
    setActionMessage('Đã đặt lại về điểm do AI đề xuất ban đầu.')
  }

  const handleTriggerAi = async () => {
    setTriggering(true)
    setActionMessage(null)
    try {
      await apiEvaluationService.gradeWithAi(targetQuestionAttemptId)
      await evalQuery.refetch()
      await examEvals.refetch()
      setActionMessage('Đã nhận gợi ý điểm AI cho câu này.')
    } catch (err: unknown) {
      setActionMessage(err instanceof Error ? err.message : 'Không thể kích hoạt AI chấm điểm.')
    } finally {
      setTriggering(false)
    }
  }

  const handleOpenConfirm = () => {
    const invalid = criteria.find(c => {
      const val = scores[c.id]
      if (val === undefined || val === '') return true
      const num = Number(val)
      return isNaN(num) || num < 0 || num > c.max
    })
    if (invalid) {
      setActionMessage(`Điểm cho tiêu chí "${invalid.name}" phải là số hợp lệ từ 0 đến ${invalid.max}.`)
      return
    }
    setConfirmOpen(true)
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
      const res = await apiEvaluationService.finalizeEvaluation(targetQuestionAttemptId, {
        criteria: criteriaPayload,
        overallFeedback: notes,
      })
      setIsEditing(false)
      setConfirmOpen(false)
      const finalScore = res.finalScore ?? Object.values(scores).reduce((sum, v) => sum + (Number(v) || 0), 0)
      saveStoredGrading(examId, targetQuestionAttemptId, {
        scores,
        notes,
        confirmed: true,
        finalScore,
        finalizedAt: res.updatedAt,
      })
      setActionMessage('Đã lưu điểm câu này. Sinh viên chưa thấy điểm cho đến khi bạn công bố.')
      await evalQuery.refetch()
      await examEvals.refetch()
    } catch (err: unknown) {
      setActionMessage(err instanceof Error ? err.message : 'Chốt điểm thất bại.')
    } finally {
      setIsFinalizing(false)
    }
  }

  if (query.isPending || examEvals.isPending || evalQuery.isPending) return <LoadingPage label="Đang tải lượt thi và kết quả chấm điểm" />
  if (query.isError) {
    return (
      <div className="max-w-7xl mx-auto p-6 space-y-4">
        <ErrorState description={query.error.message} />
        <Button onClick={() => void query.refetch()}>Thử lại</Button>
      </div>
    )
  }

  if (!candidate && !evaluation && !evalQuery.isError) {
    return <ErrorState description="Không tìm thấy lượt thi trong kỳ thi được cấp quyền xem." />
  }

  const transcript: EvidenceLine[] = (evaluation?.transcript ?? []).map(t => ({
    id: t.id,
    turnType: t.turnType,
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
      {examEvals.isError && <Alert tone="danger">Không tải được danh sách câu hỏi. <Button variant="outline" onClick={() => void examEvals.refetch()}>Tải lại danh sách câu hỏi</Button></Alert>}
      {evalQuery.isSuccess && !questions.length && <Alert>Chưa có câu hỏi được gán cho lượt thi này.</Alert>}
      {evalQuery.isError && <Alert tone="danger">Không tải được hội thoại và điểm của câu này. <Button variant="outline" onClick={() => void evalQuery.refetch()}>Thử lại</Button></Alert>}
      <p className="px-4 pt-4 text-sm text-slate-600">Chọn câu → xem hội thoại → lưu điểm → công bố điểm câu đó.</p>
      {questions.length > 0 && <nav aria-label="Chọn câu hỏi chấm điểm" className="flex flex-wrap gap-2 p-4">
        {questions.map(question => {
          const next = new URLSearchParams(params)
          next.set('question', question.questionAttemptId)
          return <div key={question.questionAttemptId} className="flex flex-col items-start gap-1"><Link className={`button ${question.questionAttemptId === resolvedQuestionAttemptId ? 'primary' : 'outline'}`}
            aria-current={question.questionAttemptId === resolvedQuestionAttemptId ? 'page' : undefined}
            title={question.questionContent}
            to={`?${next}`}>
            Câu {question.questionOrder}
          </Link><span className="text-xs text-slate-600">{question.publishedAt ? 'Đã công bố' : question.status === 'GRADED' ? 'Đã lưu điểm' : 'Chưa chấm'}</span></div>
        })}
      </nav>}
      <GradingWorkspaceView
        name={candidate?.studentName ?? evaluation?.studentName ?? 'Thí sinh'}
        code={candidate?.studentCode ?? evaluation?.studentCode ?? attemptId}
        question={evaluation?.questionContent}
        publication={<div className="space-y-2">
          {evaluation?.publishedAt
            ? <p role="status" className="text-sm font-semibold text-emerald-700">Đã công bố điểm câu này</p>
            : <Button disabled={evaluation?.status !== 'GRADED' || isEditing || isFinalizing} pending={publication.isPending}
                onClick={() => { if (window.confirm('Công bố điểm đã chốt của câu này cho sinh viên?')) publication.mutate() }}>
                Công bố điểm câu này
              </Button>}
          {publication.isError && <Alert tone="danger">{publication.error.message}</Alert>}
        </div>}
        transcript={transcript}
        criteria={criteria}
        scores={scores}
        notes={notes}
        aiOverallFeedback={evaluation?.aiOverallFeedback}
        onScore={(id, value) => setUserScores(prev => ({ ...(prev ?? scores), [id]: value }))}
        onNotes={setUserNotes}
        summary={tab.summary}
        confirmed={confirmed}
        status={candidate?.status ?? evaluation?.status}
        notice={
          <div className="space-y-2">
            {evaluation ? (
              <Alert tone="info">
                <strong>{evaluation.aiSuggestedScore !== null && evaluation.aiSuggestedScore !== undefined ? 'Gợi ý từ AI:' : 'Trạng thái chấm điểm:'}</strong>{' '}
                {evaluation.aiSuggestedScore !== null && evaluation.aiSuggestedScore !== undefined ? (
                  <>Điểm đề xuất: <strong>{evaluation.aiSuggestedScore} / {evaluation.maxScore}</strong>. </>
                ) : (
                  <>Chưa có điểm gợi ý từ AI. Giảng viên có thể tự chấm hoặc bấm &quot;Gọi AI chấm điểm&quot;. </>
                )}
                Trạng thái: <strong>{evaluation.status === 'GRADED' ? 'Đã lưu điểm câu này' : 'Chưa lưu điểm câu này'}</strong>.
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
              {tab.summary ? 'Chấm câu này' : 'Xem điểm câu này'}
            </Button>
            {!confirmed && (
              <Button variant="outline" disabled={!evaluation || triggering} onClick={handleTriggerAi}>
                {triggering
                  ? 'Đang gọi AI...'
                  : evaluation?.aiSuggestedScore !== null && evaluation?.aiSuggestedScore !== undefined
                    ? 'Chấm lại bằng AI'
                    : 'Gọi AI chấm điểm'}
              </Button>
            )}
            {evaluation?.publishedAt ? null : confirmed ? (
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                Sửa điểm câu này
              </Button>
            ) : (
              <>
                {evaluation && evaluation.aiSuggestedScore !== null && evaluation.aiSuggestedScore !== undefined && (
                  <Button variant="outline" onClick={handleResetToAi}>
                    Đặt lại điểm AI
                  </Button>
                )}
                <Button
                  disabled={!criteria.length || isFinalizing}
                  onClick={handleOpenConfirm}
                >
                  Lưu điểm câu này
                </Button>
              </>
            )}
          </>
        }
      />

      <Dialog open={blocker.state === 'blocked'}
        onClose={() => blocker.state === 'blocked' && blocker.reset()}
        title="Rời bản chấm điểm chưa lưu?">
        <p>Chỉnh sửa chưa lưu của câu này sẽ bị mất. Hãy lưu điểm trước khi chuyển câu nếu muốn giữ chỉnh sửa.</p>
        <div className="dialog-actions">
          <Button variant="outline" onClick={() => blocker.state === 'blocked' && blocker.reset()}>Tiếp tục chỉnh sửa</Button>
          <Button variant="danger" disabled={isFinalizing || triggering || publication.isPending}
            onClick={() => blocker.state === 'blocked' && blocker.proceed()}>Rời màn hình</Button>
        </div>
      </Dialog>

      {/* Confirm Final Grade Dialog */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} title="Lưu điểm câu này?">
        <p>Lưu điểm và nhận xét cho câu đang chọn. Thao tác này chưa công bố kết quả cho sinh viên.</p>
        <div className="dialog-actions">
          <Button variant="outline" disabled={isFinalizing} onClick={() => setConfirmOpen(false)}>
            Hủy
          </Button>
          <Button pending={isFinalizing} onClick={handleConfirmFinalize}>
            Lưu điểm
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
        aiOverallFeedback={gradingDemo.aiOverallFeedback}
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
