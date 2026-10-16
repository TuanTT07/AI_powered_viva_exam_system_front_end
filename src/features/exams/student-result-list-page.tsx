import { DemoLabel } from '../../components/common/inline-notice'
import { Link } from 'react-router-dom'
import { FileCheck2, GraduationCap } from 'lucide-react'
import { SourcePageHeader } from '../../components/common/source-page'
import { Alert } from '../../components/ui/primitives'
import { runtimeConfig } from '../../services/api/runtime-config'
import { studentResultsDemo } from './mocks/student-results-demo'

export function StudentResultListPage() {
  const demo = runtimeConfig.dataSource === 'mock'
  const results = demo ? studentResultsDemo : []
  return <section className="source-screen max-w-6xl mx-auto space-y-6 pb-12"><SourcePageHeader eyebrow="Cổng thí sinh · Kết quả" title="Kết quả và biên bản" description="Xem kết quả được công bố và nhận xét của giảng viên." actions={<Link className="button outline" to="/student/exams">Kỳ thi của tôi</Link>} />
    {demo ? <DemoLabel detail="Dữ liệu demo · Điểm và nhận xét minh họa, không phải kết quả thi thực." /> : <Alert>Chưa có chức năng tra cứu kết quả được công bố từ hệ thống.</Alert>}
    <div className="space-y-4">{results.map(result => <article key={result.id} className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-5"><div className="flex gap-4 items-start"><span className="rounded-xl bg-blue-50 text-blue-600 p-3"><FileCheck2 size={24} /></span><div><span className="text-xs text-emerald-700 font-semibold">Kết quả công bố mẫu</span><h2 className="text-base font-semibold text-slate-900 mt-1">{result.title}</h2><p className="text-xs text-slate-500 mt-1">{result.subject} · {new Date(result.date).toLocaleDateString('vi-VN')}</p></div></div><div className="flex items-center gap-6"><div className="text-center"><p className="text-[11px] text-slate-500 uppercase">Điểm demo</p><strong className="text-2xl font-mono text-emerald-700">{result.score.toFixed(1)}<small className="text-xs text-slate-400"> / 10</small></strong></div><Link className="button outline" to={`/student/exams/${result.id}/result`}>Xem biên bản</Link></div></article>)}{!results.length && <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3"><GraduationCap size={36} className="text-slate-400" /><h2 className="text-base font-semibold text-slate-900">Chưa có kết quả để hiển thị</h2><p className="text-sm text-slate-500">Kết quả chỉ xuất hiện khi hệ thống cho phép công bố.</p></div>}</div>
  </section>
}
