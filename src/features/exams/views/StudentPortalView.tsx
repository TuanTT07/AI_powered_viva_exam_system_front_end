import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, GraduationCap, ArrowRight, Clock, ShieldCheck, CheckCircle2, Mic, Sparkles } from 'lucide-react'
import type { ExamSession } from '../exam-types'
import { examStatusMeta } from '../exam-types'

/* StudentPortalView modern hero banner, student KPI status, and cards
   adapted to personal-slot API and mock demo environments. */
export function StudentPortalView({ name, exams, apiMode, list = false, apiContent, assignedCount, joinableCount, filtered = false }: {
  name: string; exams?: ExamSession[]; apiMode: boolean; list?: boolean
  apiContent?: ReactNode; assignedCount?: number; joinableCount?: number; filtered?: boolean
}) {
  const upcomingCount = exams?.filter(e => e.status === 'SCHEDULED' || e.status === 'IN_PROGRESS').length ?? 0

  if (apiMode && list) return (
    <section className="source-screen mx-auto max-w-6xl space-y-5 pb-10">
      <header><h1 className="text-2xl font-semibold tracking-tight text-slate-900">Kỳ thi của tôi</h1></header>
      <section className="min-w-0 rounded-xl border border-slate-200 bg-white p-5 sm:p-6">{apiContent}</section>
    </section>
  )

  return (
    <section className="source-screen space-y-6 max-w-7xl mx-auto pb-16">
      {/* Student Hero Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 p-6 sm:p-8 text-white shadow-sm border border-slate-800">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 -mb-12 w-64 h-64 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-medium text-blue-200">
              <Sparkles size={13} className="text-amber-400" />
              <span>Cổng khảo thí học viên</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {list ? 'Kỳ Thi Của Tôi' : `Xin chào, ${name}`}
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Tra cứu lịch thi cá nhân, kiểm tra thiết bị âm thanh và chuẩn bị tốt nhất cho phiên vấn đáp trực tuyến.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/student/results"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium text-sm backdrop-blur-sm border border-white/15 transition-all shadow-sm active:scale-95"
            >
              <GraduationCap size={16} className="text-blue-300" />
              <span>Kết quả &amp; Biên bản</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Student KPI Status Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{apiMode ? filtered ? 'Ca theo bộ lọc' : 'Ca thi được phân' : 'Kỳ thi tham gia'}</span>
            <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Calendar size={18} />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 font-mono">
              {apiMode ? assignedCount ?? '—' : (exams?.length ?? 0)}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {apiMode ? 'Theo tài khoản đăng nhập' : 'Được phân công'}
            </p>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{apiMode ? 'Ca có thể vào' : 'Ca thi sắp tới'}</span>
            <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Clock size={18} />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-indigo-600 font-mono">
              {apiMode ? joinableCount ?? '—' : `${upcomingCount} ca`}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {apiMode ? 'Trong trang đang xem' : upcomingCount > 0 ? 'Cần chuẩn bị' : 'Đang cập nhật'}
            </p>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Thiết bị ngoại vi</span>
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Mic size={18} />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-base font-bold text-emerald-700 flex items-center gap-1.5">
              <CheckCircle2 size={16} />
              <span>Sẵn sàng test</span>
            </div>
            <Link to="/device-check" className="text-xs text-blue-600 hover:underline mt-0.5 inline-block">
              Kiểm tra micro &amp; loa →
            </Link>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Quy chế thi</span>
            <span className="p-2 rounded-xl bg-violet-50 text-violet-600">
              <ShieldCheck size={18} />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-sm font-bold text-slate-900">
              Bảo mật AI
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Ghi âm &amp; biên bản minh bạch
            </p>
          </div>
        </div>
      </div>

      {apiMode ? (
        <div className="space-y-4">
          <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            {apiContent}
          </section>
          <aside className="flex flex-col gap-4 rounded-xl bg-slate-100/70 px-5 py-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
              <ShieldCheck size={17} className="shrink-0 text-blue-600" aria-hidden="true" />
              <span>Chuẩn bị trước khi dự thi</span>
            </div>
            <ul className="m-0 flex list-none flex-wrap gap-x-5 gap-y-2 p-0 text-xs text-slate-600">
              {['Không gian yên tĩnh', 'Micro và tai nghe hoạt động tốt', 'Kết nối mạng ổn định'].map(tip => (
                <li key={tip} className="flex items-center gap-2">
                  <CheckCircle2 size={13} className="shrink-0 text-slate-400" aria-hidden="true" />
                  {tip}
                </li>
              ))}
            </ul>
            <Link to="/device-check" className="inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-md text-xs font-semibold text-blue-700 hover:text-blue-900 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600">
              Kiểm tra thiết bị <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </aside>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">
              Danh sách ca thi được phân công ({exams?.length ?? 0})
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {exams?.map(exam => {
              const statusMeta = examStatusMeta[exam.status]
              return (
                <article
                  key={exam.id}
                  className="bg-white border border-slate-200/80 hover:border-slate-300 rounded-2xl p-5 shadow-xs transition-all hover:shadow-md flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-center gap-3">
                      <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-mono text-xs font-semibold border border-blue-100">
                        {exam.subjectCode}
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                        {statusMeta.label}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {exam.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">{exam.subjectName}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-50 text-slate-600">
                        <Calendar size={13} className="text-slate-400" />
                        {new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium' }).format(new Date(exam.scheduledAt))}
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-50 text-slate-600">
                        <Clock size={13} className="text-slate-400" />
                        {exam.durationMinutes} phút
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5 pt-3 border-t border-slate-100">
                    <Link
                      className="button outline"
                      to={`/student/exams/${encodeURIComponent(exam.id)}`}
                    >
                      Chi tiết ca thi
                    </Link>
                    <Link
                      className="button primary"
                      to={`/student/exams/${encodeURIComponent(exam.id)}/check`}>
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

