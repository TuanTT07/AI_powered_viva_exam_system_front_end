export type VivaPhase =
  | 'PREPARING'
  | 'AI_SPEAKING'
  | 'WAITING_FOR_ANSWER'
  | 'RECORDING'
  | 'AI_PROCESSING'
  | 'COMPLETING'
  | 'COMPLETED'
  | 'MIC_ERROR'
  | 'AI_ERROR'
  | 'SESSION_DISCONNECTED'
  | 'TIMEOUT'
  | 'LOAD_FAILED'

export type TranscriptEntry = {
  id: string
  role: 'ai' | 'student'
  text: string
  timestamp: string
  isFollowUp: boolean
}

export type VivaSessionSnapshot = {
  sessionId: string
  examId: string
  timeLeftSeconds: number
  maxFollowUps: number
  followUpCount: number
  transcript: TranscriptEntry[]
  /** True when the last transcript entry is an AI prompt that still needs to be spoken. */
  awaitingPromptPlayback: boolean
}

export type VivaTurnResult =
  | { kind: 'FOLLOW_UP' | 'NEXT_QUESTION'; prompt: TranscriptEntry; followUpCount: number }
  | { kind: 'COMPLETE' }

export type VivaState = {
  phase: VivaPhase
  sessionId: string | null
  transcript: TranscriptEntry[]
  /** Partial speech-to-text. Ephemeral; never treated as final evidence. */
  partialAnswer: string
  followUpCount: number
  maxFollowUps: number
  timeLeftSeconds: number
  error: string | null
  /** Phase to return to after a recoverable error is cleared. */
  resumePhase: VivaPhase | null
}

export type VivaAction =
  | { type: 'SESSION_LOADED'; snapshot: VivaSessionSnapshot }
  | { type: 'SESSION_LOAD_FAILED'; message: string }
  | { type: 'PROMPT_SPOKEN' }
  | { type: 'ANSWER_STARTED' }
  | { type: 'ANSWER_PARTIAL'; text: string }
  | { type: 'ANSWER_SUBMITTED'; text: string; timestamp: string; entryId: string }
  | { type: 'ANSWER_DISCARDED' }
  | { type: 'TURN_RECEIVED'; result: VivaTurnResult }
  | { type: 'MIC_FAILED'; message: string }
  | { type: 'MIC_RETRY' }
  | { type: 'AI_FAILED'; message: string }
  | { type: 'AI_RETRY' }
  | { type: 'DISCONNECTED' }
  | { type: 'COMPLETE_REQUESTED' }
  | { type: 'COMPLETED' }
  | { type: 'TICK' }

export const initialVivaState: VivaState = {
  phase: 'PREPARING',
  sessionId: null,
  transcript: [],
  partialAnswer: '',
  followUpCount: 0,
  maxFollowUps: 0,
  timeLeftSeconds: 0,
  error: null,
  resumePhase: null,
}

const TERMINAL: VivaPhase[] = ['COMPLETING', 'COMPLETED', 'LOAD_FAILED', 'PREPARING']
const ANSWERABLE: VivaPhase[] = ['WAITING_FOR_ANSWER', 'RECORDING']

export function isTimerRunning(phase: VivaPhase): boolean {
  return !TERMINAL.includes(phase)
}

function sessionFromSnapshot(snapshot: VivaSessionSnapshot): VivaState {
  return {
    phase: snapshot.awaitingPromptPlayback ? 'AI_SPEAKING' : 'WAITING_FOR_ANSWER',
    sessionId: snapshot.sessionId,
    transcript: snapshot.transcript,
    partialAnswer: '',
    followUpCount: snapshot.followUpCount,
    maxFollowUps: snapshot.maxFollowUps,
    timeLeftSeconds: snapshot.timeLeftSeconds,
    error: null,
    resumePhase: null,
  }
}

/**
 * Canonical Viva phase reducer (docs/architecture/VIVA_STATE_MACHINE.md).
 * Invalid transitions return the same state. The official question/follow-up
 * sequence only ever comes from the repository (backend authoritative).
 */
export function vivaReducer(state: VivaState, action: VivaAction): VivaState {
  switch (action.type) {
    case 'SESSION_LOADED':
      // Also used for reconnect: a fresh authoritative snapshot replaces local guesses.
      if (state.phase === 'COMPLETED' || state.phase === 'COMPLETING') return state
      return sessionFromSnapshot(action.snapshot)

    case 'SESSION_LOAD_FAILED':
      if (state.phase !== 'PREPARING') return state
      return { ...state, phase: 'LOAD_FAILED', error: action.message }

    case 'PROMPT_SPOKEN':
      if (state.phase !== 'AI_SPEAKING') return state
      return { ...state, phase: 'WAITING_FOR_ANSWER' }

    case 'ANSWER_STARTED':
      if (state.phase !== 'WAITING_FOR_ANSWER') return state
      return { ...state, phase: 'RECORDING', partialAnswer: '' }

    case 'ANSWER_PARTIAL':
      if (state.phase !== 'RECORDING') return state
      return { ...state, partialAnswer: action.text }

    case 'ANSWER_SUBMITTED':
      if (state.phase !== 'RECORDING') return state
      return {
        ...state,
        phase: 'AI_PROCESSING',
        partialAnswer: '',
        transcript: [
          ...state.transcript,
          { id: action.entryId, role: 'student', text: action.text, timestamp: action.timestamp, isFollowUp: false },
        ],
      }

    case 'ANSWER_DISCARDED':
      if (state.phase !== 'RECORDING') return state
      return { ...state, phase: 'WAITING_FOR_ANSWER', partialAnswer: '' }

    case 'TURN_RECEIVED': {
      if (state.phase !== 'AI_PROCESSING') return state
      if (action.result.kind === 'COMPLETE') return { ...state, phase: 'COMPLETING' }
      const nextCount = Math.min(action.result.followUpCount, state.maxFollowUps)
      return {
        ...state,
        phase: 'AI_SPEAKING',
        followUpCount: nextCount,
        transcript: [...state.transcript, action.result.prompt],
      }
    }

    case 'MIC_FAILED':
      if (state.phase !== 'RECORDING' && state.phase !== 'WAITING_FOR_ANSWER') return state
      return { ...state, phase: 'MIC_ERROR', error: action.message, partialAnswer: '', resumePhase: 'WAITING_FOR_ANSWER' }

    case 'MIC_RETRY':
      if (state.phase !== 'MIC_ERROR') return state
      return { ...state, phase: 'WAITING_FOR_ANSWER', error: null, resumePhase: null }

    case 'AI_FAILED':
      if (state.phase !== 'AI_PROCESSING' && state.phase !== 'COMPLETING') return state
      return { ...state, phase: 'AI_ERROR', error: action.message, resumePhase: state.phase }

    case 'AI_RETRY':
      if (state.phase !== 'AI_ERROR') return state
      return { ...state, phase: state.resumePhase ?? 'AI_PROCESSING', error: null, resumePhase: null }

    case 'DISCONNECTED':
      if (TERMINAL.includes(state.phase) || state.phase === 'SESSION_DISCONNECTED') return state
      return { ...state, phase: 'SESSION_DISCONNECTED', partialAnswer: '', resumePhase: null, error: null }

    case 'COMPLETE_REQUESTED':
      if (TERMINAL.includes(state.phase)) return state
      return { ...state, phase: 'COMPLETING', partialAnswer: '' }

    case 'COMPLETED':
      if (state.phase !== 'COMPLETING') return state
      return { ...state, phase: 'COMPLETED' }

    case 'TICK': {
      if (!isTimerRunning(state.phase) || state.timeLeftSeconds <= 0) return state
      const timeLeftSeconds = state.timeLeftSeconds - 1
      // Frontend only reports the timeout; the backend decides what it means.
      if (timeLeftSeconds === 0 && ANSWERABLE.includes(state.phase)) {
        return { ...state, timeLeftSeconds, phase: 'TIMEOUT', partialAnswer: '' }
      }
      return { ...state, timeLeftSeconds }
    }
  }
}
