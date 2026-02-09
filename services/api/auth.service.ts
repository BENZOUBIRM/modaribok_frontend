/**
 * ──────────────────────────────────────────────────────────────
 * Auth Service — Modaribok
 * ──────────────────────────────────────────────────────────────
 * All authentication-related API calls live here.
 *
 *  • login   — POST /auth/login   (JSON body)
 *  • signup  — POST /auth/signup  (JSON body, snake_case fields)
 *  • logout  — POST /auth/logout  (Bearer token)
 *
 * The JWT token is returned in the `Authorization` response header
 * and is persisted via the token helpers in `client.ts`.
 * User data is managed entirely on the frontend (localStorage).
 */

import { isAxiosError } from "axios"
import apiClient, { setToken, removeToken, setStoredUser } from "./client"
import type {
  LoginRequest,
  LoginResponse,
  SignupData,
  LoginResult,
  SignupResult,
} from "@/types/auth"

/* ──────────────── Login ──────────────── */

/**
 * Authenticate with email/phone + password.
 *
 * On success the backend returns:
 *  - Body:   { status, code, data: User }
 *  - Header: Authorization: Bearer <token>
 *
 * The token is extracted from the header and stored in localStorage.
 */
export async function login(data: LoginRequest): Promise<LoginResult> {
  try {
    const response = await apiClient.post<LoginResponse>("/auth/login", data)

    // Extract token from the Authorization header
    const authHeader = response.headers["authorization"] || response.headers["Authorization"]
    if (authHeader) {
      // Strip "Bearer " prefix if present
      const token = authHeader.startsWith("Bearer ")
        ? authHeader.slice(7)
        : authHeader
      setToken(token)
    }

    // Persist user data so session survives page refresh
    setStoredUser(response.data.data)

    return {
      success: true,
      user: response.data.data,
    }
  } catch (error: unknown) {
    return handleAuthError(error)
  }
}

/* ──────────────── Signup ──────────────── */

/**
 * Register a new account.
 *
 * Sends multipart/form-data as expected by the Spring Boot backend:
 *  - Part "signupRequest": JSON blob with snake_case fields
 *  - Part "profileImage":  optional profile image file
 *
 * Phone is formatted with "+" prefix if not already present.
 */
export async function signup(
  data: SignupData,
  profileImage?: File | null,
): Promise<SignupResult> {
  try {
    // Format phone number with + prefix if not already present
    const formattedPhone = data.phone.startsWith("+")
      ? data.phone
      : `+${data.phone.replace(/\D/g, "")}`

    const signupRequest = {
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      phone: formattedPhone,
      password: data.password,
    }

    // Build multipart/form-data with a JSON part + optional image
    const formData = new FormData()
    formData.append(
      "user",
      new Blob([JSON.stringify(signupRequest)], { type: "application/json" }),
    )
    if (profileImage) {
      formData.append("profileImage", profileImage)
    }

    // Do NOT set Content-Type — let the browser set
    // multipart/form-data with the correct boundary automatically.
    const response = await apiClient.post("/auth/signup", formData, {
      headers: { "Content-Type": undefined },
    })

    return {
      success: true,
      data: response.data,
    }
  } catch (error: unknown) {
    return handleAuthError(error)
  }
}

/* ──────────────── Logout ──────────────── */

/**
 * Log out the current user.
 * Calls POST /auth/logout on the backend to invalidate the session,
 * then removes the stored JWT and user data from localStorage.
 */
export async function logout(): Promise<{ success: boolean; code?: string }> {
  try {
    await apiClient.post("/auth/logout")
    return { success: true, code: "AUTH_LOGOUT_SUCCESS_013" }
  } catch {
    // Even if the server call fails, still clear local data
    return { success: false }
  } finally {
    removeToken()
  }
}

/* ──────────────── Error Handler ──────────────── */

/**
 * Normalize API errors into a consistent shape.
 * Maps Axios error responses → { success: false, error, code }.
 */
function handleAuthError(error: unknown): { success: false; error: string; code?: string } {
  if (isAxiosError(error) && error.response) {
    const { data, status } = error.response

    return {
      success: false,
      error: data?.message || `Request failed with status ${status}`,
      code: data?.code,
    }
  }

  // Network error or something unexpected
  return {
    success: false,
    error: "networkError",
    code: "NETWORK_ERROR",
  }
}
