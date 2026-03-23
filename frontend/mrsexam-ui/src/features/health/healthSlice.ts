import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import axios from 'axios'

import { examService } from '../../services/examService'

interface HealthState {
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  value: string
  error: string | null
}

const initialState: HealthState = {
  status: 'idle',
  value: 'unknown',
  error: null,
}

export const checkApiHealth = createAsyncThunk<
  string,
  void,
  { rejectValue: string }
>('health/checkApiHealth', async (_, { rejectWithValue }) => {
  try {
    const data = await examService.checkHealth()
    return data.status
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return rejectWithValue(error.message)
    }

    return rejectWithValue('Unable to reach API')
  }
})

const healthSlice = createSlice({
  name: 'health',
  initialState,
  reducers: {
    resetHealthState: () => initialState,
    setHealthValue: (state, action: PayloadAction<string>) => {
      state.value = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkApiHealth.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(checkApiHealth.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.value = action.payload
      })
      .addCase(checkApiHealth.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload ?? action.error.message ?? 'Request failed'
      })
  },
})

export const { resetHealthState, setHealthValue } = healthSlice.actions

export default healthSlice.reducer
