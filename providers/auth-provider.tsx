/**
 * ──────────────────────────────────────────────────────────────
 * Auth Provider — Modaribok
 * ──────────────────────────────────────────────────────────────
 * React context that manages the global authentication state:
 *
 *  • On mount it restores user & token from localStorage.
 *  • No backend /auth/me endpoint is called — state is fully
 *    managed on the frontend.
 *  • Exposes login / signup / logout actions to any consumer.
 *  • Provides `isAuthenticated`, `isLoading`, `user` flags.
 *
 * Usage:
 *   const { user, login, logout } = useAuth()
 */

"use client"

import * as React from "react"
import { authService } from "@/services/api"
import { getToken, getStoredUser, setStoredUser } from "@/services/api/client"
import type {
  AuthContextValue,
  LoginRequest,
  LoginResult,
  SignupRequest,
  SignupResult,
  User,
} from "@/types/auth"

/* ──────────────── Context ──────────────── */

const AuthContext = React.createContext<AuthContextValue | null>(null)

/* ──────────────── Provider ──────────────── */

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = React.useState<User | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)

  const isAuthenticated = !!user

  /* ── Bootstrap: restore session from localStorage on mount ── */
  // useLayoutEffect runs synchronously BEFORE browser paint,
  // so the user never sees the wrong layout flash.
  React.useLayoutEffect(() => {
    const token = getToken()
    if (token) {
      const storedUser = getStoredUser<User>()
      if (storedUser) {
        setUser(storedUser)
      }
    }
    setIsLoading(false)
  }, [])

  /* ── Login ── */
  const login = React.useCallback(
    async (data: LoginRequest): Promise<LoginResult> => {
      const result = await authService.login(data)
      if (result.success && result.user) {
        setUser(result.user)
        setStoredUser(result.user)
      }
      return result
    },
    [],
  )

  /* ── Signup ── */
  const signup = React.useCallback(
    async (data: SignupRequest): Promise<SignupResult> => {
      const result = await authService.signup(
        {
          first_name: data.firstName,
          last_name: data.lastName,
          email: data.email,
          phone: data.phone,
          password: data.password,
        },
        data.profileImage,
      )
      // After signup the user needs to log in separately,
      // so we don't auto-set user here.
      return result
    },
    [],
  )

  /* ── Logout ── */
  const logout = React.useCallback(async () => {
    await authService.logout()
    setUser(null)
  }, [])

  /* ── Context value (stable reference) ── */
  const value = React.useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated,
      login,
      signup,
      logout,
    }),
    [user, isLoading, isAuthenticated, login, signup, logout],
  )

  // Don't render children until auth state is resolved —
  // prevents the unauthenticated layout from flashing.
  if (isLoading) {
    return <AuthContext.Provider value={value}>{null}</AuthContext.Provider>
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/* ──────────────── Hook ──────────────── */

/**
 * Access the auth context from any client component.
 * Must be used inside <AuthProvider>.
 */
export function useAuth(): AuthContextValue {
  const context = React.useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an <AuthProvider>")
  }
  return context
}
