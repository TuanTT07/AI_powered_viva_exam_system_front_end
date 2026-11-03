import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  CalendarDays,
  Headphones,
  FileText,
  Clock,
  Award,
  Sparkles,
  ShieldCheck,
  GraduationCap,
} from 'lucide-react'
import { useSession } from '../../../app/providers/use-session'
import { runtimeConfig } from '../../../services/api/runtime-config'
import { ApiError } from '../../../services/api/client'
import { Button } from '../../../components/ui/primitives'
import { EmptyState, ErrorState, LoadingPage, PermissionDenied } from '../../../components/common/states'
import { DemoLabel } from '../../../components/common/inline-notice'
import { useStudentExams } from '../../exams/exam-hooks'
import { studentExamPath } from '../../exams/student-exam-navigation'
import '../../students/student.css'

function OverviewLayout({
  name,
  children,
  stats,
}: {
  name: string
  children: ReactNode
  stats?: {
    total?: number
    ready?: number
  }
}) {
  return (
    <section className="student-page">
      {/* Modern Hero Greeting Banner matching Lecturer style */}
      <header className="student-hero">
        <div className="student-hero-content">
          <div className="student-hero-badge">
            <GraduationCap size={14} />
            <span>AIVES · CỔNG KHẢO THÍ SINH VIÊN</span>
          </div>
          <h1 className="student-hero-title">Tổng quan</h1>
          <p className="student-hero-desc">
            Xin chào, {name} 👋 · Theo dõi lịch thi cá nhân, kiểm tra thiết bị và tra cứu kết quả vấn đáp trực tuyến.
          </p>
        </div>
        <div className="student-actions">
          <Link className="button primary" to="/student/exams">
            <CalendarDays size={16} />
            <span>Lịch thi của tôi</span>
          </Link>
          <Link className="button outline" to="/device-check">
            <Headphones size={16} />
            <span>Kiểm tra thiết bị</span>
          </Link>
        </div>
      </header>

      {/* 4 Modern KPI Metric Cards */}
      <section className="student-metric-grid" aria-label="Chỉ số tổng quan sinh viên">
        <div className="metric-card metric-card--blue">
          <div className="metric-header">
            <span className="metric-label">Ca thi được phân</span>
            <div className="metric-icon-wrap metric-icon-wrap--blue">
              <CalendarDays size={20} />
            </div>
          </div>
          <strong className="metric-value">{stats?.total ?? 0}</strong>
          <span className="metric-hint">Theo tài khoản đăng nhập</span>
        </div>

        <div className="metric-card metric-card--indigo">
          <div className="metric-header">
            <span className="metric-label">Ca sẵn sàng vào</span>
            <div className="metric-icon-wrap metric-icon-wrap--indigo">
              <Clock size={20} />
            </div>
          </div>
          <strong className="metric-value">{stats?.ready ?? 0}</strong>
          <span className="metric-hint">Có thể tham gia ngay</span>
        </div>

        <Link to="/device-check" className="metric-card metric-card--emerald" title="Kiểm tra micro và loa">
          <div className="metric-header">
            <span className="metric-label">Thiết bị ngoại vi</span>
            <div className="metric-icon-wrap metric-icon-wrap--emerald">
              <Headphones size={20} />
            </div>
          </div>
          <strong className="metric-value">2 / 2</strong>
          <span className="metric-hint">Micro &amp; Loa · Bấm để thử</span>
        </Link>

        <Link to="/student/results" className="metric-card metric-card--amber" title="Xem bảng điểm và biên bản">
          <div className="metric-header">
            <span className="metric-label">Kết quả khảo thí</span>
            <div className="metric-icon-wrap metric-icon-wrap--amber">
              <Award size={20} />
            </div>
          </div>
          <strong className="metric-value">Tra cứu</strong>
          <span className="metric-hint">Biên bản &amp; Điểm số chính thức</span>
        </Link>
      </section>

      {/* 2-column Dashboard Grid matching Lecturer */}
      <div className="dashboard-grid">
        <div className="space-y-6">
          {children}
        </div>

        <aside className="space-y-6">
          <div className="dashboard-section">
            <div className="section-header-row">
              <div>
                <h2 className="section-title">Tiện ích khảo thí</h2>
                <p className="section-subtitle">Lối tắt tác vụ sinh viên thường dùng.</p>
              </div>
            </div>

            <nav aria-label="Tiện ích sinh viên" className="student-nav-grid">
              {[
                { to: '/student/exams', icon: CalendarDays, title: 'Kỳ thi của tôi', detail: 'Xem toàn bộ lịch thi được phân công' },
                { to: '/student/results', icon: FileText, title: 'Kết quả & biên bản', detail: 'Tra cứu bảng điểm và nhận xét của giảng viên' },
                { to: '/device-check', icon: Headphones, title: 'Kiểm tra thiết bị', detail: 'Thử micro và loa trước khi vào phòng thi' },
              ].map(({ to, icon: Icon, title, detail }) => (
                <Link key={to} to={to} className="student-nav-card group">
                  <div className="student-nav-icon">
                    <Icon size={20} aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="student-nav-title">{title}</span>
                    <span className="student-nav-desc">{detail}</span>
                  </div>
                  <ArrowRight size={15} className="shrink-0 text-slate-400 group-hover:text-blue-600 transition-colors" aria-hidden="true" />
                </Link>
              ))}
            </nav>

            <div className="student-security-card">
              <ShieldCheck size={20} className="shrink-0 text-blue-600 mt-0.5" />
              <p>
                <strong>Quy chế thi vấn đáp AI:</strong> Điểm gợi ý từ AI chỉ trở thành điểm chính thức sau khi giảng viên xác nhận trên hệ thống.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </section>
  )
}

function ApiStudentOverview() {
  const { session } = useSession()
  const result = useStudentExams({ page: 0, size: 20 })
  const user = session.user
  if (!user) return <ErrorState description="Bạn cần đăng nhập để xem tổng quan." />
  if (!user.roles.includes('student') || (result.error instanceof ApiError && result.error.status === 403)) {
    return <PermissionDenied />
  }

  // The API returns newest schedules first. Prioritize a current attempt without
  // presenting this page of assignments as a global nearest-exam calculation.
  const data = !result.isPending && !result.isError ? result.data : undefined
  const featured = ['IN_PROGRESS', 'READY', 'SCHEDULED']
    .map((status) => data?.content.find((slot) => slot.status === status))
    .find(Boolean)
  const headline =
    featured?.status === 'IN_PROGRESS'
      ? 'Tiếp tục bài thi'
      : featured?.status === 'READY'
        ? 'Ca thi sẵn sàng'
        : 'Ca thi được phân'
  const start = featured?.scheduledStartTime
  const startLabel =
    start && Number.isFinite(Date.parse(start))
      ? new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(start))
      : 'Chưa xếp giờ'
  const readyCount = data?.content.filter((slot) => slot.status === 'READY' || slot.status === 'IN_PROGRESS').length ?? 0

  return (
    <OverviewLayout
      name={user.displayName}
      stats={{
        total: data?.totalElements ?? data?.content.length ?? 0,
        ready: readyCount,
      }}
    >
      {result.isPending ? (
        <LoadingPage label="Đang tải tổng quan" />
      ) : result.isError ? (
        <div className="space-y-3">
          <ErrorState description={result.error.message} />
          <Button variant="outline" onClick={() => void result.refetch()}>
            Thử lại
          </Button>
        </div>
      ) : (
        <section className="dashboard-section" aria-labelledby="overview-exam-title">
          <div className="section-header-row">
            <div>
              <h2 id="overview-exam-title" className="section-title">Ca thi cần chú ý</h2>
              <p className="section-subtitle">Ca thi được ưu tiên tham gia trong đợt này.</p>
            </div>
            <Link to="/student/exams" className="button outline button--sm">
              <span>Xem tất cả{data ? ` (${data.totalElements})` : ''}</span>
              <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>
          {data && data.totalElements > data.content.length && (
            <p className="mb-4 text-xs font-medium text-slate-500">Ưu tiên trong {data.content.length} ca gần đây.</p>
          )}
          {featured ? (
            <article className="student-featured-card">
              <div className="student-featured-header">
                <span className="inline-flex items-center gap-1.5 font-semibold text-xs text-blue-700">
                  <Sparkles size={14} />
                  <span>{headline}</span>
                </span>
                <span className="rounded-md bg-blue-100/70 text-blue-800 px-2 py-0.5 text-xs font-semibold">
                  {featured.courseCode}
                </span>
              </div>
              <div className="student-featured-body">
                <div>
                  <h3 className="break-words text-xl font-bold tracking-tight text-slate-900">{featured.examTitle}</h3>
                  <p className="text-sm text-slate-500 mt-1">
                    {featured.courseName} · {featured.slotNumber == null ? 'Chưa phân ca' : `Ca ${featured.slotNumber}`}
                  </p>
                </div>
                <div className="student-featured-meta">
                  <div className="student-featured-meta-item">
                    <CalendarDays size={16} className="text-slate-400" aria-hidden="true" />
                    <span>{startLabel}</span>
                  </div>
                </div>
                <div className="student-featured-footer">
                  {featured.status !== 'SCHEDULED' && (
                    <Link
                      className="button primary"
                      to={studentExamPath(featured.examId, featured.attemptId, 'check')}
                    >
                      {featured.status === 'IN_PROGRESS' ? 'Tiếp tục thi' : 'Chuẩn bị vào thi'}
                      <ArrowRight size={15} aria-hidden="true" />
                    </Link>
                  )}
                  <Link
                    className="button outline"
                    to={studentExamPath(featured.examId, featured.attemptId)}
                  >
                    Chi tiết ca thi
                  </Link>
                </div>
              </div>
            </article>
          ) : (
            <EmptyState
              title={data?.totalElements ? 'Chưa có ca cần tham gia trong lịch gần đây' : 'Bạn chưa có lịch thi'}
              description={
                data?.totalElements
                  ? 'Xem toàn bộ lịch thi hoặc tra cứu kết quả bên dưới.'
                  : 'Lịch sẽ xuất hiện khi giảng viên phân ca.'
              }
            />
          )}
        </section>
      )}
    </OverviewLayout>
  )
}

export function StudentDashboard() {
  const { session } = useSession()
  return runtimeConfig.dataSource === 'api' ? (
    <ApiStudentOverview />
  ) : (
    <OverviewLayout name={session.user?.displayName ?? 'Sinh viên'}>
      <DemoLabel detail="Chế độ mô phỏng · Mở Kỳ thi của tôi để xem ca mẫu." />
    </OverviewLayout>
  )
}
