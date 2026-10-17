import { Link } from 'react-router-dom'
import { Clock, ShieldCheck, Video, Sparkles } from 'lucide-react'
import { Alert, Button } from '../../../components/ui/primitives'
import { StatusBadge } from '../../../components/common/states'
import type { StudentExamSlot } from '../api-student-exam-repository'

const labels: Record<StudentExamSlot['status'], string> = {
  SCHEDULED: 'Đã xếp lịch',
  READY: 'Sẵn sàng',
  IN_PROGRESS: 'Đang thi',
  COMPLETED: 'Đã hoàn tất',
  ABSENT: 'Vắng',
  CANCELLED: 'Đã hủy',
}

const time = (value: string) =>
  new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))

export function StudentPreExamView({ slot }: { slot: StudentExamSlot }) {
  const canJoin = slot.status === 'READY' || slot.status === 'IN_PROGRESS'

  return (
    <section className="source-screen max-w-6xl mx-auto space-y-6 pb-16">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 p-6 sm:p-8 text-white shadow-sm border border-slate-800">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-medium text-blue-200">
              <Sparkles size={13} className="text-amber-400" />
              <span>Cổng thí sinh · Phòng chờ vấn đáp</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {slot.examTitle}
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              {slot.courseCode} · {slot.courseName}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge
              label={labels[slot.status]}
              tone={slot.status === 'COMPLETED' ? 'success' : slot.status === 'ABSENT' ? 'danger' : 'info'}
            />
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left: Device & Pre-flight Checklist */}
        <section className="lg:col-span-7 bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs flex flex-col justify-between">
          <div>
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Video size={17} className="text-blue-600" />
                <span>Chuẩn bị thiết bị khảo thí</span>
              </h2>
              <span className="text-xs text-slate-400">Microphone &amp; Audio</span>
            </div>

            <div className="aspect-video bg-gradient-to-b from-slate-950 to-slate-900 text-slate-300 flex flex-col items-center justify-center gap-4 p-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-radial from-blue-500/10 via-transparent to-transparent opacity-50" />
              <div className="relative z-10 p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md text-blue-400">
                <ShieldCheck size={44} />
              </div>
              <p className="relative z-10 text-sm font-medium text-center text-slate-200">
                Kiểm tra micro và loa trước khi tham gia.
              </p>
              <div className="relative z-10 flex items-center gap-2 text-xs text-slate-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Hệ thống giám sát AIVES sẵn sàng kết nối</span>
              </div>
            </div>

            <div className="p-5 sm:p-6 space-y-3">
              <h3 className="text-sm font-bold text-slate-900">Hướng dẫn tham gia</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Sử dụng không gian yên tĩnh, kiểm tra kết nối và cho phép micro khi được yêu cầu. Quyền bắt đầu phiên thi phụ thuộc trạng thái hệ thống xác nhận.
              </p>
              <p className="text-xs text-slate-400">
                Camera chưa được mở. Chính sách ghi hình sẽ do hệ thống thông báo.
              </p>
            </div>
          </div>
        </section>

        {/* Right: Slot Metadata & Actions */}
        <aside className="lg:col-span-5 space-y-4">
          <section className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 flex gap-2 items-center">
              <Clock size={17} className="text-blue-600" />
              <span>Thông tin ca thi</span>
            </h2>
            <dl className="space-y-3 text-sm divide-y divide-slate-100">
              <div className="pt-1 flex justify-between items-center">
                <dt className="text-slate-500 text-xs">Ca thi</dt>
                <dd className="font-bold text-slate-900 font-mono">Ca {slot.slotNumber}</dd>
              </div>
              <div className="pt-3 flex justify-between items-center">
                <dt className="text-slate-500 text-xs">Bắt đầu</dt>
                <dd className="text-slate-700 text-xs font-medium">{time(slot.scheduledStartTime)}</dd>
              </div>
              <div className="pt-3 flex justify-between items-center">
                <dt className="text-slate-500 text-xs">Kết thúc</dt>
                <dd className="text-slate-700 text-xs font-medium">{time(slot.scheduledEndTime)}</dd>
              </div>
            </dl>
            {slot.accessCode && (
              <Alert>
                Mã truy cập: <strong>{slot.accessCode}</strong>
              </Alert>
            )}
          </section>

          <section className="bg-gradient-to-br from-blue-50/80 to-indigo-50/50 border border-blue-200/80 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs">
            <h2 className="text-sm font-bold text-blue-900">{labels[slot.status]}</h2>
            <p className="text-xs text-blue-800 leading-relaxed">
              {canJoin
                ? 'Ca thi cho phép tiếp tục kiểm tra thiết bị. Phiên vấn đáp chỉ bắt đầu sau khi hệ thống kết nối thành công.'
                : slot.status === 'SCHEDULED'
                ? 'Ca thi chưa mở. Quay lại vào thời gian được thông báo.'
                : slot.status === 'COMPLETED'
                ? 'Lượt thi đã hoàn tất. Kết quả chỉ hiển thị sau khi được công bố.'
                : 'Ca thi hiện không cho phép tham gia.'}
            </p>
            {canJoin ? (
              <Link className="button primary w-full text-center" to={`/student/exams/${slot.examId}/check`}>
                Kiểm tra thiết bị
              </Link>
            ) : (
              <Button disabled className="w-full">
                Chưa thể vào phòng thi
              </Button>
            )}
          </section>

          <div className="pt-2">
            <Link className="button outline w-full text-center" to="/student/exams">
              Về danh sách kỳ thi
            </Link>
          </div>
        </aside>
      </div>
    </section>
  )
}

