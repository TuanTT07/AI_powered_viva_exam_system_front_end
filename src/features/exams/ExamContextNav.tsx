import { NavLink, useLocation } from 'react-router-dom'
export function ExamContextNav({ examId }: { examId: string }) {
  const location = useLocation()
  const base = `/lecturer/exams/${encodeURIComponent(examId)}`
  const params = new URLSearchParams(location.search)
  const summary = params.get('view') === 'summary' || params.get('tab') === 'summary'
  const items = [
    ['Tổng quan', base, location.pathname === base],
    ['Thí sinh', `${base}/students`, location.pathname === `${base}/students`],
    ['Lịch thi', `${base}/schedule`, location.pathname === `${base}/schedule`],
    ['Cấu hình', `${base}/edit`, location.pathname === `${base}/edit` || location.pathname === `${base}/questions`],
    ['Giám sát', `${base}/monitor`, location.pathname === `${base}/monitor`],
    ['Chấm điểm', `${base}/attempts`, location.pathname.startsWith(`${base}/attempts`) && !summary],
    ['Tổng hợp & Chốt điểm', `${base}/attempts?view=summary`, location.pathname.startsWith(`${base}/attempts`) && summary],
    ['Thống kê & Báo cáo', `${base}/report`, location.pathname === `${base}/report`],
  ] as const
  return <><nav aria-label="Chức năng kỳ thi" className="resource-tabs">{items.map(([label, to, active]) => <NavLink key={label} to={to} className={() => active ? 'active' : ''} aria-current={active ? 'page' : false}>{label}</NavLink>)}</nav>{(location.pathname === `${base}/edit` || location.pathname === `${base}/questions`) && <nav aria-label="Thiết lập kỳ thi" className="resource-subtabs"><NavLink to={`${base}/edit`}>Thông tin & Quy chế</NavLink><NavLink to={`${base}/questions`}>Cấu hình câu hỏi</NavLink></nav>}</>
}
