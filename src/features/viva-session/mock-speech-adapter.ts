import type { VivaSpeechAdapter } from './viva-speech-adapter'

// MOCK ONLY: simulated TTS delay and typed STT text. Replaced by the Web Speech
// adapter in milestone M2. Never used as real transcript evidence.
const MOCK_ANSWER = 'Dạ, em xin trả lời: đây là câu trả lời mô phỏng của chế độ dữ liệu giả.'

export function createMockSpeechAdapter(options: { tickMs?: number; speakMs?: number } = {}): VivaSpeechAdapter {
  const tickMs = options.tickMs ?? 50
  const speakMs = options.speakMs ?? 2500
  let timer: ReturnType<typeof setInterval> | null = null
  let captured = ''

  function clear() {
    if (timer) clearInterval(timer)
    timer = null
  }

  return {
    speak(_text, signal) {
      return new Promise<void>((resolve) => {
        const t = setTimeout(resolve, speakMs)
        signal.addEventListener('abort', () => { clearTimeout(t); resolve() }, { once: true })
      })
    },
    async startCapture(onPartial) {
      clear()
      captured = ''
      let i = 0
      timer = setInterval(() => {
        if (i >= MOCK_ANSWER.length) return clear()
        captured += MOCK_ANSWER.charAt(i)
        i += 1
        onPartial(captured)
      }, tickMs)
    },
    async stopCapture() {
      clear()
      return captured
    },
  }
}
