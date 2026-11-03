import { Link, useSearchParams } from 'react-router-dom'
import { Calendar, Clock } from 'lucide-react'
import { useSession } from '../../app/providers/use-session'
import { Button } from '../../components/ui/primitives'
import { EmptyState, ErrorState, LoadingPage, PermissionDenied, StatusBadge } from '../../components/common/states'
import { ApiError } from '../../services/api/client'
import { studentSlotStatuses, type StudentSlotStatus } from './api-student-exam-repository'
import { useStudentExams } from './exam-hooks'
import { studentExamPath } from './student-exam-navigation'
import { StudentPortalView } from './views/StudentPortalView'

const labels: Record<StudentSlotStatus, string> = { SCHEDULED: 'Đã xếp lịch', READY: 'Sẵn sàng', IN_PROGRESS: 'Đang thi', COMPLETED: 'Đã hoàn tất', ABSENT: 'Vắng', CANCELLED: 'Đã hủy' }
const time = (value: string | null) => value && Number.isFinite(Date.parse(value))
  ? new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
  : 'Chưa xếp giờ'

export function StudentSchedulePortal({ list = false }: { list?: boolean }) {
  const { session } = useSession()
  const [search, setSearch] = useSearchParams()
  const requestedPage = Number(search.get('page') ?? 0)
  const page = Number.isInteger(requestedPage) && requestedPage >= 0 ? requestedPage : 0
  const requestedSize = Number(search.get('size') ?? 20)
  const size = [20, 50, 100].includes(requestedSize) ? requestedSize : 20
  const status = studentSlotStatuses.find(value => value === search.get('status'))
  const result = useStudentExams({ page, size, ...(status ? { status } : {}) })
  const data = !result.isError && !result.isPending ? result.data : undefined

  if (!session.user) return <ErrorState description="Bạn cần đăng nhập để xem lịch thi." />
  if (!session.user.roles.includes('student') || result.error instanceof ApiError && result.error.status === 403) return <PermissionDenied />

  function change(values: { page?: number; size?: number; status?: string }) {
    setSearch(previous => {
      const next = new URLSearchParams(previous)
      for (const [key, value] of Object.entries(values)) {
        if (value === '' || key === 'page' && value === 0) next.delete(key)
        else next.set(key, String(value))
      }
      return next
    })
  }

  const panel = <div className="space-y-5">
    <div>
      <h2 className="text-base font-semibold text-slate-900">Lịch thi của tôi</h2>
      <p className="text-sm text-slate-500 mt-1">Các ca thi được phân cho tài khoản của bạn, xếp theo thời gian bắt đầu mới nhất.</p>
    </div>
    <div className="flex flex-wrap items-end gap-3">
      <label className="text-sm text-slate-700">Trạng thái
        <select aria-label="Trạng thái ca thi" className="block border border-slate-200 rounded-lg p-2 mt-1 bg-white" value={status ?? ''} onChange={event => change({ status: event.target.value, page: 0 })}>
          <option value="">Tất cả trạng thái</option>
          {studentSlotStatuses.map(value => <option key={value} value={value}>{labels[value]}</option>)}
        </select>
      </label>
      <label className="text-sm text-slate-700">Số ca mỗi trang
        <select aria-label="Số ca mỗi trang" className="block border border-slate-200 rounded-lg p-2 mt-1 bg-white" value={size} onChange={event => change({ size: Number(event.target.value), page: 0 })}>
          {[20, 50, 100].map(value => <option key={value} value={value}>{value}</option>)}
        </select>
      </label>
      <Button variant="outline" disabled={result.isFetching} onClick={() => void result.refetch()}>Làm mới</Button>
    </div>
    {result.isPending ? <LoadingPage label="Đang tải lịch thi cá nhân" /> : result.isError ? <div className="space-y-3">
      <ErrorState description={result.error.message} />
      <Button variant="outline" onClick={() => void result.refetch()}>Thử lại</Button>
    </div> : data && <>
      <p role="status" className="text-sm text-slate-500">{data.totalElements} ca thi{status ? ` · ${labels[status]}` : ''}{result.isFetching ? ' · Đang cập nhật…' : ''}</p>
      {data.content.length === 0 ? <EmptyState title={status ? 'Không có ca thi phù hợp' : 'Bạn chưa có lịch thi'} description={status ? 'Thử chọn trạng thái khác để xem các ca được phân.' : 'Lịch sẽ xuất hiện sau khi giảng viên phân ca cho bạn.'} /> : <div className="space-y-4">
        {data.content.map(slot => {
          const canJoin = slot.status === 'READY' || slot.status === 'IN_PROGRESS'
          return <article key={slot.attemptId} className="border border-slate-200 rounded-xl p-4 space-y-3 bg-white">
            <div className="flex flex-wrap justify-between gap-2">
              <span className="text-sm font-semibold text-blue-700">{slot.courseCode}</span>
              <StatusBadge label={labels[slot.status]} tone={canJoin ? 'success' : 'neutral'} />
            </div>
            <h3 className="font-semibold text-slate-900">{slot.examTitle}</h3>
            <p className="text-sm text-slate-600">{slot.courseName} · {slot.slotNumber == null ? 'Chưa phân số ca' : `Ca ${slot.slotNumber}`}</p>
            <div className="text-sm text-slate-600 space-y-1">
              <p className="flex items-center gap-2"><Calendar size={14} aria-hidden="true" />Bắt đầu: {time(slot.scheduledStartTime)}</p>
              <p className="flex items-center gap-2"><Clock size={14} aria-hidden="true" />Kết thúc: {time(slot.scheduledEndTime)}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link className="button outline" to={studentExamPath(slot.examId, slot.attemptId)}>Chi tiết ca thi</Link>
              {canJoin ? <Link className="button primary" to={studentExamPath(slot.examId, slot.attemptId, 'check')}>{slot.status === 'IN_PROGRESS' ? 'Tiếp tục vào phòng thi' : 'Kiểm tra thiết bị và vào thi'}</Link>
                : <span className="text-sm text-slate-500 self-center">{slot.status === 'SCHEDULED' ? 'Ca thi chưa mở' : 'Ca thi không còn cho phép tham gia'}</span>}
            </div>
          </article>
        })}
      </div>}
      {(data.totalElements > 0 || page > 0) && <nav aria-label="Phân trang lịch thi" className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
        <Button variant="outline" disabled={page === 0 || result.isFetching} onClick={() => change({ page: page - 1 })}>Trang trước</Button>
        <span className="text-sm text-slate-600">Trang {data.page + 1} / {Math.max(1, data.totalPages)}</span>
        <Button variant="outline" disabled={page + 1 >= data.totalPages || result.isFetching} onClick={() => change({ page: page + 1 })}>Trang sau</Button>
      </nav>}
    </>}
  </div>

  return <StudentPortalView name={session.user.displayName} apiMode list={list} apiContent={panel} assignedCount={data?.totalElements} joinableCount={data?.content.filter(slot => slot.status === 'READY' || slot.status === 'IN_PROGRESS').length} filtered={Boolean(status)} />
}
