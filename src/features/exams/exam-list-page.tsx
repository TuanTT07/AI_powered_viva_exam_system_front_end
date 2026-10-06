import { Link, useSearchParams } from 'react-router-dom'
import { useState } from 'react'
import { Alert, Button, Dialog, Input, Skeleton } from '../../components/ui/primitives'
import { EmptyState, PermissionDenied, StatusBadge } from '../../components/common/states'
import { useSession } from '../../app/providers/use-session'
import { useDeleteExam, useExamSubjects, useExamSummary, useExams } from './exam-hooks'
import { examStatuses, examStatusMeta, type ExamListRequest } from './exam-types'
import { examRoutes } from './exam-routes'
import { parseExamSearchParams } from './exam-url'
import './exam-list.css'

const PAGE_SIZE = 5
function formatSchedule(value: string) { return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) }
function updateParam(params: URLSearchParams, key: string, value: string) { const next = new URLSearchParams(params); if (value) next.set(key, value); else next.delete(key); if (key !== 'page') next.set('page', '1'); return next }

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
  return <section className="exam-list-page">
    <header className="exam-list-head"><div><p className="eyebrow">LƯU TRỮ KHẢO THÍ · KHOA CNTT</p><h1>Kỳ thi vấn đáp</h1><p>Quản lý các phiên thi do giảng viên phụ trách.</p></div><div className="exam-list-actions"><Link className="button primary" to="new">Tạo kỳ thi</Link></div></header>
    <div className="exam-list-summary" aria-label="Tóm tắt kỳ thi"><span>Đã lên lịch <strong>{summary.data?.SCHEDULED ?? '—'}</strong></span><span>Đang diễn ra <strong>{summary.data?.IN_PROGRESS ?? '—'}</strong></span><span>Đã kết thúc <strong>{summary.data?.COMPLETED ?? '—'}</strong></span></div>
    <div className="exam-list-filters"><label htmlFor="exam-search">Tìm kiếm<Input id="exam-search" value={parsed.q} onChange={(event) => setFilter('q', event.target.value)} placeholder="Tên kỳ thi, mã hoặc môn học..." /></label><label htmlFor="exam-subject">Môn học<select id="exam-subject" value={parsed.subject} onChange={(event) => setFilter('subject', event.target.value)}><option value="">Tất cả môn học</option>{(subjects.data ?? []).map((subject) => <option key={subject.id} value={subject.id}>{subject.code} · {subject.name}</option>)}</select></label><label htmlFor="exam-status">Trạng thái<select id="exam-status" value={parsed.status} onChange={(event) => setFilter('status', event.target.value)}><option value="">Tất cả trạng thái</option>{examStatuses.map((status) => <option key={status} value={status}>{examStatusMeta[status].label}</option>)}</select></label><Button variant="outline" onClick={clearFilters} disabled={!hasFilters}>Đặt lại</Button></div>
    {query.isLoading ? <div className="state exam-list-state" aria-busy="true"><Skeleton label="Đang tải danh sách kỳ thi" /><Skeleton label="Đang tải danh sách kỳ thi" /><Skeleton label="Đang tải danh sách kỳ thi" /></div> : query.isError ? <section className="state exam-list-state"><Alert tone="danger">Không thể tải danh sách kỳ thi. Vui lòng thử lại.</Alert><Button onClick={() => query.refetch()}>Thử lại</Button></section> : !data?.total && !hasFilters ? <section className="state exam-list-state"><EmptyState title="Chưa có kỳ thi" description="Tạo kỳ thi đầu tiên khi được cấp quyền." /><Link className="button primary" to="new">Tạo kỳ thi</Link></section> : !data?.total ? <section className="state exam-list-state"><h2>Không tìm thấy kết quả</h2><p>Không có kỳ thi phù hợp với tìm kiếm hoặc bộ lọc hiện tại.</p><Button variant="outline" onClick={clearFilters}>Xóa bộ lọc</Button></section> : <>
      <div className="exam-list-table-wrap"><table className="exam-list-table"><caption className="sr-only">Danh sách kỳ thi vấn đáp</caption><thead><tr><th scope="col">TÊN KỲ THI</th><th scope="col">MÔN HỌC</th><th scope="col">THỜI GIAN DIỄN RA</th><th scope="col">THỜI LƯỢNG</th><th scope="col">SỐ THÍ SINH</th><th scope="col">TRẠNG THÁI</th><th scope="col">THAO TÁC</th></tr></thead><tbody>{data.items.map((exam) => <ExamRow exam={exam} key={exam.id} onDelete={setTarget} />)}</tbody></table></div>
      <div className="exam-list-cards">{data.items.map((exam) => <ExamCard exam={exam} key={exam.id} onDelete={setTarget} />)}</div>
      <nav className="exam-list-pagination" aria-label="Phân trang danh sách kỳ thi"><span>Hiển thị {data.items.length} / {data.total} kỳ thi</span><Button variant="outline" disabled={data.page <= 1} onClick={() => setParams((current) => updateParam(current, 'page', String(data.page - 1)))}>Trước</Button><span>Trang {data.page} / {data.totalPages}</span><Button variant="outline" disabled={data.page >= data.totalPages} onClick={() => setParams((current) => updateParam(current, 'page', String(data.page + 1)))}>Sau</Button></nav>
    </>}<Dialog open={Boolean(target)} onClose={() => { if (!remove.isPending) { remove.reset(); setTarget(null) } }} title="Xóa kỳ thi?"><p>Bạn có chắc muốn xóa “{target?.title}” không?</p><p className="form-help">Chỉ xóa kỳ thi chưa diễn ra. Hành động này không thể hoàn tác.</p>{remove.isError && <Alert tone="danger">{remove.error instanceof Error ? remove.error.message : 'Không thể xóa kỳ thi. Vui lòng thử lại.'}</Alert>}<div className="dialog-actions"><Button type="button" variant="outline" disabled={remove.isPending} onClick={() => setTarget(null)}>Hủy</Button><Button type="button" variant="danger" pending={remove.isPending} onClick={() => target && remove.mutate(target.id, { onSuccess: () => setTarget(null) })}>Xóa kỳ thi</Button></div></Dialog>
  </section>
}

 function ExamRow({ exam, onDelete }: { exam: import('./exam-types').ExamSession; onDelete: (exam: import('./exam-types').ExamSession) => void }) { const meta = examStatusMeta[exam.status]; const deletable = ['DRAFT', 'PUBLISHED', 'SCHEDULED'].includes(exam.status); return <tr><td><div className="exam-name"><Link to={examRoutes.detail(exam.id)}>{exam.title}</Link><small>{exam.id}</small></div></td><td>{exam.subjectName}<br /><small>{exam.subjectCode}</small></td><td className="exam-date">{formatSchedule(exam.scheduledAt)}</td><td>{exam.durationMinutes} phút</td><td>{exam.studentCount} SV</td><td><StatusBadge label={meta.label} tone={meta.tone} /></td><td><div className="exam-actions"><Link className="button outline" to={examRoutes.students(exam.id)}>Sinh viên</Link><Link className="button outline" to={examRoutes.detail(exam.id)}>Chi tiết</Link>{deletable && <><Link className="button outline" to={examRoutes.edit(exam.id)}>Thiết lập</Link><Button type="button" variant="danger" onClick={() => onDelete(exam)}>Xóa</Button></>}</div></td></tr> }
 function ExamCard({ exam, onDelete }: { exam: import('./exam-types').ExamSession; onDelete: (exam: import('./exam-types').ExamSession) => void }) { const meta = examStatusMeta[exam.status]; const deletable = ['DRAFT', 'PUBLISHED', 'SCHEDULED'].includes(exam.status); return <article className="exam-card"><header><div className="exam-name"><h2><Link to={examRoutes.detail(exam.id)}>{exam.title}</Link></h2><small>{exam.id}</small></div><StatusBadge label={meta.label} tone={meta.tone} /></header><dl><div><dt>Môn học</dt><dd>{exam.subjectName}</dd></div><div><dt>Thời gian</dt><dd>{formatSchedule(exam.scheduledAt)}</dd></div><div><dt>Thời lượng</dt><dd>{exam.durationMinutes} phút</dd></div><div><dt>Số thí sinh</dt><dd>{exam.studentCount} SV</dd></div></dl><footer className="exam-actions"><Link className="button outline" to={examRoutes.students(exam.id)}>Sinh viên</Link><Link className="button outline" to={examRoutes.detail(exam.id)}>Chi tiết kỳ thi</Link>{deletable && <><Link className="button outline" to={examRoutes.edit(exam.id)}>Thiết lập</Link><Button type="button" variant="danger" onClick={() => onDelete(exam)}>Xóa</Button></>}</footer></article> }
