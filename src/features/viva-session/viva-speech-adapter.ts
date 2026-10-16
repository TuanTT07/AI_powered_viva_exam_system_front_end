/**
 * Device-side speech seam for the Viva room. M2 supplies a Web Speech API
 * implementation; until then the mock adapter below is used.
 */
export type VivaSpeechAdapter = {
  /** Resolves when the prompt has been spoken (or immediately if TTS is unavailable). */
  speak(text: string, signal: AbortSignal): Promise<void>
  /** Starts capturing. Rejects when the microphone is unavailable or permission is denied. */
  startCapture(onPartial: (text: string) => void): Promise<void>
  /** Stops capturing and resolves with the final transcript (empty string if nothing was heard). */
  stopCapture(): Promise<string>
}
