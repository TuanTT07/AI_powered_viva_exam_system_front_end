import { describe, expect, it, vi } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'
import { useVivaSession } from './use-viva-session'
import { mockVivaSessionRepository, resetMockVivaSessions } from './mock-viva-session-repository'
import { apiVivaSessionRepository } from './api-viva-session-repository'
import type { VivaSpeechAdapter } from './viva-speech-adapter'

function speech(overrides: Partial<VivaSpeechAdapter> = {}): VivaSpeechAdapter {
  return {
    speak: async () => undefined,
    startCapture: async (onPartial) => { onPartial('trả lời') },
    stopCapture: async () => 'trả lời',
    ...overrides,
  }
}

describe('useVivaSession', () => {
  it('loads, answers, receives a backend follow-up and records it as a follow-up', async () => {
    resetMockVivaSessions()
    const { result } = renderHook(() => useVivaSession('e1', { repository: mockVivaSessionRepository, speech: speech() }))
    await waitFor(() => expect(result.current.state.phase).toBe('WAITING_FOR_ANSWER'))
    await act(async () => { await result.current.startAnswer() })
    expect(result.current.state.phase).toBe('RECORDING')
    expect(result.current.state.partialAnswer).toBe('trả lời')
    await act(async () => { await result.current.stopAnswer() })
    await waitFor(() => expect(result.current.state.phase).toBe('WAITING_FOR_ANSWER'))
    const last = result.current.state.transcript.at(-1)
    expect(last).toMatchObject({ role: 'ai', isFollowUp: true })
    expect(result.current.state.followUpCount).toBe(1)
  })

  it('does not submit or fabricate a transcript when nothing was heard', async () => {
    resetMockVivaSessions()
    const submitSpy = vi.spyOn(mockVivaSessionRepository, 'submitAnswer')
    const { result } = renderHook(() => useVivaSession('e2', { repository: mockVivaSessionRepository, speech: speech({ stopCapture: async () => '  ' }) }))
    await waitFor(() => expect(result.current.state.phase).toBe('WAITING_FOR_ANSWER'))
    await act(async () => { await result.current.startAnswer() })
    await act(async () => { await result.current.stopAnswer() })
    expect(submitSpy).not.toHaveBeenCalled()
    expect(result.current.state.phase).toBe('WAITING_FOR_ANSWER')
    expect(result.current.notice).toBeTruthy()
    submitSpy.mockRestore()
  })

  it('moves to MIC_ERROR when capture fails and recovers on retry', async () => {
    resetMockVivaSessions()
    const { result } = renderHook(() => useVivaSession('e3', { repository: mockVivaSessionRepository, speech: speech({ startCapture: async () => { throw new Error('denied') } }) }))
    await waitFor(() => expect(result.current.state.phase).toBe('WAITING_FOR_ANSWER'))
    await act(async () => { await result.current.startAnswer() })
    expect(result.current.state.phase).toBe('MIC_ERROR')
    act(() => result.current.retryMic())
    expect(result.current.state.phase).toBe('WAITING_FOR_ANSWER')
  })

  it('shows an explicit failure in API mode instead of falling back to mock data', async () => {
    const { result } = renderHook(() => useVivaSession('e4', { repository: apiVivaSessionRepository, speech: speech() }))
    await waitFor(() => expect(result.current.state.phase).toBe('LOAD_FAILED'))
    expect(result.current.state.error).toContain('chưa được backend hỗ trợ')
    expect(result.current.state.transcript).toEqual([])
  })

  it('resyncs after going offline and back online', async () => {
    resetMockVivaSessions()
    const { result } = renderHook(() => useVivaSession('e5', { repository: mockVivaSessionRepository, speech: speech() }))
    await waitFor(() => expect(result.current.state.phase).toBe('WAITING_FOR_ANSWER'))
    act(() => { window.dispatchEvent(new Event('offline')) })
    expect(result.current.state.phase).toBe('SESSION_DISCONNECTED')
    await act(async () => { window.dispatchEvent(new Event('online')) })
    await waitFor(() => expect(result.current.state.phase).not.toBe('SESSION_DISCONNECTED'))
  })
})
