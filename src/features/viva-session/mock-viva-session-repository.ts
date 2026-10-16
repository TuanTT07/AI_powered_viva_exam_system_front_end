import type { VivaSessionRepository } from './viva-session-repository'
import type { TranscriptEntry, VivaSessionSnapshot } from './viva-session-machine'

// MOCK ONLY: deterministic fixture used when VITE_DATA_SOURCE is not `api` and in tests.
// Never import this from production (API) code paths.
const MOCK_DURATION_SECONDS = 300
const MOCK_MAX_FOLLOW_UPS = 2
const QUESTIONS = [
  'Chào bạn. Câu hỏi đầu tiên: Bạn hãy trình bày về mô hình MVC (Model-View-Controller) và cho ví dụ thực tế.',
  'Câu hỏi tiếp theo: Hãy so sánh REST và GraphQL, khi nào nên dùng mỗi loại?',
]
const FOLLOW_UP = 'Bạn vừa nhắc đến Model trong MVC, vậy Model tương tác thế nào với cơ sở dữ liệu?'

type MockSession = { examId: string; questionIndex: number; followUpCount: number; transcript: TranscriptEntry[]; completed: boolean }
const sessions = new Map<string, MockSession>()
let counter = 0

function nowLabel() {
  return new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
}
function aiEntry(text: string, isFollowUp: boolean): TranscriptEntry {
  counter += 1
  return { id: `mock-ai-${counter}`, role: 'ai', text, timestamp: nowLabel(), isFollowUp }
}
function requireSession(sessionId: string): MockSession {
  const session = sessions.get(sessionId)
  if (!session) throw new Error('Không tìm thấy phiên vấn đáp.')
  return session
}
function snapshot(sessionId: string, session: MockSession): VivaSessionSnapshot {
  const last = session.transcript[session.transcript.length - 1]
  return {
    sessionId,
    examId: session.examId,
    timeLeftSeconds: MOCK_DURATION_SECONDS,
    maxFollowUps: MOCK_MAX_FOLLOW_UPS,
    followUpCount: session.followUpCount,
    transcript: session.transcript,
    awaitingPromptPlayback: last?.role === 'ai',
  }
}

export const mockVivaSessionRepository: VivaSessionRepository = {
  async start(examId) {
    const sessionId = `mock-session-${examId}`
    let session = sessions.get(sessionId)
    if (!session) {
      session = { examId, questionIndex: 0, followUpCount: 0, transcript: [aiEntry(QUESTIONS[0], false)], completed: false }
      sessions.set(sessionId, session)
    }
    return snapshot(sessionId, session)
  },

  async submitAnswer(sessionId, answerText) {
    const session = requireSession(sessionId)
    if (session.completed) return { kind: 'COMPLETE' }
    counter += 1
    session.transcript.push({ id: `mock-student-${counter}`, role: 'student', text: answerText, timestamp: nowLabel(), isFollowUp: false })
    // Fixture policy: one follow-up after the first question, then move on, then finish.
    if (session.questionIndex === 0 && session.followUpCount < MOCK_MAX_FOLLOW_UPS) {
      session.followUpCount += 1
      const prompt = aiEntry(FOLLOW_UP, true)
      session.transcript.push(prompt)
      return { kind: 'FOLLOW_UP', prompt, followUpCount: session.followUpCount }
    }
    if (session.questionIndex + 1 < QUESTIONS.length) {
      session.questionIndex += 1
      const prompt = aiEntry(QUESTIONS[session.questionIndex], false)
      session.transcript.push(prompt)
      return { kind: 'NEXT_QUESTION', prompt, followUpCount: session.followUpCount }
    }
    session.completed = true
    return { kind: 'COMPLETE' }
  },

  async complete(sessionId) {
    requireSession(sessionId).completed = true
  },
}

export function resetMockVivaSessions() {
  sessions.clear()
  counter = 0
}
