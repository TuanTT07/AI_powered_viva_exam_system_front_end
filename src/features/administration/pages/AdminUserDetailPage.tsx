import { Link, useParams } from 'react-router-dom'
import { useState } from 'react'
import { Alert, Button } from '../../../components/ui/primitives'
import { useResetUserPassword, useUpdateUser, useUser, useUserCourses } from '../user-hooks'
import { useRoles } from '../role-hooks'
import { ArrowLeft, User, KeyRound, BookOpen, AlertCircle, Loader2, Save, X, Sparkles } from 'lucide-react'

export function AdminUserDetailPage() {
  const { userId = '' } = useParams()

  const userQuery = useUser(userId)
  const coursesQuery = useUserCourses(userQuery.data?.role === 'lecturer' ? userId : null)
  const rolesQuery = useRoles()

  const update = useUpdateUser()
  const reset = useResetUserPassword()

  const [feedback, setFeedback] = useState('')
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('LECTURER')
  const [password, setPassword] = useState('')

  if (userQuery.isLoading) return (
    <div className="flex justify-center items-center h-screen bg-slate-50">
      <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
    </div>
  )

  const user = userQuery.data
  if (userQuery.isError || !user) return (
    <div className="flex flex-col items-center justify-center h-screen bg-slate-50 text-red-500">
      <AlertCircle className="w-12 h-12 mb-4" />
      <h2 className="text-xl font-semibold">Không tìm thấy tài khoản hoặc bạn không có quyền.</h2>
      <Link to="/admin/users" className="mt-4 text-blue-600 hover:underline font-medium">Quay lại danh sách</Link>
    </div>
  )

  const beginEdit = () => {
    setName(user.name)
    setEmail(user.email)
    setRole(user.role.toUpperCase())
    setEditing(true)
  }

  const isLecturer = user.role.toLowerCase() === 'lecturer'

  return (
    <section className="source-screen max-w-7xl mx-auto space-y-6 pb-16">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 p-6 sm:p-8 text-white shadow-sm border border-slate-800">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-medium text-blue-200">
              <Sparkles size={13} className="text-amber-400" />
              <span>Hồ sơ &amp; phân quyền người dùng</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {user.name}
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed font-mono">
              Mã định danh: {user.identifier} · {user.email}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/admin/users"
              className="button outline"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Quay lại</span>
            </Link>
          </div>
        </div>
      </div>

      {feedback && <Alert tone="success">{feedback}</Alert>}
      {rolesQuery.isError && <Alert tone="danger">Không thể tải vai trò. <Button onClick={() => rolesQuery.refetch()}>Thử lại</Button></Alert>}
      {update.isError && <Alert tone="danger">{update.error.message}</Alert>}
      {reset.isError && <Alert tone="danger">{reset.error.message}</Alert>}
      {coursesQuery.isError && <Alert tone="danger">Không thể tải môn học phụ trách. <Button onClick={() => coursesQuery.refetch()}>Thử lại</Button></Alert>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: User Info Card */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-6 sm:p-7 overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600">
                  <User className="w-5 h-5" />
                </div>
                <h2 className="text-base font-bold text-slate-900">Thông tin tài khoản</h2>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                user.role.toLowerCase() === 'admin'
                  ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
                  : user.role.toLowerCase() === 'lecturer'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200/60'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
              }`}>
                {user.role === 'lecturer' ? 'Giảng viên' : user.role === 'student' ? 'Sinh viên' : 'Quản trị viên'}
              </span>
            </div>

            {editing ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  update.mutate({ id: user.id, fullName: name, email, roleName: role }, { onSuccess: () => setEditing(false) })
                }}
                className="space-y-4"
              >
                <div>
                  <label htmlFor="admin-user-name" className="block text-xs font-semibold text-slate-700 mb-1.5">Họ tên</label>
                  <input
                    type="text"
                    className="w-full bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-sm transition-all"
                    id="admin-user-name" value={name} onChange={e => setName(e.target.value)} required
                  />
                </div>
                <div>
                  <label htmlFor="admin-user-email" className="block text-xs font-semibold text-slate-700 mb-1.5">Email</label>
                  <input
                    id="admin-user-email" type="email"
                    className="w-full bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-sm transition-all"
                    value={email} onChange={e => setEmail(e.target.value)} required
                  />
                </div>
                <div>
                  <label htmlFor="admin-user-role" className="block text-xs font-semibold text-slate-700 mb-1.5">Vai trò</label>
                  <select
                    id="admin-user-role" disabled={rolesQuery.isLoading || rolesQuery.isError} value={role} onChange={e => setRole(e.target.value)}
                    className="w-full bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm transition-all"
                  >
                    {(rolesQuery.data || []).map(r => <option key={r.id} value={r.roleName}>{r.roleName}</option>)}
                  </select>
                </div>
                <div className="flex items-center gap-3 pt-3">
                  <button type="submit" disabled={update.isPending || rolesQuery.isLoading || rolesQuery.isError} className="button primary inline-flex items-center gap-2">
                    <Save className="w-4 h-4" /> Lưu
                  </button>
                  <button type="button" onClick={() => setEditing(false)} className="button outline inline-flex items-center gap-2">
                    <X className="w-4 h-4" /> Hủy
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Họ tên</p>
                  <p className="text-base font-bold text-slate-900">{user.name}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Mã số / Định danh</p>
                  <p className="text-slate-800 font-mono text-sm bg-slate-50 border border-slate-200/60 inline-block px-3 py-1 rounded-lg font-medium">{user.identifier}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Email</p>
                  <p className="text-slate-700 font-mono text-sm">{user.email}</p>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <button onClick={beginEdit} className="button primary">
                    Chỉnh sửa thông tin
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Môn học phụ trách */}
          {isLecturer && (
            <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-6 sm:p-7 overflow-hidden">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-4">
                <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Môn học phụ trách</h3>
              </div>

              {coursesQuery.isLoading ? (
                <div className="flex justify-center p-4"><Loader2 className="w-5 h-5 text-blue-600 animate-spin" /></div>
              ) : coursesQuery.data?.length ? (
                <ul className="space-y-2.5 list-none p-0 m-0">
                  {coursesQuery.data.map(course => (
                    <li key={course.id} className="bg-slate-50/80 border border-slate-200/60 rounded-xl p-3.5 hover:border-blue-200 hover:bg-blue-50/40 transition-colors">
                      <Link to={`/admin/courses/${course.id}`} className="flex items-center gap-2 group">
                        <span className="font-mono font-bold text-xs text-slate-800 group-hover:text-blue-700 transition-colors px-2 py-0.5 rounded bg-white border border-slate-200/80">{course.code}</span>
                        <span className="text-slate-600 text-sm group-hover:text-blue-600 transition-colors font-medium">— {course.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-500 italic">Chưa được phân công môn học nào.</p>
              )}
            </div>
          )}
        </div>

        {/* Right: Reset Password Card */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-6 overflow-hidden">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3 mb-4">
              <div className="p-2.5 bg-amber-50 rounded-xl text-amber-600">
                <KeyRound className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Đặt lại mật khẩu</h3>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                reset.mutate({ id: user.id, newPassword: password }, {
                  onSuccess: () => {
                    setPassword('')
                    setFeedback('Đã đặt lại mật khẩu.')
                  }
                })
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="admin-reset-password">
                  Mật khẩu mới
                </label>
                <input
                  id="admin-reset-password"
                  aria-label="Mật khẩu mới"
                  type="password"
                  minLength={6}
                  placeholder="Mật khẩu mới (tối thiểu 6 ký tự)"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="w-full bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={reset.isPending || password.length < 6}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white rounded-xl px-4 py-2.5 transition-colors font-medium text-xs shadow-sm disabled:opacity-50"
              >
                {reset.isPending ? 'Đang xử lý...' : 'Đặt lại'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}

