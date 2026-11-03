import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Alert, Button, Dialog } from '../../../components/ui/primitives'
import { listCourseStudents, updateCourseEnrollment, type CourseStudent } from '../course-students-api'
import { useUsers } from '../user-hooks'

export function CourseEnrollmentPanel({ courseId }: { courseId: string }) {
  const [keyword, setKeyword] = useState('')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState('')
  const [remove, setRemove] = useState<CourseStudent | null>(null)
  const client = useQueryClient()
  const key = ['course-students', courseId]
  const roster = useQuery({ queryKey: [...key, 'admin'], queryFn: () => listCourseStudents(courseId, 'admin') })
  const users = useUsers({ role: 'student', keyword, page, size: 20 })
  const update = useMutation({
    mutationFn: ({ id, method }: { id: string; method: 'PUT' | 'DELETE' }) =>
      updateCourseEnrollment(courseId, id, method),
    onSuccess: async () => {
      setSelected('')
      setRemove(null)
      await client.invalidateQueries({ queryKey: key })
    },
  })
  const enrolled = new Set(roster.data?.map(student => student.id))
  const available = users.data?.content.filter(student => !enrolled.has(student.id)) ?? []

  return <section className="dashboard-section">
    <h2 className="section-title">Sinh viên ghi danh</h2>
    <p className="section-subtitle">Giảng viên sẽ thấy các sinh viên này khi chọn thí sinh cho kỳ thi của môn.</p>
    {roster.isPending && <p>Đang tải danh sách…</p>}
    {roster.isError && <Alert tone="danger">Không thể tải danh sách. <Button onClick={() => roster.refetch()}>Thử lại</Button></Alert>}
    {roster.isSuccess && <>
      <ul className="divide-y divide-slate-100">
        {roster.data.map(student => <li key={student.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
          <span>{student.userCode} · {student.fullName} · {student.email}</span>
          <Button variant="outline" disabled={update.isPending} onClick={() => { update.reset(); setRemove(student) }}>Gỡ ghi danh</Button>
        </li>)}
        {!roster.data.length && <li>Chưa có sinh viên ghi danh.</li>}
      </ul>
      <div className="grid gap-2 mt-4">
        <label htmlFor="enrollment-search">Tìm tài khoản sinh viên</label>
        <input id="enrollment-search" className="rounded-lg border p-2" value={keyword} onChange={event => { setKeyword(event.target.value); setPage(1); setSelected('') }} />
        <label htmlFor="enrollment-student">Chọn sinh viên</label>
        <select id="enrollment-student" className="rounded-lg border p-2" value={selected} onChange={event => setSelected(event.target.value)}>
          <option value="">Chọn sinh viên để ghi danh</option>
          {available.map(student => <option key={student.id} value={student.id}>{student.identifier} · {student.name}</option>)}
        </select>
        {users.isError && <Alert tone="danger">Không thể tải tài khoản sinh viên. <Button onClick={() => users.refetch()}>Thử lại</Button></Alert>}
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" disabled={page <= 1 || users.isFetching} onClick={() => { setSelected(''); setPage(page - 1) }}>Trang trước</Button>
          <Button variant="outline" disabled={users.isFetching || page >= (users.data?.totalPages ?? 0)} onClick={() => { setSelected(''); setPage(page + 1) }}>Trang sau</Button>
          <Button disabled={!available.some(student => student.id === selected)} pending={update.isPending && !remove} onClick={() => update.mutate({ id: selected, method: 'PUT' })}>Ghi danh</Button>
        </div>
        {update.isError && !remove && <Alert tone="danger">{update.error.message}</Alert>}
      </div>
    </>}
    <Dialog open={!!remove} title="Gỡ ghi danh?" onClose={() => { if (!update.isPending) setRemove(null) }}>
      <p>Gỡ {remove?.fullName} khỏi danh sách sinh viên của môn?</p>
      {update.isError && <Alert tone="danger">{update.error.message}</Alert>}
      <div className="dialog-actions">
        <Button variant="outline" disabled={update.isPending} onClick={() => setRemove(null)}>Hủy</Button>
        <Button variant="danger" pending={update.isPending} onClick={() => remove && update.mutate({ id: remove.id, method: 'DELETE' })}>Gỡ ghi danh</Button>
      </div>
    </Dialog>
  </section>
}
