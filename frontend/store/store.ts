import { configureStore, combineReducers } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import taskReducer from './slices/taskSlice'
import adminTaskReducer from './slices/admin/taskSlice'
import userReducer from './slices/admin/userSlice'
import dashboardReducer from './slices/admin/dashboardSlice'

// Combine admin reducers under "admin"
const adminReducer = combineReducers({
  tasks: adminTaskReducer,
  users: userReducer,
  dashboard: dashboardReducer
})

export const makeStore = () => {
  return configureStore({
    reducer: {
      auth: authReducer,
      tasks: taskReducer,
      admin: adminReducer
    }
  })
}

export type AppStore = ReturnType<typeof makeStore>
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']
