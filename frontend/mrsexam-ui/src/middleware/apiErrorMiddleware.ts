import { isRejectedWithValue, type Middleware } from '@reduxjs/toolkit'

export const apiErrorMiddleware: Middleware = () => (next) => (action) => {
  if (isRejectedWithValue(action)) {
    const errorMessage =
      typeof action.payload === 'string'
        ? action.payload
        : action.error?.message ?? 'Unexpected API error'

    console.error('API request failed:', errorMessage)
  }

  return next(action)
}
