import { Link } from 'react-router-dom'
import {
  Award,
  BookOpen,
  CheckCircle2,
  FileEdit,
  FileText,
  GraduationCap,
  Plus,
  Search,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react'
import { Button } from '../../../components/ui/primitives'
import type { Rubric } from '../rubric-types'
import type { ReactNode } from 'react'

export function RubricListView({
  rows,
  search,
  onSearch,
  subjectId,
  subjects,
  selectedSubjectId,
  onSubjectChange,
  onDelete,
  pending,
  feedback,
}: {
  rows: Rubric[]
  search: string
  onSearch: (value: string) => void
  subjectId?: string
  subjects?: Array<{ id: string; code?: string; name: string }>
  selectedSubjectId?: string
  onSubjectChange?: (value: string) => void
  onDelete: (rubric: Rubric) => void
  pending: boolean
  feedback?: ReactNode
}) {
  const totalCriteria = rows.reduce((total, r) => total + r.criteria.length, 0)
  const totalScoreSum = rows.reduce(
    (total, r) =>
      total + r.criteria.reduce((sum, item) => sum + Number(item.maximumScore || 0), 0),
    0,
  )
  const avgScore = rows.length ? Math.round(totalScoreSum / rows.length) : 0

  return (
    <section className="rubric-list-view max-w-7xl mx-auto space-y-6 pb-16">
      {/* Modern Hero Header Banner */}
      <header className="rubric-hero-card">
        <div className="rubric-hero-content">
          <div className="rubric-hero-tagline">
            <span className="rubric-badge-pill">
              <Award size={13} />
              <span>NGÂN HÀNG KHẢO THÍ · RUBRIC</span>
            </span>
          </div>
          <h1 className="rubric-hero-title">
            {subjectId ? 'Bộ tiêu chí chấm điểm' : 'Quản lý Rubric'}
          </h1>
          <p className="rubric-hero-desc">
            Thiết lập ma trận tiêu chí đánh giá năng lực và thang điểm chuẩn hóa theo từng môn học cho các câu hỏi vấn đáp.
          </p>
        </div>
        <div className="rubric-hero-actions">
          <Link className="button primary gap-2" to="new">
            <Plus size={16} />
            <span>{subjectId ? 'Tạo rubric' : 'Tạo Rubric'}</span>
          </Link>
        </div>
      </header>

      {/* 4 Modern Metric Summary Cards */}
      <div className="rubric-metrics-grid">
        <div className="rubric-metric-card metric-blue">
          <div className="rubric-metric-head">
            <span className="rubric-metric-label">Tổng bộ Rubric</span>
            <span className="rubric-metric-icon">
              <Award size={18} />
            </span>
          </div>
          <strong className="rubric-metric-value">{rows.length}</strong>
          <span className="rubric-metric-hint">Bộ tiêu chí hiện có</span>
        </div>

        <div className="rubric-metric-card metric-indigo">
          <div className="rubric-metric-head">
            <span className="rubric-metric-label">Tổng tiêu chí</span>
            <span className="rubric-metric-icon">
              <CheckCircle2 size={18} />
            </span>
          </div>
          <strong className="rubric-metric-value">{totalCriteria}</strong>
          <span className="rubric-metric-hint">Chỉ số đánh giá chi tiết</span>
        </div>

        <div className="rubric-metric-card metric-amber">
          <div className="rubric-metric-head">
            <span className="rubric-metric-label">Thang điểm TB</span>
            <span className="rubric-metric-icon">
              <FileText size={18} />
            </span>
          </div>
          <strong className="rubric-metric-value">{avgScore} điểm</strong>
          <span className="rubric-metric-hint">Trung bình thang điểm</span>
        </div>

        <div className="rubric-metric-card metric-emerald">
          <div className="rubric-metric-head">
            <span className="rubric-metric-label">Tiêu chuẩn khảo thí</span>
            <span className="rubric-metric-icon">
              <Sparkles size={18} />
            </span>
          </div>
          <strong className="rubric-metric-value">ABET &amp; RAG</strong>
          <span className="rubric-metric-hint">Chuẩn hóa ma trận năng lực</span>
        </div>
      </div>

      {feedback}

      {/* Search & Subject Filter Toolbar */}
      <div className="rubric-toolbar">
        <div className="rubric-toolbar-filters">
          <div className="rubric-search-wrap">
            <Search size={16} className="rubric-search-icon" />
            <label className="sr-only" htmlFor="rubric-search">
              Tìm theo tên
            </label>
            <input
              id="rubric-search"
              value={search}
              onChange={(event) => onSearch(event.target.value)}
              placeholder="Tìm theo tên Rubric hoặc từ khóa..."
              className="rubric-search-input"
            />
            {search && (
              <button
                type="button"
                className="rubric-search-clear"
                onClick={() => onSearch('')}
                aria-label="Xóa tìm kiếm"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Course / Subject Filter */}
          {subjects && subjects.length > 0 && onSubjectChange && (
            <div className="rubric-subject-select-wrap">
              <label className="sr-only" htmlFor="rubric-subject-filter">
                Lọc theo môn học
              </label>
              <div className="rubric-select-container">
                <BookOpen size={15} className="rubric-select-icon" />
                <select
                  id="rubric-subject-filter"
                  aria-label="Lọc theo môn học"
                  value={selectedSubjectId ?? 'all'}
                  onChange={(event) => onSubjectChange(event.target.value)}
                  className="rubric-subject-select"
                >
                  <option value="all">Tất cả môn học ({rows.length})</option>
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.code ? `${subject.code} · ` : ''}{subject.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        <div className="rubric-toolbar-meta">
          <span className="rubric-count-badge">
            {rows.length} Rubric {search || (selectedSubjectId && selectedSubjectId !== 'all') ? 'phù hợp' : ''}
          </span>
        </div>
      </div>

      {/* Rubric Cards Grid */}
      <div className="rubric-grid-modern">
        {rows.map((rubric) => {
          const totalScore = rubric.criteria.reduce(
            (total, item) => total + Number(item.maximumScore || 0),
            0,
          )
          const matchedSubject = subjects?.find((s) => s.id === rubric.subjectId)

          return (
            <article key={rubric.id} className="rubric-item-card">
              <header className="rubric-item-head">
                <span className="rubric-icon-box">
                  <Award size={18} />
                </span>
                <div className="rubric-card-tags">
                  {matchedSubject && (
                    <span className="rubric-subject-pill" title={`Môn học: ${matchedSubject.name}`}>
                      <BookOpen size={11} />
                      <span>{matchedSubject.code || matchedSubject.name}</span>
                    </span>
                  )}
                  <span className="font-mono text-[11px] text-slate-500 rubric-meta-pill">
                    {rubric.criteria.length} TIÊU CHÍ · {totalScore} ĐIỂM
                  </span>
                </div>
              </header>

              <div className="rubric-item-body">
                <h2 className="rubric-item-title">{rubric.name}</h2>
                <p className="rubric-item-desc">
                  {rubric.description || 'Chưa có mô tả chi tiết cho bộ tiêu chí này.'}
                </p>

                {/* Criteria Mini Tags Preview */}
                <div className="rubric-chips-preview">
                  {rubric.criteria.slice(0, 3).map((item) => (
                    <span key={item.id} className="rubric-chip">
                      <span className="rubric-chip-name">{item.name}</span>
                      <span className="rubric-chip-score">{item.maximumScore}đ</span>
                    </span>
                  ))}
                  {rubric.criteria.length > 3 && (
                    <span className="rubric-chip more">
                      +{rubric.criteria.length - 3}
                    </span>
                  )}
                </div>
              </div>

              <footer className="rubric-item-footer">
                <Link
                  className="button outline flex-1 rubric-edit-btn"
                  to={subjectId ? rubric.id : `${rubric.id}/edit`}
                >
                  <FileEdit size={14} />
                  <span>{subjectId ? 'Chỉnh sửa rubric' : 'Chỉnh sửa'}</span>
                </Link>
                <Button
                  variant="outline"
                  className="rubric-delete-btn"
                  disabled={pending}
                  onClick={() => onDelete(rubric)}
                >
                  <Trash2 size={14} className="text-rose-600" />
                  <span>{subjectId ? 'Xóa Rubric' : 'Xóa'}</span>
                </Button>
              </footer>
            </article>
          )
        })}
      </div>

      {/* Empty State */}
      {!rows.length && (
        <div className="rubric-empty-card">
          <div className="rubric-empty-icon">
            <GraduationCap size={32} />
          </div>
          <h3>{search || (selectedSubjectId && selectedSubjectId !== 'all') ? 'Không tìm thấy Rubric phù hợp' : 'Chưa có bộ tiêu chí Rubric nào'}</h3>
          <p>
            {search || (selectedSubjectId && selectedSubjectId !== 'all')
              ? 'Thử thay đổi môn học, từ khóa tìm kiếm hoặc đặt lại bộ lọc để xem danh sách.'
              : 'Tạo bộ tiêu chí đầu tiên để bắt đầu chuẩn hóa việc chấm thi vấn đáp.'}
          </p>
          {!search && selectedSubjectId === 'all' && (
            <Link className="button primary gap-2" to="new">
              <Plus size={16} />
              <span>{subjectId ? 'Tạo rubric đầu tiên' : 'Tạo Rubric đầu tiên'}</span>
            </Link>
          )}
        </div>
      )}
    </section>
  )
}
