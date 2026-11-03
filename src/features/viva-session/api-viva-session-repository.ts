import { ApiError } from '../../services/api/client'
import type { VivaSessionRepository } from './viva-session-repository'

// This legacy generic repository does not map the live interview protocol.
// API rooms use interview-api (start/current) and the dedicated speech adapters.
// Never substitute mock interview state for a live backend response.
function unsupported(): never {
  throw new ApiError('Phòng thi thật sử dụng adapter interview-api và speech riêng.', { code: 'VIVA_NOT_SUPPORTED' })
}

export const apiVivaSessionRepository: VivaSessionRepository = {
  async start() { return unsupported() },
  async submitAnswer() { return unsupported() },
  async complete() { return unsupported() },
}
