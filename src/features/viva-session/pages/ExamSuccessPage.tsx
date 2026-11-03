import { DemoLabel } from '../../../components/common/inline-notice'
import { Link, useLocation } from 'react-router-dom'
import { CheckCircle2, Clock, ShieldCheck, ArrowRight, Calendar, FileText } from 'lucide-react'
import { runtimeConfig } from '../../../services/api/runtime-config'
import '../../students/student.css'

export function ExamSuccessPage() {
  const location = useLocation()
  const demoCompleted = runtimeConfig.dataSource === 'mock' && location.state?.demoCompleted === true

  return (
    <section className="student-page py-6">
      <div className="dashboard-section mx-auto max-w-3xl text-center space-y-6 p-8 sm:p-12">
        <div className="flex flex-col items-center gap-4">
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
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              {demoCompleted ? 'Đã hoàn tất phiên mô phỏng' : 'Chưa có biên nhận nộp bài'}
            </h1>
            <p className="text-sm text-slate-500 leading-relaxed">
              {demoCompleted
                ? 'Bạn đã đi hết luồng vấn đáp demo. Câu trả lời chỉ được sử dụng trong phiên mô phỏng này.'
                : 'Biên nhận chỉ hiển thị sau khi hệ thống xác nhận bài thi đã hoàn tất.'}
            </p>
          </div>
        </div>

        <div className="student-security-card max-w-xl mx-auto text-left">
          <ShieldCheck size={22} className="text-blue-600 shrink-0 mt-0.5" />
          <p>
            <strong>Lưu ý bảo mật:</strong> Điểm AI là gợi ý. Kết quả chỉ được công bố sau khi giảng viên xác nhận và hệ thống cho phép.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Link className="button primary inline-flex items-center gap-2" to="/student">
            <span>Về trang tổng quan</span>
            <ArrowRight size={15} />
          </Link>
          <Link className="button outline inline-flex items-center gap-2" to="/student/exams">
            <Calendar size={15} />
            <span>Kỳ thi của tôi</span>
          </Link>
          <Link className="button outline inline-flex items-center gap-2" to="/student/results">
            <FileText size={15} />
            <span>Kết quả &amp; biên bản</span>
          </Link>
        </div>
      </div>

      {demoCompleted && (
        <div className="max-w-3xl mx-auto">
          <DemoLabel detail="Phiên demo · Không có bài thi hay kết quả chính thức nào được gửi lên hệ thống." />
        </div>
      )}
    </section>
  )
}
