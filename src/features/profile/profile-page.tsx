import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useSession } from '../../app/providers/use-session'
import { runtimeConfig } from '../../services/api/runtime-config'
import { apiChangePassword } from '../auth/api-auth-adapter'
import { Alert, Button, Input } from '../../components/ui/primitives'
import { SourcePageHeader } from '../../components/common/source-page'
import { DemoLabel, InlineNotice } from '../../components/common/inline-notice'
import { readDemoProfile, saveDemoProfile } from './mocks/demo-profile'

export function ProfilePage() {
  const { session } = useSession()
  const user = session.user
  return user ? <ProfileContent key={user.id} userId={user.id} name={user.displayName} role={user.roles[0]} /> : null
}
function ProfileContent({ userId, name, role }: { userId: string; name: string; role: 'student' | 'lecturer' | 'admin' }) {
  const demo = runtimeConfig.dataSource === 'mock'
  const [tab, setTab] = useState('overview')
  const [profile, setProfile] = useState(() => demo ? readDemoProfile(userId) : null)
  const [feedback, setFeedback] = useState(''), [saveError, setSaveError] = useState('')
  const [currentPassword, setCurrentPassword] = useState(''), [newPassword, setNewPassword] = useState(''), [confirmPassword, setConfirmPassword] = useState('')
  const [pending, setPending] = useState(false), [passwordError, setPasswordError] = useState(''), [passwordSuccess, setPasswordSuccess] = useState('')
  const roleLabel = { student: 'Sinh viên', lecturer: 'Giảng viên', admin: 'Quản trị viên' }[role]
  const persistPreview = (event: FormEvent) => {
    event.preventDefault(); setFeedback(''); setSaveError('')
    if (!demo || !profile) return
    try { saveDemoProfile(userId, profile); setFeedback('Đã lưu bản xem thử trên trình duyệt này. Không cập nhật hồ sơ hoặc gửi thông báo từ hệ thống.') }
    catch { setSaveError('Không thể lưu trên trình duyệt. Kiểm tra quyền lưu trữ rồi thử lại.') }
  }
  const changePassword = async (event: FormEvent) => {
    event.preventDefault(); if (pending) return
    setPasswordError(''); setPasswordSuccess('')
    if (!currentPassword) { setPasswordError('Vui lòng nhập mật khẩu hiện tại.'); return }
    if (newPassword.length < 6) { setPasswordError('Mật khẩu mới phải có tối thiểu 6 ký tự.'); return }
    if (newPassword !== confirmPassword) { setPasswordError('Mật khẩu xác nhận không khớp.'); return }
    if (demo) { setPasswordSuccess('Đã kiểm tra dữ liệu mẫu. Mật khẩu tài khoản demo không thay đổi.'); return }
    setPending(true)
    try { await apiChangePassword({ currentPassword, newPassword }); setPasswordSuccess('Đã đổi mật khẩu.'); setCurrentPassword(''); setNewPassword(''); setConfirmPassword('') }
    catch (error) { setPasswordError(error instanceof Error ? error.message : 'Không thể đổi mật khẩu. Vui lòng thử lại.') }
    finally { setPending(false) }
  }
  return <section className="source-screen max-w-5xl mx-auto space-y-5 pb-12">
    <SourcePageHeader eyebrow="Tài khoản" title="Hồ sơ & Cài đặt cá nhân" description="Thông tin định danh và bảo mật của tài khoản đang đăng nhập." />
    <nav aria-label="Các phần hồ sơ" className="resource-tabs">{[['overview', 'Thông tin tổng quan'], ['security', 'Bảo mật & Mật khẩu'], ['preferences', 'Tùy chọn & Thông báo']].map(([id, label]) => <Button key={id} variant="outline" aria-pressed={tab === id} disabled={pending} onClick={() => { setTab(id); setFeedback(''); setSaveError('') }}>{label}</Button>)}</nav>
    {tab === 'overview' && <div className="grid md:grid-cols-2 gap-5"><section className="source-card p-5 space-y-4"><h2 className="text-base font-semibold">Thông tin tài khoản</h2><dl className="grid gap-3"><div><dt className="text-xs text-slate-500">Họ và tên</dt><dd className="font-semibold">{name}</dd></div><div><dt className="text-xs text-slate-500">Mã tài khoản</dt><dd className="break-all text-sm">{userId}</dd></div><div><dt className="text-xs text-slate-500">Vai trò</dt><dd>{roleLabel}</dd></div></dl><InlineNotice>Định danh theo phiên đăng nhập. Liên hệ quản trị viên để cập nhật thông tin tài khoản.</InlineNotice></section><section className="source-card p-5 space-y-4"><h2 className="text-base font-semibold">Thiết bị & Kết nối tài khoản</h2><p className="text-sm text-slate-500">Chưa có dữ liệu xác nhận liên kết SSO, xác thực hai yếu tố hoặc lịch sử đăng nhập.</p><Link className="button outline" to="/device-check">Kiểm tra micro & loa</Link></section></div>}
    {tab === 'security' && <section className="source-card p-5 space-y-4 max-w-xl"><h2 className="text-base font-semibold">Đổi mật khẩu tài khoản học thuật</h2>{demo && <DemoLabel detail="Chỉ kiểm tra biểu mẫu; mật khẩu demo không thay đổi." />}{passwordError && <Alert tone="danger">{passwordError}</Alert>}{passwordSuccess && <Alert tone="success">{passwordSuccess}</Alert>}<form onSubmit={changePassword} className="grid gap-4" noValidate><label>Mật khẩu hiện tại<Input type="password" autoComplete="current-password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="Nhập mật khẩu hiện tại..." disabled={pending} /></label><label>Mật khẩu mới<Input type="password" autoComplete="new-password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)..." disabled={pending} /></label><label>Xác nhận mật khẩu mới<Input type="password" autoComplete="new-password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Nhập lại mật khẩu mới..." disabled={pending} /></label><Button type="submit" pending={pending}>Cập nhật mật khẩu</Button></form></section>}
    {tab === 'preferences' && <section className="source-card p-5 space-y-4 max-w-xl"><h2 className="text-base font-semibold">Tùy chọn trải nghiệm & Thông báo</h2>{demo && profile ? <><DemoLabel detail="Lưu bản xem thử trên trình duyệt, không gửi email hoặc bật tính năng âm thanh." /><p className="text-xs text-slate-500">Bản xem thử lưu trên trình duyệt này, không gửi email hay thay đổi hồ sơ chính thức.</p><form className="grid gap-4" onSubmit={persistPreview}><label>Số điện thoại mẫu<Input value={profile.phone} onChange={e => setProfile({ ...profile, phone: e.target.value })} /></label><label>Đơn vị mẫu<Input value={profile.department} onChange={e => setProfile({ ...profile, department: e.target.value })} /></label><label className="flex items-center gap-2"><input type="checkbox" checked={profile.emailReminder} onChange={e => setProfile({ ...profile, emailReminder: e.target.checked })} />Xem thử nhắc lịch thi qua email</label><label className="flex items-center gap-2"><input type="checkbox" checked={profile.resultReminder} onChange={e => setProfile({ ...profile, resultReminder: e.target.checked })} />Xem thử thông báo kết quả</label>{feedback && <Alert tone="success">{feedback}</Alert>}{saveError && <Alert tone="danger">{saveError}</Alert>}<Button type="submit">Lưu bản xem thử</Button></form></> : <InlineNotice>Hệ thống chưa hỗ trợ lưu tùy chọn thông báo và âm thanh cho tài khoản.</InlineNotice>}</section>}
  </section>
}
