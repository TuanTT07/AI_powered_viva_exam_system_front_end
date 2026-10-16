import { Link } from 'react-router-dom'
import { Clock } from 'lucide-react'
import { SourcePageHeader } from './source-page'

export function FeatureUnavailable({ title, returnTo, returnLabel = 'Quay lại' }: { title: string; returnTo: string; returnLabel?: string }) {
  return <section className="source-screen max-w-7xl mx-auto space-y-6 pb-16"><SourcePageHeader title={title} /><div className="rounded-xl border border-slate-200 bg-white p-8 md:p-12 text-center space-y-4"><span className="w-12 h-12 inline-flex items-center justify-center rounded-xl bg-blue-50 text-blue-600"><Clock size={24} /></span><h2 className="text-lg font-semibold text-slate-900">Chức năng đang được chuẩn bị</h2><p className="text-sm text-slate-500">Thông tin sẽ hiển thị khi chức năng được hệ thống hỗ trợ.</p><Link className="button outline" to={returnTo}>{returnLabel}</Link></div></section>
}
