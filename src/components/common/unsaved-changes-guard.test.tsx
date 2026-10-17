import { useState } from 'react'
import { createMemoryRouter, Link, RouterProvider } from 'react-router-dom'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it } from 'vitest'
import { UnsavedChangesGuard } from './unsaved-changes-guard'
function Editor() { const [text, setText] = useState(''); return <><UnsavedChangesGuard when={Boolean(text)} /><input aria-label="Bản nháp" value={text} onChange={e => setText(e.target.value)} /><Link to="/next">Chuyển trang</Link></> }
it('preserves a dirty draft when cancelling SPA navigation and discards only after confirmation', async () => {
  render(<RouterProvider router={createMemoryRouter([{ path: '/', element: <Editor /> }, { path: '/next', element: <h1>Trang tiếp theo</h1> }])} />)
  const user = userEvent.setup()
  await user.type(screen.getByLabelText('Bản nháp'), 'Chưa lưu')
  await user.click(screen.getByRole('link', { name: 'Chuyển trang' }))
  expect(await screen.findByRole('dialog')).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Ở lại chỉnh sửa' }))
  expect(screen.getByLabelText('Bản nháp')).toHaveValue('Chưa lưu')
  await user.click(screen.getByRole('link', { name: 'Chuyển trang' }))
  await user.click(screen.getByRole('button', { name: 'Bỏ thay đổi và rời trang' }))
  expect(await screen.findByRole('heading', { name: 'Trang tiếp theo' })).toBeInTheDocument()
})
