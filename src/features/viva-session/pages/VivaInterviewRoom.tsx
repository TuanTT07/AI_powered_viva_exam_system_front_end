import { UnsavedChangesGuard } from '../../../components/common/unsaved-changes-guard'
import { InlineNotice, DemoLabel } from '../../../components/common/inline-notice'
import { useEffect, useReducer, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useSession } from '../../../app/providers/use-session'
import { Alert, Button } from '../../../components/ui/primitives'
import { ErrorState, LoadingPage } from '../../../components/common/states'
import { useStudentMySlot } from '../../exams/exam-hooks'
import { runtimeConfig } from '../../../services/api/runtime-config'
import { useOnline } from '../../../hooks/use-online'
import { VivaSessionView } from '../views/VivaSessionView'
import { demoPrompts, demoSessionReducer, formatDemoTime, initialDemoSession, type DemoPhase } from '../mocks/demo-session'

export function VivaInterviewRoom() {
  const { examId = '' } = useParams()
  return runtimeConfig.dataSource === 'mock' ? <DemoRoom key={examId} examId={examId} /> : <ApiRoom examId={examId} />
}
function ApiRoom({ examId }: { examId: string }) {
  const { session } = useSession()
  const online = useOnline()
  const slot = useStudentMySlot(examId, session.user?.id)
  if (slot.isPending) return <LoadingPage label="Đang xác minh ca thi" />
  if (slot.isError) return <><ErrorState description={slot.error.message} /><Button onClick={() => void slot.refetch()}>Thử lại</Button></>
  if (!slot.data) return <ErrorState description="Không tìm thấy ca thi được cấp quyền." />
  return <VivaSessionView name={session.user?.displayName ?? 'Sinh viên'} title={slot.data.examTitle} phase="Chưa có kết nối phiên vấn đáp" timer="—" progress={`Ca ${slot.data.slotNumber}`} transcript={[]} connection={online ? 'Có mạng · chưa kết nối máy chủ phiên thi' : 'Mất kết nối mạng'} notice={<InlineNotice>Chưa thể bắt đầu vấn đáp: kết nối realtime, ghi âm và xác nhận câu trả lời chưa được hệ thống hỗ trợ. Không có câu trả lời nào được gửi từ màn này.</InlineNotice>} controls={<><Button disabled>Bắt đầu trả lời</Button><Link className="button outline" to={`/student/exams/${examId}`}>Quay lại ca thi</Link></>} />
}
const phaseLabels: Record<DemoPhase, string> = { READY: 'Sẵn sàng mô phỏng', AI_SPEAKING: 'Đang trình bày câu hỏi mẫu', WAITING_FOR_ANSWER: 'Chờ câu trả lời demo', RECORDING: 'Đang nhập câu trả lời demo', TRANSCRIBING: 'Mô phỏng nhận transcript', AI_PROCESSING: 'Mô phỏng AI xử lý', FOLLOW_UP: 'Chuẩn bị câu hỏi phụ demo', NEXT_QUESTION: 'Chọn bước tiếp theo trong demo', COMPLETING: 'Đang hoàn tất mô phỏng', COMPLETED: 'Đã hoàn tất mô phỏng', TIMEOUT: 'Hết thời gian demo' }
function DemoRoom({ examId }: { examId: string }) {
  const { session } = useSession()
  const navigate = useNavigate()
  const online = useOnline()
  const [state, dispatch] = useReducer(demoSessionReducer, initialDemoSession)
  const [draft, setDraft] = useState('')
  const [interrupted, setInterrupted] = useState(() => !navigator.onLine)
  useEffect(() => {
    const pause = () => setInterrupted(true)
    window.addEventListener('offline', pause)
    return () => window.removeEventListener('offline', pause)
  }, [])
  const frozen = !online || interrupted
  useEffect(() => {
    if (frozen || ['READY', 'COMPLETED', 'TIMEOUT'].includes(state.phase)) return
    const timer = window.setInterval(() => dispatch({ type: 'tick' }), 1000)
    return () => window.clearInterval(timer)
  }, [state.phase, frozen])
  useEffect(() => {
    if (frozen) return
    const action = state.phase === 'AI_SPEAKING' || state.phase === 'FOLLOW_UP' ? 'listen' : state.phase === 'TRANSCRIBING' ? 'transcribed' : state.phase === 'AI_PROCESSING' ? 'analyzed' : state.phase === 'COMPLETING' ? 'complete' : null
    if (!action) return
    const timer = window.setTimeout(() => dispatch({ type: action }), 1000)
    return () => window.clearTimeout(timer)
  }, [state.phase, frozen])
  useEffect(() => {
    if (state.phase === 'COMPLETED') navigate(`/student/exams/${examId}/completed`, { replace: true, state: { demoCompleted: true } })
  }, [state.phase, navigate, examId])
  return <><UnsavedChangesGuard when={!['READY', 'COMPLETING', 'COMPLETED', 'TIMEOUT'].includes(state.phase)} /><VivaSessionView name={session.user?.displayName ?? 'Sinh viên'} title="Phòng thi vấn đáp · Demo" phase={phaseLabels[state.phase]} timer={formatDemoTime(state.remaining)} progress={`Câu ${state.index + 1}/${demoPrompts.length} · Hỏi phụ ${state.followUps}/2`} question={state.transcript.filter(l => l.role === 'ai').at(-1)?.text} transcript={state.transcript} connection={frozen ? 'Demo đang tạm dừng do mất mạng' : 'Phiên mô phỏng cục bộ'}
    notice={<div className="space-y-2"><DemoLabel label="Phiên mô phỏng" detail="Câu hỏi mẫu và xử lý mô phỏng; nhập câu trả lời để thử luồng, không ghi âm hoặc STT." />{frozen && <Alert tone="danger">Phiên demo đã tạm dừng. Kết nối lại rồi nhấn tiếp tục.<Button variant="outline" disabled={!online} onClick={() => setInterrupted(false)}>Tiếp tục demo</Button></Alert>}</div>}
    draft={state.phase === 'RECORDING' ? <label className="block text-xs text-slate-600 font-semibold">Câu trả lời demo (chưa gửi)<textarea className="input mt-2 w-full" style={{ minHeight: 112 }} value={draft} onChange={e => setDraft(e.target.value)} disabled={frozen} /></label> : undefined}
    controls={<>{state.phase === 'READY' && <Button disabled={frozen} onClick={() => dispatch({ type: 'start' })}>Bắt đầu demo</Button>}{state.phase === 'WAITING_FOR_ANSWER' && <Button disabled={frozen} onClick={() => dispatch({ type: 'record' })}>Nhập câu trả lời demo</Button>}{state.phase === 'RECORDING' && <Button disabled={frozen || !draft.trim()} onClick={() => { dispatch({ type: 'submit', text: draft }); setDraft('') }}>Hoàn tất câu trả lời demo</Button>}{state.phase === 'NEXT_QUESTION' && <><Button disabled={frozen} onClick={() => dispatch({ type: 'next' })}>{state.index + 1 === demoPrompts.length ? 'Hoàn tất mô phỏng' : 'Sang câu tiếp theo'}</Button><Button variant="outline" disabled={frozen || state.followUps >= 2} onClick={() => dispatch({ type: 'followup' })}>Mô phỏng câu hỏi phụ</Button></>}{state.phase === 'TIMEOUT' && <InlineNotice>Demo đã hết giờ. Không có bài thi nào được nộp lên hệ thống.</InlineNotice>}<Link className="button outline" to={`/student/exams/${examId}`}>Rời phiên demo</Link></>} /></>
}
