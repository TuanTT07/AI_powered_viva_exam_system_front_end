import { useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Alert, Button, Dialog } from '../../components/ui/primitives'
import { EmptyState, LoadingPage, PermissionDenied } from '../../components/common/states'
import { ApiError } from '../../services/api/client'
import { runtimeConfig } from '../../services/api/runtime-config'
import { isUuid } from './api-question-repository'
import { useQuestions, useApiQuestions, useDeleteApiQuestion, useDeleteQuestion } from './question-hooks'
import { QuestionImportDialog, type ImportSummary } from './question-import-dialog'
import { QuestionBankView } from './views/QuestionBankView'
import { useLecturerSubject } from '../subjects/subject-hooks'
import type { BloomLevel, QuestionStatus } from './question-types'
import './question-import.css'

const bloomDomain: Record<string, BloomLevel> = { Nhớ: 'NHỚ', Hiểu: 'HIỂU', 'Vận dụng': 'VẬN DỤNG', 'Phân tích': 'PHÂN TÍCH', 'Đánh giá': 'ĐÁNH GIÁ', 'Sáng tạo': 'SÁNG TẠO' }
const statusDomain: Record<string, QuestionStatus> = { 'Đã duyệt': 'ĐÃ DUYỆT', 'Chờ duyệt': 'CHỜ DUYỆT', 'Bản nháp': 'BẢN NHÁP' }

export function QuestionBankPage() {
  const { subjectId = '' } = useParams()
  if (!subjectId || (runtimeConfig.dataSource === 'api' && !isUuid(subjectId))) return <EmptyState title="Không tìm thấy học phần" description="Chọn học phần được phân công để tiếp tục." />
  return runtimeConfig.dataSource === 'api' ? <ApiQuestionBank subjectId={subjectId} /> : <MockQuestionBank subjectId={subjectId} />
}
function useBankFilters() {
  const [params, setParams] = useSearchParams()
  const page = Math.max(1, Number(params.get('page') ?? 1) || 1)
  const set = (key: string, value: string) => setParams(current => { const next = new URLSearchParams(current); if (value) next.set(key, value); else next.delete(key); if (key !== 'page') next.set('page', '1'); return next })
  return { params, page, set }
}
function MockQuestionBank({ subjectId }: { subjectId: string }) {
  const query = useQuestions(subjectId), remove = useDeleteQuestion(), filters = useBankFilters()
  const q = filters.params.get('q') ?? '', topic = filters.params.get('topic') ?? '', bloom = filters.params.get('bloom') ?? '', status = filters.params.get('status') ?? ''
  const all = query.data ?? []
  const rows = all.filter(item => (!q || `${item.id} ${item.content}`.toLocaleLowerCase().includes(q.toLocaleLowerCase())) && (!topic || item.topic === topic) && (!bloom || item.bloom === (bloomDomain[bloom] ?? bloom)) && (!status || item.status === (statusDomain[status] ?? status)))
  const pageSize = 20, totalPages = Math.max(1, Math.ceil(rows.length / pageSize))
  return <BankScreen subjectId={subjectId} items={rows.slice((filters.page - 1) * pageSize, filters.page * pageSize)} totalItems={rows.length} totalPages={totalPages} filters={filters} loading={query.isLoading} error={query.error} retry={() => { void query.refetch() }} deleting={remove.isPending} deleteError={remove.error} onDelete={(questionId, done) => remove.mutate({ subjectId, questionId }, { onSuccess: done })} />
}
function ApiQuestionBank({ subjectId }: { subjectId: string }) {
  const filters = useBankFilters(), remove = useDeleteApiQuestion()
  const rawBloom = filters.params.get('bloom') ?? '', rawStatus = filters.params.get('status') ?? ''
  const query = useApiQuestions({ courseId: subjectId, keyword: filters.params.get('q') || undefined, bloom: (bloomDomain[rawBloom] ?? rawBloom) as BloomLevel || undefined, status: (statusDomain[rawStatus] ?? rawStatus) as QuestionStatus || undefined, page: filters.page, size: 20 })
  return <BankScreen subjectId={subjectId} items={query.data?.items ?? []} totalItems={query.data?.totalItems ?? 0} totalPages={query.data?.totalPages ?? 1} filters={filters} loading={query.isLoading} error={query.error} retry={() => { void query.refetch() }} deleting={remove.isPending} deleteError={remove.error} onDelete={(questionId, done) => remove.mutate({ subjectId, questionId }, { onSuccess: done })} />
}
type BankScreenProps = {
  subjectId: string; items: import('./question-types').Question[]; totalItems: number; totalPages: number; filters: ReturnType<typeof useBankFilters>;
  loading: boolean; error: Error | null; retry: () => void; deleting: boolean; deleteError: Error | null; onDelete: (id: string, done: () => void) => void;
}
function BankScreen({ subjectId, items, totalItems, totalPages, filters, loading, error, retry, deleting, deleteError, onDelete }: BankScreenProps) {
  const navigate = useNavigate(), subject = useLecturerSubject(subjectId)
  const [target, setTarget] = useState<string | null>(null), [importOpen, setImportOpen] = useState(false), [feedback, setFeedback] = useState('')
  const base = `/lecturer/subjects/${encodeURIComponent(subjectId)}/questions`
  if (error instanceof ApiError && error.status === 403) return <PermissionDenied />
  if (loading) return <LoadingPage label="Đang tải ngân hàng câu hỏi" />
  if (error) return <section className="state"><Alert tone="danger">{error.message || 'Không thể tải ngân hàng câu hỏi.'}</Alert><Button onClick={retry}>Thử lại</Button></section>
  return <>
    {feedback && <Alert tone="success">{feedback}</Alert>}
    <QuestionBankView items={items} courseLabel={subject.data ? `${subject.data.code} · ${subject.data.name}` : 'Học phần đang chọn'} totalCount={totalItems} page={filters.page} totalPages={totalPages} searchTerm={filters.params.get('q') ?? ''} topicFilter={filters.params.get('topic') ?? ''} bloomFilter={filters.params.get('bloom') ?? ''} statusFilter={filters.params.get('status') ?? ''} pending={deleting} demoFeatures={runtimeConfig.dataSource === 'mock'} setSearchTerm={value => filters.set('q', value)} setTopicFilter={value => filters.set('topic', value)} setBloomFilter={value => filters.set('bloom', value)} setStatusFilter={value => filters.set('status', value)} onCreate={() => navigate(`${base}/new`)} onEdit={id => navigate(`${base}/${encodeURIComponent(id)}/edit`)} onDelete={setTarget} onGenerate={() => navigate(`${base}/generate`)} onImport={() => setImportOpen(true)} onPage={page => filters.set('page', String(page))} />
    {!items.length && <EmptyState title={totalItems ? 'Không có câu hỏi trên trang này' : 'Chưa có câu hỏi phù hợp'} description="Tạo câu hỏi mới hoặc thay đổi bộ lọc để tiếp tục." />}
    <Dialog open={Boolean(target)} title="Xóa câu hỏi?" onClose={() => { if (!deleting) setTarget(null) }}><p>Câu hỏi sẽ được xóa khỏi ngân hàng đề thi.</p>{deleteError && <Alert tone="danger">{deleteError.message}</Alert>}<div className="dialog-actions"><Button variant="outline" disabled={deleting} onClick={() => setTarget(null)}>Hủy</Button><Button variant="danger" pending={deleting} onClick={() => target && onDelete(target, () => { setTarget(null); setFeedback('Đã xóa câu hỏi.') })}>Xóa câu hỏi</Button></div></Dialog>
    <QuestionImportDialog open={importOpen} subjectId={subjectId} onClose={() => setImportOpen(false)} onSuccess={(result: ImportSummary) => { setFeedback(`Đã nhập ${result.imported} câu hỏi bản nháp.`) }} />
    <Link className="button outline" to={`/lecturer/subjects/${encodeURIComponent(subjectId)}`}>Về học phần</Link>
  </>
}
