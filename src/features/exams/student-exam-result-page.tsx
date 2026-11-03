import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, FileText, User, Clock, Trash2 } from 'lucide-react'
import { DemoLabel } from '../../components/common/inline-notice'
import { Alert, Button } from '../../components/ui/primitives'
import { runtimeConfig } from '../../services/api/runtime-config'
import { studentResultsDemo } from './mocks/student-results-demo'
import { GradeAppealDialog } from './grade-appeal-dialog'
import { getGradeAppeal, cancelGradeAppeal, APPEAL_CATEGORIES, type GradeAppeal } from './grade-appeal-storage'

export function StudentExamResultPage() {
  const { examId = '' } = useParams()
  const demo = runtimeConfig.dataSource === 'mock'
  const result = demo ? studentResultsDemo.find(r => r.id === examId) : undefined
  const [appeal, setAppeal] = useState<GradeAppeal | null>(() => demo && examId ? getGradeAppeal(examId) : null)
  const [appealDialogOpen, setAppealDialogOpen] = useState(false)
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null)
  const visibleAppeal = result ? appeal : null

  function handleCancelAppeal() {
    if (window.confirm('Bạn có chắc chắn muốn hủy đơn phúc khảo này không?')) {
      cancelGradeAppeal(examId)
      setAppeal(null)
      setFeedbackMessage('Đã hủy đơn phúc khảo mẫu.')
    }
  }

  return (
    <section className="source-screen mx-auto max-w-5xl space-y-6 pb-10">
      <Link className="inline-flex min-h-10 items-center gap-2 rounded-md text-sm text-slate-500 hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600" to="/student/results"><ArrowLeft size={16} aria-hidden="true" />Kết quả &amp; biên bản</Link>
      <header className="space-y-1 border-l-4 border-blue-600 pl-4">
        <h1 className="break-words text-2xl font-semibold tracking-tight text-slate-900">{result?.title ?? 'Biên bản kết quả'}</h1>
        {result && <p className="text-sm text-slate-500">{result.subject} · {new Date(result.date).toLocaleDateString('vi-VN')}</p>}
      </header>
      {demo && <DemoLabel detail="Biên bản và điểm minh họa." />}

      {feedbackMessage && <Alert tone="success"><div className="flex items-center justify-between gap-3"><span>{feedbackMessage}</span><Button variant="outline" onClick={() => setFeedbackMessage(null)}>Đóng</Button></div></Alert>}

      <div className="grid gap-4 md:grid-cols-3">
        <section className="result-score-card flex flex-col justify-between gap-5 rounded-xl border border-blue-200 bg-blue-50/70 p-6 text-blue-900">
          <h2 className="text-sm font-semibold">{demo ? 'Điểm mẫu' : 'Điểm công bố'}</h2>
          <p className="tabular-nums"><strong className="text-5xl font-semibold tracking-tight text-blue-700">{result ? result.score.toFixed(1) : '—'}</strong><span className="ml-2 text-sm text-blue-800">/ 10</span></p>
          <p className="border-t border-blue-100 pt-4 text-xs leading-relaxed text-blue-800">{result ? 'Dữ liệu mô phỏng' : 'Chưa có kết quả được hệ thống công bố'}</p>
        </section>
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white md:col-span-2">
          <header className="flex items-center gap-2 border-b border-blue-100 bg-blue-50/70 px-5 py-4 text-blue-800"><User size={17} aria-hidden="true" /><h2 className="text-sm font-semibold">Nhận xét giảng viên</h2></header>
          <p className="p-5 text-sm leading-relaxed text-slate-600">{result?.feedback ?? (demo ? 'Không tìm thấy kết quả mẫu.' : 'Nhận xét sẽ hiển thị khi bạn được cấp quyền xem kết quả.')}</p>
        </section>
      </div>

      {visibleAppeal ? (
        <section className="space-y-4 rounded-xl border border-amber-200 bg-amber-50/60 p-5" aria-labelledby="result-appeal-title">
          <header className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="result-appeal-title" className="flex items-center gap-2 text-sm font-semibold text-amber-900"><Clock size={17} aria-hidden="true" />Đơn phúc khảo mẫu</h2>
            <Button variant="outline" onClick={handleCancelAppeal}><Trash2 size={14} aria-hidden="true" />Hủy đơn phúc khảo</Button>
          </header>
          <dl className="grid gap-4 text-sm sm:grid-cols-2">
            <div><dt className="text-xs text-amber-800">Mã đơn</dt><dd className="mt-1 break-words font-medium text-slate-900">{visibleAppeal.id}</dd></div>
            <div><dt className="text-xs text-amber-800">Ngày gửi</dt><dd className="mt-1 text-slate-700">{new Date(visibleAppeal.createdAt).toLocaleString('vi-VN')}</dd></div>
            <div><dt className="text-xs text-amber-800">Phạm vi</dt><dd className="mt-1 text-slate-700">{APPEAL_CATEGORIES[visibleAppeal.category]?.label ?? visibleAppeal.category}</dd></div>
            <div><dt className="text-xs text-amber-800">Email liên hệ</dt><dd className="mt-1 break-words text-slate-700">{visibleAppeal.contactEmail}</dd></div>
            <div className="sm:col-span-2"><dt className="text-xs text-amber-800">Nội dung</dt><dd className="mt-1 whitespace-pre-wrap break-words text-slate-700">{visibleAppeal.reason}</dd></div>
          </dl>
        </section>
      ) : result && (
        <section className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-5 py-4">
          <h2 className="text-sm font-semibold text-slate-900">Phúc khảo điểm mẫu</h2>
          <Button variant="outline" onClick={() => setAppealDialogOpen(true)}><FileText size={15} aria-hidden="true" />Tạo đơn phúc khảo</Button>
        </section>
      )}

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <header className="flex items-center gap-2 border-b border-blue-100 bg-blue-50/70 px-5 py-4 text-blue-800"><FileText size={17} aria-hidden="true" /><h2 className="text-sm font-semibold">Biên bản hội thoại</h2></header>
        <p className="px-5 py-8 text-center text-sm text-slate-500">Chưa có biên bản được cấp quyền xem.</p>
      </section>

      {result && <GradeAppealDialog open={appealDialogOpen} examId={result.id} examTitle={result.title} currentScore={result.score} onClose={() => setAppealDialogOpen(false)} onSuccess={newAppeal => { setAppeal(newAppeal); setFeedbackMessage(`Đã lưu đơn phúc khảo mẫu (${newAppeal.id}).`) }} />}
    </section>
  )
}
