import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { ApiQuestionEditorPage } from './question-editor-page'

describe('API question editor states', () => {
  it('blocks mock course IDs before any API-backed form is rendered', () => {
    const client = new QueryClient()
    render(<QueryClientProvider client={client}><MemoryRouter><ApiQuestionEditorPage subjectId="oop-java" /></MemoryRouter></QueryClientProvider>)
    expect(screen.getByRole('heading', { name: 'Không tìm thấy dữ liệu yêu cầu' })).toBeInTheDocument()
    expect(screen.getByText(/chọn một học phần hợp lệ/i)).toBeInTheDocument()
  })
})
