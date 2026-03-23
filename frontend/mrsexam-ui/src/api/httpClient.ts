import axios from 'axios'

import { registerInterceptors } from './registerInterceptors'

const baseURL = import.meta.env.VITE_API_BASE_URL ?? 'https://localhost:7100'

export const httpClient = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

registerInterceptors(httpClient)
