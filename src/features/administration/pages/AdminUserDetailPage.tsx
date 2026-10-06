import { Link, useNavigate, useParams } from 'react-router-dom'
import { useState } from 'react'
import { Alert, Badge, Button, Input, Skeleton } from '../../../components/ui/primitives'
import { useResetUserPassword, useUpdateUser, useUser, useUserCourses } from '../user-hooks'
import { useRoles } from '../role-hooks'

export function AdminUserDetailPage() {
  const { userId = '' } = useParams(); const navigate = useNavigate()
  const userQuery = useUser(userId); const coursesQuery = useUserCourses(userId); const rolesQuery = useRoles()
  const update = useUpdateUser(); const reset = useResetUserPassword()
  const user = userQuery.data
  const [editing, setEditing] = useState(false); const [name, setName] = useState(''); const [email, setEmail] = useState(''); const [role, setRole] = useState('LECTURER'); const [password, setPassword] = useState('')
  if (userQuery.isLoading) return <div className="page-container"><Skeleton label="Đang tải người dùng" /></div>
  if (userQuery.isError || !user) return <div className="page-container"><Alert tone="danger">Không tìm thấy tài khoản hoặc bạn không có quyền truy cập.</Alert><Link to="/admin/users">Quay lại danh sách</Link></div>
  const beginEdit = () => { setName(user.name); setEmail(user.email); setRole(user.role.toUpperCase()); setEditing(true) }
  return <div className="page-container" style={{ display: 'grid', gap: 24, maxWidth: 900 }}>
    <div><Link to="/admin/users">← Người dùng</Link><h1>{user.name}</h1><p style={{ color: 'var(--secondary)' }}>{user.identifier} · {user.email}</p></div>
    <section style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: 24, display: 'grid', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><h2 style={{ margin: 0 }}>Thông tin tài khoản</h2><Badge tone={user.role === 'admin' ? 'ai' : 'neutral'}>{user.role}</Badge></div>
      {editing ? <form onSubmit={(e) => { e.preventDefault(); update.mutate({ id: user.id, fullName: name, email, roleName: role }, { onSuccess: () => setEditing(false) }) }} style={{ display: 'grid', gap: 12 }}><Input value={name} onChange={e => setName(e.target.value)} required /><Input type="email" value={email} onChange={e => setEmail(e.target.value)} required /><select value={role} onChange={e => setRole(e.target.value)}>{(rolesQuery.data || []).map(r => <option key={r.id} value={r.roleName}>{r.roleName}</option>)}</select><div><Button type="submit" pending={update.isPending}>Lưu</Button> <Button type="button" variant="outline" onClick={() => setEditing(false)}>Hủy</Button></div></form> : <Button variant="outline" onClick={beginEdit}>Chỉnh sửa</Button>}
    </section>
    <section style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: 24, display: 'grid', gap: 12 }}><h2 style={{ margin: 0 }}>Đặt lại mật khẩu</h2><form onSubmit={(e) => { e.preventDefault(); reset.mutate({ id: user.id, newPassword: password }, { onSuccess: () => { setPassword(''); window.alert('Đã đặt lại mật khẩu') } }) }} style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}><Input type="password" minLength={6} placeholder="Mật khẩu mới (tối thiểu 6 ký tự)" value={password} onChange={e => setPassword(e.target.value)} required /><Button type="submit" pending={reset.isPending}>Đặt lại</Button></form></section>
    <section style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: 24 }}><h2>Môn học phụ trách</h2>{coursesQuery.isLoading ? <Skeleton /> : coursesQuery.data?.length ? <ul>{coursesQuery.data.map(course => <li key={course.id}><Link to={`/admin/courses/${course.id}`}>{course.code} — {course.name}</Link></li>)}</ul> : <p style={{ color: 'var(--secondary)' }}>Chưa được phân công môn học.</p>}</section>
    <Button variant="outline" onClick={() => navigate('/admin/users')}>Quay lại</Button>
  </div>
}
