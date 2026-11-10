import { apiEvaluationService } from './api-evaluation-service'

export async function loadExamEvaluations(examId: string) {
  const first = await apiEvaluationService.findByExam(examId)
  const content = [...first.content]
  for (let page = 1; page < first.totalPages; page++) {
    const next = await apiEvaluationService.findByExam(examId, { page })
    content.push(...next.content)
  }
  return { ...first, content }
}
