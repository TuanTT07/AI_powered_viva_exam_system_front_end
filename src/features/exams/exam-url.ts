import { examStatuses, type ExamListRequest, type ExamStatus } from './exam-types'

const statusValues = new Set<string>(examStatuses)

export function parseExamSearchParams(params: URLSearchParams): Pick<ExamListRequest, 'q' | 'subject' | 'status' | 'page'> {
  const rawStatus = params.get('status') ?? ''
  const rawPage = Number(params.get('page') ?? '1')
  return { q: params.get('q') ?? '', subject: params.get('subject') ?? '', status: statusValues.has(rawStatus) ? rawStatus as ExamStatus : '', page: Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1 }
}
