import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useSession } from '../../app/providers/use-session'
import { runtimeConfig } from '../../services/api/runtime-config'
import { apiChangePassword } from '../auth/api-auth-adapter'
import { Alert, Button, Input } from '../../components/ui/primitives'
import { DemoLabel, InlineNotice } from '../../components/common/inline-notice'
import { readDemoProfile, saveDemoProfile } from './mocks/demo-profile'
import { User, ShieldCheck, Settings, Sparkles, Mic, KeyRound } from 'lucide-react'

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
    event.preventDefault()
    setFeedback('')
    setSaveError('')
    if (!demo || !profile) return
    try {
      saveDemoProfile(userId, profile)
      setFeedback('Đã lưu bản xem thử trên trình duyệt này. Không cập nhật hồ sơ hoặc gửi thông báo từ hệ thống.')
    } catch {
      setSaveError('Không thể lưu trên trình duyệt. Kiểm tra quyền lưu trữ rồi thử lại.')
    }
  }

  const changePassword = async (event: FormEvent) => {
    event.preventDefault()
    if (pending) return
    setPasswordError('')
    setPasswordSuccess('')
    if (!currentPassword) {
      setPasswordError('Vui lòng nhập mật khẩu hiện tại.')
      return
    }
    if (newPassword.length < 6) {
      setPasswordError('Mật khẩu mới phải có tối thiểu 6 ký tự.')
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Mật khẩu xác nhận không khớp.')
      return
    }
    if (demo) {
      setPasswordSuccess('Đã kiểm tra dữ liệu mẫu. Mật khẩu tài khoản demo không thay đổi.')
      return
    }
    setPending(true)
    try {
      await apiChangePassword({ currentPassword, newPassword })
      setPasswordSuccess('Đã đổi mật khẩu.')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error) {
      setPasswordError(error instanceof Error ? error.message : 'Không thể đổi mật khẩu. Vui lòng thử lại.')
    } finally {
      setPending(false)
    }
  }

  return (
    <section className="source-screen max-w-5xl mx-auto space-y-6 pb-16">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 p-6 sm:p-8 text-white shadow-sm border border-slate-800">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-medium text-blue-200">
            <Sparkles size={13} className="text-amber-400" />
            <span>Tài khoản</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Hồ sơ &amp; Cài đặt cá nhân
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Thông tin định danh và bảo mật của tài khoản đang đăng nhập.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <nav aria-label="Các phần hồ sơ" className="flex flex-wrap gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200/80 w-fit">
        {[
          ['overview', 'Thông tin tổng quan'],
          ['security', 'Bảo mật & Mật khẩu'],
          ['preferences', 'Tùy chọn & Thông báo'],
        ].map(([id, label]) => (
          <Button
            key={id}
            variant="outline"
            aria-pressed={tab === id}
            disabled={pending}
            onClick={() => { setTab(id); setFeedback(''); setSaveError('') }}
            className={`rounded-xl transition-all ${
              tab === id
                ? 'bg-white text-blue-700 shadow-xs border-slate-200 font-semibold'
                : 'bg-transparent border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            {label}
          </Button>
        ))}
      </nav>

      {tab === 'overview' && (
        <div className="grid md:grid-cols-2 gap-6">
          <section className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-7 space-y-5 shadow-xs">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
                <User size={20} />
              </div>
              <h2 className="text-base font-bold text-slate-900">Thông tin tài khoản</h2>
            </div>
            <dl className="space-y-4 text-sm divide-y divide-slate-100">
              <div className="pt-1">
                <dt className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Họ và tên</dt>
                <dd className="font-bold text-slate-900 text-base">{name}</dd>
              </div>
              <div className="pt-3">
                <dt className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Mã tài khoản</dt>
                <dd className="break-all font-mono text-sm text-slate-700 bg-slate-50 border border-slate-200/60 inline-block px-2.5 py-1 rounded-lg">
                  {userId}
                </dd>
              </div>
              <div className="pt-3">
                <dt className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Vai trò</dt>
                <dd>
                  <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/60">
                    {roleLabel}
                  </span>
                </dd>
              </div>
            </dl>
            <InlineNotice>Định danh theo phiên đăng nhập. Liên hệ quản trị viên để cập nhật thông tin tài khoản.</InlineNotice>
          </section>

          <section className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-7 space-y-5 shadow-xs flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
                  <ShieldCheck size={20} />
                </div>
                <h2 className="text-base font-bold text-slate-900">Thiết bị &amp; Kết nối tài khoản</h2>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">
                Chưa có dữ liệu xác nhận liên kết SSO, xác thực hai yếu tố hoặc lịch sử đăng nhập.
              </p>
            </div>
            <div>
              <Link className="button outline inline-flex items-center gap-2" to="/device-check">
                <Mic size={15} />
                Kiểm tra micro &amp; loa
              </Link>
            </div>
          </section>
        </div>
      )}

      {tab === 'security' && (
        <section className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-7 space-y-5 shadow-xs max-w-xl">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
              <KeyRound size={20} />
            </div>
            <h2 className="text-base font-bold text-slate-900">Đổi mật khẩu tài khoản học thuật</h2>
          </div>

          {demo && <DemoLabel detail="Chỉ kiểm tra biểu mẫu; mật khẩu demo không thay đổi." />}
          {passwordError && <Alert tone="danger">{passwordError}</Alert>}
          {passwordSuccess && <Alert tone="success">{passwordSuccess}</Alert>}

          <form onSubmit={changePassword} className="space-y-4" noValidate>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Mật khẩu hiện tại
                <Input
                  type="password"
                  autoComplete="current-password"
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  placeholder="Nhập mật khẩu hiện tại..."
                  disabled={pending}
                />
              </label>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Mật khẩu mới
                <Input
                  type="password"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)..."
                  disabled={pending}
                />
              </label>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Xác nhận mật khẩu mới
                <Input
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Nhập lại mật khẩu mới..."
                  disabled={pending}
                />
              </label>
            </div>

            <div className="pt-2">
              <Button type="submit" pending={pending}>
                Cập nhật mật khẩu
              </Button>
            </div>
          </form>
        </section>
      )}

      {tab === 'preferences' && (
        <section className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-7 space-y-5 shadow-xs max-w-xl">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="p-2.5 rounded-xl bg-violet-50 text-violet-600">
              <Settings size={20} />
            </div>
            <h2 className="text-base font-bold text-slate-900">Tùy chọn trải nghiệm &amp; Thông báo</h2>
          </div>

          {demo && profile ? (
            <>
              <DemoLabel detail="Lưu bản xem thử trên trình duyệt, không gửi email hoặc bật tính năng âm thanh." />
              <p className="text-xs text-slate-500">
                Bản xem thử lưu trên trình duyệt này, không gửi email hay thay đổi hồ sơ chính thức.
              </p>
              <form className="space-y-4" onSubmit={persistPreview}>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Số điện thoại mẫu
                    <Input value={profile.phone} onChange={e => setProfile({ ...profile, phone: e.target.value })} />
                  </label>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Đơn vị mẫu
                    <Input value={profile.department} onChange={e => setProfile({ ...profile, department: e.target.value })} />
                  </label>
                </div>
                <div className="space-y-2 pt-2">
                  <label className="flex items-center gap-2.5 text-xs text-slate-700 font-medium">
                    <input
                      type="checkbox"
                      checked={profile.emailReminder}
                      onChange={e => setProfile({ ...profile, emailReminder: e.target.checked })}
                      className="rounded text-blue-600"
                    />
                    Xem thử nhắc lịch thi qua email
                  </label>
                  <label className="flex items-center gap-2.5 text-xs text-slate-700 font-medium">
                    <input
                      type="checkbox"
                      checked={profile.resultReminder}
                      onChange={e => setProfile({ ...profile, resultReminder: e.target.checked })}
                      className="rounded text-blue-600"
                    />
                    Xem thử thông báo kết quả
                  </label>
                </div>
                {feedback && <Alert tone="success">{feedback}</Alert>}
                {saveError && <Alert tone="danger">{saveError}</Alert>}
                <div className="pt-2">
                  <Button type="submit">
                    Lưu bản xem thử
                  </Button>
                </div>
              </form>
            </>
          ) : (
            <InlineNotice>Hệ thống chưa hỗ trợ lưu tùy chọn thông báo và âm thanh cho tài khoản.</InlineNotice>
          )}
        </section>
      )}
    </section>
  )
}

