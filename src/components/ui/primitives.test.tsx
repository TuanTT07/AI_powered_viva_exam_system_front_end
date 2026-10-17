import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it, vi } from 'vitest'
import { Button, Input, Progress } from './primitives'
it('pending always prevents duplicate clicks even when disabled=false is passed', async () => {
  const click = vi.fn()
  const view = render(<Button pending disabled={false} onClick={click}>Lưu</Button>)
  expect(screen.getByRole('button')).toBeDisabled()
  expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true')
  await userEvent.click(screen.getByRole('button')); expect(click).not.toHaveBeenCalled()
  view.rerender(<Button pending={false} disabled={false} onClick={click}>Lưu</Button>)
  await userEvent.click(screen.getByRole('button')); expect(click).toHaveBeenCalledTimes(1)
})
it('preserves base input styling and caller properties', () => {
  render(<Input aria-label="Mật khẩu" className="pr-10" type="password" />)
  const input = screen.getByLabelText('Mật khẩu')
  expect(input).toHaveClass('input', 'pr-10'); expect(input).toHaveAttribute('type', 'password')
})

it('exposes progress with an accessible label', () => {
  render(<Progress label="Tải tài liệu" value={40} />)
  expect(screen.getByRole('progressbar', { name: 'Tải tài liệu' })).toHaveValue(40)
})
