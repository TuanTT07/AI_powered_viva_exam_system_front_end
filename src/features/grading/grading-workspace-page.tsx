import { DemoLabel } from '../../components/common/inline-notice'
import { useEffect, useState } from 'react'
import { Link, useParams, useSearchParams, useBlocker } from 'react-router-dom'
import { Alert, Button, Dialog } from '../../components/ui/primitives'
import { ErrorState, LoadingPage } from '../../components/common/states'
import { runtimeConfig } from '../../services/api/runtime-config'
import { useExamMonitoring, useExamRoster } from '../exams/exam-hooks'
import { GradingWorkspaceView } from './views/GradingWorkspaceView'
import { gradingDemo } from './mocks/grading-demo'

export function GradingWorkspacePage() {
  const { examId = '', attemptId = '' } = useParams()
  return runtimeConfig.dataSource === 'mock' ? <DemoGrading key={`${examId}/${attemptId}`} examId={examId} attemptId={attemptId} /> : <ApiGrading examId={examId} attemptId={attemptId} />
}
function useSummaryTab() {
  const [params, setParams] = useSearchParams()
  return { summary: params.get('tab') === 'summary', toggle: () => setParams(params.get('tab') === 'summary' ? {} : { tab: 'summary' }) }
}
function ApiGrading({ examId, attemptId }: { examId: string; attemptId: string }) {
  const query = useExamMonitoring(examId)
  const tab = useSummaryTab()
  if (query.isPending) return <LoadingPage label="Đang tải lượt thi" />
  if (query.isError) return <><ErrorState description={query.error.message} /><Button onClick={() => void query.refetch()}>Thử lại</Button></>
  const candidate = query.data.candidateStatuses.find(c => c.attemptId === attemptId)
  if (!candidate) return <ErrorState description="Không tìm thấy lượt thi trong kỳ thi được cấp quyền xem." />
  return <section className="source-screen max-w-7xl mx-auto pb-12"><GradingWorkspaceView name={candidate.studentName} code={candidate.studentCode} scores={{}} notes="" onScore={() => {}} onNotes={() => {}} summary={tab.summary} confirmed={false}
    notice={<Alert>Đã tải thông tin lượt thi. Transcript, rubric chấm điểm và lưu điểm chưa được hệ thống hỗ trợ.</Alert>}
    actions={<><Link className="button outline" to={`/lecturer/exams/${examId}/attempts`}>Danh sách lượt thi</Link><Button variant="outline" onClick={tab.toggle}>{tab.summary ? 'Không gian chấm điểm' : 'Tổng kết hồ sơ'}</Button><Button disabled>Chốt điểm</Button></>} /></section>
}
function DemoGrading({ examId, attemptId }: { examId: string; attemptId: string }) {
  const roster = useExamRoster(examId)
  const candidate = roster.data?.find(student => student.id === attemptId)
  const tab = useSummaryTab()
  const [scores, setScores] = useState<Record<string, string>>(() => Object.fromEntries(gradingDemo.criteria.map(c => [c.id, String(c.ai)])))
  const [notes, setNotes] = useState('')
  const [confirmed, setConfirmed] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [saved, setSaved] = useState<string | null>(() => JSON.stringify({ scores: Object.fromEntries(gradingDemo.criteria.map(c => [c.id, String(c.ai)])), notes: '' }))
  const [message, setMessage] = useState('')
  const snapshot = JSON.stringify({ scores, notes })
  const dirty = saved === null ? Object.keys(scores).length > 0 || notes.length > 0 : saved !== snapshot
  const blocker = useBlocker(({ currentLocation, nextLocation }) => dirty && !confirmed && currentLocation.pathname !== nextLocation.pathname)
  useEffect(() => {
    if (!dirty || confirmed) return
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = '' }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty, confirmed])
  const valid = gradingDemo.criteria.every(c => scores[c.id]?.trim() && Number.isFinite(Number(scores[c.id])) && Number(scores[c.id]) >= 0 && Number(scores[c.id]) <= c.max)
  return <section className="source-screen max-w-7xl mx-auto pb-12">
    <GradingWorkspaceView name={candidate?.fullName ?? 'Hồ sơ chấm điểm mẫu'} code={`DEMO · ${candidate?.studentCode ?? attemptId}`} question={gradingDemo.question} transcript={gradingDemo.transcript} criteria={gradingDemo.criteria} demo scores={scores} notes={notes} onScore={(id, value) => { setScores(s => ({ ...s, [id]: value })); setMessage('') }} onNotes={setNotes} summary={tab.summary} confirmed={confirmed}
      notice={<div className="space-y-2"><DemoLabel detail="Dữ liệu demo · Điểm và bằng chứng minh họa. Bản lưu chỉ tồn tại trong màn này; không gửi hoặc công bố lên hệ thống." /><p className="text-xs text-slate-500" role="status">{message || (confirmed ? 'Đã xác nhận điểm demo.' : dirty ? 'Có thay đổi chưa lưu trong phiên demo.' : saved === null ? 'Chưa nhập điểm trong phiên demo.' : 'Đã lưu nháp trong phiên demo.')}</p></div>}
      actions={<><Link className="button outline" to={`/lecturer/exams/${examId}/attempts`}>Danh sách lượt thi</Link><Button variant="outline" onClick={tab.toggle}>{tab.summary ? 'Chấm điểm' : 'Tổng kết hồ sơ'}</Button><Button variant="outline" disabled={confirmed || !dirty} onClick={() => { setSaved(snapshot); setMessage('Đã lưu nháp trong phiên demo.') }}>Lưu nháp demo</Button><Button disabled={confirmed} onClick={() => valid ? setConfirmOpen(true) : setMessage('Nhập đầy đủ điểm từ 0 đến điểm tối đa của từng tiêu chí.')}>{confirmed ? 'Đã xác nhận demo' : 'Xác nhận điểm demo'}</Button></>} />
    <Dialog open={blocker.state === 'blocked'} onClose={() => blocker.state === 'blocked' && blocker.reset()} title="Rời bản chấm điểm chưa lưu?"><p>Các chỉnh sửa demo chưa lưu sẽ bị mất khi rời màn này.</p><div className="dialog-actions"><Button variant="outline" onClick={() => blocker.state === 'blocked' && blocker.reset()}>Tiếp tục chỉnh sửa</Button><Button variant="danger" onClick={() => blocker.state === 'blocked' && blocker.proceed()}>Rời màn hình</Button></div></Dialog>
    <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} title="Xác nhận điểm demo?"><p>Bạn sẽ khóa chỉnh sửa điểm trong phiên demo này. Đây không phải điểm chính thức và không công bố cho sinh viên.</p><div className="dialog-actions"><Button variant="outline" onClick={() => setConfirmOpen(false)}>Hủy</Button><Button onClick={() => { setConfirmed(true); setSaved(snapshot); setConfirmOpen(false); setMessage('Đã xác nhận điểm demo. Chưa có điểm chính thức trên hệ thống.') }}>Xác nhận demo</Button></div></Dialog>
  </section>
}
