import { Link } from 'react-router-dom'
import type { AttemptRow } from '../use-assessment-overview'
import type { EvaluationResponseDto } from '../../grading/api-evaluation-service'
import { attemptStatusLabels } from '../attempt-status'
import { attemptEvaluations, summarizeAttempt } from '../../grading/attempt-grade'

export function AttemptTable({
  rows,
  examId,
  allowReview,
  summary = false,
  demo = false,
  evaluations,
  expectedQuestions,
  questionCounts,
}: {
  rows: AttemptRow[]
  evaluations?: EvaluationResponseDto[]
  expectedQuestions?: number
  questionCounts?: Record<string, number>
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
            <th className="p-4">{demo ? 'Điểm mẫu' : 'Điểm tổng hợp / 10'}</th>
            <th className="p-4">Hồ sơ</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(row => {
            const grade = summarizeAttempt(evaluations ?? [], row.attemptId, questionCounts?.[row.attemptId] ?? expectedQuestions)
            const questions = attemptEvaluations(evaluations ?? [], row.attemptId)
            const targetAttemptId = row.attemptId

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
                  {demo ? (
                    <span>{row.demoScore !== undefined ? row.demoScore.toFixed(1) : 'Chờ chấm'}</span>
                  ) : grade.score !== null ? (
                    <div><strong className="text-emerald-700">{grade.score.toFixed(1)} / 10</strong>
                      <p>Đã lưu điểm {grade.graded} câu chính</p>
                      <small>Trung bình các câu, quy đổi về thang 10.</small>
                    </div>
                  ) : <div className="text-amber-700">
                    <p>{row.status === 'COMPLETED' ? `Đã lưu điểm ${grade.graded} câu chính` : 'Chưa thi xong'}</p>
                    {row.status === 'COMPLETED' && <p>Cần hoàn tất chấm điểm</p>}
                  </div>}

                  {!demo && questions.length > 0 && <details className="mt-2 text-slate-700"><summary className="cursor-pointer">Xem điểm từng câu</summary>
                    <ul className="mt-2 space-y-2">{questions.map((q, index) => <li key={q.questionAttemptId}>
                      <Link className="text-blue-700 underline" to={`/lecturer/exams/${examId}/attempts/${row.attemptId}?question=${encodeURIComponent(q.questionAttemptId)}`}>{q.questionContent || `Câu ${index + 1}`}</Link>
                      <p>{q.status === 'GRADED' && q.finalScore !== null ? `${q.finalScore} / ${q.maxScore} · ${q.publishedAt ? 'Đã công bố' : 'Đã lưu điểm'}` : 'Chưa chấm'}</p>
                    </li>)}</ul>
                  </details>}
                </td>
                <td className="p-4">
                  {allowReview && (!demo || row.status === 'COMPLETED') ? (
                    <Link
                      className="button outline"
                      to={`/lecturer/exams/${examId}/attempts/${targetAttemptId}${summary ? '?tab=summary' : ''}`}
                    >
                      {summary ? 'Xem tổng kết' : 'Mở hồ sơ'}
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
