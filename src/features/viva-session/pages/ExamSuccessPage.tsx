import { DemoLabel } from '../../../components/common/inline-notice'
import { Link, useLocation } from 'react-router-dom'
import { CheckCircle2, Clock, ShieldCheck, ArrowRight } from 'lucide-react'
import { runtimeConfig } from '../../../services/api/runtime-config'

export function ExamSuccessPage() {
  const location = useLocation()
  const demoCompleted = runtimeConfig.dataSource === 'mock' && location.state?.demoCompleted === true

  return (
    <section className="source-screen max-w-3xl mx-auto py-12 px-4 space-y-6">
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-12 text-center space-y-6 shadow-sm relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-16 w-80 h-40 bg-blue-500/10 blur-3xl pointer-events-none rounded-full" />

        <div className="relative z-10 flex flex-col items-center gap-4">
          <span
            className={`inline-flex p-5 rounded-3xl ${
              demoCompleted
                ? 'bg-emerald-50 text-emerald-600 ring-8 ring-emerald-50/50'
                : 'bg-amber-50 text-amber-600 ring-8 ring-amber-50/50'
            }`}
          >
            {demoCompleted ? <CheckCircle2 size={44} /> : <Clock size={44} />}
          </span>

          <div className="space-y-2 max-w-lg">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              {demoCompleted ? 'Đã hoàn tất phiên mô phỏng' : 'Chưa có biên nhận nộp bài'}
            </h1>
            <p className="text-sm text-slate-500 leading-relaxed">
              {demoCompleted
                ? 'Bạn đã đi hết luồng vấn đáp demo. Câu trả lời chỉ được sử dụng trong phiên mô phỏng này.'
                : 'Biên nhận chỉ hiển thị sau khi hệ thống xác nhận bài thi đã hoàn tất.'}
            </p>
          </div>
        </div>

        <div className="border border-blue-100/80 bg-blue-50/50 rounded-xl p-4 sm:p-5 flex gap-3.5 text-left max-w-xl mx-auto items-start">
          <ShieldCheck size={22} className="text-blue-600 shrink-0 mt-0.5" />
          <p className="text-xs text-blue-900/80 leading-relaxed">
            Điểm AI là gợi ý. Kết quả chỉ được công bố sau khi giảng viên xác nhận và hệ thống cho phép.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Link className="button primary inline-flex items-center gap-2" to="/student">
            <span>Về trang tổng quan</span>
            <ArrowRight size={15} />
          </Link>
          <Link className="button outline" to="/student/exams">
            Kỳ thi của tôi
          </Link>
        </div>
      </div>

      {demoCompleted && (
        <DemoLabel detail="Phiên demo · Không có bài thi hay kết quả chính thức nào được gửi lên hệ thống." />
      )}
    </section>
  )
}

