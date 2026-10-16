import { act, cleanup, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useDeviceCheck } from './use-device-check'

afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals() })
describe('device permission and lifecycle', () => {
  it('shows permission failure and allows a retry', async () => {
    const getUserMedia = vi.fn().mockRejectedValue(new Error('NotAllowedError'))
    vi.stubGlobal('navigator', { mediaDevices: { getUserMedia } })
    const { result } = renderHook(useDeviceCheck)
    await act(() => result.current.startMic())
    expect(result.current.mic).toBe('error')
    expect(result.current.error).toContain('Kiểm tra quyền')
    await act(() => result.current.startMic())
    expect(getUserMedia).toHaveBeenCalledTimes(2)
  })
  it('releases a permission request that resolves after leaving the page', async () => {
    let resolve!: (stream: MediaStream) => void
    const request = new Promise<MediaStream>(done => { resolve = done })
    vi.stubGlobal('navigator', { mediaDevices: { getUserMedia: () => request } })
    const stop = vi.fn()
    const { result, unmount } = renderHook(useDeviceCheck)
    let pending!: Promise<void>
    act(() => { pending = result.current.startMic() })
    unmount()
    await act(async () => { resolve({ getTracks: () => [{ stop }] } as unknown as MediaStream); await pending })
    expect(stop).toHaveBeenCalledOnce()
  })
  it('stops live microphone tracks and audio context on unmount', async () => {
    const stop = vi.fn(), close = vi.fn().mockResolvedValue(undefined)
    const track = { stop, onended: null }
    vi.stubGlobal('navigator', { mediaDevices: { getUserMedia: vi.fn().mockResolvedValue({ getTracks: () => [track], getAudioTracks: () => [track] }) } })
    vi.stubGlobal('requestAnimationFrame', vi.fn().mockReturnValue(12))
    const cancel = vi.fn(); vi.stubGlobal('cancelAnimationFrame', cancel)
    vi.stubGlobal('AudioContext', class {
      state = 'running'; close = close; resume = vi.fn().mockResolvedValue(undefined)
      createAnalyser() { return { fftSize: 0, frequencyBinCount: 1, getByteFrequencyData: (data: Uint8Array) => data.fill(30) } }
      createMediaStreamSource() { return { connect: vi.fn() } }
    })
    const { result, unmount } = renderHook(useDeviceCheck)
    await act(() => result.current.startMic())
    expect(result.current.mic).toBe('passed')
    unmount()
    expect(stop).toHaveBeenCalledOnce()
    expect(close).toHaveBeenCalledOnce()
    expect(cancel).toHaveBeenCalledWith(12)
  })
  it('requires the student to confirm hearing the test sound', async () => {
    let ended: (() => void) | undefined
    vi.stubGlobal('AudioContext', class {
      state = 'running'; currentTime = 0; destination = {}; resume = vi.fn().mockResolvedValue(undefined); close = vi.fn().mockResolvedValue(undefined)
      createOscillator() { return { frequency: { value: 0 }, connect: vi.fn(), start: vi.fn(), stop: vi.fn(), set onended(fn: () => void) { ended = fn } } }
      createGain() { return { gain: { value: 0 }, connect: vi.fn() } }
    })
    const { result } = renderHook(useDeviceCheck)
    await act(() => result.current.testSpeaker())
    expect(result.current.speaker).toBe('playing')
    act(() => ended?.())
    expect(result.current.speaker).toBe('confirm')
    act(() => result.current.confirmSpeaker())
    expect(result.current.speaker).toBe('passed')
  })
})
