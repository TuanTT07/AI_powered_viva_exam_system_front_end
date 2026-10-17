import { Link, useSearchParams } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import {
  Calendar,
  Clock,
  CheckCircle2,
  Plus,
  Search,
  Users,
  Settings,
  Trash2,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  FolderKanban,
  RotateCcw,
} from 'lucide-react'
import { Alert, Button, Dialog, Input, Skeleton } from '../../components/ui/primitives'
import { EmptyState, PermissionDenied, StatusBadge } from '../../components/common/states'
import { useSession } from '../../app/providers/use-session'
import { useDeleteExam, useExamSubjects, useExamSummary, useExams } from './exam-hooks'
import { examStatuses, examStatusMeta, type ExamListRequest } from './exam-types'
import { examRoutes } from './exam-routes'
import { parseExamSearchParams } from './exam-url'
import './exam-list.css'

const PAGE_SIZE = 5

function formatSchedule(value: string) {
  return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}

function updateParam(params: URLSearchParams, key: string, value: string) {
  const next = new URLSearchParams(params)
  if (value) next.set(key, value)
  else next.delete(key)
  if (key !== 'page') next.set('page', '1')
  return next
}

export function ExamListPage() {
  const { session } = useSession()
  const [params, setParams] = useSearchParams()
  const parsed = parseExamSearchParams(params)
  const request: ExamListRequest = { ...parsed, pageSize: PAGE_SIZE }
  const query = useExams(request)
  const subjects = useExamSubjects()
  const summary = useExamSummary()
  const [target, setTarget] = useState<import('./exam-types').ExamSession | null>(null)
  const remove = useDeleteExam()

  if (session.user && !session.user.roles.includes('lecturer')) return <PermissionDenied />
  const data = query.data
  const setFilter = (key: string, value: string) => setParams((current) => updateParam(current, key, value))
  const clearFilters = () => setParams({})
  const hasFilters = Boolean(parsed.q || parsed.subject || parsed.status)
  const totalCount = summary.data
    ? Object.values(summary.data).reduce((acc, count) => acc + count, 0)
    : (data?.total ?? 0)

  return (
    <section className="exam-list-page">
      {/* Modern Hero Header Banner */}
      <header className="exam-list-hero">
        <div className="exam-list-hero-content">
          <div className="exam-list-hero-badge">
            <GraduationCap size={14} />
            <span>LƯU TRỮ KHẢO THÍ · KHOA CNTT</span>
          </div>
          <h1 className="exam-list-hero-title">Kỳ thi vấn đáp</h1>
          <p className="exam-list-hero-desc">
            Quản lý các đợt thi vấn đáp, phân công ca thi và theo dõi tiến độ thi của sinh viên.
          </p>
        </div>
        <div className="exam-list-actions">
          <Link className="button primary" to="new">
            <Plus size={16} />
            <span>Tạo kỳ thi mới</span>
          </Link>
        </div>
      </header>

      {/* 4 Modern Interactive KPI Quick-Filter Cards */}
      <div className="exam-summary-grid" aria-label="Tóm tắt kỳ thi">
        <button
          type="button"
          className={`summary-stat-card summary-stat-card--all ${!parsed.status ? 'is-active' : ''}`}
          onClick={() => setFilter('status', '')}
          title="Xem tất cả kỳ thi"
        >
          <div className="summary-stat-top">
            <span className="summary-stat-label">Tổng số kỳ thi</span>
            <div className="summary-stat-icon summary-stat-icon--indigo">
              <FolderKanban size={18} />
            </div>
          </div>
          <strong className="summary-stat-value">{totalCount}</strong>
          <span className="summary-stat-hint">Toàn bộ kỳ thi trong hệ thống</span>
        </button>

        <button
          type="button"
          className={`summary-stat-card summary-stat-card--inprogress ${parsed.status === 'IN_PROGRESS' ? 'is-active' : ''}`}
          onClick={() => setFilter('status', parsed.status === 'IN_PROGRESS' ? '' : 'IN_PROGRESS')}
          title="Lọc kỳ thi đang diễn ra"
        >
          <div className="summary-stat-top">
            <span className="summary-stat-label">Đang diễn ra</span>
            <div className="summary-stat-icon summary-stat-icon--amber">
              <Clock size={18} />
            </div>
          </div>
          <strong className="summary-stat-value">{summary.data?.IN_PROGRESS ?? 0}</strong>
          <span className="summary-stat-hint">Thí sinh đang trong phiên viva</span>
        </button>

        <button
          type="button"
          className={`summary-stat-card summary-stat-card--scheduled ${parsed.status === 'SCHEDULED' ? 'is-active' : ''}`}
          onClick={() => setFilter('status', parsed.status === 'SCHEDULED' ? '' : 'SCHEDULED')}
          title="Lọc kỳ thi đã lên lịch"
        >
          <div className="summary-stat-top">
            <span className="summary-stat-label">Đã lên lịch</span>
            <div className="summary-stat-icon summary-stat-icon--blue">
              <Calendar size={18} />
            </div>
          </div>
          <strong className="summary-stat-value">{summary.data?.SCHEDULED ?? 0}</strong>
          <span className="summary-stat-hint">Ca thi đã xếp lịch sẵn sàng</span>
        </button>

        <button
          type="button"
          className={`summary-stat-card summary-stat-card--completed ${parsed.status === 'COMPLETED' ? 'is-active' : ''}`}
          onClick={() => setFilter('status', parsed.status === 'COMPLETED' ? '' : 'COMPLETED')}
          title="Lọc kỳ thi đã kết thúc"
        >
          <div className="summary-stat-top">
            <span className="summary-stat-label">Đã kết thúc</span>
            <div className="summary-stat-icon summary-stat-icon--emerald">
              <CheckCircle2 size={18} />
            </div>
          </div>
          <strong className="summary-stat-value">{summary.data?.COMPLETED ?? 0}</strong>
          <span className="summary-stat-hint">Đã hoàn thành khảo thí</span>
        </button>
      </div>

      {/* Unified Data Surface: Toolbar + Table + Pagination as One Cohesive Card */}
      <div className="exam-data-surface">
        {/* Seamless Toolbar Header */}
        <div className="exam-table-toolbar exam-list-filters">
          <div className="exam-toolbar-left">
            <label htmlFor="exam-search" className="exam-search-label">
              <span className="sr-only">Tìm kiếm kỳ thi</span>
              <div className="exam-search-input-wrap">
                <Search size={16} className="exam-search-icon" />
                <Input
                  id="exam-search"
                  value={parsed.q}
                  onChange={(event) => setFilter('q', event.target.value)}
                  placeholder="Tìm kiếm theo tên kỳ thi, mã ca thi, môn học..."
                />
              </div>
            </label>
          </div>

          <div className="exam-toolbar-right">
            <label htmlFor="exam-subject" className="exam-select-label">
              <span className="sr-only">Lọc theo môn học</span>
              <select
                id="exam-subject"
                value={parsed.subject}
                onChange={(event) => setFilter('subject', event.target.value)}
              >
                <option value="">Tất cả môn học</option>
                {(subjects.data ?? []).map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.code} · {subject.name}
                  </option>
                ))}
              </select>
            </label>

            <label htmlFor="exam-status" className="exam-select-label">
              <span className="sr-only">Lọc theo trạng thái</span>
              <select
                id="exam-status"
                value={parsed.status}
                onChange={(event) => setFilter('status', event.target.value)}
              >
                <option value="">Tất cả trạng thái</option>
                {examStatuses.map((status) => (
                  <option key={status} value={status}>
                    {examStatusMeta[status].label}
                  </option>
                ))}
              </select>
            </label>

            <Button
              variant="outline"
              className="filter-reset-btn"
              onClick={clearFilters}
              disabled={!hasFilters}
              title="Đặt lại bộ lọc"
            >
              <RotateCcw size={14} />
              <span>Đặt lại</span>
            </Button>
          </div>
        </div>

        {/* Surface Content Area */}
        {query.isLoading ? (
          <div className="state exam-list-state" aria-busy="true">
            <Skeleton label="Đang tải danh sách kỳ thi" />
            <Skeleton label="Đang tải danh sách kỳ thi" />
            <Skeleton label="Đang tải danh sách kỳ thi" />
          </div>
        ) : query.isError ? (
          <section className="state exam-list-state">
            <Alert tone="danger">Không thể tải danh sách kỳ thi. Vui lòng thử lại.</Alert>
            <Button onClick={() => query.refetch()}>Thử lại</Button>
          </section>
        ) : !data?.total && !hasFilters ? (
          <section className="state exam-list-state">
            <EmptyState title="Chưa có kỳ thi" description="Tạo kỳ thi đầu tiên khi được cấp quyền." />
            <Link className="button primary" to="new">
              <Plus size={16} />
              <span>Tạo kỳ thi</span>
            </Link>
          </section>
        ) : !data?.total ? (
          <section className="state exam-list-state">
            <h2>Không tìm thấy kết quả</h2>
            <p>Không có kỳ thi phù hợp với tìm kiếm hoặc bộ lọc hiện tại.</p>
            <Button variant="outline" onClick={clearFilters}>
              Xóa bộ lọc
            </Button>
          </section>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="exam-list-table-wrap">
              <table className="exam-list-table">
                <caption className="sr-only">Danh sách kỳ thi vấn đáp</caption>
                <thead>
                  <tr>
                    <th scope="col">TÊN KỲ THI</th>
                    <th scope="col">MÔN HỌC</th>
                    <th scope="col">THỜI GIAN DIỄN RA</th>
                    <th scope="col">THỜI LƯỢNG</th>
                    <th scope="col">SỐ THÍ SINH</th>
                    <th scope="col">TRẠNG THÁI</th>
                    <th scope="col" className="text-right">THAO TÁC</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((exam, index) => (
                    <ExamRow
                      exam={exam}
                      key={exam.id}
                      onDelete={setTarget}
                      alignUp={index >= data.items.length - 2}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="exam-list-cards">
              {data.items.map((exam) => (
                <ExamCard exam={exam} key={exam.id} onDelete={setTarget} />
              ))}
            </div>

            {/* Unified Surface Footer: Pagination Bar */}
            <nav className="exam-list-pagination" aria-label="Phân trang danh sách kỳ thi">
              <span className="pagination-count">
                Hiển thị <strong>{data.items.length}</strong> / <strong>{data.total}</strong> kỳ thi
              </span>
              <div className="pagination-controls">
                <Button
                  variant="outline"
                  className="pagination-btn"
                  disabled={data.page <= 1}
                  onClick={() => setParams((current) => updateParam(current, 'page', String(data.page - 1)))}
                >
                  <ChevronLeft size={16} />
                  <span>Trước</span>
                </Button>
                <span className="pagination-page-indicator">
                  Trang <strong>{data.page}</strong> / {data.totalPages}
                </span>
                <Button
                  variant="outline"
                  className="pagination-btn"
                  disabled={data.page >= data.totalPages}
                  onClick={() => setParams((current) => updateParam(current, 'page', String(data.page + 1)))}
                >
                  <span>Sau</span>
                  <ChevronRight size={16} />
                </Button>
              </div>
            </nav>
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Dialog
        open={Boolean(target)}
        onClose={() => {
          if (!remove.isPending) {
            remove.reset()
            setTarget(null)
          }
        }}
        title="Xóa kỳ thi?"
      >
        <p>Bạn có chắc muốn xóa “{target?.title}” không?</p>
        <p className="form-help">Chỉ xóa kỳ thi chưa diễn ra. Hành động này không thể hoàn tác.</p>
        {remove.isError && (
          <Alert tone="danger">
            {remove.error instanceof Error ? remove.error.message : 'Không thể xóa kỳ thi. Vui lòng thử lại.'}
          </Alert>
        )}
        <div className="dialog-actions">
          <Button type="button" variant="outline" disabled={remove.isPending} onClick={() => setTarget(null)}>
            Hủy
          </Button>
          <Button
            type="button"
            variant="danger"
            pending={remove.isPending}
            onClick={() => target && remove.mutate(target.id, { onSuccess: () => setTarget(null) })}
          >
            Xóa kỳ thi
          </Button>
        </div>
      </Dialog>
    </section>
  )
}

function ExamRow({
  exam,
  onDelete,
  alignUp = false,
}: {
  exam: import('./exam-types').ExamSession
  onDelete: (exam: import('./exam-types').ExamSession) => void
  alignUp?: boolean
}) {
  const meta = examStatusMeta[exam.status]
  const deletable = ['DRAFT', 'PUBLISHED', 'SCHEDULED'].includes(exam.status)
  return (
    <tr>
      <td>
        <div className="exam-name">
          <Link to={examRoutes.detail(exam.id)}>{exam.title}</Link>
          <span className="exam-id-badge">{exam.id}</span>
        </div>
      </td>
      <td>
        <div className="exam-subject-info">
          <strong className="exam-subject-name">{exam.subjectName}</strong>
          <span className="exam-subject-code">{exam.subjectCode}</span>
        </div>
      </td>
      <td className="exam-date">
        <div className="exam-date-wrap">
          <Calendar size={14} className="text-slate-400" />
          <span>{formatSchedule(exam.scheduledAt)}</span>
        </div>
      </td>
      <td>
        <span className="exam-duration-pill">{exam.durationMinutes} phút</span>
      </td>
      <td>
        <span className="exam-student-count">
          <strong>{exam.studentCount}</strong> SV
        </span>
      </td>
      <td>
        <StatusBadge label={meta.label} tone={meta.tone} />
      </td>
      <td>
        <div className="exam-actions-cell">
          <Link className="exam-btn-detail" to={examRoutes.detail(exam.id)}>
            <span>Chi tiết</span>
          </Link>
          <ExamActionMenu
            exam={exam}
            deletable={deletable}
            onDelete={onDelete}
            alignUp={alignUp}
          />
        </div>
      </td>
    </tr>
  )
}

function ExamCard({
  exam,
  onDelete,
}: {
  exam: import('./exam-types').ExamSession
  onDelete: (exam: import('./exam-types').ExamSession) => void
}) {
  const meta = examStatusMeta[exam.status]
  const deletable = ['DRAFT', 'PUBLISHED', 'SCHEDULED'].includes(exam.status)
  return (
    <article className="exam-card">
      <header>
        <div className="exam-name">
          <h2>
            <Link to={examRoutes.detail(exam.id)}>{exam.title}</Link>
          </h2>
          <span className="exam-id-badge">{exam.id}</span>
        </div>
        <StatusBadge label={meta.label} tone={meta.tone} />
      </header>
      <dl>
        <div>
          <dt>Môn học</dt>
          <dd>{exam.subjectName}</dd>
        </div>
        <div>
          <dt>Thời gian</dt>
          <dd>{formatSchedule(exam.scheduledAt)}</dd>
        </div>
        <div>
          <dt>Thời lượng</dt>
          <dd>{exam.durationMinutes} phút</dd>
        </div>
        <div>
          <dt>Số thí sinh</dt>
          <dd>{exam.studentCount} SV</dd>
        </div>
      </dl>
      <footer className="exam-card-actions">
        <Link className="exam-btn-detail" to={examRoutes.detail(exam.id)}>
          <span>Chi tiết</span>
        </Link>
        <ExamActionMenu
          exam={exam}
          deletable={deletable}
          onDelete={onDelete}
          alignUp={false}
        />
      </footer>
    </article>
  )
}

function ExamActionMenu({
  exam,
  deletable,
  onDelete,
  alignUp = false,
}: {
  exam: import('./exam-types').ExamSession
  deletable: boolean
  onDelete: (exam: import('./exam-types').ExamSession) => void
  alignUp?: boolean
}) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open])

  return (
    <div className="exam-dropdown-wrap" ref={menuRef}>
      <button
        type="button"
        className={`exam-action-more-btn ${open ? 'is-active' : ''}`}
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Thao tác khác cho ${exam.title}`}
        title="Thao tác khác"
      >
        <MoreHorizontal size={16} />
      </button>

      {open && (
        <div
          className={`exam-dropdown-menu ${alignUp ? 'exam-dropdown-menu--up' : ''}`}
          role="menu"
        >
          <Link
            className="exam-dropdown-item"
            to={examRoutes.students(exam.id)}
            onClick={() => setOpen(false)}
            role="menuitem"
          >
            <Users size={15} />
            <span>Danh sách sinh viên</span>
          </Link>
          {deletable && (
            <>
              <Link
                className="exam-dropdown-item"
                to={examRoutes.edit(exam.id)}
                onClick={() => setOpen(false)}
                role="menuitem"
              >
                <Settings size={15} />
                <span>Thiết lập kỳ thi</span>
              </Link>
              <div className="exam-dropdown-divider" role="separator" />
              <button
                type="button"
                className="exam-dropdown-item exam-dropdown-item--danger"
                onClick={() => {
                  setOpen(false)
                  onDelete(exam)
                }}
                role="menuitem"
              >
                <Trash2 size={15} />
                <span>Xóa kỳ thi</span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}

