import { describe, expect, it, vi } from 'vitest'
import { createInterviewApi } from './interview-api'
const attemptId = '33333333-3333-4333-8333-333333333333'
const prompt = { questionAttemptId: '44444444-4444-4444-8444-444444444444', questionTurnId: '55555555-5555-4555-8555-555555555555', text: 'Câu hỏi hiện tại', deadlineAt: '2026-11-03T10:00:00Z' }
const envelope = (data: unknown) => ({ success: true, status: 200, message: 'OK', data })
describe('interview start/current contract', () => {
  it('uses JWT current GET and start POST without identity or prompt input', async () => {
    const state = { attemptId, status: 'AWAITING_ANSWER', prompt }
    const request = vi.fn().mockResolvedValue(envelope(state))
    const api = createInterviewApi({ request })
    const signal = new AbortController().signal
    await expect(api.current(attemptId, signal)).resolves.toEqual(state)
    expect(request).toHaveBeenLastCalledWith(`/api/interviews/${attemptId}/current`, { method: 'GET', signal })
    await api.start(attemptId)
    expect(request).toHaveBeenLastCalledWith(`/api/interviews/${attemptId}/start`, { method: 'POST', signal: undefined })
  })
  it.each(['READY', 'PROCESSING', 'COMPLETED'])('accepts %s without disclosing a prompt', async status => {
    const request = vi.fn().mockResolvedValue(envelope({ attemptId, status, prompt: null }))
    await expect(createInterviewApi({ request }).current(attemptId)).resolves.toMatchObject({ status, prompt: null })
  })
  it.each([
    { attemptId: 'other', status: 'READY', prompt: null },
    { attemptId, status: 'UNKNOWN', prompt: null },
    { attemptId, status: 'AWAITING_ANSWER', prompt: null },
    { attemptId, status: 'AWAITING_ANSWER', prompt: { ...prompt, questionTurnId: 'question-id' } },
    { attemptId, status: 'AWAITING_ANSWER', prompt: { ...prompt, deadlineAt: 'invalid' } },
    { attemptId, status: 'COMPLETED', prompt },
  ])('rejects invalid/mismatched state %#', async data => {
    const request = vi.fn().mockResolvedValue(envelope(data))
    await expect(createInterviewApi({ request }).current(attemptId)).rejects.toMatchObject({ code: 'INVALID_RESPONSE' })
  })
  it('preserves backend denial', async () => {
    const request = vi.fn().mockResolvedValue({ success: false, status: 403, message: 'Không có quyền', data: null })
    await expect(createInterviewApi({ request }).current(attemptId)).rejects.toMatchObject({ status: 403 })
  })
})
