"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"

import { useDictionary } from "@/providers/dictionary-provider"
import { useAuth } from "@/providers/auth-provider"
import { Callout } from "@/components/ui/callout"

/**
 * Home page content — shows different UI depending on auth state.
 *
 * When the user arrives from signup (?signup=success) an extra Callout
 * appears temporarily to confirm the account was created.
 */
function HomePage() {
  const { dictionary, lang } = useDictionary()
  const { user, isAuthenticated, isLoading } = useAuth()
  const searchParams = useSearchParams()
  const t = dictionary.home

  // Check if the user just signed up (query string flag from signup redirect)
  const justSignedUp = searchParams.get("signup") === "success"
  const [showSignupBanner, setShowSignupBanner] = React.useState(justSignedUp)

  // Auto-dismiss the signup banner after 6 seconds
  React.useEffect(() => {
    if (showSignupBanner) {
      const timer = setTimeout(() => setShowSignupBanner(false), 6000)
      return () => clearTimeout(timer)
    }
  }, [showSignupBanner])

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-muted-foreground text-lg">{dictionary.common.loading}</div>
      </div>
    )
  }

  // Authenticated view
  if (isAuthenticated && user) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-6">
        <div className="w-full max-w-lg space-y-6">
          {/* Login success callout */}
          <Callout variant="success" title={t.welcomeTitle}>
            {t.welcomeSubtitle}
          </Callout>

          {/* User info card */}
          <div className="rounded-xl border border-border bg-card p-6 space-y-3">
            <h2 className="text-lg font-semibold text-foreground">
              {user.firstName} {user.lastName}
            </h2>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            {user.phone && (
              <p className="text-sm text-muted-foreground">{user.phone}</p>
            )}
            <span className="inline-block text-xs font-medium bg-primary/10 text-primary px-2.5 py-1 rounded-full">
              {user.role}
            </span>
          </div>
        </div>
      </div>
    )
  }

  // Guest view
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-6">
      <div className="w-full max-w-lg space-y-6">
        {/* Signup success banner (shown temporarily after redirect from signup) */}
        {showSignupBanner && (
          <Callout variant="success" title={t.signupSuccess}>
            {t.signupSuccess}
          </Callout>
        )}

        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground">
            {dictionary.common.appName}
          </h1>
          <p className="text-muted-foreground text-lg">
            {lang === "ar"
              ? "رحلتك الرياضية تبدأ هنا"
              : "Your sports journey starts here"}
          </p>
        </div>
      </div>
    </div>
  )
}

export { HomePage }
