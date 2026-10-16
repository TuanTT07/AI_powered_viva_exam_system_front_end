import { Search, Plus, Sparkles, Upload, BookOpen, CheckCircle2, Clock, Trash2, Edit3, CheckSquare } from 'lucide-react'
import type { Question } from '../question-types'

const bloomLabels: Record<Question['bloom'], string> = { 'NHỚ': 'Nhớ', 'HIỂU': 'Hiểu', 'VẬN DỤNG': 'Vận dụng', 'PHÂN TÍCH': 'Phân tích', 'ĐÁNH GIÁ': 'Đánh giá', 'SÁNG TẠO': 'Sáng tạo' }
const statusLabels: Record<Question['status'], string> = { 'ĐÃ DUYỆT': 'Đã duyệt', 'CHỜ DUYỆT': 'Chờ duyệt', 'BẢN NHÁP': 'Bản nháp' }
export type QuestionBankViewProps = {
  items: Question[]; courseLabel: string; totalCount: number; page: number; totalPages: number;
  searchTerm: string; topicFilter: string; bloomFilter: string; statusFilter: string; pending: boolean; demoFeatures: boolean;
  setSearchTerm: (value: string) => void; setTopicFilter: (value: string) => void; setBloomFilter: (value: string) => void; setStatusFilter: (value: string) => void;
  onCreate: () => void; onEdit: (id: string) => void; onDelete: (id: string) => void; onGenerate: () => void; onImport: () => void; onPage: (page: number) => void;
}

export function QuestionBankView({ items, courseLabel, totalCount, page, totalPages, searchTerm, topicFilter, bloomFilter, statusFilter, pending, demoFeatures, setSearchTerm, setTopicFilter, setBloomFilter, setStatusFilter, onCreate, onEdit, onDelete, onGenerate, onImport, onPage }: QuestionBankViewProps) {
  const questions = items.map(q => ({ ...q, title: q.content, code: q.id, bloomLevel: bloomLabels[q.bloom], status: statusLabels[q.status], summaryFocus: q.source }))
  const filteredQuestions = questions
  const topics = [...new Set(questions.map(q => q.topic))]
  const approvedCount = questions.filter(q => q.status === 'Đã duyệt').length
  const pendingCount = questions.filter(q => q.status === 'Chờ duyệt').length
  const draftCount = questions.filter(q => q.status === 'Bản nháp').length
  const bloomCounts: Record<string, number> = Object.fromEntries(Object.values(bloomLabels).map(label => [label, questions.filter(q => q.bloomLevel === label).length]))
  return (
    <div className="source-screen space-y-6 max-w-7xl mx-auto pb-16">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600 mb-1">
            <span>AIVES</span>
            <span>•</span>
            <span>Kho khảo thí</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
            Ngân Hàng Đề Thi & Thiết Lập Rubric
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Học phần: <strong className="text-slate-800">{courseLabel}</strong> • Cấp độ tư duy Bloom.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onGenerate} disabled={!demoFeatures}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-semibold rounded-[10px] bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 transition-colors shadow-2xs"
          >
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>AI Sinh Đề RAG</span>
          </button>
          <button
            onClick={onImport} disabled={!demoFeatures}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-[10px] bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <Upload className="w-4 h-4 text-slate-500" />
            <span>Nhập Excel</span>
          </button>
          <button
            onClick={onCreate}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-[10px] bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-xs shadow-blue-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Câu Hỏi Mới</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>TỔNG SỐ ĐỀ THI</span>
            <BookOpen className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{totalCount}</div>
          <div className="text-xs text-slate-500 mt-1">Dữ liệu từ danh sách câu hỏi</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>ĐÃ PHÊ DUYỆT</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-600">{approvedCount}</div>
          <div className="text-xs text-emerald-600/80 mt-1">Trên trang hiện tại</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>CHỜ HỘI ĐỒNG THẨM ĐỊNH</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-600">{pendingCount}</div>
          <div className="text-xs text-amber-600/80 mt-1">Trên trang hiện tại</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>BẢN NHÁP / SOẠN THẢO</span>
            <Edit3 className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-700">{draftCount}</div>
          <div className="text-xs text-slate-500 mt-1">Trên trang hiện tại</div>
        </div>
      </div>

      {/* Bloom Taxonomy Distribution Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Phân Bổ Cấp Độ Tư Duy Theo Thang Đo Bloom
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Phân bố câu hỏi trên trang hiện tại theo sáu cấp độ tư duy.
            </p>
          </div>
          <span className="text-xs font-medium px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-200 self-start sm:self-auto">
            Thang đo Bloom
          </span>
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full h-3 rounded-full overflow-hidden flex bg-slate-100">
          <div style={{ width: `${(bloomCounts['Nhớ'] / Math.max(1, questions.length)) * 100}%` }} className="bg-sky-400" title="Nhớ" />
          <div style={{ width: `${(bloomCounts['Hiểu'] / Math.max(1, questions.length)) * 100}%` }} className="bg-blue-500" title="Hiểu" />
          <div style={{ width: `${(bloomCounts['Vận dụng'] / Math.max(1, questions.length)) * 100}%` }} className="bg-indigo-500" title="Vận dụng" />
          <div style={{ width: `${(bloomCounts['Phân tích'] / Math.max(1, questions.length)) * 100}%` }} className="bg-violet-500" title="Phân tích" />
          <div style={{ width: `${(bloomCounts['Đánh giá'] / Math.max(1, questions.length)) * 100}%` }} className="bg-purple-600" title="Đánh giá" />
          <div style={{ width: `${(bloomCounts['Sáng tạo'] / Math.max(1, questions.length)) * 100}%` }} className="bg-fuchsia-600" title="Sáng tạo" />
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 pt-1 text-xs">
          {[
            { label: 'Nhớ', count: bloomCounts['Nhớ'], color: 'bg-sky-400' },
            { label: 'Hiểu', count: bloomCounts['Hiểu'], color: 'bg-blue-500' },
            { label: 'Vận dụng', count: bloomCounts['Vận dụng'], color: 'bg-indigo-500' },
            { label: 'Phân tích', count: bloomCounts['Phân tích'], color: 'bg-violet-500' },
            { label: 'Đánh giá', count: bloomCounts['Đánh giá'], color: 'bg-purple-600' },
            { label: 'Sáng tạo', count: bloomCounts['Sáng tạo'], color: 'bg-fuchsia-600' },
          ].map((item) => (
            <div
              key={item.label}
              onClick={() => setBloomFilter(bloomFilter === item.label ? '' : item.label)}
              className={`flex items-center gap-2 p-1.5 rounded-lg border cursor-pointer transition-colors ${
                bloomFilter === item.label
                  ? 'border-blue-500 bg-blue-50 font-semibold text-blue-900'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <span className={`w-2.5 h-2.5 rounded-full ${item.color} shrink-0`}></span>
              <span className="truncate">{item.label}:</span>
              <strong className="text-slate-900 ml-auto">{item.count}</strong>
            </div>
          ))}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="flex-1 flex flex-col sm:flex-row gap-2.5">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Tìm kiếm" placeholder="Tìm theo mã câu hỏi, tiêu đề, từ khóa kỹ thuật..."
              className="w-full pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-2.5 text-xs text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Topic filter */}
          <select
            aria-label="Chủ đề" disabled={!demoFeatures} value={topicFilter}
            onChange={(e) => setTopicFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-blue-500"
          >
            <option value="">Tất cả chủ đề</option>
            {topics.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          {/* Bloom filter */}
          <select
            aria-label="Bloom" value={bloomFilter}
            onChange={(e) => setBloomFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-blue-500"
          >
            <option value="">Cấp độ Bloom (Tất cả)</option>
            <option value="Nhớ">Nhớ</option>
            <option value="Hiểu">Hiểu</option>
            <option value="Vận dụng">Vận dụng</option>
            <option value="Phân tích">Phân tích</option>
            <option value="Đánh giá">Đánh giá</option>
            <option value="Sáng tạo">Sáng tạo</option>
          </select>

          {/* Status filter */}
          <select
            aria-label="Trạng thái" value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-blue-500"
          >
            <option value="">Trạng thái (Tất cả)</option>
            <option value="Đã duyệt">Đã duyệt</option>
            <option value="Chờ duyệt">Chờ duyệt</option>
            <option value="Bản nháp">Bản nháp</option>
          </select>
        </div>

        <div className="text-xs text-slate-500 font-medium self-end md:self-auto shrink-0">
          Hiển thị: <strong className="text-slate-900">{filteredQuestions.length}</strong> / {totalCount} đề thi
        </div>
      </div>

      {/* Modern Data Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px] tracking-wider">
              <tr>
                <th className="py-3 px-4 w-12 text-center">STT</th>
                <th className="py-3 px-4">Mã Đề Thi</th>
                <th className="py-3 px-4 min-w-[320px]">Nội Dung Câu Hỏi & Trọng Tâm</th>
                <th className="py-3 px-4">Cấp Độ Bloom</th>
                <th className="py-3 px-4">Chủ Đề</th>
                <th className="py-3 px-4 text-center">Tiêu Chí Rubric</th>
                <th className="py-3 px-4">Trạng Thái</th>
                <th className="py-3 px-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredQuestions.map((q, idx) => (
                <tr
                  key={q.id}
                  className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                  >
                  <td className="py-3.5 px-4 text-center font-mono text-slate-400">{idx + 1}</td>
                  <td className="py-3.5 px-4">
                    <span className="font-mono font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                      {q.code}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
                      <button className="text-left" onClick={() => onEdit(q.id)}>{q.title}</button>
                    </div>
                    {q.summaryFocus && (
                      <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                        {q.summaryFocus}
                      </div>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${
                        q.bloomLevel === 'Phân tích'
                          ? 'bg-violet-50 text-violet-700 border-violet-200'
                          : q.bloomLevel === 'Đánh giá'
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : q.bloomLevel === 'Vận dụng'
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                          : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}
                    >
                      {q.bloomLevel}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="text-slate-600">{q.topic || '—'}</span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                      <CheckSquare className="w-3 h-3 text-slate-500" />
                      {q.rubric || 'Chưa gắn Rubric'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${
                        q.status === 'Đã duyệt'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : q.status === 'Chờ duyệt'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          q.status === 'Đã duyệt'
                            ? 'bg-emerald-500'
                            : q.status === 'Chờ duyệt'
                            ? 'bg-amber-500'
                            : 'bg-slate-400'
                        }`}
                      ></span>
                      {q.status}
                    </span>
                  </td>
                  <td
                    className="py-3.5 px-4 text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onEdit(q.id)}
                        className="px-2.5 py-1 text-xs font-semibold rounded-md bg-slate-100 text-slate-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 border border-slate-200 transition-colors"
                      >
                        Chỉnh sửa
                      </button>
                      <button
                        onClick={() => onDelete(q.id)} disabled={pending}
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                        title="Xóa câu hỏi" aria-label={`Xóa câu hỏi ${q.code}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="flex items-center justify-end gap-3 text-xs text-slate-500"><span>Trang {page} / {Math.max(1, totalPages)}</span><button disabled={page <= 1} onClick={() => onPage(page - 1)} className="px-3 py-2 rounded-lg border border-slate-200 bg-white">Trước</button><button disabled={page >= totalPages} onClick={() => onPage(page + 1)} className="px-3 py-2 rounded-lg border border-slate-200 bg-white">Sau</button></div>
    </div>
  );
}
