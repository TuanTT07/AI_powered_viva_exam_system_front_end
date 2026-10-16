import type { ReactNode } from 'react'
import { Info, FlaskConical } from 'lucide-react'
export function InlineNotice({ children }: { children: ReactNode }) {
  return <div className="inline-notice" role="note"><Info size={16} aria-hidden="true" /><div>{children}</div></div>
}
export function DemoLabel({ label = 'Dữ liệu mẫu', detail = 'Dữ liệu mô phỏng để xem giao diện; không phải dữ liệu thi chính thức.' }: { label?: string; detail?: string }) {
  return <span className="demo-label" title={detail}><FlaskConical size={13} aria-hidden="true" />{label}</span>
}
