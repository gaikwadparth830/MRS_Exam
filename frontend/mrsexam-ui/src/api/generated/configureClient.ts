import { OpenAPI } from './core/OpenAPI'

const ACCESS_TOKEN_KEY = 'accessToken'

export const configureGeneratedClient = (): void => {
  OpenAPI.BASE = import.meta.env.VITE_API_BASE_URL ?? 'https://localhost:7100'
  OpenAPI.TOKEN = async () => localStorage.getItem(ACCESS_TOKEN_KEY) ?? ''
}
