import { Link } from 'react-router-dom'
import { Alert, Badge, Skeleton } from '../ui/primitives'
import { FileQuestion, Lock } from 'lucide-react'

export function PageHeader({ title, description, eyebrow }: { title: string; description: string; eyebrow?: string }) {
  return (
    <header className="page-header mb-6">
      {eyebrow && <p className="eyebrow text-xs font-semibold uppercase tracking-wider text-blue-600 mb-1">{eyebrow}</p>}
      <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">{title}</h1>
      <p className="text-sm text-slate-500 mt-1">{description}</p>
    </header>
  )
}

export function LoadingPage({ label = 'Đang tải nội dung' }: { label?: string }) {
  return (
    <section aria-busy="true" className="state p-8 flex flex-col gap-3">
      <Skeleton label={label} />
      <Skeleton label={label} />
    </section>
  )
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <section className="state p-10 text-center flex flex-col items-center justify-center">
      <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
        <FileQuestion size={24} />
      </div>
      <h2 className="text-base font-semibold text-slate-900">{title}</h2>
      <p className="text-sm text-slate-500 max-w-md mt-1">{description}</p>
    </section>
  )
}

export function ErrorState({ description }: { description: string }) {
  return (
    <section className="state">
      <Alert tone="danger">{description}</Alert>
    </section>
  )
}

export function PermissionDenied() {
  return (
    <section className="state p-10 text-center flex flex-col items-center justify-center">
      <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mb-3">
        <Lock size={24} />
      </div>
      <h1 className="text-xl font-bold text-slate-900">Không có quyền truy cập</h1>
      <p className="text-sm text-slate-500 max-w-md mt-1 mb-4">Quyền cuối cùng luôn do backend xác nhận.</p>
      <Link className="button outline" to="/login">Quay lại đăng nhập</Link>
    </section>
  )
}

export function StatusBadge({ label, tone = 'neutral' }: { label: string; tone?: 'neutral' | 'info' | 'success' | 'warning' | 'danger' | 'ai' }) {
  return <Badge tone={tone}>{label}</Badge>
}

export function DemoDataBadge() {
  return <StatusBadge label="Dữ liệu demo" tone="info" />
}
