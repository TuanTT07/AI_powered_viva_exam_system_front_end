import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Button } from '../../components/ui/primitives'
import { useSession } from '../providers/use-session'
import './layouts.css'
import type { AppRole } from '../../types/auth'

const nav: Record<AppRole, { label: string; to: string }[]> = {
  lecturer: [{ label: 'Tổng quan', to: '/lecturer' }, { label: 'Môn học', to: '/lecturer/subjects' }, { label: 'Rubric', to: '/lecturer/rubrics' }, { label: 'Kỳ thi', to: '/lecturer/exams' }],
  student: [{ label: 'Tổng quan', to: '/student' }, { label: 'Kỳ thi', to: '/student/exams' }, { label: 'Kết quả', to: '/student/results' }],
  admin: [{ label: 'Tổng quan', to: '/admin' }, { label: 'Người dùng', to: '/admin/users' }, { label: 'Môn học', to: '/admin/subjects' }, { label: 'Cấu hình', to: '/admin/settings' }],
}

export function WorkspaceLayout({ role, title }: { role: AppRole; title: string }) {
  const { session, signOut } = useSession(); const navigate = useNavigate(); const [pending, setPending] = useState(false)
  const logout = async () => { if (pending) return; setPending(true); await signOut(); navigate('/login', { replace: true }) }
  const user = session.user
  return <div className="workspace"><a className="skip" href="#main">Chuyển đến nội dung chính</a><aside><Link className="brand" to={`/${role}`}>AIVES <small>{title}</small></Link><nav aria-label="Điều hướng chính"><ul>{nav[role].map((item) => <li key={item.to}><NavLink to={item.to} end={item.to === `/${role}`}>{item.label}</NavLink></li>)}</ul></nav></aside><div><header className="workspace-header"><div><strong>{title}</strong>{user && <small className="workspace-user">{user.displayName} · {title}</small>}</div><div>{role === 'lecturer' && <Link className="button outline" to="/lecturer/rubrics">Rubric</Link>}<Button className="workspace-logout" onClick={logout} pending={pending} variant="outline">Đăng xuất</Button></div></header><main id="main" tabIndex={-1}><Outlet /></main></div></div>
}
export const LecturerLayout = () => <WorkspaceLayout role="lecturer" title="Giảng viên" />
export const StudentLayout = () => <WorkspaceLayout role="student" title="Sinh viên" />
export const AdminLayout = () => <WorkspaceLayout role="admin" title="Quản trị" />
export const AuthLayout = () => <main className="auth"><Outlet /></main>
export function ExamLayout() { return <div className="exam"><header><Link className="brand" to="/student/exams">AIVES <small>Phòng thi vấn đáp</small></Link><small>Kết nối sẽ do backend xác nhận</small></header><main id="main" tabIndex={-1}><Outlet /></main></div> }
