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
import {
  AUTH_FORCE_LOGOUT_EVENT,
  getToken,
  getStoredUser,
  removeToken,
  setStoredUser,
  setToken,
} from "@/services/api/client"
import type {
  AuthContextValue,
  LoginRequest,
  LoginResult,
  SignupRequest,
  SignupResult,
  User,
} from "@/types/auth"

function resolveLoginPath(pathname: string): string {
  const firstSegment = pathname.split("/").filter(Boolean)[0]
  const locale = firstSegment === "ar" || firstSegment === "en"
    ? firstSegment
    : "en"

  return `/${locale}/login`
}

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

  React.useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    const handleForcedLogout = () => {
      removeToken()
      setUser(null)

      const loginPath = resolveLoginPath(window.location.pathname)
      const normalizedPath =
        window.location.pathname.length > 1 && window.location.pathname.endsWith("/")
          ? window.location.pathname.slice(0, -1)
          : window.location.pathname

      if (normalizedPath !== loginPath) {
        window.location.replace(loginPath)
      }
    }

    window.addEventListener(AUTH_FORCE_LOGOUT_EVENT, handleForcedLogout)
    return () => {
      window.removeEventListener(AUTH_FORCE_LOGOUT_EVENT, handleForcedLogout)
    }
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

  /* ── OAuth2 callback ── */
  const loginWithOAuth2 = React.useCallback(
    (token: string, userData: User | null) => {
      setToken(token)
      if (userData) {
        setUser(userData)
        setStoredUser(userData)
      }
    },
    [],
  )

  /* ── Context value (stable reference) ── */
  const value = React.useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated,
      login,
      signup,
      loginWithOAuth2,
      logout,
    }),
    [user, isLoading, isAuthenticated, login, signup, loginWithOAuth2, logout],
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
