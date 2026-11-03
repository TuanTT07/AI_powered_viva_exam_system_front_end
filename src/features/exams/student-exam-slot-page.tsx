import { DemoLabel } from '../../components/common/inline-notice'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { Alert, Button } from '../../components/ui/primitives'
import { ErrorState, LoadingPage, PermissionDenied } from '../../components/common/states'
import { useSession } from '../../app/providers/use-session'
import { runtimeConfig } from '../../services/api/runtime-config'
import { StudentPreExamView } from './views/StudentPreExamView'
import { useExam, useStudentMySlot } from './exam-hooks'
import { Mic, ArrowRight, ArrowLeft, Sparkles, CheckCircle2, Calendar, Clock, Headphones } from 'lucide-react'
import { matchesRequestedAttempt } from './student-exam-navigation'
import '../students/student.css'

export function StudentExamSlotPage() {
  return runtimeConfig.dataSource === 'api' ? <ApiStudentExamSlotPage /> : <MockStudentExamSlotPage />
}

function MockStudentExamSlotPage() {
  const { examId = '' } = useParams()
  const exam = useExam(examId)

  if (exam.isPending) return <LoadingPage label="Đang tải kỳ thi demo" />
  if (exam.isError)
    return (
      <section className="max-w-2xl mx-auto py-12">
        <ErrorState description={exam.error.message} />
        <div className="mt-4 text-center">
          <Button onClick={() => void exam.refetch()}>Thử lại</Button>
        </div>
      </section>
    )
  if (!exam.data) return <ErrorState description="Không tìm thấy kỳ thi demo." />

  return (
    <section className="student-page">
      {/* Modern Hero Header Banner matching Lecturer style */}
      <header className="student-hero">
        <div className="student-hero-content">
          <div className="student-hero-badge">
            <Sparkles size={14} />
            <span>AIVES · CỔNG THÍ SINH · PHÒNG CHỜ MÔ PHỎNG</span>
          </div>
          <h1 className="student-hero-title">{exam.data.title}</h1>
          <p className="student-hero-desc">
            {exam.data.subjectCode} · {exam.data.subjectName}
          </p>
        </div>

        <div className="student-actions">
          <Link className="button outline" to="/student/exams">
            <ArrowLeft size={16} />
            <span>Danh sách kỳ thi</span>
          </Link>
        </div>
      </header>

      <DemoLabel detail="Dữ liệu demo · Chưa có ca thi cá nhân. Bạn có thể thử kiểm tra thiết bị và luồng vấn đáp mô phỏng." />

      {/* 4 Metric Cards */}
      <section className="student-metric-grid" aria-label="Thông tin kỳ thi mô phỏng">
        <div className="metric-card metric-card--blue">
          <div className="metric-header">
            <span className="metric-label">Học phần</span>
            <div className="metric-icon-wrap metric-icon-wrap--blue">
              <Calendar size={20} />
            </div>
          </div>
          <strong className="metric-value">{exam.data.subjectCode}</strong>
          <span className="metric-hint">{exam.data.subjectName}</span>
        </div>

        <div className="metric-card metric-card--indigo">
          <div className="metric-header">
            <span className="metric-label">Thời lượng thi</span>
            <div className="metric-icon-wrap metric-icon-wrap--indigo">
              <Clock size={20} />
            </div>
          </div>
          <strong className="metric-value">{exam.data.durationMinutes ?? 20} phút</strong>
          <span className="metric-hint">Phiên vấn đáp AI</span>
        </div>

        <div className="metric-card metric-card--emerald">
          <div className="metric-header">
            <span className="metric-label">Phòng thi</span>
            <div className="metric-icon-wrap metric-icon-wrap--emerald">
              <Sparkles size={20} />
            </div>
          </div>
          <strong className="metric-value" style={{ fontSize: '1.4rem' }}>
            Sẵn sàng
          </strong>
          <span className="metric-hint">Chế độ mô phỏng</span>
        </div>

        <div className="metric-card metric-card--amber">
          <div className="metric-header">
            <span className="metric-label">Thiết bị</span>
            <div className="metric-icon-wrap metric-icon-wrap--amber">
              <Headphones size={20} />
            </div>
          </div>
          <strong className="metric-value" style={{ fontSize: '1.4rem' }}>
            Micro &amp; Loa
          </strong>
          <span className="metric-hint">Cần kiểm tra trước</span>
        </div>
      </section>

      {/* Preparation Card */}
      <div className="dashboard-section space-y-6">
        <div className="flex items-start gap-4">
          <div className="p-3.5 rounded-2xl bg-blue-50 text-blue-600 shrink-0">
            <Mic size={26} />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-slate-900">Chuẩn bị trước phiên vấn đáp</h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              Kiểm tra micro, loa và kết nối. Phiên mô phỏng không tạo lượt thi hoặc kết quả chính thức.
            </p>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Các bước kiểm tra cần hoàn tất:
          </p>
          <ul className="text-xs text-slate-600 space-y-2.5 list-none p-0 m-0">
            <li className="flex items-center gap-2.5">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <span>Xác nhận quyền micro của trình duyệt và kiểm tra mức âm thanh</span>
            </li>
            <li className="flex items-center gap-2.5">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <span>Phát âm thanh thử nghiệm và nghe rõ qua loa hoặc tai nghe</span>
            </li>
            <li className="flex items-center gap-2.5">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <span>Đảm bảo kết nối mạng liên tục với máy chủ phiên thi</span>
            </li>
          </ul>
        </div>

        <div>
          <Link className="button primary inline-flex items-center gap-2" to={`/student/exams/${examId}/check`}>
            <span>Kiểm tra thiết bị &amp; thử demo</span>
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </section>
  )
}

function ApiStudentExamSlotPage() {
  const { examId = '' } = useParams()
  const [search] = useSearchParams()
  const { session } = useSession()
  const studentId = session.user?.roles.includes('student') ? session.user.id : undefined
  const slot = useStudentMySlot(examId, studentId)

  if (session.user && !session.user.roles.includes('student')) return <PermissionDenied />
  if (!studentId)
    return (
      <section className="state">
        <Alert tone="danger">Không xác định được phiên đăng nhập. Vui lòng đăng nhập lại.</Alert>
      </section>
    )
  if (slot.isLoading) return <LoadingPage label="Đang tải ca thi của bạn" />
  if (slot.isError)
    return (
      <section className="state">
        <Alert tone="danger">{slot.error instanceof Error ? slot.error.message : 'Không thể tải ca thi.'}</Alert>
        <Button onClick={() => slot.refetch()}>Thử lại</Button>
      </section>
    )
  if (!slot.data) return <ErrorState description="Bạn chưa được xếp ca thi hoặc ca thi không tồn tại." />
  if (!matchesRequestedAttempt(search.get('attemptId'), slot.data.attemptId))
    return (
      <ErrorState description="Ca thi đã thay đổi hoặc không khớp. Vui lòng mở lại từ danh sách lịch thi của bạn." />
    )
  return <StudentPreExamView slot={slot.data} />
}
