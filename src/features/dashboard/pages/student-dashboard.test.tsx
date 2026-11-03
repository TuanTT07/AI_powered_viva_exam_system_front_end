import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { SessionContext } from '../../../app/providers/session-context'
import { runtimeConfig } from '../../../services/api/runtime-config'
import { ApiError } from '../../../services/api/client'
import type { AuthenticatedUser } from '../../../types/auth'
import { apiStudentExamRepository, type StudentExamPage, type StudentExamSummary } from '../../exams/api-student-exam-repository'
import { StudentExamListPage } from '../../exams/student-exam-list-page'
import { StudentDashboard } from './StudentDashboard'

const originalSource = runtimeConfig.dataSource
const student: AuthenticatedUser = { id: 'student-1', displayName: 'Sinh viên A', roles: ['student'] }
const ready: StudentExamSummary = { examId: 'exam-ready', attemptId: 'attempt-ready', examTitle: 'Thi Java', courseCode: 'JAVA', courseName: 'Java', slotNumber: 1, status: 'READY', scheduledStartTime: null, scheduledEndTime: null }
const active: StudentExamSummary = { ...ready, examId: 'exam-active', attemptId: 'attempt-active', examTitle: 'Thi SQL', status: 'IN_PROGRESS' }
const page = (content: StudentExamSummary[], totalElements = content.length): StudentExamPage => ({content, totalElements, page:0, size:20, totalPages: Math.ceil(totalElements / 20)})
function mount({ list = false, user = student } = {}) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } })
  return render(<QueryClientProvider client={client}><SessionContext.Provider value={{ session: { status: 'authenticated', user }, signIn: vi.fn(), signOut: vi.fn() }}><MemoryRouter initialEntries={[list ? '/student/exams' : '/student?status=COMPLETED&page=4']}>{list ? <StudentExamListPage /> : <StudentDashboard />}</MemoryRouter></SessionContext.Provider></QueryClientProvider>)
}
beforeEach(() => { runtimeConfig.dataSource = 'api' })
afterEach(() => { cleanup(); vi.restoreAllMocks(); runtimeConfig.dataSource = originalSource })

describe('student overview and exam list separation', () => {
  it('prioritizes the active attempt without rendering the full schedule or inheriting list filters', async () => {
    const list = vi.spyOn(apiStudentExamRepository, 'list').mockResolvedValue(page([ready, active]))
    mount()
    expect(await screen.findByRole('heading', { name: 'Thi SQL' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Thi Java' })).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Tổng quan' })).toBeInTheDocument()
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
    expect(list).toHaveBeenCalledWith({page:0, size:20}, expect.any(AbortSignal))
    expect(screen.getByRole('link', { name: 'Tiếp tục thi' })).toHaveAttribute('href', '/student/exams/exam-active/check?attemptId=attempt-active')
    expect(screen.getByRole('link', { name: 'Xem tất cả (2)' })).toHaveAttribute('href','/student/exams')
  })
  it('shows ready before scheduled, and makes the recent-record scope explicit if paginated', async () => {
    vi.spyOn(apiStudentExamRepository, 'list').mockResolvedValue(page([{...active, status:'SCHEDULED'}, ready], 45))
    mount()
    expect(await screen.findByRole('link',{name:'Chuẩn bị vào thi'})).toHaveAttribute('href','/student/exams/exam-ready/check?attemptId=attempt-ready')
    expect(screen.getByText('Ưu tiên trong 2 ca gần đây.')).toBeInTheDocument()
  })
  it('does not reopen completed attempts', async () => {
    vi.spyOn(apiStudentExamRepository, 'list').mockResolvedValue(page([{...ready,status:'COMPLETED'}]))
    mount()
    expect(await screen.findByRole('heading',{name:'Chưa có ca cần tham gia trong lịch gần đây'})).toBeInTheDocument()
    expect(screen.queryByRole('link',{name:'Chuẩn bị vào thi'})).not.toBeInTheDocument()
    expect(screen.getByRole('link',{name:/Kết quả & biên bản/})).toHaveAttribute('href','/student/results')
  })
  it('shows loading, an API error and retry without substituting demo data', async () => {
    vi.spyOn(apiStudentExamRepository, 'list').mockRejectedValueOnce(new Error('Lỗi tải tổng quan')).mockResolvedValueOnce(page([]))
    const {container} = mount()
    expect(container.querySelector('[aria-busy="true"]')).toBeInTheDocument()
    expect(await screen.findByText('Lỗi tải tổng quan')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button',{name:'Thử lại'}))
    expect(await screen.findByRole('heading',{name:'Bạn chưa có lịch thi'})).toBeInTheDocument()
  })
  it('preserves backend permission denial', async () => {
    vi.spyOn(apiStudentExamRepository, 'list').mockRejectedValue(new ApiError('Forbidden',{status:403}))
    mount()
    expect(await screen.findByRole('heading',{name:'Không có quyền truy cập'})).toBeInTheDocument()
  })
  it('keeps full filtering on the list without overview decorations', async () => {
    vi.spyOn(apiStudentExamRepository, 'list').mockResolvedValue(page([ready,active]))
    mount({list:true})
    expect(await screen.findByRole('heading',{name:'Thi Java'})).toBeInTheDocument()
    expect(screen.getByRole('heading',{name:'Thi SQL'})).toBeInTheDocument()
    expect(screen.getByRole('combobox',{name:'Trạng thái ca thi'})).toBeInTheDocument()
    expect(screen.queryByRole('heading',{name:'Ca thi cần chú ý'})).not.toBeInTheDocument()
    expect(screen.queryByText('Thiết bị ngoại vi')).not.toBeInTheDocument()
  })
})
