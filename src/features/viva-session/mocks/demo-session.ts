// Explicit demo sequence. Never used to select production exam questions.
export const demoPrompts = [
  'Trình bày mô hình MVC (Model–View–Controller) và cho một ví dụ thực tế.',
  'Giải thích cách phân chia trách nhiệm giữa Model, View và Controller trong ví dụ của bạn.',
]
export type DemoPhase = 'READY' | 'AI_SPEAKING' | 'WAITING_FOR_ANSWER' | 'RECORDING' | 'TRANSCRIBING' | 'AI_PROCESSING' | 'FOLLOW_UP' | 'NEXT_QUESTION' | 'COMPLETING' | 'COMPLETED' | 'TIMEOUT'
export type DemoLine = { role: 'ai' | 'student'; text: string; timestamp: string; isFollowUp?: boolean }
export type DemoSession = { phase: DemoPhase; index: number; followUps: number; remaining: number; transcript: DemoLine[] }
export type DemoAction = { type: 'start' | 'listen' | 'record' | 'transcribed' | 'analyzed' | 'next' | 'followup' | 'complete' | 'tick' } | { type: 'submit'; text: string }
export const initialDemoSession: DemoSession = { phase: 'READY', index: 0, followUps: 0, remaining: 300, transcript: [] }
export function demoSessionReducer(state: DemoSession, action: DemoAction): DemoSession {
  const phase = state.phase
  if (phase === 'COMPLETED' || phase === 'TIMEOUT') return state
  if (action.type === 'tick') return phase === 'READY' || phase === 'COMPLETING' ? state : state.remaining <= 1 ? { ...state, remaining: 0, phase: 'TIMEOUT' } : { ...state, remaining: state.remaining - 1 }
  if (action.type === 'start' && phase === 'READY') return { ...state, phase: 'AI_SPEAKING', transcript: [{ role: 'ai', text: demoPrompts[0], timestamp: '00:00' }] }
  if (action.type === 'listen' && phase === 'AI_SPEAKING') return { ...state, phase: 'WAITING_FOR_ANSWER' }
  if (action.type === 'record' && phase === 'WAITING_FOR_ANSWER') return { ...state, phase: 'RECORDING' }
  if (action.type === 'submit' && phase === 'RECORDING' && action.text.trim()) return { ...state, phase: 'TRANSCRIBING', transcript: [...state.transcript, { role: 'student', text: action.text.trim(), timestamp: formatDemoTime(300 - state.remaining) }] }
  if (action.type === 'transcribed' && phase === 'TRANSCRIBING') return { ...state, phase: 'AI_PROCESSING' }
  if (action.type === 'analyzed' && phase === 'AI_PROCESSING') return { ...state, phase: 'NEXT_QUESTION' }
  if (action.type === 'followup' && phase === 'NEXT_QUESTION' && state.followUps < 2) return { ...state, phase: 'FOLLOW_UP', followUps: state.followUps + 1 }
  if (action.type === 'listen' && phase === 'FOLLOW_UP') return { ...state, phase: 'AI_SPEAKING', transcript: [...state.transcript, { role: 'ai', text: 'Bạn có thể giải thích rõ hơn bằng một ví dụ cụ thể?', timestamp: formatDemoTime(300 - state.remaining), isFollowUp: true }] }
  if (action.type === 'next' && phase === 'NEXT_QUESTION') {
    const index = state.index + 1
    return index >= demoPrompts.length ? { ...state, phase: 'COMPLETING' } : { ...state, phase: 'AI_SPEAKING', index, followUps: 0, transcript: [...state.transcript, { role: 'ai', text: demoPrompts[index], timestamp: formatDemoTime(300 - state.remaining) }] }
  }
  if (action.type === 'complete' && phase === 'COMPLETING') return { ...state, phase: 'COMPLETED' }
  return state
}
export function formatDemoTime(seconds: number) { return `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}` }
