import { selectRepository } from '../../services/api/repository-selection'
import { runtimeConfig } from '../../services/api/runtime-config'
import { apiVivaSessionRepository } from './api-viva-session-repository'
import { mockVivaSessionRepository } from './mock-viva-session-repository'
import type { VivaSessionSnapshot, VivaTurnResult } from './viva-session-machine'

export type VivaSessionRepository = {
  /** Start or resume. Always returns the authoritative snapshot (also used after reconnect). */
  start(examId: string): Promise<VivaSessionSnapshot>
  submitAnswer(sessionId: string, answerText: string): Promise<VivaTurnResult>
  complete(sessionId: string): Promise<void>
}

export const vivaSessionRepository: VivaSessionRepository = selectRepository(runtimeConfig.dataSource, {
  mock: mockVivaSessionRepository,
  api: apiVivaSessionRepository,
})
