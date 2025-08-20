// frontend/lib/auth.ts
'use client'
import { User } from '@/types/user'
import Cookies from 'js-cookie'
import { jwtDecode } from 'jwt-decode'

const TOKEN_KEY = 'authToken'
const USER_KEY = 'user'
const SESSION_DAYS = 7

/**
 * Retrieves the authentication token from cookies.
 * @returns {string | null} The token, or null if not found.
 */
export const getToken = (): string | null => {
  return Cookies.get(TOKEN_KEY) || null
}

/**
 * Retrieves the authentication user from cookies.
 * @returns {User | null} The user, or null if not found.
 */
export const getUser = (): User | null => {
  const user = Cookies.get(USER_KEY)
  return user ? JSON.parse(user) : null
}

/**
 * Stores the authentication user in cookies.
 * @param {User} user - The user object to store.
 */
export const setUser = (user: User): void => {
  // Set cookie with 7 days expiration, accessible across all paths
  Cookies.set(USER_KEY, JSON.stringify(user), {
    expires: SESSION_DAYS,
    path: '/',
    secure: process.env.NODE_ENV === 'production', // Only secure in production
    sameSite: 'strict' // CSRF protection
  })
}

/**
 * Stores the authentication token in cookies.
 * @param {string} token - The JWT to store.
 */
export const setToken = (token: string): void => {
  // Set cookie with 7 days expiration, accessible across all paths
  Cookies.set(TOKEN_KEY, token, {
    expires: SESSION_DAYS,
    path: '/',
    secure: process.env.NODE_ENV === 'production', // Only secure in production
    sameSite: 'strict' // CSRF protection
  })
}

/**
 * Removes the authentication token from cookies.
 */
export const removeToken = (): void => {
  Cookies.remove(TOKEN_KEY, { path: '/' })
}

/**
 * Removes the authentication user from cookies.
 */
export const removeUser = (): void => {
  Cookies.remove(USER_KEY, { path: '/' })
}

/**
 * Checks if a JWT is expired.
 * @param {string} token - The JWT to check.
 * @returns {boolean} True if the token is expired, false otherwise.
 */
export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded: { exp: number } = jwtDecode(token)
    // The 'exp' claim is in seconds, so we multiply by 1000 to compare with Date.now() in milliseconds.
    return decoded.exp * 1000 < Date.now()
  } catch (error) {
    // If the token is malformed or invalid, treat it as expired.
    console.error('Failed to decode token:', error)
    return true
  }
}
