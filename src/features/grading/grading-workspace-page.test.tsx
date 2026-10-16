import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { GradingWorkspacePage } from './grading-workspace-page'
import { runtimeConfig } from '../../services/api/runtime-config'
import { apiExamMonitoringRepository } from '../exams/api-exam-monitoring-repository'

const original = runtimeConfig.dataSource
const url = '/lecturer/exams/11111111-1111-4111-8111-111111111111/attempts/attempt-1'
function mount() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const router = createMemoryRouter([{ path: '/lecturer/exams/:examId/attempts/:attemptId', element: <GradingWorkspacePage /> }], { initialEntries: [url] })
  render(<QueryClientProvider client={client}><RouterProvider router={router} /></QueryClientProvider>)
}
afterEach(() => { cleanup(); runtimeConfig.dataSource = original; vi.restoreAllMocks() })
describe('grading authority', () => {
  it('validates criterion bounds, confirms demo only and keeps official score unavailable', async () => {
    runtimeConfig.dataSource = 'mock'
    mount()
    const user = userEvent.setup()
    const inputs = screen.getAllByRole('spinbutton')
    await user.clear(inputs[0])
    await user.click(screen.getByRole('button', { name: 'Xác nhận điểm demo' }))
    expect(screen.getByText(/Nhập đầy đủ điểm/)).toBeInTheDocument()
    await user.clear(inputs[1]); await user.clear(inputs[2])
    await user.type(inputs[0], '4')
    await user.type(inputs[1], '3')
    await user.type(inputs[2], '4')
    await user.click(screen.getByRole('button', { name: 'Xác nhận điểm demo' }))
    expect(screen.queryByRole('dialog', { name: 'Xác nhận điểm demo?' })).not.toBeInTheDocument()
    await user.clear(inputs[0]); await user.type(inputs[0], '3')
    await user.click(screen.getByRole('button', { name: 'Xác nhận điểm demo' }))
    const dialog = screen.getByRole('dialog', { name: 'Xác nhận điểm demo?' })
    await user.click(within(dialog).getByRole('button', { name: 'Xác nhận demo' }))
    expect(inputs[0]).toBeDisabled()
    await user.click(screen.getByRole('button', { name: 'Tổng kết hồ sơ' }))
    expect(screen.getByText('ĐIỂM CHỐT MẪU').parentElement).toHaveTextContent('10.0')
    expect(screen.queryByText('ĐIỂM CHÍNH THỨC')).not.toBeInTheDocument()
    expect(screen.getByText('Chỉ sử dụng trong phiên mô phỏng')).toBeInTheDocument()
  })
  it('never exposes demo transcript or scoring controls in API mode', async () => {
    runtimeConfig.dataSource = 'api'
    vi.spyOn(apiExamMonitoringRepository, 'get').mockResolvedValue({ examId: 'exam', examTitle: 'Exam', totalCandidates: 1, completedCount: 1, readyCount: 0, inProgressCount: 0, scheduledCount: 0, absentCount: 0, cancelledCount: 0, candidateStatuses: [{ attemptId: 'attempt-1', examId: 'exam', studentId: 'student', studentName: 'Authorized candidate', studentCode: 'S01', studentEmail: 's@example.com', slotNumber: 1, scheduledStartTime: '', scheduledEndTime: '', actualStartTime: null, actualEndTime: null, status: 'COMPLETED', accessCode: null }] })
    mount()
    expect(await screen.findByText('Authorized candidate')).toBeInTheDocument()
    expect(screen.getByText('Chưa có transcript được cấp quyền xem.')).toBeInTheDocument()
    expect(screen.queryAllByRole('spinbutton')).toHaveLength(0)
    expect(screen.queryByText(/Phân biệt mảng động/)).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Chốt điểm' })).toBeDisabled()
  })
})
