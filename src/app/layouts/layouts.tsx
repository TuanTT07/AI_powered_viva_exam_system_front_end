import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate, useMatch } from 'react-router-dom'
import { Bell, ChevronRight, LogOut, Menu, PanelLeftClose, PanelLeftOpen, Sparkles, X } from 'lucide-react'
import { Button } from '../../components/ui/primitives'
import { useSession } from '../providers/use-session'
import type { AppRole } from '../../types/auth'
import { workspaceNavigation, workspaceTitle, workspaceNavActive } from './workspace-navigation'
import { ExamContextNav } from '../../features/exams/ExamContextNav'
import { SubjectContextNav } from '../../features/subjects/SubjectContextNav'
import { DemoLabel } from '../../components/common/inline-notice'
import { runtimeConfig } from '../../services/api/runtime-config'
import './layouts.css'

export function WorkspaceLayout({ role, title }: { role: AppRole; title: string }) {
  const { session, signOut } = useSession()
  const navigate = useNavigate()
  const location = useLocation()
  const subjectId = useMatch('/lecturer/subjects/:subjectId/*')?.params.subjectId
  const examParam = useMatch('/lecturer/exams/:examId/*')?.params.examId
  const examId = examParam === 'new' ? undefined : examParam
  const [pending, setPending] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const drawer = useRef<HTMLElement>(null)
  const menu = useRef<HTMLButtonElement>(null)
  const user = session.user
  const userRole = role === 'lecturer' ? 'Giảng viên' : role === 'admin' ? 'Quản trị viên' : 'Sinh viên'
  const initials = user?.displayName.split(/\s+/).map(part => part[0]).slice(-2).join('').toUpperCase() || 'AV'
  const groups = workspaceNavigation(role)
  const isActive = (item: Parameters<typeof workspaceNavActive>[0]) => workspaceNavActive(item, location.pathname)
  const closeMenu = () => { setMobileOpen(false); menu.current?.focus() }
  useEffect(() => {
    if (!mobileOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    drawer.current?.querySelector<HTMLButtonElement>('.shell-close')?.focus()
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setMobileOpen(false); menu.current?.focus() }
      if (event.key !== 'Tab') return
      const items = drawer.current?.querySelectorAll<HTMLElement>('a[href],button:not([disabled])')
      if (!items?.length) return
      const first = items[0], last = items[items.length - 1]
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', onKey)
    return () => { document.body.style.overflow = previousOverflow; document.removeEventListener('keydown', onKey) }
  }, [mobileOpen])
  const logout = async () => { if (pending) return; setPending(true); await signOut(); navigate('/login', { replace: true }) }
  return <div className={`source-screen source-workspace shell-${role} ${collapsed ? 'shell-collapsed' : ''}`}>
    <a className="skip" href="#main">Chuyển đến nội dung chính</a>
    <header className="shell-header">
      <div className="flex items-center gap-2.5 min-w-0 text-sm">
        <button ref={menu} className="shell-menu" aria-label="Mở menu điều hướng" aria-expanded={mobileOpen} onClick={() => setMobileOpen(true)}><Menu size={20} /></button>
        <Link className="font-semibold text-slate-500 shrink-0" to={`/${role}`}>AIVES</Link><ChevronRight size={16} className="text-slate-400 shrink-0" />
        <span className="shell-category text-slate-500">{userRole}</span><ChevronRight size={16} className="shell-category text-slate-400 shrink-0" />
        <span className="font-semibold text-slate-900 truncate">{workspaceTitle(location.pathname, title)}</span>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        {runtimeConfig.dataSource === 'mock' && <DemoLabel />}<span className="shell-role-pill"><span className="w-1.5 h-1.5 bg-blue-600 rounded-full" />{userRole}</span>
        <span className="shell-bell text-slate-400" aria-hidden="true"><Bell size={17} /></span>
        <div className="shell-profile"><span className="shell-avatar">{initials}</span><div><b>{user?.displayName || userRole}</b><small>{userRole}</small></div></div>
        <Button className="shell-logout" pending={pending} variant="outline" onClick={logout}><LogOut size={15} /><span>Đăng xuất</span></Button>
      </div>
    </header>
    <div className="shell-body">
      {mobileOpen && <button tabIndex={-1} className="shell-scrim" aria-label="Đóng menu điều hướng" onClick={closeMenu} />}
      <aside ref={drawer} className={`shell-sidebar ${mobileOpen ? 'shell-open' : ''}`} aria-label="Thanh điều hướng" {...(mobileOpen ? { role: 'dialog', 'aria-modal': true } : {})}>
        <div className="shell-sidebar-scroll">
          <div className="shell-brand-row"><Link className="shell-brand" to={`/${role}`} onClick={() => setMobileOpen(false)}><span className="shell-mark"><Sparkles size={20} /></span><span><b>AIVES <em>v2.4</em></b><small>Viva Exam System</small></span></Link><button className="shell-collapse" onClick={() => setCollapsed(value => !value)} aria-label={collapsed ? 'Mở rộng thanh bên' : 'Thu gọn thanh bên'}>{collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}</button><button className="shell-close" aria-label="Đóng menu" onClick={closeMenu}><X size={20} /></button></div>
          <nav className="shell-nav" aria-label="Điều hướng chính">{groups.map(group => <section key={group.label}><h2>{group.label}</h2><ul>{group.items.map(item => { const Icon = item.icon; return <li key={item.label}><NavLink title={collapsed ? item.label : undefined} to={item.to} end={item.end} className={() => isActive(item) ? 'active' : ''} aria-current={isActive(item) ? 'page' : false} onClick={() => setMobileOpen(false)}><Icon size={16} /><span>{item.label}</span></NavLink></li> })}</ul></section>)}</nav>
        </div>
        <div className="shell-sidebar-footer"><div><span className="shell-seal-dot" /><b>Chuẩn ABET &amp; RAG</b><p>Nền tảng khảo thí vấn đáp AIVES.</p></div></div>
      </aside>
      <main id="main" tabIndex={-1} className="shell-main">{role === 'lecturer' && examId && <ExamContextNav examId={examId} />}{role === 'lecturer' && subjectId && <SubjectContextNav subjectId={subjectId} />}<Outlet /></main>
    </div>

    <footer className="shell-footer"><div><span className="shell-footer-mark">A</span><b>AIVES</b><span>•</span><span>Nền Tảng Khảo Thí Vấn Đáp &amp; Rubric Tăng Cường AI</span></div><span>Bản quyền hệ thống © 2026</span></footer>
  </div>
}

export const LecturerLayout = () => <WorkspaceLayout role="lecturer" title="Không gian giảng viên" />
export const StudentLayout = () => <WorkspaceLayout role="student" title="Cổng thí sinh" />
export const AdminLayout = () => <WorkspaceLayout role="admin" title="Quản trị hệ thống" />
export const AuthLayout = () => <main className="auth"><Outlet /></main>
export function ExamLayout() { return <div className="exam"><header><Link className="brand" to="/student/exams">AIVES <small>Phòng thi vấn đáp</small></Link><small>Kết nối sẽ do backend xác nhận</small></header><main id="main" tabIndex={-1}><Outlet /></main></div> }
