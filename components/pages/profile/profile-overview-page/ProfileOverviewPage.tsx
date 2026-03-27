"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"

import { useAuth } from "@/providers/auth-provider"
import { useDictionary } from "@/providers/dictionary-provider"
import { useNavRouter } from "@/hooks/use-nav-router"
import { Spinner } from "@/components/ui/spinner"
import { ProfileViews } from "./ProfileViews"

export function ProfileOverviewPage() {
  const { lang } = useDictionary()
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useNavRouter()
  const searchParams = useSearchParams()

  const rawType = searchParams.get("type")
  const profileType = rawType === "store" || rawType === "coach" ? rawType : "user"

  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(`/${lang}/login`)
    }
  }, [isAuthenticated, isLoading, lang, router])

  if (isLoading || !isAuthenticated || !user) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <Spinner className="size-10" />
      </div>
    )
  }

  const displayName = `${user.firstName} ${user.lastName}`
  const handle = `@${user.firstName.toLowerCase()}${user.lastName.toLowerCase()}`
  const avatarUrl = user.profileImageUrl || "/images/default-user.jpg"

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      <ProfileViews
        lang={lang}
        profileType={profileType}
        displayName={displayName}
        handle={handle}
        avatarUrl={avatarUrl}
          userRole={user.role}
      />
    </div>
  )
}
