"use client"

import { useRouter } from "next/navigation"
import { useDictionary } from "@/providers/dictionary-provider"
import { useAuth } from "@/providers/auth-provider"

/**
 * Admin Dashboard — placeholder page.
 *
 * Redirects non-admin users back to the home page.
 * The full dashboard UI will be built here incrementally.
 */
export default function DashboardPage() {
  const { dictionary, lang } = useDictionary()
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-muted-foreground text-lg">{dictionary.common.loading}</div>
      </div>
    )
  }

  // Not authenticated or not admin → redirect home
  if (!isAuthenticated || !user || user.role !== "ADMIN") {
    router.replace(`/${lang}`)
    return null
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-6">
      <div className="w-full max-w-2xl space-y-6 text-center">
        <h1 className="text-3xl font-bold text-foreground">
          {dictionary.navbar.welcome}, {user.firstName}
        </h1>
        <p className="text-muted-foreground">
          Admin Dashboard — Coming soon
        </p>
        <div className="rounded-xl border border-border bg-card p-6 space-y-3">
          <p className="text-sm text-muted-foreground">{user.email}</p>
          <span className="inline-block text-xs font-medium bg-primary/10 text-primary px-2.5 py-1 rounded-full">
            {user.role}
          </span>
        </div>
      </div>
    </div>
  )
}
