import { render, screen } from '@testing-library/react'
import { Button, Progress } from './primitives'

describe('foundation primitives', () => {
  it('prevents duplicate action while pending', () => {
    render(<Button pending>Save</Button>)
    expect(screen.getByRole('button', { name: 'Đang xử lý…' })).toBeDisabled()
  })

  it('exposes progress with an accessible label', () => {
    render(<Progress label="Tải tài liệu" value={40} />)
    expect(screen.getByRole('progressbar', { name: 'Tải tài liệu' })).toHaveValue(40)
  })
})
