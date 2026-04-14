"use client"

import * as React from "react"

import { useAuth } from "@/providers/auth-provider"
import { useDictionary } from "@/providers/dictionary-provider"
import { useNavRouter } from "@/hooks/use-nav-router"
import { followService, profileStatsService } from "@/services/api"
import * as profileService from "@/services/api/profile.service"
import type { OtherUserProfile } from "@/types"
import { Spinner } from "@/components/ui/spinner"
import { Callout } from "@/components/ui/callout"

import { ProfileViews } from "./ProfileViews"

interface OtherUserProfilePageProps {
  targetUserId: number | string
}

type OtherUserProfileStats = {
  posts: number
  followers: number
  following: number
}

const EMPTY_STATS: OtherUserProfileStats = {
  posts: 0,
  followers: 0,
  following: 0,
}

type FollowState = "follow" | "following" | "requested"

function getPendingFollowStorageKey(currentUserId: number, targetUserId: number): string {
  return `modaribok:follow:pending:${currentUserId}:${targetUserId}`
}

function readPendingFollowFlag(currentUserId: number, targetUserId: number): boolean {
  if (typeof window === "undefined") {
    return false
  }

  return window.localStorage.getItem(getPendingFollowStorageKey(currentUserId, targetUserId)) === "1"
}

function writePendingFollowFlag(currentUserId: number, targetUserId: number, isPending: boolean): void {
  if (typeof window === "undefined") {
    return
  }

  const key = getPendingFollowStorageKey(currentUserId, targetUserId)
  if (isPending) {
    window.localStorage.setItem(key, "1")
    return
  }

  window.localStorage.removeItem(key)
}

function formatSimpleDate(value?: string | null): string {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  const day = String(date.getDate()).padStart(2, "0")
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const year = date.getFullYear()

  return `${day}-${month}-${year}`
}

function buildDisplayName(profile: OtherUserProfile, lang: "ar" | "en"): string {
  const fullName = `${profile.firstName ?? ""} ${profile.lastName ?? ""}`.trim()
  if (fullName) return fullName

  return lang === "ar" ? "مستخدم" : "User"
}

function buildHandle(profile: OtherUserProfile, fallbackUserId: number | string): string {
  const handleRaw = `${profile.firstName ?? ""}${profile.lastName ?? ""}`
    .replace(/\s+/g, "")
    .toLowerCase()

  if (handleRaw) {
    return `@${handleRaw}`
  }

  return `@user${String(fallbackUserId)}`
}

function parseNumericUserId(value: number | string): number | null {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return value
  }

  if (typeof value === "string") {
    const parsed = Number(value)
    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed
    }
  }

  return null
}

function buildAboutText(profile: OtherUserProfile, lang: "ar" | "en"): string {
  const details: string[] = []
  const cityCountry = [profile.city, profile.country].filter(Boolean).join(" / ")

  if (cityCountry) {
    details.push(`${lang === "ar" ? "المدينة/الدولة" : "City/Country"}: ${cityCountry}`)
  }

  if (profile.gender) {
    details.push(`${lang === "ar" ? "الجنس" : "Gender"}: ${profile.gender}`)
  }

  if (profile.birthday) {
    details.push(`${lang === "ar" ? "تاريخ الميلاد" : "Birthday"}: ${formatSimpleDate(profile.birthday)}`)
  }

  if (profile.createdAt) {
    details.push(`${lang === "ar" ? "عضو منذ" : "Member since"}: ${formatSimpleDate(profile.createdAt)}`)
  }

  const sportsNames = (profile.sports ?? [])
    .map((sport) => (lang === "ar" ? sport.nameAr : sport.nameEn))
    .filter(Boolean)

  if (sportsNames.length > 0) {
    details.push(`${lang === "ar" ? "الرياضات" : "Sports"}: ${sportsNames.join(lang === "ar" ? "، " : ", ")}`)
  }

  const postsCount =
    profile.postsCount
    ?? profile.publicationsCount
    ?? (Array.isArray(profile.publications) ? profile.publications.length : 0)

  if (postsCount > 0) {
    details.push(`${lang === "ar" ? "المنشورات" : "Publications"}: ${postsCount}`)
  }

  if (!details.length) {
    return lang === "ar"
      ? "لا توجد معلومات إضافية ظاهرة لهذا الملف الشخصي حالياً."
      : "No additional profile details are visible right now."
  }

  return details.join(lang === "ar" ? " | " : " • ")
}

function resolveProfileStats(profile: OtherUserProfile): OtherUserProfileStats {
  return {
    posts: Math.max(
      0,
      profile.postsCount
      ?? profile.publicationsCount
      ?? (Array.isArray(profile.publications) ? profile.publications.length : 0),
    ),
    followers: Math.max(0, profile.followersCount ?? 0),
    following: Math.max(0, profile.followingCount ?? 0),
  }
}

export function OtherUserProfilePage({ targetUserId }: OtherUserProfilePageProps) {
  const { lang } = useDictionary()
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useNavRouter()
  const normalizedTargetUserId = React.useMemo(
    () => parseNumericUserId(targetUserId),
    [targetUserId],
  )

  const [profile, setProfile] = React.useState<OtherUserProfile | null>(null)
  const [stats, setStats] = React.useState<OtherUserProfileStats>(EMPTY_STATS)
  const [followState, setFollowState] = React.useState<FollowState>("follow")
  const [isFollowBusy, setIsFollowBusy] = React.useState(false)
  const [isFetching, setIsFetching] = React.useState(true)
  const [errorCode, setErrorCode] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(`/${lang}/login`)
    }
  }, [isAuthenticated, isLoading, lang, router])

  React.useEffect(() => {
    if (!isLoading && isAuthenticated && normalizedTargetUserId !== null && user?.id === normalizedTargetUserId) {
      router.replace(`/${lang}/profile`)
    }
  }, [isAuthenticated, isLoading, lang, normalizedTargetUserId, router, user?.id])

  React.useEffect(() => {
    let isMounted = true

    const loadProfile = async () => {
      if (
        !isAuthenticated
        || !String(targetUserId).trim()
        || (normalizedTargetUserId !== null && user?.id === normalizedTargetUserId)
      ) {
        setStats(EMPTY_STATS)
        setFollowState("follow")
        setIsFetching(false)
        return
      }

      setIsFetching(true)
      setErrorCode(null)

      const result = await profileService.getUserProfileById(targetUserId)

      if (!isMounted) {
        return
      }

      if (!result.success || !result.data) {
        setProfile(null)
        setStats(EMPTY_STATS)
        setFollowState("follow")
        setErrorCode(result.code ?? "NETWORK_ERROR")
        setIsFetching(false)
        return
      }

      const fallbackStats = resolveProfileStats(result.data)
      const resolvedStats = normalizedTargetUserId
        ? await profileStatsService.getUserProfileStats(normalizedTargetUserId, fallbackStats)
        : fallbackStats

      if (!isMounted) {
        return
      }

      const isFollowing = normalizedTargetUserId && user?.id
        ? await followService.isFollowingUser(user.id, normalizedTargetUserId)
        : false

      if (!isMounted) {
        return
      }

      const isPendingFollow = normalizedTargetUserId && user?.id
        ? readPendingFollowFlag(user.id, normalizedTargetUserId)
        : false

      setProfile(result.data)
      setStats(resolvedStats)
      setFollowState(isFollowing ? "following" : isPendingFollow ? "requested" : "follow")
      setIsFetching(false)
    }

    loadProfile()

    return () => {
      isMounted = false
    }
  }, [isAuthenticated, normalizedTargetUserId, targetUserId, user?.id])

  const handleToggleFollow = async () => {
    if (!normalizedTargetUserId || !profile || !user?.id || isFollowBusy) {
      return
    }

    setIsFollowBusy(true)

    const previousState = followState
    const previousStats = stats
    const refreshStatsFromBackend = async () => {
      const fallbackStats = resolveProfileStats(profile)
      const refreshed = await profileStatsService.getUserProfileStats(normalizedTargetUserId, fallbackStats)
      setStats(refreshed)
    }

    if (followState === "following") {
      const result = await followService.unfollowUser(normalizedTargetUserId)
      if (!result.success) {
        setFollowState(previousState)
        setStats(previousStats)
        setIsFollowBusy(false)
        return
      }

      writePendingFollowFlag(user.id, normalizedTargetUserId, false)
      setFollowState("follow")
      await refreshStatsFromBackend()

      setIsFollowBusy(false)
      return
    }

    if (followState === "requested") {
      const result = await followService.unfollowUser(normalizedTargetUserId)
      if (!result.success) {
        setFollowState(previousState)
        setStats(previousStats)
        setIsFollowBusy(false)
        return
      }

      writePendingFollowFlag(user.id, normalizedTargetUserId, false)
      setFollowState("follow")
      await refreshStatsFromBackend()

      setIsFollowBusy(false)
      return
    }

    const result = await followService.followUser(normalizedTargetUserId)
    if (!result.success) {
      setFollowState(previousState)
      setStats(previousStats)
      setIsFollowBusy(false)
      return
    }

    if (result.data?.status === "PENDING") {
      writePendingFollowFlag(user.id, normalizedTargetUserId, true)
      setFollowState("requested")
      await refreshStatsFromBackend()
      setIsFollowBusy(false)
      return
    }

    writePendingFollowFlag(user.id, normalizedTargetUserId, false)
    setFollowState("following")
    await refreshStatsFromBackend()

    setIsFollowBusy(false)
  }

  if (
    isLoading
    || !isAuthenticated
    || (isAuthenticated && normalizedTargetUserId !== null && user?.id === normalizedTargetUserId)
    || isFetching
  ) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <Spinner className="size-10" />
      </div>
    )
  }

  if (errorCode || !profile) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-6">
        <Callout variant="error" title={lang === "ar" ? "تعذر تحميل الملف الشخصي" : "Unable to load profile"}>
          {errorCode ?? (lang === "ar" ? "لم يتم العثور على بيانات الملف الشخصي." : "No profile data found.")}
        </Callout>
      </div>
    )
  }

  const displayName = buildDisplayName(profile, lang)
  const handle = buildHandle(profile, targetUserId)
  const avatarUrl = profile.profileImageUrl || profile.profilePicture || profile.profilePictureUrl || "/images/default-user.jpg"
  const aboutText = buildAboutText(profile, lang)

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      <ProfileViews
        lang={lang}
        profileType="user"
        displayName={displayName}
        handle={handle}
        avatarUrl={avatarUrl}
        userRole="USER"
        userId={profile.id}
        isOwnProfile={false}
        aboutText={aboutText}
        stats={stats}
        followState={followState}
        isFollowBusy={isFollowBusy}
        onToggleFollow={handleToggleFollow}
      />
    </div>
  )
}
