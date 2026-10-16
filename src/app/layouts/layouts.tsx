import { Link, NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { LayoutDashboard, BookOpen, FileText, LogOut } from 'lucide-react'
import { Button } from '../../components/ui/primitives'
import { useSession } from '../providers/use-session'
import './layouts.css'
import type { AppRole } from '../../types/auth'

const nav: Record<AppRole, { label: string; to: string }[]> = {
  lecturer: [{ label: 'Tổng quan', to: '/lecturer' }, { label: 'Môn học', to: '/lecturer/subjects' }, { label: 'Kỳ thi', to: '/lecturer/exams' }],
  student: [{ label: 'Tổng quan', to: '/student' }, { label: 'Kỳ thi', to: '/student/exams' }, { label: 'Kết quả', to: '/student/results' }],
  admin: [{ label: 'Tổng quan', to: '/admin' }, { label: 'Người dùng', to: '/admin/users' }, { label: 'Môn học', to: '/admin/courses' }, { label: 'Cấu hình', to: '/admin/settings' }],
}

export function WorkspaceLayout({ role, title }: { role: AppRole; title: string }) {
  const { session, signOut } = useSession(); const navigate = useNavigate(); const [pending, setPending] = useState(false)
  const logout = async () => { if (pending) return; setPending(true); await signOut(); navigate('/login', { replace: true }) }
  const user = session.user; const initials = user?.displayName.split(/\s+/).map(part => part[0]).slice(-2).join('').toUpperCase() || 'AV'; const roleLabel = role === 'lecturer' ? 'Giảng viên' : role === 'admin' ? 'Quản trị' : 'Sinh viên'
  return <div className="workspace"><a className="skip" href="#main">Chuyển đến nội dung chính</a><aside><Link className="brand" to={`/${role}`}>AIVES <small>{title}</small></Link><nav aria-label="Điều hướng chính"><ul>{nav[role].map((item) => <li key={item.to}><NavLink to={item.to} end={item.to === `/${role}`}>{item.label}</NavLink></li>)}</ul></nav><div className="workspace-account"><span className="workspace-avatar" aria-hidden="true">{initials}</span><span><strong>{user?.displayName || roleLabel}</strong><small>{roleLabel}</small></span></div></aside><div><header className="workspace-header"><div><strong>{title}</strong>{user && <small className="workspace-user">{roleLabel}</small>}</div><div><Button className="workspace-logout" onClick={logout} pending={pending} variant="outline">Đăng xuất</Button></div></header><main id="main" tabIndex={-1}><Outlet /></main></div></div>
}

export function StudentLayout() {
  const { session, signOut } = useSession()
  const navigate = useNavigate()
  const location = useLocation()
  const [pending, setPending] = useState(false)

  const logout = async () => {
    if (pending) return
    setPending(true)
    await signOut()
    navigate('/login', { replace: true })
  }

  const user = session.user
  const displayName = user?.displayName || 'Phúc Đạt'
  const initials = 'VD'

  const currentTitle = location.pathname.includes('/exams')
    ? 'Kỳ thi'
    : location.pathname.includes('/results')
      ? 'Kết quả'
      : 'Tổng quan'

  const navItems = [
    { label: 'Tổng quan', to: '/student', icon: LayoutDashboard, end: true },
    { label: 'Kỳ thi', to: '/student/exams', icon: BookOpen, end: false },
    { label: 'Kết quả', to: '/student/results', icon: FileText, end: false },
  ]

  return (
    <div className="min-h-screen bg-[var(--bg)] font-sans flex text-[var(--text)]">
      <a className="skip" href="#main">Chuyển đến nội dung chính</a>

      {/* Sidebar (Fixed/Sticky) */}
      <aside className="w-64 bg-[var(--muted)] border-r border-[var(--border)] flex flex-col justify-between shrink-0 h-screen sticky top-0 z-20">
        <div className="p-6">
          <Link to="/student" className="block mb-8">
            <span className="text-2xl font-bold text-[var(--navy-dark)] tracking-tight">AIVES</span>
            <span className="block text-xs font-semibold text-[var(--secondary)] uppercase tracking-wider mt-0.5">Sinh viên</span>
          </Link>
          <nav aria-label="Điều hướng chính">
            <ul className="space-y-1.5 p-0 m-0 list-none">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      end={item.end}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm transition-colors ${
                          isActive
                            ? 'bg-[var(--navy)] text-white font-semibold shadow-xs'
                            : 'text-[var(--secondary)] hover:bg-black/5 hover:text-[var(--text)] font-medium'
                        }`
                      }
                    >
                      <Icon className="w-5 h-5 shrink-0" />
                      <span>{item.label}</span>
                    </NavLink>
                  </li>
                )
              })}
            </ul>
          </nav>
        </div>

        {/* Bottom Profile */}
        <div className="p-4 border-t border-[var(--border)] bg-[var(--muted)]">
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="w-10 h-10 rounded-full bg-[var(--navy)] text-white font-bold flex items-center justify-center text-sm shadow-xs shrink-0">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-[var(--navy-dark)] truncate">{displayName}</div>
              <div className="text-xs text-[var(--secondary)]">Sinh viên</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="bg-[var(--surface)] border-b border-[var(--border)] px-8 py-4 flex items-center justify-between sticky top-0 z-10 shadow-xs">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-[var(--secondary)] font-medium">Sinh viên</span>
            <span className="text-[var(--border)]">/</span>
            <span className="text-[var(--navy-dark)] font-semibold">{currentTitle}</span>
          </div>
          <div>
            <Button
              className="workspace-logout inline-flex items-center gap-2 text-[var(--secondary)] hover:text-[var(--danger)] border border-[var(--border)] hover:border-[var(--danger)] rounded-lg px-3.5 py-1.5 text-sm transition-colors shadow-xs"
              onClick={logout}
              pending={pending}
              variant="outline"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              <span>Đăng xuất</span>
            </Button>
          </div>
        </header>

        <main id="main" tabIndex={-1} className="flex-1 p-8 focus:outline-none">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export const LecturerLayout = () => <WorkspaceLayout role="lecturer" title="Giảng viên" />
export const AdminLayout = () => <WorkspaceLayout role="admin" title="Quản trị" />
export const AuthLayout = () => <main className="auth"><Outlet /></main>
export function ExamLayout() {
  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col">
      <header className="bg-[var(--surface)] border-b border-[var(--border)] px-6 lg:px-12 py-3.5 flex items-center justify-between sticky top-0 z-20 shadow-xs">
        <Link className="flex items-center gap-3 no-underline" to="/student/exams">
          <span className="font-serif text-2xl font-bold tracking-tight text-[var(--navy-dark)]">AIVES</span>
          <span className="hidden sm:inline-block w-px h-5 bg-[var(--border)]" />
          <span className="hidden sm:inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[var(--soft)]/50 text-[var(--navy)] border border-indigo-100/70">
            Phòng thi Vấn đáp Trực tiếp
          </span>
        </Link>
        <div className="flex items-center gap-2.5 text-xs font-medium text-stone-600 bg-[var(--muted)]/50 px-3 py-1.5 rounded-full border border-[var(--border)]">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Hệ thống Viva AI: Kết nối an toàn</span>
        </div>
      </header>
      <main id="main" tabIndex={-1} className="flex-1 w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 focus:outline-none">
        <Outlet />
      </main>
    </div>
  )
}
