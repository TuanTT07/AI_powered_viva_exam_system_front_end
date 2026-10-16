import { DemoLabel } from '../../components/common/inline-notice'
import { Link, useParams } from 'react-router-dom'
import { Alert, Button } from '../../components/ui/primitives'
import { ErrorState, LoadingPage, PermissionDenied } from '../../components/common/states'
import { useSession } from '../../app/providers/use-session'
import { runtimeConfig } from '../../services/api/runtime-config'
import { StudentPreExamView } from './views/StudentPreExamView'
import { SourcePageHeader } from '../../components/common/source-page'
import { useExam, useStudentMySlot } from './exam-hooks'

export function StudentExamSlotPage() {
  return runtimeConfig.dataSource === 'api' ? <ApiStudentExamSlotPage /> : <MockStudentExamSlotPage />
}
function MockStudentExamSlotPage() {
  const { examId = '' } = useParams()
  const exam = useExam(examId)
  if (exam.isPending) return <LoadingPage label="Đang tải kỳ thi demo" />
  if (exam.isError) return <section><ErrorState description={exam.error.message} /><Button onClick={() => void exam.refetch()}>Thử lại</Button></section>
  if (!exam.data) return <ErrorState description="Không tìm thấy kỳ thi demo." />
  return <section className="source-screen max-w-6xl mx-auto space-y-6 pb-12"><SourcePageHeader eyebrow="Cổng thí sinh · Phòng chờ demo" title={exam.data.title} description={`${exam.data.subjectCode} · ${exam.data.subjectName}`} actions={<Link className="button outline" to="/student/exams">Danh sách kỳ thi</Link>} /><DemoLabel detail="Dữ liệu demo · Chưa có ca thi cá nhân. Bạn có thể thử kiểm tra thiết bị và luồng vấn đáp mô phỏng." /><div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4"><h2 className="text-base font-semibold">Chuẩn bị trước phiên vấn đáp</h2><p className="text-sm text-slate-500">Kiểm tra micro, loa và kết nối. Phiên mô phỏng không tạo lượt thi hoặc kết quả chính thức.</p><Link className="button primary" to={`/student/exams/${examId}/check`}>Kiểm tra thiết bị & thử demo</Link></div></section>
}
function ApiStudentExamSlotPage() {
  const { examId = '' } = useParams(); const { session } = useSession(); const studentId = session.user?.roles.includes('student') ? session.user.id : undefined; const slot = useStudentMySlot(examId, studentId)
  if (session.user && !session.user.roles.includes('student')) return <PermissionDenied />
  if (!studentId) return <section className="state"><Alert tone="danger">Không xác định được phiên đăng nhập. Vui lòng đăng nhập lại.</Alert></section>
  if (slot.isLoading) return <LoadingPage label="Đang tải ca thi của bạn" />
  if (slot.isError) return <section className="state"><Alert tone="danger">{slot.error instanceof Error ? slot.error.message : 'Không thể tải ca thi.'}</Alert><Button onClick={() => slot.refetch()}>Thử lại</Button></section>
  if (!slot.data) return <ErrorState description="Bạn chưa được xếp ca thi hoặc ca thi không tồn tại." />
  return <StudentPreExamView slot={slot.data} />
}
