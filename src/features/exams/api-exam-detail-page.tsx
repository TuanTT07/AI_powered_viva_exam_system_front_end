import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Alert, Button, Dialog } from '../../components/ui/primitives'
import { ErrorState, LoadingPage, PermissionDenied } from '../../components/common/states'
import { ApiError } from '../../services/api/client'
import { useApiExamSchedule, useDeleteExam, useExam, useUpdateExamStatus } from './exam-hooks'
import { ExamDetailView } from './views/ExamDetailView'
import { examStatusMeta, type ExamStatus } from './exam-types'
import { examRoutes } from './exam-routes'

export function ApiExamDetailPage() {
  const { examId = '' } = useParams(), navigate = useNavigate()
  const exam = useExam(examId), schedule = useApiExamSchedule(examId), remove = useDeleteExam(), update = useUpdateExamStatus()
  const [deleteOpen, setDeleteOpen] = useState(false), [status, setStatus] = useState<ExamStatus | null>(null)
  if (exam.isLoading) return <LoadingPage label="Đang tải tổng quan kỳ thi" />
  if (exam.error instanceof ApiError && exam.error.status === 403) return <PermissionDenied />
  if (exam.isError) return <section className="state"><Alert tone="danger">Không thể tải tổng quan kỳ thi.</Alert><Button onClick={() => exam.refetch()}>Thử lại</Button></section>
  if (!exam.data) return <ErrorState description="Không tìm thấy kỳ thi." />
  const transitions: Record<ExamStatus, ExamStatus[]> = { DRAFT: ['PUBLISHED', 'CANCELLED'], PUBLISHED: ['IN_PROGRESS', 'CANCELLED'], SCHEDULED: ['IN_PROGRESS', 'CANCELLED'], IN_PROGRESS: ['COMPLETED', 'CANCELLED'], COMPLETED: [], CANCELLED: [] }
  return <><ExamDetailView exam={exam.data} candidateCount={schedule.isSuccess ? schedule.data.length : undefined} scheduledCount={schedule.isSuccess ? schedule.data.filter(row => row.scheduledStartTime).length : undefined} actions={['DRAFT', 'PUBLISHED'].includes(exam.data.status) && <Button variant="danger" onClick={() => setDeleteOpen(true)}>Xóa kỳ thi</Button>} feedback={schedule.isError ? <Alert tone="danger">Không thể tải danh sách ca thi. <Button variant="outline" onClick={() => schedule.refetch()}>Thử lại</Button></Alert> : undefined}>
    {transitions[exam.data.status].length > 0 && <section className="bg-white border border-slate-200 rounded-xl p-5 space-y-3"><h2 className="text-sm font-semibold text-slate-900">Trạng thái kỳ thi</h2><div className="flex flex-wrap gap-2">{transitions[exam.data.status].map(next => <Button key={next} variant={next === 'CANCELLED' ? 'danger' : 'outline'} disabled={update.isPending} onClick={() => setStatus(next)}>{examStatusMeta[next].label}</Button>)}</div></section>}
    </ExamDetailView>
    <Dialog open={deleteOpen} onClose={() => { if (!remove.isPending) setDeleteOpen(false) }} title="Xóa kỳ thi?"><p>Xóa kỳ thi “{exam.data.title}”?</p>{remove.isError && <Alert tone="danger">{remove.error.message}</Alert>}<div className="dialog-actions"><Button variant="outline" disabled={remove.isPending} onClick={() => setDeleteOpen(false)}>Hủy</Button><Button variant="danger" pending={remove.isPending} onClick={() => remove.mutate(examId, { onSuccess: () => navigate(examRoutes.list) })}>Xóa kỳ thi</Button></div></Dialog>
    <Dialog open={Boolean(status)} onClose={() => { if (!update.isPending) setStatus(null) }} title="Xác nhận chuyển trạng thái"><p>Chuyển kỳ thi sang {status ? examStatusMeta[status].label : ''}?</p>{update.isError && <Alert tone="danger">{update.error.message}</Alert>}<div className="dialog-actions"><Button variant="outline" disabled={update.isPending} onClick={() => setStatus(null)}>Hủy</Button><Button pending={update.isPending} onClick={() => status && update.mutate({ examId, status }, { onSuccess: () => setStatus(null) })}>Xác nhận</Button></div></Dialog>
  </>
}
