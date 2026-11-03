import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  FileText,
  User,
  Clock,
  Trash2,
  Award,
  Sparkles,
  ShieldCheck,
} from 'lucide-react'
import { DemoLabel } from '../../components/common/inline-notice'
import { Alert, Button } from '../../components/ui/primitives'
import { runtimeConfig } from '../../services/api/runtime-config'
import { studentResultsDemo } from './mocks/student-results-demo'
import { GradeAppealDialog } from './grade-appeal-dialog'
import { getGradeAppeal, cancelGradeAppeal, APPEAL_CATEGORIES, type GradeAppeal } from './grade-appeal-storage'
import '../students/student.css'

export function StudentExamResultPage() {
  const { examId = '' } = useParams()
  const demo = runtimeConfig.dataSource === 'mock'
  const result = demo ? studentResultsDemo.find((r) => r.id === examId) : undefined
  const [appeal, setAppeal] = useState<GradeAppeal | null>(() => (demo && examId ? getGradeAppeal(examId) : null))
  const [appealDialogOpen, setAppealDialogOpen] = useState(false)
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null)
  const visibleAppeal = result ? appeal : null

  function handleCancelAppeal() {
    if (window.confirm('Bạn có chắc chắn muốn hủy đơn phúc khảo này không?')) {
      cancelGradeAppeal(examId)
      setAppeal(null)
      setFeedbackMessage('Đã hủy đơn phúc khảo mẫu.')
    }
  }

  const gradeLevel = result
    ? result.score >= 9.0
      ? 'Xuất sắc'
      : result.score >= 8.0
        ? 'Giỏi'
        : result.score >= 6.5
          ? 'Khá'
          : 'Đạt'
    : '—'

  return (
    <section className="student-page">
      {/* Modern Hero Greeting / Header Banner matching Lecturer style */}
      <header className="student-hero">
        <div className="student-hero-content">
          <div className="student-hero-badge">
            <Award size={14} />
            <span>{result ? 'AIVES · BIÊN BẢN ĐÁNH GIÁ CHÍNH THỨC' : 'AIVES · TÌNH TRẠNG ĐÁNH GIÁ'}</span>
          </div>
          <h1 className="student-hero-title">{result?.title ?? 'Biên bản kết quả'}</h1>
          <p className="student-hero-desc">
            {result
              ? `${result.subject} · Ngày thi: ${new Date(result.date).toLocaleDateString('vi-VN')}`
              : 'Thông tin chi tiết kết quả kỳ thi'}
          </p>
        </div>

        <div className="student-actions">
          <Link className="button outline" to="/student/results">
            <ArrowLeft size={16} aria-hidden="true" />
            <span>Kết quả &amp; biên bản</span>
          </Link>
        </div>
      </header>

      {demo && <DemoLabel detail="Biên bản và điểm minh họa." />}

      {feedbackMessage && (
        <Alert tone="success">
          <div className="flex items-center justify-between gap-3">
            <span>{feedbackMessage}</span>
            <Button variant="outline" onClick={() => setFeedbackMessage(null)}>
              Đóng
            </Button>
          </div>
        </Alert>
      )}

      {/* 4 Modern KPI Metric Cards */}
      <section className="student-metric-grid" aria-label="Chi tiết điểm số">
        <div className="metric-card metric-card--emerald">
          <div className="metric-header">
            <span className="metric-label">{demo ? 'Điểm mẫu' : 'Điểm công bố'}</span>
            <div className="metric-icon-wrap metric-icon-wrap--emerald">
              <Award size={20} />
            </div>
          </div>
          <strong className="metric-value">
            {result ? result.score.toFixed(1) : '—'}
            <span className="text-base font-normal text-slate-400"> / 10</span>
          </strong>
          <span className="metric-hint">
            {result ? 'Dữ liệu mô phỏng' : 'Chưa có kết quả được hệ thống công bố'}
          </span>
        </div>

        <div className="metric-card metric-card--blue">
          <div className="metric-header">
            <span className="metric-label">Xếp loại kết quả</span>
            <div className="metric-icon-wrap metric-icon-wrap--blue">
              <Sparkles size={20} />
            </div>
          </div>
          <strong className="metric-value" style={{ fontSize: '1.4rem' }}>
            {gradeLevel}
          </strong>
          <span className="metric-hint">Quy đổi học vụ</span>
        </div>

        <div className="metric-card metric-card--indigo">
          <div className="metric-header">
            <span className="metric-label">Xác nhận điểm</span>
            <div className="metric-icon-wrap metric-icon-wrap--indigo">
              <ShieldCheck size={20} />
            </div>
          </div>
          <strong className="metric-value" style={{ fontSize: '1.4rem' }}>
            {result ? 'Đã duyệt' : 'Chờ duyệt'}
          </strong>
          <span className="metric-hint">
            {result ? 'Giảng viên xác nhận' : 'Đang xử lý đánh giá'}
          </span>
        </div>

        <div className="metric-card metric-card--amber">
          <div className="metric-header">
            <span className="metric-label">Phúc khảo</span>
            <div className="metric-icon-wrap metric-icon-wrap--amber">
              <Clock size={20} />
            </div>
          </div>
          <strong className="metric-value" style={{ fontSize: '1.4rem' }}>
            {result ? (visibleAppeal ? 'Đã gửi đơn' : 'Được phép') : 'Chưa mở'}
          </strong>
          <span className="metric-hint">
            {result ? 'Theo quy chế khảo thí' : 'Chờ công bố điểm'}
          </span>
        </div>
      </section>

      {/* 2-column Dashboard Grid */}
      <div className="dashboard-grid">
        <div className="space-y-6">
          {/* Lecturer Feedback Section */}
          <section className="dashboard-section">
            <div className="section-header-row">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                  <User size={18} aria-hidden="true" />
                </div>
                <div>
                  <h2 className="section-title">Nhận xét giảng viên</h2>
                  <p className="section-subtitle">Đánh giá quá trình vấn đáp và kiến thức.</p>
                </div>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-sm leading-relaxed text-slate-700">
              {result?.feedback ??
                (demo
                  ? 'Không tìm thấy kết quả mẫu.'
                  : 'Nhận xét sẽ hiển thị khi bạn được cấp quyền xem kết quả.')}
            </div>
          </section>

          {/* Transcript Preview Section */}
          <section className="dashboard-section">
            <div className="section-header-row">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                  <FileText size={18} aria-hidden="true" />
                </div>
                <div>
                  <h2 className="section-title">Biên bản hội thoại</h2>
                  <p className="section-subtitle">Ghi âm và lược thuật câu trả lời.</p>
                </div>
              </div>
            </div>
            <p className="px-5 py-10 text-center text-sm text-slate-500">
              Chưa có biên bản được cấp quyền xem.
            </p>
          </section>
        </div>

        <aside className="space-y-6">
          {/* Grade Appeal Section */}
          {visibleAppeal ? (
            <section
              className="dashboard-section border-amber-300 bg-amber-50/40"
              aria-labelledby="result-appeal-title"
            >
              <div className="section-header-row border-amber-200">
                <div className="flex items-center gap-2">
                  <Clock size={18} className="text-amber-700" aria-hidden="true" />
                  <h2 id="result-appeal-title" className="section-title text-amber-950">
                    Đơn phúc khảo mẫu
                  </h2>
                </div>
                <Button variant="outline" className="button--sm" onClick={handleCancelAppeal}>
                  <Trash2 size={13} aria-hidden="true" />
                  <span>Hủy đơn phúc khảo</span>
                </Button>
              </div>
              <dl className="grid gap-3 text-sm">
                <div>
                  <dt className="text-xs font-semibold text-amber-800">Mã đơn</dt>
                  <dd className="mt-0.5 break-words font-mono font-medium text-slate-900">
                    {visibleAppeal.id}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold text-amber-800">Ngày gửi</dt>
                  <dd className="mt-0.5 text-slate-700">
                    {new Date(visibleAppeal.createdAt).toLocaleString('vi-VN')}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold text-amber-800">Phạm vi</dt>
                  <dd className="mt-0.5 text-slate-700">
                    {APPEAL_CATEGORIES[visibleAppeal.category]?.label ?? visibleAppeal.category}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold text-amber-800">Email liên hệ</dt>
                  <dd className="mt-0.5 break-words text-slate-700">{visibleAppeal.contactEmail}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold text-amber-800">Nội dung</dt>
                  <dd className="mt-0.5 whitespace-pre-wrap break-words text-slate-700">
                    {visibleAppeal.reason}
                  </dd>
                </div>
              </dl>
            </section>
          ) : (
            result && (
              <section className="dashboard-section">
                <div className="section-header-row">
                  <div>
                    <h2 className="section-title">Phúc khảo điểm mẫu</h2>
                    <p className="section-subtitle">Gửi yêu cầu xem xét lại kết quả nếu cần.</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Nếu bạn nhận thấy có sự sai khác về điểm số hoặc nội dung buổi vấn đáp, bạn có thể gửi đơn phúc khảo trong thời hạn quy định.
                  </p>
                  <Button variant="outline" className="w-full justify-center" onClick={() => setAppealDialogOpen(true)}>
                    <FileText size={15} aria-hidden="true" />
                    <span>Tạo đơn phúc khảo</span>
                  </Button>
                </div>
              </section>
            )
          )}

          {/* Policy Card */}
          <div className="student-security-card">
            <ShieldCheck size={20} className="shrink-0 text-blue-600 mt-0.5" />
            <p>
              {result ? (
                <>
                  <strong>Bảo mật kết quả:</strong> Điểm số đã được giảng viên thẩm định và xác nhận. Quyết định phúc khảo tuân thủ quy chế khảo thí hiện hành.
                </>
              ) : (
                <>
                  <strong>Quy chế điểm số:</strong> Điểm AI chỉ mang tính tham khảo nội bộ. Điểm số và nhận xét chỉ có giá trị pháp lý khi giảng viên phụ trách thẩm định, xác nhận và công bố chính thức.
                </>
              )}
            </p>
          </div>
        </aside>
      </div>

      {result && (
        <GradeAppealDialog
          open={appealDialogOpen}
          examId={result.id}
          examTitle={result.title}
          currentScore={result.score}
          onClose={() => setAppealDialogOpen(false)}
          onSuccess={(newAppeal) => {
            setAppeal(newAppeal)
            setFeedbackMessage(`Đã lưu đơn phúc khảo mẫu (${newAppeal.id}).`)
          }}
        />
      )}
    </section>
  )
}
