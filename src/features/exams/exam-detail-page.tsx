import { Link, useNavigate, useParams } from 'react-router-dom'
import { useState } from 'react'
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Calendar,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  Clock,
  GraduationCap,
  HelpCircle,
  Info,
  Layers,
  Settings,
  Sliders,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  Users,
} from 'lucide-react'
import { Alert, Button, Dialog, Progress, Skeleton } from '../../components/ui/primitives'
import { ErrorState, LoadingPage, PermissionDenied, StatusBadge } from '../../components/common/states'
import { useSession } from '../../app/providers/use-session'
import { useQuestions } from '../question-bank/question-hooks'
import {
  useDeleteExam,
  useExam,
  useExamQuestionConfig,
  useExamRoster,
  useExamSchedule,
  useUpdateExamStatus,
} from './exam-hooks'
import { examRoutes } from './exam-routes'
import { examStatusMeta, type ExamStatus } from './exam-types'
import {
  evaluateBasicInformation,
  evaluateExamReadiness,
  evaluateQuestionConfig,
  evaluateRoster,
  evaluateSchedule,
  type ReadinessSection,
  type ReadinessStatus,
} from './exam-readiness'
import './exam-detail.css'
import { runtimeConfig } from '../../services/api/runtime-config'
import { ApiExamDetailPage } from './api-exam-detail-page'

const formatTime = (value: string) =>
  new Intl.DateTimeFormat('vi-VN', { dateStyle: 'full', timeStyle: 'short' }).format(new Date(value))

const statusMeta: Record<ReadinessStatus, { label: string; tone: 'neutral' | 'info' | 'success' | 'warning' | 'danger' }> = {
  COMPLETE: { label: 'HOÀN TẤT', tone: 'success' },
  INCOMPLETE: { label: 'CHƯA HOÀN TẤT', tone: 'warning' },
  WARNING: { label: 'CẦN RÀ SOÁT', tone: 'warning' },
  UNAVAILABLE: { label: 'CHƯA XÁC NHẬN', tone: 'danger' },
}

const sectionConfig: Record<
  ReadinessSection['key'],
  { step: string; icon: typeof SlidersHorizontal; colorClass: string }
> = {
  basic: { step: '01', icon: SlidersHorizontal, colorClass: 'section-blue' },
  roster: { step: '02', icon: Users, colorClass: 'section-indigo' },
  schedule: { step: '03', icon: CalendarClock, colorClass: 'section-amber' },
  questions: { step: '04', icon: Layers, colorClass: 'section-emerald' },
}

export function ExamDetailPage() {
  return runtimeConfig.dataSource === 'api' ? <ApiExamDetailPage /> : <MockExamDetailPage />
}

function MockExamDetailPage() {
  const { examId = '' } = useParams()
  const navigate = useNavigate()
  const { session } = useSession()
  const exam = useExam(examId)
  const roster = useExamRoster(examId)
  const schedule = useExamSchedule(examId)
  const config = useExamQuestionConfig(examId)
  const questions = useQuestions(exam.data?.subjectId ?? '')
  const remove = useDeleteExam()
  const statusUpdate = useUpdateExamStatus()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [nextStatus, setNextStatus] = useState<ExamStatus | null>(null)

  if (session.user && !session.user.roles.includes('lecturer')) return <PermissionDenied />
  if (exam.isLoading) return <LoadingPage label="Đang tải tổng quan kỳ thi" />
  if (exam.isError) {
    return (
      <section className="state exam-detail-state">
        <Alert tone="danger">Không thể tải tổng quan kỳ thi.</Alert>
        <Button
          onClick={() => {
            void exam.refetch()
          }}
        >
          Thử lại
        </Button>
      </section>
    )
  }
  if (!exam.data) {
    return <ErrorState description="Không tìm thấy kỳ thi hoặc kỳ thi không còn thuộc phạm vi phụ trách." />
  }

  const examData = exam.data
  const sections = [
    evaluateBasicInformation(examData),
    evaluateRoster(roster.data, roster.isError),
    evaluateSchedule(examData, roster.data, schedule.data, schedule.isError),
    evaluateQuestionConfig(examData, config.data, questions.data, config.isError || questions.isError),
  ]
  const readiness = evaluateExamReadiness(sections)
  const editable = examData.status === 'DRAFT' || examData.status === 'SCHEDULED'
  const nextStatuses: Record<ExamStatus, ExamStatus[]> = {
    DRAFT: ['PUBLISHED', 'CANCELLED'],
    PUBLISHED: ['IN_PROGRESS', 'CANCELLED'],
    SCHEDULED: ['IN_PROGRESS', 'CANCELLED'],
    IN_PROGRESS: ['COMPLETED', 'CANCELLED'],
    COMPLETED: [],
    CANCELLED: [],
  }

  const retryAll = () => {
    void roster.refetch()
    void schedule.refetch()
    void config.refetch()
    void questions.refetch()
  }

  return (
    <section className="exam-detail-page">
      {/* Breadcrumb */}
      <nav className="exam-detail-breadcrumb" aria-label="Breadcrumb">
        <Link to={examRoutes.list} className="breadcrumb-link">
          <ArrowLeft size={14} />
          <span>Kỳ thi vấn đáp</span>
        </Link>
        <ChevronRight size={13} className="breadcrumb-separator" aria-hidden="true" />
        <span className="breadcrumb-current">{examData.id}</span>
      </nav>

      {/* Hero Header Card */}
      <header className="exam-detail-hero">
        <div className="exam-detail-hero-main">
          <div className="exam-detail-hero-tagline">
            <span className="exam-type-pill">
              <GraduationCap size={13} />
              <span>KỲ THI · TỔNG QUAN</span>
            </span>
            <span className="exam-id-tag">{examData.id}</span>
          </div>
          <h1 className="exam-detail-title">{examData.title}</h1>
          <div className="exam-detail-subject-row">
            <BookOpen size={15} className="text-blue-600 shrink-0" />
            <span className="subject-code">{examData.subjectCode}</span>
            <span className="separator-dot">·</span>
            <span className="subject-name">{examData.subjectName}</span>
          </div>
        </div>

        <div className="exam-detail-hero-actions">
          <div className="hero-status-wrapper">
            <StatusBadge label={examStatusMeta[examData.status].label} tone={examStatusMeta[examData.status].tone} />
          </div>
          <div className="hero-btn-group">
            {editable && (
              <Link className="button outline gap-2" to={examRoutes.edit(examId)}>
                <Settings size={15} />
                <span>Sửa cấu hình</span>
              </Link>
            )}
            <Link className="button primary gap-2" to={examRoutes.monitor(examId)}>
              <Activity size={15} />
              <span>Giám sát &amp; Nhật ký</span>
            </Link>
            {['DRAFT', 'PUBLISHED', 'SCHEDULED'].includes(examData.status) && (
              <Button type="button" variant="danger" className="gap-2" onClick={() => setDeleteOpen(true)}>
                <Trash2 size={15} />
                <span>Xóa kỳ thi</span>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Read-only Notice */}
      {!editable && (
        <div className="exam-readonly-banner" role="status">
          <span className="readonly-banner-icon">
            <Info size={16} />
          </span>
          <span className="readonly-banner-content">
            <strong>Chế độ chỉ đọc.</strong> Kỳ thi {examStatusMeta[examData.status].label.toLocaleLowerCase()} không thể thay đổi cấu hình. Bạn vẫn có thể xem các phần đã lưu.
          </span>
        </div>
      )}

      {/* 4 Key Facts Cards */}
      <dl className="exam-detail-facts">
        <div className="fact-metric-card fact-time">
          <div className="fact-header">
            <span className="fact-icon-badge fact-icon-blue">
              <Calendar size={18} />
            </span>
            <dt>Bắt đầu</dt>
          </div>
          <dd>{formatTime(examData.scheduledAt)}</dd>
          <p className="fact-hint">Thời điểm mở phiên thi chính thức</p>
        </div>

        <div className="fact-metric-card fact-duration">
          <div className="fact-header">
            <span className="fact-icon-badge fact-icon-indigo">
              <Clock size={18} />
            </span>
            <dt>Thời lượng / sinh viên</dt>
          </div>
          <dd>{examData.durationMinutes} phút</dd>
          <p className="fact-hint">Mỗi lượt phỏng vấn viva tiêu chuẩn</p>
        </div>

        <div className="fact-metric-card fact-questions">
          <div className="fact-header">
            <span className="fact-icon-badge fact-icon-amber">
              <HelpCircle size={18} />
            </span>
            <dt>Câu hỏi chính</dt>
          </div>
          <dd>{examData.mainQuestionCount}</dd>
          <p className="fact-hint">Số câu hỏi bốc thăm chính</p>
        </div>

        <div className="fact-metric-card fact-ai">
          <div className="fact-header">
            <span className="fact-icon-badge fact-icon-emerald">
              <Sparkles size={18} />
            </span>
            <dt>Đào sâu tối đa</dt>
          </div>
          <dd>{examData.maxFollowUpCount}</dd>
          <p className="fact-hint">Câu hỏi AI đào sâu phản xạ</p>
        </div>
      </dl>

      {/* Readiness Progress Card */}
      <section
        className={`exam-readiness-card ${readiness.ready ? 'ready' : 'incomplete'}`}
        aria-labelledby="readiness-heading"
      >
        <div className="readiness-content-col">
          <div className="readiness-icon-pill">
            {readiness.ready ? (
              <CheckCircle2 size={24} className="text-emerald-600" />
            ) : (
              <AlertCircle size={24} className="text-amber-500" />
            )}
          </div>
          <div className="readiness-text-group">
            <p className="readiness-eyebrow">TIẾN ĐỘ THIẾT LẬP KỲ THI</p>
            <h2 id="readiness-heading">{readiness.ready ? 'Thiết lập đã hoàn tất' : 'Hoàn tất thiết lập kỳ thi'}</h2>
            <p className="readiness-desc">
              {readiness.ready
                ? 'Danh sách thí sinh, lịch thi và bộ câu hỏi đã được thiết lập.'
                : `${readiness.completedCount} / ${sections.length} bước đã hoàn tất.`}
            </p>
          </div>
        </div>

        <div className="readiness-progress-col">
          <div className="readiness-progress-meta">
            <span className="readiness-badge-pill">
              {readiness.ready && <CheckCircle2 size={12} />}
              {readiness.completedCount}/{sections.length} hoàn tất
            </span>
            <span className="readiness-percent">
              {Math.round((readiness.completedCount / sections.length) * 100)}%
            </span>
          </div>
          <Progress
            label={`${readiness.completedCount}/${sections.length} hoàn tất`}
            value={readiness.completedCount}
            max={sections.length}
          />
        </div>
      </section>

      {/* Blocking Issues Banner */}
      {readiness.blockingIssues.length > 0 && (
        <div className="exam-issues-banner error" role="status">
          <div className="issues-banner-header">
            <AlertCircle size={16} />
            <strong>Cần hoàn tất ({readiness.blockingIssues.length})</strong>
          </div>
          <ul className="issues-list">
            {readiness.blockingIssues.slice(0, 4).map((issue) => (
              <li key={issue}>{issue}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Warnings Banner */}
      {readiness.warnings.length > 0 && (
        <div className="exam-issues-banner warning" role="status">
          <div className="issues-banner-header">
            <AlertTriangle size={16} />
            <strong>Cần rà soát ({readiness.warnings.length})</strong>
          </div>
          <ul className="issues-list">
            {readiness.warnings.map((issue) => (
              <li key={issue}>{issue}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Status Lifecycle Actions */}
      {nextStatuses[examData.status].length > 0 && (
        <section className="exam-status-action-card" aria-label="Chuyển trạng thái">
          <div className="status-action-header">
            <div className="status-action-icon-pill">
              <Sliders size={18} />
            </div>
            <div>
              <h2>Trạng thái kỳ thi</h2>
              <p>Chuyển đổi trạng thái vòng đời kỳ thi theo tiến độ thực tế.</p>
            </div>
          </div>
          <div className="status-action-buttons">
            {nextStatuses[examData.status].map((status) => (
              <Button
                key={status}
                type="button"
                variant={status === 'CANCELLED' ? 'danger' : 'outline'}
                disabled={statusUpdate.isPending}
                onClick={() => setNextStatus(status)}
              >
                {examStatusMeta[status].label}
              </Button>
            ))}
          </div>
          {statusUpdate.isError && (
            <Alert tone="danger">
              {statusUpdate.error instanceof Error ? statusUpdate.error.message : 'Không thể chuyển trạng thái.'}
            </Alert>
          )}
        </section>
      )}

      {/* 4 Workflow Setup Sections */}
      <section className="exam-detail-sections" aria-label="Tiến độ thiết lập">
        <SectionCard
          section={sections[0]}
          action={examRoutes.edit(examId)}
          actionLabel="Mở cấu hình"
          editable={editable}
        />
        <SectionCard
          section={sections[1]}
          action={examRoutes.students(examId)}
          actionLabel="Mở danh sách thí sinh"
          editable={editable}
          loading={roster.isLoading}
          retry={roster.isError ? retryAll : undefined}
        />
        <SectionCard
          section={sections[2]}
          action={examRoutes.schedule(examId)}
          actionLabel="Mở lịch"
          editable={editable}
          loading={schedule.isLoading}
          retry={schedule.isError ? retryAll : undefined}
        />
        <SectionCard
          section={sections[3]}
          action={examRoutes.questions(examId)}
          actionLabel="Mở cấu hình câu hỏi"
          editable={editable}
          loading={config.isLoading || questions.isLoading}
          retry={config.isError || questions.isError ? retryAll : undefined}
          subjectId={examData.subjectId}
        />
      </section>

      {/* Footer Navigation */}
      <footer className="exam-detail-footer">
        <Link className="button outline gap-2" to={examRoutes.list}>
          <ArrowLeft size={15} />
          <span>Về danh sách kỳ thi</span>
        </Link>
      </footer>

      {/* Delete Exam Dialog */}
      <Dialog
        open={deleteOpen}
        onClose={() => {
          if (!remove.isPending) {
            remove.reset()
            setDeleteOpen(false)
          }
        }}
        title="Xóa kỳ thi?"
      >
        <p>Bạn có chắc muốn xóa “{examData.title}” không?</p>
        <p className="form-help">Chỉ kỳ thi chưa diễn ra mới được xóa.</p>
        {remove.isError && (
          <Alert tone="danger">
            {remove.error instanceof Error ? remove.error.message : 'Không thể xóa kỳ thi.'}
          </Alert>
        )}
        <div className="dialog-actions">
          <Button type="button" variant="outline" disabled={remove.isPending} onClick={() => setDeleteOpen(false)}>
            Hủy
          </Button>
          <Button
            type="button"
            variant="danger"
            pending={remove.isPending}
            onClick={() => remove.mutate(examId, { onSuccess: () => navigate(examRoutes.list) })}
          >
            Xóa kỳ thi
          </Button>
        </div>
      </Dialog>

      {/* Status Transition Dialog */}
      <Dialog
        open={Boolean(nextStatus)}
        onClose={() => setNextStatus(null)}
        title="Xác nhận chuyển trạng thái"
      >
        <p>
          Chuyển kỳ thi sang <strong>{nextStatus ? examStatusMeta[nextStatus].label : ''}</strong>?
        </p>
        <div className="dialog-actions">
          <Button type="button" variant="outline" onClick={() => setNextStatus(null)}>
            Hủy
          </Button>
          <Button
            type="button"
            pending={statusUpdate.isPending}
            onClick={() => nextStatus && statusUpdate.mutate({ examId, status: nextStatus }, { onSuccess: () => setNextStatus(null) })}
          >
            Xác nhận
          </Button>
        </div>
      </Dialog>
    </section>
  )
}

function SectionCard({
  section,
  action,
  actionLabel,
  editable,
  loading,
  retry,
  subjectId,
}: {
  section: ReadinessSection
  action: string
  actionLabel: string
  editable: boolean
  loading?: boolean
  retry?: () => void
  subjectId?: string
}) {
  const meta = statusMeta[section.status]
  const cfg = sectionConfig[section.key] || { step: '00', icon: SlidersHorizontal, colorClass: 'section-blue' }
  const Icon = cfg.icon
  const target =
    section.key === 'questions' && section.status === 'WARNING' && subjectId
      ? `/lecturer/subjects/${subjectId}/questions`
      : action
  const label =
    section.key === 'questions' && section.status === 'WARNING' && subjectId ? 'Mở ngân hàng câu hỏi' : actionLabel

  return (
    <article className={`exam-section-card ${section.status.toLowerCase()} ${cfg.colorClass}`}>
      <header className="exam-section-card-head">
        <div className="exam-section-card-title-group">
          <div className="section-step-icon-wrap">
            <span className="section-icon-badge">
              <Icon size={18} />
            </span>
            <span className="section-step-pill">{cfg.step}</span>
          </div>
          <div>
            <h2 className="section-heading">{section.title}</h2>
          </div>
        </div>
        <div className="section-status-badge-wrap">
          {loading ? <StatusBadge label="ĐANG TẢI" tone="info" /> : <StatusBadge label={meta.label} tone={meta.tone} />}
        </div>
      </header>

      <div className="exam-section-card-body">
        {loading ? (
          <p aria-busy="true">
            <Skeleton label={`Đang tải ${section.title.toLocaleLowerCase()}`} />
          </p>
        ) : (
          <>
            <p className="section-summary-text">{section.summary}</p>
            {section.issues.length > 0 && (
              <ul className="section-issues">
                {section.issues.slice(0, 2).map((issue) => (
                  <li key={issue}>{issue}</li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>

      <footer className="exam-section-card-footer">
        {!loading &&
          (editable || section.status === 'UNAVAILABLE' ? (
            <Link className="button outline section-action-btn" to={target}>
              <span>{label}</span>
              <ArrowRight size={14} />
            </Link>
          ) : (
            <Link className="button outline section-action-btn" to={action}>
              <span>Xem chi tiết</span>
              <ArrowRight size={14} />
            </Link>
          ))}
        {retry && (
          <Button variant="outline" onClick={retry}>
            Thử lại
          </Button>
        )}
      </footer>
    </article>
  )
}

export function ExamDetailLoadingSection() {
  return (
    <div className="exam-section-card">
      <Skeleton label="Đang tải phần thiết lập" />
    </div>
  )
}
