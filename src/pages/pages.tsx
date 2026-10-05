import { Link, isRouteErrorResponse, useRouteError } from 'react-router-dom'
import { Alert } from '../components/ui/primitives'
import { PageHeader } from '../components/common/states'
export { LoginPage } from '../features/auth/login-page'
import type { AppRole } from '../types/auth'
export function Placeholder({ title, feature, role, description }: { title: string; feature: string; role: AppRole; description: string }) { return <section><PageHeader eyebrow={`${role} · ${feature}`} title={title} description={description} /><div className="panel"><span className="badge info">M1 foundation</span><p>Route, layout, role guard và common UI state đã sẵn sàng. Feature logic, backend data và realtime sẽ được triển khai ở milestone tiếp theo.</p></div></section> }
export function NotFound() { return <main className="auth"><PageHeader eyebrow="404 · Not found" title="Không tìm thấy trang" description="Đường dẫn không thuộc route map AIVES." /><Link className="button outline" to="/login">Về trang đăng nhập</Link></main> }
export function RouteError() { const error = useRouteError(); return isRouteErrorResponse(error) && error.status === 404 ? <NotFound /> : <main className="auth"><Alert tone="danger">Đã xảy ra lỗi khi hiển thị route.</Alert></main> }
