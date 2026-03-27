"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"

import { useDictionary } from "@/providers/dictionary-provider"
import { useAuth } from "@/providers/auth-provider"
import { Callout } from "@/components/ui/callout"
import { Spinner } from "@/components/ui/spinner"
import { CreatePublication } from "@/components/features/publication"
import { PublicationFeed } from "@/components/features/publication"
import { MobileSearchBar } from "@/components/features/search"

/**
 * Home page content — shows different UI depending on auth state.
 *
 * Authenticated: Social feed with publication composer + posts + suggestions.
 * Guest: Landing page with app name + tagline.
 */
function HomePage() {
  const { dictionary } = useDictionary()
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
        <Spinner className="size-10" />
      </div>
    )
  }

  // Authenticated view — Social feed
  if (isAuthenticated && user) {
    return (
      <div className="max-w-2xl lg:max-w-4xl xl:max-w-5xl 2xl:max-w-6xl mx-auto py-6 px-4 space-y-4">
        {/* Mobile search bar — visible only below sm (when navbar search is hidden) */}
        <MobileSearchBar />
        <CreatePublication />
        <PublicationFeed />
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
            {t.tagline}
          </p>
        </div>
      </div>
    </div>
  )
}

export { HomePage }
