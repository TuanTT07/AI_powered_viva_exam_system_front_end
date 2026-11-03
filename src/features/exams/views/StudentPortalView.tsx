import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
  Calendar,
  GraduationCap,
  ArrowRight,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Headphones,
  Mic,
  Sparkles,
  Filter,
} from 'lucide-react'
import type { ExamSession } from '../exam-types'
import { examStatusMeta } from '../exam-types'
import { StatusBadge } from '../../../components/common/states'
import '../../students/student.css'

export function StudentPortalView({
  name,
  exams,
  apiMode,
  list = false,
  apiContent,
  assignedCount,
  joinableCount,
  filtered = false,
}: {
  name: string
  exams?: ExamSession[]
  apiMode: boolean
  list?: boolean
  apiContent?: ReactNode
  assignedCount?: number
  joinableCount?: number
  filtered?: boolean
}) {
  const upcomingCount = exams?.filter((e) => e.status === 'SCHEDULED' || e.status === 'IN_PROGRESS').length ?? 0

  return (
    <section className="student-page">
      {/* Modern Hero Greeting / Header Banner matching Lecturer style */}
      <header className="student-hero">
        <div className="student-hero-content">
          <div className="student-hero-badge">
            <Sparkles size={14} />
            <span>AIVES · CỔNG KHẢO THÍ SINH VIÊN</span>
          </div>
          <h1 className="student-hero-title">{list ? 'Kỳ thi của tôi' : `Xin chào, ${name} 👋`}</h1>
          <p className="student-hero-desc">
            Theo dõi lịch thi cá nhân, kiểm tra thiết bị và chuẩn bị tốt nhất cho các phiên thi vấn đáp trực tuyến.
          </p>
        </div>

        <div className="student-actions">
          <Link className="button outline" to="/student/results">
            <GraduationCap size={16} />
            <span>Kết quả &amp; biên bản</span>
          </Link>
          <Link className="button outline" to="/device-check">
            <Headphones size={16} />
            <span>Kiểm tra thiết bị</span>
          </Link>
        </div>
      </header>

      {/* 4 Modern KPI Metric Cards */}
      <section className="student-metric-grid" aria-label="Chỉ số khảo thí">
        {apiMode && list ? (
          <>
            <div className="metric-card metric-card--blue">
              <div className="metric-header">
                <span className="metric-label">{filtered ? 'Ca theo bộ lọc' : 'Ca thi được phân'}</span>
                <div className="metric-icon-wrap metric-icon-wrap--blue">
                  <Calendar size={20} />
                </div>
              </div>
              <strong className="metric-value">{assignedCount ?? '—'}</strong>
              <span className="metric-hint">Theo tài khoản đăng nhập</span>
            </div>

            <div className="metric-card metric-card--indigo">
              <div className="metric-header">
                <span className="metric-label">Ca sẵn sàng vào</span>
                <div className="metric-icon-wrap metric-icon-wrap--indigo">
                  <Clock size={20} />
                </div>
              </div>
              <strong className="metric-value">{joinableCount ?? '—'}</strong>
              <span className="metric-hint">Trong trang hiện tại</span>
            </div>

            <div className="metric-card metric-card--amber">
              <div className="metric-header">
                <span className="metric-label">Bộ lọc trạng thái</span>
                <div className="metric-icon-wrap metric-icon-wrap--amber">
                  <Filter size={20} />
                </div>
              </div>
              <strong className="metric-value" style={{ fontSize: '1.4rem' }}>
                {filtered ? 'Đang lọc' : 'Tất cả'}
              </strong>
              <span className="metric-hint">Trạng thái ca thi</span>
            </div>

            <div className="metric-card metric-card--emerald">
              <div className="metric-header">
                <span className="metric-label">Hệ thống khảo thí</span>
                <div className="metric-icon-wrap metric-icon-wrap--emerald">
                  <ShieldCheck size={20} />
                </div>
              </div>
              <strong className="metric-value" style={{ fontSize: '1.4rem' }}>
                Trực tuyến
              </strong>
              <span className="metric-hint">Sẵn sàng kết nối AI</span>
            </div>
          </>
        ) : (
          <>
            <div className="metric-card metric-card--blue">
              <div className="metric-header">
                <span className="metric-label">{apiMode ? (filtered ? 'Ca theo bộ lọc' : 'Ca thi được phân') : 'Kỳ thi tham gia'}</span>
                <div className="metric-icon-wrap metric-icon-wrap--blue">
                  <Calendar size={20} />
                </div>
              </div>
              <strong className="metric-value">
                {apiMode ? assignedCount ?? '—' : exams?.length ?? 0}
              </strong>
              <span className="metric-hint">Được phân công</span>
            </div>

            <div className="metric-card metric-card--indigo">
              <div className="metric-header">
                <span className="metric-label">{apiMode ? 'Ca có thể vào' : 'Ca thi sắp tới'}</span>
                <div className="metric-icon-wrap metric-icon-wrap--indigo">
                  <Clock size={20} />
                </div>
              </div>
              <strong className="metric-value">
                {apiMode ? joinableCount ?? '—' : `${upcomingCount} ca`}
              </strong>
              <span className="metric-hint">
                {upcomingCount > 0 ? 'Cần chuẩn bị' : 'Đang cập nhật'}
              </span>
            </div>

            <Link to="/device-check" className="metric-card metric-card--emerald" title="Kiểm tra micro và loa">
              <div className="metric-header">
                <span className="metric-label">Thiết bị ngoại vi</span>
                <div className="metric-icon-wrap metric-icon-wrap--emerald">
                  <Mic size={20} />
                </div>
              </div>
              <strong className="metric-value" style={{ fontSize: '1.4rem' }}>
                Sẵn sàng test
              </strong>
              <span className="metric-hint">Micro &amp; Loa · Bấm để thử</span>
            </Link>

            <div className="metric-card metric-card--amber">
              <div className="metric-header">
                <span className="metric-label">Quy chế thi</span>
                <div className="metric-icon-wrap metric-icon-wrap--amber">
                  <ShieldCheck size={20} />
                </div>
              </div>
              <strong className="metric-value" style={{ fontSize: '1.4rem' }}>
                Bảo mật AI
              </strong>
              <span className="metric-hint">Biên bản minh bạch</span>
            </div>
          </>
        )}
      </section>

      {/* Main Content Area */}
      {apiMode ? (
        <div className="space-y-4">
          <section className="min-w-0">{apiContent}</section>
          <aside className="flex flex-col gap-4 rounded-xl border border-blue-100 bg-blue-50/60 p-5 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-center gap-2.5 text-sm font-semibold text-blue-950">
              <ShieldCheck size={18} className="shrink-0 text-blue-600" aria-hidden="true" />
              <span>Chuẩn bị trước khi dự thi</span>
            </div>
            <ul className="m-0 flex list-none flex-wrap gap-x-6 gap-y-2 p-0 text-xs text-slate-600">
              {['Không gian yên tĩnh', 'Micro và tai nghe hoạt động tốt', 'Kết nối mạng ổn định'].map((tip) => (
                <li key={tip} className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="shrink-0 text-emerald-600" aria-hidden="true" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
            <Link
              to="/device-check"
              className="inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-blue-700 shadow-xs border border-blue-200 hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600"
            >
              Kiểm tra thiết bị <ArrowRight size={13} aria-hidden="true" />
            </Link>
          </aside>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">
              Danh sách ca thi được phân công ({exams?.length ?? 0})
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {exams?.map((exam) => {
              const statusMeta = examStatusMeta[exam.status]
              return (
                <article
                  key={exam.id}
                  className="student-slot-item flex flex-col justify-between p-5 space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-center gap-3">
                      <span className="subject-code-badge">{exam.subjectCode}</span>
                      <StatusBadge
                        label={statusMeta.label}
                        tone={exam.status === 'IN_PROGRESS' || exam.status === 'SCHEDULED' ? 'info' : 'neutral'}
                      />
                    </div>

                    <div>
                      <h3 className="student-slot-title">{exam.title}</h3>
                      <p className="student-slot-course mt-1">{exam.subjectName}</p>
                    </div>

                    <div className="student-slot-times pt-1">
                      <span className="student-slot-time-item">
                        <Calendar size={14} className="text-slate-400" />
                        {new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium' }).format(new Date(exam.scheduledAt))}
                      </span>
                      <span className="student-slot-time-item">
                        <Clock size={14} className="text-slate-400" />
                        {exam.durationMinutes} phút
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5 pt-3 border-t border-slate-100">
                    <Link
                      className="button outline button--sm"
                      to={`/student/exams/${encodeURIComponent(exam.id)}`}
                    >
                      Chi tiết ca thi
                    </Link>
                    <Link
                      className="button primary button--sm"
                      to={`/student/exams/${encodeURIComponent(exam.id)}/check`}
                    >
                      Kiểm tra thiết bị
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      )}
    </section>
  )
}
