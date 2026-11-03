import { useContext, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  QueryClient,
  QueryClientContext,
  QueryClientProvider,
  useQuery,
} from '@tanstack/react-query'
import {
  AlertCircle,
  ArrowRight,
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  GraduationCap,
  Headphones,
  MessageSquare,
  Search,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { useSession } from '../../app/providers/use-session'
import { Button } from '../../components/ui/primitives'
import { DemoLabel } from '../../components/common/inline-notice'
import { runtimeConfig } from '../../services/api/runtime-config'
import { apiStudentExamRepository } from './api-student-exam-repository'
import { apiEvaluationService } from '../grading/api-evaluation-service'
import { studentExamPath } from './student-exam-navigation'
import { studentResultsDemo } from './mocks/student-results-demo'
import '../students/student.css'
import './student-results.css'

const fallbackQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      enabled: false,
    },
  },
})

export function StudentResultListPage() {
  const queryClient = useContext(QueryClientContext)
  if (!queryClient) {
    return (
      <QueryClientProvider client={fallbackQueryClient}>
        <StudentResultListPageContent />
      </QueryClientProvider>
    )
  }
  return <StudentResultListPageContent />
}

type FilterTab = 'all' | 'graded' | 'pending'

function getGradeClassification(score: number): {
  label: string
  boxClass: string
  badgeClass: string
} {
  if (score >= 9.0) {
    return {
      label: 'Xuất sắc',
      boxClass: 'student-score-box--excellent',
      badgeClass: 'student-grade-badge--excellent',
    }
  }
  if (score >= 8.0) {
    return {
      label: 'Giỏi',
      boxClass: 'student-score-box--good',
      badgeClass: 'student-grade-badge--good',
    }
  }
  if (score >= 6.5) {
    return {
      label: 'Khá',
      boxClass: 'student-score-box--average',
      badgeClass: 'student-grade-badge--average',
    }
  }
  if (score >= 5.0) {
    return {
      label: 'Đạt',
      boxClass: 'student-score-box--average',
      badgeClass: 'student-grade-badge--average',
    }
  }
  return {
    label: 'Chưa đạt',
    boxClass: 'student-score-box--poor',
    badgeClass: 'student-grade-badge--poor',
  }
}

function StudentResultListPageContent() {
  const demo = runtimeConfig.dataSource === 'mock'
  const { session } = useSession()
  const [page, setPage] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<FilterTab>('all')

  const published = useQuery({
    queryKey: ['student-results-list', session.user?.id, page],
    enabled: !demo && Boolean(session.user),
    queryFn: async ({ signal }) => {
      const exams = await apiStudentExamRepository.list({ status: 'COMPLETED', page }, signal)
      const rows = await Promise.all(
        exams.content.map(async (exam) => ({
          exam,
          scores: await apiEvaluationService.studentResults(exam.attemptId, signal),
        }))
      )
      return { rows, totalPages: exams.totalPages }
    },
  })

  // Normalize results for both Demo and API data sources
  const demoRows = useMemo(() => {
    if (!demo) return []
    return studentResultsDemo.map((item) => ({
      id: item.id,
      attemptId: item.id,
      title: item.title,
      courseCode: item.subject.split('·')[0]?.trim() || 'VIVA',
      courseName: item.subject.split('·')[1]?.trim() || item.subject,
      date: item.date,
      overallScore: item.score,
      feedback: item.feedback,
      scores: [
        { questionOrder: 1, finalScore: Number((item.score * 0.95).toFixed(1)), feedback: 'Kiến thức cốt lõi' },
        { questionOrder: 2, finalScore: Number((item.score * 1.05 > 10 ? 10 : item.score * 1.05).toFixed(1)), feedback: 'Phản biện & liên hệ thực tế' },
      ],
      detailPath: `/student/exams/${item.id}/result`,
      isGraded: true,
    }))
  }, [demo])

  const apiRows = useMemo(() => {
    if (demo || !published.data?.rows) return []
    return published.data.rows.map(({ exam, scores }) => {
      const isGraded = scores.length > 0
      const overallScore = isGraded
        ? Number((scores.reduce((sum, s) => sum + s.finalScore, 0) / scores.length).toFixed(1))
        : null
      return {
        id: exam.examId,
        attemptId: exam.attemptId,
        title: exam.examTitle,
        courseCode: exam.courseCode || 'VIVA',
        courseName: exam.courseName || '',
        date: exam.scheduledStartTime || '',
        overallScore,
        feedback: scores[0]?.feedback || undefined,
        scores,
        detailPath: studentExamPath(exam.examId, exam.attemptId),
        isGraded,
      }
    })
  }, [demo, published.data])

  const activeRows = demo ? demoRows : apiRows

  // Filtered rows based on search and tab
  const filteredRows = useMemo(() => {
    return activeRows.filter((row) => {
      const q = searchQuery.trim().toLowerCase()
      const matchesSearch =
        !q ||
        row.title.toLowerCase().includes(q) ||
        row.courseCode.toLowerCase().includes(q) ||
        row.courseName.toLowerCase().includes(q)

      if (!matchesSearch) return false
      if (activeTab === 'graded') return row.isGraded
      if (activeTab === 'pending') return !row.isGraded
      return true
    })
  }, [activeRows, searchQuery, activeTab])

  // Summary Metrics
  const totalCount = activeRows.length
  const gradedRows = activeRows.filter((r) => r.isGraded && r.overallScore !== null)
  const averageScore = gradedRows.length
    ? (gradedRows.reduce((sum, r) => sum + (r.overallScore ?? 0), 0) / gradedRows.length).toFixed(1)
    : '—'
  const maxScore = gradedRows.length
    ? Math.max(...gradedRows.map((r) => r.overallScore ?? 0)).toFixed(1)
    : '—'

  return (
    <section className="student-page student-results-page">
      {/* Modern Hero Greeting / Header Banner */}
      <header className="student-hero">
        <div className="student-hero-content">
          <div className="student-hero-badge">
            <GraduationCap size={14} />
            <span>AIVES · KHẢO THÍ SINH VIÊN · KẾT QUẢ &amp; BIÊN BẢN</span>
          </div>
          <h1 className="student-hero-title">Kết quả &amp; biên bản thi</h1>
          <p className="student-hero-desc">
            Tra cứu điểm số chính thức, nhận xét chi tiết của giảng viên, bảng điểm từng câu hỏi và lịch sử
            các đợt thi vấn đáp.
          </p>
        </div>

        <div className="student-actions">
          <Link className="button outline" to="/student/exams">
            <Calendar size={16} />
            <span>Kỳ thi của tôi</span>
          </Link>
          <Link className="button outline" to="/device-check">
            <Headphones size={16} />
            <span>Kiểm tra thiết bị</span>
          </Link>
        </div>
      </header>

      {demo && <DemoLabel detail="Điểm và nhận xét minh họa, không phải kết quả thi thực tế của bạn." />}

      {/* 4 Modern Interactive KPI Metric Cards */}
      <section className="student-metric-grid" aria-label="Tổng quan kết quả thi">
        {/* Metric 1: Total Exams */}
        <div className="metric-card metric-card--blue">
          <div className="metric-header">
            <span className="metric-label">{demo ? 'Bài thi mẫu' : 'Bài thi hoàn tất'}</span>
            <div className="metric-icon-wrap metric-icon-wrap--blue">
              <FileText size={20} />
            </div>
          </div>
          <strong className="metric-value">{totalCount}</strong>
          <span className="metric-hint">Tổng số đợt thi đã tham gia</span>
        </div>

        {/* Metric 2: Average Score (GPA) */}
        <div className="metric-card metric-card--emerald">
          <div className="metric-header">
            <span className="metric-label">Điểm trung bình (GPA)</span>
            <div className="metric-icon-wrap metric-icon-wrap--emerald">
              <Award size={20} />
            </div>
          </div>
          <strong className="metric-value">
            {averageScore}
            <span className="text-base font-normal text-slate-400"> / 10</span>
          </strong>
          <span className="metric-hint">
            {gradedRows.length > 0 ? 'Thang điểm 10 chuẩn hóa' : 'Chưa có điểm công bố'}
          </span>
        </div>

        {/* Metric 3: Highest Score */}
        <div className="metric-card metric-card--indigo">
          <div className="metric-header">
            <span className="metric-label">Điểm cao nhất</span>
            <div className="metric-icon-wrap metric-icon-wrap--indigo">
              <Sparkles size={20} />
            </div>
          </div>
          <strong className="metric-value">
            {maxScore}
            {maxScore !== '—' && <span className="text-base font-normal text-slate-400"> / 10</span>}
          </strong>
          <span className="metric-hint">Thành tích viva tốt nhất</span>
        </div>

        {/* Metric 4: Grade Appeal Policy */}
        <div className="metric-card metric-card--amber">
          <div className="metric-header">
            <span className="metric-label">Quy chế phúc khảo</span>
            <div className="metric-icon-wrap metric-icon-wrap--amber">
              <ShieldCheck size={20} />
            </div>
          </div>
          <strong className="metric-value" style={{ fontSize: '1.4rem' }}>
            48 - 72h
          </strong>
          <span className="metric-hint">Thời hạn sau khi công bố</span>
        </div>
      </section>

      {/* Search & Filter Toolbar */}
      <div className="student-results-toolbar">
        <div className="student-results-search-wrap">
          <Search size={16} className="student-results-search-icon" />
          <input
            type="search"
            className="student-results-search-input"
            placeholder="Tìm theo tên môn, mã học phần (vd: INT2201)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="student-results-filters">
          <button
            type="button"
            className={`student-filter-chip ${activeTab === 'all' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            <span>Tất cả</span>
            <span className="student-results-count-badge">{activeRows.length}</span>
          </button>
          <button
            type="button"
            className={`student-filter-chip ${activeTab === 'graded' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('graded')}
          >
            <CheckCircle2 size={13} />
            <span>Đã có điểm</span>
            <span className="student-results-count-badge">
              {activeRows.filter((r) => r.isGraded).length}
            </span>
          </button>
          <button
            type="button"
            className={`student-filter-chip ${activeTab === 'pending' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            <Clock size={13} />
            <span>Chờ công bố</span>
            <span className="student-results-count-badge">
              {activeRows.filter((r) => !r.isGraded).length}
            </span>
          </button>
        </div>
      </div>

      {/* Main Results Surface */}
      <section className="student-results-cards-list" aria-labelledby="student-results-heading">
        <h2 id="student-results-heading" className="sr-only">
          Danh sách kết quả thi vấn đáp
        </h2>

        {/* Loading State in API mode */}
        {!demo && published.isPending && (
          <div className="student-result-skeleton-card" aria-busy="true">
            <div className="skeleton-shimmer" style={{ width: '40%', height: 24 }} />
            <div className="skeleton-shimmer" style={{ width: '60%', height: 16 }} />
            <div className="skeleton-shimmer" style={{ width: '100%', height: 60 }} />
          </div>
        )}

        {/* Error State in API mode */}
        {!demo && published.isError && (
          <div className="student-results-empty-card" role="alert">
            <div className="student-empty-icon-wrap" style={{ background: '#fef2f2', color: '#ef4444', borderColor: '#fecaca' }}>
              <AlertCircle size={28} />
            </div>
            <h3>Không thể tải kết quả đã công bố</h3>
            <p>Hệ thống gặp sự cố khi đồng bộ dữ liệu khảo thí. Vui lòng kiểm tra lại kết nối mạng.</p>
            <Button variant="outline" onClick={() => published.refetch()}>
              Thử lại ngay
            </Button>
          </div>
        )}

        {/* Empty State */}
        {((!demo && published.isSuccess && !filteredRows.length) || (demo && !filteredRows.length)) && (
          <div className="student-results-empty-card">
            <div className="student-empty-icon-wrap">
              <GraduationCap size={30} />
            </div>
            <h3>Chưa có kết quả để hiển thị</h3>
            <p>
              {searchQuery.trim()
                ? 'Không tìm thấy kỳ thi phù hợp với từ khóa tìm kiếm của bạn.'
                : 'Khi bạn hoàn tất ca thi vấn đáp và giảng viên phê duyệt điểm, biên bản chính thức sẽ hiển thị tại đây.'}
            </p>
            <Link className="button outline" to="/student/exams">
              <Calendar size={15} />
              <span>Xem lịch thi sắp tới</span>
            </Link>
          </div>
        )}

        {/* Results Cards List */}
        {filteredRows.map((row) => {
          const classification = row.overallScore !== null ? getGradeClassification(row.overallScore) : null
          const formattedDate = row.date
            ? new Date(row.date).toLocaleDateString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              })
            : 'Đã hoàn thành'

          return (
            <article key={row.attemptId} className="student-result-card">
              {/* Top Row: Info + Score Showcase */}
              <div className="student-result-card-top">
                <div className="student-result-info">
                  <div className="student-course-badge-row">
                    <span className="student-course-code-pill">{row.courseCode}</span>
                    {row.courseName && <span className="student-course-name">{row.courseName}</span>}
                  </div>

                  <h3 className="student-result-title">{row.title}</h3>

                  <div className="student-result-meta-row">
                    <span className="student-result-meta-item">
                      <Calendar size={14} className="text-slate-400" />
                      <span>Ngày thi: {formattedDate}</span>
                    </span>
                    <span className="student-result-meta-item">
                      <Clock size={14} className="text-slate-400" />
                      <span>Hình thức: Vấn đáp trực tuyến AI</span>
                    </span>
                  </div>
                </div>

                {/* Score Showcase */}
                <div className="student-score-showcase">
                  {row.isGraded && row.overallScore !== null ? (
                    <>
                      <div className={`student-score-box ${classification?.boxClass}`}>
                        <span className="student-score-number">{row.overallScore.toFixed(1)}</span>
                        <span className="student-score-scale">/ 10</span>
                      </div>
                      <span className={`student-grade-badge ${classification?.badgeClass}`}>
                        {classification?.label}
                      </span>
                    </>
                  ) : (
                    <>
                      <div className="student-score-box student-score-box--pending">
                        <Clock size={16} />
                        <span className="text-sm font-semibold">Chờ chấm điểm</span>
                      </div>
                      <span className="student-grade-badge student-grade-badge--pending">
                        Đang xử lý
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Body: Feedback & Question Breakdown */}
              <div className="student-result-card-body">
                {row.feedback && (
                  <div className="student-feedback-box">
                    <MessageSquare size={16} className="student-feedback-icon" />
                    <div className="student-feedback-content">
                      <span className="student-feedback-label">Nhận xét của giảng viên</span>
                      <span>{row.feedback}</span>
                    </div>
                  </div>
                )}

                {row.scores.length > 0 ? (
                  <div className="student-questions-grid">
                    {row.scores.map((score) => (
                      <div key={score.questionOrder} className="student-question-pill-card">
                        <div className="student-question-pill-header">
                          <span className="student-question-order">Câu hỏi {score.questionOrder}</span>
                          <span className="student-question-score">{score.finalScore} điểm</span>
                        </div>
                        {score.feedback && (
                          <p className="student-question-comment">{score.feedback}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic" style={{ margin: 0 }}>
                    Giảng viên đang tổng hợp và phê duyệt điểm chi tiết từng câu hỏi.
                  </p>
                )}
              </div>

              {/* Footer: Audit & Action Link */}
              <div className="student-result-card-footer">
                <span
                  className={`student-audit-stamp ${
                    row.isGraded ? '' : 'student-audit-stamp--pending'
                  }`}
                >
                  {row.isGraded ? (
                    <>
                      <CheckCircle2 size={15} />
                      <span>Điểm chính thức đã phê duyệt &amp; bảo lưu biên bản</span>
                    </>
                  ) : (
                    <>
                      <Clock size={15} />
                      <span>Ca thi đã ghi nhận, đang chờ hoàn tất biên bản</span>
                    </>
                  )}
                </span>

                <div className="student-result-actions">
                  <Link className="student-view-receipt-btn" to={row.detailPath}>
                    <span>Xem biên bản chi tiết</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </article>
          )
        })}

        {/* Pagination in API mode */}
        {!demo && (published.data?.totalPages ?? 0) > 1 && (
          <nav
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, paddingTop: 16 }}
            aria-label="Phân trang kết quả"
          >
            <Button variant="outline" disabled={page === 0} onClick={() => setPage(page - 1)}>
              Trước
            </Button>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}>
              Trang {page + 1} / {published.data?.totalPages}
            </span>
            <Button
              variant="outline"
              disabled={page + 1 >= (published.data?.totalPages ?? 0)}
              onClick={() => setPage(page + 1)}
            >
              Sau
            </Button>
          </nav>
        )}
      </section>

      {/* Academic Policy & Guidance Card */}
      <section className="student-policy-card" aria-label="Quy chế khảo thí">
        <div className="student-policy-icon-wrap">
          <ShieldCheck size={22} />
        </div>
        <div className="student-policy-content">
          <h3 className="student-policy-title">Quy chế khảo thí vấn đáp &amp; Phúc khảo điểm số</h3>
          <ul className="student-policy-list">
            <li>
              <strong>Đánh giá khách quan:</strong> Điểm số cuối cùng do giảng viên trực tiếp chấm và
              xác nhận dựa trên rubric đánh giá tiêu chuẩn và câu trả lời thực tế của sinh viên.
            </li>
            <li>
              <strong>Bảo lưu minh bạch:</strong> Toàn bộ dữ liệu âm thanh, transcript hội thoại viva và
              tiêu chí chấm điểm được lưu trữ an toàn để đối soát.
            </li>
            <li>
              <strong>Thời hạn phúc khảo:</strong> Sinh viên có quyền gửi yêu cầu phúc khảo trong vòng{' '}
              <strong>48 - 72 giờ</strong> kể từ thời điểm công bố điểm số chính thức.
            </li>
          </ul>
        </div>
      </section>
    </section>
  )
}
