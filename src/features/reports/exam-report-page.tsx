import { Link, useParams } from 'react-router-dom'
import { BarChart3, CheckCircle2, Printer, Users } from 'lucide-react'
import { SourceMetric, SourcePageHeader } from '../../components/common/source-page'
import { DemoLabel, InlineNotice } from '../../components/common/inline-notice'
import { Button } from '../../components/ui/primitives'
import { LoadingPage, ErrorState } from '../../components/common/states'
import { useExam } from '../exams/exam-hooks'
import { useAssessmentOverview } from '../exams/use-assessment-overview'
import { AttemptTable } from '../exams/views/AttemptTable'
import { attemptStatusLabels } from '../exams/attempt-status'

export function ExamReportPage() {
  const { examId = '' } = useParams()
  const exam = useExam(examId)
  const overview = useAssessmentOverview(examId)
  if (exam.isPending || overview.isPending) return <LoadingPage label="Đang tải báo cáo kỳ thi" />
  if (exam.isError || overview.isError) return <><ErrorState description={exam.error?.message || overview.error?.message || 'Không thể tải báo cáo.'} /><Button onClick={() => { void exam.refetch(); void overview.refetch() }}>Thử lại</Button></>
  if (!exam.data) return <ErrorState description="Không tìm thấy kỳ thi." />
  const data = overview.data
  const scores = data.demo ? data.rows.flatMap(row => row.demoScore === undefined ? [] : [row.demoScore]) : []
  const average = scores.length ? (scores.reduce((sum, score) => sum + score, 0) / scores.length).toFixed(2) : '—'
  const bands = [{ label: 'Xuất sắc (9–10)', min: 9, max: 11 }, { label: 'Giỏi (8–8.9)', min: 8, max: 9 }, { label: 'Khá (7–7.9)', min: 7, max: 8 }, { label: 'Đạt (5–6.9)', min: 5, max: 7 }, { label: 'Chưa đạt (< 5)', min: 0, max: 5 }]
  return <section className="source-screen max-w-7xl mx-auto space-y-6 pb-12"><SourcePageHeader eyebrow="Báo cáo · Phân tích kỳ thi" title="Báo cáo tổng hợp khảo thí" description={exam.data.title} actions={<>{data.demo && <DemoLabel />}<Link className="button outline" to={`/lecturer/exams/${examId}/attempts`}>Danh sách lượt thi</Link><Button onClick={() => window.print()}><Printer size={15} /> In báo cáo</Button></>} />
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4"><SourceMetric label="TỔNG THÍ SINH" value={data.total} icon={Users} /><SourceMetric label="HOÀN TẤT LƯỢT THI" value={data.completed ?? '—'} icon={CheckCircle2} tone="emerald" /><SourceMetric label={data.demo ? 'ĐIỂM TRUNG BÌNH MẪU' : 'ĐIỂM TRUNG BÌNH'} value={average} detail={scores.length ? `${scores.length} kết quả mô phỏng` : 'Chưa có kết quả chấm điểm'} icon={BarChart3} tone="slate" /><SourceMetric label={data.demo ? 'TỶ LỆ ĐẠT MẪU' : 'TỶ LỆ ĐẠT'} value={scores.length ? `${Math.round(scores.filter(score => score >= 5).length / scores.length * 100)}%` : '—'} detail={data.demo ? 'Ngưỡng minh họa: 5/10' : 'Theo chính sách công bố'} tone="slate" /></div>
    <div className="grid lg:grid-cols-2 gap-6"><section className="bg-white border border-slate-200 rounded-xl p-5 space-y-5"><h2 className="text-sm font-semibold text-slate-900">Tiến độ khảo thí</h2>{Object.entries(attemptStatusLabels).map(([status, label]) => { const count = data.rows.filter(r => r.status === status).length; return <div key={status}><div className="flex justify-between text-xs mb-2"><span>{label}</span><strong>{count} thí sinh</strong></div><div className="h-3 rounded-full bg-slate-100 overflow-hidden"><div className="h-full bg-blue-600 rounded-full" style={{ width: `${data.rows.length ? count / data.rows.length * 100 : 0}%` }} /></div></div> })}</section><section className="bg-white border border-slate-200 rounded-xl p-5 space-y-5"><h2 className="text-sm font-semibold text-slate-900">{data.demo ? 'Phổ điểm mô phỏng' : 'Phổ điểm khảo thí'}</h2>{scores.length ? bands.map(band => { const count = scores.filter(score => score >= band.min && score < band.max).length; return <div key={band.label}><div className="flex justify-between text-xs mb-2"><span>{band.label}</span><strong>{count} thí sinh</strong></div><div className="h-4 rounded-full bg-slate-100 overflow-hidden"><div className="h-full bg-indigo-500 rounded-full" style={{ width: `${count / scores.length * 100}%` }} /></div></div> }) : <div className="border border-dashed border-slate-200 rounded-lg p-8 text-center text-slate-400"><BarChart3 size={36} className="mx-auto mb-3" /><p className="text-sm">Chưa có điểm để phân tích.</p></div>}{data.demo && <InlineNotice>Phổ điểm minh họa từ bộ dữ liệu mẫu.</InlineNotice>}</section></div>
    <h2 className="text-base font-semibold text-slate-900">Hồ sơ thí sinh và trạng thái kết quả</h2><AttemptTable rows={data.rows} examId={examId} allowReview demo={data.demo} />
  </section>
}
