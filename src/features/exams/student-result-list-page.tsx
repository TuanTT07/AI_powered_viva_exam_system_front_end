import { DemoLabel } from '../../components/common/inline-notice'
import { Link } from 'react-router-dom'
import { FileCheck2, GraduationCap, Award, Calendar, ArrowRight, Sparkles } from 'lucide-react'
import { Alert } from '../../components/ui/primitives'
import { runtimeConfig } from '../../services/api/runtime-config'
import { studentResultsDemo } from './mocks/student-results-demo'

export function StudentResultListPage() {
  const demo = runtimeConfig.dataSource === 'mock'
  const results = demo ? studentResultsDemo : []
  const avgScore = results.length
    ? (results.reduce((acc, r) => acc + r.score, 0) / results.length).toFixed(1)
    : '—'

  return (
    <section className="source-screen max-w-6xl mx-auto space-y-6 pb-16">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 p-6 sm:p-8 text-white shadow-sm border border-slate-800">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-medium text-blue-200">
              <Sparkles size={13} className="text-amber-400" />
              <span>Cổng thí sinh · Khảo thí</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Kết quả và biên bản
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Xem kết quả được công bố và nhận xét của giảng viên sau các phiên thi vấn đáp.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              className="button outline"
              to="/student/exams"
            >
              Kỳ thi của tôi
            </Link>
          </div>
        </div>
      </div>

      {demo ? (
        <DemoLabel detail="Dữ liệu demo · Điểm và nhận xét minh họa, không phải kết quả thi thực." />
      ) : (
        <Alert>Chưa có chức năng tra cứu kết quả được công bố từ hệ thống.</Alert>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Biên bản đã công bố</span>
            <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <FileCheck2 size={18} />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 font-mono">{results.length}</div>
            <p className="text-xs text-slate-500 mt-0.5">Kỳ thi hoàn tất</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Điểm trung bình</span>
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Award size={18} />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-emerald-600 font-mono">{avgScore}</div>
            <p className="text-xs text-slate-500 mt-0.5">Thang điểm 10</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Đánh giá &amp; Minh chứng</span>
            <span className="p-2 rounded-xl bg-violet-50 text-violet-600">
              <GraduationCap size={18} />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-sm font-bold text-slate-900">Giảng viên phê duyệt</div>
            <p className="text-xs text-slate-500 mt-0.5">Bảo lưu transcript &amp; rubric</p>
          </div>
        </div>
      </div>

      {/* Results List */}
      <div className="space-y-4">
        {results.map(result => (
          <article
            key={result.id}
            className="bg-white border border-slate-200/80 hover:border-slate-300 rounded-2xl p-5 sm:p-6 shadow-xs transition-all hover:shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-5 group"
          >
            <div className="flex gap-4 items-start">
              <span className="rounded-2xl bg-blue-50 text-blue-600 p-3.5 shrink-0 group-hover:scale-105 transition-transform">
                <FileCheck2 size={24} />
              </span>
              <div className="space-y-1">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                  Kết quả công bố mẫu
                </span>
                <h2 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  {result.title}
                </h2>
                <p className="text-xs text-slate-500 flex items-center gap-2">
                  <span>{result.subject}</span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1">
                    <Calendar size={12} className="text-slate-400" />
                    {new Date(result.date).toLocaleDateString('vi-VN')}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
              <div className="text-center sm:text-right">
                <p className="text-[11px] text-slate-400 uppercase font-semibold">Điểm demo</p>
                <strong className="text-2xl font-mono text-emerald-700 font-bold">
                  {result.score.toFixed(1)}
                  <small className="text-xs text-slate-400 font-normal"> / 10</small>
                </strong>
              </div>
              <Link
                className="button outline"
                to={`/student/exams/${result.id}/result`}
              >
                Xem biên bản
                <ArrowRight size={14} />
              </Link>
            </div>
          </article>
        ))}

        {!results.length && (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center space-y-3 shadow-xs">
            <div className="w-16 h-16 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
              <GraduationCap size={32} />
            </div>
            <h2 className="text-base font-semibold text-slate-900">Chưa có kết quả để hiển thị</h2>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              Kết quả chỉ xuất hiện khi hệ thống cho phép công bố.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}

