import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SessionContext } from '../../app/providers/session-context'
import { ExamMonitoringPage } from './exam-monitoring-page'
import { apiExamMonitoringRepository, type MonitoringDashboard } from './api-exam-monitoring-repository'
import { apiExamRepository } from './api-exam-repository'
import { examRepository } from './exam-repository'
import type { ExamSession } from './exam-types'
import { runtimeConfig } from '../../services/api/runtime-config'

const examId = '22222222-2222-4222-8222-222222222222'
const attemptId = '33333333-3333-4333-8333-333333333333'

const mockExamData: ExamSession = {
  id: examId,
  title: 'Kỳ thi Java Core',
  subjectId: 'sub-1',
  subjectCode: 'PRJ301',
  subjectName: 'Java Web',
  scheduledAt: '2026-11-04T08:00:00Z',
  durationMinutes: 60,
  studentCount: 1,
  mainQuestionCount: 3,
  maxFollowUpCount: 2,
  status: 'PUBLISHED',
}

const mockMonitoringDashboard: MonitoringDashboard = {
  examId,
  examTitle: 'Kỳ thi Java Core',
  totalCandidates: 1,
  scheduledCount: 1,
  readyCount: 0,
  inProgressCount: 0,
  completedCount: 0,
  absentCount: 0,
  cancelledCount: 0,
  candidateStatuses: [
    {
      attemptId,
      examId,
      studentId: 'std-1',
      studentCode: 'SE170001',
      studentName: 'Nguyễn Văn A',
      studentEmail: 'a@fpt.edu.vn',
      slotNumber: 1,
      scheduledStartTime: '2026-11-04T08:00:00Z',
      scheduledEndTime: '2026-11-04T08:20:00Z',
      actualStartTime: null,
      actualEndTime: null,
      status: 'SCHEDULED',
      accessCode: null,
    },
  ],
}

function mount() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const router = createMemoryRouter(
    [{ path: '/lecturer/exams/:examId/monitor', element: <ExamMonitoringPage /> }],
    { initialEntries: [`/lecturer/exams/${examId}/monitor`] }
  )
  return render(
    <QueryClientProvider client={client}>
      <SessionContext.Provider
        value={{
          session: {
            status: 'authenticated',
            user: { id: 'demo-lecturer', displayName: 'Thầy Quan', roles: ['lecturer'] },
          },
          signIn: vi.fn(),
          signOut: vi.fn(),
        }}
      >
        <RouterProvider router={router} />
      </SessionContext.Provider>
    </QueryClientProvider>
  )
}

const originalSource = runtimeConfig.dataSource

beforeEach(() => {
  runtimeConfig.dataSource = 'api'
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  runtimeConfig.dataSource = originalSource
})

describe('ExamMonitoringPage - Open Scheduled Attempts', () => {
  it('renders "Mở ca thi" button for SCHEDULED candidate and opens confirmation dialog', async () => {
    vi.spyOn(examRepository, 'get').mockResolvedValue(mockExamData)
    vi.spyOn(apiExamRepository, 'get').mockResolvedValue(mockExamData)
    vi.spyOn(apiExamMonitoringRepository, 'get').mockResolvedValue(mockMonitoringDashboard)
    const resetSpy = vi.spyOn(apiExamMonitoringRepository, 'reset').mockResolvedValue({
      ...mockMonitoringDashboard.candidateStatuses[0],
      status: 'READY',
    })

    mount()

    // 1. Wait for page to load
    expect(await screen.findByRole('heading', { name: /Giám sát kỳ thi/ })).toBeInTheDocument()
    expect(screen.getByText('Nguyễn Văn A')).toBeInTheDocument()
    expect(screen.getAllByText('ĐÃ XẾP LỊCH').length).toBeGreaterThan(0)

    // 2. Both single "Mở ca thi" and bulk "Mở tất cả ca đã xếp lịch" are visible
    const openBtn = screen.getByRole('button', { name: 'Mở ca thi' })
    const openAllBtn = screen.getByRole('button', { name: /Mở tất cả ca đã xếp lịch/ })
    expect(openBtn).toBeInTheDocument()
    expect(openAllBtn).toBeInTheDocument()

    // 3. Click "Mở ca thi" opens dialog
    const user = userEvent.setup()
    await user.click(openBtn)

    expect(screen.getByRole('heading', { name: 'Mở ca thi cho sinh viên?' })).toBeInTheDocument()
    expect(screen.getByText(/chuyển sang trạng thái SẴN SÀNG/)).toBeInTheDocument()

    // 4. Confirming triggers the backend reset call
    const confirmBtn = screen.getByRole('button', { name: 'Xác nhận mở ca' })
    await user.click(confirmBtn)

    await waitFor(() => {
      expect(resetSpy).toHaveBeenCalledWith(examId, attemptId)
    })
  })

  it('supports bulk opening all scheduled candidates', async () => {
    vi.spyOn(examRepository, 'get').mockResolvedValue(mockExamData)
    vi.spyOn(apiExamRepository, 'get').mockResolvedValue(mockExamData)
    vi.spyOn(apiExamMonitoringRepository, 'get').mockResolvedValue(mockMonitoringDashboard)
    const resetSpy = vi.spyOn(apiExamMonitoringRepository, 'reset').mockResolvedValue({
      ...mockMonitoringDashboard.candidateStatuses[0],
      status: 'READY',
    })

    mount()

    const openAllBtn = await screen.findByRole('button', { name: /Mở tất cả ca đã xếp lịch/ })
    const user = userEvent.setup()
    await user.click(openAllBtn)

    expect(screen.getByRole('heading', { name: 'Mở tất cả ca thi đã xếp lịch?' })).toBeInTheDocument()

    const confirmAllBtn = screen.getByRole('button', { name: 'Xác nhận mở tất cả' })
    await user.click(confirmAllBtn)

    await waitFor(() => {
      expect(resetSpy).toHaveBeenCalledWith(examId, attemptId)
    })
  })
})
