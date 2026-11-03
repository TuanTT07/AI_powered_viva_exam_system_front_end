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
      {!!available.length && <>
        <Button type="button" variant="outline" disabled={assign.isPending} onClick={() => setIds(studentIds.length === available.length ? [] : available.map(student => student.id))}>
          {studentIds.length === available.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
        </Button>
        <div className="max-h-72 overflow-auto">
          <table className="w-full text-left">
            <thead><tr><th scope="col">Chọn</th><th scope="col">Mã sinh viên</th><th scope="col">Họ tên</th><th scope="col">Email</th></tr></thead>
            <tbody>{available.map(student => <tr key={student.id}>
              <td><input type="checkbox" aria-label={`Chọn ${student.fullName}`} checked={ids.includes(student.id)} disabled={assign.isPending}
                onChange={event => { setError(''); setIds(previous => event.target.checked ? [...previous, student.id] : previous.filter(id => id !== student.id)) }} /></td>
              <td>{student.userCode}</td><td>{student.fullName}</td><td>{student.email}</td>
            </tr>)}</tbody>
          </table>
        </div>
      </>}{error && <Alert tone="danger">{error}</Alert>}{assign.isError && <Alert tone="danger">{assign.error.message}</Alert>}<div className="dialog-actions"><Button type="button" variant="outline" disabled={assign.isPending} onClick={() => setOpen(false)}>Hủy</Button><Button type="submit" disabled={!studentIds.length || !schedule.isSuccess || !roster.isSuccess} pending={assign.isPending}>Thêm sinh viên</Button></div></form></Dialog></>
}
