import type { TranscriptTurnDto } from '../grading/api-evaluation-service'
import { transcriptLabels } from '../grading/transcript-labels'
import { useRef } from 'react'
import { ResultQueryBoundary } from './result-query-boundary'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft, FileText, ShieldCheck, Award, MessageSquare, ListChecks, Calendar } from 'lucide-react'
import { Button, Skeleton } from '../../components/ui/primitives'
import { DemoLabel } from '../../components/common/inline-notice'
import { runtimeConfig } from '../../services/api/runtime-config'
import { ResultStatus } from './student-result-list-page'
import { demoResults, resultDate, resultOutcome, useResultDetail } from './student-result-data'
import '../students/student.css'
import './student-results.css'

export function StudentExamResultPage() {
  return <ResultQueryBoundary><ResultDetail /></ResultQueryBoundary>
}
function ResultDetail() {
  const { examId = '' } = useParams()
  const [params] = useSearchParams()
  const demo = runtimeConfig.dataSource === 'mock'
  const query = useResultDetail(examId, params.get('attemptId'))
  const result = demo ? demoResults.find(r => r.examId === examId && (!params.has('attemptId') || params.get('attemptId') === r.attemptId)) : query.data
  const recordRef = useRef<HTMLDetailsElement>(null)
  const released = Boolean(result?.demo || result?.score !== null && result?.score !== undefined)
  const questions = released ? result?.questions ?? [] : []
  return <section className="student-page result-detail-page">
    <nav className="results-breadcrumb" aria-label="Đường dẫn"><Link to="/student/results">Kết quả thi</Link><span aria-hidden="true">/</span><span aria-current="page">Chi tiết kết quả</span></nav>
    <header className="student-hero">
      <div className="student-hero-content">
        <div className="student-hero-badge"><Award size={14} aria-hidden="true" />Kết quả &amp; đánh giá</div>
        <h1 className="student-hero-title">Chi tiết kết quả thi</h1>
        <p className="student-hero-desc">Xem điểm và nhận xét đã được công bố cho lượt thi của bạn.</p>
      </div>
      <div className="student-actions"><Link className="button outline" to="/student/results"><ArrowLeft size={16} aria-hidden="true" />Trở lại kết quả</Link></div>
    </header>
    {demo && <DemoLabel detail="Biên bản và điểm minh họa." />}
    {!demo && query.isFetching && !query.data && <Skeleton label="Đang tải chi tiết kết quả" />}
    {query.isError && !demo ? <section className="result-panel" role="alert"><h2>Không thể xem kết quả này</h2><p>Kết quả không khả dụng hoặc bạn chưa được cấp quyền truy cập.</p><Button variant="outline" onClick={() => query.refetch()}>Thử lại</Button></section> : <>
      <section className="dashboard-section result-summary result-detail-summary" aria-labelledby="result-summary-title"><div><span className="subject-code-badge">{result?.course.split(' · ')[0] || 'Kỳ thi vấn đáp'}</span><h2 id="result-summary-title">{result?.title ?? 'Biên bản kết quả'}</h2><p>{result?.course.split(' · ').slice(1).join(' · ')}</p><p className="result-detail-date"><Calendar size={14} aria-hidden="true" />Ngày thi: {resultDate(result?.date ?? null)}</p><div className="result-approval"><ShieldCheck size={16} /><span>{result?.demo ? 'Xác nhận mẫu · Dữ liệu mô phỏng' : released ? 'Đánh giá từng câu đã được công bố' : 'Chưa có kết quả được hệ thống công bố'}</span></div></div><div className={`result-summary-score ${resultOutcome(result)}`}><span>{demo ? 'Điểm mẫu' : 'Điểm trung bình'}</span><strong>{result?.score?.toFixed(1) ?? '—'}<small> /10</small></strong><ResultStatus result={result} /></div></section>
      {!demo && result?.score == null && <p role="status" className="result-note">Đang chờ giảng viên hoàn tất và công bố kết quả.</p>}
      <div className="result-detail-grid">
      <div className="result-detail-main">
      {released ? <>
      <section className="dashboard-section"><div className="section-header-row"><h2 className="section-title result-section-title"><MessageSquare size={18} aria-hidden="true" />Nhận xét giảng viên</h2></div><p className="result-prose">{result?.feedback ?? 'Chưa có nhận xét tổng quan được công bố.'}</p></section>
      <section className="dashboard-section"><div className="section-header-row"><h2 className="section-title result-section-title"><ListChecks size={18} aria-hidden="true" />Đánh giá từng câu hỏi chính</h2></div><p className="result-note">Mở từng câu để xem câu trả lời, điểm và nhận xét đã công bố.</p><div className="result-questions">{questions.map(q => <details className="result-question" key={q.questionOrder}>
        <summary><span>Câu hỏi chính {q.questionOrder}</span><strong>{q.finalScore} / {q.maxScore} điểm</strong></summary>
        <div>
          {q.questionContent && <p className="result-prose result-question-content"><strong>Đề bài:</strong> {q.questionContent}</p>}
          <PublishedTranscript turns={q.transcript ?? []} questionOrder={q.questionOrder} />
          {q.criteria.length > 0 && <div className="result-criteria">
            <h3>Điểm theo tiêu chí</h3>
            <ul>{q.criteria.map(c => <li key={c.criterionId}><strong>{c.criterionName}</strong> — {c.finalScore ?? 0} / {c.maxScore}{c.comment && <span className="result-note"> · {c.comment}</span>}</li>)}</ul>
          </div>}
          <h3>Nhận xét của giảng viên</h3>
          <p className="result-prose">{q.feedback || 'Chưa có nhận xét được công bố cho câu hỏi này.'}</p>
          <p className="result-note">Ngày công bố: {resultDate(q.publishedAt)}</p>
        </div>
      </details>)}</div>{!questions.length && <p>Chưa có đánh giá từng câu được cung cấp.</p>}</section>
      </> : <section className="dashboard-section result-publication-empty"><div className="result-publication-icon"><ShieldCheck size={24} aria-hidden="true" /></div><h2 className="section-title">Đang chờ công bố đánh giá</h2><p>Nhận xét giảng viên và điểm từng câu sẽ hiển thị tại đây khi được công bố.</p></section>}
      </div>
      <aside className="result-detail-aside" aria-label="Thông tin đánh giá">
      <section className="dashboard-section"><div className="section-header-row"><h2 className="section-title result-section-title"><Award size={18} aria-hidden="true" />Tổng quan đánh giá</h2></div><dl className="result-overview"><div><dt>Điểm trung bình</dt><dd>{result?.score !== null && result?.score !== undefined ? `${result.score.toFixed(1)} / 10` : 'Chưa được cung cấp'}</dd></div><div><dt>Số câu hỏi chính đã công bố</dt><dd>{released ? questions.length : 'Chờ công bố'}</dd></div></dl>{!demo && <p className="result-note">Kết quả hiển thị sau khi giảng viên hoàn tất công bố. Điểm từng câu được quy đổi về thang 10 và tính trung bình.</p>}</section>
      <section className="dashboard-section result-record"><div><h2 className="section-title result-section-title"><FileText size={18} aria-hidden="true" />Biên bản đánh giá</h2><p>Xem lại dữ liệu đánh giá đã công bố của lượt thi này.</p></div>{questions.length > 0 ? <a className="button outline" href="#approved-assessment-record" onClick={() => { if (recordRef.current) recordRef.current.open = true }}><FileText size={16} />Xem biên bản đánh giá</a> : <Button variant="outline" disabled>Chưa có biên bản được công bố</Button>}</section>
      {questions.length > 0 && <details ref={recordRef} id="approved-assessment-record" className="result-panel"><summary>Biên bản đánh giá đã công bố</summary><p className="result-note">Nội dung dưới đây tổng hợp các đánh giá đã công bố, bao gồm câu trả lời của bạn.</p><dl className="result-record-lines">{questions.map(q => <div key={q.questionOrder}>
        <dt>Câu hỏi chính {q.questionOrder} · {q.finalScore} / {q.maxScore} điểm</dt>
        <dd className="result-prose">
          {q.questionContent && <><strong>Đề bài:</strong> {q.questionContent}<br /></>}
          <PublishedTranscript turns={q.transcript ?? []} questionOrder={q.questionOrder} />
          <strong>Nhận xét:</strong> {q.feedback || 'Chưa có nhận xét.'}<br />
          Công bố: {resultDate(q.publishedAt)}
        </dd>
      </div>)}</dl></details>}
      {result && <details className="dashboard-section result-metadata"><summary>Thông tin bổ sung về kỳ thi</summary><dl className="result-overview"><div><dt>Mã kỳ thi</dt><dd>{result.examId}</dd></div><div><dt>Mã lượt thi</dt><dd>{result.attemptId}</dd></div></dl></details>}
      </aside>
      </div>
    </>}
  </section>
}

function PublishedTranscript({ turns, questionOrder }: { turns: TranscriptTurnDto[]; questionOrder: number }) {
  if (!turns.length) return null
  const labels = transcriptLabels(turns)
  return <section aria-label={`Hội thoại câu hỏi chính ${questionOrder}`}>
    <h3>Hội thoại câu hỏi chính và câu hỏi phụ</h3>
    <p className="result-note">Câu hỏi phụ và câu trả lời bên dưới thuộc câu hỏi chính này, được đánh giá cùng trong một mục.</p>
    <ol>{turns.map((turn, index) => <li key={turn.id} className="result-prose">
      <strong>{labels[index] || (turn.speaker === 'AI' ? 'Giám khảo AI' : 'Sinh viên')}:</strong> {turn.textContent}
    </li>)}</ol>
  </section>
}
