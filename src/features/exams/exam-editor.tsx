import { useEffect, useState, type FormEvent } from 'react'
import { Link, useBlocker, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  Brain,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  GraduationCap,
  HelpCircle,
  Lock,
  Save,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Zap,
} from 'lucide-react'
import { EmptyState, LoadingPage, StatusBadge } from '../../components/common/states'
import { Alert, Button, Dialog, Input } from '../../components/ui/primitives'
import { useExam, useExamSubjects, useCreateExam, useUpdateExam } from './exam-hooks'
import { examStatusMeta, type ExamSession } from './exam-types'
import {
  examDefaults,
  examToForm,
  hasExamErrors,
  toExamDraft,
  validateExamForm,
  type ExamFieldErrors,
  type ExamFormValues,
} from './exam-validation'
import './exam-editor.css'

const listPath = '/lecturer/exams'

const BLOOM_PRESETS = [
  { label: 'Chuẩn FPT (30/40/20/10)', remember: '30', understand: '40', apply: '20', analyze: '10' },
  { label: 'Cơ bản / Lý thuyết (40/40/20/0)', remember: '40', understand: '40', apply: '20', analyze: '0' },
  { label: 'Ứng dụng thực hành (20/30/35/15)', remember: '20', understand: '30', apply: '35', analyze: '15' },
  { label: 'Nâng cao / Phân tích (15/25/40/20)', remember: '15', understand: '25', apply: '40', analyze: '20' },
]

export function ExamEditorPage() {
  const { examId } = useParams()
  const examQuery = useExam(examId)
  const subjectsQuery = useExamSubjects()
  const editMode = Boolean(examId)

  if (editMode && examQuery.isLoading) return <LoadingPage label="Đang tải cấu hình kỳ thi" />

  if (editMode && examQuery.isError) {
    return (
      <section className="exam-editor-state-card">
        <div className="exam-editor-state-icon">
          <AlertTriangle size={28} />
        </div>
        <h2>Không thể tải kỳ thi</h2>
        <p>Đã xảy ra lỗi khi tải dữ liệu cấu hình kỳ thi. Vui lòng thử lại.</p>
        <Button onClick={() => examQuery.refetch()}>Thử lại</Button>
      </section>
    )
  }

  if (editMode && !examQuery.data) {
    return (
      <section className="exam-editor-state-card">
        <div className="exam-editor-state-icon">
          <AlertTriangle size={28} />
        </div>
        <h2>Không tìm thấy kỳ thi</h2>
        <p>Kỳ thi này không tồn tại hoặc bạn không được phân công phụ trách.</p>
        <Link className="button outline" to={listPath}>
          Về danh sách kỳ thi
        </Link>
      </section>
    )
  }

  if (
    editMode &&
    examQuery.data &&
    examQuery.data.status !== 'DRAFT' &&
    examQuery.data.status !== 'SCHEDULED'
  ) {
    return <NonEditableExam exam={examQuery.data} />
  }

  if (subjectsQuery.isLoading) return <LoadingPage label="Đang tải học phần được phân công" />

  if (subjectsQuery.isError) {
    return (
      <section className="exam-editor-state-card">
        <div className="exam-editor-state-icon">
          <AlertTriangle size={28} />
        </div>
        <h2>Lỗi kết nối học phần</h2>
        <p>Không thể tải danh sách học phần được phân công giảng dạy.</p>
        <Button onClick={() => subjectsQuery.refetch()}>Thử lại</Button>
      </section>
    )
  }

  if (!subjectsQuery.data?.length) {
    return (
      <section className="exam-editor-page">
        <EmptyState
          title="Chưa có học phần"
          description="Bạn cần được phân công ít nhất một học phần trước khi thiết lập kỳ thi."
        />
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Link className="button outline" to={listPath}>
            Về danh sách kỳ thi
          </Link>
        </div>
      </section>
    )
  }

  return (
    <ExamEditorForm
      key={examId ?? 'new'}
      mode={editMode ? 'edit' : 'create'}
      initial={examQuery.data ?? null}
      subjects={subjectsQuery.data}
    />
  )
}

function NonEditableExam({ exam }: { exam: ExamSession }) {
  const meta = examStatusMeta[exam.status]
  return (
    <section className="exam-editor-state-card">
      <div className="exam-editor-state-icon">
        <Lock size={28} />
      </div>
      <h2>Kỳ thi đang bị khóa cấu hình</h2>
      <p>
        Kỳ thi <strong>{exam.title}</strong> hiện đang ở trạng thái{' '}
        <StatusBadge label={meta.label} tone={meta.tone} />. Chỉ các kỳ thi ở trạng thái Nháp hoặc Đã lên
        lịch mới được phép thay đổi cấu hình phiên thi.
      </p>
      <Link className="button primary" to={`/lecturer/exams/${exam.id}`}>
        Xem tổng quan kỳ thi
      </Link>
    </section>
  )
}

function ExamEditorForm({
  mode,
  initial,
  subjects,
}: {
  mode: 'create' | 'edit'
  initial: ExamSession | null
  subjects: { id: string; code: string; name: string }[]
}) {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [form, setForm] = useState<ExamFormValues>(() =>
    initial
      ? examToForm(initial)
      : {
          ...examDefaults,
          subjectId: subjects.some((subject) => subject.id === params.get('subject'))
            ? params.get('subject')!
            : '',
        }
  )
  const [errors, setErrors] = useState<ExamFieldErrors>({})
  const [dirty, setDirty] = useState(false)
  const create = useCreateExam()
  const update = useUpdateExam()
  const saving = create.isPending || update.isPending
  const saveError = create.isError || update.isError
  const blocker = useBlocker(dirty && !saving)

  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (dirty && !saving) event.preventDefault()
    }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty, saving])

  const updateField = (field: keyof ExamFormValues, value: string | boolean) => {
    setForm((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
    setDirty(true)
  }

  const applyBloomPreset = (preset: (typeof BLOOM_PRESETS)[number]) => {
    setForm((current) => ({
      ...current,
      bloomRememberRatio: preset.remember,
      bloomUnderstandRatio: preset.understand,
      bloomApplyRatio: preset.apply,
      bloomAnalyzeRatio: preset.analyze,
    }))
    setDirty(true)
  }

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextErrors = validateExamForm(form, subjects, {
      mode,
      initialScheduledAt: initial?.scheduledAt,
    })
    setErrors(nextErrors)
    if (hasExamErrors(nextErrors)) return

    const draft = toExamDraft(form)
    if (mode === 'create') {
      create.mutate(draft, {
        onSuccess: (exam) => {
          setDirty(false)
          navigate(`/lecturer/exams/${exam.id}`)
        },
      })
    } else if (initial) {
      update.mutate(
        { examId: initial.id, draft },
        {
          onSuccess: (exam) => {
            setDirty(false)
            navigate(`/lecturer/exams/${exam.id}`)
          },
        }
      )
    }
  }

  const cancel = () => navigate(listPath)

  // Computed visual values
  const selectedSubject = subjects.find((s) => s.id === form.subjectId)
  const rememberRatio = Math.max(0, Math.min(100, Number(form.bloomRememberRatio) || 0))
  const understandRatio = Math.max(0, Math.min(100, Number(form.bloomUnderstandRatio) || 0))
  const applyRatio = Math.max(0, Math.min(100, Number(form.bloomApplyRatio) || 0))
  const analyzeRatio = Math.max(0, Math.min(100, Number(form.bloomAnalyzeRatio) || 0))
  const totalBloom = rememberRatio + understandRatio + applyRatio + analyzeRatio
  const isBloomBalanced = totalBloom === 100

  let formattedDate = 'Chưa chọn thời gian'
  if (form.startDate && form.startTime) {
    try {
      const dt = new Date(`${form.startDate}T${form.startTime}`)
      if (!isNaN(dt.getTime())) {
        formattedDate = new Intl.DateTimeFormat('vi-VN', {
          weekday: 'short',
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }).format(dt)
      }
    } catch {
      // Fallback
    }
  }

  return (
    <section className="exam-editor-page">
      {/* Breadcrumb Navigation & Top Action */}
      <nav className="exam-editor-nav" aria-label="Breadcrumb">
        <div className="exam-editor-breadcrumb">
          <Link to={listPath}>Kỳ thi vấn đáp</Link>
          <span className="exam-editor-breadcrumb-sep">/</span>
          <span className="exam-editor-breadcrumb-current">
            {mode === 'create' ? 'Tạo kỳ thi mới' : 'Cấu hình kỳ thi'}
          </span>
        </div>
        <Link to={listPath} className="exam-editor-back-link">
          <ArrowLeft size={14} />
          <span>Về danh sách</span>
        </Link>
      </nav>

      {/* Hero Header Banner */}
      <header className="exam-editor-hero">
        <div className="exam-editor-hero-main">
          <div className="exam-editor-hero-badge">
            <SlidersHorizontal size={13} />
            <span>KỲ THI VẤN ĐÁP · THIẾT LẬP CẤU HÌNH</span>
          </div>
          <h1 className="exam-editor-hero-title">
            {mode === 'create' ? 'Tạo kỳ thi vấn đáp mới' : 'Cấu hình kỳ thi'}
          </h1>
          <p className="exam-editor-hero-desc">
            {mode === 'create'
              ? 'Thiết lập các thông số cốt lõi cho kỳ thi vấn đáp mới bao gồm học phần, thời gian, quy chuẩn viva và thang nhận thức Bloom.'
              : 'Cập nhật cấu hình và tham số khảo thí cho kỳ thi trước khi tổ chức các ca thi chính thức.'}
          </p>
        </div>
        {initial && (
          <div className="exam-editor-hero-meta">
            <StatusBadge
              label={examStatusMeta[initial.status].label}
              tone={examStatusMeta[initial.status].tone}
            />
            <span className="exam-id-chip">{initial.id}</span>
          </div>
        )}
      </header>

      {/* Main 2-Column Responsive Layout */}
      <form className="exam-editor-layout" noValidate onSubmit={submit}>
        {/* Left Column: Form Cards */}
        <div className="exam-editor-main-form">
          {/* Card 1: Hồ sơ kỳ thi & Thời gian tổ chức */}
          <section className="exam-editor-card" aria-labelledby="exam-profile-heading">
            <div className="exam-editor-card-header">
              <div className="exam-card-icon-badge exam-card-icon-badge--blue">
                <BookOpen size={20} />
              </div>
              <div className="exam-editor-card-headings">
                <h2 id="exam-profile-heading">Hồ sơ kỳ thi &amp; Thời gian</h2>
                <p>Thông tin định danh học phần và lịch mở phòng thi viva chính thức.</p>
              </div>
            </div>

            {/* Field: Tên kỳ thi */}
            <div className="form-field-group">
              <label htmlFor="exam-title" className="form-label-row">
                <span>
                  Tên kỳ thi <span className="form-label-required">*</span>
                </span>
                <span className="form-char-count">{form.title.length}/120</span>
              </label>
              <div className="form-input-wrap">
                <FileText size={16} className="form-input-icon" />
                <Input
                  id="exam-title"
                  className="form-control-input"
                  maxLength={120}
                  placeholder="Ví dụ: Thi vấn đáp kết thúc môn - SWD392 Fall 2026"
                  required
                  value={form.title}
                  onChange={(event) => updateField('title', event.target.value)}
                  aria-invalid={Boolean(errors.title)}
                  aria-describedby={errors.title ? 'exam-title-error' : undefined}
                />
              </div>
              {errors.title && (
                <span className="form-field-error" id="exam-title-error" role="alert">
                  {errors.title}
                </span>
              )}
            </div>

            {/* Field: Học phần */}
            <div className="form-field-group">
              <label htmlFor="exam-subject" className="form-label-row">
                <span>
                  Học phần phân công <span className="form-label-required">*</span>
                </span>
              </label>
              <div className="form-input-wrap">
                <GraduationCap size={16} className="form-input-icon" />
                <select
                  id="exam-subject"
                  className="form-control-select"
                  disabled={mode === 'edit'}
                  required
                  value={form.subjectId}
                  onChange={(event) => updateField('subjectId', event.target.value)}
                  aria-invalid={Boolean(errors.subjectId)}
                  aria-describedby={errors.subjectId ? 'exam-subject-error' : undefined}
                >
                  <option value="">-- Chọn học phần giảng dạy --</option>
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.code} · {subject.name}
                    </option>
                  ))}
                </select>
              </div>
              {mode === 'edit' && (
                <span className="form-field-locked-note">
                  <Lock size={12} /> Học phần đã được khóa cố định sau khi tạo kỳ thi.
                </span>
              )}
              {errors.subjectId && (
                <span className="form-field-error" id="exam-subject-error" role="alert">
                  {errors.subjectId}
                </span>
              )}
            </div>

            {/* Field: Ngày và Giờ bắt đầu */}
            <div className="form-field-group">
              <span className="form-label-row">
                <span>
                  Thời điểm bắt đầu kỳ thi <span className="form-label-required">*</span>
                </span>
              </span>
              <div className="exam-datetime-grid">
                <div className="form-field-group">
                  <div className="form-input-wrap">
                    <Calendar size={16} className="form-input-icon" />
                    <Input
                      id="exam-start-date"
                      className="form-control-input"
                      type="date"
                      required
                      value={form.startDate}
                      onChange={(event) => updateField('startDate', event.target.value)}
                      aria-invalid={Boolean(errors.startDate)}
                      aria-describedby={errors.startDate ? 'exam-start-error' : undefined}
                    />
                  </div>
                </div>

                <div className="form-field-group">
                  <div className="form-input-wrap">
                    <Clock size={16} className="form-input-icon" />
                    <Input
                      id="exam-start-time"
                      className="form-control-input"
                      type="time"
                      required
                      value={form.startTime}
                      onChange={(event) => updateField('startTime', event.target.value)}
                      aria-invalid={Boolean(errors.startDate)}
                      aria-describedby={errors.startDate ? 'exam-start-error' : undefined}
                    />
                  </div>
                </div>
              </div>
              <p className="form-field-hint">
                Thời điểm hệ thống mở phòng thi viva và bắt đầu đón sinh viên vào ca thi đầu tiên.
              </p>
              {errors.startDate && (
                <span className="form-field-error" id="exam-start-error" role="alert">
                  {errors.startDate}
                </span>
              )}
            </div>
          </section>

          {/* Card 2: Quy chuẩn & Giới hạn phiên vấn đáp */}
          <section className="exam-editor-card" aria-labelledby="exam-rules-heading">
            <div className="exam-editor-card-header">
              <div className="exam-card-icon-badge exam-card-icon-badge--indigo">
                <SlidersHorizontal size={20} />
              </div>
              <div className="exam-editor-card-headings">
                <h2 id="exam-rules-heading">Quy chuẩn phiên thi vấn đáp</h2>
                <p>Thiết lập thời lượng, số lượng câu hỏi và quy chế phiên phỏng vấn cho mỗi thí sinh.</p>
              </div>
            </div>

            <div className="exam-params-grid">
              {/* Thời lượng mỗi SV */}
              <div className="param-input-card">
                <label htmlFor="exam-duration" className="form-label-row">
                  <span>
                    Thời lượng mỗi SV <span className="form-label-required">*</span>
                  </span>
                </label>
                <div className="form-input-wrap">
                  <Clock size={16} className="form-input-icon" />
                  <Input
                    id="exam-duration"
                    className="form-control-input"
                    type="number"
                    min={5}
                    max={120}
                    inputMode="numeric"
                    required
                    value={form.durationMinutes}
                    onChange={(event) => updateField('durationMinutes', event.target.value)}
                    aria-invalid={Boolean(errors.durationMinutes)}
                    aria-describedby={errors.durationMinutes ? 'exam-duration-error' : undefined}
                  />
                </div>
                <p className="form-field-hint">Tổng thời gian tối đa mỗi lượt (phút, từ 5 - 120)</p>
                {errors.durationMinutes && (
                  <span className="form-field-error" id="exam-duration-error" role="alert">
                    {errors.durationMinutes}
                  </span>
                )}
              </div>

              {/* Số câu hỏi chính */}
              <div className="param-input-card">
                <label htmlFor="exam-main-questions" className="form-label-row">
                  <span>
                    Số câu hỏi chính <span className="form-label-required">*</span>
                  </span>
                </label>
                <div className="form-input-wrap">
                  <HelpCircle size={16} className="form-input-icon" />
                  <Input
                    id="exam-main-questions"
                    className="form-control-input"
                    type="number"
                    min={1}
                    max={20}
                    inputMode="numeric"
                    required
                    value={form.mainQuestionCount}
                    onChange={(event) => updateField('mainQuestionCount', event.target.value)}
                    aria-invalid={Boolean(errors.mainQuestionCount)}
                    aria-describedby={errors.mainQuestionCount ? 'exam-main-error' : undefined}
                  />
                </div>
                <p className="form-field-hint">Số câu hỏi bốc thăm chính thức (từ 1 - 20 câu)</p>
                {errors.mainQuestionCount && (
                  <span className="form-field-error" id="exam-main-error" role="alert">
                    {errors.mainQuestionCount}
                  </span>
                )}
              </div>

              {/* Số câu hỏi đào sâu tối đa */}
              <div className="param-input-card">
                <label htmlFor="exam-followups" className="form-label-row">
                  <span>
                    Câu đào sâu tối đa <span className="form-label-required">*</span>
                  </span>
                </label>
                <div className="form-input-wrap">
                  <Sparkles size={16} className="form-input-icon" />
                  <Input
                    id="exam-followups"
                    className="form-control-input"
                    type="number"
                    min={0}
                    max={10}
                    inputMode="numeric"
                    required
                    value={form.maxFollowUpCount}
                    onChange={(event) => updateField('maxFollowUpCount', event.target.value)}
                    aria-invalid={Boolean(errors.maxFollowUpCount)}
                    aria-describedby={errors.maxFollowUpCount ? 'exam-followups-error' : undefined}
                  />
                </div>
                <p className="form-field-hint">Số câu hỏi phụ do AI phản xạ mở rộng (từ 0 - 10 câu)</p>
                {errors.maxFollowUpCount && (
                  <span className="form-field-error" id="exam-followups-error" role="alert">
                    {errors.maxFollowUpCount}
                  </span>
                )}
              </div>

              {/* Thời gian tối đa mỗi lượt */}
              <div className="param-input-card">
                <label htmlFor="exam-turn-time" className="form-label-row">
                  <span>Thời gian / câu hỏi</span>
                </label>
                <div className="form-input-wrap">
                  <Zap size={16} className="form-input-icon" />
                  <Input
                    id="exam-turn-time"
                    className="form-control-input"
                    type="number"
                    min={10}
                    max={300}
                    inputMode="numeric"
                    value={form.timeLimitPerTurnSeconds ?? '60'}
                    onChange={(event) => updateField('timeLimitPerTurnSeconds', event.target.value)}
                    aria-invalid={Boolean(errors.timeLimitPerTurnSeconds)}
                    aria-describedby={errors.timeLimitPerTurnSeconds ? 'exam-turn-error' : undefined}
                  />
                </div>
                <p className="form-field-hint">Đồng hồ đếm ngược mỗi lượt trả lời (giây, 10 - 300s)</p>
                {errors.timeLimitPerTurnSeconds && (
                  <span className="form-field-error" id="exam-turn-error" role="alert">
                    {errors.timeLimitPerTurnSeconds}
                  </span>
                )}
              </div>
            </div>

            {/* Anti-overlap feature card */}
            <div
              className={`anti-overlap-banner ${form.antiOverlapEnabled !== false ? 'is-enabled' : ''}`}
              onClick={() => updateField('antiOverlapEnabled', form.antiOverlapEnabled === false)}
            >
              <div className="anti-overlap-icon">
                <ShieldCheck size={20} />
              </div>
              <div className="anti-overlap-content">
                <div className="anti-overlap-title-row">
                  <span className="anti-overlap-title">
                    Cơ chế chống trùng lặp câu hỏi giữa các thí sinh liên tiếp
                  </span>
                  <input
                    type="checkbox"
                    className="anti-overlap-checkbox"
                    checked={form.antiOverlapEnabled !== false}
                    onChange={(e) => updateField('antiOverlapEnabled', e.target.checked)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                <p className="anti-overlap-desc">
                  Hệ thống AI sẽ tự động loại trừ các câu hỏi chính đã xuất hiện ở lượt thi của thí sinh
                  ngay trước đó, đảm bảo tính công bằng và bảo mật đề thi tối đa.
                </p>
              </div>
            </div>
          </section>

          {/* Card 3: Phân bổ tỷ lệ mức độ nhận thức Bloom */}
          <section className="exam-editor-card" aria-labelledby="exam-bloom-heading">
            <div className="exam-editor-card-header">
              <div className="exam-card-icon-badge exam-card-icon-badge--purple">
                <Brain size={20} />
              </div>
              <div className="exam-editor-card-headings">
                <h2 id="exam-bloom-heading">Tỷ lệ mức độ nhận thức Bloom</h2>
                <p>
                  Phân bổ trọng số câu hỏi theo thang nhận thức để AI lựa chọn và cân bằng độ khó phù hợp.
                </p>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="bloom-presets-wrap">
              <span className="bloom-presets-label">Gợi ý phân bổ nhanh:</span>
              <div className="bloom-presets-list">
                {BLOOM_PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    className="bloom-preset-pill"
                    onClick={() => applyBloomPreset(preset)}
                  >
                    <Sparkles size={13} />
                    <span>{preset.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 4 Inputs Grid */}
            <div className="bloom-grid">
              {/* Nhớ */}
              <div className="bloom-level-card bloom-level-card--remember">
                <div className="bloom-level-header">
                  <span className="bloom-level-name">Nhớ</span>
                  <span className="bloom-level-en">Remember</span>
                </div>
                <div className="bloom-level-input-wrap">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    className="bloom-level-input"
                    value={form.bloomRememberRatio ?? '30'}
                    onChange={(e) => updateField('bloomRememberRatio', e.target.value)}
                  />
                  <span className="bloom-level-unit">%</span>
                </div>
              </div>

              {/* Hiểu */}
              <div className="bloom-level-card bloom-level-card--understand">
                <div className="bloom-level-header">
                  <span className="bloom-level-name">Hiểu</span>
                  <span className="bloom-level-en">Understand</span>
                </div>
                <div className="bloom-level-input-wrap">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    className="bloom-level-input"
                    value={form.bloomUnderstandRatio ?? '40'}
                    onChange={(e) => updateField('bloomUnderstandRatio', e.target.value)}
                  />
                  <span className="bloom-level-unit">%</span>
                </div>
              </div>

              {/* Vận dụng */}
              <div className="bloom-level-card bloom-level-card--apply">
                <div className="bloom-level-header">
                  <span className="bloom-level-name">Vận dụng</span>
                  <span className="bloom-level-en">Apply</span>
                </div>
                <div className="bloom-level-input-wrap">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    className="bloom-level-input"
                    value={form.bloomApplyRatio ?? '20'}
                    onChange={(e) => updateField('bloomApplyRatio', e.target.value)}
                  />
                  <span className="bloom-level-unit">%</span>
                </div>
              </div>

              {/* Phân tích */}
              <div className="bloom-level-card bloom-level-card--analyze">
                <div className="bloom-level-header">
                  <span className="bloom-level-name">Phân tích</span>
                  <span className="bloom-level-en">Analyze</span>
                </div>
                <div className="bloom-level-input-wrap">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    className="bloom-level-input"
                    value={form.bloomAnalyzeRatio ?? '10'}
                    onChange={(e) => updateField('bloomAnalyzeRatio', e.target.value)}
                  />
                  <span className="bloom-level-unit">%</span>
                </div>
              </div>
            </div>

            {/* Stacked Progress Bar & Total Indicator */}
            <div className="bloom-distribution-summary">
              <div className="bloom-bar-header">
                <span className="bloom-bar-title">
                  <SlidersHorizontal size={14} /> Trực quan hóa tỷ trọng phân bổ
                </span>
                <span
                  className={`bloom-bar-total-badge ${
                    isBloomBalanced ? 'bloom-bar-total-badge--valid' : 'bloom-bar-total-badge--invalid'
                  }`}
                >
                  {isBloomBalanced ? (
                    <>
                      <CheckCircle2 size={13} /> Tổng: 100% (Chuẩn hóa)
                    </>
                  ) : (
                    <>
                      <AlertTriangle size={13} /> Tổng: {totalBloom}% (Khuyến nghị 100%)
                    </>
                  )}
                </span>
              </div>

              <div className="bloom-stacked-bar" aria-hidden="true">
                <div
                  className="bloom-bar-segment bloom-bar-segment--remember"
                  style={{ width: `${rememberRatio}%` }}
                  title={`Nhớ: ${rememberRatio}%`}
                />
                <div
                  className="bloom-bar-segment bloom-bar-segment--understand"
                  style={{ width: `${understandRatio}%` }}
                  title={`Hiểu: ${understandRatio}%`}
                />
                <div
                  className="bloom-bar-segment bloom-bar-segment--apply"
                  style={{ width: `${applyRatio}%` }}
                  title={`Vận dụng: ${applyRatio}%`}
                />
                <div
                  className="bloom-bar-segment bloom-bar-segment--analyze"
                  style={{ width: `${analyzeRatio}%` }}
                  title={`Phân tích: ${analyzeRatio}%`}
                />
              </div>

              <div className="bloom-bar-legend">
                <span className="bloom-legend-item">
                  <span className="bloom-legend-dot" style={{ background: '#3b82f6' }} />
                  Nhớ ({rememberRatio}%)
                </span>
                <span className="bloom-legend-item">
                  <span className="bloom-legend-dot" style={{ background: '#6366f1' }} />
                  Hiểu ({understandRatio}%)
                </span>
                <span className="bloom-legend-item">
                  <span className="bloom-legend-dot" style={{ background: '#f59e0b' }} />
                  Vận dụng ({applyRatio}%)
                </span>
                <span className="bloom-legend-item">
                  <span className="bloom-legend-dot" style={{ background: '#10b981' }} />
                  Phân tích ({analyzeRatio}%)
                </span>
              </div>
            </div>
          </section>

          {/* Save Error Alert */}
          {saveError && (
            <Alert tone="danger">
              Không thể {mode === 'create' ? 'tạo' : 'cập nhật'} kỳ thi. Vui lòng kiểm tra lại thông tin
              và kết nối mạng.
            </Alert>
          )}
        </div>

        {/* Right Column: Sticky Live Preview & Action Card */}
        <aside className="exam-editor-sidebar">
          <div className="exam-summary-card">
            <div className="exam-summary-header">
              <div className="exam-summary-title">
                <Sparkles size={18} className="text-blue-600" />
                <span>Xem trước cấu hình</span>
              </div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {mode === 'create' ? 'Tạo mới' : 'Chỉnh sửa'}
              </span>
            </div>

            {/* Live Preview Box */}
            <div className="exam-summary-preview-box">
              <div
                className={`exam-summary-preview-title ${!form.title.trim() ? 'is-empty' : ''}`}
              >
                {form.title.trim() || 'Chưa nhập tên kỳ thi...'}
              </div>
              <div className="exam-summary-preview-subject">
                <GraduationCap size={13} />
                <span>
                  {selectedSubject
                    ? `${selectedSubject.code} · ${selectedSubject.name}`
                    : 'Chưa chọn học phần'}
                </span>
              </div>
              <div className="exam-summary-preview-date">
                <Calendar size={13} />
                <span>{formattedDate}</span>
              </div>
            </div>

            {/* Quick Metrics Tiles */}
            <div className="exam-summary-metrics">
              <div className="exam-metric-tile">
                <span className="exam-metric-tile-label">Thời lượng</span>
                <span className="exam-metric-tile-value">
                  {form.durationMinutes || '15'} phút/SV
                </span>
              </div>
              <div className="exam-metric-tile">
                <span className="exam-metric-tile-label">Câu hỏi</span>
                <span className="exam-metric-tile-value">
                  {form.mainQuestionCount || '3'} chính + {form.maxFollowUpCount || '2'} sâu
                </span>
              </div>
              <div className="exam-metric-tile">
                <span className="exam-metric-tile-label">Thời gian/câu</span>
                <span className="exam-metric-tile-value">
                  {form.timeLimitPerTurnSeconds || '60'} giây
                </span>
              </div>
              <div className="exam-metric-tile">
                <span className="exam-metric-tile-label">Chống trùng lặp</span>
                <span className="exam-metric-tile-value" style={{ color: form.antiOverlapEnabled !== false ? '#16a34a' : '#64748b' }}>
                  {form.antiOverlapEnabled !== false ? 'Đang bật' : 'Đã tắt'}
                </span>
              </div>
            </div>

            {/* Workflow Guide */}
            <div className="exam-summary-checklist">
              <span className="exam-checklist-heading">Quy trình chuẩn bị kỳ thi</span>
              <div className="exam-checklist-item is-current">
                <span className="exam-checklist-dot" />
                <span>1. Thiết lập cấu hình cơ bản (Hiện tại)</span>
              </div>
              <div className="exam-checklist-item">
                <span className="exam-checklist-dot" />
                <span>2. Nhập danh sách sinh viên dự thi</span>
              </div>
              <div className="exam-checklist-item">
                <span className="exam-checklist-dot" />
                <span>3. Lập lịch ca thi &amp; chia phòng</span>
              </div>
              <div className="exam-checklist-item">
                <span className="exam-checklist-dot" />
                <span>4. Cấu hình ngân hàng câu hỏi &amp; Rubric</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="exam-summary-actions">
              <button
                type="submit"
                disabled={saving}
                className="exam-submit-btn"
              >
                {saving ? (
                  <span>Đang lưu cấu hình...</span>
                ) : (
                  <>
                    <Save size={16} />
                    <span>{mode === 'create' ? 'Tạo kỳ thi nháp' : 'Lưu cấu hình'}</span>
                  </>
                )}
              </button>
              <button
                type="button"
                className="exam-cancel-btn"
                onClick={cancel}
                disabled={saving}
              >
                Hủy bỏ
              </button>
              <p className="exam-summary-help-note">
                Sau khi lưu cấu hình, bạn có thể chuyển sang thêm sinh viên và lập lịch ca thi.
              </p>
            </div>
          </div>
        </aside>
      </form>

      {/* Unsaved Changes Guard Dialog */}
      <Dialog
        open={blocker.state === 'blocked'}
        onClose={() => blocker.reset?.()}
        title="Rời trang cấu hình kỳ thi?"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p style={{ margin: 0, fontSize: 14, color: '#475569' }}>
            Các thay đổi trong cấu hình kỳ thi chưa được lưu sẽ bị mất nếu bạn rời đi ngay bây giờ.
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, flexWrap: 'wrap' }}>
            <Button variant="outline" onClick={() => blocker.reset?.()}>
              Ở lại chỉnh sửa
            </Button>
            <Button variant="danger" onClick={() => blocker.proceed?.()}>
              Bỏ thay đổi và rời trang
            </Button>
          </div>
        </div>
      </Dialog>
    </section>
  )
}
