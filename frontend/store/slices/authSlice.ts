import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import api from '../../lib/api'
import { User } from '../../types/user'
import { setToken, removeToken, getToken, isTokenExpired, getUser, setUser, removeUser } from '../../lib/auth'

interface AuthResponse {
  user: User
  token: string
}

export const updateAdminProfile = createAsyncThunk<User, FormData, { rejectValue: string }>(
  'auth/updateProfile',
  async (formData, { rejectWithValue }) => {
    try {
      const { data } = await api.put('/users/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setUser(data.data)
      return data.data
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.error?.message || 'Profile update failed')
    }
  }
)

export const signupUser = createAsyncThunk<AuthResponse, FormData, { rejectValue: string }>(
  'auth/signup',
  async (formData, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/auth/signup', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      return data.data
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.error?.message || 'Signup failed')
    }
  }
)

export const loginUser = createAsyncThunk<AuthResponse, any, { rejectValue: string }>(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/auth/login', credentials)
      return data.data
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.error?.message || 'Invalid credentials')
    }
  }
)

export const checkAuth = createAsyncThunk<User, void, { rejectValue: string }>(
  'auth/check',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/auth/me')
      setUser(data.data)
      return data.data
    } catch (error: any) {
      return rejectWithValue('Authentication check failed')
    }
  }
)

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  loading: 'idle' | 'pending' | 'succeeded' | 'failed'
  error: string | null
}

const initialState: AuthState = {
  user: getUser(),
  token: getToken(),
  isAuthenticated: (() => {
    const token = getToken()

    return !!(token && !isTokenExpired(token))
  })(),
  loading: 'idle',
  error: null
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: state => {
      removeToken()
      removeUser()
      state.user = null
      state.token = null
      state.isAuthenticated = false
    }
  },
  extraReducers: builder => {
    builder
      .addCase(signupUser.pending, state => {
        state.loading = 'pending'
        state.error = null
      })
      .addCase(signupUser.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
        setUser(action.payload.user)
        setToken(action.payload.token)
        state.loading = 'succeeded'
        state.isAuthenticated = true
        state.user = action.payload.user
        state.token = action.payload.token
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.loading = 'failed'
        state.error = action.payload as string
      })
      .addCase(loginUser.pending, state => {
        state.loading = 'pending'
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
        setUser(action.payload.user)
        setToken(action.payload.token)
        state.loading = 'succeeded'
        state.isAuthenticated = true
        state.user = action.payload.user
        state.token = action.payload.token
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = 'failed'
        state.error = action.payload as string
      })
      .addCase(checkAuth.pending, state => {
        state.loading = 'pending'
      })
      .addCase(checkAuth.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = 'succeeded'
        state.isAuthenticated = true
        state.user = action.payload
      })
      .addCase(checkAuth.rejected, state => {
        state.loading = 'failed'
        state.isAuthenticated = false
        state.user = null
        removeToken()
      })
      .addCase(updateAdminProfile.pending, state => {
        state.loading = 'pending'
        state.error = null
      })
      .addCase(updateAdminProfile.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = 'succeeded'
        state.user = action.payload
      })
      .addCase(updateAdminProfile.rejected, (state, action) => {
        state.loading = 'failed'
        state.error = action.payload as string
      })
  }
})

export const { logout } = authSlice.actions
export default authSlice.reducer
