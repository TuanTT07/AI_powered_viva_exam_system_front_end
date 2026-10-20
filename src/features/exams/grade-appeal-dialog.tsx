import { useState, type FormEvent } from 'react'
import { Send, ShieldAlert } from 'lucide-react'
import { Alert, Button, Dialog, Input } from '../../components/ui/primitives'
import {
  APPEAL_CATEGORIES,
  saveGradeAppeal,
  type AppealCategory,
  type GradeAppeal
} from './grade-appeal-storage'

interface GradeAppealDialogProps {
  open: boolean
  examId: string
  examTitle: string
  currentScore: number
  defaultEmail?: string
  onClose: () => void
  onSuccess: (appeal: GradeAppeal) => void
}

export function GradeAppealDialog({
  open,
  examId,
  examTitle,
  currentScore,
  defaultEmail = 'student@academia.edu.vn',
  onClose,
  onSuccess,
}: GradeAppealDialogProps) {
  const [category, setCategory] = useState<AppealCategory>('stt_accuracy')
  const [reason, setReason] = useState('')
  const [email, setEmail] = useState(defaultEmail)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    setError(null)

    if (!reason.trim() || reason.trim().length < 20) {
      setError('Vui lòng nêu rõ lý do phúc khảo chi tiết (tối thiểu 20 ký tự).')
      return
    }

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Vui lòng nhập địa chỉ email hợp lệ để nhận kết quả phúc khảo.')
      return
    }

    setSubmitting(true)
    try {
      const appeal = saveGradeAppeal({
        examId,
        currentScore,
        category,
        reason,
        contactEmail: email,
      })
      onSuccess(appeal)
      onClose()
    } catch {
      setError('Không thể gửi đơn phúc khảo. Vui lòng thử lại.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} title="Đơn yêu cầu phúc khảo kết quả thi">
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        {/* Exam Context Banner */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 flex items-center justify-between text-xs">
          <div>
            <span className="font-semibold text-slate-800 block text-sm">{examTitle}</span>
            <span className="text-slate-500 font-mono mt-0.5 block">Mã kỳ thi: {examId}</span>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-slate-400 uppercase font-semibold block">Điểm hiện tại</span>
            <span className="text-base font-bold font-mono text-indigo-700">{currentScore.toFixed(1)} / 10</span>
          </div>
        </div>

        {/* Appeal Category Select */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="appeal-category">
            Nội dung / Phạm vi khiếu nại <span className="text-rose-500">*</span>
          </label>
          <select
            id="appeal-category"
            value={category}
            onChange={(e) => setCategory(e.target.value as AppealCategory)}
            className="w-full bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs transition-all"
          >
            {Object.entries(APPEAL_CATEGORIES).map(([key, item]) => (
              <option key={key} value={key}>
                {item.label}
              </option>
            ))}
          </select>
          <p className="text-[11px] text-slate-500 mt-1 italic">
            {APPEAL_CATEGORIES[category].description}
          </p>
        </div>

        {/* Contact Email */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="appeal-email">
            Email học thuật nhận phản hồi <span className="text-rose-500">*</span>
          </label>
          <Input
            id="appeal-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="email@academia.edu.vn"
            className="text-xs"
          />
        </div>

        {/* Reason Textarea */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="block text-xs font-semibold text-slate-700" htmlFor="appeal-reason">
              Giải trình chi tiết lý do khiếu nại <span className="text-rose-500">*</span>
            </label>
            <span className={`text-[11px] font-mono ${reason.trim().length < 20 ? 'text-amber-600' : 'text-slate-400'}`}>
              {reason.trim().length}/1000 ký tự (tối thiểu 20)
            </span>
          </div>
          <textarea
            id="appeal-reason"
            rows={4}
            value={reason}
            maxLength={1000}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Nêu rõ câu hỏi số mấy, nội dung bạn đã trả lời, điểm chênh lệch hoặc đoạn âm thanh mà hệ thống/giảng viên ghi nhận chưa đúng..."
            className="w-full bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-xl p-3 text-xs leading-relaxed transition-all resize-none"
            required
          />
        </div>

        {/* Notice of Evidence Review */}
        <div className="p-3.5 rounded-xl bg-blue-50/80 border border-blue-200/80 flex items-start gap-2.5 text-xs text-blue-900 leading-relaxed">
          <ShieldAlert size={16} className="text-blue-600 shrink-0 mt-0.5" />
          <p>
            <strong>Minh chứng đối soát:</strong> Hội đồng khảo thí và Giảng viên sẽ mở lại toàn bộ file ghi âm giọng nói, transcript đối thoại và rubric chấm thi của bạn trong phiên thi này để thẩm định.
          </p>
        </div>

        {error && <Alert tone="danger">{error}</Alert>}

        {/* Actions */}
        <div className="dialog-actions flex justify-end gap-3 pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" disabled={submitting} onClick={onClose}>
            Hủy bỏ
          </Button>
          <Button type="submit" pending={submitting} className="inline-flex items-center gap-1.5">
            <Send size={13} />
            <span>Gửi đơn phúc khảo</span>
          </Button>
        </div>
      </form>
    </Dialog>
  )
}
