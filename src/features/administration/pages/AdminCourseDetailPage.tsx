import { Link, useNavigate, useParams } from 'react-router-dom'
import { useState } from 'react'
import { Alert, Badge, Button, Skeleton } from '../../../components/ui/primitives'
import { useAssignLecturer, useCourse, useCourseLecturers, useDeleteCourse, useRemoveLecturer } from '../course-hooks'
import { useUsers } from '../user-hooks'

export function AdminCourseDetailPage() {
  const { courseId = '' } = useParams(); const navigate = useNavigate(); const courseQuery = useCourse(courseId); const lecturersQuery = useCourseLecturers(courseId); const usersQuery = useUsers({ role: 'lecturer', size: 100 }); const assign = useAssignLecturer(); const remove = useRemoveLecturer(); const del = useDeleteCourse(); const [selected, setSelected] = useState('')
  const course = courseQuery.data; if (courseQuery.isLoading) return <div className="page-container"><Skeleton /></div>; if (courseQuery.isError || !course) return <div className="page-container"><Alert tone="danger">Không tìm thấy môn học hoặc bạn không có quyền truy cập.</Alert><Link to="/admin/courses">Quay lại</Link></div>
  const lecturers = lecturersQuery.data || course.lecturers
  const available = (usersQuery.data?.content || []).filter(u => !lecturers.some(l => l.id === u.id))
  return <div className="page-container" style={{ display: 'grid', gap: 24, maxWidth: 1000 }}><div><Link to="/admin/courses">← Môn học</Link><h1>{course.name}</h1><p style={{ color: 'var(--secondary)' }}>{course.code} · {course.department}</p></div>
    <section style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: 24 }}><h2>Giảng viên phụ trách</h2>{lecturers.length ? <ul>{lecturers.map(l => <li key={l.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}><span><Badge tone="info">{l.initials}</Badge> {l.name} {l.email && <small>({l.email})</small>}</span><Button variant="outline" onClick={() => remove.mutate({ courseId, lecturerId: l.id })} pending={remove.isPending}>Gỡ</Button></li>)}</ul> : <p>Chưa có giảng viên.</p>}
    <div style={{ display: 'flex', gap: 8, marginTop: 16 }}><select value={selected} onChange={e => setSelected(e.target.value)}><option value="">Chọn giảng viên để phân công</option>{available.map(u => <option key={u.id} value={u.id}>{u.name} · {u.email}</option>)}</select><Button disabled={!selected} onClick={() => assign.mutate({ courseId, lecturerId: selected }, { onSuccess: () => setSelected('') })} pending={assign.isPending}>Phân công</Button></div></section>
    <section style={{ display: 'flex', gap: 8 }}><Button variant="outline" onClick={() => navigate(`/admin/courses?edit=${courseId}`)}>Chỉnh sửa môn học</Button><Button variant="danger" onClick={() => { if (window.confirm('Xóa môn học này?')) del.mutate(courseId, { onSuccess: () => navigate('/admin/courses') }) }} pending={del.isPending}>Xóa môn học</Button></section>
  </div>
}
