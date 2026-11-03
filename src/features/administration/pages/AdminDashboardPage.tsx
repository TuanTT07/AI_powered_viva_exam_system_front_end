import { BookOpen, Users, ShieldCheck, ArrowRight, Sparkles, Activity } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Alert, Button } from '../../../components/ui/primitives'
import { LoadingPage } from '../../../components/common/states'
import { useUsers } from '../user-hooks'
import { useCourses } from '../course-hooks'
import { useRoles } from '../role-hooks'
import '../admin.css'

export function AdminDashboardPage() {
  const users = useUsers({ page: 1, size: 5 })
  const courses = useCourses({ page: 1, size: 5 })
  const roles = useRoles()

  return (
    <section className="admin-page">
      {/* Modern Hero Header Banner matching Lecturer style */}
      <header className="admin-hero">
        <div className="admin-hero-content">
          <div className="admin-hero-badge">
            <Sparkles size={14} />
            <span>AIVES · CỔNG QUẢN TRỊ HỆ THỐNG</span>
          </div>
          <h1 className="admin-hero-title">Tổng Quan Quản Trị Hệ Thống</h1>
          <p className="admin-hero-desc">
            Điều phối tài khoản, danh mục học phần và phân công giảng viên trong toàn trường.
          </p>
        </div>

        <div className="admin-actions">
          <Link className="button outline" to="/admin/users">
            <Users size={16} />
            <span>Quản lý người dùng</span>
          </Link>
          <Link className="button primary" to="/admin/courses">
            <BookOpen size={16} />
            <span>Quản lý môn học</span>
          </Link>
        </div>
      </header>

      {/* 4 KPI Summary Cards matching Lecturer Metric style */}
      <section className="admin-metric-grid" aria-label="Chỉ số hệ thống">
        <div className="metric-card metric-card--blue">
          <div className="metric-header">
            <span className="metric-label">Tổng tài khoản</span>
            <div className="metric-icon-wrap metric-icon-wrap--blue">
              <Users size={20} />
            </div>
          </div>
          <strong className="metric-value">{users.data?.totalElements ?? '—'}</strong>
          <span className="metric-hint">Sinh viên &amp; Giảng viên</span>
        </div>

        <div className="metric-card metric-card--indigo">
          <div className="metric-header">
            <span className="metric-label">Tổng học phần</span>
            <div className="metric-icon-wrap metric-icon-wrap--indigo">
              <BookOpen size={20} />
            </div>
          </div>
          <strong className="metric-value">{courses.data?.totalElements ?? '—'}</strong>
          <span className="metric-hint">Học phần đào tạo</span>
        </div>

        <div className="metric-card metric-card--emerald">
          <div className="metric-header">
            <span className="metric-label">Vai trò hệ thống</span>
            <div className="metric-icon-wrap metric-icon-wrap--emerald">
              <ShieldCheck size={20} />
            </div>
          </div>
          <strong className="metric-value">{roles.data?.length ?? '—'}</strong>
          <span className="metric-hint">Phân quyền RBAC</span>
        </div>

        <div className="metric-card metric-card--amber">
          <div className="metric-header">
            <span className="metric-label">Hạ tầng &amp; Vận hành</span>
            <div className="metric-icon-wrap metric-icon-wrap--amber">
              <Activity size={20} />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-1 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <strong className="text-xl font-bold text-slate-900">Sẵn sàng</strong>
          </div>
          <span className="metric-hint">AI engine &amp; WebSockets</span>
        </div>
      </section>

      {/* 2-Column Dashboard Grid */}
      <div className="dashboard-grid">
        {/* Users Card */}
        <section className="dashboard-section">
          <div className="section-header-row">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                <Users size={18} />
              </div>
              <div>
                <h2 className="section-title">Danh mục tài khoản</h2>
                <p className="section-subtitle">Tài khoản được cập nhật gần đây.</p>
              </div>
            </div>
            <Link className="button outline button--sm" to="/admin/users">
              <span>Xem tất cả</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {users.isLoading ? (
            <LoadingPage label="Đang tải tài khoản" />
          ) : users.isError ? (
            <div className="p-4">
              <Alert tone="danger">Không thể tải tài khoản.</Alert>
              <div className="mt-2">
                <Button onClick={() => users.refetch()}>Thử lại</Button>
              </div>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100 list-none p-0 m-0">
              {users.data?.content.map((user) => (
                <li
                  key={user.id}
                  className="py-3.5 flex justify-between items-center gap-3 hover:bg-slate-50/70 transition-colors rounded-xl px-2"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                      {user.initials}
                    </span>
                    <div>
                      <Link
                        className="text-sm font-semibold text-slate-900 hover:text-blue-600 transition-colors"
                        to={`/admin/users/${encodeURIComponent(user.id)}`}
                      >
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
        </section>

        {/* Courses Card */}
        <section className="dashboard-section">
          <div className="section-header-row">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                <BookOpen size={18} />
              </div>
              <div>
                <h2 className="section-title">Danh mục học phần</h2>
                <p className="section-subtitle">Môn học và phân công giảng viên.</p>
              </div>
            </div>
            <Link className="button outline button--sm" to="/admin/courses">
              <span>Xem tất cả</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {courses.isLoading ? (
            <LoadingPage label="Đang tải học phần" />
          ) : courses.isError ? (
            <div className="p-4">
              <Alert tone="danger">Không thể tải học phần.</Alert>
              <div className="mt-2">
                <Button onClick={() => courses.refetch()}>Thử lại</Button>
              </div>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100 list-none p-0 m-0">
              {courses.data?.content.map((course) => (
                <li
                  key={course.id}
                  className="py-3.5 flex justify-between items-center gap-3 hover:bg-slate-50/70 transition-colors rounded-xl px-2"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-mono font-bold text-xs shrink-0">
                      {course.code.slice(0, 3)}
                    </span>
                    <div>
                      <Link
                        className="text-sm font-semibold text-slate-900 hover:text-indigo-600 transition-colors"
                        to={`/admin/courses/${encodeURIComponent(course.id)}`}
                      >
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
