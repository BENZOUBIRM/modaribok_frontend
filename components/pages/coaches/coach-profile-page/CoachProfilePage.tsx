"use client"

import Image from "next/image"
import { Icon } from "@iconify/react"

import { useDictionary } from "@/providers/dictionary-provider"
import { cn } from "@/lib/utils"
import { getCoachById } from "../shared"

interface CoachProfilePageProps {
  coachId: string | number
}

export function CoachProfilePage({ coachId }: CoachProfilePageProps) {
  const { lang, isRTL } = useDictionary()

  const coach = getCoachById(Number(coachId)) ?? getCoachById(1)
  if (!coach) return null

  const name = isRTL ? coach.nameAr : coach.nameEn
  const roleBadge = isRTL ? coach.roleBadgeAr : coach.roleBadgeEn
  const bio = isRTL ? coach.descriptionAr : coach.descriptionEn

  const labels = lang === "ar"
    ? {
        editProfile: "تعديل الملف الشخصي",
        archive: "عرض الارشيف",
        startAccount: "ابدأ الحساب",
        followers: "متابعين",
        following: "أتابع",
        posts: "منشور",
      }
    : {
        editProfile: "Edit Profile",
        archive: "View Archive",
        startAccount: "Start Account",
        followers: "Followers",
        following: "Following",
        posts: "Posts",
      }

  const counters = [
    { value: coach.postsCount, label: labels.posts },
    { value: coach.followersCount, label: labels.followers },
    { value: coach.followingCount, label: labels.following },
  ]

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-5 md:px-6" dir={isRTL ? "rtl" : "ltr"}>
      <section className="rounded-3xl border border-border/35 bg-card px-4 py-4 shadow-[0_8px_24px_rgba(0,0,0,0.05)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.2)] md:px-5 md:py-5">
        <header dir={isRTL ? "rtl" : "ltr"} className={cn("mb-4 flex items-start gap-3", isRTL ? "flex-row-reverse" : "flex-row") }>
          <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl border border-border/40 bg-muted/30">
            <Image src={coach.avatarSrc} alt={name} fill className="object-cover" sizes="88px" />
          </div>

          <div className={cn("min-w-0 flex-1", isRTL ? "text-right" : "text-left")}>
            <div className={cn("mb-1 flex flex-wrap items-center gap-2", isRTL ? "justify-start" : "justify-start")}>
              <h1 className="text-[2rem] font-extrabold leading-tight text-foreground">{name}</h1>
              <span className="inline-flex items-center rounded-full border border-emerald-400/45 bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-500">
                {roleBadge}
                <span className="ms-1 inline-block size-2 rounded-full bg-emerald-500" />
              </span>
            </div>

            <div dir="ltr" className="mt-1 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-4">
                {counters.map((counter, index) => (
                  <div key={counter.label} className="relative text-center">
                    {index !== counters.length - 1 ? (
                      <span className="absolute -right-2 top-1/2 h-5 w-px -translate-y-1/2 bg-border/70" />
                    ) : null}
                    <p className="text-[1.7rem] leading-tight font-extrabold text-foreground">{counter.value}</p>
                    <p className="text-[0.9rem] font-semibold text-muted-foreground">{counter.label}</p>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  className="inline-flex h-9 cursor-pointer items-center rounded-lg border border-orange-500/45 bg-orange-500 px-3 text-sm font-bold text-white transition-colors hover:bg-orange-500/90"
                >
                  <Icon icon="solar:user-plus-bold" className="size-4" />
                  <span className="ms-1">{labels.startAccount}</span>
                </button>

                <button
                  type="button"
                  className="inline-flex h-9 cursor-pointer items-center rounded-lg border border-border/45 bg-muted/50 px-3 text-sm font-bold text-foreground transition-colors hover:bg-muted"
                >
                  {labels.archive}
                </button>

                <button
                  type="button"
                  className="inline-flex h-9 cursor-pointer items-center rounded-lg border border-primary/45 bg-primary px-3 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  {labels.editProfile}
                </button>
              </div>
            </div>
          </div>
        </header>

        <p className={cn("text-sm leading-7 text-muted-foreground", isRTL ? "text-right" : "text-left")}>{bio}</p>
      </section>
    </div>
  )
}
