import { useLecturerSubjects } from '../subjects/subject-hooks'
import { runtimeConfig } from '../../services/api/runtime-config'
import { UnsavedChangesGuard } from '../../components/common/unsaved-changes-guard'
/* oxlint-disable react/set-state-in-effect -- hydrate editor fields from server data. */
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import './rubric.css'
import { readQuestionEditorDraft } from '../question-bank/question-editor-draft'
import { RubricListView } from './views/RubricListView'
import { RubricFormView } from './views/RubricFormView'
import { EmptyState, LoadingPage } from '../../components/common/states'
import { Alert, Button, Dialog } from '../../components/ui/primitives'
import { useDeleteRubric, useGlobalRubric, useGlobalRubrics, useRubric, useRubrics, useSaveGlobalRubric, useSaveRubric } from './rubric-hooks'
import type { Rubric, RubricCriterion, RubricDraft } from './rubric-types'

const newCriterion = (): RubricCriterion => ({ id: crypto.randomUUID(), name: '', maximumScore: '', description: '' })

function DeleteRubricDialog({ rubric, open, pending, error, onClose, onConfirm }: { rubric: Rubric | null; open: boolean; pending: boolean; error: Error | null; onClose: () => void; onConfirm: () => void }) {
  return <Dialog open={open} onClose={() => { if (!pending) onClose() }} title="Xóa Rubric?"><p>Bạn có chắc muốn xóa “{rubric?.name}” không?</p><p className="form-help">Các câu hỏi đang sử dụng Rubric này có thể không còn Rubric chấm điểm.</p>{error && <Alert tone="danger">{error.message || 'Không thể xóa Rubric. Vui lòng thử lại.'}</Alert>}<div className="dialog-actions"><Button type="button" variant="outline" disabled={pending} onClick={onClose}>Hủy</Button><Button type="button" variant="danger" pending={pending} onClick={onConfirm}>Xóa Rubric</Button></div></Dialog>
}

export function RubricListPage() {
  const { subjectId = '' } = useParams(); const query = useRubrics(subjectId); const remove = useDeleteRubric(subjectId); const [target, setTarget] = useState<Rubric | null>(null); const [feedback, setFeedback] = useState(''); const [search, setSearch] = useState('')
  const confirmDelete = () => { if (!target || remove.isPending) return; remove.mutate(target.id, { onSuccess: () => { setFeedback(`Đã xóa Rubric “${target.name}”.`); setTarget(null) } }) }
  if (!subjectId) return <EmptyState title="Thiếu học phần" description="Không thể xác định học phần để tải rubric." />
  return <><RubricListView subjectId={subjectId} rows={(query.data ?? []).filter(item => item.name.toLocaleLowerCase().includes(search.toLocaleLowerCase()))} search={search} onSearch={setSearch} pending={remove.isPending} onDelete={rubric => { setFeedback(''); setTarget(rubric) }} feedback={<>{feedback && <Alert tone="success">{feedback}</Alert>}{query.isLoading && <LoadingPage label="Đang tải rubric" />}{query.isError && <Alert tone="danger">Không thể tải danh sách rubric. <Button onClick={() => query.refetch()}>Thử lại</Button></Alert>}</>} />
    <DeleteRubricDialog rubric={target} open={Boolean(target)} pending={remove.isPending} error={remove.error as Error | null} onClose={() => { if (!remove.isPending) { remove.reset(); setTarget(null) } }} onConfirm={confirmDelete} />
  </>
}

type FieldErrors = { name?: string; criteria?: Record<string, { name?: string; maximumScore?: string }> }
function validate(name: string, criteria: RubricCriterion[]): FieldErrors { const errors: FieldErrors = {}; if (!name.trim()) errors.name = 'Nhập tên rubric.'; if (!criteria.length) errors.criteria = { list: { name: 'Cần có ít nhất một tiêu chí.' } }; for (const criterion of criteria) { const row: { name?: string; maximumScore?: string } = {}; if (!criterion.name.trim()) row.name = 'Nhập tên tiêu chí.'; if (!criterion.maximumScore.trim() || !Number.isFinite(Number(criterion.maximumScore)) || Number(criterion.maximumScore) <= 0) row.maximumScore = 'Nhập điểm tối đa lớn hơn 0.'; if (Object.keys(row).length) errors.criteria = { ...errors.criteria, [criterion.id]: row } } return errors }
const hasErrors = (errors: FieldErrors) => Boolean(errors.name || errors.criteria)

export function RubricEditorPage() {
  const { subjectId = '', rubricId } = useParams(); const navigate = useNavigate(); const rubricQuery = useRubric(subjectId, rubricId); const save = useSaveRubric(); const remove = useDeleteRubric(subjectId)
  const savedNavigation = useRef(false)
  const [name, setName] = useState(''); const [description, setDescription] = useState(''); const [criteria, setCriteria] = useState<RubricCriterion[]>([newCriterion()]); const [dirty, setDirty] = useState(false); const [errors, setErrors] = useState<FieldErrors>({}); const [confirmCancel, setConfirmCancel] = useState(false); const [confirmDelete, setConfirmDelete] = useState(false); const editMode = Boolean(rubricId)
  useEffect(() => { if (rubricQuery.data) { setName(rubricQuery.data.name); setDescription(rubricQuery.data.description ?? ''); setCriteria(rubricQuery.data.criteria); setDirty(false) } }, [rubricQuery.data])
  const updateCriterion = (id: string, key: keyof Omit<RubricCriterion, 'id'>, value: string) => { setCriteria((all) => all.map((criterion) => criterion.id === id ? { ...criterion, [key]: value } : criterion)); setDirty(true) }
  const exit = () => dirty ? setConfirmCancel(true) : navigate(`/lecturer/subjects/${subjectId}/rubrics`)
  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); const nextErrors = validate(name, criteria); setErrors(nextErrors); if (hasErrors(nextErrors)) return; const draft: RubricDraft & { id?: string } = { id: rubricId, subjectId, name: name.trim(), description: description.trim(), criteria }; save.mutate(draft, { onSuccess: () => { savedNavigation.current = true; setDirty(false); navigate(`/lecturer/subjects/${subjectId}/rubrics`) } }) }
  const deleteCurrent = () => { if (!rubricId || remove.isPending) return; remove.mutate(rubricId, { onSuccess: () => { savedNavigation.current = true; setDirty(false); setConfirmDelete(false); navigate(`/lecturer/subjects/${subjectId}/rubrics`) } }) }
  if (!subjectId) return <EmptyState title="Thiếu học phần" description="Không thể xác định học phần để soạn rubric." />
  if (editMode && rubricQuery.isLoading) return <LoadingPage label="Đang tải rubric" />
  if (editMode && rubricQuery.isError) return <section className="state"><Alert tone="danger">Không thể tải rubric. Vui lòng thử lại.</Alert><Button onClick={() => rubricQuery.refetch()}>Thử lại</Button></section>
  if (editMode && !rubricQuery.data) return <section className="state"><h1>Không tìm thấy rubric</h1><Link className="button outline" to={`/lecturer/subjects/${subjectId}/rubrics`}>Về danh sách rubric</Link></section>
  return <><UnsavedChangesGuard when={dirty && !confirmCancel} allow={() => savedNavigation.current} /><RubricFormView name={name} description={description} criteria={criteria} edit={editMode} pending={save.isPending || remove.isPending} errors={errors} onName={value => { setName(value); setDirty(true) }} onDescription={value => { setDescription(value); setDirty(true) }} onCriterion={updateCriterion} onAdd={() => { setCriteria(all => [...all, newCriterion()]); setDirty(true) }} onRemove={id => { setCriteria(all => all.filter(item => item.id !== id)); setDirty(true) }} onSubmit={submit} onCancel={exit} onDelete={() => setConfirmDelete(true)} feedback={<>{save.isError && <Alert tone="danger">Không thể lưu rubric. Vui lòng thử lại.</Alert>}{remove.error && <Alert tone="danger">{remove.error.message}</Alert>}</>} /><Dialog open={confirmCancel} onClose={() => setConfirmCancel(false)} title="Rời trang soạn rubric?"><p>Các thay đổi chưa lưu sẽ bị mất.</p><div className="dialog-actions"><Button type="button" variant="outline" onClick={() => setConfirmCancel(false)}>Ở lại</Button><Button type="button" onClick={() => navigate(`/lecturer/subjects/${subjectId}/rubrics`)}>Rời trang</Button></div></Dialog><DeleteRubricDialog rubric={rubricQuery.data ?? null} open={confirmDelete} pending={remove.isPending} error={remove.error as Error | null} onClose={() => { if (!remove.isPending) { remove.reset(); setConfirmDelete(false) } }} onConfirm={deleteCurrent} /></>
}

const safeReturnTo = (value: unknown) => typeof value === 'string' && value.startsWith('/lecturer/') ? value : '/lecturer/rubrics'

import { Award, Plus } from 'lucide-react'

function GlobalRubricHeader({ mode = 'list' }: { mode?: 'list' | 'create' | 'edit' }) {
  return (
    <header className="rubric-hero-card">
      <div className="rubric-hero-content">
        <div className="rubric-hero-tagline">
          <span className="rubric-badge-pill">
            <Award size={13} />
            <span>NGÂN HÀNG KHẢO THÍ · RUBRIC</span>
          </span>
        </div>
        <h1 className="rubric-hero-title">
          {mode === 'list' ? 'Quản lý Rubric' : mode === 'edit' ? 'Chỉnh sửa Rubric' : 'Tạo Rubric'}
        </h1>
      </div>
      {mode === 'list' && (
        <div className="rubric-hero-actions">
          <Link className="button primary gap-2" to="new">
            <Plus size={16} />
            <span>Tạo Rubric</span>
          </Link>
        </div>
      )}
    </header>
  )
}

export function GlobalRubricListPage() {
  const query = useGlobalRubrics(); const remove = useDeleteRubric(); const [target, setTarget] = useState<Rubric | null>(null); const [search, setSearch] = useState(''); const [feedback, setFeedback] = useState('')
  const rows = (query.data ?? []).filter((item) => item.name.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase()))
  if (query.isLoading) return <section className="rubric-page"><GlobalRubricHeader /><LoadingPage label="Đang tải Rubric" /></section>
  if (query.isError) return <section className="rubric-page"><GlobalRubricHeader /><section className="state"><Alert tone="danger">Không thể tải danh sách Rubric.</Alert><Button onClick={() => query.refetch()}>Thử lại</Button></section></section>
  return <><RubricListView rows={rows} search={search} onSearch={setSearch} pending={remove.isPending} onDelete={rubric => { setFeedback(''); setTarget(rubric) }} feedback={feedback && <Alert tone="success">{feedback}</Alert>} /><DeleteRubricDialog rubric={target} open={Boolean(target)} pending={remove.isPending} error={remove.error as Error | null} onClose={() => { remove.reset(); setTarget(null) }} onConfirm={() => target && remove.mutate({ rubricId: target.id, subjectId: target.subjectId }, { onSuccess: () => { setFeedback(`Đã xóa Rubric “${target.name}”.`); setTarget(null) } })} /></>
}

export function GlobalRubricEditorPage() {
  const { rubricId } = useParams(); const location = useLocation(); const navigate = useNavigate(); const existing = useGlobalRubric(rubricId); const save = useSaveGlobalRubric(); const remove = useDeleteRubric(); const editMode = Boolean(rubricId); const returnTo = safeReturnTo((location.state as { returnTo?: string } | null)?.returnTo)
  const subjects = useLecturerSubjects()
  const [selectedSubjectId, setSelectedSubjectId] = useState('')
  const courseId = existing.data?.subjectId || selectedSubjectId
  const apiMode = runtimeConfig.dataSource === 'api'
  const courseReady = !apiMode || (Boolean(courseId) && Boolean(subjects.data?.some(subject => subject.id === courseId)))
  const savedNavigation = useRef(false)
  const [name, setName] = useState(''); const [description, setDescription] = useState(''); const [criteria, setCriteria] = useState<RubricCriterion[]>([newCriterion()]); const [dirty, setDirty] = useState(false); const [errors, setErrors] = useState<FieldErrors>({}); const [confirmCancel, setConfirmCancel] = useState(false); const [confirmDelete, setConfirmDelete] = useState(false)
  // oxlint-disable-next-line react/set-state-in-effect
  useEffect(() => { if (existing.data) { setName(existing.data.name); setDescription(existing.data.description ?? ''); setCriteria(existing.data.criteria); setDirty(false) } }, [existing.data])
  if (editMode && existing.isLoading) return <section className="rubric-page"><GlobalRubricHeader mode="edit" /><LoadingPage label="Đang tải Rubric" /></section>
  if (editMode && existing.isError) return <section className="rubric-page"><GlobalRubricHeader mode="edit" /><section className="state"><Alert tone="danger">Không thể tải Rubric.</Alert><Button onClick={() => existing.refetch()}>Thử lại</Button></section></section>
  if (editMode && !existing.data) return <section className="rubric-page"><GlobalRubricHeader mode="edit" /><section className="state"><h2>Không tìm thấy Rubric</h2><Link className="button outline" to="/lecturer/rubrics">Về danh sách Rubric</Link></section></section>
  const updateCriterion = (id: string, key: keyof Omit<RubricCriterion, 'id'>, value: string) => { setCriteria((all) => all.map((item) => item.id === id ? { ...item, [key]: value } : item)); setDirty(true) }
  const returnState = readQuestionEditorDraft(location.state)
  const exit = () => dirty ? setConfirmCancel(true) : navigate(returnTo, { state: returnState ? { questionDraft: returnState } : undefined })
  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); const next = validate(name, criteria); setErrors(next); if (hasErrors(next) || !courseReady) return; save.mutate({ id: rubricId, subjectId: courseId, name: name.trim(), description: description.trim(), criteria }, { onSuccess: (rubric) => { savedNavigation.current = true; setDirty(false); navigate(returnTo, { state: readQuestionEditorDraft(location.state) ? { questionDraft: { ...readQuestionEditorDraft(location.state), rubricId: rubric.id } } : undefined }) } }) }
  return <><UnsavedChangesGuard when={dirty && !confirmCancel} allow={() => savedNavigation.current} /><RubricFormView saveDisabled={!courseReady || (apiMode && (subjects.isPending || subjects.isError))} courseField={apiMode && <div><label className="block space-y-1 text-xs font-medium text-slate-700">Môn học (bắt buộc)<select value={courseId} disabled={editMode || subjects.isPending || save.isPending} onChange={event => { setSelectedSubjectId(event.target.value); setDirty(true) }} className="w-full border border-slate-200 rounded-lg p-3"><option value="">Chọn môn học</option>{subjects.data?.map(subject => <option key={subject.id} value={subject.id}>{subject.code} · {subject.name}</option>)}</select></label>{subjects.isPending && <p role="status">Đang tải môn học…</p>}{subjects.isError && <Alert tone="danger">Không thể tải môn học. <Button type="button" onClick={() => subjects.refetch()}>Thử lại</Button></Alert>}{subjects.isSuccess && !subjects.data.length && <p>Chưa được phân công môn học. Liên hệ quản trị viên để được phân công.</p>}</div>} name={name} description={description} criteria={criteria} edit={editMode} pending={save.isPending || remove.isPending} errors={errors} onName={value => { setName(value); setDirty(true) }} onDescription={value => { setDescription(value); setDirty(true) }} onCriterion={updateCriterion} onAdd={() => { setCriteria(all => [...all, newCriterion()]); setDirty(true) }} onRemove={id => { setCriteria(all => all.filter(item => item.id !== id)); setDirty(true) }} onSubmit={submit} onCancel={exit} onDelete={() => setConfirmDelete(true)} feedback={<>{save.isError && <Alert tone="danger">{save.error instanceof Error ? save.error.message : 'Không thể lưu Rubric.'}</Alert>}{remove.isError && <Alert tone="danger">{remove.error instanceof Error ? remove.error.message : 'Không thể xóa Rubric.'}</Alert>}</>} /><Dialog open={confirmCancel} onClose={() => setConfirmCancel(false)} title="Rời trang soạn Rubric?"><p>Các thay đổi chưa lưu sẽ bị mất.</p><div className="dialog-actions"><Button variant="outline" onClick={() => setConfirmCancel(false)}>Ở lại</Button><Button onClick={() => navigate(returnTo, { state: returnState ? { questionDraft: returnState } : undefined })}>Rời trang</Button></div></Dialog><Dialog open={confirmDelete} onClose={() => setConfirmDelete(false)} title="Xóa Rubric?"><p>Thao tác này không thể hoàn tác.</p><div className="dialog-actions"><Button variant="outline" onClick={() => setConfirmDelete(false)}>Hủy</Button><Button variant="danger" pending={remove.isPending} onClick={() => rubricId && remove.mutate({ rubricId, subjectId: courseId }, { onSuccess: () => { savedNavigation.current = true; navigate(returnTo) } })}>Xóa Rubric</Button></div></Dialog></>
}
