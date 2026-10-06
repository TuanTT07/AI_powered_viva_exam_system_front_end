import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { questionKeys, useImportQuestions } from './question-hooks'

function ImportHarness() {
  const mutation = useImportQuestions()
  return <button onClick={() => mutation.mutate({ subjectId: 'java', drafts: [{ content: 'Câu hỏi invalidate', topic: 'Collections', bloom: 'HIỂU' }] })}>Import</button>
}

describe('question import query mutation', () => {
  it('invalidates only the current subject Question Bank query', async () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
    const invalidate = vi.spyOn(client, 'invalidateQueries')
    render(<QueryClientProvider client={client}><ImportHarness /></QueryClientProvider>)
    await userEvent.click(screen.getByRole('button', { name: 'Import' }))
    await waitFor(() => expect(invalidate).toHaveBeenCalledWith({ queryKey: questionKeys.list('java') }))
    expect(invalidate).not.toHaveBeenCalledWith({ queryKey: questionKeys.list('other-subject') })
  })
})
