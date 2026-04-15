"use client"

import Image from "next/image"
import { Icon } from "@iconify/react"
import { useDictionary } from "@/providers/dictionary-provider"
import { useAuth } from "@/providers/auth-provider"
import { useUserProfileStats } from "@/hooks/use-user-profile-stats"
import { NavLink } from "@/components/ui/nav-link"

/**
 * User profile card for the activity panel sidebar.
 * Displays avatar, name, handle, and stats (posts, followers, following).
 */
export function UserProfileCard() {
  const { dictionary, lang } = useDictionary()
  const { user } = useAuth()
  const { stats } = useUserProfileStats(user?.id)
  const t = dictionary.profile

  if (!user) return null

  const avatarSrc = user.profileImageUrl || "/images/default-user.jpg"
  const handle = `@${user.firstName.toLowerCase()}${user.lastName.toLowerCase()}`

  const statsItems = [
    { label: t.following, value: stats.following },
    { label: t.followers, value: stats.followers },
    { label: t.posts, value: stats.posts },
  ]

  const subAccounts = [
    {
      id: "store",
      name: lang === "ar" ? "متجر بروتين الرياضي" : "Protein Store",
      role: lang === "ar" ? "متجر" : "Store",
      followers: "15.6K",
      image: "/images/default-user.jpg",
    },
    {
      id: "coach",
      name: lang === "ar" ? "كوتش سمر" : "Coach Samer",
      role: lang === "ar" ? "مدرب" : "Coach",
      followers: "12.7K",
      image: "/images/default-user.jpg",
    },
  ]

  return (
    <div className="border-b border-border/30 p-4">
      {/* Avatar */}
      <div className="flex flex-col items-center text-center">
        <NavLink href={`/${lang}/profile`} className="group inline-flex flex-col items-center text-center">
          <Image
            src={avatarSrc}
            alt={`${user.firstName} ${user.lastName}`}
            width={80}
            height={80}
            className="size-20 rounded-full object-cover border-2 border-border/35 transition-colors group-hover:border-primary"
          />
          <h3 className="font-bold text-foreground mt-2 text-sm group-hover:text-primary transition-colors">
            {user.firstName} {user.lastName}
          </h3>
        </NavLink>
        <p className="text-xs text-muted-foreground">{handle}</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 mt-4">
        {statsItems.map((stat) => (
          <div key={stat.label} className="flex flex-col items-center text-center">
            <span className="font-bold text-foreground text-sm">{formatCompactCount(stat.value, lang)}</span>
            <span className="text-xs text-muted-foreground">{stat.label}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 border-t border-border/30 pt-4">
        <div className="mb-2 text-xs font-semibold text-muted-foreground">
          {lang === "ar" ? "حساباتي الخاصة" : "Private accounts"}
        </div>

        <div className="space-y-2">
          {subAccounts.map((account) => (
            <div key={account.id} className="rounded-lg border border-border/35 bg-background/50 p-2">
              <div className="flex items-center gap-2">
                <Image src={account.image} alt={account.name} width={36} height={36} className="size-9 rounded-md object-cover" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-xs font-medium text-foreground">{account.name}</div>
                  <div className="mt-0.5 flex items-center gap-2">
                    <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] text-primary">{account.role}</span>
                    <span className="text-[10px] text-muted-foreground">{account.followers}</span>
                  </div>
                </div>
                <Icon icon="solar:alt-arrow-left-linear" className="size-3 text-muted-foreground" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function formatCompactCount(value: number, lang: "ar" | "en"): string {
  const safeValue = Number.isFinite(value) ? Math.max(0, value) : 0

  try {
    return new Intl.NumberFormat(lang === "ar" ? "ar-MA" : "en-US", {
      notation: "compact",
      compactDisplay: "short",
      maximumFractionDigits: 1,
    }).format(safeValue)
  } catch {
    return String(safeValue)
  }
}
