import { useState } from 'react'
import { AlertCircle, GraduationCap, UserPlus } from 'lucide-react'
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
    <header className="section-header-row flex-wrap gap-3">
      <div className="flex items-center gap-3">
        <span className="rounded-xl bg-blue-50 p-2.5 text-blue-700"><GraduationCap size={20} aria-hidden="true" /></span>
        <div>
          <h2 className="section-title">Sinh viên ghi danh</h2>
          <p className="section-subtitle">Danh sách sinh viên giảng viên có thể chọn cho kỳ thi của môn.</p>
        </div>
      </div>
      {roster.isSuccess && <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">{roster.data.length} sinh viên</span>}
    </header>
    {roster.isPending && <p role="status" className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">Đang tải danh sách…</p>}
    {roster.isError && <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
      <div role="alert" className="flex items-center gap-2 text-sm font-medium text-rose-800">
        <AlertCircle size={16} aria-hidden="true" /> Không thể tải danh sách sinh viên.
      </div>
      <Button variant="outline" className="button--sm shrink-0" pending={roster.isFetching} onClick={() => roster.refetch()}>Thử lại</Button>
    </div>}
    {roster.isSuccess && <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.65fr)]">
      <ul className="m-0 list-none divide-y divide-slate-100 rounded-xl border border-slate-200 px-4">
        {roster.data.map(student => <li key={student.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900">{student.fullName}</p>
            <p className="break-words text-xs text-slate-600">{student.userCode} · {student.email}</p>
          </div>
          <Button variant="outline" disabled={update.isPending} onClick={() => { update.reset(); setRemove(student) }}>Gỡ ghi danh</Button>
        </li>)}
        {!roster.data.length && <li className="px-2 py-10 text-center text-sm text-slate-600">Chưa có sinh viên ghi danh.</li>}
      </ul>
      <div className="grid content-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900"><UserPlus size={16} aria-hidden="true" /> Thêm sinh viên vào môn</h3>
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
    </div>}
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
