import { useRef, useState, type ChangeEvent, type DragEvent } from 'react'
import { useParams } from 'react-router-dom'
import { EmptyState, LoadingPage, StatusBadge } from '../../components/common/states'
import { Alert, Button, Dialog, Progress, Spinner } from '../../components/ui/primitives'
import { useDeleteMaterial, useMaterials, useRetryMaterial, useUploadMaterials } from './material-hooks'
import { formatFileSize, MAX_MATERIAL_SELECTION, validateMaterialFiles } from './material-validation'
import type { CourseMaterial, MaterialFileIssue } from './material-types'
import './course-materials.css'

const statusMeta: Record<CourseMaterial['status'], { label: string; tone: 'neutral' | 'info' | 'success' | 'danger' }> = {
  UPLOADING: { label: 'Đang tải lên', tone: 'info' }, PROCESSING: { label: 'Đang xử lý', tone: 'info' }, READY: { label: 'Sẵn sàng', tone: 'success' }, FAILED: { label: 'Xử lý thất bại', tone: 'danger' },
}
const date = (value: string) => new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short' }).format(new Date(value))

export function CourseMaterialsPage() {
  const { subjectId = '' } = useParams()
  const materials = useMaterials(subjectId)
  const upload = useUploadMaterials()
  const retry = useRetryMaterial()
  const remove = useDeleteMaterial()
  const input = useRef<HTMLInputElement>(null)
  const [selected, setSelected] = useState<File[]>([])
  const [rejected, setRejected] = useState<MaterialFileIssue[]>([])
  const [dragging, setDragging] = useState(false)
  const [target, setTarget] = useState<CourseMaterial | null>(null)
  const addFiles = (files: FileList | File[]) => {
    const next = validateMaterialFiles(Array.from(files), [...(materials.data ?? []), ...selected.map((file, index) => ({ id: `pending-${index}`, subjectId, filename: file.name, extension: 'TXT' as const, size: file.size, status: 'UPLOADING' as const, uploadedAt: '', updatedAt: '' }))])
    setSelected((current) => [...current, ...next.accepted])
    setRejected((current) => [...current, ...next.rejected])
  }
  const onFiles = (event: ChangeEvent<HTMLInputElement>) => { if (event.target.files) addFiles(event.target.files); event.target.value = '' }
  const drop = (event: DragEvent<HTMLDivElement>) => { event.preventDefault(); setDragging(false); addFiles(event.dataTransfer.files) }
  const clearSelection = () => { setSelected([]); setRejected([]) }
  const startUpload = () => upload.mutate({ subjectId, files: selected }, { onSuccess: clearSelection })
  if (!subjectId) return <EmptyState title="Thiếu học phần" description="Không thể xác định học phần để tải học liệu." />
  const data = materials.data ?? []
  return <section className="materials-page">
    <header className="materials-head"><div><p className="eyebrow">KHO LƯU TRỮ HỌC LIỆU · NGUỒN THAM KHẢO AI</p><h1>Tài liệu môn học</h1><p>Quản lý tài liệu tham khảo theo từng học phần. Tài liệu sẵn sàng sẽ là nguồn tiềm năng cho tính năng sinh câu hỏi AI trong tương lai.</p></div></header>
    <section className="material-upload" aria-labelledby="upload-title"><div className={`material-dropzone ${dragging ? 'dragging' : ''}`} onDragEnter={() => setDragging(true)} onDragLeave={() => setDragging(false)} onDragOver={(event) => event.preventDefault()} onDrop={drop}>
      <span aria-hidden="true" className="drop-icon">⇧</span><h2 id="upload-title">Kéo thả tài liệu vào đây</h2><p>PDF, DOCX, PPTX hoặc TXT · tối đa 25 MB mỗi tệp · tối đa {MAX_MATERIAL_SELECTION} tệp một lần</p><label className="button outline" htmlFor="material-files">Chọn tệp từ máy tính</label><input accept=".pdf,.docx,.pptx,.txt" aria-label="Chọn tài liệu môn học" id="material-files" multiple onChange={onFiles} ref={input} type="file" />
    </div>
    {(selected.length > 0 || rejected.length > 0) && <div className="material-selection" aria-live="polite"><div><h3>Tệp đã chọn ({selected.length})</h3>{selected.map((file) => <div className="selected-material" key={`${file.name}-${file.size}`}><span>{file.name}</span><span>{formatFileSize(file.size)}</span><Button aria-label={`Bỏ ${file.name}`} onClick={() => setSelected((current) => current.filter((item) => item !== file))} variant="outline">Bỏ</Button></div>)}</div>{rejected.length > 0 && <Alert tone="danger"><strong>{rejected.length} tệp không thể tải lên</strong><ul>{rejected.map((issue, index) => <li key={`${issue.filename}-${index}`}><strong>{issue.filename}:</strong> {issue.message}</li>)}</ul></Alert>}<footer><Button onClick={clearSelection} variant="outline">Xóa lựa chọn</Button><Button disabled={!selected.length} onClick={startUpload} pending={upload.isPending}>Tải lên {selected.length} tệp hợp lệ</Button></footer></div>}
    {upload.isPending && <div className="upload-pending" aria-live="polite"><Spinner label="Đang tải học liệu" /><span>Đang tiếp nhận tệp và chuẩn bị xử lý…</span><Progress label="Tiến trình tải lên" value={60} /></div>}
    {upload.isError && <Alert tone="danger">Không thể tải lên học liệu. Lựa chọn hợp lệ vẫn được giữ để bạn thử lại.</Alert>}
    </section>
    <section className="material-library" aria-labelledby="library-title"><div className="material-library-title"><div><p className="eyebrow">THƯ VIỆN HỌC LIỆU</p><h2 id="library-title">Tài liệu của học phần</h2></div><span>{data.length} tài liệu</span></div>
      {materials.isLoading ? <LoadingPage label="Đang tải học liệu" /> : materials.isError ? <div className="state"><Alert tone="danger">Không thể tải danh sách học liệu của học phần này.</Alert><Button onClick={() => materials.refetch()}>Thử lại</Button></div> : !data.length ? <EmptyState title="Chưa có học liệu" description="Chọn tài liệu phù hợp để chuẩn bị nguồn tham khảo cho học phần." /> : <div className="materials-table-wrap"><table><thead><tr><th>TÊN TÀI LIỆU</th><th>LOẠI</th><th>DUNG LƯỢNG</th><th>NGÀY TẢI LÊN</th><th>TRẠNG THÁI XỬ LÝ</th><th>THAO TÁC</th></tr></thead><tbody>{data.map((item) => <tr key={item.id}><td><strong>{item.filename}</strong>{item.failureMessage && <small>{item.failureMessage}</small>}</td><td>{item.extension}</td><td>{formatFileSize(item.size)}</td><td>{date(item.uploadedAt)}</td><td><StatusBadge {...statusMeta[item.status]} />{item.status === 'PROCESSING' && <Progress label="Đang chuẩn bị tài liệu" value={68} />}</td><td><div className="material-actions">{item.status === 'FAILED' && <Button disabled={retry.isPending} onClick={() => retry.mutate({ subjectId, materialId: item.id })} pending={retry.isPending && retry.variables?.materialId === item.id} variant="outline">Thử lại</Button>}<Button aria-label={`Xóa ${item.filename}`} disabled={remove.isPending} onClick={() => setTarget(item)} variant="danger">Xóa</Button></div></td></tr>)}</tbody></table></div>}
      {retry.isError && <Alert tone="danger">Không thể thử lại xử lý tài liệu. Vui lòng thử lại sau.</Alert>}
    </section>
    <Dialog open={Boolean(target)} onClose={() => setTarget(null)} title="Xóa học liệu?"><div className="delete-dialog"><p>Tài liệu <strong>{target?.filename}</strong> sẽ không còn là nguồn tham khảo cho tính năng sinh câu hỏi AI trong tương lai.</p>{remove.isError && <Alert tone="danger">Không thể xóa học liệu. Vui lòng thử lại.</Alert>}<footer><Button onClick={() => setTarget(null)} variant="outline">Hủy</Button><Button pending={remove.isPending} onClick={() => target && remove.mutate({ subjectId, materialId: target.id }, { onSuccess: () => setTarget(null) })} variant="danger">Xóa học liệu</Button></footer></div></Dialog>
  </section>
}
