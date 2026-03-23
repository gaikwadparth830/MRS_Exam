import { combineReducers } from '@reduxjs/toolkit'

import centersReducer from '../features/centers/centersSlice'
import healthReducer from '../features/health/healthSlice'

const rootReducer = combineReducers({
  centers: centersReducer,
  health: healthReducer,
})

export default rootReducer
