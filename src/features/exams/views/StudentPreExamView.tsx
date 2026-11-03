import { Link, useSearchParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Clock3, Headphones, Mic } from 'lucide-react'
import { Button } from '../../../components/ui/primitives'
import { StatusBadge } from '../../../components/common/states'
import type { StudentExamSlot } from '../api-student-exam-repository'
import { studentExamPath } from '../student-exam-navigation'
import '../student-pre-exam.css'

const labels: Record<StudentExamSlot['status'], string> = {
  SCHEDULED: 'Đã xếp lịch',
  READY: 'Sẵn sàng',
  IN_PROGRESS: 'Đang thi',
  COMPLETED: 'Đã hoàn tất',
  ABSENT: 'Vắng',
  CANCELLED: 'Đã hủy',
}

const time = (value: string | null) => value && Number.isFinite(Date.parse(value))
  ? new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value))
  : 'Chưa xếp giờ'

export function StudentPreExamView({ slot }: { slot: StudentExamSlot }) {
  const [search] = useSearchParams()
  const canJoin = slot.status === 'READY' || slot.status === 'IN_PROGRESS'
  const unavailableMessage = slot.status === 'SCHEDULED'
    ? 'Ca thi chưa mở. Vui lòng quay lại sau.'
    : slot.status === 'COMPLETED'
    ? 'Bài thi đã hoàn tất. Kết quả sẽ hiển thị khi được công bố.'
    : 'Ca thi hiện không cho phép tham gia.'

  return (
    <section className="source-screen pre-exam" aria-labelledby="pre-exam-title">
      <Link className="pre-exam-back" to="/student/exams">
        <ArrowLeft size={16} aria-hidden="true" /> Kỳ thi của tôi
      </Link>

      <header className="pre-exam-heading">
        <div>
          <p className="pre-exam-course">{slot.courseCode} · {slot.courseName}</p>
          <h1 id="pre-exam-title">{slot.examTitle}</h1>
        </div>
        <StatusBadge
          label={labels[slot.status]}
          tone={slot.status === 'COMPLETED' ? 'success' : slot.status === 'ABSENT' ? 'danger' : 'info'}
        />
      </header>

      <div className="pre-exam-layout">
        <section className="pre-exam-devices" aria-labelledby="pre-exam-devices-title">
          <div className="pre-exam-section-heading">
            <span className="pre-exam-step">01</span>
            <h2 id="pre-exam-devices-title">Kiểm tra thiết bị</h2>
          </div>

          <div className="pre-exam-device-preview">
            <div className="pre-exam-mic"><Mic size={32} strokeWidth={1.5} aria-hidden="true" /></div>
            <h3>Chuẩn bị micro và tai nghe</h3>
            <p>Cho phép truy cập micro ở bước tiếp theo.</p>
          </div>

          <ul className="pre-exam-device-list" aria-label="Thiết bị cần kiểm tra">
            <li><Mic size={18} aria-hidden="true" /><span>Micro</span><span>Chưa kiểm tra</span></li>
            <li><Headphones size={18} aria-hidden="true" /><span>Loa / tai nghe</span><span>Chưa kiểm tra</span></li>
          </ul>

          <div className="pre-exam-actions">
            {canJoin ? (
              <Link className="button primary" to={studentExamPath(slot.examId, slot.attemptId, 'check', search.get('questionTurnId'))}>
                Kiểm tra thiết bị <ArrowRight size={16} aria-hidden="true" />
              </Link>
            ) : (
              <>
                <p role="status">{unavailableMessage}</p>
                <Button disabled>Chưa thể vào phòng thi</Button>
              </>
            )}
          </div>
        </section>

        <aside className="pre-exam-details" aria-labelledby="pre-exam-details-title">
          <div className="pre-exam-section-heading">
            <Clock3 size={18} aria-hidden="true" />
            <h2 id="pre-exam-details-title">Thông tin ca thi</h2>
          </div>
          <dl>
            <div><dt>Ca thi</dt><dd>{slot.slotNumber == null ? 'Chưa phân ca' : `Ca ${slot.slotNumber}`}</dd></div>
            <div><dt>Bắt đầu</dt><dd>{time(slot.scheduledStartTime)}</dd></div>
            <div><dt>Kết thúc</dt><dd>{time(slot.scheduledEndTime)}</dd></div>
            {slot.accessCode && <div><dt>Mã truy cập</dt><dd className="pre-exam-code">{slot.accessCode}</dd></div>}
          </dl>
          <p className="pre-exam-note">Chọn nơi yên tĩnh và giữ kết nối mạng ổn định.</p>
        </aside>
      </div>
    </section>
  )
}
