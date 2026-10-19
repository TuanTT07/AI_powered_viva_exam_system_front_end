import { useQuery } from '@tanstack/react-query'
import { runtimeConfig } from '../../services/api/runtime-config'
import { apiExamMonitoringRepository, type MonitoringCandidate, type MonitoringDashboard, type MonitoringStatus } from './api-exam-monitoring-repository'
import { examRepository } from './exam-repository'
import { examKeys, monitoringKeys, useExam } from './exam-hooks'
import { createDemoAssessment } from './mocks/assessment-demo'
import type { RosterStudent } from './roster-types'

export type AttemptRow = Pick<MonitoringCandidate, 'attemptId' | 'studentName' | 'studentCode' | 'studentEmail'> & { status: MonitoringStatus | null; scheduledStartTime: string | null; demoScore?: number }
type AssessmentOverview = { rows: AttemptRow[]; total: number; completed: number | null; active: number | null; absent: number | null; demo: boolean }
export function useAssessmentOverview(examId: string) {
  const api = runtimeConfig.dataSource === 'api'
  const exam = useExam(api ? undefined : examId)
  // Reuse the monitoring/roster cache so existing mutation invalidation also
  // refreshes the queue and report. The inactive repository is never called.
  const monitoring = useQuery<MonitoringDashboard, Error, AssessmentOverview>({
    queryKey: monitoringKeys.detail(examId), queryFn: () => apiExamMonitoringRepository.get(examId), enabled: api && Boolean(examId),
    select: data => ({ rows: data.candidateStatuses, total: data.totalCandidates, completed: data.completedCount, active: data.inProgressCount, absent: data.absentCount, demo: false }),
  })
  const roster = useQuery<RosterStudent[], Error, AssessmentOverview>({
    queryKey: examKeys.roster(examId), queryFn: () => examRepository.listRoster(examId), enabled: !api && Boolean(examId),
    select: data => createDemoAssessment(exam.data ?? undefined, data),
  })
  return api ? monitoring : roster
}
