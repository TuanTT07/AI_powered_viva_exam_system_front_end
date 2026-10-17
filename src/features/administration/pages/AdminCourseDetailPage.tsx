import { Link, useNavigate, useParams } from 'react-router-dom'
import { useState } from 'react'
import { Users, Plus, Trash2, Sparkles, UserPlus } from 'lucide-react'
import { Alert, Button, Dialog } from '../../../components/ui/primitives'
import { LoadingPage } from '../../../components/common/states'
import { useAssignLecturer, useCourse, useCourseLecturers, useDeleteCourse, useRemoveLecturer } from '../course-hooks'
import { useUsers } from '../user-hooks'

export function AdminCourseDetailPage() {
  const { courseId = '' } = useParams(), navigate = useNavigate(), course = useCourse(courseId), lecturers = useCourseLecturers(courseId), users = useUsers({ role: 'lecturer', page: 1, size: 100 }), assign = useAssignLecturer(), remove = useRemoveLecturer(), del = useDeleteCourse()
  const [selected, setSelected] = useState(''), [target, setTarget] = useState<{ id: string; name: string } | null>(null), [deleting, setDeleting] = useState(false), [feedback, setFeedback] = useState('')

  if (course.isLoading) return <LoadingPage label="Đang tải môn học" />
  if (course.isError || !course.data) return (
    <section className="state max-w-xl mx-auto py-12">
      <Alert tone="danger">Không thể tải môn học.</Alert>
      <div className="mt-4 flex gap-3 justify-center">
        <Button onClick={() => course.refetch()}>Thử lại</Button>
        <Link className="button outline" to="/admin/courses">Quay lại</Link>
      </div>
    </section>
  )

  const assigned = lecturers.data ?? []
  const available = (users.data?.content ?? []).filter(user => !assigned.some(item => item.id === user.id))

  return (
    <section className="source-screen max-w-7xl mx-auto space-y-6 pb-16">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 p-6 sm:p-8 text-white shadow-sm border border-slate-800">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-medium text-blue-200">
              <Sparkles size={13} className="text-amber-400" />
              <span>Học phần &amp; phân công</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {course.data.name}
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed font-mono">
              {course.data.code} · {course.data.department}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link className="button outline" to={`/admin/courses?edit=${encodeURIComponent(courseId)}`}>
              Chỉnh sửa môn học
            </Link>
            <Button variant="danger" onClick={() => setDeleting(true)}>
              Xóa môn học
            </Button>
          </div>
        </div>
      </div>

      {feedback && <Alert tone="success">{feedback}</Alert>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Assigned Lecturers */}
        <section className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs flex flex-col justify-between">
          <div>
            <div className="p-4 sm:p-5 border-b border-slate-100 flex gap-2.5 items-center">
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                <Users size={17} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Giảng viên phụ trách</h2>
                <p className="text-xs text-slate-500">Giảng viên được cấp quyền biên soạn ngân hàng câu hỏi và tổ chức thi.</p>
              </div>
            </div>

            {lecturers.isLoading ? (
              <LoadingPage label="Đang tải giảng viên" />
            ) : lecturers.isError ? (
              <div className="p-5">
                <Alert tone="danger">Không thể tải danh sách giảng viên.</Alert>
                <div className="mt-2">
                  <Button onClick={() => lecturers.refetch()}>Thử lại</Button>
                </div>
              </div>
            ) : (
              <ul className="divide-y divide-slate-100 list-none m-0 p-0">
                {assigned.map(lecturer => (
                  <li key={lecturer.id} className="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5 hover:bg-slate-50/70 transition-colors">
                    <div className="flex gap-3.5 items-center">
                      <span className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                        {lecturer.initials}
                      </span>
                      <div>
                        <Link to={`/admin/users/${encodeURIComponent(lecturer.id)}`} className="text-sm font-semibold text-slate-900 hover:text-blue-600 transition-colors">
                          {lecturer.name}
                        </Link>
                        <p className="text-xs text-slate-500 mt-0.5">{lecturer.email}</p>
                      </div>
                    </div>
                    <Button variant="outline" onClick={() => { remove.reset(); setTarget(lecturer) }}>
                      <Trash2 size={14} className="text-rose-600" />
                      Gỡ phân công
                    </Button>
                  </li>
                ))}
                {!assigned.length && (
                  <li className="p-12 text-center text-sm text-slate-500">
                    Chưa có giảng viên phụ trách.
                  </li>
                )}
              </ul>
            )}
          </div>
        </section>

        {/* Right: Assign Lecturer Card */}
        <aside className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 space-y-4 self-start shadow-xs">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <UserPlus size={18} />
            </div>
            <h2 className="text-sm font-bold text-slate-900">Phân công giảng viên</h2>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5" htmlFor="lecturer-assignment">
              Chọn giảng viên
            </label>
            <select
              id="lecturer-assignment"
              value={selected}
              disabled={users.isLoading || users.isError || lecturers.isError}
              onChange={event => setSelected(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/80 hover:bg-slate-50 focus:bg-white px-3.5 py-2.5 text-xs text-slate-800 transition-all"
            >
              <option value="">Chọn giảng viên để phân công</option>
              {available.map(user => (
                <option value={user.id} key={user.id}>
                  {user.name} · {user.email}
                </option>
              ))}
            </select>
          </div>

          {users.isError && (
            <Alert tone="danger">
              Không thể tải tài khoản giảng viên.{' '}
              <Button onClick={() => users.refetch()}>Thử lại</Button>
            </Alert>
          )}
          {assign.isError && <Alert tone="danger">{assign.error.message}</Alert>}

          <Button
            disabled={!selected || lecturers.isError}
            pending={assign.isPending}
            className="w-full justify-center"
            onClick={() => assign.mutate({ courseId, lecturerId: selected }, { onSuccess: () => { setSelected(''); setFeedback('Đã phân công giảng viên.') } })}
          >
            <Plus size={14} />
            Phân công
          </Button>
        </aside>
      </div>

      <div className="pt-2">
        <Link className="button outline" to="/admin/courses">
          Về danh sách môn học
        </Link>
      </div>

      <Dialog open={Boolean(target)} title="Gỡ phân công giảng viên?" onClose={() => { if (!remove.isPending) setTarget(null) }}>
        <p className="text-sm text-slate-600">
          Gỡ {target?.name} khỏi học phần?
        </p>
        {remove.isError && <Alert tone="danger">{remove.error.message}</Alert>}
        <div className="dialog-actions">
          <Button variant="outline" disabled={remove.isPending} onClick={() => setTarget(null)}>
            Hủy
          </Button>
          <Button
            variant="danger"
            pending={remove.isPending}
            onClick={() => target && remove.mutate({ courseId, lecturerId: target.id }, { onSuccess: () => { setTarget(null); setFeedback('Đã gỡ phân công giảng viên.') } })}
          >
            Gỡ phân công
          </Button>
        </div>
      </Dialog>

      <Dialog open={deleting} title="Xóa môn học?" onClose={() => { if (!del.isPending) setDeleting(false) }}>
        <p className="text-sm text-slate-600">
          Môn học đã có câu hỏi hoặc kỳ thi có thể không được phép xóa.
        </p>
        {del.isError && <Alert tone="danger">{del.error.message}</Alert>}
        <div className="dialog-actions">
          <Button variant="outline" disabled={del.isPending} onClick={() => setDeleting(false)}>
            Hủy
          </Button>
          <Button
            variant="danger"
            pending={del.isPending}
            onClick={() => del.mutate(courseId, { onSuccess: () => navigate('/admin/courses') })}
          >
            Xóa môn học
          </Button>
        </div>
      </Dialog>
    </section>
  )
}

