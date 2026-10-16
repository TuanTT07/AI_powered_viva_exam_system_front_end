import { NavLink } from 'react-router-dom'
export function SubjectContextNav({ subjectId }: { subjectId: string }) {
  const base = `/lecturer/subjects/${encodeURIComponent(subjectId)}`
  return <nav aria-label="Chức năng môn học" className="resource-tabs">{[['Tổng quan', base], ['Ngân hàng câu hỏi', `${base}/questions`], ['Rubric', `${base}/rubrics`], ['Học liệu & RAG', `${base}/materials`]].map(([label, to], i) => <NavLink key={to} to={to} end={i === 0}>{label}</NavLink>)}</nav>
}
