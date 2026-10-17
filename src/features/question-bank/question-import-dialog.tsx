import { useRef, useState, type ChangeEvent, type DragEvent } from 'react'
import { Alert, Badge, Button, Dialog, Spinner } from '../../components/ui/primitives'
import { useRubrics } from '../rubrics/rubric-hooks'
import { useApiDownloadTemplate, useApiImportQuestions, useImportQuestions, useQuestionTopics } from './question-hooks'
import { parseQuestionImportFile, questionImportTemplateUrl, type QuestionImportPreview } from './question-import-parser'
import { runtimeConfig } from '../../services/api/runtime-config'
import type { ImportErrorDto } from './api-question-repository'

export type ImportSummary = { imported: number; skipped: number; failed: number }
type Props = { open: boolean; subjectId: string; onClose: () => void; onSuccess: (summary: ImportSummary) => void }

const formatSize = (size: number) => size < 1024 ? `${size} B` : `${(size / 1024).toFixed(1)} KB`

export function QuestionImportDialog({ open, subjectId, onClose, onSuccess }: Props) {
  const isApi = runtimeConfig.dataSource === 'api'
  const inputRef = useRef<HTMLInputElement>(null)
  const topics = useQuestionTopics(subjectId)
  const rubrics = useRubrics(subjectId)
  const mockMutation = useImportQuestions()
  const apiMutation = useApiImportQuestions()
  const apiDownload = useApiDownloadTemplate()

  const [file, setFile] = useState<File | null>(null)
  const [defaultRubricId, setDefaultRubricId] = useState<string>('')
  const [preview, setPreview] = useState<QuestionImportPreview | null>(null)
  const [fileErrors, setFileErrors] = useState<string[]>([])
  const [backendErrors, setBackendErrors] = useState<ImportErrorDto[]>([])
  const [parsing, setParsing] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [confirmImport, setConfirmImport] = useState(false)
  const [confirmClose, setConfirmClose] = useState(false)

  const isPending = mockMutation.isPending || apiMutation.isPending || apiDownload.isPending

  const reset = () => {
    setFile(null)
    setDefaultRubricId('')
    setPreview(null)
    setFileErrors([])
    setBackendErrors([])
    setParsing(false)
    mockMutation.reset()
    apiMutation.reset()
    if (inputRef.current) inputRef.current.value = ''
  }

  const requestClose = () => (file || preview ? setConfirmClose(true) : onClose())
  const closeDiscarding = () => {
    setConfirmClose(false)
    reset()
    onClose()
  }

  const processFile = async (nextFile: File | undefined) => {
    if (!nextFile) return
    setFile(nextFile)
    setPreview(null)
    setFileErrors([])
    setBackendErrors([])
    mockMutation.reset()
    apiMutation.reset()

    if (!isApi) {
      setParsing(true)
      try {
        const result = await parseQuestionImportFile(nextFile, {
          topics: topics.data ?? [],
          rubrics: rubrics.data ?? [],
        })
        setPreview(result.preview)
        setFileErrors(result.fileErrors)
      } catch {
        setFileErrors(['Không thể đọc tệp CSV. Vui lòng chọn lại tệp hợp lệ.'])
      } finally {
        setParsing(false)
      }
    }
  }

  const changeFile = (event: ChangeEvent<HTMLInputElement>) => void processFile(event.target.files?.[0])
  const dropFile = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault()
    setDragging(false)
    void processFile(event.dataTransfer.files[0])
  }

  const handleDownloadTemplate = async () => {
    if (!isApi) return
    try {
      const blob = await apiDownload.mutateAsync(subjectId)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `aives-question-import-template-${subjectId}.xlsx`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (e: any) {
      setFileErrors([e.message || 'Không thể tải tệp mẫu Excel từ máy chủ.'])
    }
  }

  const submit = () => {
    setConfirmImport(false)
    if (isApi) {
      if (!file) return
      apiMutation.mutate(
        { courseId: subjectId, file, defaultRubricId: defaultRubricId || undefined },
        {
          onSuccess: (result) => {
            if (result.errors && result.errors.length > 0) {
              setBackendErrors(result.errors)
            } else {
              reset()
              onSuccess({ imported: result.importedCount, skipped: 0, failed: 0 })
              onClose()
            }
          },
          onError: (err: any) => {
            setFileErrors([err.message || 'Lỗi khi nhập câu hỏi từ máy chủ.'])
          },
        }
      )
      return
    }

    const validDrafts = preview?.rows.flatMap((row) => (row.draft ? [row.draft] : [])) ?? []
    if (!preview?.valid || mockMutation.isPending) return
    mockMutation.mutate(
      { subjectId, drafts: validDrafts },
      {
        onSuccess: (result) => {
          const summary = { imported: result.imported, skipped: preview.invalid, failed: result.failed }
          reset()
          onSuccess(summary)
          onClose()
        },
      }
    )
  }

  return (
    <>
      <Dialog open={open} onClose={requestClose} title={isApi ? 'Nhập câu hỏi từ tệp Excel (.xlsx)' : 'Nhập câu hỏi từ tệp CSV'}>
        <div className="import-dialog-content">
          <section className="import-intro">
            <p className="eyebrow">NGÂN HÀNG CÂU HỎI · NHẬP HÀNG LOẠT</p>
            <p>
              {isApi
                ? 'Tải tệp mẫu Excel (.xlsx), điền câu hỏi và tải lên để hệ thống kiểm tra và lưu dưới trạng thái BẢN NHÁP.'
                : 'Kiểm tra dữ liệu trước khi đưa các câu hợp lệ vào trạng thái bản nháp.'}
            </p>
            {isApi ? (
              <Button type="button" variant="outline" onClick={handleDownloadTemplate} pending={apiDownload.isPending}>
                Tải tệp mẫu Excel (.xlsx)
              </Button>
            ) : (
              <a className="button outline" download="aives-question-import-template.csv" href={questionImportTemplateUrl}>
                Tải tệp mẫu CSV
              </a>
            )}
          </section>

          {isApi && (
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label htmlFor="default-rubric-select" style={{ display: 'block', fontWeight: 500, marginBottom: '0.25rem' }}>
                Rubric mặc định (tùy chọn)
              </label>
              <select
                id="default-rubric-select"
                className="input"
                value={defaultRubricId}
                onChange={(e) => setDefaultRubricId(e.target.value)}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              >
                <option value="">-- Không gắn rubric mặc định --</option>
                {(rubrics.data ?? []).map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
              <small style={{ color: '#64748b' }}>Nếu trong file Excel dòng nào không có rubricId, hệ thống sẽ gán rubric này.</small>
            </div>
          )}

          {!isApi && (topics.isLoading || rubrics.isLoading) ? (
            <p>
              <Spinner label="Đang tải dữ liệu học phần" /> Đang tải dữ liệu học phần…
            </p>
          ) : (
            <>
              <label
                className={`import-dropzone ${dragging ? 'dragging' : ''}`}
                htmlFor="question-import-file"
                onDragEnter={() => setDragging(true)}
                onDragLeave={() => setDragging(false)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={dropFile}
              >
                <strong>{file ? `Thay tệp ${isApi ? 'Excel' : 'CSV'}` : `Chọn hoặc thả tệp ${isApi ? 'Excel (.xlsx)' : 'CSV'} vào đây`}</strong>
                <span>{isApi ? '.xlsx · tối đa 25 MB' : 'UTF-8 · tối đa 5 MB · tối đa 500 dòng dữ liệu'}</span>
              </label>
              <input
                accept={isApi ? '.xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' : '.csv,text/csv'}
                className="import-file-input"
                id="question-import-file"
                onChange={changeFile}
                ref={inputRef}
                type="file"
              />
              {file && (
                <div className="selected-file">
                  <div>
                    <strong>{file.name}</strong>
                    <span>{formatSize(file.size)}</span>
                  </div>
                  <Button type="button" variant="outline" onClick={reset}>
                    Đặt lại
                  </Button>
                </div>
              )}
              {parsing && (
                <p aria-live="polite">
                  <Spinner label="Đang phân tích" /> Đang phân tích và kiểm tra dữ liệu…
                </p>
              )}
              {!!fileErrors.length && (
                <Alert tone="danger">
                  <strong>Có lỗi xảy ra</strong>
                  <ul>
                    {fileErrors.map((error, idx) => (
                      <li key={idx}>{error}</li>
                    ))}
                  </ul>
                </Alert>
              )}
              {backendErrors.length > 0 && (
                <section aria-labelledby="backend-errors-title" style={{ marginTop: '1rem' }}>
                  <Alert tone="danger">
                    <strong>Import thất bại ({backendErrors.length} lỗi)</strong>
                    <p style={{ margin: '0.25rem 0' }}>Backend không lưu dòng nào khi có lỗi. Vui lòng sửa lại tệp Excel theo các dòng sau:</p>
                    <div className="import-table-wrap" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                      <table>
                        <thead>
                          <tr>
                            <th>Dòng (Excel)</th>
                            <th>Trường</th>
                            <th>Mô tả lỗi</th>
                          </tr>
                        </thead>
                        <tbody>
                          {backendErrors.map((err, idx) => (
                            <tr key={idx}>
                              <td><strong>{err.row}</strong></td>
                              <td><code>{err.field}</code></td>
                              <td>{err.message}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Alert>
                </section>
              )}
              {preview && <ImportPreview preview={preview} />}
              {(mockMutation.isError || apiMutation.isError) && (
                <Alert tone="danger">Không thể nhập câu hỏi. Vui lòng kiểm tra lại kết nối và dữ liệu.</Alert>
              )}
            </>
          )}
          <footer className="import-actions">
            <Button type="button" variant="outline" onClick={requestClose}>
              Hủy bỏ
            </Button>
            <Button
              type="button"
              disabled={isApi ? !file || isPending : !preview?.valid || parsing || isPending}
              pending={isPending}
              onClick={() => setConfirmImport(true)}
            >
              {isApi ? 'Bắt đầu Import' : `Nhập ${preview?.valid ?? 0} câu hợp lệ`}
            </Button>
          </footer>
        </div>
      </Dialog>
      <Dialog open={confirmImport} onClose={() => setConfirmImport(false)} title="Xác nhận nhập câu hỏi">
        <p>
          {isApi
            ? `Sẽ gửi tệp ${file?.name} lên máy chủ để import câu hỏi vào học phần dưới trạng thái BẢN NHÁP.`
            : `Sẽ nhập ${preview?.valid ?? 0} câu hợp lệ vào học phần ${subjectId} dưới trạng thái BẢN NHÁP và bỏ qua ${preview?.invalid ?? 0} dòng lỗi.`}
        </p>
        <div className="dialog-actions">
          <Button variant="outline" onClick={() => setConfirmImport(false)}>
            Quay lại kiểm tra
          </Button>
          <Button onClick={submit} pending={isPending}>
            Xác nhận nhập
          </Button>
        </div>
      </Dialog>
      <Dialog open={confirmClose} onClose={() => setConfirmClose(false)} title="Bỏ dữ liệu import chưa lưu?">
        <p>Tệp đã chọn và kết quả kiểm tra sẽ bị xóa.</p>
        <div className="dialog-actions">
          <Button variant="outline" onClick={() => setConfirmClose(false)}>
            Tiếp tục kiểm tra
          </Button>
          <Button variant="danger" onClick={closeDiscarding}>
            Bỏ dữ liệu
          </Button>
        </div>
      </Dialog>
    </>
  )
}

function ImportPreview({ preview }: { preview: QuestionImportPreview }) {
  return (
    <section aria-labelledby="import-preview-title">
      <div className="import-summary" aria-live="polite">
        <div>
          <span>Tổng dữ liệu</span>
          <strong>{preview.total}</strong>
        </div>
        <div>
          <span>Hợp lệ</span>
          <strong>{preview.valid}</strong>
        </div>
        <div>
          <span>Dòng lỗi</span>
          <strong>{preview.invalid}</strong>
        </div>
      </div>
      <h3 id="import-preview-title">Bảng kiểm chứng dữ liệu</h3>
      <div className="import-table-wrap">
        <table>
          <thead>
            <tr>
              <th>Dòng</th>
              <th>Chủ đề</th>
              <th>Nội dung rút gọn</th>
              <th>Bloom</th>
              <th>Rubric</th>
              <th>Trạng thái dữ liệu</th>
            </tr>
          </thead>
          <tbody>
            {preview.rows.map((row) => (
              <tr className={row.issues.length ? 'invalid-row' : ''} key={row.id}>
                <td>{row.rowNumber}</td>
                <td>{row.raw.topic || '—'}</td>
                <td>{row.raw.question_text || '[Dữ liệu trống]'}</td>
                <td>{row.raw.bloom_level || '—'}</td>
                <td>{row.raw.rubric_name || 'Không gắn rubric'}</td>
                <td>
                  {row.issues.length ? (
                    <>
                      <Badge tone="danger">Không hợp lệ</Badge>
                      <ul className="issue-list">
                        {row.issues.map((issue) => (
                          <li key={`${issue.column}-${issue.message}`}>
                            <strong>{issue.column}:</strong> {issue.message}
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : (
                    <Badge tone="success">Hợp lệ</Badge>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!preview.valid && <Alert tone="danger">Không có dòng hợp lệ để nhập. Hãy thay tệp sau khi sửa dữ liệu.</Alert>}
      <Alert tone="info">
        Các câu hợp lệ sau khi nhập sẽ ở trạng thái <strong>BẢN NHÁP</strong> để giảng viên kiểm duyệt.
      </Alert>
    </section>
  )
}
