import { useState, type FormEvent } from 'react'
import { useParams } from 'react-router-dom'
import { Alert, Button, Dialog } from '../../components/ui/primitives'
import { ErrorState, LoadingPage } from '../../components/common/states'
import { useApiExamSchedule, useAssignApiCandidates, useExam } from './exam-hooks'
import { CandidateListView } from './views/CandidateListView'
import { isExamUuid } from './api-exam-scheduling-repository'

export function ApiCandidateListPage() {
  const { examId = '' } = useParams()
  const exam = useExam(examId), schedule = useApiExamSchedule(examId), assign = useAssignApiCandidates()
  const [open, setOpen] = useState(false), [ids, setIds] = useState(''), [error, setError] = useState(''), [feedback, setFeedback] = useState('')
  if (exam.isLoading) return <LoadingPage label="Đang tải kỳ thi" />
  if (exam.isError || !exam.data) return <ErrorState description="Không thể tải thông tin kỳ thi." />
  const editable = exam.data.status === 'DRAFT' || exam.data.status === 'PUBLISHED' || exam.data.status === 'SCHEDULED'
  const submit = (event: FormEvent) => {
    event.preventDefault()
    const studentIds = [...new Set(ids.split(/[\s,;]+/).map(id => id.trim()).filter(Boolean))]
    if (!studentIds.length || studentIds.some(id => !isExamUuid(id))) { setError('Nhập danh sách mã định danh sinh viên hợp lệ được hệ thống cấp.'); return }
    const existing = new Set((schedule.data ?? []).map(row => row.studentId))
    if (studentIds.some(id => existing.has(id))) { setError('Danh sách có sinh viên đã được thêm vào kỳ thi.'); return }
    assign.mutate({ examId, studentIds }, { onSuccess: () => { setOpen(false); setIds(''); setError(''); setFeedback('Đã thêm thí sinh vào kỳ thi.') } })
  }
  return <><CandidateListView examId={examId} examTitle={exam.data.title} rows={(schedule.data ?? []).map(row => ({ id: row.attemptId, name: row.studentName, code: row.studentCode, email: row.studentEmail, slot: row.slotNumber, start: row.scheduledStartTime, end: row.scheduledEndTime, status: row.status }))} actions={editable && <Button onClick={() => setOpen(true)}>Thêm sinh viên</Button>} feedback={feedback && <Alert tone="success">{feedback}</Alert>} loading={schedule.isLoading ? <LoadingPage label="Đang tải danh sách sinh viên" /> : schedule.isError ? <section className="state"><Alert tone="danger">Không thể tải danh sách sinh viên.</Alert><Button onClick={() => schedule.refetch()}>Thử lại</Button></section> : undefined} />
    <Dialog open={open} title="Thêm sinh viên" onClose={() => { if (!assign.isPending) setOpen(false) }}><form onSubmit={submit} className="grid gap-4"><label htmlFor="candidate-ids">Mã định danh sinh viên</label><textarea id="candidate-ids" rows={5} value={ids} onChange={event => { setIds(event.target.value); setError('') }} placeholder="Mỗi mã trên một dòng" className="w-full rounded-lg border border-slate-200 p-3" /><p className="text-sm text-slate-500">Sử dụng mã định danh tài khoản sinh viên được quản trị viên cung cấp.</p>{error && <Alert tone="danger">{error}</Alert>}{assign.isError && <Alert tone="danger">{assign.error.message}</Alert>}<div className="dialog-actions"><Button type="button" variant="outline" disabled={assign.isPending} onClick={() => setOpen(false)}>Hủy</Button><Button type="submit" pending={assign.isPending}>Thêm sinh viên</Button></div></form></Dialog></>
}
