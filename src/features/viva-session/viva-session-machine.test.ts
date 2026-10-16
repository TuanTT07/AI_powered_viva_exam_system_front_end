import { describe, expect, it } from 'vitest'
import { initialVivaState, vivaReducer, type VivaAction, type VivaSessionSnapshot, type VivaState } from './viva-session-machine'

const snapshot: VivaSessionSnapshot = {
  sessionId: 's1',
  examId: 'e1',
  timeLeftSeconds: 3,
  maxFollowUps: 1,
  followUpCount: 0,
  transcript: [{ id: 'a1', role: 'ai', text: 'Q1', timestamp: '09:00', isFollowUp: false }],
  awaitingPromptPlayback: true,
}

function run(actions: VivaAction[], from: VivaState = initialVivaState) {
  return actions.reduce(vivaReducer, from)
}
const loaded = run([{ type: 'SESSION_LOADED', snapshot }])

describe('vivaReducer', () => {
  it('walks the primary flow to completion', () => {
    const state = run([
      { type: 'PROMPT_SPOKEN' },
      { type: 'ANSWER_STARTED' },
      { type: 'ANSWER_PARTIAL', text: 'xin' },
      { type: 'ANSWER_SUBMITTED', text: 'xin chào', timestamp: '09:01', entryId: 'l1' },
      { type: 'TURN_RECEIVED', result: { kind: 'COMPLETE' } },
      { type: 'COMPLETED' },
    ], loaded)
    expect(state.phase).toBe('COMPLETED')
    expect(state.transcript.map((e) => e.role)).toEqual(['ai', 'student'])
    expect(state.partialAnswer).toBe('')
  })

  it('ignores invalid transitions and partial text outside recording', () => {
    expect(vivaReducer(loaded, { type: 'ANSWER_STARTED' })).toBe(loaded)
    expect(vivaReducer(loaded, { type: 'ANSWER_PARTIAL', text: 'x' })).toBe(loaded)
    expect(vivaReducer(loaded, { type: 'COMPLETED' })).toBe(loaded)
  })

  it('never exceeds the backend follow-up maximum', () => {
    const processing = run([
      { type: 'PROMPT_SPOKEN' }, { type: 'ANSWER_STARTED' },
      { type: 'ANSWER_SUBMITTED', text: 'a', timestamp: '09:01', entryId: 'l1' },
    ], loaded)
    const next = vivaReducer(processing, {
      type: 'TURN_RECEIVED',
      result: { kind: 'FOLLOW_UP', followUpCount: 5, prompt: { id: 'a2', role: 'ai', text: 'F', timestamp: '09:02', isFollowUp: true } },
    })
    expect(next.followUpCount).toBe(1)
    expect(next.phase).toBe('AI_SPEAKING')
  })

  it('does not accept answers once completed', () => {
    const done = run([{ type: 'COMPLETE_REQUESTED' }, { type: 'COMPLETED' }], loaded)
    expect(vivaReducer(done, { type: 'ANSWER_STARTED' })).toBe(done)
    expect(vivaReducer(done, { type: 'SESSION_LOADED', snapshot })).toBe(done)
  })

  it('handles mic errors and retry', () => {
    const recording = run([{ type: 'PROMPT_SPOKEN' }, { type: 'ANSWER_STARTED' }], loaded)
    const error = vivaReducer(recording, { type: 'MIC_FAILED', message: 'denied' })
    expect(error.phase).toBe('MIC_ERROR')
    expect(vivaReducer(error, { type: 'MIC_RETRY' }).phase).toBe('WAITING_FOR_ANSWER')
  })

  it('keeps evidence on AI errors and resumes the previous phase on retry', () => {
    const processing = run([
      { type: 'PROMPT_SPOKEN' }, { type: 'ANSWER_STARTED' },
      { type: 'ANSWER_SUBMITTED', text: 'a', timestamp: '09:01', entryId: 'l1' },
    ], loaded)
    const error = vivaReducer(processing, { type: 'AI_FAILED', message: 'boom' })
    expect(error.phase).toBe('AI_ERROR')
    expect(error.transcript).toHaveLength(2)
    expect(vivaReducer(error, { type: 'AI_RETRY' }).phase).toBe('AI_PROCESSING')
  })

  it('resyncs from an authoritative snapshot after disconnect', () => {
    const disconnected = vivaReducer(loaded, { type: 'DISCONNECTED' })
    expect(disconnected.phase).toBe('SESSION_DISCONNECTED')
    expect(vivaReducer(disconnected, { type: 'ANSWER_STARTED' })).toBe(disconnected)
    const resumed = vivaReducer(disconnected, { type: 'SESSION_LOADED', snapshot: { ...snapshot, awaitingPromptPlayback: false, timeLeftSeconds: 2 } })
    expect(resumed.phase).toBe('WAITING_FOR_ANSWER')
    expect(resumed.timeLeftSeconds).toBe(2)
  })

  it('counts down and reports a timeout only while an answer is expected', () => {
    let state = run([{ type: 'TICK' }, { type: 'TICK' }], loaded) // AI_SPEAKING keeps ticking
    expect(state.timeLeftSeconds).toBe(1)
    state = run([{ type: 'PROMPT_SPOKEN' }, { type: 'TICK' }], state)
    expect(state.phase).toBe('TIMEOUT')
    expect(state.timeLeftSeconds).toBe(0)
  })

  it('does not tick while preparing or completed', () => {
    expect(vivaReducer(initialVivaState, { type: 'TICK' })).toBe(initialVivaState)
  })
})
