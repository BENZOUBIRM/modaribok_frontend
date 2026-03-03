"use client"

import { useEffect, useRef } from "react"
import { useRouter, useParams, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { useAuth } from "@/providers/auth-provider"
import { useDictionary } from "@/providers/dictionary-provider"
import { extractUserFromJwt } from "@/lib/jwt"
import { Spinner } from "@/components/ui/spinner"

/**
 * OAuth2 Callback Page (alternate path)
 * ──────────────────────────────────────
 * Mirror of /[lang]/auth/callback for the /oauth2/callback route.
 *
 * The Spring Boot backend redirects here after a Google OAuth2
 * login attempt with two possible outcomes:
 *
 *   Success → ?status=success&token=<JWT>
 *   Error   → ?status=error&message=<error_code>
 */
export default function OAuth2CallbackPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const { loginWithOAuth2 } = useAuth()
  const { dictionary } = useDictionary()
  const processed = useRef(false)

  const lang = (params.lang as string) || "en"

  useEffect(() => {
    // Guard against double-processing in React StrictMode
    if (processed.current) return
    processed.current = true

    const status = searchParams.get("status")
    const token = searchParams.get("token")
    const errorMessage = searchParams.get("message")

    // ── Error from backend ──
    if (status === "error" || (!token && errorMessage)) {
      const errorKey = errorMessage || "unknown"
      const t = dictionary.auth.oauth2Errors
      const message =
        (t as Record<string, string>)[errorKey] ?? t.generic
      toast.error(message)
      router.replace(`/${lang}/login`)
      return
    }

    // ── No token at all ──
    if (!token) {
      toast.error(dictionary.auth.oauth2Errors.generic)
      router.replace(`/${lang}/login`)
      return
    }

    // ── Success: decode JWT & hydrate auth state ──
    try {
      const user = extractUserFromJwt(token)

      // Store token + user in localStorage and update auth state
      loginWithOAuth2(token, user)

      // Redirect admins to dashboard, others to home
      if (user?.role === "ADMIN") {
        router.replace(`/${lang}/dashboard`)
      } else {
        router.replace(`/${lang}`)
      }
    } catch {
      toast.error(dictionary.auth.oauth2Errors.generic)
      router.replace(`/${lang}/login`)
    }
  }, [searchParams, router, lang, loginWithOAuth2, dictionary])

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Spinner className="size-8" />
        <p className="text-muted-foreground text-sm">{dictionary.common.signingIn}</p>
      </div>
    </div>
  )
}
