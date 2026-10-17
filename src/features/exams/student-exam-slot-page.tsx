import { DemoLabel } from '../../components/common/inline-notice'
import { Link, useParams } from 'react-router-dom'
import { Alert, Button } from '../../components/ui/primitives'
import { ErrorState, LoadingPage, PermissionDenied } from '../../components/common/states'
import { useSession } from '../../app/providers/use-session'
import { runtimeConfig } from '../../services/api/runtime-config'
import { StudentPreExamView } from './views/StudentPreExamView'
import { useExam, useStudentMySlot } from './exam-hooks'
import { Mic, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react'

export function StudentExamSlotPage() {
  return runtimeConfig.dataSource === 'api' ? <ApiStudentExamSlotPage /> : <MockStudentExamSlotPage />
}

function MockStudentExamSlotPage() {
  const { examId = '' } = useParams()
  const exam = useExam(examId)

  if (exam.isPending) return <LoadingPage label="Đang tải kỳ thi demo" />
  if (exam.isError) return (
    <section className="max-w-2xl mx-auto py-12">
      <ErrorState description={exam.error.message} />
      <div className="mt-4 text-center">
        <Button onClick={() => void exam.refetch()}>Thử lại</Button>
      </div>
    </section>
  )
  if (!exam.data) return <ErrorState description="Không tìm thấy kỳ thi demo." />

  return (
    <section className="source-screen max-w-6xl mx-auto space-y-6 pb-16">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 p-6 sm:p-8 text-white shadow-sm border border-slate-800">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-medium text-blue-200">
              <Sparkles size={13} className="text-amber-400" />
              <span>Cổng thí sinh · Phòng chờ demo</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {exam.data.title}
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              {exam.data.subjectCode} · {exam.data.subjectName}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link className="button outline" to="/student/exams">
              Danh sách kỳ thi
            </Link>
          </div>
        </div>
      </div>

      <DemoLabel detail="Dữ liệu demo · Chưa có ca thi cá nhân. Bạn có thể thử kiểm tra thiết bị và luồng vấn đáp mô phỏng." />

      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs max-w-3xl">
        <div className="flex items-start gap-4">
          <div className="p-3.5 rounded-2xl bg-blue-50 text-blue-600 shrink-0">
            <Mic size={26} />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-slate-900">
              Chuẩn bị trước phiên vấn đáp
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              Kiểm tra micro, loa và kết nối. Phiên mô phỏng không tạo lượt thi hoặc kết quả chính thức.
            </p>
          </div>
        </div>

        <div className="bg-slate-50/80 border border-slate-200/60 rounded-xl p-5 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Các bước kiểm tra cần hoàn tất:</p>
          <ul className="text-xs text-slate-600 space-y-2 list-none p-0 m-0">
            <li className="flex items-center gap-2">
              <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
              <span>Xác nhận quyền micro của trình duyệt và kiểm tra mức âm thanh</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
              <span>Phát âm thanh thử nghiệm và nghe rõ qua loa hoặc tai nghe</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
              <span>Đảm bảo kết nối mạng liên tục với máy chủ phiên thi</span>
            </li>
          </ul>
        </div>

        <div>
          <Link
            className="button primary"
            to={`/student/exams/${examId}/check`}
          >
            Kiểm tra thiết bị &amp; thử demo
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </section>
  )
}

function ApiStudentExamSlotPage() {
  const { examId = '' } = useParams()
  const { session } = useSession()
  const studentId = session.user?.roles.includes('student') ? session.user.id : undefined
  const slot = useStudentMySlot(examId, studentId)

  if (session.user && !session.user.roles.includes('student')) return <PermissionDenied />
  if (!studentId) return <section className="state"><Alert tone="danger">Không xác định được phiên đăng nhập. Vui lòng đăng nhập lại.</Alert></section>
  if (slot.isLoading) return <LoadingPage label="Đang tải ca thi của bạn" />
  if (slot.isError) return (
    <section className="state">
      <Alert tone="danger">{slot.error instanceof Error ? slot.error.message : 'Không thể tải ca thi.'}</Alert>
      <Button onClick={() => slot.refetch()}>Thử lại</Button>
    </section>
  )
  if (!slot.data) return <ErrorState description="Bạn chưa được xếp ca thi hoặc ca thi không tồn tại." />
  return <StudentPreExamView slot={slot.data} />
}

