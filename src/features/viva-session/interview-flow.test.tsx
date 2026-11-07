import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { SessionContext } from '../../app/providers/session-context'
import { speechApi } from './speech-api'
import { apiClient, ApiError } from '../../services/api/client'
import { runtimeConfig } from '../../services/api/runtime-config'
import type { SpeechEvent } from '../../services/realtime/speech-socket'
import type { InterviewState } from './interview-api'
import { playQuestionAudio } from '../../services/media/question-audio'
import { VivaInterviewRoom } from './pages/VivaInterviewRoom'

const media = vi.hoisted(() => ({
  command: vi.fn(), audio: vi.fn(), close: vi.fn(), captureStart: vi.fn(), cancel: vi.fn(), finish: vi.fn(),
  emit: undefined as undefined | ((event: SpeechEvent) => void),
  disconnected: undefined as undefined | (() => void),
  chunk: undefined as undefined | ((chunk: ArrayBuffer) => void),
}))
vi.mock('../../services/realtime/speech-socket', () => ({ connectSpeech: vi.fn(async (_ticket, emit, disconnected) => {
  media.emit = emit; media.disconnected = disconnected
  return { command: media.command, audio: media.audio, close: media.close }
}) }))
vi.mock('../../services/media/pcm-capture', () => ({ preparePcmCapture: vi.fn(async chunk => {
  media.chunk = chunk
  return { start: media.captureStart, cancel: media.cancel, finish: media.finish }
}) }))
vi.mock('../../services/media/question-audio', () => ({ playQuestionAudio: vi.fn().mockResolvedValue(undefined) }))

const attemptId = '33333333-3333-4333-8333-333333333333'
const examId = '22222222-2222-4222-8222-222222222222'
const turnId = '55555555-5555-4555-8555-555555555555'
const answerId = '77777777-7777-4777-8777-777777777777'
const prompt = { questionAttemptId: '44444444-4444-4444-8444-444444444444', questionTurnId: turnId, text: 'Giải thích tính đóng gói trong Java.', deadlineAt: new Date(Date.now() + 60_000).toISOString() }
const envelope = (data: unknown) => ({ success: true, status: 200, message: 'OK', data })
let server: InterviewState
let deny: boolean
const request = vi.fn<typeof apiClient.request>()
const source = runtimeConfig.dataSource
const slot = { attemptId, examId, examTitle: 'Vấn đáp Java', courseCode: 'PRJ301', courseName: 'Java', slotNumber: 1, scheduledStartTime: null, scheduledEndTime: null, actualStartTime: null, actualEndTime: null, status: 'READY', accessCode: null }
function mount() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } })
  const result = render(<QueryClientProvider client={client}><SessionContext.Provider value={{ session: { status: 'authenticated', user: { id: '11111111-1111-4111-8111-111111111111', displayName: 'Sinh viên', roles: ['student'] } }, signIn: vi.fn(), signOut: vi.fn() }}>
    <MemoryRouter initialEntries={[`/student/exams/${examId}/session?attemptId=${attemptId}&questionTurnId=99999999-9999-4999-8999-999999999999`]}><Routes><Route path="/student/exams/:examId/session" element={<VivaInterviewRoom />} /></Routes></MemoryRouter>
  </SessionContext.Provider></QueryClientProvider>)
  return { ...result, sync: () => act(async () => { await client.invalidateQueries({ queryKey: ['student-interview'] }) }) }
}
beforeEach(() => {
  runtimeConfig.dataSource = 'api'; sessionStorage.clear(); vi.clearAllMocks(); deny = false
  server = { attemptId, status: 'READY', prompt: null }
  request.mockReset()
  vi.spyOn(apiClient, 'request').mockImplementation(request)
  request.mockImplementation(async (path, options) => {
    if (path.endsWith('/my-slot')) return slot as never
    if (deny) throw new ApiError('Không có quyền', { status: 403 })
    if (path.endsWith('/current')) return envelope(server) as never
    if (path.endsWith('/start')) { expect(options?.method).toBe('POST'); server = { attemptId, status: 'AWAITING_ANSWER', prompt }; return envelope(server) as never }
    if (path.endsWith('/audio')) return envelope({ audioId: answerId, contentType: 'audio/mpeg', expiresAt: new Date(Date.now() + 600_000).toISOString(), audioPath: `/api/interview/speech/audio/${answerId}` }) as never
    if (path === `/api/interview/speech/audio/${answerId}`) return new Blob(['mp3'], { type: 'audio/mpeg' }) as never
    if (path.endsWith('/playback')) {
      const match = path.match(/questions\/([^/]+)\/playback/)
      const currentTurnId = match ? match[1] : turnId
      return envelope({ questionTurnId: currentTurnId, text: prompt.text, ttsProvider: 'deepgram', language: 'vi-VN' }) as never
    }
    if (path.endsWith('/speech/answers/' + answerId)) return envelope({ transcriptTurnId: '88888888-8888-4888-8888-888888888888', text: 'Câu trả lời được lưu trước khi mất kết nối.' }) as never
    if (path.endsWith('/speech-ticket')) return envelope({ ticket: 'test-ticket', expiresAt: new Date(Date.now() + 60_000).toISOString(), websocketPath: '/ws/interview/speech' }) as never
    throw new Error(`Unexpected test transport: ${path}`)
  })
})
afterEach(() => { cleanup(); vi.restoreAllMocks(); sessionStorage.clear(); runtimeConfig.dataSource = source })

describe('student interview with HTTP/WS/media boundaries simulated', () => {
  it('retries speculative audio failure only when the user listens', async () => {
    const audio = vi.spyOn(speechApi, 'audio').mockRejectedValueOnce(new Error('TTS busy'))
    mount()
    fireEvent.click(await screen.findByRole('button', { name: 'Bắt đầu phiên thi' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Kết nối speech' }))
    await waitFor(() => expect(audio).toHaveBeenCalledTimes(1))
    fireEvent.click(await screen.findByRole('button', { name: /Nghe câu hỏi/ }))
    await waitFor(() => expect(playQuestionAudio).toHaveBeenCalledOnce())
    expect(audio).toHaveBeenCalledTimes(2)
    expect(await screen.findByRole('button', { name: 'Bắt đầu trả lời' })).toBeEnabled()
  })
  it('aborts preparation and never plays a late audio result after leaving', async () => {
    let resolveAudio!: (blob: Blob) => void
    const audio = vi.spyOn(speechApi, 'audio').mockImplementationOnce(() => new Promise(resolve => { resolveAudio = resolve }))
    const view = mount()
    fireEvent.click(await screen.findByRole('button', { name: 'Bắt đầu phiên thi' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Kết nối speech' }))
    fireEvent.click(await screen.findByRole('button', { name: /Nghe câu hỏi/ }))
    expect(audio).toHaveBeenCalledOnce()
    const signal = audio.mock.calls[0][2]!
    view.unmount()
    expect(signal.aborted).toBe(true)
    await act(async () => { resolveAudio(new Blob(['mp3'], { type: 'audio/mpeg' })) })
    expect(playQuestionAudio).not.toHaveBeenCalled()
  })

  it('prefetches and reuses private male question audio and returns to ready before recording', async () => {
    mount()
    fireEvent.click(await screen.findByRole('button', { name: 'Bắt đầu phiên thi' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Kết nối speech' }))
    await waitFor(() => expect(request.mock.calls.filter(([path, options]) => path.endsWith('/audio') && options?.method === 'POST')).toHaveLength(1))
    expect(playQuestionAudio).not.toHaveBeenCalled()
    fireEvent.click(await screen.findByRole('button', { name: /Nghe câu hỏi/ }))
    await waitFor(() => expect(playQuestionAudio).toHaveBeenCalledOnce())
    expect(request.mock.calls.some(([path, options]) => path.endsWith('/audio') && options?.method === 'POST')).toBe(true)
    expect(await screen.findByRole('button', { name: 'Bắt đầu trả lời' })).toBeEnabled()
    expect(media.captureStart).not.toHaveBeenCalled()
    fireEvent.click(await screen.findByRole('button', { name: /Nghe câu hỏi/ }))
    await waitFor(() => expect(playQuestionAudio).toHaveBeenCalledTimes(2))
    expect(request.mock.calls.filter(([path, options]) => path.endsWith('/audio') && options?.method === 'POST')).toHaveLength(1)
  })

  it('starts explicitly, ignores URL prompt, saves one answer, then follows backend processing and completion', async () => {
    const view = mount()
    const start = await screen.findByRole('button', { name: 'Bắt đầu phiên thi' })
    expect(request.mock.calls.some(([path]) => path.endsWith('/start'))).toBe(false)
    fireEvent.click(start)
    await screen.findByRole('button', { name: 'Kết nối speech' })
    expect(screen.getAllByText(prompt.text).length).toBeGreaterThan(0)
    fireEvent.click(screen.getByRole('button', { name: 'Kết nối speech' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Bắt đầu trả lời' }))
    await waitFor(() => expect(media.command).toHaveBeenCalledWith(expect.objectContaining({ type: 'answer.start', questionTurnId: turnId })))
    expect(media.captureStart).not.toHaveBeenCalled()
    const startCommand = media.command.mock.calls[0][0]
    act(() => media.emit?.({ type: 'answer.started', requestId: startCommand.requestId, answerId, data: { questionTurnId: turnId, deadline: prompt.deadlineAt } }))
    expect(media.captureStart).toHaveBeenCalledOnce()
    act(() => media.chunk?.(new ArrayBuffer(320)))
    expect(media.audio).toHaveBeenCalledOnce()
    server = { attemptId, status: 'PROCESSING', prompt: null }
    await view.sync()
    expect(screen.getByRole('button', { name: 'Xác nhận câu trả lời' })).toBeInTheDocument()
    expect(media.cancel).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: 'Xác nhận câu trả lời' }))
    await waitFor(() => expect(media.command).toHaveBeenCalledWith(expect.objectContaining({ type: 'answer.end', answerId })))
    const endCommand = media.command.mock.calls.at(-1)![0]
    act(() => media.emit?.({ type: 'answer.finalized', requestId: endCommand.requestId, answerId, data: { transcriptTurnId: '88888888-8888-4888-8888-888888888888', text: 'Đóng gói giúp che giấu trạng thái bên trong.' } }))
    await screen.findAllByText('Hệ thống đang xử lý lượt thi')
    server = { attemptId, status: 'AWAITING_ANSWER', prompt: { ...prompt, questionTurnId: '66666666-6666-4666-8666-666666666666', text: 'Câu hỏi tiếp theo từ hệ thống.' } }
    await view.sync()
    expect((await screen.findAllByText('Câu hỏi tiếp theo từ hệ thống.')).length).toBeGreaterThan(0)
    // Live WebSocket connection is preserved without closing
    expect(media.close).not.toHaveBeenCalled()
    expect(await screen.findByRole('button', { name: 'Bắt đầu trả lời' })).toBeInTheDocument()
    server = { attemptId, status: 'COMPLETED', prompt: null }
    await view.sync()
    await screen.findAllByText('Phiên thi đã hoàn tất')
    expect(screen.queryByRole('button', { name: 'Bắt đầu trả lời' })).not.toBeInTheDocument()
    expect(request.mock.calls.filter(([path]) => path.endsWith('/start'))).toHaveLength(1)
  })
  it('looks up the receipt after disconnect instead of recording or submitting the answer again', async () => {
    server = { attemptId, status: 'AWAITING_ANSWER', prompt }
    mount()
    fireEvent.click(await screen.findByRole('button', { name: 'Kết nối speech' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Bắt đầu trả lời' }))
    await waitFor(() => expect(media.command).toHaveBeenCalled())
    const command = media.command.mock.calls[0][0]
    act(() => media.emit?.({ type: 'answer.started', requestId: command.requestId, answerId, data: { questionTurnId: turnId, deadline: prompt.deadlineAt } }))
    act(() => media.disconnected?.())
    server = { attemptId, status: 'PROCESSING', prompt: null }
    fireEvent.click(await screen.findByRole('button', { name: 'Kiểm tra câu trả lời đã lưu' }))
    await screen.findAllByText('Hệ thống đang xử lý lượt thi')
    expect(request.mock.calls.some(([path]) => path.endsWith('/speech/answers/' + answerId))).toBe(true)
    expect(media.command.mock.calls.filter(([value]) => value.type === 'answer.start')).toHaveLength(1)
    expect(media.captureStart).toHaveBeenCalledOnce()
  })
  it('resumes the current prompt on reload without calling start again', async () => {
    server = { attemptId, status: 'AWAITING_ANSWER', prompt }
    const view = mount()
    await screen.findByRole('button', { name: 'Kết nối speech' })
    view.unmount()
    mount()
    await screen.findByRole('button', { name: 'Kết nối speech' })
    expect(request.mock.calls.filter(([path]) => path.endsWith('/start'))).toHaveLength(0)
    expect(screen.getAllByText(prompt.text).length).toBeGreaterThan(0)
  })
  it('denies 403 and does not fall back to a URL question or mock prompt', async () => {
    deny = true
    mount()
    await screen.findByRole('heading', { name: 'Không có quyền truy cập' })
    expect(screen.queryByRole('button', { name: 'Kết nối speech' })).not.toBeInTheDocument()
    expect(media.command).not.toHaveBeenCalled()
  })
  it('recovers from a current-state network error without starting an exam automatically', async () => {
    request.mockImplementationOnce(async () => slot as never).mockRejectedValueOnce(new Error('Không tải được phiên thi'))
    mount()
    await screen.findByText('Không tải được phiên thi')
    fireEvent.click(screen.getByRole('button', { name: 'Đồng bộ lại phiên thi' }))
    await screen.findByRole('button', { name: 'Bắt đầu phiên thi' })
    expect(request.mock.calls.some(([path]) => path.endsWith('/start'))).toBe(false)
  })
  it('allows student to discard mistranscribed answer and re-record during the turn', async () => {
    server = { attemptId, status: 'AWAITING_ANSWER', prompt }
    mount()
    fireEvent.click(await screen.findByRole('button', { name: 'Kết nối speech' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Bắt đầu trả lời' }))
    await waitFor(() => expect(media.command).toHaveBeenCalledWith(expect.objectContaining({ type: 'answer.start' })))
    const firstCommand = media.command.mock.calls[0][0]
    act(() => media.emit?.({ type: 'answer.started', requestId: firstCommand.requestId, answerId, data: { questionTurnId: turnId, deadline: prompt.deadlineAt } }))
    expect(media.captureStart).toHaveBeenCalledOnce()

    // Server returns wrong transcript
    act(() => media.emit?.({
      type: 'transcript.final',
      answerId,
      requestId: null,
      data: { segmentId: '1', revision: 1, text: 'Từ ngữ bị bắt sai hoàn toàn' },
    }))
    expect(await screen.findByText('Từ ngữ bị bắt sai hoàn toàn')).toBeInTheDocument()

    // Student clicks retry button
    const retryBtn = await screen.findByRole('button', { name: /trả lời lại/i })
    fireEvent.click(retryBtn)

    // Verify current capture was cancelled and socket closed
    await waitFor(() => expect(media.cancel).toHaveBeenCalled())
    expect(media.close).toHaveBeenCalled()

    // Verify user can start answering again
    const startAgainBtn = await screen.findByRole('button', { name: 'Bắt đầu trả lời' })
    expect(startAgainBtn).toBeInTheDocument()
    expect(screen.getByText(/Đã hủy bản thu trước/i)).toBeInTheDocument()

    // Student clicks start answering again
    const secondAnswerId = '99999999-9999-4999-8999-999999999999'
    fireEvent.click(startAgainBtn)
    await waitFor(() => expect(media.command.mock.calls.length).toBeGreaterThan(1))
    const secondCommand = media.command.mock.calls.at(-1)![0]
    act(() => media.emit?.({ type: 'answer.started', requestId: secondCommand.requestId, answerId: secondAnswerId, data: { questionTurnId: turnId, deadline: prompt.deadlineAt } }))

    // Server returns correct transcript
    act(() => media.emit?.({
      type: 'transcript.final',
      answerId: secondAnswerId,
      requestId: null,
      data: { segmentId: '1', revision: 1, text: 'Câu trả lời chuẩn xác lần 2' },
    }))
    expect(await screen.findByText('Câu trả lời chuẩn xác lần 2')).toBeInTheDocument()

    // Finish and submit answer
    fireEvent.click(screen.getByRole('button', { name: 'Xác nhận câu trả lời' }))
    await waitFor(() => expect(media.command).toHaveBeenCalledWith(expect.objectContaining({ type: 'answer.end', answerId: secondAnswerId })))
  })
})
