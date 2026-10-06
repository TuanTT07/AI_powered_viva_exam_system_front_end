import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { EmptyState, LoadingPage } from '../../components/common/states'
import { Alert, Button, Input } from '../../components/ui/primitives'
import { useQuestion, useQuestionTopics, useSaveQuestion } from './question-hooks'
import { runtimeConfig } from '../../services/api/runtime-config'
import { useApiQuestion, useApproveApiQuestion, useDeleteApiQuestion } from './question-hooks'
import { ApiError } from '../../services/api/client'
import { Dialog } from '../../components/ui/primitives'
import type { BloomLevel, Question } from './question-types'

export function QuestionEditorPage() {
  const { subjectId = '', questionId } = useParams()
  if (runtimeConfig.dataSource === 'api') return <ApiQuestionDetailPage subjectId={subjectId} questionId={questionId} />
  return <MockQuestionEditorPage />
}

function MockQuestionEditorPage() {
  const { subjectId = '', questionId } = useParams()
  const query = useQuestion(subjectId, questionId)
  if (!subjectId) return <EmptyState title="Thiếu học phần" description="Không thể xác định học phần để soạn câu hỏi." />
  if (questionId && query.isLoading) return <LoadingPage label="Đang tải câu hỏi" />
  if (questionId && query.isError) return <section className="state"><Alert tone="danger">Không thể tải câu hỏi.</Alert><Button onClick={() => query.refetch()}>Thử lại</Button></section>
  if (questionId && !query.data) return <section className="state"><h1>Không tìm thấy câu hỏi</h1><Link className="button outline" to={`/lecturer/subjects/${subjectId}/questions`}>Về ngân hàng câu hỏi</Link></section>
  return <QuestionEditorForm key={questionId ?? 'new'} subjectId={subjectId} initial={query.data ?? null} />
}

function ApiQuestionDetailPage({ subjectId, questionId }: { subjectId: string; questionId?: string }) {
  const navigate = useNavigate()
  const query = useApiQuestion(subjectId, questionId)
  const approve = useApproveApiQuestion()
  const remove = useDeleteApiQuestion()
  const [confirmDelete, setConfirmDelete] = useState(false)
  if (!subjectId) return <EmptyState title="Thiếu học phần" description="Không thể xác định học phần." />
  if (!questionId) return <section className="state"><h2>Tạo câu hỏi chưa khả dụng trong API mode</h2><p>Backend hiện thiếu createdById hiện tại và các trường chủ đề, đáp án gợi ý. Hãy dùng mock mode hoặc quay lại ngân hàng câu hỏi.</p><Link className="button outline" to={`/lecturer/subjects/${subjectId}/questions`}>Về ngân hàng câu hỏi</Link></section>
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(subjectId) || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(questionId)) return <section className="state"><h2>URL không hợp lệ</h2><p>API mode yêu cầu mã học phần và mã câu hỏi là UUID.</p><Link className="button outline" to={`/lecturer/subjects/${subjectId}/questions`}>Về ngân hàng câu hỏi</Link></section>
  if (query.isLoading) return <LoadingPage label="Đang tải câu hỏi" />
  if (query.isError) return <section className="state"><Alert tone="danger">{query.error instanceof ApiError ? query.error.message : 'Không thể tải câu hỏi.'}</Alert><Button onClick={() => query.refetch()}>Thử lại</Button></section>
  if (!query.data) return <section className="state"><h1>Không tìm thấy câu hỏi</h1><Link className="button outline" to={`/lecturer/subjects/${subjectId}/questions`}>Về ngân hàng câu hỏi</Link></section>
  const question = query.data
  const approveQuestion = () => { if (!approve.isPending) approve.mutate({ subjectId, questionId }) }
  const deleteQuestion = () => { if (!remove.isPending) remove.mutate({ subjectId, questionId }, { onSuccess: () => navigate(`/lecturer/subjects/${subjectId}/questions`) }) }
  return <section className="question-editor"><header className="qe-head"><div><p className="eyebrow">QUESTION BANK · API READ ONLY</p><h1>Chi tiết câu hỏi</h1><p>Thông tin này chỉ đọc theo hợp đồng backend hiện tại.</p></div><Link className="button outline" to={`/lecturer/subjects/${subjectId}/questions`}>Quay lại</Link></header><Alert tone="info">Chủ đề hiển thị <strong>Chưa phân loại</strong>; đáp án gợi ý và chỉnh sửa chưa được backend hỗ trợ.</Alert><section><h2>{question.content}</h2><dl><dt>Mã</dt><dd>{question.id}</dd><dt>Bloom</dt><dd>{question.bloom}</dd><dt>Rubric</dt><dd>{question.rubric ?? 'Chưa gắn rubric'}</dd><dt>Nguồn</dt><dd>{question.source}</dd><dt>Trạng thái</dt><dd>{question.status}</dd></dl></section><footer><Button variant="danger" pending={remove.isPending} onClick={() => setConfirmDelete(true)}>Xoá câu hỏi</Button>{question.status === 'BẢN NHÁP' && <Button pending={approve.isPending} onClick={approveQuestion}>Duyệt câu hỏi</Button>}</footer>{approve.isError && <Alert tone="danger">{approve.error instanceof Error ? approve.error.message : 'Không thể duyệt câu hỏi. Vui lòng thử lại.'}</Alert>}{remove.isError && <Alert tone="danger">{remove.error instanceof Error ? remove.error.message : 'Không thể xoá câu hỏi. Vui lòng thử lại.'}</Alert>}<Dialog open={confirmDelete} onClose={() => setConfirmDelete(false)} title="Xác nhận xoá câu hỏi"><p>Bạn chắc chắn muốn xoá câu hỏi <strong>{question.id}</strong>? Thao tác này không thể hoàn tác.</p><div className="dialog-actions"><Button variant="outline" onClick={() => setConfirmDelete(false)}>Huỷ</Button><Button variant="danger" pending={remove.isPending} onClick={deleteQuestion}>Xoá câu hỏi</Button></div></Dialog></section>
}

function QuestionEditorForm({ subjectId, initial }: { subjectId: string; initial: Question | null }) {
  const navigate = useNavigate()
  const topics = useQuestionTopics(subjectId)
  const save = useSaveQuestion()
  const [form, setForm] = useState({ topic: initial?.topic ?? '', bloom: initial?.bloom ?? '', duration: '3', content: initial?.content ?? '', answer: initial?.suggestedAnswer ?? '' })
  const [error, setError] = useState('')
  const edit = Boolean(initial)
  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }))
  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (!form.topic || !form.bloom || !form.content.trim()) { setError('Hoàn tất chủ đề, mức Bloom và nội dung câu hỏi trước khi lưu.'); return }
    const question: Question = { id: initial?.id ?? `Q-${subjectId.toUpperCase()}-${crypto.randomUUID()}`, subjectId, content: form.content.trim(), topic: form.topic, bloom: form.bloom as BloomLevel, suggestedAnswer: form.answer.trim() || undefined, rubricId: initial?.rubricId, rubric: initial?.rubric, source: initial?.source ?? 'Thủ công', status: initial?.status ?? 'BẢN NHÁP' }
    save.mutate(question, { onSuccess: () => navigate(`/lecturer/subjects/${subjectId}/questions`) })
  }
  return <section className="question-editor"><header className="qe-head"><div><p className="eyebrow">NGÂN HÀNG CÂU HỎI / SOẠN THẢO & RUBRIC</p><h1>{edit ? 'Soạn thảo câu hỏi & Thiết lập Rubric' : 'Tạo câu hỏi vấn đáp'}</h1><p>Định nghĩa yêu cầu chuyên môn, mức độ tư duy Bloom và bộ tiêu chí chuẩn hóa.</p></div><Link className="button outline" to={`/lecturer/subjects/${subjectId}/questions`}>Hủy bỏ</Link></header><form onSubmit={submit}><section><h2>A. Thông tin câu hỏi vấn đáp</h2><p className="eyebrow">MÔN HỌC · {subjectId}</p><label>Chủ đề chuyên môn<select value={form.topic} onChange={(event) => update('topic', event.target.value)}><option value="">Chọn chủ đề</option>{(topics.data ?? []).map((topic) => <option key={topic}>{topic}</option>)}</select></label><fieldset><legend>Mức độ nhận thức (Bloom)</legend>{(['NHỚ', 'HIỂU', 'VẬN DỤNG', 'PHÂN TÍCH'] as BloomLevel[]).map((level) => <label key={level}><input checked={form.bloom === level} name="bloom" onChange={() => update('bloom', level)} type="radio" />{level}</label>)}</fieldset><label>Thời gian trả lời (phút)<Input min="1" onChange={(event) => update('duration', event.target.value)} type="number" value={form.duration} /></label><label>Nội dung câu hỏi phát vấn<textarea onChange={(event) => update('content', event.target.value)} value={form.content} /></label><label>Đáp án cốt lõi & ý chính bắt buộc<textarea onChange={(event) => update('answer', event.target.value)} value={form.answer} /></label></section>{error && <Alert tone="danger">{error}</Alert>}{save.isError && <Alert tone="danger">Không thể lưu câu hỏi. Vui lòng thử lại.</Alert>}<footer><Link className="button outline" to={`/lecturer/subjects/${subjectId}/questions`}>Hủy bỏ</Link><Button pending={save.isPending} type="submit">{edit ? 'Lưu thay đổi' : 'Lưu câu hỏi'}</Button></footer></form></section>
}
