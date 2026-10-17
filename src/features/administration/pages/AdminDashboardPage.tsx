import { BookOpen, Users, ShieldCheck, ArrowRight, Sparkles, Activity } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Alert, Button } from '../../../components/ui/primitives'
import { LoadingPage } from '../../../components/common/states'
import { useUsers } from '../user-hooks'
import { useCourses } from '../course-hooks'
import { useRoles } from '../role-hooks'

export function AdminDashboardPage() {
  const users = useUsers({ page: 1, size: 5 })
  const courses = useCourses({ page: 1, size: 5 })
  const roles = useRoles()

  return (
    <section className="source-screen max-w-7xl mx-auto space-y-6 pb-16">
      {/* Admin Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 p-6 sm:p-8 text-white shadow-sm border border-slate-800">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-medium text-blue-200">
              <Sparkles size={13} className="text-amber-400" />
              <span>Cổng quản trị AIVES</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Tổng Quan Quản Trị Hệ Thống
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Quản lý tài khoản, học phần và phân công giảng viên.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link className="button outline" to="/admin/users">
              <Users size={15} />
              Quản lý người dùng
            </Link>
            <Link className="button primary" to="/admin/courses">
              <BookOpen size={15} />
              Quản lý môn học
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">TỔNG TÀI KHOẢN</span>
            <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Users size={18} />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 font-mono">
              {users.data?.totalElements ?? '—'}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Sinh viên &amp; Giảng viên</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">TỔNG HỌC PHẦN</span>
            <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <BookOpen size={18} />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-indigo-600 font-mono">
              {courses.data?.totalElements ?? '—'}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Học phần đào tạo</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">VAI TRÒ HỆ THỐNG</span>
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <ShieldCheck size={18} />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-emerald-600 font-mono">
              {roles.data?.length ?? '—'}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Phân quyền RBAC</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">HẠ TẦNG &amp; VẬN HÀNH</span>
            <span className="p-2 rounded-xl bg-violet-50 text-violet-600">
              <Activity size={18} />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-base font-bold text-emerald-700 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Sẵn sàng phục vụ</span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">AI engine &amp; WebSockets</p>
          </div>
        </div>
      </div>

      {/* 2-Column Overview Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Users Card */}
        <section className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs flex flex-col justify-between">
          <div>
            <div className="p-4 sm:p-5 border-b border-slate-100 flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                  <Users size={17} />
                </div>
                <h2 className="text-sm font-bold text-slate-900">Danh mục tài khoản</h2>
              </div>
              <Link className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex gap-1 items-center" to="/admin/users">
                Xem tất cả
                <ArrowRight size={13} />
              </Link>
            </div>

            {users.isLoading ? (
              <LoadingPage label="Đang tải tài khoản" />
            ) : users.isError ? (
              <div className="p-5">
                <Alert tone="danger">Không thể tải tài khoản.</Alert>
                <div className="mt-2">
                  <Button onClick={() => users.refetch()}>Thử lại</Button>
                </div>
              </div>
            ) : (
              <ul className="divide-y divide-slate-100 list-none p-0 m-0">
                {users.data?.content.map(user => (
                  <li key={user.id} className="p-4 sm:p-5 flex justify-between items-center gap-3 hover:bg-slate-50/70 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                        {user.initials}
                      </span>
                      <div>
                        <Link className="text-sm font-semibold text-slate-900 hover:text-blue-600 transition-colors" to={`/admin/users/${encodeURIComponent(user.id)}`}>
                          {user.name}
                        </Link>
                        <p className="text-xs text-slate-500 mt-0.5">{user.email}</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 uppercase">
                      {user.role}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* Courses Card */}
        <section className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs flex flex-col justify-between">
          <div>
            <div className="p-4 sm:p-5 border-b border-slate-100 flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                  <BookOpen size={17} />
                </div>
                <h2 className="text-sm font-bold text-slate-900">Danh mục học phần</h2>
              </div>
              <Link className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex gap-1 items-center" to="/admin/courses">
                Xem tất cả
                <ArrowRight size={13} />
              </Link>
            </div>

            {courses.isLoading ? (
              <LoadingPage label="Đang tải học phần" />
            ) : courses.isError ? (
              <div className="p-5">
                <Alert tone="danger">Không thể tải học phần.</Alert>
                <div className="mt-2">
                  <Button onClick={() => courses.refetch()}>Thử lại</Button>
                </div>
              </div>
            ) : (
              <ul className="divide-y divide-slate-100 list-none p-0 m-0">
                {courses.data?.content.map(course => (
                  <li key={course.id} className="p-4 sm:p-5 flex justify-between items-center gap-3 hover:bg-slate-50/70 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-mono font-bold text-xs shrink-0">
                        {course.code.slice(0, 3)}
                      </span>
                      <div>
                        <Link className="text-sm font-semibold text-slate-900 hover:text-indigo-600 transition-colors" to={`/admin/courses/${encodeURIComponent(course.id)}`}>
                          {course.name}
                        </Link>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {course.code} · {course.department}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>

      {roles.isError && (
        <Alert tone="danger">
          Không thể tải danh sách phân quyền.{' '}
          <Button variant="outline" onClick={() => roles.refetch()}>
            Thử lại
          </Button>
        </Alert>
      )}
    </section>
  )
}

