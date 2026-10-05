import { Link, NavLink, Outlet } from 'react-router-dom'
import type { AppRole } from '../../types/auth'

const nav: Record<AppRole, { label: string; to: string }[]> = {
  lecturer: [{ label: 'Tổng quan', to: '/lecturer' }, { label: 'Môn học', to: '/lecturer/subjects' }, { label: 'Kỳ thi', to: '/lecturer/exams' }],
  student: [{ label: 'Tổng quan', to: '/student' }, { label: 'Kỳ thi', to: '/student/exams' }, { label: 'Kết quả', to: '/student/results' }],
  admin: [{ label: 'Tổng quan', to: '/admin' }, { label: 'Người dùng', to: '/admin/users' }, { label: 'Môn học', to: '/admin/subjects' }, { label: 'Cấu hình', to: '/admin/settings' }],
}

export function WorkspaceLayout({ role, title }: { role: AppRole; title: string }) {
  return <div className="workspace"><a className="skip" href="#main">Chuyển đến nội dung chính</a><aside><Link className="brand" to={`/${role}`}>AIVES <small>{title}</small></Link><nav aria-label="Điều hướng chính"><ul>{nav[role].map((item) => <li key={item.to}><NavLink to={item.to} end={item.to === `/${role}`}>{item.label}</NavLink></li>)}</ul></nav></aside><div><header><span>{title}</span><small>Phiên và quyền sẽ được kết nối ở M2</small></header><main id="main" tabIndex={-1}><Outlet /></main></div></div>
}
export const LecturerLayout = () => <WorkspaceLayout role="lecturer" title="Giảng viên" />
export const StudentLayout = () => <WorkspaceLayout role="student" title="Sinh viên" />
export const AdminLayout = () => <WorkspaceLayout role="admin" title="Quản trị" />
export const AuthLayout = () => <main className="auth"><Outlet /></main>
export function ExamLayout() { return <div className="exam"><header><Link className="brand" to="/student/exams">AIVES <small>Phòng thi vấn đáp</small></Link><small>Kết nối sẽ do backend xác nhận</small></header><main id="main" tabIndex={-1}><Outlet /></main></div> }
