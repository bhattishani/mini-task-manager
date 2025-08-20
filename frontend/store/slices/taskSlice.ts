import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import api from '../../lib/api'
import { Task } from '../../types/task'

interface FetchTasksParams {
  status?: string
  search?: string
  startDate?: string | null
  endDate?: string | null
  userId?: string | null
  page?: number
  pageSize?: number
  sortField?: string
  sortOrder?: 'asc' | 'desc'
}

export const fetchTasks = createAsyncThunk<Task[], FetchTasksParams, { rejectValue: string }>(
  'tasks/fetchAll',
  async ({ status, search, startDate, endDate, userId, page, pageSize, sortField, sortOrder }, { rejectWithValue }) => {
    try {
      const params: { [key: string]: any } = {
        status: status === 'all' ? undefined : status,
        search: search || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        userId: userId || undefined,
        page,
        pageSize,
        sortField,
        sortOrder
      }
      const { data } = await api.get('/tasks', { params })
      return data.data
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.error?.message || 'Failed to fetch tasks')
    }
  }
)

export const createTask = createAsyncThunk<Task, Partial<Task>, { rejectValue: string }>(
  'tasks/create',
  async (newTask, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/tasks', newTask)
      return data.data
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.error?.message || 'Failed to create task')
    }
  }
)

export const updateTask = createAsyncThunk<Task, Task, { rejectValue: string }>(
  'tasks/update',
  async (task, { rejectWithValue }) => {
    try {
      const { _id, ...taskData } = task
      const { data } = await api.put(`/tasks/${_id}`, taskData)
      return data.data
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.error?.message || 'Failed to update task')
    }
  }
)

export const deleteTask = createAsyncThunk<string, string, { rejectValue: string }>(
  'tasks/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/tasks/${id}`)
      return id
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.error?.message || 'Failed to delete task')
    }
  }
)

export const deleteMultipleTasks = createAsyncThunk<string[], string[], { rejectValue: string }>(
  'tasks/deleteMultiple',
  async (taskIds, { rejectWithValue }) => {
    try {
      await api.post('/tasks/delete-multiple', { taskIds })
      return taskIds
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.error?.message || 'Failed to delete tasks')
    }
  }
)

interface TaskState {
  tasks: Task[]
  total: number
  loading: 'idle' | 'pending' | 'succeeded' | 'failed'
  error: string | null
}

const initialState: TaskState = {
  tasks: [],
  total: 0,
  loading: 'idle',
  error: null
}

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      // Fetch Tasks
      .addCase(fetchTasks.pending, state => {
        state.loading = 'pending'
        state.error = null
      })
      .addCase(fetchTasks.fulfilled, (state, action: PayloadAction<Task[]>) => {
        state.loading = 'succeeded'
        state.tasks = action.payload
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = 'failed'
        state.error = action.payload as string
      })
      // Create Task
      .addCase(createTask.fulfilled, (state, action: PayloadAction<Task>) => {
        state.tasks.unshift(action.payload)
      })
      // Update Task
      .addCase(updateTask.fulfilled, (state, action: PayloadAction<Task>) => {
        const index = state.tasks.findIndex(task => task._id === action.payload._id)
        if (index !== -1) {
          state.tasks[index] = action.payload
        }
      })
      // Delete Task
      .addCase(deleteTask.fulfilled, (state, action: PayloadAction<string>) => {
        state.tasks = state.tasks.filter(task => task._id !== action.payload)
      })
      // Delete Multiple Tasks
      .addCase(deleteMultipleTasks.fulfilled, (state, action: PayloadAction<string[]>) => {
        state.tasks = state.tasks.filter(task => !action.payload.includes(task._id))
      })
  }
})

export default taskSlice.reducer
