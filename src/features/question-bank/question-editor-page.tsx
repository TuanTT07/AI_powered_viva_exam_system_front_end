import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { EmptyState, LoadingPage } from '../../components/common/states'
import { Alert, Button, Input } from '../../components/ui/primitives'
import { useQuestion, useQuestionTopics, useSaveQuestion } from './question-hooks'
import type { BloomLevel, Question } from './question-types'

export function QuestionEditorPage() {
  const { subjectId = '', questionId } = useParams()
  const query = useQuestion(subjectId, questionId)
  if (!subjectId) return <EmptyState title="Thiếu học phần" description="Không thể xác định học phần để soạn câu hỏi." />
  if (questionId && query.isLoading) return <LoadingPage label="Đang tải câu hỏi" />
  if (questionId && query.isError) return <section className="state"><Alert tone="danger">Không thể tải câu hỏi.</Alert><Button onClick={() => query.refetch()}>Thử lại</Button></section>
  if (questionId && !query.data) return <section className="state"><h1>Không tìm thấy câu hỏi</h1><Link className="button outline" to={`/lecturer/subjects/${subjectId}/questions`}>Về ngân hàng câu hỏi</Link></section>
  return <QuestionEditorForm key={questionId ?? 'new'} subjectId={subjectId} initial={query.data ?? null} />
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
