import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import adminApi from '@/lib/admin/api'

export interface DashboardStats {
  overview: {
    totalUsers: number
    totalTasks: number
    completedTasks: number
    pendingTasks: number
    completionRate: number
  }
  charts: {
    tasksByDay: Array<{ _id: string; count: number }>
    tasksByStatus: Array<{ _id: string; count: number }>
    userRegistrations: Array<{ _id: string; count: number }>
  }
}

interface DashboardState {
  stats: DashboardStats | null
  loading: 'idle' | 'pending' | 'succeeded' | 'failed'
  error: string | null
}

const initialState: DashboardState = {
  stats: {
    overview: {
      totalUsers: 0,
      totalTasks: 0,
      completedTasks: 0,
      pendingTasks: 0,
      completionRate: 0
    },
    charts: {
      tasksByDay: [],
      tasksByStatus: [],
      userRegistrations: []
    }
  },
  loading: 'idle',
  error: null
}

export const fetchDashboardStats = createAsyncThunk('dashboard/fetchStats', async () => {
  const response = await adminApi.get('/dashboard')
  return response.data.data
})

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchDashboardStats.pending, state => {
        state.loading = 'pending'
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading = 'succeeded'
        state.stats = action.payload
        state.error = null
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading = 'failed'
        state.error = action.error.message || 'Something went wrong'
      })
  }
})

export default dashboardSlice.reducer
