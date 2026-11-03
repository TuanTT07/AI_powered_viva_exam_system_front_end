import { Link } from 'react-router-dom'
import type { AttemptRow } from '../use-assessment-overview'
import type { EvaluationResponseDto } from '../../grading/api-evaluation-service'
import { attemptStatusLabels } from '../attempt-status'
import { getStoredGrading } from '../../grading/grading-repository'

export function AttemptTable({
  rows,
  examId,
  allowReview,
  summary = false,
  demo = false,
  evaluations,
}: {
  rows: AttemptRow[]
  evaluations?: EvaluationResponseDto[]
  examId: string
  allowReview: boolean
  summary?: boolean
  demo?: boolean
}) {
  return (
    <div className="rounded-xl bg-white border border-slate-200 overflow-x-auto shadow-xs">
      <table className="w-full text-left text-xs min-w-[680px]">
        <caption className="sr-only">Danh sách lượt thi</caption>
        <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold">
          <tr>
            <th className="p-4">Thí sinh</th>
            <th className="p-4">Mã sinh viên</th>
            <th className="p-4">Trạng thái lượt thi</th>
            <th className="p-4">{demo ? 'Điểm mẫu' : 'Điểm chính thức'}</th>
            <th className="p-4">Hồ sơ</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(row => {
            const evalItem = evaluations?.find(e => e.questionAttemptId === row.attemptId || e.id === row.attemptId)
              ?? (evaluations && evaluations.length === 1 && rows.length === 1 ? evaluations[0] : undefined)
            const stored = getStoredGrading(examId, evalItem?.questionAttemptId ?? row.attemptId)
            const isConfirmed = Boolean(evalItem?.status === 'GRADED' || stored?.confirmed)
            const confirmedScore = evalItem?.finalScore ?? stored?.finalScore
            const targetAttemptId = evalItem?.questionAttemptId ?? row.attemptId

            return (
              <tr key={row.attemptId} className="border-t border-slate-100 hover:bg-slate-50/80 transition-colors">
                <td className="p-4">
                  <strong className="block text-sm text-slate-900">{row.studentName}</strong>
                  <small className="text-slate-500">{row.studentEmail}</small>
                </td>
                <td className="p-4 font-mono font-medium text-blue-600">{row.studentCode}</td>
                <td className="p-4">
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-700 font-medium inline-flex items-center gap-1">
                    {row.status ? attemptStatusLabels[row.status] : 'Chưa có dữ liệu lượt thi'}
                  </span>
                </td>
                <td className="p-4 text-slate-600">
                  {isConfirmed && confirmedScore !== undefined ? (
                    <span className="inline-flex items-center gap-1.5 font-bold text-emerald-700">
                      <span>{confirmedScore.toFixed(1)}</span>
                      <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        Đã chốt
                      </span>
                    </span>
                  ) : demo ? (
                    row.demoScore !== undefined ? (
                      <span className="font-semibold text-slate-800">{row.demoScore.toFixed(1)}</span>
                    ) : (
                      <span className="text-slate-400">Chờ chấm</span>
                    )
                  ) : (
                    <span className="text-slate-400">Chưa có dữ liệu</span>
                  )}
                </td>
                <td className="p-4">
                  {allowReview && (!demo || row.status === 'COMPLETED') ? (
                    <Link
                      className="button outline"
                      to={`/lecturer/exams/${examId}/attempts/${targetAttemptId}${summary ? '?tab=summary' : ''}`}
                    >
                      Mở hồ sơ
                    </Link>
                  ) : (
                    <span className="text-slate-400 text-xs">Chưa có lượt thi</span>
                  )}
                </td>
              </tr>
            )
          })}
          {!rows.length && (
            <tr>
              <td colSpan={5} className="p-10 text-center text-slate-500">
                Chưa có lượt thi phù hợp.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
