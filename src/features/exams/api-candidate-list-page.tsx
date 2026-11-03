import { useState, type FormEvent } from 'react'
import { useParams } from 'react-router-dom'
import { Alert, Button, Dialog } from '../../components/ui/primitives'
import { ErrorState, LoadingPage } from '../../components/common/states'
import { useApiExamSchedule, useAssignApiCandidates, useExam } from './exam-hooks'
import { CandidateListView } from './views/CandidateListView'
import { useQuery } from '@tanstack/react-query'
import { listCourseStudents } from '../administration/course-students-api'

export function ApiCandidateListPage() {
  const { examId = '' } = useParams()
  const exam = useExam(examId), schedule = useApiExamSchedule(examId), assign = useAssignApiCandidates()
  const [open, setOpen] = useState(false), [ids, setIds] = useState<string[]>([]), [error, setError] = useState(''), [feedback, setFeedback] = useState('')
  const courseId = exam.data?.subjectId ?? ''
  const roster = useQuery({
    queryKey: ['course-students', courseId, 'lecturers'],
    queryFn: () => listCourseStudents(courseId, 'lecturers'),
    enabled: open && !!courseId,
  })
  const existing = new Set(schedule.data?.map(row => row.studentId))
  const available = roster.data?.filter(student => !existing.has(student.id)) ?? []
  const studentIds = available.filter(student => ids.includes(student.id)).map(student => student.id)
  if (exam.isLoading) return <LoadingPage label="Đang tải kỳ thi" />
  if (exam.isError || !exam.data) return <ErrorState description="Không thể tải thông tin kỳ thi." />
  const editable = exam.data.status === 'DRAFT' || exam.data.status === 'PUBLISHED' || exam.data.status === 'SCHEDULED'
  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (!studentIds.length || !schedule.isSuccess || !roster.isSuccess) { setError('Hãy chọn sinh viên từ danh sách.'); return }
    assign.mutate({ examId, studentIds }, { onSuccess: () => { setOpen(false); setIds([]); setError(''); setFeedback('Đã thêm thí sinh vào kỳ thi.') } })
  }
  return <><CandidateListView examId={examId} examTitle={exam.data.title} rows={(schedule.data ?? []).map(row => ({ id: row.attemptId, name: row.studentName, code: row.studentCode, email: row.studentEmail, slot: row.slotNumber, start: row.scheduledStartTime, end: row.scheduledEndTime, status: row.status }))} actions={editable && <Button onClick={() => { setIds([]); setError(''); assign.reset(); setOpen(true) }}>Thêm sinh viên</Button>} feedback={feedback && <Alert tone="success">{feedback}</Alert>} loading={schedule.isLoading ? <LoadingPage label="Đang tải danh sách sinh viên" /> : schedule.isError ? <section className="state"><Alert tone="danger">Không thể tải danh sách sinh viên.</Alert><Button onClick={() => schedule.refetch()}>Thử lại</Button></section> : undefined} />
    <Dialog open={open} title="Thêm sinh viên" onClose={() => { if (!assign.isPending) setOpen(false) }}><form onSubmit={submit} className="grid gap-4">{roster.isPending && <p>Đang tải sinh viên của môn…</p>}
      {roster.isError && <Alert tone="danger">Không thể tải danh sách sinh viên của môn. <Button type="button" onClick={() => roster.refetch()}>Thử lại</Button></Alert>}
      {roster.isSuccess && !available.length && <p>Không có sinh viên ghi danh nào để thêm vào kỳ thi.</p>}
      {!!available.length && <div className="overflow-hidden rounded-xl border border-slate-200">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-slate-50 px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-slate-900">Sinh viên của môn</p>
            <p aria-live="polite" className="text-xs text-slate-600">Đã chọn {studentIds.length} / {available.length}</p>
          </div>
          <Button type="button" variant="outline" className="button--sm" disabled={assign.isPending} onClick={() => setIds(studentIds.length === available.length ? [] : available.map(student => student.id))}>
            {studentIds.length === available.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
          </Button>
        </div>
        <ul className="m-0 max-h-72 list-none divide-y divide-slate-100 overflow-y-auto p-0">
          {available.map(student => {
            const checked = ids.includes(student.id)
            return <li key={student.id}>
              <label className={`flex cursor-pointer items-start gap-3 px-4 py-3 transition-colors ${checked ? 'bg-blue-50' : 'hover:bg-slate-50'}`}>
                <input type="checkbox" aria-label={`Chọn ${student.fullName}`} checked={checked} disabled={assign.isPending}
                  className="mt-1 h-4 w-4 shrink-0 accent-blue-600"
                  onChange={event => { setError(''); setIds(previous => event.target.checked ? [...previous, student.id] : previous.filter(id => id !== student.id)) }} />
                <div className="flex min-w-0 flex-1 flex-wrap items-start justify-between gap-x-3 gap-y-1">
                  <div className="min-w-0">
                    <p className="break-words text-sm font-semibold text-slate-900">{student.fullName}</p>
                    <p className="break-all text-xs text-slate-600">{student.email}</p>
                  </div>
                  <span className="max-w-full break-all rounded-md bg-slate-100 px-2 py-1 font-mono text-xs text-slate-700">{student.userCode}</span>
                </div>
              </label>
            </li>
          })}
        </ul>
      </div>}{error && <Alert tone="danger">{error}</Alert>}{assign.isError && <Alert tone="danger">{assign.error.message}</Alert>}<div className="dialog-actions"><Button type="button" variant="outline" disabled={assign.isPending} onClick={() => setOpen(false)}>Hủy</Button><Button type="submit" disabled={!studentIds.length || !schedule.isSuccess || !roster.isSuccess} pending={assign.isPending}>{studentIds.length ? `Thêm ${studentIds.length} sinh viên` : 'Thêm sinh viên'}</Button></div></form></Dialog></>
}
