import { describe, expect, it } from 'vitest'
import { examSeed, mockExamRepository } from '../exam-repository'
import { questionRepository } from '../../question-bank/question-repository'
import { evaluateBasicInformation, evaluateExamReadiness, evaluateRoster, evaluateSchedule, evaluateQuestionConfig } from '../exam-readiness'
import { createDemoAssessment } from './assessment-demo'

describe('populated isolated demonstration data', () => {
  it('provides complete setup and consistent roster counts for every sample exam', async () => {
    for (const exam of examSeed) {
      const [roster, schedule, config, questions] = await Promise.all([mockExamRepository.listRoster(exam.id), mockExamRepository.getSchedule(exam.id), mockExamRepository.getQuestionConfig(exam.id), questionRepository.list(exam.subjectId)])
      expect(roster).toHaveLength(exam.studentCount)
      const readiness = evaluateExamReadiness([evaluateBasicInformation(exam), evaluateRoster(roster), evaluateSchedule(exam, roster, schedule), evaluateQuestionConfig(exam, config, questions)])
      expect(readiness.blockingIssues, exam.id).toEqual([])
      expect(readiness.warnings, exam.id).toEqual([])
      expect(readiness.ready, exam.id).toBe(true)
    }
  })
  it('shows demo grade distributions only for completed sample attempts', async () => {
    const exam = examSeed.find(e => e.status === 'IN_PROGRESS')!
    const overview = createDemoAssessment(exam, await mockExamRepository.listRoster(exam.id))
    expect(overview.rows.filter(row => row.status === 'IN_PROGRESS')).toHaveLength(1)
    expect(overview.rows.every(row => row.status === 'COMPLETED' ? row.demoScore !== undefined && row.demoScore >= 0 && row.demoScore <= 10 : row.demoScore === undefined)).toBe(true)
    const draft = examSeed.find(e => e.status === 'DRAFT')!
    expect(createDemoAssessment(draft, await mockExamRepository.listRoster(draft.id)).rows.every(row => row.demoScore === undefined)).toBe(true)
  })
})
