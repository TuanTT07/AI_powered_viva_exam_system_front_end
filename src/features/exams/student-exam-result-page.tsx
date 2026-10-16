import { DemoLabel } from '../../components/common/inline-notice'
import { Link, useParams } from 'react-router-dom'
import { FileText, ShieldCheck } from 'lucide-react'
import { SourcePageHeader } from '../../components/common/source-page'
import { runtimeConfig } from '../../services/api/runtime-config'
import { studentResultsDemo } from './mocks/student-results-demo'

export function StudentExamResultPage() {
  const { examId } = useParams()
  const demo = runtimeConfig.dataSource === 'mock'
  const result = demo ? studentResultsDemo.find(r => r.id === examId) : undefined
  return <section className="source-screen max-w-6xl mx-auto space-y-6 pb-12"><SourcePageHeader eyebrow="Kết quả · Biên bản khảo thí" title={result?.title ?? 'Biên bản kết quả'} description={result?.subject} actions={<Link className="button outline" to="/student/results">Danh sách kết quả</Link>} />
    {demo && <DemoLabel detail="Dữ liệu demo · Biên bản và điểm minh họa." />}
    <div className="grid md:grid-cols-3 gap-5"><section className="result-score-card bg-blue-600 rounded-xl p-8 text-center text-white space-y-3"><ShieldCheck size={28} /><h2 className="text-sm font-semibold">{demo ? 'Điểm công bố mẫu' : 'Điểm chính thức'}</h2><strong className="block text-5xl font-mono">{result ? result.score.toFixed(1) : '—'}</strong><p className="text-xs">{result ? 'Thang điểm 10 · Demo' : 'Chưa có kết quả được hệ thống công bố'}</p></section><section className="md:col-span-2 bg-white border border-slate-200 rounded-xl p-6 space-y-4"><h2 className="text-sm font-semibold text-slate-900">Nhận xét giảng viên</h2><p className="text-sm text-slate-600 leading-relaxed">{result?.feedback ?? (demo ? 'Không tìm thấy kết quả mẫu cho kỳ thi này.' : 'Nhận xét sẽ hiển thị khi được cấp quyền xem kết quả.')}</p><p className="text-xs text-slate-400">{result ? `Ngày thi mẫu: ${new Date(result.date).toLocaleDateString('vi-VN')}` : 'Chưa có ngày xác nhận kết quả'}</p></section></div>
    <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-4"><h2 className="text-sm font-semibold flex items-center gap-2"><FileText size={16} /> Biên bản hội thoại được công bố</h2><p className="text-sm text-slate-500 py-6 text-center">Chưa có transcript được cấp quyền xem trong kết quả này.</p></section>
  </section>
}
