import { ArrowRight, BookOpen, Calendar, CheckCircle2, Clock, FileText, Settings, Users, Video } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import type { ExamSession } from '../exam-types'
import { examStatusMeta } from '../exam-types'
import { examRoutes } from '../exam-routes'
import { SourceMetric } from '../../../components/common/source-page'
import { StatusBadge } from '../../../components/common/states'

const date = (value: string) => Number.isFinite(Date.parse(value))
  ? new Intl.DateTimeFormat('vi-VN', { dateStyle: 'long', timeStyle: 'short' }).format(new Date(value))
  : 'Chưa thiết lập'

export function ExamDetailView({ exam, candidateCount, scheduledCount, actions, feedback, children }: {
  exam: ExamSession
  candidateCount?: number
  scheduledCount?: number
  actions?: ReactNode
  feedback?: ReactNode
  children?: ReactNode
}) {
  const subjectPath = '/lecturer/subjects/' + encodeURIComponent(exam.subjectId)
  const scheduleProgress = candidateCount && scheduledCount !== undefined
    ? Math.min(100, Math.round(scheduledCount / candidateCount * 100))
    : undefined
  const setupLinks = [
    { to: examRoutes.edit(exam.id), title: 'Thông tin & cấu hình', detail: 'Tên kỳ thi và khung thời gian', icon: Settings },
    { to: examRoutes.students(exam.id), title: 'Danh sách thí sinh', detail: 'Chọn sinh viên tham gia kỳ thi', icon: Users },
    { to: examRoutes.schedule(exam.id), title: 'Lịch thi', detail: 'Xếp ca và kiểm tra giờ thi', icon: Calendar },
    { to: examRoutes.questions(exam.id), title: 'Cấu hình câu hỏi', detail: 'Thiết lập câu chính và giới hạn hỏi thêm', icon: FileText },
  ]

  return (
    <section className="source-screen mx-auto max-w-7xl space-y-4 pb-4">
      <header className="exam-list-hero exam-overview-hero exam-demo-masthead rounded-2xl">
        <div className="exam-list-hero-content">
          <nav aria-label="Đường dẫn" className="mb-3 flex flex-wrap items-center gap-2 text-xs text-blue-100">
            <Link className="underline underline-offset-4" to={examRoutes.list}>Kỳ thi vấn đáp</Link>
            <span aria-hidden="true">/</span><span>Tổng quan</span>
          </nav>
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-blue-200">AIVES · Điều phối vấn đáp</p>
          <h1 className="exam-list-hero-title break-words">{exam.title}</h1>
          <p className="exam-list-hero-desc flex flex-wrap items-center gap-2">
            <BookOpen size={15} aria-hidden="true" />
            <span>{exam.subjectCode} · {exam.subjectName}</span>
          </p>
        </div>
        <div className="exam-list-actions flex-wrap">
          {actions}
          <Link className="button primary" to={examRoutes.monitor(exam.id)}>
            <Video size={16} /> Giám sát kỳ thi <ArrowRight size={15} />
          </Link>
        </div>
      </header>

      {feedback}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <SourceMetric label="TRẠNG THÁI KỲ THI" value={<StatusBadge {...examStatusMeta[exam.status]} />} icon={CheckCircle2} />
        <SourceMetric label="THÍ SINH DỰ THI" value={candidateCount ?? '—'} icon={Users} tone="slate" />
        <SourceMetric label="ĐÃ XẾP CA" value={scheduledCount ?? '—'} icon={Calendar} tone="emerald" />
        <SourceMetric label="CÂU HỎI CHÍNH" value={exam.mainQuestionCount} detail={exam.maxFollowUpCount + ' câu hỏi thêm tối đa'} icon={FileText} tone="slate" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="min-w-0 space-y-4 lg:col-span-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
            <h2 className="text-base font-semibold text-slate-900">Thông tin kỳ thi</h2>
            <dl className="mt-3 grid gap-2 sm:grid-cols-3">
              <div className="rounded-xl bg-blue-50 p-3">
                <dt className="flex items-center gap-2 text-xs font-semibold text-blue-800"><Calendar size={15} /> Bắt đầu</dt>
                <dd className="mt-2 text-sm font-semibold text-slate-900">{date(exam.scheduledAt)}</dd>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <dt className="flex items-center gap-2 text-xs font-semibold text-slate-600"><Clock size={15} /> Thời lượng</dt>
                <dd className="mt-2 text-sm font-semibold text-slate-900">{exam.durationMinutes} phút</dd>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <dt className="flex items-center gap-2 text-xs font-semibold text-slate-600"><FileText size={15} /> Cấu trúc bài thi</dt>
                <dd className="mt-2 text-sm font-semibold text-slate-900">{exam.mainQuestionCount} chính · {exam.maxFollowUpCount} hỏi thêm</dd>
              </div>
            </dl>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-blue-700">Chuẩn bị kỳ thi</p>
                <h2 className="text-base font-semibold text-slate-900">Thiết lập kỳ thi</h2>
              </div>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-800">4 bước thiết lập</span>
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {setupLinks.map(({ to, title, detail, icon: Icon }, index) => (
                <Link key={to} to={to} className="exam-setup-tile group flex items-start gap-3 rounded-xl border border-slate-200 p-3">
                  <span className="shrink-0 rounded-lg bg-blue-50 p-2 text-blue-700"><Icon size={17} /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-slate-900">{title}</span>
                    <span className="mt-1 block text-xs text-slate-600">{detail}</span>
                  </span>
                  <span className="flex shrink-0 flex-col items-center gap-1 text-blue-700">
                    <span aria-hidden="true" className="font-mono text-[10px] font-semibold">0{index + 1}</span>
                    <ArrowRight size={15} />
                  </span>
                </Link>
              ))}
            </div>
          </section>
        </div>

        <aside className="min-w-0 space-y-4">
          {scheduleProgress !== undefined && (
            <section className="exam-schedule-progress rounded-2xl border border-blue-200 p-4">
              <div className="flex items-center justify-between gap-2">
                <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900"><Calendar size={16} /> Tiến độ xếp ca</h2>
                <strong className="text-sm text-blue-800">{scheduledCount}/{candidateCount}</strong>
              </div>
              <progress className="mt-3 block h-2 w-full overflow-hidden rounded-full" value={scheduleProgress} max={100} aria-label="Tiến độ xếp ca" />
              <p className="mt-2 text-xs text-slate-600">{scheduleProgress}% thí sinh đã có giờ thi</p>
            </section>
          )}
          {children}
          <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900"><BookOpen size={16} className="text-blue-700" /> Tài nguyên học phần</h2>
            <p className="text-xs text-slate-600">Quản lý câu hỏi và tiêu chí chấm của môn.</p>
            <Link className="button outline w-full justify-between" to={subjectPath + '/questions'}>Ngân hàng câu hỏi <ArrowRight size={14} /></Link>
            <Link className="button outline w-full justify-between" to={subjectPath + '/rubrics'}>Rubric chấm điểm <ArrowRight size={14} /></Link>
          </section>
        </aside>
      </div>
    </section>
  )
}
