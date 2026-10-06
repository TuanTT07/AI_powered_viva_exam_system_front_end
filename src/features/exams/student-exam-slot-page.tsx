import { Link, useParams } from 'react-router-dom'
import { Alert, Button } from '../../components/ui/primitives'
import { ErrorState, LoadingPage, PermissionDenied, StatusBadge } from '../../components/common/states'
import { useSession } from '../../app/providers/use-session'
import { runtimeConfig } from '../../services/api/runtime-config'
import { useStudentMySlot } from './exam-hooks'
import { examRoutes } from './exam-routes'

const labels: Record<string, string> = { SCHEDULED: 'ĐÃ XẾP LỊCH', READY: 'SẴN SÀNG', IN_PROGRESS: 'ĐANG THI', COMPLETED: 'ĐÃ HOÀN TẤT', ABSENT: 'VẮNG', CANCELLED: 'ĐÃ HỦY' }
const tones: Record<string, 'neutral' | 'info' | 'success' | 'warning' | 'danger'> = { SCHEDULED: 'info', READY: 'info', IN_PROGRESS: 'warning', COMPLETED: 'success', ABSENT: 'danger', CANCELLED: 'neutral' }
const formatTime = (value: string) => new Intl.DateTimeFormat('vi-VN', { dateStyle: 'full', timeStyle: 'short' }).format(new Date(value))
export function StudentExamSlotPage() {
  const { examId = '' } = useParams(); const { session } = useSession(); const studentId = session.user?.roles.includes('student') ? session.user.id : undefined; const slot = useStudentMySlot(examId, studentId)
  if (session.user && !session.user.roles.includes('student')) return <PermissionDenied />
  if (runtimeConfig.dataSource === 'mock') return <section className="state"><p className="eyebrow">DỮ LIỆU DEMO</p><h1>Ca thi của tôi</h1><p>My Slot chỉ kết nối backend trong API mode.</p></section>
  if (!studentId) return <section className="state"><Alert tone="danger">Không xác định được Student UUID từ phiên đăng nhập.</Alert></section>
  if (slot.isLoading) return <LoadingPage label="Đang tải ca thi của bạn" />
  if (slot.isError) return <section className="state"><Alert tone="danger">{slot.error instanceof Error ? slot.error.message : 'Không thể tải ca thi.'}</Alert><Button onClick={() => slot.refetch()}>Thử lại</Button></section>
  if (!slot.data) return <ErrorState description="Bạn chưa được xếp ca thi hoặc ca thi không tồn tại." />
  const data = slot.data; const canJoin = data.status === 'READY' || data.status === 'IN_PROGRESS'
  return <section className="student-slot-page"><nav aria-label="Breadcrumb"><Link to="/student/exams">Kỳ thi của tôi</Link> / <span>{data.examTitle}</span></nav><header><p className="eyebrow">STUDENT · MY SLOT</p><h1>{data.examTitle}</h1><p>{data.courseCode} · {data.courseName}</p><StatusBadge label={labels[data.status]} tone={tones[data.status]} /></header><dl className="exam-detail-facts"><div><dt>Slot</dt><dd>{data.slotNumber}</dd></div><div><dt>Bắt đầu</dt><dd>{formatTime(data.scheduledStartTime)}</dd></div><div><dt>Kết thúc</dt><dd>{formatTime(data.scheduledEndTime)}</dd></div><div><dt>Trạng thái</dt><dd>{labels[data.status]}</dd></div></dl>{data.accessCode && <Alert tone="info">Mã truy cập: <strong>{data.accessCode}</strong></Alert>}{data.status === 'SCHEDULED' && <Alert tone="info">Ca thi chưa mở. Vui lòng quay lại trong thời gian được thông báo.</Alert>}{data.status === 'ABSENT' && <Alert tone="danger">Ca thi được ghi nhận vắng.</Alert>}{data.status === 'COMPLETED' && <Alert tone="success">Ca thi đã hoàn tất.</Alert>}{canJoin && <Link className="button primary" to={`/student/exams/${examId}/session`}>Vào phòng thi</Link>}{!canJoin && <Button disabled>Chưa thể vào phòng thi</Button>}{!canJoin && <Link className="button outline" to={examRoutes.list}>Về danh sách kỳ thi</Link>}</section>
}
