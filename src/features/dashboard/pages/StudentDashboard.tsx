import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, CalendarDays, Headphones, FileText } from 'lucide-react'
import { useSession } from '../../../app/providers/use-session'
import { runtimeConfig } from '../../../services/api/runtime-config'
import { ApiError } from '../../../services/api/client'
import { Button } from '../../../components/ui/primitives'
import { EmptyState, ErrorState, LoadingPage, PermissionDenied } from '../../../components/common/states'
import { DemoLabel } from '../../../components/common/inline-notice'
import { useStudentExams } from '../../exams/exam-hooks'
import { studentExamPath } from '../../exams/student-exam-navigation'

function OverviewLayout({ name, children }: { name: string; children: ReactNode }) {
  return (
    <section className="source-screen mx-auto max-w-5xl space-y-6 pb-10">
      <header className="space-y-1 border-l-4 border-blue-600 pl-4">
        <p className="text-sm text-slate-500">Xin chào, {name}</p>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Tổng quan</h1>
      </header>
      {children}
      <nav aria-label="Tiện ích sinh viên" className="grid gap-3 sm:grid-cols-3">
        {[
          { to: '/student/exams', icon: CalendarDays, title: 'Kỳ thi của tôi', detail: 'Xem toàn bộ lịch thi' },
          { to: '/student/results', icon: FileText, title: 'Kết quả & biên bản', detail: 'Tra cứu bài thi' },
          { to: '/device-check', icon: Headphones, title: 'Kiểm tra thiết bị', detail: 'Thử micro và loa' },
        ].map(({ to, icon: Icon, title, detail }) => (
          <Link key={to} to={to} className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:border-blue-300 hover:bg-blue-50/40 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600"><Icon size={20} aria-hidden="true" /></span>
            <div className="min-w-0 flex-1"><span className="block text-sm font-semibold text-slate-900">{title}</span><span className="block text-xs text-slate-500">{detail}</span></div>
            <ArrowRight size={15} className="shrink-0 text-slate-400 group-hover:text-blue-600" aria-hidden="true" />
          </Link>
        ))}
      </nav>
    </section>
  )
}

function ApiStudentOverview() {
  const { session } = useSession()
  const result = useStudentExams({ page: 0, size: 20 })
  const user = session.user
  if (!user) return <ErrorState description="Bạn cần đăng nhập để xem tổng quan." />
  if (!user.roles.includes('student') || result.error instanceof ApiError && result.error.status === 403) return <PermissionDenied />

  // The API returns newest schedules first. Prioritize a current attempt without
  // presenting this page of assignments as a global nearest-exam calculation.
  const data = !result.isPending && !result.isError ? result.data : undefined
  const featured = ['IN_PROGRESS', 'READY', 'SCHEDULED'].map(status => data?.content.find(slot => slot.status === status)).find(Boolean)
  const headline = featured?.status === 'IN_PROGRESS' ? 'Tiếp tục bài thi' : featured?.status === 'READY' ? 'Ca thi sẵn sàng' : 'Ca thi được phân'
  const start = featured?.scheduledStartTime
  const startLabel = start && Number.isFinite(Date.parse(start))
    ? new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(start))
    : 'Chưa xếp giờ'

  return (
    <OverviewLayout name={user.displayName}>
      {result.isPending ? <LoadingPage label="Đang tải tổng quan" /> : result.isError ? (
        <div className="space-y-3"><ErrorState description={result.error.message} /><Button variant="outline" onClick={() => void result.refetch()}>Thử lại</Button></div>
      ) : (
        <section className="overflow-hidden rounded-xl border border-blue-200 bg-white" aria-labelledby="overview-exam-title">
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-blue-100 bg-blue-50/70 px-5 py-4">
            <h2 id="overview-exam-title" className="text-sm font-semibold text-slate-900">Ca thi cần chú ý</h2>
            <Link to="/student/exams" className="inline-flex min-h-10 items-center gap-1 text-xs font-semibold text-blue-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600">Xem tất cả{data ? ` (${data.totalElements})` : ''}<ArrowRight size={14} aria-hidden="true" /></Link>
          </header>
          {data && data.totalElements > data.content.length && <p className="px-5 pt-4 text-xs text-slate-500">Ưu tiên trong {data.content.length} ca gần đây.</p>}
          {featured ? (
            <article className="space-y-5 p-5 sm:p-6">
              <p className="text-sm font-medium text-blue-700">{headline}</p>
              <div className="space-y-2">
                <h3 className="break-words text-xl font-semibold tracking-tight text-slate-900">{featured.examTitle}</h3>
                <p className="text-sm text-slate-500">{featured.courseCode} · {featured.slotNumber == null ? 'Chưa phân ca' : `Ca ${featured.slotNumber}`}</p>
                <p className="flex items-center gap-2 text-sm text-slate-600"><CalendarDays size={15} aria-hidden="true" />{startLabel}</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {featured.status !== 'SCHEDULED' && <Link className="button primary" to={studentExamPath(featured.examId, featured.attemptId, 'check')}>{featured.status === 'IN_PROGRESS' ? 'Tiếp tục thi' : 'Chuẩn bị vào thi'}<ArrowRight size={15} aria-hidden="true" /></Link>}
                <Link className="inline-flex min-h-11 items-center rounded-md px-2 text-sm font-medium text-slate-600 hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600" to={studentExamPath(featured.examId, featured.attemptId)}>Chi tiết ca thi</Link>
              </div>
            </article>
          ) : <EmptyState title={data?.totalElements ? 'Chưa có ca cần tham gia trong lịch gần đây' : 'Bạn chưa có lịch thi'} description={data?.totalElements ? 'Xem toàn bộ lịch thi hoặc tra cứu kết quả bên dưới.' : 'Lịch sẽ xuất hiện khi giảng viên phân ca.'} />}
        </section>
      )}
    </OverviewLayout>
  )
}

export function StudentDashboard() {
  const { session } = useSession()
  return runtimeConfig.dataSource === 'api' ? <ApiStudentOverview /> : (
    <OverviewLayout name={session.user?.displayName ?? 'Sinh viên'}>
      <DemoLabel detail="Chế độ mô phỏng · Mở Kỳ thi của tôi để xem ca mẫu." />
    </OverviewLayout>
  )
}
