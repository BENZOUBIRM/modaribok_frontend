/**
 * ──────────────────────────────────────────────────────────────
 * Auth Types — Modaribok
 * ──────────────────────────────────────────────────────────────
 * Type definitions for authentication requests, responses, and
 * the user model returned by the Spring Boot backend.
 */

/* ──────────────── User Model ──────────────── */

/** Roles supported by the backend */
export type UserRole = "ADMIN" | "USER"

/** User object returned from the API */
export interface User {
  id: number
  firstName: string
  lastName: string
  email: string
  phone: string
  role: UserRole
  profileImageUrl: string | null
}

/* ──────────────── Login ──────────────── */

/** POST /auth/login — request body */
export interface LoginRequest {
  emailOrPhone: string
  password: string
}

/** POST /auth/login — response body */
export interface LoginResponse {
  status: string      // "success"
  code: string        // e.g. "AUTH_SUCCESS_000"
  data: User
}

/* ──────────────── Signup ──────────────── */

/** POST /auth/signup — request body (snake_case, matches backend) */
export interface SignupData {
  first_name: string
  last_name: string
  email: string
  phone: string
  password: string
}

/** POST /auth/signup — request from the frontend form (camelCase) */
export interface SignupRequest {
  firstName: string
  lastName: string
  email: string
  phone: string
  password: string
  profileImage?: File | null
}

/** POST /auth/signup — response body */
export interface SignupResponse {
  status: string
  code: string
  data: User | null
}

/* ──────────────── Generic API Error ──────────────── */

/** Standard error shape returned by the backend */
export interface ApiError {
  status: string      // "error"
  code: string        // e.g. "AUTH_ERROR_001"
  message: string     // human-readable (English)
}

/* ──────────────── Auth Context ──────────────── */

/** State & actions exposed by the AuthProvider */
export interface AuthContextValue {
  /** Currently authenticated user, or null */
  user: User | null
  /** True while checking initial auth state (token in storage) */
  isLoading: boolean
  /** True after successful login / token validation */
  isAuthenticated: boolean
  /** Log in with email/phone + password */
  login: (data: LoginRequest) => Promise<LoginResult>
  /** Create a new account */
  signup: (data: SignupRequest) => Promise<SignupResult>
  /** Clear token & user state */
  logout: () => Promise<void>
}

/** Result returned by the login action */
export interface LoginResult {
  success: boolean
  user?: User
  error?: string
  /** Backend error code for i18n mapping */
  code?: string
}

/** Result returned by the signup action */
export interface SignupResult {
  success: boolean
  data?: unknown
  error?: string
  code?: string
}
