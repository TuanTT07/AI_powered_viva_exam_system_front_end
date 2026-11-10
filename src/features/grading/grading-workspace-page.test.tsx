import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { GradingWorkspacePage } from './grading-workspace-page'
import { apiEvaluationService, type EvaluationResponseDto } from './api-evaluation-service'
import { runtimeConfig } from '../../services/api/runtime-config'
import { apiExamMonitoringRepository } from '../exams/api-exam-monitoring-repository'

const original = runtimeConfig.dataSource
const url = '/lecturer/exams/11111111-1111-4111-8111-111111111111/attempts/attempt-1'

function mount() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const router = createMemoryRouter(
    [{ path: '/lecturer/exams/:examId/attempts/:attemptId', element: <GradingWorkspacePage /> }],
    { initialEntries: [url] }
  )
  render(
    <QueryClientProvider client={client}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
}

afterEach(() => {
  cleanup()
  localStorage.clear()
  runtimeConfig.dataSource = original
  vi.restoreAllMocks()
})

describe('grading authority', () => {
  it('validates criterion bounds, confirms demo only and keeps official score unavailable', async () => {
    runtimeConfig.dataSource = 'mock'
    mount()
    const user = userEvent.setup()
    const inputs = screen.getAllByRole('spinbutton')
    await user.clear(inputs[0])
    await user.click(screen.getByRole('button', { name: 'Xác nhận điểm demo' }))
    expect(screen.getByText(/Nhập đầy đủ điểm/)).toBeInTheDocument()
    await user.clear(inputs[1])
    await user.clear(inputs[2])
    await user.type(inputs[0], '4')
    await user.type(inputs[1], '3')
    await user.type(inputs[2], '4')
    await user.click(screen.getByRole('button', { name: 'Xác nhận điểm demo' }))
    expect(screen.queryByRole('dialog', { name: 'Xác nhận điểm demo?' })).not.toBeInTheDocument()
    await user.clear(inputs[0])
    await user.type(inputs[0], '3')
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
    vi.spyOn(apiExamMonitoringRepository, 'get').mockResolvedValue({
      examId: 'exam',
      examTitle: 'Exam',
      totalCandidates: 1,
      completedCount: 1,
      readyCount: 0,
      inProgressCount: 0,
      scheduledCount: 0,
      absentCount: 0,
      cancelledCount: 0,
      candidateStatuses: [
        {
          attemptId: 'attempt-1',
          examId: 'exam',
          studentId: 'student',
          studentName: 'Authorized candidate',
          studentCode: 'S01',
          studentEmail: 's@example.com',
          slotNumber: 1,
          scheduledStartTime: '',
          scheduledEndTime: '',
          actualStartTime: null,
          actualEndTime: null,
          status: 'COMPLETED',
          accessCode: null,
        },
      ],
    })
    mount()
    expect(await screen.findByText('Authorized candidate')).toBeInTheDocument()
    expect(screen.getByText('Chưa có transcript được cấp quyền xem.')).toBeInTheDocument()
    expect(screen.queryAllByRole('spinbutton')).toHaveLength(0)
    expect(screen.queryByText(/Phân biệt mảng động/)).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Lưu điểm câu này' })).toBeDisabled()
  })

  it('opens ungraded assigned questions even when only the first has a persisted evaluation', async () => {
    runtimeConfig.dataSource = 'api'
    vi.spyOn(apiExamMonitoringRepository, 'get').mockResolvedValue({ candidateStatuses: [] } as never)
    const question = (id: string, attempt = 'attempt-1') => ({
      id, questionAttemptId: id, examAttemptId: attempt, questionContent: `Đề ${id}`,
      studentName: 'Student', criteria: [{ criterionId: 'criterion', criterionName: 'Kiến thức', maxScore: 10, aiScore: 3, finalScore: null, comment: null }],
      status: 'PENDING_REVIEW', overallFeedback: null, transcript: [],
    } as unknown as EvaluationResponseDto)
    const first = question('q1')
    const second = question('q2')
    vi.spyOn(apiEvaluationService, 'findByExam').mockImplementation(async (_id, params) => ({
      content: params?.page === 1 ? [question('other', 'other-attempt')] : [first],
      page: params?.page ?? 0, size: 1, totalPages: 2, totalElements: 3,
    }))
    const finalize = vi.spyOn(apiEvaluationService, 'finalizeEvaluation').mockResolvedValue({ ...second, status: 'GRADED', finalScore: 3 })
    const inventory = vi.spyOn(apiEvaluationService, 'attemptQuestions').mockResolvedValue([
      { questionOrder: 1, questionStatus: 'COMPLETED', evaluation: first },
      { questionOrder: 2, questionStatus: 'COMPLETED', evaluation: second },
      { questionOrder: 3, questionStatus: 'COMPLETED', evaluation: question('q3') },
    ])
    mount()
    const user = userEvent.setup()
    const next = await screen.findByRole('link', { name: 'Câu 2' })
    expect(screen.getByRole('link', { name: 'Câu 3' })).toBeInTheDocument()
    const input = screen.getAllByRole('spinbutton')[0]
    await user.clear(input)
    await user.type(input, '8')
    await user.click(next)
    expect(await screen.findByRole('dialog', { name: 'Rời bản chấm điểm chưa lưu?' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Rời màn hình' }))
    expect(await screen.findByText('Đề q2')).toBeInTheDocument()
    expect(screen.getAllByRole('spinbutton')[0]).toHaveValue(3)
    expect(inventory).toHaveBeenCalledWith('11111111-1111-4111-8111-111111111111', 'attempt-1')
    await user.click(screen.getByRole('button', { name: 'Lưu điểm câu này' }))
    await user.click(within(screen.getByRole('dialog', { name: 'Lưu điểm câu này?' })).getByRole('button', { name: 'Lưu điểm' }))
    expect(finalize).toHaveBeenCalledWith('q2', expect.objectContaining({ criteria: [expect.objectContaining({ criterionId: 'criterion', finalScore: 3 })] }))
  })

  it('supports draft saving and notes entry in demo mode', async () => {
    runtimeConfig.dataSource = 'mock'
    mount()
    const user = userEvent.setup()

    expect(screen.getByText(/Biên bản hội thoại/)).toBeInTheDocument()
    expect(screen.getByText('Câu hỏi chính đang rà soát')).toBeInTheDocument()

    const notesInput = screen.getByPlaceholderText(/Nhận xét chi tiết và lý do điều chỉnh điểm/)
    await user.type(notesInput, 'Sinh viên nắm vững kiến thức.')

    const saveDraftBtn = screen.getByRole('button', { name: 'Lưu nháp demo' })
    expect(saveDraftBtn).not.toBeDisabled()
    await user.click(saveDraftBtn)

    expect(screen.getByText('Đã lưu nháp trong phiên demo.')).toBeInTheDocument()
  })
})
