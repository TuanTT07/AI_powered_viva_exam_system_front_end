import { useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { Search, Users, CheckCircle2, Clock, Sparkles } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { SourceMetric, SourcePageHeader } from '../../components/common/source-page'
import { DemoLabel } from '../../components/common/inline-notice'
import { Button } from '../../components/ui/primitives'
import { ErrorState, LoadingPage, StatusBadge } from '../../components/common/states'
import { useExam } from './exam-hooks'
import { AttemptTable } from './views/AttemptTable'
import { attemptStatusLabels } from './attempt-status'
import { useAssessmentOverview } from './use-assessment-overview'
import { runtimeConfig } from '../../services/api/runtime-config'
import { apiEvaluationService } from '../grading/api-evaluation-service'
import { summarizeAttempt } from '../grading/attempt-grade'

export function ExamAttemptListPage() {
  const { examId = '' } = useParams()
  const [params] = useSearchParams()
  const summary = params.get('view') === 'summary'
  const exam = useExam(examId)
  const query = useAssessmentOverview(examId)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')

  // Dev3 API: Query exam-specific evaluations
  const examEvals = useQuery({
    queryKey: ['exam-attempt-grading', examId, query.data?.rows.map(r => r.attemptId)],
    queryFn: async () => {
      const inventories = await Promise.all((query.data?.rows ?? []).map(async row => ({
        attemptId: row.attemptId,
        questions: await apiEvaluationService.attemptQuestions(examId, row.attemptId),
      })))
      return {
        content: inventories.flatMap(i => i.questions.map(q => q.evaluation)),
        counts: Object.fromEntries(inventories.map(i => [i.attemptId, i.questions.length])),
      }
    },
    enabled: runtimeConfig.dataSource === 'api' && Boolean(examId) && query.isSuccess,
    retry: false,
  })

  const evaluationsList = examEvals.isSuccess ? examEvals.data.content : []

  if (exam.isPending || query.isPending) return <LoadingPage label="Đang tải danh sách lượt thi" />
  if (exam.isError || query.isError) return <><ErrorState description={exam.error?.message || query.error?.message || 'Không thể tải lượt thi.'} /><Button onClick={() => { void exam.refetch(); void query.refetch() }}>Thử lại</Button></>
  if (!exam.data) return <ErrorState description="Không tìm thấy kỳ thi." />
  const questionCounts = examEvals.isSuccess ? examEvals.data.counts : {}
  const { rows, total } = query.data
  const pendingReview = evaluationsList.filter(item => item.status === 'PENDING_REVIEW')
  const finalized = evaluationsList.filter(item => item.status === 'GRADED')
  const queue = rows.filter(row => {
    if (row.status !== 'COMPLETED') return false
    return summarizeAttempt(evaluationsList, row.attemptId, questionCounts[row.attemptId]).score === null
  })
  const visibleRows = summary ? rows : queue
  const filtered = visibleRows.filter(r => (!summary || !status || r.status === status) && `${r.studentName} ${r.studentCode} ${r.studentEmail}`.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase()))

  return (
    <section className="source-screen max-w-7xl mx-auto space-y-6 pb-12">
      <SourcePageHeader
        eyebrow={summary ? "Khảo thí · Kết quả kỳ thi" : "Khảo thí · Hàng đợi chấm điểm"}
        title={summary ? 'Kết quả chấm điểm' : 'Bài cần chấm'}
        description={exam.data.title}
        actions={
          <>
            <Link className="button outline" to={`/lecturer/exams/${examId}`}>
              Tổng quan kỳ thi
            </Link>
            <Link className="button outline" to={`/lecturer/exams/${examId}/report`}>
              Báo cáo
            </Link>
            {runtimeConfig.dataSource === 'mock' && (
              <Link className="button primary" to={`/lecturer/exams/${examId}/attempts/demo-review${summary ? '?tab=summary' : ''}`}>
                Xem chấm điểm mẫu
              </Link>
            )}
          </>
        }
      />
      {runtimeConfig.dataSource === 'mock' && <DemoLabel detail="Danh sách, trạng thái và điểm trong chế độ demo đều là dữ liệu mô phỏng." />}
      {examEvals.isError && <div className="flex flex-wrap items-center gap-3 rounded-lg bg-amber-50 p-3 text-sm">
        Không thể tải trạng thái chấm điểm. <Button variant="outline" onClick={() => examEvals.refetch()}>Thử lại</Button>
      </div>}
      <div className="grid sm:grid-cols-3 gap-4">
        <SourceMetric label={summary ? 'THÍ SINH' : 'LƯỢT THI CẦN XỬ LÝ'} value={summary ? total : queue.length} icon={Users} />
        <SourceMetric label="CÂU CHƯA LƯU ĐIỂM" value={pendingReview.length} icon={Clock} tone="amber" />
        {summary && <SourceMetric label="CÂU ĐÃ LƯU ĐIỂM" value={finalized.length} icon={CheckCircle2} tone="emerald" />}
      </div>
      <div className="assessment-filters">
        <label className="flex items-center gap-2 border border-slate-200 rounded-lg bg-white px-3 flex-1">
          <Search size={16} />
          <input aria-label="Tìm thí sinh" className="input border-0 w-full" value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm tên, mã sinh viên hoặc email" />
        </label>
        {summary && <select className="input assessment-status-filter" aria-label="Lọc trạng thái lượt thi" value={status} onChange={e => setStatus(e.target.value)}>
          <option value="">Tất cả trạng thái</option>
          {Object.entries(attemptStatusLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
        </select>}
      </div>
      <AttemptTable rows={filtered} evaluations={examEvals.isSuccess ? evaluationsList : []} questionCounts={questionCounts} examId={examId} allowReview summary={summary} demo={query.data.demo} />
      <p className="text-xs text-slate-500">Hiển thị {filtered.length} / {visibleRows.length} hồ sơ</p>

      {/* DEV3 API: Bảng kết quả chấm điểm học phần từ Backend */}
      {!summary && runtimeConfig.dataSource === 'api' && pendingReview.length > 0 && (
        <div className="mt-8 rounded-xl border border-blue-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="text-blue-600" size={18} />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Điểm AI chờ duyệt
              </h3>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full">
              {pendingReview.length} bài đánh giá
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase">
                <tr>
                  <th className="p-3">NỘI DUNG CÂU HỎI</th>
                  <th className="p-3">ĐIỂM AI ĐỀ XUẤT</th>
                  <th className="p-3">ĐIỂM CHÍNH THỨC</th>
                  <th className="p-3">TRẠNG THÁI</th>
                  <th className="p-3 text-right">THAO TÁC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pendingReview.map(item => (
                  <tr key={item.questionAttemptId} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 max-w-md">
                      <strong className="block text-slate-900 text-xs line-clamp-1">{item.questionContent}</strong>
                      <span className="text-slate-500 text-[11px] line-clamp-1 mt-0.5">{item.overallFeedback}</span>
                    </td>
                    <td className="p-3">
                      <strong className="text-blue-700 font-semibold">{item.aiSuggestedScore ?? '—'}</strong>
                      <span className="text-slate-400"> / {item.maxScore}</span>
                    </td>
                    <td className="p-3">
                      {item.finalScore !== null ? (
                        <span className="font-bold text-emerald-700">{item.finalScore}</span>
                      ) : (
                        <span className="text-slate-400 italic">Chờ chốt</span>
                      )}
                    </td>
                    <td className="p-3">
                      <StatusBadge label={item.status === 'GRADED' ? 'ĐÃ CHỐT' : 'CHỜ DUYỆT'} tone={item.status === 'GRADED' ? 'success' : 'warning'} />
                    </td>
                    <td className="p-3 text-right">
                      <Link
                        className="button outline"
                        to={`/lecturer/exams/${examId}/attempts/${item.examAttemptId}?question=${item.questionAttemptId}`}
                      >
                        Vào chấm &amp; Chốt điểm →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  )
}
