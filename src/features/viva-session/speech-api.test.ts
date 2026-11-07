import { afterEach, describe, expect, it, vi } from 'vitest'
import { apiClient } from '../../services/api/client'
import { speechApi } from './speech-api'

const attempt = '33333333-3333-4333-8333-333333333333'
const turn = '55555555-5555-4555-8555-555555555555'
const id = '77777777-7777-4777-8777-777777777777'
const metadata = { audioId: id, contentType: 'audio/mpeg', expiresAt: new Date(Date.now() + 600_000).toISOString(), audioPath: `/api/interview/speech/audio/${id}` }
const envelope = (data: unknown) => ({ success: true, status: 200, data })
afterEach(() => vi.restoreAllMocks())
describe('private question audio API', () => {
  it('creates audio then downloads a blob through the authenticated client', async () => {
    const blob = new Blob(['mp3'], { type: 'audio/mpeg' })
    const request = vi.spyOn(apiClient, 'request').mockResolvedValueOnce(envelope(metadata)).mockResolvedValueOnce(blob)
    const signal = new AbortController().signal
    expect(await speechApi.audio(attempt, turn, signal)).toBe(blob)
    expect(request).toHaveBeenNthCalledWith(1, `/api/interview/attempts/${attempt}/speech/questions/${turn}/audio`, { method: 'POST', signal, timeoutMs: 65_000 })
    expect(request).toHaveBeenNthCalledWith(2, metadata.audioPath, { signal, responseType: 'blob', headers: { Accept: 'audio/mpeg' } })
  })
  it('rejects untrusted paths before downloading with credentials', async () => {
    const request = vi.spyOn(apiClient, 'request').mockResolvedValue(envelope({ ...metadata, audioPath: 'https://example.com/audio' }))
    await expect(speechApi.audio(attempt, turn)).rejects.toThrow('Dữ liệu audio')
    expect(request).toHaveBeenCalledOnce()
  })
  it('rejects empty or non-MP3 responses', async () => {
    vi.spyOn(apiClient, 'request').mockResolvedValueOnce(envelope(metadata)).mockResolvedValueOnce(new Blob(['{}'], { type: 'application/json' }))
    await expect(speechApi.audio(attempt, turn)).rejects.toThrow('File audio')
  })
  it('propagates provider failures without downloading', async () => {
    const request = vi.spyOn(apiClient, 'request').mockRejectedValue(new Error('TTS đang bận'))
    await expect(speechApi.audio(attempt, turn)).rejects.toThrow('TTS đang bận')
    expect(request).toHaveBeenCalledOnce()
  })
})
