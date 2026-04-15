"use client"

import * as React from "react"
import Image from "next/image"
import { Icon } from "@iconify/react"

import { profileService } from "@/services/api"
import { useDictionary } from "@/providers/dictionary-provider"
import type { OtherUserProfile } from "@/types"
import { cn } from "@/lib/utils"
import { Spinner } from "@/components/ui/spinner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/primitives/dialog"

import type { OtherUserProfileModalProps } from "./OtherUserProfileModal.types"

function formatBirthday(value?: string | null): string {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  const day = String(date.getDate()).padStart(2, "0")
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const year = date.getFullYear()

  return `${day}-${month}-${year}`
}

function formatMemberSince(value?: string | null): string {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  const day = String(date.getDate()).padStart(2, "0")
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const year = date.getFullYear()

  return `${day}-${month}-${year}`
}

function buildDisplayName(profile: OtherUserProfile | null, fallback?: string): string {
  if (profile) {
    const fullName = `${profile.firstName ?? ""} ${profile.lastName ?? ""}`.trim()
    if (fullName) {
      return fullName
    }
  }

  return fallback || "User"
}

export function OtherUserProfileModal({
  open,
  userId,
  fallbackAvatarUrl,
  fallbackDisplayName,
  onOpenChange,
}: OtherUserProfileModalProps) {
  const { isRTL, lang } = useDictionary()
  const [isLoading, setIsLoading] = React.useState(false)
  const [errorCode, setErrorCode] = React.useState<string | null>(null)
  const [profile, setProfile] = React.useState<OtherUserProfile | null>(null)

  React.useEffect(() => {
    let isMounted = true

    const loadProfile = async () => {
      if (!open || !userId) {
        return
      }

      setIsLoading(true)
      setErrorCode(null)

      const result = await profileService.getUserProfileById(userId)

      if (!isMounted) {
        return
      }

      if (!result.success || !result.data) {
        setProfile(null)
        setErrorCode(result.code ?? "NETWORK_ERROR")
        setIsLoading(false)
        return
      }

      setProfile(result.data)
      setIsLoading(false)
    }

    loadProfile()

    return () => {
      isMounted = false
    }
  }, [open, userId])

  const text = React.useMemo(
    () => ({
      title: isRTL ? "الملف الشخصي" : "Profile",
      description: isRTL
        ? "معلومات الحساب حسب إعدادات الخصوصية"
        : "Account details based on privacy settings",
      cityCountry: isRTL ? "المدينة / الدولة" : "City / Country",
      gender: isRTL ? "الجنس" : "Gender",
      birthday: isRTL ? "تاريخ الميلاد" : "Birthday",
      memberSince: isRTL ? "عضو منذ" : "Member since",
      sports: isRTL ? "الرياضات" : "Sports",
      publications: isRTL ? "المنشورات" : "Publications",
      privateHint: isRTL
        ? "هذا الحساب خاص، لذلك قد تكون بعض المعلومات مخفية."
        : "This account is private, so some details may be hidden.",
      loading: isRTL ? "جاري تحميل الملف الشخصي..." : "Loading profile...",
      failed: isRTL ? "تعذر تحميل الملف الشخصي" : "Unable to load profile",
    }),
    [isRTL],
  )

  const displayName = buildDisplayName(profile, fallbackDisplayName)
  const avatarSrc = profile?.profileImageUrl || fallbackAvatarUrl || "/images/default-user.jpg"

  const sports = profile?.sports ?? []
  const publicationsCount = profile?.publications?.length ?? 0

  const hasExtendedDetails = Boolean(
    profile?.gender ||
      profile?.birthday ||
      profile?.createdAt ||
      sports.length ||
      publicationsCount,
  )

  const cityCountry = [profile?.city, profile?.country].filter(Boolean).join(" / ")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg" showCloseButton>
        <DialogHeader>
          <DialogTitle className={cn(isRTL && "font-arabic text-right")}>{text.title}</DialogTitle>
          <DialogDescription className={cn(isRTL && "font-arabic text-right")}>{text.description}</DialogDescription>
        </DialogHeader>

        {isLoading && (
          <div className="flex flex-col items-center justify-center gap-2 py-8">
            <Spinner className="size-8" />
            <p className={cn("text-sm text-muted-foreground", isRTL && "font-arabic")}>{text.loading}</p>
          </div>
        )}

        {!isLoading && errorCode && (
          <div className={cn("rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive", isRTL && "font-arabic text-right")}>
            {text.failed}: {errorCode}
          </div>
        )}

        {!isLoading && !errorCode && (
          <div className="space-y-4">
            <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse text-right")}>
              <Image
                src={avatarSrc}
                alt={displayName}
                width={64}
                height={64}
                className="size-16 rounded-full border border-border/35 object-cover"
              />
              <div>
                <p className={cn("text-base font-semibold text-foreground", isRTL && "font-arabic")}>{displayName}</p>
                {cityCountry && (
                  <p className={cn("mt-0.5 text-xs text-muted-foreground", isRTL && "font-arabic")}>{cityCountry}</p>
                )}
              </div>
            </div>

            <div className="space-y-2 text-sm">
              {cityCountry && (
                <div className={cn("flex items-center justify-between gap-2 rounded-md bg-muted/40 px-3 py-2", isRTL && "flex-row-reverse")}>
                  <span className={cn("text-muted-foreground", isRTL && "font-arabic")}>{text.cityCountry}</span>
                  <span className={cn("text-foreground", isRTL && "font-arabic")}>{cityCountry}</span>
                </div>
              )}

              {profile?.gender && (
                <div className={cn("flex items-center justify-between gap-2 rounded-md bg-muted/40 px-3 py-2", isRTL && "flex-row-reverse")}>
                  <span className={cn("text-muted-foreground", isRTL && "font-arabic")}>{text.gender}</span>
                  <span className={cn("text-foreground", isRTL && "font-arabic")}>{profile.gender}</span>
                </div>
              )}

              {profile?.birthday && (
                <div className={cn("flex items-center justify-between gap-2 rounded-md bg-muted/40 px-3 py-2", isRTL && "flex-row-reverse")}>
                  <span className={cn("text-muted-foreground", isRTL && "font-arabic")}>{text.birthday}</span>
                  <span className={cn("text-foreground", isRTL && "font-arabic")}>{formatBirthday(profile.birthday)}</span>
                </div>
              )}

              {profile?.createdAt && (
                <div className={cn("flex items-center justify-between gap-2 rounded-md bg-muted/40 px-3 py-2", isRTL && "flex-row-reverse")}>
                  <span className={cn("text-muted-foreground", isRTL && "font-arabic")}>{text.memberSince}</span>
                  <span className={cn("text-foreground", isRTL && "font-arabic")}>{formatMemberSince(profile.createdAt)}</span>
                </div>
              )}

              {sports.length > 0 && (
                <div className="rounded-md bg-muted/40 px-3 py-2">
                  <div className={cn("mb-2 flex items-center gap-2 text-muted-foreground", isRTL && "flex-row-reverse font-arabic") }>
                    <Icon icon="solar:medal-ribbons-star-outline" className="size-4" />
                    <span>{text.sports}</span>
                  </div>
                  <div className={cn("flex flex-wrap gap-1.5", isRTL && "justify-end")}>
                    {sports.map((sport) => {
                      const sportName = lang === "ar"
                        ? sport.nameAr
                        : lang === "en"
                          ? sport.nameEn
                          : sport.nameFr

                      return (
                        <span key={sport.id} className={cn("rounded-full border border-border/35 bg-background px-2 py-0.5 text-xs", isRTL && "font-arabic")}>
                          {sportName}
                        </span>
                      )
                    })}
                  </div>
                </div>
              )}

              <div className={cn("flex items-center justify-between gap-2 rounded-md bg-muted/40 px-3 py-2", isRTL && "flex-row-reverse")}>
                <span className={cn("text-muted-foreground", isRTL && "font-arabic")}>{text.publications}</span>
                <span className={cn("text-foreground", isRTL && "font-arabic")}>{publicationsCount}</span>
              </div>
            </div>

            {!hasExtendedDetails && (
              <p className={cn("rounded-md bg-muted/40 px-3 py-2 text-xs text-muted-foreground", isRTL && "font-arabic text-right")}>
                {text.privateHint}
              </p>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
