import axios from 'axios'
import { getToken, removeToken, removeUser } from './auth'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
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
      const isLoginPage = window.location.pathname === '/login'
      if (!isLoginPage) {
        removeUser()
        removeToken()
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api
