import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Calendar, GraduationCap, ArrowRight, Search, Clock, ShieldCheck, CheckCircle2, Mic, Sparkles } from 'lucide-react'
import { Alert, Button } from '../../../components/ui/primitives'
import { isUuid } from '../../question-bank/api-question-repository'
import type { ExamSession } from '../exam-types'
import { examStatusMeta } from '../exam-types'

/* StudentPortalView modern hero banner, student KPI status, and cards
   adapted to personal-slot API and mock demo environments. */
export function StudentPortalView({ name, exams, apiMode, list = false }: { name: string; exams?: ExamSession[]; apiMode: boolean; list?: boolean }) {
  const navigate = useNavigate(), [examId, setExamId] = useState(''), [error, setError] = useState('')
  const findSlot = (event: FormEvent) => {
    event.preventDefault()
    if (!isUuid(examId.trim())) {
      setError('Nhập mã kỳ thi hợp lệ được giảng viên cung cấp.')
      return
    }
    navigate(`/student/exams/${encodeURIComponent(examId.trim())}`)
  }

  const upcomingCount = exams?.filter(e => e.status === 'SCHEDULED' || e.status === 'IN_PROGRESS').length ?? 0

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
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Kỳ thi tham gia</span>
            <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Calendar size={18} />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 font-mono">
              {apiMode ? 'Tra cứu' : (exams?.length ?? 0)}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {apiMode ? 'Theo mã kỳ thi' : 'Được phân công'}
            </p>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Ca thi sắp tới</span>
            <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Clock size={18} />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-indigo-600 font-mono">
              {apiMode ? 'Theo lịch' : `${upcomingCount} ca`}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {upcomingCount > 0 ? 'Cần chuẩn bị' : 'Đang cập nhật'}
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <section className="lg:col-span-7 bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-7 space-y-5 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
                <Search size={20} />
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  Tra cứu ca thi cá nhân
                </h2>
                <p className="text-xs text-slate-500">
                  Nhập mã định danh kỳ thi được giảng viên cung cấp để xác định phòng thi và thứ tự vấn đáp của bạn.
                </p>
              </div>
            </div>

            <form onSubmit={findSlot} className="space-y-4 pt-1">
              <div>
                <label className="block text-xs text-slate-700 font-semibold mb-1.5" htmlFor="student-exam-lookup">
                  Mã kỳ thi (UUID)
                </label>
                <div className="relative">
                  <input
                    id="student-exam-lookup"
                    value={examId}
                    onChange={event => { setExamId(event.target.value); setError('') }}
                    className="w-full bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl px-4 py-2.5 text-sm transition-all"
                    placeholder="Ví dụ: e3b0c442-98fc-1c14-9afbf4c8996fb924"
                    required
                  />
                </div>
              </div>
              {error && <Alert tone="danger">{error}</Alert>}
              <Button type="submit">
                Xem ca thi
                <ArrowRight size={14} />
              </Button>
            </form>
          </section>

          <aside className="lg:col-span-5 bg-gradient-to-br from-blue-50/80 to-indigo-50/40 border border-blue-200/80 rounded-2xl p-6 space-y-4 self-start shadow-xs">
            <div className="flex items-center gap-2.5 text-blue-900 font-semibold text-sm">
              <Clock size={18} className="text-blue-600" />
              <span>Chuẩn bị trước khi dự thi</span>
            </div>
            <p className="text-xs text-blue-800 leading-relaxed">
              Kiểm tra thời gian của ca thi, chuẩn bị micro và tai nghe, sau đó thực hiện kiểm tra thiết bị trước khi vào phòng thi.
            </p>
            <ul className="text-xs text-blue-800 space-y-2 list-none p-0 m-0">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                <span>Không gian yên tĩnh, đủ ánh sáng</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                <span>Micro và loa hoạt động rõ ràng, không vang</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                <span>Đường truyền mạng internet ổn định</span>
              </li>
            </ul>
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

