import { Database, FileText, CheckCircle2, Clock, Upload, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { SourceMetric, SourcePageHeader } from '../../../components/common/source-page'
import type { CourseMaterial } from '../material-types'
import { formatFileSize } from '../material-validation'
import type { ReactNode } from 'react'

/* Supplied KnowledgeBaseView layout, with real material state in place of its
   hardcoded vector DB, model metrics and fabricated retrieval results. */
export function KnowledgeBaseView({ materials, subjectId, uploadPanel, library }: { materials: CourseMaterial[]; subjectId: string; uploadPanel: ReactNode; library: ReactNode }) {
  return <section className="source-screen space-y-6 max-w-7xl mx-auto pb-16">
    <SourcePageHeader eyebrow="Cơ sở tri thức AI" title="Kho Giáo Trình & Cơ Sở Tri Thức RAG" description="Quản lý tài liệu tham khảo và theo dõi trạng thái xử lý học liệu." actions={<Link className="button outline" to={`/lecturer/subjects/${encodeURIComponent(subjectId)}/questions/generate`}><Sparkles size={16} />AI Sinh Đề RAG</Link>} />
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4"><SourceMetric label="TỔNG SỐ GIÁO TRÌNH" value={materials.length} icon={Database} /><SourceMetric label="SẴN SÀNG" value={materials.filter(item => item.status === 'READY').length} icon={CheckCircle2} tone="emerald" /><SourceMetric label="ĐANG XỬ LÝ" value={materials.filter(item => item.status === 'UPLOADING' || item.status === 'PROCESSING').length} icon={Clock} tone="amber" /><SourceMetric label="DUNG LƯỢNG HỌC LIỆU" value={formatFileSize(materials.reduce((size, item) => size + item.size, 0))} icon={FileText} tone="slate" /></div>
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6"><div className="xl:col-span-7 min-w-0">{library}</div><aside className="xl:col-span-5 min-w-0"><div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4"><h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2"><Upload size={16} className="text-blue-600" />Tải Lên Giáo Trình Mới</h2>{uploadPanel}</div></aside></div>
  </section>
}
