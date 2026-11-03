import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { SessionContext } from '../../app/providers/session-context'
import { ApiError } from '../../services/api/client'
import { runtimeConfig } from '../../services/api/runtime-config'
import type { AuthenticatedUser } from '../../types/auth'
import { StudentSchedulePortal } from './StudentSchedulePortal'
import { apiStudentExamRepository, type StudentExamPage, type StudentExamSummary } from './api-student-exam-repository'
import { matchesRequestedAttempt, studentExamPath, studentRoomSearch } from './student-exam-navigation'
import { interviewApi } from '../viva-session/interview-api'
import { VivaInterviewRoom } from '../viva-session/pages/VivaInterviewRoom'

const source = runtimeConfig.dataSource
const student: AuthenticatedUser = { id: '44444444-4444-4444-8444-444444444444', displayName: 'Sinh viên A', roles: ['student'] }
const slot: StudentExamSummary = {
  examId: '22222222-2222-4222-8222-222222222222', attemptId: '33333333-3333-4333-8333-333333333333',
  examTitle: 'Vấn đáp lập trình', courseCode: 'PRJ301', courseName: 'Lập trình Java', slotNumber: 3,
  scheduledStartTime: '2026-11-04T08:00:00+07:00', scheduledEndTime: '2026-11-04T08:20:00+07:00', status: 'READY',
}
const page = (content: StudentExamSummary[] = [slot]): StudentExamPage => ({ content, page: 0, size: 20, totalElements: content.length, totalPages: content.length ? 1 : 0 })
function mount(user = student, initial = '/student') {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } })
  const view = (account: AuthenticatedUser) => <QueryClientProvider client={client}>
    <SessionContext.Provider value={{ session: { status: 'authenticated', user: account }, signIn: vi.fn(), signOut: vi.fn() }}>
      <MemoryRouter initialEntries={[initial]}><Routes><Route path="/student/exams/:examId/session" element={<VivaInterviewRoom />} /><Route path="*" element={<StudentSchedulePortal />} /></Routes></MemoryRouter>
    </SessionContext.Provider>
  </QueryClientProvider>
  const rendered = render(view(user))
  return { ...rendered, switchAccount: (account: AuthenticatedUser) => rendered.rerender(view(account)) }
}
beforeEach(() => { runtimeConfig.dataSource = 'api' })
afterEach(() => { cleanup(); vi.restoreAllMocks(); runtimeConfig.dataSource = source })

describe('personal student schedule', () => {
  it('loads automatically, renders metadata and opens the assigned attempt without UUID entry', async () => {
    const list = vi.spyOn(apiStudentExamRepository, 'list').mockResolvedValue(page())
    mount()
    expect(await screen.findByRole('heading', { name: slot.examTitle })).toBeInTheDocument()
    expect(list).toHaveBeenCalledWith({ page: 0, size: 20 }, expect.any(AbortSignal))
    expect(screen.getByRole('link', { name: 'Kiểm tra thiết bị và vào thi' })).toHaveAttribute('href', studentExamPath(slot.examId, slot.attemptId, 'check'))
    expect(screen.queryByLabelText('Mã kỳ thi (UUID)')).not.toBeInTheDocument()
    expect(screen.getByText('Lập trình Java · Ca 3')).toBeInTheDocument()
  })
  it('shows loading followed by a successful empty schedule', async () => {
    let finish!: (value: StudentExamPage) => void
    vi.spyOn(apiStudentExamRepository, 'list').mockImplementation(() => new Promise(resolve => { finish = resolve }))
    const { container } = mount()
    expect(container.querySelector('[aria-busy="true"]')).toBeInTheDocument()
    finish(page([]))
    expect(await screen.findByRole('heading', { name: 'Bạn chưa có lịch thi' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Chi tiết ca thi' })).not.toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
  it('paginates on the server and resets page when filtering READY or changing size', async () => {
    const list = vi.spyOn(apiStudentExamRepository, 'list').mockImplementation(async input => ({ ...page(), page: input?.page ?? 0, totalElements: 40, totalPages: 2 }))
    mount()
    await screen.findByText('Trang 1 / 2')
    fireEvent.click(screen.getByRole('button', { name: 'Trang sau' }))
    await screen.findByText('Trang 2 / 2')
    fireEvent.change(screen.getByRole('combobox', { name: 'Trạng thái ca thi' }), { target: { value: 'READY' } })
    await screen.findByText('Trang 1 / 2')
    expect(list).toHaveBeenLastCalledWith({ page: 0, size: 20, status: 'READY' }, expect.any(AbortSignal))
    fireEvent.change(screen.getByRole('combobox', { name: 'Số ca mỗi trang' }), { target: { value: '100' } })
    await waitFor(() => expect(list).toHaveBeenLastCalledWith({ page: 0, size: 100, status: 'READY' }, expect.any(AbortSignal)))
  })
  it('shows API errors and retries without substituting demo data', async () => {
    vi.spyOn(apiStudentExamRepository, 'list').mockRejectedValueOnce(new Error('Máy chủ lịch thi tạm lỗi')).mockResolvedValue(page([]))
    mount()
    expect(await screen.findByText('Máy chủ lịch thi tạm lỗi')).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Chi tiết ca thi' })).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Thử lại' }))
    expect(await screen.findByRole('heading', { name: 'Bạn chưa có lịch thi' })).toBeInTheDocument()
  })
  it('denies a backend 403', async () => {
    vi.spyOn(apiStudentExamRepository, 'list').mockRejectedValue(new ApiError('Forbidden', { status: 403 }))
    mount()
    expect(await screen.findByRole('heading', { name: 'Không có quyền truy cập' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Lịch thi của tôi' })).not.toBeInTheDocument()
  })
  it('does not fetch student schedules for a lecturer', () => {
    const list = vi.spyOn(apiStudentExamRepository, 'list')
    mount({ ...student, roles: ['lecturer'] })
    expect(screen.getByRole('heading', { name: 'Không có quyền truy cập' })).toBeInTheDocument()
    expect(list).not.toHaveBeenCalled()
  })
  it('hides the previous account schedule immediately on account switching', async () => {
    vi.spyOn(apiStudentExamRepository, 'list').mockResolvedValueOnce(page()).mockResolvedValueOnce(page([]))
    const view = mount()
    await screen.findByRole('heading', { name: slot.examTitle })
    view.switchAccount({ ...student, id: '55555555-5555-4555-8555-555555555555', displayName: 'Sinh viên B' })
    expect(screen.queryByRole('heading', { name: slot.examTitle })).not.toBeInTheDocument()
    await screen.findByRole('heading', { name: 'Bạn chưa có lịch thi' })
  })
  it('handles null scheduling metadata and disables entry for a scheduled slot', async () => {
    vi.spyOn(apiStudentExamRepository, 'list').mockResolvedValue(page([{ ...slot, status: 'SCHEDULED', slotNumber: null, scheduledStartTime: null, scheduledEndTime: null }]))
    mount()
    await screen.findByText('Ca thi chưa mở')
    expect(screen.queryByRole('link', { name: 'Kiểm tra thiết bị và vào thi' })).not.toBeInTheDocument()
    expect(screen.getByText('Lập trình Java · Chưa phân số ca')).toBeInTheDocument()
    expect(screen.getByText('Bắt đầu: Chưa xếp giờ')).toBeInTheDocument()
  })
  it('keeps attempt metadata through device check and rejects a mismatched or malformed attempt', () => {
    const turn = '66666666-6666-4666-8666-666666666666'
    const path = studentExamPath(slot.examId, slot.attemptId, 'check', turn)
    expect(studentRoomSearch(new URLSearchParams(new URL(path, 'https://example.test').search))).toBe(`?attemptId=${slot.attemptId}&questionTurnId=${turn}`)
    expect(matchesRequestedAttempt(slot.attemptId, slot.attemptId)).toBe(true)
    expect(matchesRequestedAttempt('55555555-5555-4555-8555-555555555555', slot.attemptId)).toBe(false)
    expect(matchesRequestedAttempt('', slot.attemptId)).toBe(false)
    expect(studentRoomSearch(new URLSearchParams('attemptId=bad&questionTurnId=bad'))).toBe('?attemptId=bad')
    expect(matchesRequestedAttempt(null, slot.attemptId)).toBe(true)
  })
  it('blocks room entry when the URL attempt differs from the JWT-owned slot', async () => {
    vi.spyOn(apiStudentExamRepository, 'getMySlot').mockResolvedValue({ ...slot, actualStartTime: null, actualEndTime: null, accessCode: null })
    mount(student, studentExamPath(slot.examId, '55555555-5555-4555-8555-555555555555', 'session', '66666666-6666-4666-8666-666666666666'))
    expect(await screen.findByText(/Ca thi đã thay đổi hoặc không khớp/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Xem lịch thi' })).toHaveAttribute('href', '/student/exams')
    expect(screen.queryByRole('button', { name: 'Bắt đầu trả lời' })).not.toBeInTheDocument()
  })
  it('shows backend-confirmed completion without reopening speech', async () => {
    vi.spyOn(apiStudentExamRepository, 'getMySlot').mockResolvedValue({ ...slot, status: 'COMPLETED', actualStartTime: null, actualEndTime: null, accessCode: null })
    vi.spyOn(interviewApi, 'current').mockResolvedValue({ attemptId: slot.attemptId, status: 'COMPLETED', prompt: null })
    mount(student, studentExamPath(slot.examId, slot.attemptId, 'session'))
    expect((await screen.findAllByText('Phiên thi đã hoàn tất')).length).toBeGreaterThan(0)
    expect(screen.queryByRole('button', { name: 'Bắt đầu trả lời' })).not.toBeInTheDocument()
  })
})
