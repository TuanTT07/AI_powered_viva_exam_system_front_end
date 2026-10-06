import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import './rubric.css'
import { EmptyState, LoadingPage } from '../../components/common/states'
import { Alert, Button, Dialog, Input } from '../../components/ui/primitives'
import { useRubric, useRubrics, useSaveRubric } from './rubric-hooks'
import type { RubricCriterion, RubricDraft } from './rubric-types'

const newCriterion = (): RubricCriterion => ({ id: crypto.randomUUID(), name: '', maximumScore: '', description: '' })
const scoreTotal = (criteria: RubricCriterion[]) => criteria.reduce((total, criterion) => total + (Number(criterion.maximumScore) || 0), 0)

function RubricHeader({ subjectId, mode = 'list' }: { subjectId: string; mode?: 'list' | 'create' | 'edit' }) {
  const editing = mode !== 'list'
  return <header className="qe-head"><div><p className="eyebrow">RUBRICS · {subjectId}</p><h1>{mode === 'list' ? 'Bộ tiêu chí chấm điểm' : mode === 'edit' ? 'Chỉnh sửa rubric' : 'Tạo rubric'}</h1><p>{editing ? 'Thiết lập tiêu chí và thang điểm cho học phần.' : 'Quản lý tiêu chí và thang điểm của học phần.'}</p></div>{mode === 'list' && <Link className="button primary" to="new">Tạo rubric</Link>}</header>
}

export function RubricListPage() {
  const { subjectId = '' } = useParams()
  const query = useRubrics(subjectId)
  if (!subjectId) return <EmptyState title="Thiếu học phần" description="Không thể xác định học phần để tải rubric." />
  return <section className="rubric-page"><RubricHeader subjectId={subjectId} />
    {query.isLoading ? <LoadingPage label="Đang tải rubric" /> : query.isError ? <section className="state"><Alert tone="danger">Không thể tải danh sách rubric. Vui lòng thử lại.</Alert><Button onClick={() => query.refetch()}>Thử lại</Button></section> : !query.data?.length ? <EmptyState title="Chưa có rubric" description="Tạo rubric đầu tiên để chuẩn hóa tiêu chí đánh giá." /> : <div className="rubric-grid">{query.data.map((rubric) => <article key={rubric.id}><p className="eyebrow">{rubric.criteria.length} TIÊU CHÍ · {scoreTotal(rubric.criteria)} ĐIỂM</p><h2>{rubric.name}</h2><p>Ma trận tiêu chí chuẩn hóa cho câu hỏi vấn đáp.</p><Link className="button outline" to={rubric.id}>Chỉnh sửa rubric</Link></article>)}</div>}
  </section>
}

type FieldErrors = { name?: string; criteria?: Record<string, { name?: string; maximumScore?: string }> }
function validate(name: string, criteria: RubricCriterion[]): FieldErrors {
  const errors: FieldErrors = {}
  if (!name.trim()) errors.name = 'Nhập tên rubric.'
  if (!criteria.length) errors.criteria = { list: { name: 'Cần có ít nhất một tiêu chí.' } }
  for (const criterion of criteria) {
    const row: { name?: string; maximumScore?: string } = {}
    if (!criterion.name.trim()) row.name = 'Nhập tên tiêu chí.'
    if (!criterion.maximumScore.trim() || Number.isNaN(Number(criterion.maximumScore)) || Number(criterion.maximumScore) <= 0) row.maximumScore = 'Nhập điểm tối đa lớn hơn 0.'
    if (Object.keys(row).length) errors.criteria = { ...errors.criteria, [criterion.id]: row }
  }
  return errors
}
const hasErrors = (errors: FieldErrors) => Boolean(errors.name || errors.criteria)

export function RubricEditorPage() {
  const { subjectId = '', rubricId } = useParams()
  const navigate = useNavigate()
  const rubricQuery = useRubric(subjectId, rubricId)
  const save = useSaveRubric()
  const [name, setName] = useState('')
  const [criteria, setCriteria] = useState<RubricCriterion[]>([newCriterion()])
  const [dirty, setDirty] = useState(false)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [confirmCancel, setConfirmCancel] = useState(false)
  const editMode = Boolean(rubricId)
  useEffect(() => { if (rubricQuery.data) { setName(rubricQuery.data.name); setCriteria(rubricQuery.data.criteria); setDirty(false) } }, [rubricQuery.data])
  useEffect(() => { const warn = (event: BeforeUnloadEvent) => { if (dirty) event.preventDefault() }; window.addEventListener('beforeunload', warn); return () => window.removeEventListener('beforeunload', warn) }, [dirty])
  const updateCriterion = (id: string, key: keyof Omit<RubricCriterion, 'id'>, value: string) => { setCriteria((all) => all.map((criterion) => criterion.id === id ? { ...criterion, [key]: value } : criterion)); setDirty(true) }
  const exit = () => dirty ? setConfirmCancel(true) : navigate(`/lecturer/subjects/${subjectId}/rubrics`)
  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); const nextErrors = validate(name, criteria); setErrors(nextErrors); if (hasErrors(nextErrors)) return; const draft: RubricDraft & { id?: string } = { id: rubricId, subjectId, name: name.trim(), criteria }; save.mutate(draft, { onSuccess: () => { setDirty(false); navigate(`/lecturer/subjects/${subjectId}/rubrics`) } }) }
  const total = useMemo(() => scoreTotal(criteria), [criteria])
  if (!subjectId) return <EmptyState title="Thiếu học phần" description="Không thể xác định học phần để soạn rubric." />
  if (editMode && rubricQuery.isLoading) return <LoadingPage label="Đang tải rubric" />
  if (editMode && rubricQuery.isError) return <section className="state"><Alert tone="danger">Không thể tải rubric. Vui lòng thử lại.</Alert><Button onClick={() => rubricQuery.refetch()}>Thử lại</Button></section>
  if (editMode && !rubricQuery.data) return <section className="state"><h1>Không tìm thấy rubric</h1><Link className="button outline" to={`/lecturer/subjects/${subjectId}/rubrics`}>Về danh sách rubric</Link></section>
  return <section className="rubric-page"><RubricHeader subjectId={subjectId} mode={editMode ? 'edit' : 'create'} />
    <form className="rubric-form" noValidate onSubmit={submit}>
      <label>Tên rubric<Input aria-describedby={errors.name ? 'rubric-name-error' : undefined} aria-invalid={Boolean(errors.name)} value={name} onChange={(event) => { setName(event.target.value); setDirty(true) }} /></label>{errors.name && <p className="field-error" id="rubric-name-error">{errors.name}</p>}
      <section aria-labelledby="rubric-criteria-heading"><h2 id="rubric-criteria-heading">Tiêu chí đánh giá</h2><p className="form-help">Thiết lập tên, điểm tối đa và hướng dẫn đánh giá cho từng tiêu chí.</p>
        {criteria.map((criterion, index) => { const rowErrors = errors.criteria?.[criterion.id]; return <fieldset key={criterion.id}><legend>Tiêu chí {String(index + 1).padStart(2, '0')}</legend><label>Tên tiêu chí<Input aria-invalid={Boolean(rowErrors?.name)} value={criterion.name} onChange={(event) => updateCriterion(criterion.id, 'name', event.target.value)} /></label>{rowErrors?.name && <p className="field-error">{rowErrors.name}</p>}<label>Điểm tối đa<Input aria-invalid={Boolean(rowErrors?.maximumScore)} min="0" step="0.5" type="number" value={criterion.maximumScore} onChange={(event) => updateCriterion(criterion.id, 'maximumScore', event.target.value)} /></label>{rowErrors?.maximumScore && <p className="field-error">{rowErrors.maximumScore}</p>}<label>Hướng dẫn đánh giá<textarea value={criterion.description} onChange={(event) => updateCriterion(criterion.id, 'description', event.target.value)} /></label><Button type="button" variant="danger" onClick={() => { setCriteria((all) => all.filter((item) => item.id !== criterion.id)); setDirty(true) }} disabled={criteria.length === 1}>Xóa tiêu chí</Button></fieldset> })}
        <Button type="button" variant="outline" onClick={() => { setCriteria((all) => [...all, newCriterion()]); setDirty(true) }}>Thêm tiêu chí</Button>
      </section>
      {save.isError && <Alert tone="danger">Không thể lưu rubric. Vui lòng thử lại.</Alert>}
      <footer><span>Tổng điểm: {total}</span><div><Button type="button" variant="outline" onClick={exit}>Hủy bỏ</Button><Button pending={save.isPending} type="submit">Lưu rubric</Button></div></footer>
    </form>
    <Dialog open={confirmCancel} onClose={() => setConfirmCancel(false)} title="Rời trang soạn rubric?"><p>Các thay đổi chưa lưu sẽ bị mất.</p><div className="dialog-actions"><Button variant="outline" onClick={() => setConfirmCancel(false)}>Ở lại</Button><Button onClick={() => navigate(`/lecturer/subjects/${subjectId}/rubrics`)}>Rời trang</Button></div></Dialog>
  </section>
}
