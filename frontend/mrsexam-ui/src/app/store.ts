import { configureStore } from '@reduxjs/toolkit'

import { rootReducer } from '../store'
import { apiErrorMiddleware } from '../middleware/apiErrorMiddleware'

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiErrorMiddleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
