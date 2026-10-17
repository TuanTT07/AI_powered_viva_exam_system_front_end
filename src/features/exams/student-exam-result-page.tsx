import { DemoLabel } from '../../components/common/inline-notice'
import { Link, useParams } from 'react-router-dom'
import { FileText, ShieldCheck, Sparkles, User, Calendar } from 'lucide-react'
import { runtimeConfig } from '../../services/api/runtime-config'
import { studentResultsDemo } from './mocks/student-results-demo'

export function StudentExamResultPage() {
  const { examId } = useParams()
  const demo = runtimeConfig.dataSource === 'mock'
  const result = demo ? studentResultsDemo.find(r => r.id === examId) : undefined

  return (
    <section className="source-screen max-w-6xl mx-auto space-y-6 pb-16">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 p-6 sm:p-8 text-white shadow-sm border border-slate-800">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-medium text-blue-200">
              <Sparkles size={13} className="text-amber-400" />
              <span>Kết quả · Biên bản khảo thí</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {result?.title ?? 'Biên bản kết quả'}
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              {result?.subject ?? 'Báo cáo chi tiết điểm số, tiêu chí chấm và nhận xét chính thức.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link className="button outline" to="/student/results">
              Danh sách kết quả
            </Link>
          </div>
        </div>
      </div>

      {demo && <DemoLabel detail="Dữ liệu demo · Biên bản và điểm minh họa." />}

      <div className="grid md:grid-cols-3 gap-6">
        {/* Score Card */}
        <section className="result-score-card bg-gradient-to-br from-blue-600 via-indigo-600 to-indigo-700 rounded-2xl p-8 text-center text-white space-y-4 shadow-sm flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center">
              <ShieldCheck size={28} className="text-white" />
            </div>
            <h2 className="text-sm font-semibold tracking-wide text-blue-100">
              {demo ? 'Điểm công bố mẫu' : 'Điểm chính thức'}
            </h2>
            <strong className="block text-5xl sm:text-6xl font-mono font-bold tracking-tight text-white">
              {result ? result.score.toFixed(1) : '—'}
            </strong>
          </div>
          <p className="text-xs text-blue-200/90 pt-2 border-t border-white/15">
            {result ? 'Thang điểm 10 · Demo' : 'Chưa có kết quả được hệ thống công bố'}
          </p>
        </section>

        {/* Lecturer Feedback Card */}
        <section className="md:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-7 space-y-5 shadow-xs">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
              <User size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Nhận xét giảng viên</h2>
              <p className="text-xs text-slate-500">
                Đánh giá tổng quan năng lực phản biện, độ sâu kiến thức và tư duy giải quyết vấn đề.
              </p>
            </div>
          </div>

          <div className="bg-slate-50/80 border border-slate-200/60 rounded-xl p-5 text-sm text-slate-700 leading-relaxed font-normal">
            {result?.feedback ?? (demo ? 'Không tìm thấy kết quả mẫu cho kỳ thi này.' : 'Nhận xét sẽ hiển thị khi được cấp quyền xem kết quả.')}
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Calendar size={13} />
            <span>{result ? `Ngày thi mẫu: ${new Date(result.date).toLocaleDateString('vi-VN')}` : 'Chưa có ngày xác nhận kết quả'}</span>
          </div>
        </section>
      </div>

      {/* Transcript Section */}
      <section className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-4 shadow-xs">
        <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2.5">
          <FileText size={18} className="text-blue-600" />
          <span>Biên bản hội thoại được công bố</span>
        </h2>
        <div className="border border-dashed border-slate-200 rounded-xl p-8 text-center space-y-2">
          <p className="text-sm text-slate-500">
            Chưa có transcript được cấp quyền xem trong kết quả này.
          </p>
          <p className="text-xs text-slate-400">
            Hội thoại âm thanh và trích dẫn câu trả lời chỉ hiển thị khi giảng viên cho phép truy cập biên bản chi tiết.
          </p>
        </div>
      </section>
    </section>
  )
}

