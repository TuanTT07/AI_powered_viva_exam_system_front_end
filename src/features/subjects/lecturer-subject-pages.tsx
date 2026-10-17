import { useMemo, type ReactNode } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import {
  BookOpen,
  HelpCircle,
  FileText,
  Calendar,
  ArrowRight,
  Plus,
  PlusCircle,
  Award,
  Sparkles,
  ChevronRight,
  GraduationCap,
  CheckCircle2,
  Building2,
  Filter,
  RotateCcw,
  Search,
  X,
} from 'lucide-react'
import { Alert, Button } from '../../components/ui/primitives'
import { EmptyState, ErrorState, LoadingPage, PermissionDenied, StatusBadge } from '../../components/common/states'
import { useSession } from '../../app/providers/use-session'
import { runtimeConfig } from '../../services/api/runtime-config'
import { useExams } from '../exams/exam-hooks'
import { examRoutes } from '../exams/exam-routes'
import { examStatusMeta } from '../exams/exam-types'
import { useLecturerSubject, useLecturerSubjects } from './subject-hooks'
import type { LecturerSubject } from './subject-types'
import './lecturer-subjects.css'

const isUuid = (value: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
const canOpenFeature = (id: string) => runtimeConfig.dataSource === 'mock' || isUuid(id)
const courseLabel = (subject: LecturerSubject) => `${subject.code} · ${subject.name}`

interface MetricProps {
  label: string
  value: number | null
  icon: ReactNode
  hint: string
  tone: 'blue' | 'indigo' | 'amber' | 'emerald'
}

function Metric({ label, value, icon, hint, tone }: MetricProps) {
  return (
    <div className={`metric-card metric-card--${tone}`}>
      <div className="metric-header">
        <span className="metric-label">{label}</span>
        <div className={`metric-icon-wrap metric-icon-wrap--${tone}`}>{icon}</div>
      </div>
      <strong className="metric-value">{value ?? '—'}</strong>
      <span className="metric-hint">{hint}</span>
    </div>
  )
}

function SubjectCard({ subject }: { subject: LecturerSubject }) {
  return (
    <article className="subject-card">
      <div className="subject-card-top">
        <span className="subject-code-badge">{subject.code}</span>
        <StatusBadge
          label={subject.status === 'ACTIVE' ? 'Đang phụ trách' : 'Đã lưu trữ'}
          tone={subject.status === 'ACTIVE' ? 'success' : 'neutral'}
        />
      </div>

      <h2 className="subject-title">
        <Link to={`/lecturer/subjects/${subject.id}`}>{subject.name}</Link>
      </h2>
      <p className="subject-dept">{subject.department}</p>

      <div className="subject-stats-grid">
        <div className="subject-stat-tile">
          <span>Câu hỏi</span>
          <strong>{subject.questionCount ?? '—'}</strong>
        </div>
        <div className="subject-stat-tile">
          <span>Rubric</span>
          <strong>{subject.rubricCount ?? '—'}</strong>
        </div>
        <div className="subject-stat-tile">
          <span>Kỳ thi</span>
          <strong>{subject.examCount ?? '—'}</strong>
        </div>
      </div>

      <Link className="subject-open-btn" to={`/lecturer/subjects/${subject.id}`}>
        <span>Xem môn học</span>
        <ArrowRight size={15} />
      </Link>
    </article>
  )
}

export function LecturerDashboardPage() {
  const { session } = useSession()
  const subjects = useLecturerSubjects()
  const exams = useExams({ page: 1, pageSize: 5, q: '', subject: '', status: '' })

  if (session.user && !session.user.roles.includes('lecturer')) return <PermissionDenied />
  if (subjects.isLoading || exams.isLoading) return <LoadingPage label="Đang tải không gian giảng viên" />
  if (subjects.isError || exams.isError)
    return (
      <section className="state">
        <Alert tone="danger">
          {subjects.isError
            ? 'Không thể tải danh sách học phần. Vui lòng thử lại.'
            : 'Không thể tải dữ liệu tổng quan giảng viên.'}
        </Alert>
        <Button
          onClick={() => {
            void subjects.refetch()
            void exams.refetch()
          }}
        >
          Thử lại
        </Button>
      </section>
    )

  const rows = subjects.data ?? []
  const examRows = exams.data?.items ?? []
  const name = session.user?.displayName ?? 'Giảng viên'
  const draftQuestions = rows.reduce((total, row) => total + (row.draftQuestionCount ?? 0), 0)

  return (
    <section className="lecturer-page">
      {/* Modern Hero Greeting Banner */}
      <header className="lecturer-hero">
        <div className="lecturer-hero-content">
          <div className="lecturer-hero-badge">
            <GraduationCap size={14} />
            <span>AIVES · KHÔNG GIAN GIẢNG VIÊN</span>
          </div>
          <h1 className="lecturer-hero-title">Xin chào, {name} 👋</h1>
          <p className="lecturer-hero-desc">
            Điều phối học phần, ngân hàng câu hỏi và các kỳ thi vấn đáp trong một không gian thống nhất.
          </p>
        </div>
        <div className="lecturer-actions">
          <Link className="button primary" to="/lecturer/subjects">
            <BookOpen size={16} />
            <span>Xem môn học</span>
          </Link>
          <Link className="button outline" to="/lecturer/rubrics">
            <Award size={16} />
            <span>Quản lý Rubric</span>
          </Link>
          <Link className="button outline" to={examRoutes.new}>
            <Plus size={16} />
            <span>Tạo kỳ thi</span>
          </Link>
        </div>
      </header>

      {/* 4 Modern KPI Metric Cards */}
      <section className="metric-grid" aria-label="Tổng quan">
        <Metric
          label="Môn học phụ trách"
          value={rows.length}
          icon={<BookOpen size={20} />}
          hint="Học phần đang quản lý"
          tone="blue"
        />
        <Metric
          label="Tổng số câu hỏi"
          value={rows.reduce((total, row) => total + (row.questionCount ?? 0), 0)}
          icon={<HelpCircle size={20} />}
          hint="Trong ngân hàng đề thi"
          tone="indigo"
        />
        <Metric
          label="Câu hỏi bản nháp"
          value={draftQuestions}
          icon={<FileText size={20} />}
          hint="Cần rà soát & duyệt"
          tone="amber"
        />
        <Metric
          label="Kỳ thi sắp tới"
          value={examRows.filter((exam) => exam.status === 'DRAFT' || exam.status === 'SCHEDULED').length}
          icon={<Calendar size={20} />}
          hint="Đã lên lịch hoặc đang nháp"
          tone="emerald"
        />
      </section>

      {/* Main Dashboard Grid */}
      <div className="dashboard-grid">
        {/* Left Column: Môn học phụ trách */}
        <section className="dashboard-section">
          <div className="section-header-row">
            <div>
              <h2 className="section-title">Môn học phụ trách</h2>
              <p className="section-subtitle">Các học phần bạn đang trực tiếp quản lý.</p>
            </div>
            <Link className="button outline button--sm" to="/lecturer/subjects">
              <span>Xem tất cả môn học</span>
              <ChevronRight size={14} />
            </Link>
          </div>
          <div className="subject-grid">
            {rows.slice(0, 4).map((subject) => (
              <SubjectCard key={subject.id} subject={subject} />
            ))}
          </div>
        </section>

        {/* Right Column: Kỳ thi gần đây */}
        <section className="dashboard-section">
          <div className="section-header-row">
            <div>
              <h2 className="section-title">Kỳ thi gần đây</h2>
              <p className="section-subtitle">Tiến độ thi và ca vấn đáp.</p>
            </div>
            <Link className="button outline button--sm" to={examRoutes.list}>
              <span>Tất cả</span>
              <ChevronRight size={14} />
            </Link>
          </div>
          {!examRows.length ? (
            <EmptyState title="Chưa có kỳ thi" description="Tạo kỳ thi đầu tiên từ màn hình Kỳ thi." />
          ) : (
            <div className="recent-exams-list">
              {examRows.slice(0, 4).map((exam) => {
                const statusMeta = examStatusMeta[exam.status]
                const statusTone =
                  exam.status === 'IN_PROGRESS'
                    ? 'success'
                    : exam.status === 'SCHEDULED' || exam.status === 'PUBLISHED'
                      ? 'info'
                      : exam.status === 'COMPLETED'
                        ? 'neutral'
                        : 'warning'
                return (
                  <Link key={exam.id} className="recent-exam-card" to={examRoutes.detail(exam.id)}>
                    <div className="recent-exam-icon-wrap">
                      <GraduationCap size={18} />
                    </div>
                    <div className="recent-exam-body">
                      <strong className="recent-exam-title">{exam.title}</strong>
                      <span className="recent-exam-meta">{exam.subjectName}</span>
                    </div>
                    <div className="recent-exam-end">
                      <StatusBadge label={statusMeta.label} tone={statusTone} />
                      <ChevronRight size={16} className="recent-exam-arrow" />
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </section>
      </div>

      {/* Actionable Notice Card */}
      <section className="action-required-card">
        <div className="action-required-icon-wrap">
          <Sparkles size={22} />
        </div>
        <div className="action-required-content">
          <h3>Tác vụ cần xử lý</h3>
          <p>
            Bạn có <strong>{draftQuestions}</strong> câu hỏi bản nháp cần rà soát và một số kỳ thi đang chờ thiết lập.
          </p>
        </div>
        <div className="action-required-btns">
          <Link className="button outline" to="/lecturer/subjects">
            <span>Rà soát {draftQuestions} câu hỏi nháp</span>
            <ArrowRight size={14} />
          </Link>
          <Link className="button primary" to={examRoutes.list}>
            <span>Kiểm tra trạng thái kỳ thi</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </section>
    </section>
  )
}

export function LecturerSubjectListPage() {
  const [params, setParams] = useSearchParams()
  const query = params.get('q') ?? '',
    status = params.get('status') ?? ''
  const subjects = useLecturerSubjects()
  const rows = subjects.data ?? []
  const activeCount = rows.filter((row) => row.status === 'ACTIVE').length
  const totalQuestions = rows.reduce((total, row) => total + (row.questionCount ?? 0), 0)
  const totalRubrics = rows.reduce((total, row) => total + (row.rubricCount ?? 0), 0)

  const filtered = useMemo(
    () =>
      (subjects.data ?? []).filter(
        (subject) =>
          courseLabel(subject).toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()) &&
          (!status || subject.status === status),
      ),
    [subjects.data, query, status],
  )
  const setFilter = (key: string, value: string) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    setParams(next, { preventScrollReset: true })
  }
  if (subjects.isLoading) return <LoadingPage label="Đang tải môn học" />
  if (subjects.isError)
    return (
      <section className="state">
        <Alert tone="danger">Không thể tải danh sách học phần. Vui lòng thử lại.</Alert>
        <Button onClick={() => subjects.refetch()}>Thử lại</Button>
      </section>
    )

  return (
    <section className="subject-list-page">
      {/* Modern Hero Header Banner */}
      <header className="subject-list-heading-card">
        <div className="subject-list-heading-content">
          <div className="subject-hero-tagline">
            <span className="subject-badge-pill">
              <GraduationCap size={13} />
              <span>HỌC PHẦN · HỌC LIỆU</span>
            </span>
          </div>
          <h1>Môn học phụ trách</h1>
          <p>Quản lý câu hỏi, Rubric và học liệu theo từng học phần được phân công.</p>
        </div>
        <div className="subject-count-pill">
          <span className="count-dot" />
          <span>{rows.length} học phần</span>
          <span className="count-sep">·</span>
          <span>{activeCount} đang phụ trách</span>
        </div>
      </header>

      {/* 4 Modern Metric Summary Cards */}
      <div className="subject-summary-metrics">
        <div className="metric-card metric-card--blue">
          <div className="metric-header">
            <span className="metric-label">Môn học phụ trách</span>
            <div className="metric-icon-wrap metric-icon-wrap--blue">
              <BookOpen size={20} />
            </div>
          </div>
          <strong className="metric-value">{rows.length}</strong>
          <span className="metric-hint">Học phần trong học kỳ</span>
        </div>

        <div className="metric-card metric-card--emerald">
          <div className="metric-header">
            <span className="metric-label">Đang phụ trách</span>
            <div className="metric-icon-wrap metric-icon-wrap--emerald">
              <CheckCircle2 size={20} />
            </div>
          </div>
          <strong className="metric-value">{activeCount}</strong>
          <span className="metric-hint">Trạng thái ACTIVE</span>
        </div>

        <div className="metric-card metric-card--indigo">
          <div className="metric-header">
            <span className="metric-label">Ngân hàng câu hỏi</span>
            <div className="metric-icon-wrap metric-icon-wrap--indigo">
              <HelpCircle size={20} />
            </div>
          </div>
          <strong className="metric-value">{totalQuestions}</strong>
          <span className="metric-hint">Câu hỏi đã xây dựng</span>
        </div>

        <div className="metric-card metric-card--amber">
          <div className="metric-header">
            <span className="metric-label">Bộ tiêu chí Rubric</span>
            <div className="metric-icon-wrap metric-icon-wrap--amber">
              <Award size={20} />
            </div>
          </div>
          <strong className="metric-value">{totalRubrics}</strong>
          <span className="metric-hint">Rubric đánh giá viva</span>
        </div>
      </div>

      {/* Modern Filter Toolbar */}
      <form role="search" className="subject-list-filters" onSubmit={(event) => event.preventDefault()}>
        <div className="subject-search-box">
          <Search size={16} className="search-box-icon" />
          <label htmlFor="subject-search" className="sr-only">
            Tìm học phần
          </label>
          <input
            id="subject-search"
            value={query}
            onChange={(event) => setFilter('q', event.target.value)}
            placeholder="Tìm mã hoặc tên môn học..."
            className="subject-search-input"
          />
          {query && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => setFilter('q', '')}
              aria-label="Xóa từ khóa"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="subject-status-select-wrap">
          <Filter size={15} className="select-icon" />
          <label htmlFor="subject-status" className="sr-only">
            Trạng thái
          </label>
          <select
            id="subject-status"
            value={status}
            onChange={(event) => setFilter('status', event.target.value)}
            className="subject-status-select"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="ACTIVE">Đang phụ trách</option>
            <option value="ARCHIVED">Đã lưu trữ</option>
          </select>
        </div>

        <Button
          type="button"
          variant="outline"
          disabled={!query && !status}
          onClick={() => setParams({}, { preventScrollReset: true })}
          className="subject-reset-btn"
        >
          <RotateCcw size={14} />
          <span>Đặt lại</span>
        </Button>

        <p role="status" className="subject-filter-counter">
          {filtered.length} / {rows.length} học phần
        </p>
      </form>

      {!rows.length ? (
        <EmptyState
          title="Chưa có học phần được phân công."
          description="Bạn chưa có môn học nào trong danh sách phụ trách."
        />
      ) : !filtered.length ? (
        <EmptyState
          title="Không tìm thấy môn học"
          description="Đổi từ khóa hoặc đặt lại bộ lọc để xem học phần."
        />
      ) : (
        <div className="subject-list">
          {filtered.map((subject) => (
            <article className="subject-list-row" key={subject.id}>
              <div className="subject-row-name">
                <div className="subject-code-title">
                  <span className="subject-code">{subject.code}</span>
                  <h2>
                    <Link to={`/lecturer/subjects/${subject.id}`}>{subject.name}</Link>
                  </h2>
                </div>
                <p className="subject-dept">
                  <Building2 size={13} className="inline mr-1 text-slate-400" />
                  {subject.department}
                </p>
              </div>

              <div className="subject-row-status">
                <StatusBadge
                  label={subject.status === 'ACTIVE' ? 'Đang phụ trách' : 'Đã lưu trữ'}
                  tone={subject.status === 'ACTIVE' ? 'success' : 'neutral'}
                />
              </div>

              <dl className="subject-row-metrics">
                <div className="metric-chip">
                  <dt>Câu hỏi</dt>
                  <dd>{subject.questionCount ?? '—'}</dd>
                </div>
                <div className="metric-chip">
                  <dt>Rubric</dt>
                  <dd>{subject.rubricCount ?? '—'}</dd>
                </div>
                <div className="metric-chip">
                  <dt>Kỳ thi</dt>
                  <dd>{subject.examCount ?? '—'}</dd>
                </div>
              </dl>

              <div className="subject-row-action">
                <Link
                  className="button outline subject-open-link"
                  aria-label={`Mở học phần ${subject.name}`}
                  to={`/lecturer/subjects/${subject.id}`}
                >
                  <span>Mở học phần</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

function FeatureActionCard({
  id,
  label,
  description,
  icon,
  to,
  tone = 'blue',
  badge,
}: {
  id: string
  label: string
  description: string
  icon: ReactNode
  to: string
  tone?: 'blue' | 'indigo' | 'purple' | 'amber' | 'emerald'
  badge?: string
}) {
  const enabled = canOpenFeature(id)
  if (!enabled) {
    return (
      <div className="feature-action-card disabled" aria-disabled="true">
        <div className={`feature-action-icon feature-action-icon--${tone}`}>{icon}</div>
        <div className="feature-action-content">
          <div className="feature-action-title-row">
            <strong>{label}</strong>
            <span className="feature-action-pill disabled">Sắp có</span>
          </div>
          <p>{description}</p>
        </div>
      </div>
    )
  }
  return (
    <Link className={`feature-action-card feature-action-card--${tone}`} to={to}>
      <div className={`feature-action-icon feature-action-icon--${tone}`}>{icon}</div>
      <div className="feature-action-content">
        <div className="feature-action-title-row">
          <strong>{label}</strong>
          {badge && <span className="feature-action-pill">{badge}</span>}
        </div>
        <p>{description}</p>
      </div>
      <ChevronRight size={18} className="feature-action-arrow" />
    </Link>
  )
}

export function LecturerSubjectOverviewPage() {
  const { subjectId = '' } = useParams()
  const { session } = useSession()
  const subject = useLecturerSubject(subjectId)
  if (session.user && !session.user.roles.includes('lecturer')) return <PermissionDenied />
  if (subject.isLoading) return <LoadingPage label="Đang tải tổng quan môn học" />
  if (subject.isError) return <ErrorState description="Không thể tải tổng quan môn học." />
  if (!subject.data)
    return (
      <section className="state">
        <h1>Không tìm thấy môn học</h1>
        <p>Học phần này không nằm trong danh sách được phân công.</p>
        <Link className="button outline" to="/lecturer/subjects">
          Về danh sách môn học
        </Link>
      </section>
    )
  const item = subject.data
  const base = `/lecturer/subjects/${item.id}`
  return (
    <section className="lecturer-page">
      {/* Subject Hero Header */}
      <header className="subject-hero-card">
        <div className="subject-hero-main">
          <nav className="subject-breadcrumb" aria-label="Breadcrumb">
            <Link to="/lecturer/subjects">Môn học phụ trách</Link>
            <ChevronRight size={13} />
            <span>{item.code}</span>
          </nav>
          <div className="subject-hero-title-row">
            <h1 className="subject-hero-title">{item.name}</h1>
            <StatusBadge
              label={item.status === 'ACTIVE' ? 'Đang phụ trách' : 'Đã lưu trữ'}
              tone={item.status === 'ACTIVE' ? 'success' : 'neutral'}
            />
          </div>
          <p className="subject-hero-meta">
            <span className="subject-code-badge">{item.code}</span>
            <span>{item.department}</span>
          </p>
        </div>
        <div className="subject-hero-actions">
          <Link className="button primary" to={`${base}/questions/generate`}>
            <Sparkles size={16} />
            <span>Sinh câu hỏi AI</span>
          </Link>
          <Link className="button outline" to={`${base}/questions`}>
            <BookOpen size={16} />
            <span>Ngân hàng câu hỏi</span>
          </Link>
        </div>
      </header>

      {/* 2-column Balanced Dashboard */}
      <div className="overview-layout">
        {/* Left Column: 6 Stat KPI Tiles */}
        <section className="dashboard-section">
          <div className="section-header-row">
            <div>
              <h2 className="section-title">Chỉ số học phần</h2>
              <p className="section-subtitle">Dữ liệu ngân hàng câu hỏi, tiêu chí và kỳ thi.</p>
            </div>
          </div>
          <div className="overview-cards">
            <div className="overview-card overview-card--blue">
              <div className="overview-card-header">
                <span>Câu hỏi</span>
                <HelpCircle size={18} className="overview-card-icon text-blue-600" />
              </div>
              <strong>{item.questionCount ?? '—'}</strong>
            </div>
            <div className="overview-card overview-card--amber">
              <div className="overview-card-header">
                <span>Bản nháp</span>
                <FileText size={18} className="overview-card-icon text-amber-600" />
              </div>
              <strong>{item.draftQuestionCount ?? '—'}</strong>
            </div>
            <div className="overview-card overview-card--emerald">
              <div className="overview-card-header">
                <span>Đã duyệt</span>
                <CheckCircle2 size={18} className="overview-card-icon text-emerald-600" />
              </div>
              <strong>{item.approvedQuestionCount ?? '—'}</strong>
            </div>
            <div className="overview-card overview-card--purple">
              <div className="overview-card-header">
                <span>Rubric</span>
                <Award size={18} className="overview-card-icon text-purple-600" />
              </div>
              <strong>{item.rubricCount ?? '—'}</strong>
            </div>
            <div className="overview-card overview-card--indigo">
              <div className="overview-card-header">
                <span>Học liệu</span>
                <BookOpen size={18} className="overview-card-icon text-indigo-600" />
              </div>
              <strong>{item.materialCount ?? '—'}</strong>
            </div>
            <div className="overview-card overview-card--cyan">
              <div className="overview-card-header">
                <span>Kỳ thi</span>
                <GraduationCap size={18} className="overview-card-icon text-cyan-600" />
              </div>
              <strong>{item.examCount ?? '—'}</strong>
            </div>
          </div>
        </section>

        {/* Right Column: 5 Interactive Feature Cards */}
        <section className="dashboard-section">
          <div className="section-header-row">
            <div>
              <h2 className="section-title">Tác vụ học phần</h2>
              <p className="section-subtitle">Các công cụ quản lý và sinh nội dung học phần.</p>
            </div>
          </div>
          <div className="feature-actions-grid">
            <FeatureActionCard
              id={item.id}
              label="Sinh câu hỏi bằng AI"
              description="Tự động trích xuất và sinh câu hỏi từ tài liệu RAG"
              icon={<Sparkles size={20} />}
              to={`${base}/questions/generate`}
              tone="purple"
              badge="AI RAG"
            />
            <FeatureActionCard
              id={item.id}
              label="Ngân hàng câu hỏi"
              description="Xem, phân loại và duyệt kho câu hỏi vấn đáp"
              icon={<BookOpen size={20} />}
              to={`${base}/questions`}
              tone="blue"
            />
            <FeatureActionCard
              id={item.id}
              label="Soạn câu hỏi mới"
              description="Thêm câu hỏi thi thủ công liên kết rubric"
              icon={<PlusCircle size={20} />}
              to={`${base}/questions/new`}
              tone="emerald"
            />
            <FeatureActionCard
              id={item.id}
              label="Rubric chấm điểm"
              description="Quản lý bộ tiêu chí và thang điểm đánh giá"
              icon={<Award size={20} />}
              to={`${base}/rubrics`}
              tone="amber"
            />
            <FeatureActionCard
              id={item.id}
              label="Tài liệu môn học"
              description="Tải lên slide, giáo trình làm nguồn tri thức"
              icon={<FileText size={20} />}
              to={`${base}/materials`}
              tone="indigo"
            />
          </div>
        </section>
      </div>

      {/* Bottom Section: Kỳ thi của học phần */}
      <section className="subject-exam-banner">
        <div className="subject-exam-banner-left">
          <div className="subject-exam-banner-icon">
            <Calendar size={24} />
          </div>
          <div>
            <h2 className="subject-exam-banner-title">Kỳ thi vấn đáp của học phần</h2>
            <p className="subject-exam-banner-desc">
              Tổ chức kỳ thi, phân bổ ca vấn đáp cho sinh viên và theo dõi tiến trình chấm thi.
            </p>
          </div>
        </div>
        <div className="subject-exam-banner-actions">
          <Link
            className="button outline"
            to={`${examRoutes.list}?subject=${encodeURIComponent(item.id)}`}
          >
            <Calendar size={15} />
            <span>Xem danh sách kỳ thi</span>
          </Link>
          <Link
            className="button primary"
            to={`${examRoutes.new}?subject=${encodeURIComponent(item.id)}`}
          >
            <Plus size={15} />
            <span>Tạo kỳ thi mới</span>
          </Link>
        </div>
      </section>
    </section>
  )
}
