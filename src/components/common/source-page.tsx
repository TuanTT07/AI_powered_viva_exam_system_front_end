import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

export function SourcePageHeader({ eyebrow, title, description, actions }: { eyebrow?: string; title: string; description?: string; actions?: ReactNode }) {
  return <header className="flex flex-col md:flex-row md:items-center justify-between gap-4"><div>{eyebrow && <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 mb-1">{eyebrow}</p>}<h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">{title}</h1>{description && <p className="text-sm text-slate-500 mt-1">{description}</p>}</div>{actions && <div className="flex flex-wrap items-center gap-2.5">{actions}</div>}</header>
}
export function SourceMetric({ label, value, detail, icon: Icon, tone = 'blue' }: { label: string; value: ReactNode; detail?: string; icon?: LucideIcon; tone?: 'blue' | 'emerald' | 'amber' | 'slate' }) {
  const colors = { blue: 'text-blue-600', emerald: 'text-emerald-600', amber: 'text-amber-600', slate: 'text-slate-900' }
  return <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs"><div className="flex items-center justify-between gap-3 text-xs font-medium text-slate-500"><span>{label}</span>{Icon && <Icon size={16} className={colors[tone]} />}</div><div className={`mt-2 text-2xl font-bold ${colors[tone]}`}>{value}</div>{detail && <p className="text-xs text-slate-500 mt-1">{detail}</p>}</div>
}
