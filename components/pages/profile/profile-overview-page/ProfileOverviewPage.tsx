"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"

import { useAuth } from "@/providers/auth-provider"
import { useDictionary } from "@/providers/dictionary-provider"
import { useNavRouter } from "@/hooks/use-nav-router"
import { profileStatsService } from "@/services/api"
import { Spinner } from "@/components/ui/spinner"
import { ProfileViews } from "./ProfileViews"

const EMPTY_STATS: profileStatsService.UserProfileStats = {
  posts: 0,
  followers: 0,
  following: 0,
}

export function ProfileOverviewPage() {
  const { lang } = useDictionary()
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useNavRouter()
  const searchParams = useSearchParams()
  const [stats, setStats] = React.useState<profileStatsService.UserProfileStats>(EMPTY_STATS)

  const rawType = searchParams.get("type")
  const profileType = rawType === "store" || rawType === "coach" ? rawType : "user"

  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(`/${lang}/login`)
    }
  }, [isAuthenticated, isLoading, lang, router])

  React.useEffect(() => {
    let isMounted = true

    const loadStats = async () => {
      if (!isAuthenticated || !user?.id) {
        if (isMounted) {
          setStats(EMPTY_STATS)
        }
        return
      }

      const resolvedStats = await profileStatsService.getUserProfileStats(user.id, EMPTY_STATS)

      if (!isMounted) {
        return
      }

      setStats(resolvedStats)
    }

    loadStats()

    return () => {
      isMounted = false
    }
  }, [isAuthenticated, user?.id])

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
        userId={user.id}
        stats={stats}
      />
    </div>
  )
}
