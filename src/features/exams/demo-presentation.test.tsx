import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SessionContext } from '../../app/providers/session-context'
import { ExamDetailPage } from './exam-detail-page'
import { ExamStudentRosterPage } from './exam-student-roster-page'
function mount(page: 'overview' | 'students', examId: string) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const router = createMemoryRouter([{ path: '/lecturer/exams/:examId', element: page === 'overview' ? <ExamDetailPage /> : <ExamStudentRosterPage /> }], { initialEntries: [`/lecturer/exams/${examId}`] })
  return render(<QueryClientProvider client={client}><SessionContext.Provider value={{ session: { status: 'authenticated', user: { id: 'demo-lecturer', displayName: 'Demo', roles: ['lecturer'] } }, signIn: vi.fn(), signOut: vi.fn() }}><RouterProvider router={router} /></SessionContext.Provider></QueryClientProvider>)
}
afterEach(cleanup)
describe('populated demo and restrained status presentation', () => {
  it('renders the prepared draft with no missing-setup warning banner', async () => {
    const { container } = mount('overview', 'EXAM-2024-COL-02')
    expect(await screen.findByRole('heading', { name: 'Thiết lập đã hoàn tất' })).toBeInTheDocument()
    expect(screen.queryByText('Thời gian bắt đầu đã ở trong quá khứ.')).not.toBeInTheDocument()
    expect(container.querySelector('.alert.warning')).toBeNull()
  })
  it('keeps active-exam roster read-only while replacing the yellow panel', async () => {
    const { container } = mount('students', 'EXAM-2024-OOP-01')
    expect(await screen.findByText('Chế độ chỉ đọc.')).toBeInTheDocument()
    expect(await screen.findByText('45 sinh viên')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Thêm sinh viên' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Import CSV' })).not.toBeInTheDocument()
    expect(container.querySelector('.alert.warning')).toBeNull()
  })
})
