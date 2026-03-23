import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit'

import { CentersService, type Center } from '../../api/generatedClient'

interface CentersState {
  items: Center[]
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null
}

const initialState: CentersState = {
  items: [],
  status: 'idle',
  error: null,
}

const toErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message
  }

  return 'Failed to fetch centers'
}

const normalizeCenters = (payload: unknown): Center[] => {
  if (!Array.isArray(payload)) {
    return []
  }

  return payload as Center[]
}

export const fetchCenters = createAsyncThunk<Center[], void, { rejectValue: string }>(
  'centers/fetchCenters',
  async (_, { rejectWithValue }) => {
    try {
      const response = await CentersService.getApiCenters()
      return normalizeCenters(response)
    } catch (error) {
      return rejectWithValue(toErrorMessage(error))
    }
  },
)

const centersSlice = createSlice({
  name: 'centers',
  initialState,
  reducers: {
    clearCenters: (state) => {
      state.items = []
      state.status = 'idle'
      state.error = null
    },
    upsertCenter: (state, action: PayloadAction<Center>) => {
      const index = state.items.findIndex(
        (item) => item.centreNo === action.payload.centreNo,
      )

      if (index === -1) {
        state.items.push(action.payload)
        return
      }

      state.items[index] = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCenters.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchCenters.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload
      })
      .addCase(fetchCenters.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload ?? action.error.message ?? 'Request failed'
      })
  },
})

export const { clearCenters, upsertCenter } = centersSlice.actions

export default centersSlice.reducer
