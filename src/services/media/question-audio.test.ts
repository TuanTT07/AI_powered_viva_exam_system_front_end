import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { playQuestionAudio } from './question-audio'

let audio: { play: ReturnType<typeof vi.fn>; pause: ReturnType<typeof vi.fn>; load: ReturnType<typeof vi.fn>; removeAttribute: ReturnType<typeof vi.fn>; onended: null | (() => void); onerror: null | (() => void) }
const create = vi.fn(() => 'blob:question')
const revoke = vi.fn()
beforeEach(() => {
  vi.useFakeTimers()
  audio = { play: vi.fn().mockResolvedValue(undefined), pause: vi.fn(), load: vi.fn(), removeAttribute: vi.fn(), onended: null, onerror: null }
  vi.stubGlobal('Audio', vi.fn(function () { return audio }))
  vi.stubGlobal('URL', { createObjectURL: create, revokeObjectURL: revoke })
})
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); vi.clearAllMocks() })
describe('question audio lifecycle', () => {
  it('releases the audio URL after completion', async () => {
    const pending = playQuestionAudio(new Blob(['mp3']), new AbortController().signal)
    expect(audio.play).toHaveBeenCalledOnce()
    audio.onended?.()
    await pending
    expect(revoke).toHaveBeenCalledWith('blob:question')
    expect(audio.removeAttribute).toHaveBeenCalledWith('src')
  })
  it('stops and releases audio on question cancellation', async () => {
    const abort = new AbortController()
    const pending = playQuestionAudio(new Blob(['mp3']), abort.signal)
    abort.abort()
    await pending
    expect(audio.pause).toHaveBeenCalled()
    expect(revoke).toHaveBeenCalledOnce()
    expect(audio.onended).toBeNull()
  })
  it('does not create audio when already cancelled', async () => {
    const abort = new AbortController(); abort.abort()
    await playQuestionAudio(new Blob(), abort.signal)
    expect(create).not.toHaveBeenCalled()
  })
  it('reports playback rejection and still releases resources', async () => {
    audio.play.mockRejectedValue(new Error('NotAllowedError'))
    await expect(playQuestionAudio(new Blob(['mp3']), new AbortController().signal)).rejects.toThrow('nhấn nghe lại')
    expect(revoke).toHaveBeenCalledOnce()
  })
  it('releases resources after decoding errors', async () => {
    const pending = playQuestionAudio(new Blob(['bad']), new AbortController().signal)
    const result = expect(pending).rejects.toThrow('Không phát được audio')
    audio.onerror?.()
    await result
    expect(revoke).toHaveBeenCalledOnce()
  })
})
