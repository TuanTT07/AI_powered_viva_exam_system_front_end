import { ArrowLeft, BookOpen, FileCheck, Save, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Alert, Button } from '../../../components/ui/primitives'
import { bloomLevels, type BloomLevel } from '../question-types'
import type { Rubric } from '../../rubrics/rubric-types'
import type { FormEvent, ReactNode } from 'react'
import type { QuestionEditorReturnState } from '../question-editor-draft'

export type QuestionEditorViewProps = {
  title: string; backTo: string; courseLabel: string; content: string; bloom: string; rubricId: string;
  rubrics: Rubric[]; rubricLoading: boolean; rubricError: boolean; pending: boolean; errors: Record<string, string>;
  onContent: (value: string) => void; onBloom: (value: BloomLevel) => void; onRubric: (value: string) => void;
  onSubmit: (event: FormEvent) => void; onCancel: () => void; onRetryRubrics: () => void; createRubric: ReactNode; feedback: ReactNode; actions: ReactNode;
  rubricReturnState?: QuestionEditorReturnState;
}

/* Adapted from the supplied RubricEditorView: metadata on the left and the
   grading matrix on the right. Backend Rubrics are independently persisted. */
export function QuestionEditorView(props: QuestionEditorViewProps) {
  const rubric = props.rubrics.find(item => item.id === props.rubricId)
  const total = rubric?.criteria.reduce((sum, item) => sum + Number(item.maximumScore || 0), 0)
  return <section className="source-screen space-y-6 max-w-7xl mx-auto pb-16">
    <form onSubmit={props.onSubmit} noValidate className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4"><div className="flex items-center gap-3"><button type="button" onClick={props.onCancel} aria-label="Quay lại ngân hàng câu hỏi" className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600"><ArrowLeft size={16} /></button><div><p className="text-xs text-slate-500 mb-1">Ngân hàng câu hỏi / Soạn thảo</p><h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">{props.title}</h1></div></div><div className="flex gap-2.5"><Button type="button" variant="outline" disabled={props.pending} onClick={props.onCancel}>Hủy bỏ</Button><Button type="submit" pending={props.pending}><Save size={14} />Lưu bản nháp</Button></div></header>
      {props.feedback}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 space-y-6"><section className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4"><h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2"><BookOpen size={16} className="text-blue-600" />Thông Tin &amp; Cấu Hình Đề Thi</h2>
          <div><label className="block text-xs font-medium text-slate-500 mb-1" htmlFor="question-course">Học phần khảo thí</label><input id="question-course" value={props.courseLabel} readOnly className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-600" /></div>
          <div><label className="block text-xs font-medium text-slate-700 mb-1" htmlFor="question-content">Nội dung câu hỏi <span className="text-rose-500">*</span></label><textarea id="question-content" rows={8} value={props.content} onChange={event => props.onContent(event.target.value)} aria-invalid={Boolean(props.errors.content)} aria-describedby={props.errors.content ? 'content-error' : undefined} placeholder="Nhập nội dung câu hỏi vấn đáp..." className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:border-blue-500" />{props.errors.content && <p id="content-error" className="text-xs text-rose-600">{props.errors.content}</p>}</div>
          <div><label className="block text-xs font-medium text-slate-700 mb-1" htmlFor="question-bloom">Mức độ nhận thức (Bloom)</label><select id="question-bloom" value={props.bloom} onChange={event => props.onBloom(event.target.value as BloomLevel)} aria-invalid={Boolean(props.errors.bloom)} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm"><option value="">Chọn mức Bloom</option>{bloomLevels.map(level => <option key={level}>{level}</option>)}</select>{props.errors.bloom && <p className="text-xs text-rose-600">{props.errors.bloom}</p>}</div>
        </section><div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3"><ShieldCheck size={18} className="text-blue-600" /><div><h3 className="text-sm font-semibold text-blue-900">Rà soát trước khi phê duyệt</h3><p className="text-xs text-blue-700 mt-1">Câu hỏi mới được lưu ở trạng thái bản nháp. Bạn có thể kiểm tra lại nội dung và Rubric trước khi duyệt.</p></div></div></div>
        <div className="lg:col-span-7 space-y-4"><section className="bg-white border border-slate-200 rounded-xl p-5 space-y-4"><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-sm font-semibold text-slate-900 flex gap-2 items-center"><FileCheck size={16} className="text-blue-600" />Rubric &amp; Tiêu Chí Đánh Giá</h2>{props.createRubric}</div><label className="block text-xs font-medium text-slate-700" htmlFor="question-rubric">Rubric{props.rubricLoading && ' · đang tải'}</label><select id="question-rubric" value={props.rubricId} disabled={props.rubricLoading} onChange={event => props.onRubric(event.target.value)} aria-invalid={Boolean(props.errors.rubric)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm"><option value="">Không gắn rubric</option>{props.rubrics.map(item => <option value={item.id} key={item.id}>{item.name}</option>)}</select>{props.rubricError && <Alert tone="danger">Không thể tải danh mục Rubric. <Button type="button" variant="outline" onClick={props.onRetryRubrics}>Thử lại</Button></Alert>}
          {rubric ? <><div className="flex justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"><strong>{rubric.criteria.length} tiêu chí</strong><span>Tổng điểm: {total}</span></div>{rubric.criteria.map((criterion, index) => <article key={criterion.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2"><div className="flex justify-between gap-3"><h3 className="text-sm font-semibold text-slate-900">{String(index + 1).padStart(2, '0')}. {criterion.name}</h3><span className="text-xs font-mono text-blue-700 shrink-0">{criterion.maximumScore} điểm</span></div><p className="text-xs text-slate-500 leading-relaxed whitespace-pre-wrap">{criterion.description || 'Chưa có hướng dẫn đánh giá.'}</p></article>)}<Link className="button outline" to={`/lecturer/rubrics/${encodeURIComponent(rubric.id)}/edit`} state={props.rubricReturnState ?? { returnTo: props.backTo }}>Chỉnh sửa Rubric</Link></> : <div className="text-center rounded-xl border border-dashed border-slate-200 p-8 text-slate-500"><FileCheck size={24} className="mb-2" /><p className="text-sm">Chọn Rubric để xem ma trận tiêu chí chấm điểm.</p></div>}
        </section>{props.actions}</div>
      </div>
    </form>
  </section>
}
