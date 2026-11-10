import { act, cleanup, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { TurnQuestionCountdown } from './ApiSpeechRoom'

afterEach(() => { cleanup(); vi.useRealTimers() })
it('preserves the server deadline and remaining time on remount', () => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-11-11T00:00:00Z'))
  const props = { turnDeadline: '2026-11-11T00:02:00Z', isProcessing: false }
  const view = render(<TurnQuestionCountdown {...props} />)
  expect(screen.getByText('02:00')).toBeInTheDocument()
  act(() => vi.advanceTimersByTime(30_000))
  expect(screen.getByText('01:30')).toBeInTheDocument()
  view.unmount()
  render(<TurnQuestionCountdown {...props} />)
  expect(screen.getByText('01:30')).toBeInTheDocument()
})
it('does not restart an expired question and gives a new follow-up its own deadline', () => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-11-11T00:03:00Z'))
  const view = render(<TurnQuestionCountdown turnDeadline="2026-11-11T00:02:00Z" isProcessing={false} />)
  expect(screen.getByText('00:00')).toBeInTheDocument()
  view.rerender(<TurnQuestionCountdown key="follow-up" turnDeadline="2026-11-11T00:05:00Z" isProcessing={false} />)
  expect(screen.getByText('02:00')).toBeInTheDocument()
})
