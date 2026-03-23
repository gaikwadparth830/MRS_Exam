import { httpClient } from '../api/httpClient'
import type { ApiEnvelope, HealthPayload } from '../types/api'

export const examService = {
  async checkHealth(): Promise<HealthPayload> {
    const response = await httpClient.get<ApiEnvelope<HealthPayload>>('/health')
    return response.data.data
  },
}
