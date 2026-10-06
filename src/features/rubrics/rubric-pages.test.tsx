import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import userEvent from '@testing-library/user-event'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { GlobalRubricEditorPage, GlobalRubricListPage, RubricListPage } from './rubric-pages'

describe('Rubric delete UI', () => {
  it('opens confirmation, supports cancel, and removes the rubric after confirmation', async () => {
    const user = userEvent.setup(); const client = new QueryClient()
    render(<QueryClientProvider client={client}><MemoryRouter initialEntries={['/lecturer/subjects/java/rubrics']}><Routes><Route path="/lecturer/subjects/:subjectId/rubrics" element={<RubricListPage />} /></Routes></MemoryRouter></QueryClientProvider>)
    expect(await screen.findByRole('heading', { name: 'Rubric Java Core' })).toBeInTheDocument()
    await user.click(screen.getAllByRole('button', { name: 'Xóa Rubric' }).at(-1)!)
    expect(screen.getByRole('heading', { name: 'Xóa Rubric?' })).toBeInTheDocument()
    expect(screen.getAllByText(/Rubric Java Core/).length).toBeGreaterThanOrEqual(2)
    await user.click(screen.getByRole('button', { name: 'Hủy' }))
    expect(screen.getByRole('heading', { name: 'Rubric Java Core' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Xóa Rubric' }))
    await user.click(screen.getAllByRole('button', { name: 'Xóa Rubric' }).at(-1)!)
    await waitFor(() => expect(screen.queryByRole('heading', { name: 'Rubric Java Core' })).not.toBeInTheDocument())
    expect(screen.getByText(/Đã xóa Rubric/)).toBeInTheDocument()
  })
})

describe('Global Rubric navigation', () => {
  it('renders the global list and links to create', async () => {
    const client = new QueryClient(); render(<QueryClientProvider client={client}><MemoryRouter initialEntries={['/lecturer/rubrics']}><Routes><Route path="/lecturer/rubrics" element={<GlobalRubricListPage />} /></Routes></MemoryRouter></QueryClientProvider>)
    expect(await screen.findByRole('heading', { name: 'Quản lý Rubric' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Tạo Rubric' })).toHaveAttribute('href', '/lecturer/rubrics/new')
  })

  it('validates global create and preserves the global route', async () => {
    const user = userEvent.setup(); const client = new QueryClient(); render(<QueryClientProvider client={client}><MemoryRouter initialEntries={['/lecturer/rubrics/new']}><Routes><Route path="/lecturer/rubrics/new" element={<GlobalRubricEditorPage />} /></Routes></MemoryRouter></QueryClientProvider>)
    expect(await screen.findByRole('heading', { name: 'Tạo Rubric' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Lưu Rubric' }))
    expect(await screen.findByText('Nhập tên rubric.')).toBeInTheDocument()
    expect(screen.getByText('Nhập tên tiêu chí.')).toBeInTheDocument()
  })
})
