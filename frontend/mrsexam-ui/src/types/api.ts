export interface ApiEnvelope<TData> {
  success: boolean
  data: TData
  message?: string
}

export interface HealthPayload {
  status: string
  timestamp?: string
}
