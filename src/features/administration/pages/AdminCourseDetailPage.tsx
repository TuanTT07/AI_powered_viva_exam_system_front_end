import { Link, useNavigate, useParams } from 'react-router-dom'
import { useState } from 'react'
import { Users, Plus, Trash2, UserPlus, BookOpen, ArrowLeft } from 'lucide-react'
import { Alert, Button, Dialog } from '../../../components/ui/primitives'
import { LoadingPage } from '../../../components/common/states'
import { useAssignLecturer, useCourse, useCourseLecturers, useDeleteCourse, useRemoveLecturer } from '../course-hooks'
import { useUsers } from '../user-hooks'
import '../admin.css'

export function AdminCourseDetailPage() {
  const { courseId = '' } = useParams()
  const navigate = useNavigate()
  const course = useCourse(courseId)
  const lecturers = useCourseLecturers(courseId)
  const users = useUsers({ role: 'lecturer', page: 1, size: 100 })
  const assign = useAssignLecturer()
  const remove = useRemoveLecturer()
  const del = useDeleteCourse()

  const [selected, setSelected] = useState('')
  const [target, setTarget] = useState<{ id: string; name: string } | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [feedback, setFeedback] = useState('')

  if (course.isLoading) return <LoadingPage label="Đang tải môn học" />
  if (course.isError || !course.data)
    return (
      <section className="state max-w-xl mx-auto py-12">
        <Alert tone="danger">Không thể tải môn học.</Alert>
        <div className="mt-4 flex gap-3 justify-center">
          <Button onClick={() => course.refetch()}>Thử lại</Button>
          <Link className="button outline" to="/admin/courses">
            Quay lại
          </Link>
        </div>
      </section>
    )

  const assigned = lecturers.data ?? []
  const available = (users.data?.content ?? []).filter((user) => !assigned.some((item) => item.id === user.id))

  return (
    <section className="admin-page">
      {/* Modern Hero Header Banner matching Lecturer style */}
      <header className="admin-hero">
        <div className="admin-hero-content">
          <div className="admin-hero-badge">
            <BookOpen size={14} />
            <span>AIVES · CHI TIẾT HỌC PHẦN &amp; PHÂN CÔNG</span>
          </div>
          <h1 className="admin-hero-title">{course.data.name}</h1>
          <p className="admin-hero-desc">
            Mã học phần: <span className="font-mono font-semibold text-slate-800">{course.data.code}</span> · Khoa / Bộ môn:{' '}
            {course.data.department}
          </p>
        </div>

        <div className="admin-actions">
          <Link className="button outline" to={`/admin/courses?edit=${encodeURIComponent(courseId)}`}>
            Chỉnh sửa môn học
          </Link>
          <Button variant="danger" onClick={() => setDeleting(true)}>
            <Trash2 size={15} />
            <span>Xóa môn học</span>
          </Button>
        </div>
      </header>

      {feedback && <Alert tone="success">{feedback}</Alert>}

      <div className="dashboard-grid">
        {/* Left: Assigned Lecturers */}
        <section className="dashboard-section">
          <div className="section-header-row">
            <div className="flex gap-2.5 items-center">
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                <Users size={18} />
              </div>
              <div>
                <h2 className="section-title">Giảng viên phụ trách</h2>
                <p className="section-subtitle">
                  Giảng viên được cấp quyền biên soạn ngân hàng câu hỏi và tổ chức thi.
                </p>
              </div>
            </div>
            <span className="rounded-md bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 border border-blue-200">
              {assigned.length} giảng viên
            </span>
          </div>

          {lecturers.isLoading ? (
            <LoadingPage label="Đang tải giảng viên" />
          ) : lecturers.isError ? (
            <div className="p-4">
              <Alert tone="danger">Không thể tải danh sách giảng viên.</Alert>
              <div className="mt-2">
                <Button onClick={() => lecturers.refetch()}>Thử lại</Button>
              </div>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100 list-none m-0 p-0">
              {assigned.map((lecturer) => (
                <li
                  key={lecturer.id}
                  className="flex flex-wrap items-center justify-between gap-3 py-3.5 px-2 hover:bg-slate-50/70 transition-colors rounded-xl"
                >
                  <div className="flex gap-3.5 items-center">
                    <span className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                      {lecturer.initials}
                    </span>
                    <div>
                      <Link
                        to={`/admin/users/${encodeURIComponent(lecturer.id)}`}
                        className="text-sm font-semibold text-slate-900 hover:text-blue-600 transition-colors"
                      >
                        {lecturer.name}
                      </Link>
                      <p className="text-xs text-slate-500 mt-0.5">{lecturer.email}</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="button--sm"
                    onClick={() => {
                      remove.reset()
                      setTarget(lecturer)
                    }}
                  >
                    <Trash2 size={14} className="text-rose-600" />
                    <span>Gỡ phân công</span>
                  </Button>
                </li>
              ))}
              {!assigned.length && (
                <li className="p-12 text-center text-sm text-slate-500">
                  Chưa có giảng viên phụ trách học phần này.
                </li>
              )}
            </ul>
          )}
        </section>

        {/* Right: Assign Lecturer Card */}
        <aside className="space-y-6">
          <section className="dashboard-section">
            <div className="section-header-row">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                  <UserPlus size={18} />
                </div>
                <div>
                  <h2 className="section-title">Phân công giảng viên</h2>
                  <p className="section-subtitle">Thêm giảng viên vào học phần.</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5" htmlFor="lecturer-assignment">
                  Chọn giảng viên
                </label>
                <select
                  id="lecturer-assignment"
                  value={selected}
                  disabled={users.isLoading || users.isError || lecturers.isError}
                  onChange={(event) => setSelected(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/80 hover:bg-slate-50 focus:bg-white px-3.5 py-2.5 text-xs text-slate-800 transition-all outline-none"
                >
                  <option value="">Chọn giảng viên để phân công</option>
                  {available.map((user) => (
                    <option value={user.id} key={user.id}>
                      {user.name} · {user.email}
                    </option>
                  ))}
                </select>
              </div>

              {users.isError && (
                <Alert tone="danger">
                  Không thể tải tài khoản giảng viên. <Button onClick={() => users.refetch()}>Thử lại</Button>
                </Alert>
              )}
              {assign.isError && <Alert tone="danger">{assign.error.message}</Alert>}

              <Button
                disabled={!selected || lecturers.isError}
                pending={assign.isPending}
                className="w-full justify-center button primary"
                onClick={() =>
                  assign.mutate(
                    { courseId, lecturerId: selected },
                    {
                      onSuccess: () => {
                        setSelected('')
                        setFeedback('Đã phân công giảng viên.')
                      },
                    }
                  )
                }
              >
                <Plus size={14} />
                <span>Phân công giảng viên</span>
              </Button>
            </div>
          </section>

          <Link className="button outline w-full justify-center inline-flex items-center gap-2" to="/admin/courses">
            <ArrowLeft size={15} />
            <span>Về danh sách môn học</span>
          </Link>
        </aside>
      </div>

      <Dialog
        open={Boolean(target)}
        title="Gỡ phân công giảng viên?"
        onClose={() => {
          if (!remove.isPending) setTarget(null)
        }}
      >
        <p className="text-sm text-slate-600">Gỡ {target?.name} khỏi học phần?</p>
        {remove.isError && <Alert tone="danger">{remove.error.message}</Alert>}
        <div className="dialog-actions">
          <Button variant="outline" disabled={remove.isPending} onClick={() => setTarget(null)}>
            Hủy
          </Button>
          <Button
            variant="danger"
            pending={remove.isPending}
            onClick={() =>
              target &&
              remove.mutate(
                { courseId, lecturerId: target.id },
                {
                  onSuccess: () => {
                    setTarget(null)
                    setFeedback('Đã gỡ phân công giảng viên.')
                  },
                }
              )
            }
          >
            Gỡ phân công
          </Button>
        </div>
      </Dialog>

      <Dialog
        open={deleting}
        title="Xóa môn học?"
        onClose={() => {
          if (!del.isPending) setDeleting(false)
        }}
      >
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
