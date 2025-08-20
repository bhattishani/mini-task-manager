import axios from 'axios'
import { getToken } from '../auth'
import { useDispatch } from 'react-redux'
import { logout } from '@/store/slices/authSlice'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_ADMIN_API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor to add the auth token to headers
api.interceptors.request.use(
  config => {
    const token = getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle 401 Unauthorized errors
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      // Dispatch logout action if token is invalid
      const dispatch = useDispatch()
      dispatch(logout())
    }
    return Promise.reject(error)
  }
)

export default api
