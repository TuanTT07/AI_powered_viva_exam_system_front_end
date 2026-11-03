import { InlineNotice } from '../../components/common/inline-notice'
import { useState } from 'react'
import { Link, useBlocker, useParams, useSearchParams } from 'react-router-dom'
import { Alert, Button, Dialog, Input } from '../../components/ui/primitives'
import { EmptyState, ErrorState, LoadingPage, PermissionDenied, StatusBadge } from '../../components/common/states'
import { useSession } from '../../app/providers/use-session'
import { useExam, useExamQuestionConfig, useSaveExamQuestionConfig } from './exam-hooks'
import { examStatusMeta } from './exam-types'
import { examRoutes } from './exam-routes'
import { editableQuestionConfigStatuses, type QuestionConfigMode } from './question-config-types'
import { useQuestions } from '../question-bank/question-hooks'
import type { Question } from '../question-bank/question-types'
import './exam-question-config.css'
import { runtimeConfig } from '../../services/api/runtime-config'

export function ExamQuestionConfigPage() {
  const { examId = '' } = useParams()
  const { session } = useSession()
  const exam = useExam(examId)
  const config = useExamQuestionConfig(examId)
  const [params, setParams] = useSearchParams()
  const [mode, setMode] = useState<QuestionConfigMode | null>(null)
  const [ids, setIds] = useState<string[] | null>(null)
  const [dirty, setDirty] = useState(false)
  const [preview, setPreview] = useState<Question | null>(null)
  const save = useSaveExamQuestionConfig()
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      dirty && !save.isPending && currentLocation.pathname !== nextLocation.pathname
  )
  const questions = useQuestions(exam.data?.subjectId ?? '')

  if (session.user && !session.user.roles.includes('lecturer')) return <PermissionDenied />
  if (exam.isLoading || config.isLoading) return <LoadingPage label="Đang tải cấu hình câu hỏi" />
  if (exam.isError || config.isError) return <section className="state"><Alert tone="danger">Không thể tải cấu hình câu hỏi.</Alert><Button onClick={() => { void exam.refetch(); void config.refetch() }}>Thử lại</Button></section>
  if (!exam.data) return <ErrorState description="Không tìm thấy kỳ thi." />
  if (questions.isLoading) return <LoadingPage label="Đang tải ngân hàng câu hỏi" />
  if (questions.isError) return <section className="state"><Alert tone="danger">Không thể tải ngân hàng câu hỏi.</Alert><Button onClick={() => questions.refetch()}>Thử lại</Button></section>

  const editable = editableQuestionConfigStatuses.includes(exam.data.status)
  const currentMode = mode ?? config.data?.mode ?? 'MANUAL'
  const selectedIds = ids ?? config.data?.questionIds ?? []
  const eligible = (questions.data ?? []).filter((question) => question.status === 'ĐÃ DUYỆT' && question.subjectId === exam.data!.subjectId)
  const q = (params.get('q') ?? '').toLocaleLowerCase()
  const topic = params.get('topic') ?? ''
  const bloom = params.get('bloom') ?? ''
  const filtered = eligible.filter((question) => (!q || (question.id + ' ' + question.content + ' ' + question.topic).toLocaleLowerCase().includes(q)) && (!topic || question.topic === topic) && (!bloom || question.bloom === bloom))
  const required = exam.data.mainQuestionCount
  const invalidSaved = selectedIds.some((id) => !eligible.some((question) => question.id === id))
  const invalidCount = currentMode === 'MANUAL' ? selectedIds.length !== required : selectedIds.length < required

  const updateSelection = (id: string, checked: boolean) => {
    if (!editable || (checked && currentMode === 'MANUAL' && selectedIds.length >= required)) return
    setIds(checked ? [...selectedIds, id] : selectedIds.filter((item) => item !== id))
    setDirty(true)
  }

  const autoFill = () => {
    const next = [...selectedIds, ...eligible.map((question) => question.id).filter((id) => !selectedIds.includes(id))].slice(0, currentMode === 'MANUAL' ? required : Math.max(required, selectedIds.length))
    setIds(next)
    setDirty(true)
  }

  const saveConfig = () => {
    if (!editable || invalidSaved || invalidCount) return
    save.mutate({ examId, draft: { mode: currentMode, questionIds: selectedIds } }, { onSuccess: () => setDirty(false) })
  }

  return (
    <section className="exam-question-page max-w-7xl mx-auto space-y-6 pb-12">
      <nav className="eq-breadcrumb" aria-label="Breadcrumb">
        <Link to={examRoutes.list}>Kỳ thi</Link>
        <span>/</span>
        <Link to={examRoutes.detail(examId)}>{exam.data.title || exam.data.id}</Link>
        <span>/</span>
        <span>Cấu hình câu hỏi</span>
      </nav>

      <header className="eq-head">
        <div>
          <p className="eyebrow">KHẢO THÍ · CHUẨN BỊ LƯỢT THI (CN3)</p>
          <h1>Cấu hình câu hỏi &amp; Tham số vấn đáp</h1>
          <p>{exam.data.title} · {exam.data.subjectName}</p>
        </div>
        <div className="eq-head-actions">
          <StatusBadge label={examStatusMeta[exam.data.status].label} tone={examStatusMeta[exam.data.status].tone} />
          <Link className="button outline" to={examRoutes.schedule(examId)}>Lịch vấn đáp</Link>
        </div>
      </header>

      {!editable && <InlineNotice><strong>Chế độ chỉ đọc.</strong> Kỳ thi này đã bắt đầu hoặc kết thúc, không thể thay đổi cấu hình câu hỏi.</InlineNotice>}
      {runtimeConfig.dataSource === 'api' && (
        <InlineNotice>
          <strong>Hệ thống API kết nối:</strong> Bộ câu hỏi được chọn sẽ được bốc ngẫu nhiên và phân bổ thích ứng theo từng ca thi của sinh viên.
        </InlineNotice>
      )}

      {/* KPI & Rules Overview */}
      <section className="eq-summary grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div>
          <span>Câu hỏi chính yêu cầu</span>
          <strong>{required} câu</strong>
        </div>
        <div>
          <span>Đã chọn trong bộ đề</span>
          <strong className={invalidCount ? 'text-amber-600' : 'text-emerald-600'}>{selectedIds.length} câu</strong>
        </div>
        <div>
          <span>Hỏi xoáy / Đào sâu tối đa</span>
          <strong>{exam.data.maxFollowUpCount} lượt</strong>
        </div>
        <div>
          <span>Giới hạn mỗi câu</span>
          <strong>{exam.data.timeLimitPerTurnSeconds ?? 60}s</strong>
        </div>
        <div>
          <span>Chế độ cấp đề</span>
          <strong>{currentMode === 'MANUAL' ? 'Chọn thủ công' : 'Random pool'}</strong>
        </div>
      </section>

      {eligible.length < required && (
        <Alert tone="danger">
          Học phần chỉ có {eligible.length} câu hỏi đã duyệt, nhưng kỳ thi yêu cầu {required} câu. Hãy duyệt thêm trong <Link className="font-semibold underline" to={'/lecturer/subjects/' + exam.data.subjectId + '/questions'}>Ngân hàng câu hỏi</Link>.
        </Alert>
      )}
      {invalidSaved && <Alert tone="danger">Cấu hình đã lưu có câu hỏi không còn hợp lệ trong ngân hàng. Vui lòng chọn lại các câu hỏi thay thế.</Alert>}

      {/* Mode selection & Filters */}
      <section className="eq-controls space-y-4">
        <fieldset disabled={!editable} className="border border-slate-200 rounded-xl p-4 bg-white space-y-2">
          <legend className="font-semibold text-sm text-slate-800 px-2">Chế độ phân bổ câu hỏi</legend>
          <div className="flex flex-col sm:flex-row gap-4">
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input type="radio" name="config-mode" checked={currentMode === 'MANUAL'} onChange={() => { setMode('MANUAL'); setDirty(true) }} />
              <strong>Chọn thủ công:</strong> Chọn chính xác {required} câu hỏi cố định cho mọi thí sinh
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input type="radio" name="config-mode" checked={currentMode === 'RANDOM_POOL'} onChange={() => { setMode('RANDOM_POOL'); setDirty(true) }} />
              <strong>Random pool:</strong> Chọn tập hợp ít nhất {required} câu để AI bốc ngẫu nhiên chống trùng lặp
            </label>
          </div>
        </fieldset>

        <div className="eq-filters">
          <label htmlFor="eq-search">
            Tìm kiếm
            <Input id="eq-search" value={params.get('q') ?? ''} onChange={(event) => { const next = new URLSearchParams(params); void (event.target.value ? next.set('q', event.target.value) : next.delete('q')); setParams(next, { replace: true }) }} placeholder="Nội dung, mã câu, chủ đề..." />
          </label>
          <label htmlFor="eq-topic">
            Chủ đề
            <select id="eq-topic" value={topic} onChange={(event) => { const next = new URLSearchParams(params); void (event.target.value ? next.set('topic', event.target.value) : next.delete('topic')); setParams(next, { replace: true }) }}>
              <option value="">Tất cả chủ đề</option>
              {[...new Set(eligible.map((question) => question.topic))].map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <label htmlFor="eq-bloom">
            Thang Bloom
            <select id="eq-bloom" value={bloom} onChange={(event) => { const next = new URLSearchParams(params); void (event.target.value ? next.set('bloom', event.target.value) : next.delete('bloom')); setParams(next, { replace: true }) }}>
              <option value="">Tất cả cấp độ</option>
              {['NHỚ', 'HIỂU', 'VẬN DỤNG', 'PHÂN TÍCH'].map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <Button variant="outline" onClick={() => setParams({}, { replace: true })}>Đặt lại</Button>
          <Button variant="outline" disabled={!editable || eligible.length === 0} onClick={autoFill}>
            Điền tự động theo thứ tự
          </Button>
        </div>
      </section>

      {!eligible.length ? (
        <EmptyState title="Chưa có câu hỏi đủ điều kiện" description="Chỉ câu hỏi ĐÃ DUYỆT cùng học phần mới có thể được chọn vào kỳ thi này." />
      ) : !filtered.length ? (
        <section className="state p-8 bg-white rounded-xl border border-slate-200 text-center">
          <h2>Không tìm thấy câu hỏi phù hợp</h2>
          <p className="text-slate-500 text-sm">Thử xoá bộ lọc tìm kiếm để xem lại danh sách câu hỏi đã duyệt.</p>
        </section>
      ) : (
        <QuestionTable
          questions={filtered}
          selectedIds={selectedIds}
          editable={editable}
          mode={currentMode}
          required={required}
          onSelect={updateSelection}
          onPreview={setPreview}
        />
      )}

      {/* Save bar */}
      <section className="eq-savebar">
        <span>
          {currentMode === 'MANUAL'
            ? `${selectedIds.length} / ${required} câu đã chọn ${selectedIds.length !== required ? `(cần thêm ${required - selectedIds.length} câu)` : '✓ Đủ số lượng'}`
            : `${selectedIds.length} câu trong pool · cần tối thiểu ${required} câu ${selectedIds.length >= required ? '✓ Hợp lệ' : `(thiếu ${required - selectedIds.length} câu)`}`}
        </span>
        <Button
          disabled={!editable || invalidCount || invalidSaved || eligible.length < required}
          pending={save.isPending}
          onClick={saveConfig}
        >
          Lưu cấu hình câu hỏi
        </Button>
      </section>

      {save.isError && <Alert tone="danger">Không thể lưu cấu hình câu hỏi. Lựa chọn hiện tại được giữ lại để bạn thử lại.</Alert>}
      {save.data && !dirty && <Alert tone="success">Đã lưu cấu hình câu hỏi cho kỳ thi thành công.</Alert>}

      {/* Question preview modal */}
      <Dialog open={Boolean(preview)} onClose={() => setPreview(null)} title={preview?.id ? `Xem câu hỏi ${preview.id}` : 'Xem câu hỏi'}>
        {preview && (
          <div className="eq-preview space-y-4 pt-2">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-xs uppercase font-semibold text-slate-400 block mb-1">NỘI DUNG CÂU HỎI VẤN ĐÁP</span>
              <p className="text-sm text-slate-800 leading-relaxed font-medium">{preview.content}</p>
            </div>
            <dl className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-white border border-slate-200 rounded-lg">
                <dt className="text-slate-400 font-semibold mb-1">Chủ đề</dt>
                <dd className="font-medium text-slate-800">{preview.topic}</dd>
              </div>
              <div className="p-3 bg-white border border-slate-200 rounded-lg">
                <dt className="text-slate-400 font-semibold mb-1">Mức độ Bloom</dt>
                <dd><StatusBadge label={preview.bloom} tone="info" /></dd>
              </div>
              <div className="p-3 bg-white border border-slate-200 rounded-lg col-span-2">
                <dt className="text-slate-400 font-semibold mb-1">Gợi ý trả lời / Tiêu chí đánh giá</dt>
                <dd className="text-slate-700 leading-relaxed">{preview.suggestedAnswer || 'Chưa thiết lập gợi ý trả lời.'}</dd>
              </div>
            </dl>
          </div>
        )}
      </Dialog>

      {/* Unsaved changes blocker */}
      <Dialog open={blocker.state === 'blocked'} onClose={() => blocker.reset?.()} title="Rời trang cấu hình câu hỏi?">
        <div className="space-y-4 pt-2">
          <p className="text-sm text-slate-600">Bạn có thay đổi cấu hình câu hỏi chưa lưu. Nếu rời đi bây giờ, các lựa chọn này sẽ bị mất.</p>
          <div className="dialog-actions flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="outline" onClick={() => blocker.reset?.()}>Ở lại tiếp tục</Button>
            <Button variant="danger" onClick={() => blocker.proceed?.()}>Rời trang</Button>
          </div>
        </div>
      </Dialog>
    </section>
  )
}

function QuestionTable({
  questions,
  selectedIds,
  editable,
  mode,
  required,
  onSelect,
  onPreview,
}: {
  questions: Question[]
  selectedIds: string[]
  editable: boolean
  mode: QuestionConfigMode
  required: number
  onSelect: (id: string, checked: boolean) => void
  onPreview: (question: Question) => void
}) {
  return (
    <div className="eq-table-wrap rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
      <table className="eq-table w-full text-left text-xs">
        <caption className="sr-only">Câu hỏi đủ điều kiện cho kỳ thi</caption>
        <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
          <tr>
            <th className="p-3.5 w-12 text-center">CHỌN</th>
            <th className="p-3.5">MÃ &amp; NỘI DUNG CÂU HỎI</th>
            <th className="p-3.5">CHỦ ĐỀ</th>
            <th className="p-3.5">BLOOM</th>
            <th className="p-3.5">TRẠNG THÁI</th>
            <th className="p-3.5 text-right">CHI TIẾT</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {questions.map((question) => {
            const isSelected = selectedIds.includes(question.id)
            const disableCheck = !editable || (mode === 'MANUAL' && !isSelected && selectedIds.length >= required)
            return (
              <tr key={question.id} className={`hover:bg-slate-50/80 transition-colors ${isSelected ? 'bg-blue-50/40' : ''}`}>
                <td className="p-3.5 text-center">
                  <input
                    aria-label={'Chọn ' + question.id}
                    type="checkbox"
                    checked={isSelected}
                    disabled={disableCheck}
                    onChange={(event) => onSelect(question.id, event.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </td>
                <td className="p-3.5">
                  <strong className="font-mono text-slate-900 block text-xs">{question.id}</strong>
                  <span className="text-slate-700 line-clamp-2 mt-0.5">{question.content}</span>
                </td>
                <td className="p-3.5 text-slate-600 font-medium">{question.topic}</td>
                <td className="p-3.5">
                  <StatusBadge label={question.bloom} tone="info" />
                </td>
                <td className="p-3.5">
                  <StatusBadge label={question.status} tone="success" />
                </td>
                <td className="p-3.5 text-right">
                  <Button variant="outline" onClick={() => onPreview(question)}>
                    Xem
                  </Button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
