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
import { getCodeConfig } from "@/lib/error-codes"
import { showApiToast } from "@/lib/api-toast"

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
 * Global response handler.
 *
 * Success path: if the response body contains a `code` and the code
 * is configured for auto-toasting, show the toast.
 *
 * Error path: extract `code` from the error body and auto-toast.
 * Network errors (no response) show a NETWORK_ERROR toast.
 *
 * Set `_skipToast: true` on the request config to suppress.
 */
apiClient.interceptors.response.use(
  (response) => {
    const code = response.data?.code as string | undefined
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const skip = (response.config as any)?._skipToast === true

    if (code && !skip) {
      const cfg = getCodeConfig(code)
      if (cfg.autoToast) {
        showApiToast(code)
      }
    }
    return response
  },
  (error) => {
    if (axios.isAxiosError(error)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const skip = (error.config as any)?._skipToast === true

      if (!skip) {
        const code = error.response?.data?.code as string | undefined
        if (code) {
          const cfg = getCodeConfig(code)
          if (cfg.autoToast) {
            showApiToast(code)
          }
        } else {
          // Network error — no response at all
          showApiToast("NETWORK_ERROR")
        }
      }
    }
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
