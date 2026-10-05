import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useSession } from '../providers/use-session'
import type { AppRole } from '../../types/auth'

export function RequireAuth() {
  const session = useSession(); const location = useLocation()
  if (session.status === 'loading') return <p className="state">Đang xác minh phiên làm việc…</p>
  return session.user ? <Outlet /> : <Navigate replace state={{ from: location.pathname }} to="/login" />
}
export function RequireRole({ roles }: { roles: AppRole[] }) {
  const { user } = useSession()
  return user?.roles.some((role) => roles.includes(role)) ? <Outlet /> : <section className="state"><h1>Không có quyền truy cập</h1><p>Quyền cuối cùng luôn do backend xác nhận.</p></section>
}
