import { Link, useSearchParams } from 'react-router-dom'
import { ArrowRight, Calendar, ChevronLeft, ChevronRight, Clock, RefreshCw } from 'lucide-react'
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

  const panel = (
    <div className="space-y-5">
      <header className="flex flex-wrap items-start justify-between gap-3">
        {data && (
          <p role="status" className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
            {data.totalElements} ca thi{status ? ` · ${labels[status]}` : ''}
          </p>
        )}
      </header>

      <div className="grid grid-cols-2 items-end gap-3 rounded-xl bg-slate-50 p-3 sm:flex sm:flex-wrap sm:p-4">
        <label className="col-span-2 min-w-0 text-xs font-medium text-slate-600 sm:flex-none">
          Trạng thái
          <select aria-label="Trạng thái ca thi" className="mt-1.5 block min-h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm sm:min-w-48" value={status ?? ''} onChange={event => change({ status: event.target.value, page: 0 })}>
            <option value="">Tất cả trạng thái</option>
            {studentSlotStatuses.map(value => <option key={value} value={value}>{labels[value]}</option>)}
          </select>
        </label>
        <label className="text-xs font-medium text-slate-600">
          Số ca mỗi trang
          <select aria-label="Số ca mỗi trang" className="mt-1.5 block min-h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" value={size} onChange={event => change({ size: Number(event.target.value), page: 0 })}>
            {[20, 50, 100].map(value => <option key={value} value={value}>{value}</option>)}
          </select>
        </label>
        <Button variant="outline" className="min-h-10 justify-self-end sm:ml-auto" disabled={result.isFetching} onClick={() => void result.refetch()}>
          <RefreshCw size={14} className={result.isFetching ? 'animate-spin motion-reduce:animate-none' : ''} aria-hidden="true" />
          {result.isFetching ? 'Đang tải…' : 'Làm mới'}
        </Button>
      </div>

      {result.isPending ? <LoadingPage label="Đang tải lịch thi cá nhân" /> : result.isError ? (
        <div className="space-y-3">
          <ErrorState description={result.error.message} />
          <Button variant="outline" onClick={() => void result.refetch()}>Thử lại</Button>
        </div>
      ) : data && <>
        {data.content.length === 0 ? (
          <EmptyState title={status ? 'Không có ca thi phù hợp' : 'Bạn chưa có lịch thi'} description={status ? 'Thử chọn trạng thái khác để xem các ca được phân.' : 'Lịch sẽ xuất hiện sau khi giảng viên phân ca cho bạn.'} />
        ) : (
          <div className="space-y-3">
            {data.content.map(slot => {
              const canJoin = slot.status === 'READY' || slot.status === 'IN_PROGRESS'
              const start = slot.scheduledStartTime && Number.isFinite(Date.parse(slot.scheduledStartTime)) ? new Date(slot.scheduledStartTime) : null
              return (
                <article key={slot.attemptId} className="overflow-hidden rounded-xl border border-slate-200 bg-white transition-colors hover:border-slate-300">
                  <div className="flex items-start gap-4 p-4 sm:gap-5 sm:p-5">
                    <div className="hidden w-16 shrink-0 rounded-xl bg-blue-50 py-3 text-center sm:block" aria-hidden="true">
                      {start ? <>
                        <span className="block text-[10px] font-semibold uppercase tracking-wider text-blue-600">Tháng {new Intl.DateTimeFormat('vi-VN', { month: '2-digit' }).format(start)}</span>
                        <span className="mt-1 block text-2xl font-bold leading-none tabular-nums text-blue-900">{new Intl.DateTimeFormat('vi-VN', { day: '2-digit' }).format(start)}</span>
                      </> : <Calendar size={24} className="mx-auto text-blue-600" />}
                    </div>
                    <div className="min-w-0 flex-1 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-semibold tracking-wide text-slate-600">{slot.courseCode}</span>
                        <StatusBadge label={labels[slot.status]} tone={canJoin ? 'success' : 'neutral'} />
                      </div>
                      <div className="space-y-1">
                        <h3 className="break-words text-base font-semibold leading-snug tracking-tight text-slate-900 sm:text-lg">{slot.examTitle}</h3>
                        <p className="break-words text-xs leading-relaxed text-slate-500">{slot.courseName} · {slot.slotNumber == null ? 'Chưa phân số ca' : `Ca ${slot.slotNumber}`}</p>
                      </div>
                      <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-600">
                        <p className="flex items-center gap-2"><Calendar size={14} className="shrink-0 text-slate-400" aria-hidden="true" />Bắt đầu: {time(slot.scheduledStartTime)}</p>
                        <p className="flex items-center gap-2"><Clock size={14} className="shrink-0 text-slate-400" aria-hidden="true" />Kết thúc: {time(slot.scheduledEndTime)}</p>
                      </div>
                    </div>
                  </div>
                  <footer className="flex flex-col gap-2 border-t border-slate-100 bg-slate-50/50 px-4 py-3 sm:flex-row sm:items-center sm:justify-end sm:gap-4 sm:px-5">
                    <Link className="inline-flex min-h-10 items-center justify-center rounded-md px-2 text-xs font-semibold text-slate-600 hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600" to={studentExamPath(slot.examId, slot.attemptId)}>Chi tiết ca thi</Link>
                    {canJoin ? (
                      <Link className="button primary min-h-10 gap-2 text-center" to={studentExamPath(slot.examId, slot.attemptId, 'check')}>
                        {slot.status === 'IN_PROGRESS' ? 'Tiếp tục vào phòng thi' : 'Kiểm tra thiết bị và vào thi'}
                        <ArrowRight size={14} aria-hidden="true" />
                      </Link>
                    ) : <span className="self-center text-xs text-slate-500">{slot.status === 'SCHEDULED' ? 'Ca thi chưa mở' : 'Ca thi không còn cho phép tham gia'}</span>}
                  </footer>
                </article>
              )
            })}
          </div>
        )}
        {(data.totalPages > 1 || page > 0) && (
          <nav aria-label="Phân trang lịch thi" className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
            <Button variant="outline" disabled={page === 0 || result.isFetching} onClick={() => change({ page: page - 1 })}><ChevronLeft size={14} aria-hidden="true" />Trang trước</Button>
            <span className="text-xs tabular-nums text-slate-500">Trang {data.page + 1} / {Math.max(1, data.totalPages)}</span>
            <Button variant="outline" disabled={page + 1 >= data.totalPages || result.isFetching} onClick={() => change({ page: page + 1 })}>Trang sau<ChevronRight size={14} aria-hidden="true" /></Button>
          </nav>
        )}
      </>}
    </div>
  )

  return <StudentPortalView name={session.user.displayName} apiMode list={list} apiContent={panel} assignedCount={data?.totalElements} joinableCount={data?.content.filter(slot => slot.status === 'READY' || slot.status === 'IN_PROGRESS').length} filtered={Boolean(status)} />
}
