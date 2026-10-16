import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cleanup, renderHook, waitFor, act } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { ReactNode } from 'react'
import { runtimeConfig } from '../../services/api/runtime-config'
import { apiExamMonitoringRepository, type MonitoringDashboard } from './api-exam-monitoring-repository'
import { examRepository } from './exam-repository'
import { monitoringKeys } from './exam-hooks'
import { useAssessmentOverview } from './use-assessment-overview'

const source = runtimeConfig.dataSource
const examId = '11111111-1111-4111-8111-111111111111'
function setup() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return { client, wrapper: ({ children }: { children: ReactNode }) => <QueryClientProvider client={client}>{children}</QueryClientProvider> }
}
afterEach(() => { cleanup(); runtimeConfig.dataSource = source; vi.restoreAllMocks() })
describe('assessment overview data authority', () => {
  it('preserves API failure without selecting a demo roster', async () => {
    runtimeConfig.dataSource = 'api'
    vi.spyOn(apiExamMonitoringRepository, 'get').mockRejectedValue(new Error('Forbidden'))
    const roster = vi.spyOn(examRepository, 'listRoster')
    const { wrapper } = setup()
    const { result } = renderHook(() => useAssessmentOverview(examId), { wrapper })
    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error?.message).toBe('Forbidden')
    expect(roster).not.toHaveBeenCalled()
  })
  it('shares the existing monitoring cache and updates after monitoring changes', async () => {
    runtimeConfig.dataSource = 'api'
    const data: MonitoringDashboard = { examId, examTitle: 'Exam', totalCandidates: 2, scheduledCount: 2, readyCount: 0, inProgressCount: 0, completedCount: 0, absentCount: 0, cancelledCount: 0, candidateStatuses: [] }
    const fetch = vi.spyOn(apiExamMonitoringRepository, 'get').mockResolvedValue(data)
    const { client, wrapper } = setup()
    client.setQueryData(monitoringKeys.detail(examId), data)
    const { result } = renderHook(() => useAssessmentOverview(examId), { wrapper })
    await waitFor(() => expect(result.current.data?.completed).toBe(0))
    act(() => client.setQueryData(monitoringKeys.detail(examId), { ...data, completedCount: 1, scheduledCount: 1 }))
    await waitFor(() => expect(result.current.data?.completed).toBe(1))
    expect(fetch).toHaveBeenCalledTimes(1)
  })
  it('does not invent attempt states from a demo student assignment', async () => {
    runtimeConfig.dataSource = 'mock'
    const monitor = vi.spyOn(apiExamMonitoringRepository, 'get')
    vi.spyOn(examRepository, 'listRoster').mockResolvedValue([{ id: 'roster-1', examId, studentCode: 'S01', fullName: 'Demo student', email: 'demo@example.com' }])
    const { wrapper } = setup()
    const { result } = renderHook(() => useAssessmentOverview(examId), { wrapper })
    await waitFor(() => expect(result.current.data?.total).toBe(1))
    expect(result.current.data?.rows[0].status).toBeNull()
    expect(result.current.data?.completed).toBeNull()
    expect(monitor).not.toHaveBeenCalled()
  })
})
