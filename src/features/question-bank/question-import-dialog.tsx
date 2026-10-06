import { useRef, useState, type ChangeEvent, type DragEvent } from 'react'
import { Alert, Badge, Button, Dialog, Spinner } from '../../components/ui/primitives'
import { useRubrics } from '../rubrics/rubric-hooks'
import { useImportQuestions, useQuestionTopics } from './question-hooks'
import { parseQuestionImportFile, questionImportTemplateUrl, type QuestionImportPreview } from './question-import-parser'

export type ImportSummary = { imported: number; skipped: number; failed: number }
type Props = { open: boolean; subjectId: string; onClose: () => void; onSuccess: (summary: ImportSummary) => void }

const formatSize = (size: number) => size < 1024 ? `${size} B` : `${(size / 1024).toFixed(1)} KB`

export function QuestionImportDialog({ open, subjectId, onClose, onSuccess }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const topics = useQuestionTopics(subjectId)
  const rubrics = useRubrics(subjectId)
  const mutation = useImportQuestions()
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<QuestionImportPreview | null>(null)
  const [fileErrors, setFileErrors] = useState<string[]>([])
  const [parsing, setParsing] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [confirmImport, setConfirmImport] = useState(false)
  const [confirmClose, setConfirmClose] = useState(false)
  const reset = () => { setFile(null); setPreview(null); setFileErrors([]); setParsing(false); mutation.reset(); if (inputRef.current) inputRef.current.value = '' }
  const requestClose = () => file || preview ? setConfirmClose(true) : onClose()
  const closeDiscarding = () => { setConfirmClose(false); reset(); onClose() }
  const processFile = async (nextFile: File | undefined) => {
    if (!nextFile) return
    setFile(nextFile); setPreview(null); setFileErrors([]); mutation.reset(); setParsing(true)
    try {
      const result = await parseQuestionImportFile(nextFile, { topics: topics.data ?? [], rubrics: rubrics.data ?? [] })
      setPreview(result.preview); setFileErrors(result.fileErrors)
    } catch { setFileErrors(['Không thể đọc tệp CSV. Vui lòng chọn lại tệp hợp lệ.']) }
    finally { setParsing(false) }
  }
  const changeFile = (event: ChangeEvent<HTMLInputElement>) => void processFile(event.target.files?.[0])
  const dropFile = (event: DragEvent<HTMLLabelElement>) => { event.preventDefault(); setDragging(false); void processFile(event.dataTransfer.files[0]) }
  const validDrafts = preview?.rows.flatMap((row) => row.draft ? [row.draft] : []) ?? []
  const submit = () => {
    if (!preview?.valid || mutation.isPending) return
    setConfirmImport(false)
    mutation.mutate({ subjectId, drafts: validDrafts }, { onSuccess: (result) => { const summary = { imported: result.imported, skipped: preview.invalid, failed: result.failed }; reset(); onSuccess(summary); onClose() } })
  }
  return <>
    <Dialog open={open} onClose={requestClose} title="Nhập câu hỏi từ tệp CSV">
      <div className="import-dialog-content">
        <section className="import-intro"><p className="eyebrow">QUESTION BANK · BATCH IMPORT</p><p>Kiểm tra dữ liệu trước khi đưa các câu hợp lệ vào trạng thái bản nháp.</p><a className="button outline" download="aives-question-import-template.csv" href={questionImportTemplateUrl}>Tải tệp mẫu CSV</a></section>
        {topics.isLoading || rubrics.isLoading ? <p><Spinner label="Đang tải dữ liệu học phần" /> Đang tải dữ liệu học phần…</p> : <>
          <label className={`import-dropzone ${dragging ? 'dragging' : ''}`} htmlFor="question-import-file" onDragEnter={() => setDragging(true)} onDragLeave={() => setDragging(false)} onDragOver={(event) => event.preventDefault()} onDrop={dropFile}>
            <strong>{file ? 'Thay tệp CSV' : 'Chọn hoặc thả tệp CSV vào đây'}</strong><span>UTF-8 · tối đa 5 MB · tối đa 500 dòng dữ liệu</span>
          </label>
          <input accept=".csv,text/csv" className="import-file-input" id="question-import-file" onChange={changeFile} ref={inputRef} type="file" />
          {file && <div className="selected-file"><div><strong>{file.name}</strong><span>{formatSize(file.size)}</span></div><Button type="button" variant="outline" onClick={reset}>Đặt lại</Button></div>}
          {parsing && <p aria-live="polite"><Spinner label="Đang phân tích CSV" /> Đang phân tích và kiểm tra dữ liệu…</p>}
          {!!fileErrors.length && <Alert tone="danger"><strong>Không thể tạo bản xem trước</strong><ul>{fileErrors.map((error) => <li key={error}>{error}</li>)}</ul></Alert>}
          {preview && <ImportPreview preview={preview} />}
          {mutation.isError && <Alert tone="danger">Không thể nhập câu hỏi. Bản xem trước được giữ lại để bạn thử lại.</Alert>}
        </>}
        <footer className="import-actions"><Button type="button" variant="outline" onClick={requestClose}>Hủy bỏ</Button><Button type="button" disabled={!preview?.valid || parsing} pending={mutation.isPending} onClick={() => setConfirmImport(true)}>Nhập {preview?.valid ?? 0} câu hợp lệ</Button></footer>
      </div>
    </Dialog>
    <Dialog open={confirmImport} onClose={() => setConfirmImport(false)} title="Xác nhận nhập câu hỏi"><p>Sẽ nhập <strong>{preview?.valid ?? 0}</strong> câu hợp lệ vào học phần <strong>{subjectId}</strong> dưới trạng thái BẢN NHÁP và bỏ qua <strong>{preview?.invalid ?? 0}</strong> dòng lỗi.</p><div className="dialog-actions"><Button variant="outline" onClick={() => setConfirmImport(false)}>Quay lại kiểm tra</Button><Button onClick={submit}>Xác nhận nhập</Button></div></Dialog>
    <Dialog open={confirmClose} onClose={() => setConfirmClose(false)} title="Bỏ dữ liệu import chưa lưu?"><p>Tệp đã chọn và kết quả kiểm tra sẽ bị xóa.</p><div className="dialog-actions"><Button variant="outline" onClick={() => setConfirmClose(false)}>Tiếp tục kiểm tra</Button><Button variant="danger" onClick={closeDiscarding}>Bỏ dữ liệu</Button></div></Dialog>
  </>
}

function ImportPreview({ preview }: { preview: QuestionImportPreview }) {
  return <section aria-labelledby="import-preview-title"><div className="import-summary" aria-live="polite"><div><span>Tổng dữ liệu</span><strong>{preview.total}</strong></div><div><span>Hợp lệ</span><strong>{preview.valid}</strong></div><div><span>Dòng lỗi</span><strong>{preview.invalid}</strong></div></div><h3 id="import-preview-title">Bảng kiểm chứng dữ liệu</h3><div className="import-table-wrap"><table><thead><tr><th>Dòng</th><th>Chủ đề</th><th>Nội dung rút gọn</th><th>Bloom</th><th>Rubric</th><th>Trạng thái dữ liệu</th></tr></thead><tbody>{preview.rows.map((row) => <tr className={row.issues.length ? 'invalid-row' : ''} key={row.id}><td>{row.rowNumber}</td><td>{row.raw.topic || '—'}</td><td>{row.raw.question_text || '[Dữ liệu trống]'}</td><td>{row.raw.bloom_level || '—'}</td><td>{row.raw.rubric_name || 'Không gắn rubric'}</td><td>{row.issues.length ? <><Badge tone="danger">Không hợp lệ</Badge><ul className="issue-list">{row.issues.map((issue) => <li key={`${issue.column}-${issue.message}`}><strong>{issue.column}:</strong> {issue.message}</li>)}</ul></> : <Badge tone="success">Hợp lệ</Badge>}</td></tr>)}</tbody></table></div>{!preview.valid && <Alert tone="danger">Không có dòng hợp lệ để nhập. Hãy thay tệp sau khi sửa dữ liệu.</Alert>}<Alert tone="info">Các câu hợp lệ sau khi nhập sẽ ở trạng thái <strong>BẢN NHÁP</strong> để giảng viên kiểm duyệt.</Alert></section>
}
