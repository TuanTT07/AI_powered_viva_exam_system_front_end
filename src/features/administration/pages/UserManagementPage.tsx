import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, Users, Edit3, Trash2, Sparkles, Filter, ChevronRight } from 'lucide-react'
import { Alert, Button, Dialog, Input } from '../../../components/ui/primitives'
import { LoadingPage } from '../../../components/common/states'
import { useCreateUser, useDeleteUser, useUpdateUser, useUsers } from '../user-hooks'
import { useRoles } from '../role-hooks'
import type { User } from '../api-user-repository'
import '../admin.css'

export function UserManagementPage() {
  const [search, setSearch] = useState('')
  const [role, setRole] = useState('all')
  const [page, setPage] = useState(1)
  const users = useUsers({ keyword: search, role, page, size: 10 })
  const create = useCreateUser()
  const update = useUpdateUser()
  const remove = useDeleteUser()
  const [editor, setEditor] = useState<User | 'new' | null>(null)
  const [target, setTarget] = useState<User | null>(null)
  const [feedback, setFeedback] = useState('')
  const pending = create.isPending || update.isPending

  const save = (draft: UserDraft) => {
    if (editor === 'new') {
      create.mutate(
        {
          fullName: draft.fullName,
          email: draft.email,
          roleName: draft.roleName,
          userCode: draft.userCode ?? '',
          password: draft.password,
        },
        {
          onSuccess: () => {
            setEditor(null)
            setFeedback('Đã tạo tài khoản mới thành công.')
          },
        }
      )
    } else if (editor) {
      update.mutate(
        { id: editor.id, fullName: draft.fullName, email: draft.email, roleName: draft.roleName },
        {
          onSuccess: () => {
            setEditor(null)
            setFeedback('Đã cập nhật tài khoản thành công.')
          },
        }
      )
    }
  }

  return (
    <section className="admin-page">
      {/* Modern Hero Header Banner matching Lecturer style */}
      <header className="admin-hero">
        <div className="admin-hero-content">
          <div className="admin-hero-badge">
            <Sparkles size={14} />
            <span>AIVES · QUẢN TRỊ TÀI KHOẢN</span>
          </div>
          <h1 className="admin-hero-title">Quản Lý Người Dùng &amp; Phân Quyền</h1>
          <p className="admin-hero-desc">
            Quản lý tài khoản học thuật, vai trò truy cập và phân quyền trong toàn hệ thống AIVES.
          </p>
        </div>

        <div className="admin-actions">
          <Button
            onClick={() => {
              create.reset()
              update.reset()
              setEditor('new')
            }}
          >
            <Plus size={16} />
            <span>Cấp tài khoản mới</span>
          </Button>
        </div>
      </header>

      {/* 3 KPI Summary Cards matching Lecturer Metric style */}
      <section className="admin-metric-grid" aria-label="Thống kê người dùng">
        <div className="metric-card metric-card--blue">
          <div className="metric-header">
            <span className="metric-label">Tổng tài khoản</span>
            <div className="metric-icon-wrap metric-icon-wrap--blue">
              <Users size={20} />
            </div>
          </div>
          <strong className="metric-value">{users.data?.totalElements ?? '—'}</strong>
          <span className="metric-hint">Tất cả tài khoản hệ thống</span>
        </div>

        <div className="metric-card metric-card--indigo">
          <div className="metric-header">
            <span className="metric-label">Đang hiển thị</span>
            <div className="metric-icon-wrap metric-icon-wrap--indigo">
              <Filter size={20} />
            </div>
          </div>
          <strong className="metric-value">{users.data?.content.length ?? '—'}</strong>
          <span className="metric-hint">Theo bộ lọc tìm kiếm</span>
        </div>

        <div className="metric-card metric-card--amber">
          <div className="metric-header">
            <span className="metric-label">Trang hiện tại</span>
            <div className="metric-icon-wrap metric-icon-wrap--amber">
              <ChevronRight size={20} />
            </div>
          </div>
          <strong className="metric-value" style={{ fontSize: '1.4rem' }}>
            {page} / {Math.max(1, users.data?.totalPages ?? 1)}
          </strong>
          <span className="metric-hint">Phân trang 10 mục/trang</span>
        </div>
      </section>

      {feedback && (
        <Alert tone="success">
          <div className="flex items-center justify-between">
            <span>{feedback}</span>
            <button
              type="button"
              onClick={() => setFeedback('')}
              className="text-xs text-emerald-800 hover:text-emerald-950 font-medium underline ml-4 cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </Alert>
      )}

      {/* Filter Toolbar Surface */}
      <div className="admin-toolbar">
        <div className="relative flex-1 min-w-[240px]">
          <Search size={16} className="absolute left-3.5 top-3.5 text-slate-400 pointer-events-none" />
          <input
            aria-label="Tìm tài khoản"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              setPage(1)
            }}
            placeholder="Tìm theo họ tên, mã cán bộ/SV, email..."
            className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-xl transition-all outline-none"
          />
        </div>
        <select
          aria-label="Lọc vai trò"
          value={role}
          onChange={(event) => {
            setRole(event.target.value)
            setPage(1)
          }}
          className="bg-slate-50/80 hover:bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-700 transition-all shrink-0 outline-none"
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
        <div className="admin-table-surface">
          <div className="overflow-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Họ Tên &amp; Mã Định Danh</th>
                  <th>Email Học Thuật</th>
                  <th>Vai Trò</th>
                  <th style={{ textAlign: 'right' }}>Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {users.data?.content.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="flex gap-3 items-center">
                        <span className="flex items-center justify-center w-10 h-10 bg-blue-50 text-blue-700 rounded-xl font-bold text-xs shrink-0">
                          {user.initials}
                        </span>
                        <div>
                          <Link
                            className="text-sm font-semibold text-slate-900 hover:text-blue-600 transition-colors"
                            to={`/admin/users/${encodeURIComponent(user.id)}`}
                          >
                            {user.name}
                          </Link>
                          <small className="block mt-0.5 text-slate-400 font-mono text-[11px]">
                            {user.identifier}
                          </small>
                        </div>
                      </div>
                    </td>
                    <td className="font-mono text-xs text-slate-600">{user.email}</td>
                    <td>
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                          user.role === 'admin'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
                            : user.role === 'lecturer'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200/60'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                        }`}
                      >
                        {user.role === 'lecturer'
                          ? 'Giảng viên'
                          : user.role === 'student'
                            ? 'Sinh viên'
                            : 'Admin'}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-2 justify-end items-center">
                        <Link
                          className="button outline button--sm"
                          to={`/admin/users/${encodeURIComponent(user.id)}`}
                        >
                          Chi tiết
                        </Link>
                        <Button
                          variant="outline"
                          aria-label={`Sửa ${user.name}`}
                          onClick={() => {
                            update.reset()
                            setEditor(user)
                          }}
                        >
                          <Edit3 size={14} />
                        </Button>
                        <Button
                          variant="outline"
                          aria-label={`Xóa ${user.name}`}
                          onClick={() => {
                            remove.reset()
                            setTarget(user)
                          }}
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
            <span>
              Trang {page} / {Math.max(1, users.data?.totalPages ?? 1)}
            </span>
            <div className="flex items-center gap-2">
              <Button variant="outline" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>
                Trước
              </Button>
              <Button
                variant="outline"
                disabled={page >= (users.data?.totalPages ?? 1)}
                onClick={() => setPage((value) => value + 1)}
              >
                Sau
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit User Dialog */}
      <Dialog
        open={Boolean(editor)}
        onClose={() => setEditor(null)}
        title={editor === 'new' ? 'Cấp tài khoản mới' : 'Chỉnh sửa tài khoản'}
      >
        <UserForm
          initial={editor === 'new' ? null : editor}
          pending={pending}
          error={create.error?.message || update.error?.message}
          onCancel={() => setEditor(null)}
          onSave={save}
        />
      </Dialog>

      {/* Delete User Confirmation Dialog */}
      <Dialog
        open={Boolean(target)}
        onClose={() => setTarget(null)}
        title="Xác nhận xóa tài khoản"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Bạn có chắc chắn muốn xóa tài khoản này?
          </p>
          {remove.error && <Alert tone="danger">{remove.error.message}</Alert>}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setTarget(null)}>
              Hủy bỏ
            </Button>
            <Button
              variant="danger"
              pending={remove.isPending}
              onClick={() => {
                if (target) {
                  remove.mutate(target.id, {
                    onSuccess: () => {
                      const deletedName = target.name
                      setTarget(null)
                      setFeedback(`Đã xóa tài khoản "${deletedName}".`)
                    },
                  })
                }
              }}
            >
              Xác nhận xóa tài khoản
            </Button>
          </div>
        </div>
      </Dialog>
    </section>
  )
}

interface UserDraft {
  fullName: string
  email: string
  roleName: string
  userCode?: string
  password?: string
}

function UserForm({
  initial,
  pending,
  error,
  onCancel,
  onSave,
}: {
  initial: User | null
  pending: boolean
  error?: string
  onCancel: () => void
  onSave: (draft: UserDraft) => void
}) {
  const [fullName, setFullName] = useState(initial?.name ?? '')
  const [email, setEmail] = useState(initial?.email ?? '')
  const [userCode, setUserCode] = useState(initial?.identifier ?? '')
  const [password, setPassword] = useState('')
  const [roleName, setRoleName] = useState(
    initial ? (initial.role === 'lecturer' ? 'LECTURER' : initial.role === 'student' ? 'STUDENT' : 'ADMIN') : 'LECTURER'
  )
  const roles = useRoles()

  const submit = (event: FormEvent) => {
    event.preventDefault()
    onSave({
      fullName,
      email,
      roleName,
      ...(initial ? {} : { userCode, password }),
    })
  }

  return (
    <form className="space-y-4" onSubmit={submit}>
      {error && <Alert tone="danger">{error}</Alert>}

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="user-fullname">
          Họ và tên
        </label>
        <Input
          id="user-fullname"
          required
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          placeholder="Ví dụ: TS. Nguyễn Văn A"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="user-email">
          Email
        </label>
        <Input
          id="user-email"
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="name@academia.edu.vn"
        />
      </div>

      {!initial && (
        <>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="user-code">
              Mã định danh
            </label>
            <Input
              id="user-code"
              required
              value={userCode}
              onChange={(event) => setUserCode(event.target.value)}
              placeholder="CB-12345 hoặc SV-2024001"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="user-password">
              Mật khẩu khởi tạo
            </label>
            <Input
              id="user-password"
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
            />
          </div>
        </>
      )}

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="user-role">
          Vai trò
        </label>
        <select
          id="user-role"
          aria-label="Vai trò"
          className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white outline-none focus:border-blue-500"
          value={roleName}
          onChange={(event) => setRoleName(event.target.value)}
        >
          {roles.data?.map((r) => (
            <option key={r.id} value={r.roleName}>
              {r.roleName}
            </option>
          )) ?? (
            <>
              <option value="LECTURER">Giảng viên</option>
              <option value="STUDENT">Sinh viên</option>
              <option value="ADMIN">Quản trị viên</option>
            </>
          )}
        </select>
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
        <Button variant="outline" type="button" onClick={onCancel}>
          Hủy
        </Button>
        <Button pending={pending} type="submit">
          {initial ? 'Lưu thay đổi' : 'Tạo tài khoản'}
        </Button>
      </div>
    </form>
  )
}
