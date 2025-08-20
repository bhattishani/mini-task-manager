import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import api from '../../../lib/admin/api'
import { User } from '../../../types/user'

interface FetchUsersParams {
  page?: number
  pageSize?: number
  sortField?: string
  sortOrder?: 'asc' | 'desc'
}

interface FetchUsersResponse {
  users: User[]
  total: number
}

export const fetchUsers = createAsyncThunk<FetchUsersResponse, FetchUsersParams | void, { rejectValue: string }>(
  'users/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/users', { params })
      return data.data
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.error?.message || 'Failed to fetch users')
    }
  }
)

export const updateUser = createAsyncThunk<User, { id: string; updateData: Partial<User> }, { rejectValue: string }>(
  'users/update',
  async ({ id, updateData }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/users/${id}`, updateData)
      return data.data
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.error?.message || 'Failed to update user')
    }
  }
)

export const deleteUsers = createAsyncThunk<void, string[], { rejectValue: string }>(
  'users/deleteMultiple',
  async (userIds, { rejectWithValue }) => {
    try {
      await api.delete('/users', { data: { userIds } })
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.error?.message || 'Failed to delete users')
    }
  }
)

interface UserManagementState {
  users: User[]
  total: number
  loading: 'idle' | 'pending' | 'succeeded' | 'failed'
  error: string | null
}

const initialState: UserManagementState = {
  users: [],
  total: 0,
  loading: 'idle',
  error: null
}

const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchUsers.pending, state => {
        state.loading = 'pending'
      })
      .addCase(fetchUsers.fulfilled, (state, action: PayloadAction<FetchUsersResponse>) => {
        state.loading = 'succeeded'
        state.users = action.payload.users
        state.total = action.payload.total
        state.error = null
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = 'failed'
        state.error = action.payload as string
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.users = state.users.map(user => (user._id === action.payload._id ? action.payload : user))
      })
      .addCase(deleteUsers.fulfilled, (state, action) => {
        state.loading = 'succeeded'
        state.error = null
      })
  }
})

export default userSlice.reducer
