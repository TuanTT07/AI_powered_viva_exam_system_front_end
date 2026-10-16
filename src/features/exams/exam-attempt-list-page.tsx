import { useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { Search, Users, CheckCircle2, Clock } from 'lucide-react'
import { SourceMetric, SourcePageHeader } from '../../components/common/source-page'
import { DemoLabel } from '../../components/common/inline-notice'
import { Button } from '../../components/ui/primitives'
import { ErrorState, LoadingPage } from '../../components/common/states'
import { useExam } from './exam-hooks'
import { AttemptTable } from './views/AttemptTable'
import { attemptStatusLabels } from './attempt-status'
import { useAssessmentOverview } from './use-assessment-overview'
import { runtimeConfig } from '../../services/api/runtime-config'

export function ExamAttemptListPage() {
  const { examId = '' } = useParams()
  const [params] = useSearchParams()
  const summary = params.get('view') === 'summary'
  const exam = useExam(examId)
  const query = useAssessmentOverview(examId)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  if (exam.isPending || query.isPending) return <LoadingPage label="Đang tải danh sách lượt thi" />
  if (exam.isError || query.isError) return <><ErrorState description={exam.error?.message || query.error?.message || 'Không thể tải lượt thi.'} /><Button onClick={() => { void exam.refetch(); void query.refetch() }}>Thử lại</Button></>
  if (!exam.data) return <ErrorState description="Không tìm thấy kỳ thi." />
  const { rows, total, completed, active } = query.data
  const filtered = rows.filter(r => (!status || r.status === status) && `${r.studentName} ${r.studentCode} ${r.studentEmail}`.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase()))
  return <section className="source-screen max-w-7xl mx-auto space-y-6 pb-12"><SourcePageHeader eyebrow="Khảo thí · Hồ sơ thí sinh" title={summary ? 'Tổng hợp & Chốt điểm' : 'Danh sách lượt thi'} description={exam.data.title} actions={<><Link className="button outline" to={`/lecturer/exams/${examId}`}>Tổng quan kỳ thi</Link><Link className="button outline" to={`/lecturer/exams/${examId}/report`}>Báo cáo</Link>{runtimeConfig.dataSource === 'mock' && <Link className="button primary" to={`/lecturer/exams/${examId}/attempts/demo-review${summary ? '?tab=summary' : ''}`}>Xem chấm điểm mẫu</Link>}</>} />
    {runtimeConfig.dataSource === 'mock' && <DemoLabel detail="Danh sách, trạng thái và điểm trong chế độ demo đều là dữ liệu mô phỏng." />}
    <div className="grid sm:grid-cols-3 gap-4"><SourceMetric label="THÍ SINH" value={total} icon={Users} /><SourceMetric label="ĐANG THI" value={active ?? '—'} icon={Clock} tone="amber" /><SourceMetric label="HOÀN TẤT LƯỢT THI" value={completed ?? '—'} detail="Hoàn tất lượt thi chưa đồng nghĩa đã chốt điểm" icon={CheckCircle2} tone="emerald" /></div>
    <div className="assessment-filters"><label className="flex items-center gap-2 border border-slate-200 rounded-lg bg-white px-3 flex-1"><Search size={16} /><input aria-label="Tìm thí sinh" className="input border-0 w-full" value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm tên, mã sinh viên hoặc email" /></label><select className="input assessment-status-filter" aria-label="Lọc trạng thái lượt thi" value={status} onChange={e => setStatus(e.target.value)}><option value="">Tất cả trạng thái</option>{Object.entries(attemptStatusLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></div>
    <AttemptTable rows={filtered} examId={examId} allowReview summary={summary} demo={query.data.demo} /><p className="text-xs text-slate-500">Hiển thị {filtered.length} / {rows.length} hồ sơ</p>
  </section>
}
