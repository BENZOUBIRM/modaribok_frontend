"use client"

import { useEffect, useRef } from "react"
import { useRouter, useParams, useSearchParams } from "next/navigation"
import { useAuth } from "@/providers/auth-provider"
import { Spinner } from "@/components/ui/spinner"

/**
 * OAuth2 Callback Page
 * ────────────────────
 * The Spring Boot backend redirects here after a successful
 * Google OAuth2 login with two query parameters:
 *
 *   ?token=<JWT>&user=<Base64-encoded JSON user object>
 *
 * This page reads both, stores them via the auth provider,
 * and redirects the user to the home page.
 */
export default function OAuth2CallbackPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const { loginWithOAuth2 } = useAuth()
  const processed = useRef(false)

  const lang = (params.lang as string) || "en"

  useEffect(() => {
    // Guard against double-processing in React StrictMode
    if (processed.current) return
    processed.current = true

    const token = searchParams.get("token")
    const userBase64 = searchParams.get("user")

    if (!token) {
      // No token → something went wrong, redirect to login
      router.replace(`/${lang}/login`)
      return
    }

    try {
      // Decode user data from Base64
      const userJson = userBase64 ? atob(userBase64) : null
      const user = userJson ? JSON.parse(userJson) : null

      // Store token + user in localStorage and update auth state
      loginWithOAuth2(token, user)

      // Redirect to home
      router.replace(`/${lang}`)
    } catch {
      // Decoding/parsing failed → redirect to login
      router.replace(`/${lang}/login`)
    }
  }, [searchParams, router, lang, loginWithOAuth2])

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Spinner className="size-8" />
        <p className="text-muted-foreground text-sm">Signing you in…</p>
      </div>
    </div>
  )
}
