import { useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { EmptyState } from '../../components/common/states'
import { Alert, Button, Input, Skeleton } from '../../components/ui/primitives'
import { useQuestions } from './question-hooks'
import { QuestionImportDialog, type ImportSummary } from './question-import-dialog'
import './question-import.css'

export function QuestionBankPage() {
  const { subjectId = '' } = useParams()
  const [params, setParams] = useSearchParams()
  const query = useQuestions(subjectId)
  const [importOpen, setImportOpen] = useState(false)
  const [importResult, setImportResult] = useState<ImportSummary | null>(null)
  if (!subjectId) return <EmptyState title="Thiếu học phần" description="Không thể xác định học phần để tải ngân hàng câu hỏi." />
  const data = query.data ?? []
  const q = params.get('q') ?? ''
  const topic = params.get('topic') ?? ''
  const bloom = params.get('bloom') ?? ''
  const status = params.get('status') ?? ''
  const page = Math.max(1, Number(params.get('page') ?? 1))
  const set = (key: string, value: string) => setParams((current) => { const next = new URLSearchParams(current); if (value) next.set(key, value); else next.delete(key); next.set('page', '1'); return next })
  const filtered = data.filter((item) => (!q || `${item.id} ${item.content}`.toLocaleLowerCase().includes(q.toLocaleLowerCase())) && (!topic || item.topic === topic) && (!bloom || item.bloom === bloom) && (!status || item.status === status))
  const pageSize = 4
  const slice = filtered.slice((page - 1) * pageSize, page * pageSize)
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize))
  return <section className="question-bank"><header className="qb-head"><div><p className="eyebrow">KHOA HỌC MÁY TÍNH & CÔNG NGHỆ THÔNG TIN · KHO DỮ LIỆU ĐỀ THI</p><h1>Ngân hàng câu hỏi vấn đáp</h1><p>Lưu trữ, kiểm định và phân bổ câu hỏi vấn đáp tiêu chuẩn hóa với sự trợ giúp của AI kiểm định.</p></div><div className="qb-actions"><Link className="button primary" to="generate">Sinh câu hỏi AI</Link><Button variant="outline" onClick={() => { setImportResult(null); setImportOpen(true) }}>Import CSV</Button><Link className="button outline" to="new">Tạo câu hỏi mới</Link></div></header>
    {importResult && <Alert tone="success"><strong>Import hoàn tất:</strong> {importResult.imported} câu đã nhập ở trạng thái BẢN NHÁP, {importResult.skipped} dòng lỗi đã bỏ qua, {importResult.failed} dòng lưu thất bại.</Alert>}
    <div className="qb-summary">TRẠNG THÁI LƯU TRỮ: ĐÃ DUYỆT · CHỜ DUYỆT · BẢN NHÁP</div><div className="qb-filters"><label>Tìm kiếm<Input value={q} onChange={(event) => set('q', event.target.value)} placeholder="Nội dung, mã câu hỏi..." /></label><label>Chủ đề<select value={topic} onChange={(event) => set('topic', event.target.value)}><option value="">Tất cả</option>{[...new Set(data.map((item) => item.topic))].map((item) => <option key={item}>{item}</option>)}</select></label><label>Bloom<select value={bloom} onChange={(event) => set('bloom', event.target.value)}><option value="">Tất cả mức</option>{['NHỚ', 'HIỂU', 'VẬN DỤNG', 'PHÂN TÍCH'].map((item) => <option key={item}>{item}</option>)}</select></label><label>Trạng thái<select value={status} onChange={(event) => set('status', event.target.value)}><option value="">Tất cả</option>{['ĐÃ DUYỆT', 'CHỜ DUYỆT', 'BẢN NHÁP'].map((item) => <option key={item}>{item}</option>)}</select></label><Button variant="outline" onClick={() => setParams({})}>Đặt lại</Button></div>
    {query.isLoading ? <div className="state"><Skeleton /><Skeleton /><Skeleton /></div> : query.isError ? <div className="state"><Alert tone="danger">Không thể tải ngân hàng câu hỏi.</Alert><Button onClick={() => query.refetch()}>Thử lại</Button></div> : !data.length ? <div className="state"><h2>Chưa có câu hỏi</h2><p>Hãy tạo hoặc import câu hỏi khi được cấp quyền.</p></div> : !filtered.length ? <div className="state"><h2>Không tìm thấy kết quả</h2><p>Thử thay đổi từ khoá hoặc bộ lọc.</p><Button variant="outline" onClick={() => setParams({})}>Xóa bộ lọc</Button></div> : <><div className="qb-table-wrap"><table><thead><tr><th>MÃ & NỘI DUNG CÂU HỎI</th><th>CHỦ ĐỀ</th><th>BLOOM</th><th>RUBRIC</th><th>NGUỒN</th><th>TRẠNG THÁI</th><th>THAO TÁC</th></tr></thead><tbody>{slice.map((item) => <tr key={item.id}><td><strong>{item.id}</strong><br /><Link to={item.id}>{item.content}</Link></td><td>{item.topic}</td><td><span className="badge info">{item.bloom}</span></td><td>{item.rubric ?? 'Chưa gắn rubric'}</td><td>{item.source}</td><td><span className={`badge ${item.status === 'ĐÃ DUYỆT' ? 'success' : item.status === 'CHỜ DUYỆT' ? 'warning' : 'neutral'}`}>{item.status}</span></td><td><Link className="button outline" to={item.id}>Chỉnh sửa</Link></td></tr>)}</tbody></table></div><nav className="qb-pagination" aria-label="Phân trang"><span>Hiển thị {slice.length} / {filtered.length} câu hỏi</span><Button variant="outline" disabled={page === 1} onClick={() => set('page', String(page - 1))}>Trước</Button><span>Trang {Math.min(page, pages)} / {pages}</span><Button variant="outline" disabled={page >= pages} onClick={() => set('page', String(page + 1))}>Sau</Button></nav></>}
    <QuestionImportDialog open={importOpen} subjectId={subjectId} onClose={() => setImportOpen(false)} onSuccess={setImportResult} />
  </section>
}
