import { useCallback, useEffect, useReducer, useRef, useState } from 'react'
import { createMockSpeechAdapter } from './mock-speech-adapter'
import { vivaSessionRepository, type VivaSessionRepository } from './viva-session-repository'
import { initialVivaState, isTimerRunning, vivaReducer } from './viva-session-machine'
import type { VivaSpeechAdapter } from './viva-speech-adapter'

type Options = { repository?: VivaSessionRepository; speech?: VivaSpeechAdapter }

function messageOf(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback
}
function timeLabel() {
  return new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
}

export function useVivaSession(examId: string | undefined, options: Options = {}) {
  const [repository] = useState(() => options.repository ?? vivaSessionRepository)
  const [speech] = useState(() => options.speech ?? createMockSpeechAdapter())
  const [state, dispatch] = useReducer(vivaReducer, initialVivaState)
  const [notice, setNotice] = useState<string | null>(null)
  const [reconnectError, setReconnectError] = useState<string | null>(null)
  const stateRef = useRef(state)
  const pendingAnswer = useRef<string | null>(null)

  useEffect(() => { stateRef.current = state })

  const load = useCallback(async () => {
    if (!examId) throw new Error('Thiếu mã kỳ thi.')
    return repository.start(examId)
  }, [examId, repository])

  // Initial load (authoritative snapshot).
  useEffect(() => {
    let cancelled = false
    load()
      .then((snapshot) => { if (!cancelled) dispatch({ type: 'SESSION_LOADED', snapshot }) })
      .catch((error) => { if (!cancelled) dispatch({ type: 'SESSION_LOAD_FAILED', message: messageOf(error, 'Không thể mở phiên vấn đáp.') }) })
    return () => { cancelled = true }
  }, [load])

  const running = isTimerRunning(state.phase)
  useEffect(() => {
    if (!running) return
    const timer = setInterval(() => dispatch({ type: 'TICK' }), 1000)
    return () => clearInterval(timer)
  }, [running])

  // Speak the latest AI prompt. A TTS failure must not block the exam: the text is already shown.
  const lastAiText = [...state.transcript].reverse().find((entry) => entry.role === 'ai')?.text
  useEffect(() => {
    if (state.phase !== 'AI_SPEAKING' || !lastAiText) return
    const controller = new AbortController()
    speech.speak(lastAiText, controller.signal)
      .catch(() => undefined)
      .then(() => { if (!controller.signal.aborted) dispatch({ type: 'PROMPT_SPOKEN' }) })
    return () => controller.abort()
  }, [state.phase, lastAiText, speech])

  // Server-side completion.
  useEffect(() => {
    if (state.phase !== 'COMPLETING' || !state.sessionId) return
    let cancelled = false
    repository.complete(state.sessionId)
      .then(() => { if (!cancelled) dispatch({ type: 'COMPLETED' }) })
      .catch((error) => { if (!cancelled) dispatch({ type: 'AI_FAILED', message: messageOf(error, 'Không thể hoàn tất phiên vấn đáp.') }) })
    return () => { cancelled = true }
  }, [state.phase, state.sessionId, repository])

  const reconnect = useCallback(async () => {
    setReconnectError(null)
    try {
      dispatch({ type: 'SESSION_LOADED', snapshot: await load() })
    } catch (error) {
      setReconnectError(messageOf(error, 'Chưa thể kết nối lại.'))
    }
  }, [load])

  useEffect(() => {
    const onOffline = () => { void speech.stopCapture().catch(() => undefined); dispatch({ type: 'DISCONNECTED' }) }
    const onOnline = () => { if (stateRef.current.phase === 'SESSION_DISCONNECTED') void reconnect() }
    window.addEventListener('offline', onOffline)
    window.addEventListener('online', onOnline)
    return () => { window.removeEventListener('offline', onOffline); window.removeEventListener('online', onOnline) }
  }, [reconnect, speech])

  const submit = useCallback(async (sessionId: string, text: string) => {
    try {
      const result = await repository.submitAnswer(sessionId, text)
      pendingAnswer.current = null
      dispatch({ type: 'TURN_RECEIVED', result })
    } catch (error) {
      dispatch({ type: 'AI_FAILED', message: messageOf(error, 'Không thể gửi câu trả lời.') })
    }
  }, [repository])

  const startAnswer = useCallback(async () => {
    setNotice(null)
    dispatch({ type: 'ANSWER_STARTED' })
    try {
      await speech.startCapture((text) => dispatch({ type: 'ANSWER_PARTIAL', text }))
    } catch (error) {
      dispatch({ type: 'MIC_FAILED', message: messageOf(error, 'Không thể sử dụng micro.') })
    }
  }, [speech])

  const stopAnswer = useCallback(async () => {
    const sessionId = stateRef.current.sessionId
    if (!sessionId) return
    const finalText = (await speech.stopCapture()).trim()
    if (!finalText) {
      // Never fabricate a transcript: nothing heard means nothing is submitted.
      dispatch({ type: 'ANSWER_DISCARDED' })
      setNotice('Hệ thống chưa nghe thấy câu trả lời. Vui lòng thử lại.')
      return
    }
    pendingAnswer.current = finalText
    dispatch({ type: 'ANSWER_SUBMITTED', text: finalText, timestamp: timeLabel(), entryId: `local-student-${Date.now()}` })
    await submit(sessionId, finalText)
  }, [speech, submit])

  const retryAi = useCallback(async () => {
    const current = stateRef.current
    dispatch({ type: 'AI_RETRY' })
    if (current.resumePhase === 'AI_PROCESSING' && current.sessionId && pendingAnswer.current) {
      await submit(current.sessionId, pendingAnswer.current)
    }
  }, [submit])

  const retryMic = useCallback(() => dispatch({ type: 'MIC_RETRY' }), [])

  const endEarly = useCallback(async () => {
    if (stateRef.current.phase === 'RECORDING') await speech.stopCapture().catch(() => '')
    dispatch({ type: 'COMPLETE_REQUESTED' })
  }, [speech])

  return { state, notice, reconnectError, startAnswer, stopAnswer, retryAi, retryMic, reconnect, endEarly }
}
