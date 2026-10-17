import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GlobalRubricEditorPage, GlobalRubricListPage } from './rubric-pages'

const mocks = vi.hoisted(() => ({ subjects: vi.fn(), list: vi.fn(), save: vi.fn(), remove: vi.fn(), assigned: vi.fn() }))
vi.mock('../../services/api/runtime-config', () => ({ runtimeConfig: { dataSource: 'api' } }))
vi.mock('../../app/providers/use-session', () => ({ useSession: () => ({ session: { user: { id: 'lecturer-1', roles: ['lecturer'] } } }) }))
vi.mock('../subjects/subject-hooks', () => ({ useLecturerSubjects: () => mocks.subjects() }))
vi.mock('../subjects/subject-repository', () => ({ subjectRepository: { list: mocks.assigned } }))
vi.mock('./rubric-repository', () => ({ rubricRepository: { list: mocks.list, save: mocks.save, delete: mocks.remove } }))
const courseId = '40000000-0000-4000-8000-000000000001'
const rubric = { id: '30000000-0000-4000-8000-000000000001', subjectId: courseId, name: 'Rubric Java', description: '', criteria: [{ id: 'c1', name: 'Kiến thức', maximumScore: '10', description: '' }] }
function mount(path = '/lecturer/rubrics/new') {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  return render(<QueryClientProvider client={client}><MemoryRouter initialEntries={[path]}><Routes><Route path="/lecturer/rubrics" element={<GlobalRubricListPage />} /><Route path="/lecturer/rubrics/new" element={<GlobalRubricEditorPage />} /><Route path="/lecturer/rubrics/:rubricId/edit" element={<GlobalRubricEditorPage />} /></Routes></MemoryRouter></QueryClientProvider>)
}
beforeEach(() => {
  vi.resetAllMocks()
  mocks.subjects.mockReturnValue({ data: [{ id: courseId, code: 'INT2204', name: 'Java' }], isSuccess: true, isPending: false, isError: false })
  mocks.assigned.mockResolvedValue([{ id: courseId }])
  mocks.list.mockResolvedValue([rubric])
})
describe('API rubric workflow', () => {
  it('requires a course, submits its ID and preserves input after save failure', async () => {
    mocks.save.mockRejectedValue(new Error('Không thể lưu thử nghiệm'))
    const user = userEvent.setup(); mount()
    expect(screen.getByRole('button', { name: 'Lưu Rubric' })).toBeDisabled()
    await user.selectOptions(screen.getByRole('combobox', { name: 'Môn học (bắt buộc)' }), courseId)
    await user.type(screen.getByRole('textbox', { name: 'Tên Rubric' }), 'Rubric kiểm thử')
    await user.type(screen.getByRole('textbox', { name: 'Tên tiêu chí' }), 'Kiến thức')
    await user.type(screen.getByRole('spinbutton', { name: 'Điểm tối đa' }), '10')
    await user.click(screen.getByRole('button', { name: 'Lưu Rubric' }))
    expect(await screen.findByText('Không thể lưu thử nghiệm')).toBeInTheDocument()
    expect(mocks.save).toHaveBeenCalledWith(expect.objectContaining({ subjectId: courseId, name: 'Rubric kiểm thử' }))
    expect(screen.getByRole('textbox', { name: 'Tên Rubric' })).toHaveValue('Rubric kiểm thử')
  })
  it('locks original course while editing and sends it on update', async () => {
    mocks.save.mockRejectedValue(new Error('Update failed'))
    const user = userEvent.setup(); mount(`/lecturer/rubrics/${rubric.id}/edit`)
    await screen.findByDisplayValue('Rubric Java')
    expect(screen.getByRole('combobox')).toHaveValue(courseId)
    expect(screen.getByRole('combobox')).toBeDisabled()
    await user.click(screen.getByRole('button', { name: 'Lưu Rubric' }))
    await waitFor(() => expect(mocks.save).toHaveBeenCalledWith(expect.objectContaining({ id: rubric.id, subjectId: courseId })))
  })
  it('aggregates assigned courses and preserves course when deleting from global list', async () => {
    mocks.remove.mockResolvedValue(undefined)
    const secondCourseId = '40000000-0000-4000-8000-000000000002'
    mocks.assigned.mockResolvedValue([{ id: courseId }, { id: secondCourseId }])
    mocks.list.mockImplementation(async id => id === courseId ? [rubric] : [])
    const user = userEvent.setup(); mount('/lecturer/rubrics')
    await screen.findByRole('heading', { name: 'Rubric Java' })
    expect(mocks.assigned).toHaveBeenCalledWith('lecturer-1')
    expect(mocks.list).toHaveBeenCalledWith(courseId)
    expect(mocks.list).toHaveBeenCalledWith(secondCourseId)
    expect(mocks.list).not.toHaveBeenCalledWith('')
    await user.click(screen.getByRole('button', { name: 'Xóa' }))
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Xóa Rubric' }))
    await waitFor(() => expect(mocks.remove).toHaveBeenCalledWith(rubric.id, courseId))
  })
  it.each(['loading', 'empty', 'error'])('prevents save when course selection is %s', state => {
    mocks.subjects.mockReturnValue({ data: state === 'loading' ? undefined : [], isSuccess: state === 'empty', isPending: state === 'loading', isError: state === 'error', refetch: vi.fn() })
    mount()
    expect(screen.getByRole('button', { name: 'Lưu Rubric' })).toBeDisabled()
    if (state === 'loading') expect(screen.getByRole('status')).toHaveTextContent('Đang tải môn học')
    if (state === 'empty') expect(screen.getByText(/Chưa được phân công môn học/)).toBeInTheDocument()
    if (state === 'error') expect(screen.getByRole('button', { name: 'Thử lại' })).toBeInTheDocument()
  })
})
