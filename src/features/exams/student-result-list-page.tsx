import { ResultQueryBoundary } from './result-query-boundary'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Calendar } from 'lucide-react'
import { Button, Input, Skeleton } from '../../components/ui/primitives'
import { DemoLabel } from '../../components/common/inline-notice'
import { runtimeConfig } from '../../services/api/runtime-config'
import { demoResults, resultDate, resultPath, resultOutcome, useResultList, type StudentResult } from './student-result-data'
import '../students/student.css'
import './student-results.css'

export function ResultStatus({ result }: { result?: StudentResult }) {
  const outcome = resultOutcome(result)
  const label = outcome === 'passed' ? 'Đạt' : outcome === 'failed' ? 'Chưa đạt' : 'Chờ công bố'
  return <span className={`result-status ${outcome}`}>{label}{result?.demo ? ' · mẫu' : ''}</span>
}
export function StudentResultListPage() {
  return <ResultQueryBoundary><ResultList /></ResultQueryBoundary>
}
function ResultList() {
  const demo = runtimeConfig.dataSource === 'mock'
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const query = useResultList(page)
  const rows = demo ? demoResults : query.data?.rows ?? []
  const visible = rows.filter(r => `${r.title} ${r.code} ${r.course}`.toLowerCase().includes(search.toLowerCase().trim()) && (filter === 'all' || (filter === 'published') === (r.score !== null || r.questions.length > 0)))
  return <section className="results-page">
    <header className="results-heading"><div><span className="results-eyebrow">HỌC TẬP / KẾT QUẢ</span><h1>Kết quả thi</h1><p>Tra cứu kết quả và đánh giá đã được công bố.</p></div><Link className="button outline" to="/student/exams"><Calendar size={16} />Kỳ thi của tôi</Link></header>
    {demo && <DemoLabel detail="Điểm và nhận xét minh họa, không phải kết quả thi thực tế của bạn." />}
    <div className="results-toolbar"><label className="results-search"><span className="sr-only">Tìm kết quả thi</span><Input type="search" placeholder="Tìm kỳ thi, mã kỳ thi hoặc học phần…" value={search} onChange={e => setSearch(e.target.value)} /></label><div className="results-filters" aria-label="Lọc kết quả">{[['all', 'Tất cả'], ['published', 'Đã công bố'], ['pending', 'Chờ công bố']].map(([value, label]) => <button type="button" key={value} aria-pressed={filter === value} onClick={() => setFilter(value)}>{label}</button>)}</div></div>
    {!demo && query.isFetching && !query.data && <Skeleton label="Đang tải kết quả thi" />}
    {!demo && query.isError ? <section className="result-panel" role="alert"><h2>Không thể tải kết quả</h2><p>Kiểm tra kết nối hoặc quyền truy cập của bạn.</p><Button variant="outline" onClick={() => query.refetch()}>Thử lại</Button></section> : <div className="results-list">{visible.map(r => {
      const date = r.date && Number.isFinite(Date.parse(r.date)) ? new Date(r.date) : null
      const [courseCode, ...courseName] = r.course.split(' · ')
      return <article className="result-row result-row--schedule" key={r.attemptId}>
        <div className="result-card-content">
          <div className="student-slot-date-badge" aria-hidden="true">
            {date ? <><span className="student-slot-date-month">Tháng {date.getMonth() + 1}</span><span className="student-slot-date-day">{String(date.getDate()).padStart(2, '0')}</span></> : <Calendar size={24} />}
          </div>
          <div className="result-row-info">
            {courseCode && <span className="subject-code-badge">{courseCode}</span>}
            <h2>{r.title}</h2>
            {courseName.length > 0 && <p>{courseName.join(' · ')}</p>}
            <span className="result-date"><Calendar size={14} aria-hidden="true" />Ngày thi: {resultDate(r.date)}</span>
          </div>
          <div className={`result-row-score ${resultOutcome(r)}`}><span className="results-eyebrow">{demo ? 'Điểm mẫu' : 'Điểm trung bình'}</span><strong>{r.score?.toFixed(1) ?? '—'}<small> /10</small></strong><ResultStatus result={r} /></div>
        </div>
        <footer className="result-card-footer"><Link className="result-card-action" to={resultPath(r)} aria-label={`Xem chi tiết ${r.title}`}>Xem chi tiết <ArrowRight size={16} /></Link><span>Kết quả chỉ đọc</span></footer>
      </article>
    })}{!visible.length && (demo || !query.isFetching) && <section className="result-panel results-empty"><h2>Chưa có kết quả để hiển thị</h2><p>{search || filter !== 'all' ? 'Thử thay đổi từ khóa hoặc bộ lọc.' : 'Kết quả sẽ hiển thị khi được hệ thống công bố.'}</p></section>}</div>}
    {!demo && (query.data?.totalPages ?? 0) > 1 && <nav className="results-pagination" aria-label="Phân trang kết quả"><Button variant="outline" disabled={page === 0 || query.isFetching} onClick={() => setPage(p => p - 1)}>Trang trước</Button><span>Trang {page + 1} / {query.data?.totalPages}</span><Button variant="outline" disabled={page + 1 >= (query.data?.totalPages ?? 0) || query.isFetching} onClick={() => setPage(p => p + 1)}>Trang sau</Button></nav>}
  </section>
}
