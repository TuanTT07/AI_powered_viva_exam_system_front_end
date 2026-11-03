import { useQuery } from '@tanstack/react-query'
import { apiEvaluationService } from '../../grading/api-evaluation-service'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Calendar, Clock3, Headphones, Mic, Sparkles } from 'lucide-react'
import { Button } from '../../../components/ui/primitives'
import { StatusBadge } from '../../../components/common/states'
import type { StudentExamSlot } from '../api-student-exam-repository'
import { studentExamPath } from '../student-exam-navigation'
import '../../students/student.css'
import '../student-pre-exam.css'

const labels: Record<StudentExamSlot['status'], string> = {
  SCHEDULED: 'Đã xếp lịch',
  READY: 'Sẵn sàng',
  IN_PROGRESS: 'Đang thi',
  COMPLETED: 'Đã hoàn tất',
  ABSENT: 'Vắng',
  CANCELLED: 'Đã hủy',
}

const time = (value: string | null) =>
  value && Number.isFinite(Date.parse(value))
    ? new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value))
    : 'Chưa xếp giờ'

export function StudentPreExamView({ slot }: { slot: StudentExamSlot }) {
  const [search] = useSearchParams()
  const results = useQuery({
    queryKey: ['student-published-results', slot.attemptId],
    queryFn: () => apiEvaluationService.studentResults(slot.attemptId),
    enabled: slot.status === 'COMPLETED',
    retry: false,
  })
  const canJoin = slot.status === 'READY' || slot.status === 'IN_PROGRESS'
  const unavailableMessage =
    slot.status === 'SCHEDULED'
      ? 'Ca thi chưa mở. Vui lòng quay lại sau.'
      : slot.status === 'COMPLETED'
        ? 'Bài thi đã hoàn tất. Kết quả sẽ hiển thị khi được công bố.'
        : 'Ca thi hiện không cho phép tham gia.'

  return (
    <section className="student-page pre-exam" aria-labelledby="pre-exam-title">
      {/* Modern Hero Header Banner matching Lecturer style */}
      <header className="student-hero">
        <div className="student-hero-content">
          <div className="student-hero-badge">
            <Mic size={14} />
            <span>AIVES · CỔNG THÍ SINH · PHÒNG CHỜ VẤN ĐÁP</span>
          </div>
          <h1 id="pre-exam-title" className="student-hero-title">
            {slot.examTitle}
          </h1>
          <p className="student-hero-desc">
            {slot.courseCode} · {slot.courseName}
          </p>
        </div>
        <div className="student-actions">
          <StatusBadge
            label={labels[slot.status]}
            tone={slot.status === 'COMPLETED' ? 'success' : slot.status === 'ABSENT' ? 'danger' : 'info'}
          />
          <Link className="button outline" to="/student/exams">
            <ArrowLeft size={16} aria-hidden="true" />
            <span>Kỳ thi của tôi</span>
          </Link>
        </div>
      </header>
      {slot.status === 'COMPLETED' && <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-base font-semibold">Kết quả đã công bố</h2>
        {results.isPending && <p role="status">Đang tải kết quả…</p>}
        {results.isError && <div role="alert">Không thể tải kết quả. <Button variant="outline" onClick={() => results.refetch()}>Thử lại</Button></div>}
        {results.isSuccess && !results.data.length && <p>Giảng viên chưa công bố điểm.</p>}
        {results.isSuccess && !!results.data.length && <ul className="space-y-2">
          {results.data.map(result => <li key={result.questionOrder} className="rounded-xl bg-slate-50 p-3">
            <strong>Câu {result.questionOrder} · {result.finalScore} điểm</strong>
            {result.feedback && <p className="mt-1 text-sm text-slate-600">{result.feedback}</p>}
          </li>)}
        </ul>}
      </section>}

      {/* 4 Quick Metric Cards for Pre-Exam */}
      <section className="student-metric-grid" aria-label="Thông tin nhanh ca thi">
        <div className="metric-card metric-card--blue">
          <div className="metric-header">
            <span className="metric-label">Ca thi số</span>
            <div className="metric-icon-wrap metric-icon-wrap--blue">
              <Calendar size={20} />
            </div>
          </div>
          <strong className="metric-value">{slot.slotNumber == null ? '—' : `Ca ${slot.slotNumber}`}</strong>
          <span className="metric-hint">{slot.courseCode}</span>
        </div>

        <div className="metric-card metric-card--indigo">
          <div className="metric-header">
            <span className="metric-label">Giờ bắt đầu</span>
            <div className="metric-icon-wrap metric-icon-wrap--indigo">
              <Clock3 size={20} />
            </div>
          </div>
          <strong className="metric-value" style={{ fontSize: '1.25rem' }}>
            {time(slot.scheduledStartTime)}
          </strong>
          <span className="metric-hint">Dự kiến phiên thi</span>
        </div>

        <div className="metric-card metric-card--emerald">
          <div className="metric-header">
            <span className="metric-label">Thiết bị</span>
            <div className="metric-icon-wrap metric-icon-wrap--emerald">
              <Headphones size={20} />
            </div>
          </div>
          <strong className="metric-value" style={{ fontSize: '1.25rem' }}>
            Cần kiểm tra
          </strong>
          <span className="metric-hint">Micro và tai nghe</span>
        </div>

        <div className="metric-card metric-card--amber">
          <div className="metric-header">
            <span className="metric-label">Mã truy cập</span>
            <div className="metric-icon-wrap metric-icon-wrap--amber">
              <Sparkles size={20} />
            </div>
          </div>
          <strong className="metric-value" style={{ fontSize: '1.25rem', fontFamily: 'monospace' }}>
            {slot.accessCode ?? 'Mặc định'}
          </strong>
          <span className="metric-hint">Bảo mật ca thi</span>
        </div>
      </section>

      {/* 2-column Dashboard Grid matching Lecturer */}
      <div className="dashboard-grid">
        <section className="dashboard-section" aria-labelledby="pre-exam-devices-title">
          <div className="section-header-row">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="pre-exam-step">BƯỚC 01</span>
                <h2 id="pre-exam-devices-title" className="section-title">
                  Kiểm tra thiết bị
                </h2>
              </div>
              <p className="section-subtitle">
                Xác nhận micro và tai nghe hoạt động chuẩn xác trước khi vào phòng thi.
              </p>
            </div>
          </div>

          <div className="pre-exam-device-preview">
            <div className="pre-exam-mic">
              <Mic size={32} strokeWidth={1.5} aria-hidden="true" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Chuẩn bị micro và tai nghe</h3>
            <p className="text-sm text-slate-500">Cho phép trình duyệt truy cập micro ở bước kiểm tra tiếp theo.</p>
          </div>

          <ul className="pre-exam-device-list" aria-label="Thiết bị cần kiểm tra">
            <li>
              <Mic size={18} aria-hidden="true" className="text-blue-600" />
              <span className="font-medium text-slate-800">Micro thoại</span>
              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-600">Chưa kiểm tra</span>
            </li>
            <li>
              <Headphones size={18} aria-hidden="true" className="text-blue-600" />
              <span className="font-medium text-slate-800">Loa / tai nghe</span>
              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-600">Chưa kiểm tra</span>
            </li>
          </ul>

          <div className="pre-exam-actions pt-4 border-t border-slate-100">
            {canJoin ? (
              <Link
                className="button primary min-h-11 justify-center"
                to={studentExamPath(slot.examId, slot.attemptId, 'check', search.get('questionTurnId'))}
              >
                <span>Kiểm tra thiết bị</span>
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            ) : (
              <div className="space-y-3">
                <p role="status" className="text-xs font-medium text-amber-700 bg-amber-50 p-3 rounded-lg border border-amber-200">
                  {unavailableMessage}
                </p>
                <Button disabled className="w-full">
                  Chưa thể vào phòng thi
                </Button>
              </div>
            )}
          </div>
        </section>

        <aside className="dashboard-section" aria-labelledby="pre-exam-details-title">
          <div className="section-header-row">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="pre-exam-step">BƯỚC 02</span>
                <h2 id="pre-exam-details-title" className="section-title">
                  Thông tin ca thi
                </h2>
              </div>
              <p className="section-subtitle">Quy định và thông số phiên vấn đáp.</p>
            </div>
          </div>

          <dl className="space-y-3 divide-y divide-slate-100 text-sm">
            <div className="flex justify-between items-center pt-2">
              <dt className="text-slate-500 font-medium">Học phần</dt>
              <dd className="font-semibold text-slate-900">{slot.courseName}</dd>
            </div>
            <div className="flex justify-between items-center pt-3">
              <dt className="text-slate-500 font-medium">Ca thi</dt>
              <dd className="font-semibold text-slate-900">
                {slot.slotNumber == null ? 'Chưa phân ca' : `Ca ${slot.slotNumber}`}
              </dd>
            </div>
            <div className="flex justify-between items-center pt-3">
              <dt className="text-slate-500 font-medium">Bắt đầu</dt>
              <dd className="font-semibold text-slate-900">{time(slot.scheduledStartTime)}</dd>
            </div>
            <div className="flex justify-between items-center pt-3">
              <dt className="text-slate-500 font-medium">Kết thúc</dt>
              <dd className="font-semibold text-slate-900">{time(slot.scheduledEndTime)}</dd>
            </div>
            {slot.accessCode && (
              <div className="flex justify-between items-center pt-3">
                <dt className="text-slate-500 font-medium">Mã truy cập</dt>
                <dd className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                  {slot.accessCode}
                </dd>
              </div>
            )}
          </dl>

          <div className="student-security-card mt-auto">
            <p className="pre-exam-note">
              <strong>Lưu ý:</strong> Vui lòng chọn nơi yên tĩnh, giữ kết nối mạng ổn định và chuẩn bị micro, tai nghe trước khi bấm vào phòng thi.
            </p>
          </div>
        </aside>
      </div>
    </section>
  )
}
