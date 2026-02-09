/**
 * ──────────────────────────────────────────────────────────────
 * API Client — Modaribok
 * ──────────────────────────────────────────────────────────────
 * Pre-configured Axios instance that:
 *  • Points to the Spring Boot backend (http://localhost:8081/api)
 *  • Attaches the JWT token from localStorage on every request
 *  • Exposes helpers to read / clear the stored token
 */

import axios from "axios"

/* ──────────────── Constants ──────────────── */

/** Base URL for all API calls */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081/api"

/** Key used in localStorage to persist the JWT */
const TOKEN_KEY = "modaribok_token"

/** Key used in localStorage to persist the user data */
const USER_KEY = "modaribok_user"

/* ──────────────── Axios Instance ──────────────── */

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  // Allow the Authorization header to be read from the response
  // (CORS must also expose it on the backend)
})

/* ──────────────── Request Interceptor ──────────────── */

/**
 * Attach the stored JWT token to every outgoing request
 * so protected endpoints receive it automatically.
 */
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem(TOKEN_KEY)
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => Promise.reject(error),
)

/* ──────────────── Response Interceptor ──────────────── */

/**
 * Global response error handler.
 * 401 errors are handled by the auth provider bootstrap logic,
 * not here — so we don't aggressively clear the token on every 401.
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error)
  },
)

/* ──────────────── Token Helpers ──────────────── */

/** Persist token to localStorage */
export function setToken(token: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(TOKEN_KEY, token)
  }
}

/** Retrieve the stored token (or null) */
export function getToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem(TOKEN_KEY)
  }
  return null
}

/** Remove the stored token */
export function removeToken(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  }
}

/** Persist user data to localStorage */
export function setStoredUser(user: unknown): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  }
}

/** Retrieve the stored user (or null) */
export function getStoredUser<T>(): T | null {
  if (typeof window !== "undefined") {
    const raw = localStorage.getItem(USER_KEY)
    if (raw) {
      try {
        return JSON.parse(raw) as T
      } catch {
        return null
      }
    }
  }
  return null
}

/* ──────────────── Export ──────────────── */

export default apiClient
