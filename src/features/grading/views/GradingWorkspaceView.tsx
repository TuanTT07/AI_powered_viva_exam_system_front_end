import type { ReactNode } from 'react'
import { useState } from 'react'
import {
  FileText,
  Mic,
  ShieldCheck,
  Sparkles,
  Volume2,
  Bot,
  User,
  Clock,
  HelpCircle,
  AlertTriangle,
  Play,
  Pause,
} from 'lucide-react'
import { Button } from '../../../components/ui/primitives'
import type { CriterionReview, EvidenceLine } from '../grading-types'

export type { CriterionReview, EvidenceLine }

const panel = 'bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs'

export function GradingWorkspaceView({
  name,
  code,
  question,
  transcript = [],
  criteria = [],
  scores,
  notes,
  onScore,
  onNotes,
  summary,
  confirmed,
  notice,
  actions,
  demo = false,
  status = 'COMPLETED',
}: {
  name: string
  code: string
  question?: string
  transcript?: EvidenceLine[]
  criteria?: CriterionReview[]
  scores: Record<string, string>
  notes: string
  onScore: (id: string, value: string) => void
  onNotes: (value: string) => void
  summary: boolean
  confirmed: boolean
  notice: ReactNode
  actions: ReactNode
  demo?: boolean
  status?: string
}) {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)
  const total = criteria.reduce((sum, c) => sum + (Number(scores[c.id]) || 0), 0)
  const aiTotal = criteria.reduce((sum, c) => sum + c.ai, 0)

  return (
    <div className="space-y-4">
      {notice}

      {/* Header bar */}
      <div className={`${panel} flex flex-col lg:flex-row lg:items-center justify-between gap-4`}>
        <div className="flex items-center gap-3">
          <span className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <ShieldCheck size={24} />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">{name}</h1>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                confirmed
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  : 'bg-blue-50 text-blue-700 border border-blue-200'
              }`}>
                {confirmed ? (demo ? 'Đã xác nhận demo' : 'Đã chốt điểm') : (status === 'COMPLETED' ? 'Đã hoàn thành thi' : status)}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-mono mt-0.5">{code}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      </div>

      {summary ? (
        <>
          {/* Summary KPI Cards */}
          <div className="grid sm:grid-cols-3 gap-4">
            <section className={panel}>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">AI GỢI Ý</p>
              <strong className="text-3xl text-indigo-600 block my-1">
                {criteria.length ? aiTotal.toFixed(1) : '—'}
              </strong>
              <p className="text-xs text-slate-500">Gợi ý từ mô hình, cần giảng viên rà soát</p>
            </section>

            <section className={panel}>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">ĐIỂM GIẢNG VIÊN NHẬP</p>
              <strong className="text-3xl text-blue-600 block my-1">
                {criteria.length ? total.toFixed(1) : '—'}
              </strong>
              <p className="text-xs text-slate-500">
                {confirmed
                  ? (demo ? 'Đã xác nhận trong phiên demo' : 'Đã được giảng viên xác nhận')
                  : 'Chưa xác nhận'}
              </p>
            </section>

            <section className={panel}>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                {demo ? (confirmed ? 'ĐIỂM CHỐT MẪU' : 'TỔNG ĐIỂM NHÁP MẪU') : 'ĐIỂM CHÍNH THỨC'}
              </p>
              <strong className="text-3xl text-slate-900 block my-1">
                {demo && criteria.length
                  ? total.toFixed(1)
                  : confirmed
                    ? total.toFixed(1)
                    : '—'}
              </strong>
              <p className="text-xs text-slate-500">
                {demo
                  ? 'Chỉ sử dụng trong phiên mô phỏng'
                  : confirmed
                    ? 'Đã lưu chính thức vào hồ sơ kỳ thi'
                    : 'Chưa có xác nhận từ hệ thống'}
              </p>
            </section>
          </div>

          {/* Breakdown table */}
          <section className={panel}>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-semibold text-slate-900">Chi tiết điểm thành phần theo rubric</h2>
              <span className="text-xs text-slate-500">Thang điểm 10</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[520px]">
                <thead className="bg-slate-50 text-slate-600 uppercase">
                  <tr>
                    <th className="p-3">Tiêu chí</th>
                    <th className="p-3">Điểm tối đa</th>
                    <th className="p-3">AI gợi ý</th>
                    <th className="p-3">Giảng viên nhập</th>
                    <th className="p-3">Chênh lệch</th>
                  </tr>
                </thead>
                <tbody>
                  {criteria.map(c => {
                    const lecturerVal = Number(scores[c.id] || 0)
                    const diff = lecturerVal - c.ai
                    return (
                      <tr key={c.id} className="border-t border-slate-100">
                        <td className="p-3">
                          <strong className="block text-slate-800">{c.name}</strong>
                          {c.evidence && <span className="text-slate-400 text-[11px]">{c.evidence}</span>}
                        </td>
                        <td className="p-3 text-slate-600 font-medium">{c.max}đ</td>
                        <td className="p-3 text-indigo-600 font-semibold">{c.ai.toFixed(1)}đ</td>
                        <td className="p-3 text-blue-700 font-bold">{scores[c.id] ? `${Number(scores[c.id]).toFixed(1)}đ` : '—'}</td>
                        <td className="p-3">
                          {scores[c.id] ? (
                            diff === 0 ? (
                              <span className="text-slate-400">0</span>
                            ) : diff > 0 ? (
                              <span className="text-emerald-600 font-semibold">+{diff.toFixed(1)}</span>
                            ) : (
                              <span className="text-amber-600 font-semibold">{diff.toFixed(1)}</span>
                            )
                          ) : (
                            '—'
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              {!criteria.length && (
                <p className="py-8 text-center text-sm text-slate-500">
                  Chưa có rubric và điểm thành phần được cấp quyền xem.
                </p>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-2">
              <h3 className="text-sm font-semibold text-slate-800">Nhận xét của giảng viên</h3>
              <p className="text-sm text-slate-700 bg-slate-50 p-4 rounded-lg border border-slate-200 whitespace-pre-wrap min-h-[60px]">
                {notes || 'Chưa có nhận xét.'}
              </p>
            </div>
          </section>

          {/* Publication status */}
          <section className={panel}>
            <h2 className="text-sm font-semibold text-slate-800">Xác nhận và công bố kết quả</h2>
            <p className="text-sm text-slate-500">
              Điểm chỉ được công bố khi hệ thống xác nhận giảng viên đã chốt điểm và cho phép sinh viên xem kết quả.
            </p>
            <Button disabled>Chưa hỗ trợ ký số / công bố</Button>
          </section>
        </>
      ) : (
        /* Workspace 3-column Layout */
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
          {/* Column 1: Monitoring & Evidence */}
          <aside className="xl:col-span-3 space-y-4">
            {/* Question assigned */}
            <section className={panel}>
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold flex items-center gap-2 text-slate-800">
                  <HelpCircle size={16} className="text-amber-600" /> Câu hỏi đang rà soát
                </h2>
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-700">
                  Chính thức
                </span>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed bg-amber-50/50 p-3 rounded-lg border border-amber-200/60">
                {question || 'Chưa có câu hỏi được hệ thống cung cấp.'}
              </p>
            </section>

            {/* Audio Recording Evidence */}
            <section className={panel}>
              <h2 className="text-sm font-semibold flex items-center gap-2 text-slate-800">
                <Mic size={16} className="text-emerald-600" /> Bằng chứng ghi âm
              </h2>
              {demo ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                        aria-label={isPlayingAudio ? 'Tạm dừng audio' : 'Phát audio'}
                      >
                        {isPlayingAudio ? <Pause size={14} /> : <Play size={14} />}
                      </Button>
                      <div className="text-xs">
                        <p className="font-semibold text-slate-700">audio_session_rec.wav</p>
                        <p className="text-[10px] text-slate-500">01:12 / 05:00</p>
                      </div>
                    </div>
                    <Volume2 size={16} className="text-slate-400" />
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Ghi âm hai chiều giữa Giám khảo AI và Thí sinh được lưu vết đầy đủ.
                  </p>
                </div>
              ) : (
                <>
                  <p className="text-xs text-slate-500">Chưa có bản ghi được phép phát lại.</p>
                  <Button variant="outline" disabled>
                    <Mic size={15} /> Nghe bản ghi
                  </Button>
                </>
              )}
            </section>
          </aside>

          {/* Column 2: Dialogue Transcript */}
          <section className={`${panel} xl:col-span-5`}>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-semibold flex items-center gap-2 text-slate-800">
                <FileText size={16} className="text-blue-600" /> Biên bản hội thoại (Transcript)
              </h2>
              <span className="text-xs text-slate-500 flex items-center gap-1 font-mono">
                <Clock size={12} /> {transcript.length} lượt thoại
              </span>
            </div>

            <div className="space-y-3 max-h-[700px] overflow-y-auto pr-1">
              {transcript.map((line, i) => {
                const isAi = line.role === 'ai'
                return (
                  <article
                    key={i}
                    className={`p-3.5 rounded-xl border text-sm transition-all ${
                      isAi
                        ? 'bg-slate-50 border-slate-200/90 text-slate-800'
                        : 'bg-blue-50/70 border-blue-200/80 text-blue-950'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-semibold mb-2 text-slate-500">
                      <div className="flex items-center gap-1.5">
                        {isAi ? (
                          <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center">
                            <Bot size={12} />
                          </span>
                        ) : (
                          <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center">
                            <User size={12} />
                          </span>
                        )}
                        <span className={isAi ? 'text-slate-700' : 'text-blue-700'}>
                          {isAi ? 'Giám khảo AI' : 'Thí sinh'}
                        </span>
                      </div>
                      <time className="font-mono text-[11px] text-slate-400">{line.time}</time>
                    </div>
                    <p className="leading-relaxed pl-6.5 text-[13px]">{line.text}</p>
                  </article>
                )
              })}

              {!transcript.length && (
                <div className="py-16 text-center text-slate-400 space-y-2">
                  <FileText size={32} className="mx-auto text-slate-300" />
                  <p className="text-sm font-medium">Chưa có transcript được cấp quyền xem.</p>
                  <p className="text-xs text-slate-400">
                    Biên bản thi sẽ xuất hiện khi sinh viên hoàn thành phiên vấn đáp và dữ liệu được đồng bộ.
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Column 3: Rubric & Scoring */}
          <section className={`${panel} xl:col-span-4`}>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-semibold flex items-center gap-2 text-slate-800">
                <Sparkles size={16} className="text-indigo-600" /> Rubric & AI hỗ trợ chấm điểm
              </h2>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                Human-in-the-loop
              </span>
            </div>

            {/* Caution banner on scoring authority */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-900 flex items-start gap-2">
              <AlertTriangle size={15} className="shrink-0 text-amber-600 mt-0.5" />
              <p className="leading-relaxed">
                <strong>Nguyên tắc chấm điểm:</strong> Điểm AI là gợi ý. Điểm đang nhập chưa phải điểm chính thức. Chỉ giảng viên mới có quyền chốt điểm.
              </p>
            </div>

            {/* Criteria Cards */}
            <div className="space-y-4">
              {criteria.map(c => {
                const currentScore = scores[c.id] ?? ''
                const numVal = Number(currentScore)
                const isAdjusted = currentScore !== '' && Number.isFinite(numVal) && numVal !== c.ai

                return (
                  <div
                    key={c.id}
                    className="border border-slate-200 rounded-xl p-4 space-y-3 bg-white shadow-2xs hover:border-slate-300 transition-colors"
                  >
                    <div className="flex items-baseline justify-between">
                      <h3 className="text-sm font-bold text-slate-900">
                        {c.name} <span className="text-slate-400 font-normal">/ {c.max}đ</span>
                      </h3>
                      {isAdjusted && (
                        <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                          Đã điều chỉnh
                        </span>
                      )}
                    </div>

                    {/* AI Suggestion & Evidence */}
                    <div className="bg-indigo-50/80 border border-indigo-100 rounded-lg p-3 text-xs text-indigo-900 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <strong className="text-indigo-800 flex items-center gap-1 font-semibold">
                          <Sparkles size={13} className="text-indigo-600" /> AI gợi ý: {c.ai} / {c.max}đ
                        </strong>
                        <span className="text-[10px] text-indigo-500 font-medium">Trích xuất từ biên bản</span>
                      </div>
                      <p className="text-[11px] text-indigo-800/80 leading-relaxed italic border-l-2 border-indigo-300 pl-2">
                        &ldquo;{c.evidence}&rdquo;
                      </p>
                    </div>

                    {/* Lecturer Score Input */}
                    <div className="pt-1">
                      <label className="text-xs font-semibold text-slate-700 flex justify-between items-center gap-2">
                        <span>Điểm giảng viên chấm</span>
                        <div className="flex items-center gap-1.5">
                          <input
                            className="input text-right font-bold text-blue-700"
                            style={{ width: 96, flexShrink: 0 }}
                            type="number"
                            min={0}
                            max={c.max}
                            step="0.1"
                            required
                            value={scores[c.id] ?? ''}
                            onChange={e => onScore(c.id, e.target.value)}
                            disabled={confirmed}
                            aria-label={`Điểm tiêu chí ${c.name}`}
                          />
                          <span className="text-xs text-slate-400 font-medium">/ {c.max}</span>
                        </div>
                      </label>
                    </div>
                  </div>
                )
              })}

              {!criteria.length && (
                <p className="py-8 text-sm text-slate-500 text-center">
                  Chưa có rubric hoặc điểm AI. Chấm điểm sẽ mở khi dữ liệu và chức năng lưu được hỗ trợ.
                </p>
              )}
            </div>

            {/* Lecturer Notes */}
            <div className="pt-2 border-t border-slate-100 space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Nhận xét giảng viên
              </label>
              <textarea
                className="input w-full text-xs"
                style={{ minHeight: 96 }}
                value={notes}
                onChange={e => onNotes(e.target.value)}
                disabled={!criteria.length || confirmed}
                placeholder="Nhận xét chi tiết và lý do điều chỉnh điểm (nếu có)..."
              />
              <p className="text-[11px] text-slate-500">
                Điểm AI là gợi ý. Điểm đang nhập chưa phải điểm chính thức.
              </p>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}
