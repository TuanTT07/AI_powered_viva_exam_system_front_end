import { describe, expect, it } from 'vitest'
import { demoSessionReducer as reduce, initialDemoSession } from './demo-session'

describe('isolated demo session transitions', () => {
  it('requires a nonempty answer and follows processing before moving on', () => {
    let state = reduce(initialDemoSession, { type: 'start' })
    state = reduce(state, { type: 'listen' })
    expect(reduce(state, { type: 'submit', text: 'answer' })).toBe(state)
    state = reduce(state, { type: 'record' })
    expect(reduce(state, { type: 'submit', text: '  ' })).toBe(state)
    state = reduce(state, { type: 'submit', text: 'My own answer' })
    expect(state.phase).toBe('TRANSCRIBING')
    expect(state.transcript.at(-1)?.text).toBe('My own answer')
    expect(reduce(state, { type: 'next' })).toBe(state)
    state = reduce(state, { type: 'transcribed' })
    state = reduce(state, { type: 'analyzed' })
    expect(state.phase).toBe('NEXT_QUESTION')
  })
  it('enforces follow-up limit and never resumes after timeout or completion', () => {
    const ready = { ...initialDemoSession, phase: 'NEXT_QUESTION' as const, followUps: 2 }
    expect(reduce(ready, { type: 'followup' })).toBe(ready)
    const timeout = reduce({ ...ready, remaining: 1 }, { type: 'tick' })
    expect(timeout.phase).toBe('TIMEOUT')
    expect(reduce(timeout, { type: 'record' })).toBe(timeout)
    const done = reduce({ ...ready, phase: 'COMPLETING' }, { type: 'complete' })
    expect(done.phase).toBe('COMPLETED')
    expect(reduce(done, { type: 'start' })).toBe(done)
  })
})
