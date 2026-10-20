import { useState } from 'react'
import { DemoLabel } from '../../components/common/inline-notice'
import { Link, useParams } from 'react-router-dom'
import {
  FileText,
  ShieldCheck,
  Sparkles,
  User,
  Calendar,
  AlertCircle,
  Clock,
  Trash2
} from 'lucide-react'
import { Alert, Button } from '../../components/ui/primitives'
import { runtimeConfig } from '../../services/api/runtime-config'
import { studentResultsDemo } from './mocks/student-results-demo'
import { GradeAppealDialog } from './grade-appeal-dialog'
import {
  getGradeAppeal,
  cancelGradeAppeal,
  APPEAL_CATEGORIES,
  type GradeAppeal
} from './grade-appeal-storage'

export function StudentExamResultPage() {
  const { examId = '' } = useParams()
  const demo = runtimeConfig.dataSource === 'mock'
  const result = demo ? studentResultsDemo.find(r => r.id === examId) : undefined

  const [appeal, setAppeal] = useState<GradeAppeal | null>(() => examId ? getGradeAppeal(examId) : null)
  const [appealDialogOpen, setAppealDialogOpen] = useState(false)
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null)

  const handleCancelAppeal = () => {
    if (window.confirm('Bạn có chắc chắn muốn hủy đơn phúc khảo này không?')) {
      cancelGradeAppeal(examId)
      setAppeal(null)
      setFeedbackMessage('Đã hủy đơn phúc khảo thành công.')
    }
  }

  return (
    <section className="source-screen max-w-6xl mx-auto space-y-6 pb-16">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 p-6 sm:p-8 text-white shadow-sm border border-slate-800">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-medium text-blue-200">
              <Sparkles size={13} className="text-amber-400" />
              <span>Kết quả · Biên bản khảo thí</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {result?.title ?? 'Biên bản kết quả'}
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              {result?.subject ?? 'Báo cáo chi tiết điểm số, tiêu chí chấm và nhận xét chính thức.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link className="button outline" to="/student/results">
              Danh sách kết quả
            </Link>
            {result && !appeal && (
              <Button
                variant="outline"
                className="inline-flex items-center gap-1.5 bg-amber-500/20 text-amber-200 hover:bg-amber-500/30 border-amber-400/40"
                onClick={() => setAppealDialogOpen(true)}
              >
                <AlertCircle size={14} className="text-amber-300" />
                <span>Khiếu nại / Phúc khảo điểm</span>
              </Button>
            )}
            {appeal && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-200 border border-amber-400/30 text-xs font-semibold">
                <Clock size={14} className="text-amber-300" />
                <span>Đơn phúc khảo: Đang thẩm định</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {demo && <DemoLabel detail="Dữ liệu demo · Biên bản và điểm minh họa." />}

      {feedbackMessage && (
        <Alert tone="success">
          <div className="flex items-center justify-between">
            <span>{feedbackMessage}</span>
            <button
              type="button"
              onClick={() => setFeedbackMessage(null)}
              className="text-xs font-bold underline cursor-pointer ml-3"
            >
              Đóng
            </button>
          </div>
        </Alert>
      )}

      {/* Appeal Status Active Banner */}
      {appeal && (
        <section className="bg-amber-50/90 border border-amber-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-200/80 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-100 rounded-xl text-amber-700 shrink-0">
                <Clock size={20} />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-base font-bold text-amber-950">Đơn yêu cầu phúc khảo đã được tiếp nhận</h2>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-200 text-amber-900 font-mono">
                    {appeal.id}
                  </span>
                </div>
                <p className="text-xs text-amber-800 mt-0.5">
                  Ngày gửi: {new Date(appeal.createdAt).toLocaleString('vi-VN')} · Trạng thái:{' '}
                  <strong className="font-semibold text-amber-950 uppercase">Đang thẩm định bản ghi âm &amp; transcript</strong>
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              className="inline-flex items-center gap-1.5 text-xs border-amber-300 text-amber-900 hover:bg-amber-100 shrink-0 self-start sm:self-auto"
              onClick={handleCancelAppeal}
            >
              <Trash2 size={13} className="text-rose-600" />
              <span>Hủy đơn phúc khảo</span>
            </Button>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-amber-800 font-semibold block mb-0.5">Phạm vi khiếu nại:</span>
              <span className="font-medium text-amber-950">
                {APPEAL_CATEGORIES[appeal.category]?.label ?? appeal.category}
              </span>
            </div>
            <div>
              <span className="text-amber-800 font-semibold block mb-0.5">Email nhận thông báo kết quả:</span>
              <span className="font-mono text-amber-950">{appeal.contactEmail}</span>
            </div>
            <div className="sm:col-span-2 bg-white/80 border border-amber-200/80 rounded-xl p-4">
              <span className="text-amber-800 font-semibold block mb-1">Nội dung giải trình của bạn:</span>
              <p className="text-amber-950 leading-relaxed whitespace-pre-wrap">{appeal.reason}</p>
            </div>
          </div>
        </section>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        {/* Score Card */}
        <section className="result-score-card bg-gradient-to-br from-blue-600 via-indigo-600 to-indigo-700 rounded-2xl p-8 text-center text-white space-y-4 shadow-sm flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center">
              <ShieldCheck size={28} className="text-white" />
            </div>
            <h2 className="text-sm font-semibold tracking-wide text-blue-100">
              {demo ? 'Điểm công bố mẫu' : 'Điểm chính thức'}
            </h2>
            <strong className="block text-5xl sm:text-6xl font-mono font-bold tracking-tight text-white">
              {result ? result.score.toFixed(1) : '—'}
            </strong>
          </div>
          <p className="text-xs text-blue-200/90 pt-2 border-t border-white/15">
            {result ? 'Thang điểm 10 · Demo' : 'Chưa có kết quả được hệ thống công bố'}
          </p>
        </section>

        {/* Lecturer Feedback Card */}
        <section className="md:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-7 space-y-5 shadow-xs">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
              <User size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Nhận xét giảng viên</h2>
              <p className="text-xs text-slate-500">
                Đánh giá tổng quan năng lực phản biện, độ sâu kiến thức và tư duy giải quyết vấn đề.
              </p>
            </div>
          </div>

          <div className="bg-slate-50/80 border border-slate-200/60 rounded-xl p-5 text-sm text-slate-700 leading-relaxed font-normal">
            {result?.feedback ?? (demo ? 'Không tìm thấy kết quả mẫu cho kỳ thi này.' : 'Nhận xét sẽ hiển thị khi được cấp quyền xem kết quả.')}
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Calendar size={13} />
            <span>{result ? `Ngày thi mẫu: ${new Date(result.date).toLocaleDateString('vi-VN')}` : 'Chưa có ngày xác nhận kết quả'}</span>
          </div>
        </section>
      </div>

      {/* Grade Appeal Call-to-Action Card if not yet submitted */}
      {!appeal && result && (
        <section className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 mt-0.5 shrink-0">
              <AlertCircle size={22} />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-900">Khiếu nại hoặc phúc khảo kết quả thi</h3>
              <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
                Nếu bạn nhận thấy kết quả ghi nhận chưa thỏa đáng, giọng nói bị nhận diện thiếu ý hoặc gặp sự cố đường truyền trong lúc vấn đáp, bạn có quyền gửi đơn phúc khảo để Hội đồng khảo thí nghe lại bản ghi âm đối soát.
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            className="shrink-0 flex items-center gap-1.5 border-slate-300 text-slate-800 hover:bg-slate-100 text-xs font-semibold"
            onClick={() => setAppealDialogOpen(true)}
          >
            <FileText size={14} />
            <span>Tạo đơn phúc khảo</span>
          </Button>
        </section>
      )}

      {/* Transcript Section */}
      <section className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-4 shadow-xs">
        <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2.5">
          <FileText size={18} className="text-blue-600" />
          <span>Biên bản hội thoại được công bố</span>
        </h2>
        <div className="border border-dashed border-slate-200 rounded-xl p-8 text-center space-y-2">
          <p className="text-sm text-slate-500">
            Chưa có transcript được cấp quyền xem trong kết quả này.
          </p>
          <p className="text-xs text-slate-400">
            Hội thoại âm thanh và trích dẫn câu trả lời chỉ hiển thị khi giảng viên cho phép truy cập biên bản chi tiết.
          </p>
        </div>
      </section>

      {/* Appeal Dialog Modal */}
      {result && (
        <GradeAppealDialog
          open={appealDialogOpen}
          examId={result.id}
          examTitle={result.title}
          currentScore={result.score}
          onClose={() => setAppealDialogOpen(false)}
          onSuccess={(newAppeal) => {
            setAppeal(newAppeal)
            setFeedbackMessage(`Đã gửi đơn phúc khảo thành công (Mã đơn: ${newAppeal.id}). Hội đồng khảo thí sẽ mở lại file ghi âm và đối soát trong vòng 3-5 ngày làm việc.`)
          }}
        />
      )}
    </section>
  )
}
