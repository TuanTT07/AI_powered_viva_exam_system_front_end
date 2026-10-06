import { Link } from 'react-router-dom'
import { Alert, Badge, Skeleton } from '../ui/primitives'
export function PageHeader({ title, description, eyebrow }: { title: string; description: string; eyebrow?: string }) { return <header className="page-header">{eyebrow && <p className="eyebrow">{eyebrow}</p>}<h1>{title}</h1><p>{description}</p></header> }
export function LoadingPage({ label = 'Đang tải nội dung' }: { label?: string }) { return <section aria-busy="true" className="state"><Skeleton label={label} /><Skeleton label={label} /></section> }
export function EmptyState({ title, description }: { title: string; description: string }) { return <section className="state"><h2>{title}</h2><p>{description}</p></section> }
export function ErrorState({ description }: { description: string }) { return <section className="state"><Alert tone="danger">{description}</Alert></section> }
export function PermissionDenied() { return <section className="state"><h1>Không có quyền truy cập</h1><p>Quyền cuối cùng luôn do backend xác nhận.</p><Link className="button outline" to="/login">Quay lại đăng nhập</Link></section> }
export function StatusBadge({ label, tone = 'neutral' }: { label: string; tone?: 'neutral' | 'info' | 'success' | 'warning' | 'danger' | 'ai' }) { return <Badge tone={tone}>{label}</Badge> }
export function DemoDataBadge() { return <StatusBadge label="Dữ liệu demo" tone="info" /> }
