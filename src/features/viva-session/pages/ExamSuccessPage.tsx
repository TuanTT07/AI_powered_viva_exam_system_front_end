import { DemoLabel } from '../../../components/common/inline-notice'
import { Link, useLocation } from 'react-router-dom'
import { CheckCircle2, Clock, ShieldCheck } from 'lucide-react'
import { runtimeConfig } from '../../../services/api/runtime-config'

export function ExamSuccessPage() {
  const location = useLocation()
  const demoCompleted = runtimeConfig.dataSource === 'mock' && location.state?.demoCompleted === true
  return <section className="source-screen max-w-3xl mx-auto py-10 space-y-6"><div className="rounded-xl border border-slate-200 bg-white p-6 md:p-12 text-center space-y-5"><span className="inline-flex p-5 rounded-full bg-blue-50 text-blue-600">{demoCompleted ? <CheckCircle2 size={40} /> : <Clock size={40} />}</span><h1 className="text-2xl font-bold text-slate-900">{demoCompleted ? 'Đã hoàn tất phiên mô phỏng' : 'Chưa có biên nhận nộp bài'}</h1><p className="text-sm text-slate-500 leading-relaxed">{demoCompleted ? 'Bạn đã đi hết luồng vấn đáp demo. Câu trả lời chỉ được sử dụng trong phiên mô phỏng này.' : 'Biên nhận chỉ hiển thị sau khi hệ thống xác nhận bài thi đã hoàn tất.'}</p><div className="border border-slate-200 rounded-lg p-4 flex gap-3 text-left"><ShieldCheck size={22} className="text-blue-600" /><p className="text-xs text-slate-500">Điểm AI là gợi ý. Kết quả chỉ được công bố sau khi giảng viên xác nhận và hệ thống cho phép.</p></div><div className="flex flex-wrap justify-center gap-3"><Link className="button primary" to="/student">Về trang tổng quan</Link><Link className="button outline" to="/student/exams">Kỳ thi của tôi</Link></div></div>{demoCompleted && <DemoLabel detail="Phiên demo · Không có bài thi hay kết quả chính thức nào được gửi lên hệ thống." />}</section>
}
