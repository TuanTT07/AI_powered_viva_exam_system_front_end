import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, Users, Edit3, Trash2, Sparkles, Filter, ChevronRight } from 'lucide-react'
import { Alert, Button, Dialog, Input } from '../../../components/ui/primitives'
import { LoadingPage } from '../../../components/common/states'
import { useCreateUser, useDeleteUser, useUpdateUser, useUsers } from '../user-hooks'
import { useRoles } from '../role-hooks'
import type { User } from '../api-user-repository'

export function UserManagementPage() {
  const [search, setSearch] = useState(''), [role, setRole] = useState('all'), [page, setPage] = useState(1)
  const users = useUsers({ keyword: search, role, page, size: 10 }), create = useCreateUser(), update = useUpdateUser(), remove = useDeleteUser()
  const [editor, setEditor] = useState<User | 'new' | null>(null), [target, setTarget] = useState<User | null>(null), [feedback, setFeedback] = useState('')
  const pending = create.isPending || update.isPending

  const save = (draft: UserDraft) => {
    if (editor === 'new') create.mutate(draft, { onSuccess: () => { setEditor(null); setFeedback('Đã tạo tài khoản.') } })
    else if (editor) update.mutate({ id: editor.id, fullName: draft.fullName, email: draft.email, roleName: draft.roleName }, { onSuccess: () => { setEditor(null); setFeedback('Đã cập nhật tài khoản.') } })
  }

  return (
    <section className="source-screen max-w-7xl mx-auto space-y-6 pb-16">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 p-6 sm:p-8 text-white shadow-sm border border-slate-800">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-medium text-blue-200">
              <Sparkles size={13} className="text-amber-400" />
              <span>Quản trị tài khoản</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Quản Lý Người Dùng &amp; Phân Quyền
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Tài khoản học thuật và vai trò truy cập trong hệ thống AIVES.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={() => { create.reset(); update.reset(); setEditor('new') }}>
              <Plus size={16} />
              Cấp tài khoản mới
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">TỔNG TÀI KHOẢN</span>
            <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Users size={18} />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 font-mono">
              {users.data?.totalElements ?? '—'}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Tất cả tài khoản hệ thống</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">ĐANG HIỂN THỊ</span>
            <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Filter size={18} />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-indigo-600 font-mono">
              {users.data?.content.length ?? '—'}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Theo bộ lọc tìm kiếm</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">TRANG HIỆN TẠI</span>
            <span className="p-2 rounded-xl bg-violet-50 text-violet-600">
              <ChevronRight size={18} />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-violet-600 font-mono">
              {page} / {Math.max(1, users.data?.totalPages ?? 1)}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Phân trang 10 mục/trang</p>
          </div>
        </div>
      </div>

      {feedback && <Alert tone="success">{feedback}</Alert>}

      {/* Filter Toolbar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex flex-col sm:flex-row gap-3 shadow-xs">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-3.5 text-slate-400 pointer-events-none" />
          <input
            aria-label="Tìm tài khoản"
            value={search}
            onChange={event => { setSearch(event.target.value); setPage(1) }}
            placeholder="Tìm theo họ tên, mã cán bộ/SV, email..."
            className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-xl transition-all"
          />
        </div>
        <select
          aria-label="Lọc vai trò"
          value={role}
          onChange={event => { setRole(event.target.value); setPage(1) }}
          className="bg-slate-50/80 hover:bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-700 transition-all shrink-0"
        >
          <option value="all">Tất cả vai trò</option>
          <option value="admin">Admin</option>
          <option value="lecturer">Giảng viên</option>
          <option value="student">Sinh viên</option>
        </select>
      </div>

      {/* Table Surface */}
      {users.isLoading ? (
        <LoadingPage label="Đang tải tài khoản" />
      ) : users.isError ? (
        <section className="state">
          <Alert tone="danger">Không thể tải danh sách tài khoản.</Alert>
          <div className="mt-2">
            <Button onClick={() => users.refetch()}>Thử lại</Button>
          </div>
        </section>
      ) : (
        <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-auto">
            <table className="w-full min-w-[700px] text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 uppercase text-[11px] tracking-wider font-semibold">
                <tr>
                  <th className="px-5 py-3.5">Họ Tên &amp; Mã Định Danh</th>
                  <th className="px-5 py-3.5">Email Học Thuật</th>
                  <th className="px-5 py-3.5">Vai Trò</th>
                  <th className="px-5 py-3.5 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.data?.content.map(user => (
                  <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex gap-3 items-center">
                        <span className="flex items-center justify-center w-10 h-10 bg-blue-50 text-blue-700 rounded-xl font-bold text-xs shrink-0">
                          {user.initials}
                        </span>
                        <div>
                          <Link className="text-sm font-semibold text-slate-900 hover:text-blue-600 transition-colors" to={`/admin/users/${encodeURIComponent(user.id)}`}>
                            {user.name}
                          </Link>
                          <small className="block mt-0.5 text-slate-400 font-mono text-[11px]">
                            {user.identifier}
                          </small>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-600 font-mono text-xs">
                      {user.email}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                        user.role === 'admin'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
                          : user.role === 'lecturer'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200/60'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                      }`}>
                        {user.role === 'lecturer' ? 'Giảng viên' : user.role === 'student' ? 'Sinh viên' : 'Admin'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2 justify-end items-center">
                        <Link className="button outline" to={`/admin/users/${encodeURIComponent(user.id)}`}>
                          Chi tiết
                        </Link>
                        <Button
                          variant="outline"
                          aria-label={`Sửa ${user.name}`}
                          onClick={() => { update.reset(); setEditor(user) }}
                        >
                          <Edit3 size={14} />
                        </Button>
                        <Button
                          variant="outline"
                          aria-label={`Xóa ${user.name}`}
                          onClick={() => { remove.reset(); setTarget(user) }}
                        >
                          <Trash2 size={14} className="text-rose-600" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!users.data?.content.length && (
                  <tr>
                    <td colSpan={4} className="p-12 text-center text-slate-500">
                      Không tìm thấy tài khoản.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="flex justify-between items-center gap-3 px-5 py-4 border-t border-slate-100 text-xs text-slate-500 bg-slate-50/50">
            <span>Trang {page} / {Math.max(1, users.data?.totalPages ?? 1)}</span>
            <div className="flex items-center gap-2">
              <Button variant="outline" disabled={page <= 1} onClick={() => setPage(value => value - 1)}>
                Trước
              </Button>
              <Button variant="outline" disabled={page >= (users.data?.totalPages ?? 1)} onClick={() => setPage(value => value + 1)}>
                Sau
              </Button>
            </div>
          </div>
        </div>
      )}

      {editor && (
        <UserEditor
          key={editor === 'new' ? 'new' : editor.id}
          user={editor === 'new' ? null : editor}
          pending={pending}
          error={create.error ?? update.error}
          onSave={save}
          onClose={() => { if (!pending) setEditor(null) }}
        />
      )}

      <Dialog
        open={Boolean(target)}
        onClose={() => { if (!remove.isPending) setTarget(null) }}
        title="Xóa tài khoản?"
      >
        <p className="text-sm text-slate-600">
          Xóa tài khoản “{target?.name}”? Tài khoản có dữ liệu thi, câu hỏi hoặc chấm điểm có thể không được phép xóa.
        </p>
        {remove.isError && <Alert tone="danger">{remove.error.message}</Alert>}
        <div className="dialog-actions">
          <Button variant="outline" disabled={remove.isPending} onClick={() => setTarget(null)}>
            Hủy
          </Button>
          <Button
            variant="danger"
            pending={remove.isPending}
            onClick={() => target && remove.mutate(target.id, { onSuccess: () => { setTarget(null); setFeedback('Đã xóa tài khoản.') } })}
          >
            Xóa tài khoản
          </Button>
        </div>
      </Dialog>
    </section>
  )
}

type UserDraft = { fullName: string; email: string; roleName: string; userCode: string; password?: string }

function UserEditor({ user, pending, error, onSave, onClose }: { user: User | null; pending: boolean; error: Error | null; onSave: (draft: UserDraft) => void; onClose: () => void }) {
  const roles = useRoles()
  const [name, setName] = useState(user?.name ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [role, setRole] = useState(user?.role.toUpperCase() ?? 'LECTURER')
  const [code, setCode] = useState(user?.identifier ?? '')
  const [password, setPassword] = useState('')

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (!pending) {
      onSave({
        fullName: name.trim(),
        email: email.trim(),
        roleName: role,
        userCode: code.trim(),
        ...(!user ? { password } : {})
      })
    }
  }

  return (
    <Dialog open onClose={onClose} title={user ? 'Chỉnh sửa tài khoản' : 'Cấp tài khoản mới'}>
      <form className="grid gap-4 mt-4" onSubmit={submit}>
        <label>
          Họ và tên
          <Input required value={name} onChange={event => setName(event.target.value)} />
        </label>
        <label>
          Email
          <Input required type="email" value={email} onChange={event => setEmail(event.target.value)} />
        </label>
        <label>
          Mã định danh
          <Input required readOnly={Boolean(user)} value={code} onChange={event => setCode(event.target.value)} />
        </label>
        <label>
          Vai trò
          <select
            aria-label="Vai trò"
            disabled={roles.isLoading || roles.isError}
            value={role}
            onChange={event => setRole(event.target.value)}
            className="w-full border border-slate-200 rounded-lg p-2 mt-1"
          >
            {roles.data?.map(item => (
              <option key={item.id} value={item.roleName}>{item.roleName}</option>
            ))}
          </select>
        </label>
        {roles.isError && (
          <Alert tone="danger">
            Không thể tải vai trò.{' '}
            <Button type="button" onClick={() => roles.refetch()}>
              Thử lại
            </Button>
          </Alert>
        )}
        {!user && (
          <label>
            Mật khẩu khởi tạo
            <Input
              required
              type="password"
              minLength={6}
              autoComplete="new-password"
              value={password}
              onChange={event => setPassword(event.target.value)}
            />
          </label>
        )}
        {error && <Alert tone="danger">{error.message}</Alert>}
        <div className="dialog-actions">
          <Button type="button" variant="outline" disabled={pending} onClick={onClose}>
            Hủy
          </Button>
          <Button type="submit" pending={pending} disabled={roles.isLoading || roles.isError}>
            Lưu tài khoản
          </Button>
        </div>
      </form>
    </Dialog>
  )
}

