import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider, useLocation } from 'react-router-dom'
import { SessionContext } from '../providers/session-context'
import { WorkspaceLayout } from './layouts'
import { subjectRepository } from '../../features/subjects/subject-repository'
import { examRepository } from '../../features/exams/exam-repository'
function Destination() { const location = useLocation(); return <p>Destination: {location.pathname}{location.search}</p> }
function mount(entry = '/lecturer/exams') {
  const router = createMemoryRouter([{ path: '/lecturer', element: <WorkspaceLayout role="lecturer" title="Giảng viên" />, children: [
    { path: 'exams/:examId/*', element: <Destination /> }, { path: 'subjects/:subjectId/*', element: <Destination /> }, { path: '*', element: <Destination /> },
  ] }], { initialEntries: [entry] })
  render(<SessionContext.Provider value={{ session: { status: 'authenticated', user: { id: 'lecturer', displayName: 'Lecturer', roles: ['lecturer'] } }, signIn: vi.fn(), signOut: vi.fn() }}><RouterProvider router={router} /></SessionContext.Provider>)
  return router
}
afterEach(() => { cleanup(); vi.restoreAllMocks() })
describe('resource navigation', () => {
  it('opens and closes the mobile navigation drawer from the menu trigger', async () => {
    mount()
    const user = userEvent.setup()
    const menu = screen.getByRole('button', { name: 'Mở menu điều hướng' })

    await user.click(menu)
    expect(screen.getByRole('dialog', { name: 'Thanh điều hướng' })).toBeInTheDocument()
    expect(menu).toHaveAttribute('aria-expanded', 'true')

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog', { name: 'Thanh điều hướng' })).not.toBeInTheDocument()
    expect(menu).toHaveFocus()
  })
  it('opens resource lists without selection modals or hidden query requests', async () => {
    const subjects = vi.spyOn(subjectRepository, 'list'), exams = vi.spyOn(examRepository, 'list')
    const router = mount(), user = userEvent.setup()
    const nav = within(screen.getByRole('navigation', { name: 'Điều hướng chính' }))
    expect(nav.getAllByRole('link')).toHaveLength(4)
    await user.click(nav.getByRole('link', { name: 'Môn học & Học liệu' }))
    expect(router.state.location.pathname).toBe('/lecturer/subjects')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(subjects).not.toHaveBeenCalled(); expect(exams).not.toHaveBeenCalled()
  })
  it('shows exam tasks inside the exam and carries the summary destination', async () => {
    const router = mount('/lecturer/exams/e1/monitor'), user = userEvent.setup()
    const tabs = within(screen.getByRole('navigation', { name: 'Chức năng kỳ thi' }))
    expect(tabs.getByRole('link', { name: 'Giám sát' })).toHaveAttribute('aria-current', 'page')
    await user.click(tabs.getByRole('link', { name: 'Tổng hợp & Chốt điểm' }))
    expect(router.state.location.pathname).toBe('/lecturer/exams/e1/attempts')
    expect(router.state.location.search).toBe('?view=summary')
    expect(tabs.getByRole('link', { name: 'Tổng hợp & Chốt điểm' })).toHaveAttribute('aria-current', 'page')
    expect(tabs.getByRole('link', { name: 'Chấm điểm' })).not.toHaveAttribute('aria-current', 'page')
  })
  it('places RAG and question bank in the subject, with shareable URLs', async () => {
    const router = mount('/lecturer/subjects/s1'), user = userEvent.setup()
    const tabs = within(screen.getByRole('navigation', { name: 'Chức năng môn học' }))
    expect(screen.queryByRole('navigation', { name: 'Chức năng kỳ thi' })).not.toBeInTheDocument()
    await user.click(tabs.getByRole('link', { name: 'Học liệu & RAG' }))
    expect(router.state.location.pathname).toBe('/lecturer/subjects/s1/materials')
    await user.click(tabs.getByRole('link', { name: 'Ngân hàng câu hỏi' }))
    expect(router.state.location.pathname).toBe('/lecturer/subjects/s1/questions')
  })
})
