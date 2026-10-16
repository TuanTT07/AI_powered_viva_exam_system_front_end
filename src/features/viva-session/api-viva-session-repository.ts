import { ApiError } from '../../services/api/client'
import type { VivaSessionRepository } from './viva-session-repository'

// The backend has no documented viva-session contract yet (docs/api/API_CONTRACT.md).
// API mode must fail explicitly and never fall back to mock data.
function unsupported(): never {
  throw new ApiError('Phiên vấn đáp chưa được backend hỗ trợ.', { code: 'VIVA_NOT_SUPPORTED' })
}

export const apiVivaSessionRepository: VivaSessionRepository = {
  async start() { return unsupported() },
  async submitAnswer() { return unsupported() },
  async complete() { return unsupported() },
}
