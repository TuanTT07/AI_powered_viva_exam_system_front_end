import { Link, useNavigate, useParams } from 'react-router-dom'
import { useState } from 'react'
import { Alert, Button, Dialog, Progress, Skeleton } from '../../components/ui/primitives'
import { ErrorState, LoadingPage, PermissionDenied, StatusBadge } from '../../components/common/states'
import { useSession } from '../../app/providers/use-session'
import { useQuestions } from '../question-bank/question-hooks'
import { useDeleteExam, useExam, useExamQuestionConfig, useExamRoster, useExamSchedule, useUpdateExamStatus } from './exam-hooks'
import { examRoutes } from './exam-routes'
import { examStatusMeta } from './exam-types'
import { evaluateBasicInformation, evaluateExamReadiness, evaluateQuestionConfig, evaluateRoster, evaluateSchedule, type ReadinessSection, type ReadinessStatus } from './exam-readiness'
import './exam-detail.css'

const formatTime = (value: string) => new Intl.DateTimeFormat('vi-VN', { dateStyle: 'full', timeStyle: 'short' }).format(new Date(value))
const statusMeta: Record<ReadinessStatus, { label: string; tone: 'neutral' | 'info' | 'success' | 'warning' | 'danger' }> = { COMPLETE: { label: 'HOÀN TẤT', tone: 'success' }, INCOMPLETE: { label: 'CHƯA HOÀN TẤT', tone: 'warning' }, WARNING: { label: 'CẦN RÀ SOÁT', tone: 'warning' }, UNAVAILABLE: { label: 'CHƯA XÁC NHẬN', tone: 'danger' } }

export function ExamDetailPage() {
  const { examId = '' } = useParams()
  const navigate = useNavigate()
  const { session } = useSession()
  const exam = useExam(examId)
  const roster = useExamRoster(examId)
  const schedule = useExamSchedule(examId)
  const config = useExamQuestionConfig(examId)
  const questions = useQuestions(exam.data?.subjectId ?? '')
  const remove = useDeleteExam(); const statusUpdate = useUpdateExamStatus(); const [deleteOpen, setDeleteOpen] = useState(false); const [nextStatus, setNextStatus] = useState<import('./exam-types').ExamStatus | null>(null)
  if (session.user && !session.user.roles.includes('lecturer')) return <PermissionDenied />
  if (exam.isLoading) return <LoadingPage label="Đang tải tổng quan kỳ thi" />
  if (exam.isError) return <section className="state exam-detail-state"><Alert tone="danger">Không thể tải tổng quan kỳ thi.</Alert><Button onClick={() => { void exam.refetch() }}>Thử lại</Button></section>
  if (!exam.data) return <ErrorState description="Không tìm thấy kỳ thi hoặc kỳ thi không còn thuộc phạm vi phụ trách." />
  const examData = exam.data
  const sections = [
    evaluateBasicInformation(examData),
    evaluateRoster(roster.data, roster.isError),
    evaluateSchedule(examData, roster.data, schedule.data, schedule.isError),
    evaluateQuestionConfig(examData, config.data, questions.data, config.isError || questions.isError),
  ]
  const readiness = evaluateExamReadiness(sections)
  const editable = examData.status === 'DRAFT' || examData.status === 'SCHEDULED'
  const nextStatuses: Record<import('./exam-types').ExamStatus, import('./exam-types').ExamStatus[]> = { DRAFT: ['PUBLISHED', 'CANCELLED'], PUBLISHED: ['IN_PROGRESS', 'CANCELLED'], SCHEDULED: ['IN_PROGRESS', 'CANCELLED'], IN_PROGRESS: ['COMPLETED', 'CANCELLED'], COMPLETED: [], CANCELLED: [] }
  const retryAll = () => { void roster.refetch(); void schedule.refetch(); void config.refetch(); void questions.refetch() }
  return <section className="exam-detail-page">
    <nav className="exam-detail-breadcrumb" aria-label="Breadcrumb"><Link to={examRoutes.list}>Kỳ thi vấn đáp</Link><span aria-hidden="true">/</span><span>{examData.id}</span></nav>
    <header className="exam-detail-head"><div><p className="eyebrow">EXAMS · OVERVIEW</p><h1>{examData.title}</h1><p>{examData.subjectCode} · {examData.subjectName}</p></div><div className="exam-detail-head-actions"><StatusBadge label={examStatusMeta[examData.status].label} tone={examStatusMeta[examData.status].tone} />{editable && <Link className="button outline" to={examRoutes.edit(examId)}>Sửa cấu hình</Link>}<Link className="button primary" to={examRoutes.monitor(examId)}>Giám sát & Nhật ký</Link>{['DRAFT', 'PUBLISHED', 'SCHEDULED'].includes(examData.status) && <Button type="button" variant="danger" onClick={() => setDeleteOpen(true)}>Xóa kỳ thi</Button>}</div></header>
    {!editable && <Alert tone="warning"><strong>Chế độ chỉ đọc.</strong> Kỳ thi {examStatusMeta[examData.status].label.toLocaleLowerCase()} không thể thay đổi cấu hình. Bạn vẫn có thể xem các phần đã lưu.</Alert>}
    <dl className="exam-detail-facts"><div><dt>Bắt đầu</dt><dd>{formatTime(examData.scheduledAt)}</dd></div><div><dt>Thời lượng / sinh viên</dt><dd>{examData.durationMinutes} phút</dd></div><div><dt>Câu hỏi chính</dt><dd>{examData.mainQuestionCount}</dd></div><div><dt>Đào sâu tối đa</dt><dd>{examData.maxFollowUpCount}</dd></div></dl>
    <section className={`exam-readiness ${readiness.ready ? 'ready' : ''}`} aria-labelledby="readiness-heading"><div><p className="eyebrow">TIẾN ĐỘ THI</p><h2 id="readiness-heading">{readiness.ready ? 'Kỳ thi đã sẵn sàng' : 'Hoàn tất thiết lập kỳ thi'}</h2><p>{readiness.ready ? 'Các bước chuẩn bị đã hoàn tất. Bạn có thể chuyển sang công bố hoặc giám sát kỳ thi.' : `${readiness.completedCount} / ${sections.length} bước đã hoàn tất.`}</p></div><Progress label={`${readiness.completedCount}/${sections.length} hoàn tất`} value={readiness.completedCount} max={sections.length} /></section>
    {readiness.blockingIssues.length > 0 && <Alert tone="warning"><strong>Cần hoàn tất</strong><ul>{readiness.blockingIssues.slice(0, 4).map((issue) => <li key={issue}>{issue}</li>)}</ul></Alert>}
    {readiness.warnings.length > 0 && <Alert tone="warning"><strong>Cần rà soát</strong><ul>{readiness.warnings.map((issue) => <li key={issue}>{issue}</li>)}</ul></Alert>}
    {nextStatuses[examData.status].length > 0 && <section className="exam-detail-status-actions" aria-label="Chuyển trạng thái"><h2>Trạng thái kỳ thi</h2><div className="dialog-actions">{nextStatuses[examData.status].map((status) => <Button key={status} type="button" variant={status === 'CANCELLED' ? 'danger' : 'outline'} disabled={statusUpdate.isPending} onClick={() => setNextStatus(status)}>{examStatusMeta[status].label}</Button>)}</div>{statusUpdate.isError && <Alert tone="danger">{statusUpdate.error instanceof Error ? statusUpdate.error.message : 'Không thể chuyển trạng thái.'}</Alert>}</section>}
    <section className="exam-detail-sections" aria-label="Tiến độ thiết lập"><SectionCard section={sections[0]} action={examRoutes.edit(examId)} actionLabel="Mở cấu hình" editable={editable} /><SectionCard section={sections[1]} action={examRoutes.students(examId)} actionLabel="Mở roster" editable={editable} loading={roster.isLoading} retry={roster.isError ? retryAll : undefined} /><SectionCard section={sections[2]} action={examRoutes.schedule(examId)} actionLabel="Mở lịch" editable={editable} loading={schedule.isLoading} retry={schedule.isError ? retryAll : undefined} /><SectionCard section={sections[3]} action={examRoutes.questions(examId)} actionLabel="Mở cấu hình câu hỏi" editable={editable} loading={config.isLoading || questions.isLoading} retry={config.isError || questions.isError ? retryAll : undefined} subjectId={examData.subjectId} /></section>
    <footer className="exam-detail-footer"><Link className="button outline" to={examRoutes.list}>Về danh sách kỳ thi</Link></footer>
    <Dialog open={deleteOpen} onClose={() => { if (!remove.isPending) { remove.reset(); setDeleteOpen(false) } }} title="Xóa kỳ thi?"><p>Bạn có chắc muốn xóa “{examData.title}” không?</p><p className="form-help">Chỉ kỳ thi chưa diễn ra mới được xóa.</p>{remove.isError && <Alert tone="danger">{remove.error instanceof Error ? remove.error.message : 'Không thể xóa kỳ thi.'}</Alert>}<div className="dialog-actions"><Button type="button" variant="outline" disabled={remove.isPending} onClick={() => setDeleteOpen(false)}>Hủy</Button><Button type="button" variant="danger" pending={remove.isPending} onClick={() => remove.mutate(examId, { onSuccess: () => navigate(examRoutes.list) })}>Xóa kỳ thi</Button></div></Dialog>
    <Dialog open={Boolean(nextStatus)} onClose={() => setNextStatus(null)} title="Xác nhận chuyển trạng thái"><p>Chuyển kỳ thi sang <strong>{nextStatus ? examStatusMeta[nextStatus].label : ''}</strong>?</p><div className="dialog-actions"><Button type="button" variant="outline" onClick={() => setNextStatus(null)}>Hủy</Button><Button type="button" pending={statusUpdate.isPending} onClick={() => nextStatus && statusUpdate.mutate({ examId, status: nextStatus }, { onSuccess: () => setNextStatus(null) })}>Xác nhận</Button></div></Dialog>
  </section>
}

function SectionCard({ section, action, actionLabel, editable, loading, retry, subjectId }: { section: ReadinessSection; action: string; actionLabel: string; editable: boolean; loading?: boolean; retry?: () => void; subjectId?: string }) {
  const meta = statusMeta[section.status]
  const target = section.key === 'questions' && section.status === 'WARNING' && subjectId ? `/lecturer/subjects/${subjectId}/questions` : action
  const label = section.key === 'questions' && section.status === 'WARNING' && subjectId ? 'Mở ngân hàng câu hỏi' : actionLabel
  return <article className={`exam-section-card ${section.status.toLowerCase()}`}><header><div><p className="section-kicker">{section.key === 'basic' ? '01' : section.key === 'roster' ? '02' : section.key === 'schedule' ? '03' : '04'}</p><h2>{section.title}</h2></div>{loading ? <StatusBadge label="ĐANG TẢI" tone="info" /> : <StatusBadge label={meta.label} tone={meta.tone} />}</header>{loading ? <p aria-busy="true"><Skeleton label={`Đang tải ${section.title.toLocaleLowerCase()}`} /></p> : <><p>{section.summary}</p>{section.issues.length > 0 && <ul className="section-issues">{section.issues.slice(0, 2).map((issue) => <li key={issue}>{issue}</li>)}</ul>}</>}<footer>{!loading && ((editable || section.status === 'UNAVAILABLE') ? <Link className="button outline" to={target}>{label}</Link> : <Link className="button outline" to={action}>Xem chi tiết</Link>)}{retry && <Button variant="outline" onClick={retry}>Thử lại</Button>}</footer></article>
}

export function ExamDetailLoadingSection() { return <div className="exam-section-card"><Skeleton label="Đang tải phần thiết lập" /></div> }
