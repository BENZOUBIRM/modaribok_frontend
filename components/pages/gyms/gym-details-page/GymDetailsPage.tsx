"use client"

import * as React from "react"
import Image from "next/image"
import { Icon } from "@iconify/react"

import { cn } from "@/lib/utils"
import { useDictionary } from "@/providers/dictionary-provider"
import { getGymById } from "../shared"

interface GymDetailsPageProps {
  gymId: string | number
}

function InfoCard({ icon, value, label }: { icon: string; value: string; label: string }) {
  return (
    <article className="rounded-xl border border-border/30 bg-muted/40 px-3 py-2.5">
      <div className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground">
        <Icon icon={icon} className="size-4 text-black dark:text-white" />
        <span>{label}</span>
      </div>
      <p className="truncate text-[1rem] font-extrabold text-foreground">{value}</p>
    </article>
  )
}

function Pill({ children, tone = "default", icon }: { children: React.ReactNode; tone?: "default" | "orange" | "blue" | "green"; icon?: string }) {
  const classes = tone === "orange"
    ? "border-orange-400/45 bg-orange-500/10 text-orange-500"
    : tone === "blue"
      ? "border-blue-400/45 bg-blue-500/10 text-blue-500"
      : tone === "green"
        ? "border-emerald-400/45 bg-emerald-500/10 text-emerald-500"
        : "border-border/35 bg-muted/45 text-muted-foreground"

  return (
    <span className={cn("inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-bold", classes)}>
      {icon ? <Icon icon={icon} className="me-1 size-4" /> : null}
      {children}
    </span>
  )
}

export function GymDetailsPage({ gymId }: GymDetailsPageProps) {
  const { isRTL, lang } = useDictionary()

  const gymNumericId = React.useMemo(() => Number(gymId), [gymId])
  const gym = React.useMemo(
    () => (Number.isFinite(gymNumericId) ? getGymById(gymNumericId) : undefined) ?? getGymById(1),
    [gymNumericId],
  )

  if (!gym) {
    return null
  }

  const title = isRTL ? gym.titleAr : gym.titleEn
  const location = isRTL ? gym.locationAr : gym.locationEn
  const sports = isRTL ? gym.sportsAr : gym.sportsEn
  const facilities = isRTL ? gym.facilitiesAr : gym.facilitiesEn
  const about = isRTL ? gym.aboutAr : gym.aboutEn
  const primaryGalleryImage = gym.galleryImages[0] ?? gym.imageSrc
  const secondaryGalleryImages = gym.galleryImages.slice(1, 5)
  const galleryExtraCount = Math.max(0, gym.galleryImages.length - 5)

  const labels = lang === "ar"
    ? {
        edit: "تعديل",
        website: "الموقع الالكتروني",
        phone: "رقم الهاتف",
        email: "البريد الالكتروني",
        capacity: "الطاقة الاستيعابية",
        members: "عضو",
        facilities: "المرافق المتوفرة",
        workSchedule: "مواعيد العمل",
        prices: "الاسعار",
        social: "روابط التواصل الاجتماعي",
        showMoreImages: "عرض المزيد",
        hour: "الساعة",
        month: "الشهر",
        year: "السنة",
        currency: "درهم",
      }
    : {
        edit: "Edit",
        website: "Website",
        phone: "Phone",
        email: "Email",
        capacity: "Capacity",
        members: "members",
        facilities: "Available facilities",
        workSchedule: "Work schedule",
        prices: "Prices",
        social: "Social links",
        showMoreImages: "Show more",
        hour: "Hour",
        month: "Month",
        year: "Year",
        currency: "MAD",
      }

  const genderChips = gym.genderTags.map((gender) => {
    if (gender === "men") {
      return {
        label: lang === "ar" ? "رجال" : "Men",
        className: "border-blue-400/45 bg-blue-500/10 text-blue-500",
        icon: "solar:men-linear",
      }
    }

    return {
      label: lang === "ar" ? "نساء" : "Women",
      className: "border-pink-400/45 bg-pink-500/10 text-pink-500",
      icon: "solar:women-linear",
    }
  })

  const sportIconByEnglish = (sport: string): string => {
    const normalized = sport.toLowerCase().trim()
    if (normalized.includes("basket")) return "mdi:basketball"
    if (normalized.includes("foot") || normalized.includes("soccer")) return "mdi:soccer"
    if (normalized.includes("run")) return "solar:running-2-linear"
    return "solar:dumbbell-large-2-linear"
  }

  const facilityIconByEnglish = (facility: string): string => {
    const normalized = facility.toLowerCase().trim()
    if (normalized.includes("coffee") || normalized.includes("cafe")) return "solar:cup-bold"
    if (normalized.includes("garden")) return "solar:leaf-bold"
    if (normalized.includes("pool")) return "solar:swimming-bold"
    if (normalized.includes("parking")) return "solar:parking-circle-bold"
    if (normalized.includes("locker")) return "solar:armchair-2-bold"
    return "solar:buildings-2-bold"
  }

  const socialToneByKey = (key: string) => {
    switch (key) {
      case "facebook":
        return { icon: "text-[#1877F2]", hover: "hover:bg-[#1877F2]/12 hover:border-[#1877F2]/35" }
      case "instagram":
        return { icon: "text-[#E4405F]", hover: "hover:bg-[#E4405F]/12 hover:border-[#E4405F]/35" }
      case "x":
        return { icon: "text-[#9CA3AF]", hover: "hover:bg-[#9CA3AF]/12 hover:border-[#9CA3AF]/35" }
      case "linkedin":
        return { icon: "text-[#0A66C2]", hover: "hover:bg-[#0A66C2]/12 hover:border-[#0A66C2]/35" }
      case "tiktok":
        return { icon: "text-[#FFFFFF] dark:text-[#E5E7EB]", hover: "hover:bg-[#25F4EE]/10 hover:border-[#25F4EE]/35" }
      case "snapchat":
        return { icon: "text-[#FFFC00]", hover: "hover:bg-[#FFFC00]/14 hover:border-[#FFFC00]/40" }
      default:
        return { icon: "text-foreground", hover: "hover:bg-primary/10 hover:border-primary/35" }
    }
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-6 md:px-8" dir={isRTL ? "rtl" : "ltr"}>
      <section className="rounded-3xl border border-border/35 bg-card px-5 py-5 text-sm shadow-[0_8px_24px_rgba(0,0,0,0.05)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.2)] md:px-7 md:py-6">
        <div dir="ltr" className={cn("mb-3 flex items-center text-xs font-semibold text-muted-foreground", isRTL ? "justify-start" : "justify-end")}>
          <button type="button" className="inline-flex cursor-pointer items-center gap-1.5 hover:text-foreground">
            <Icon icon="solar:pen-2-linear" className="size-4" />
            {labels.edit}
          </button>
        </div>

        <header dir={isRTL ? "rtl" : "ltr"} className="mb-3 flex items-start gap-3">
          <div className="order-2 min-w-0 flex-1">
            <div className={cn("mb-2 flex flex-wrap items-center gap-2", isRTL ? "justify-start" : "justify-start")}>
              <h1 className="text-[1.8rem] font-extrabold leading-tight text-foreground">{title}</h1>
              {genderChips.map((chip) => (
                <span key={chip.label} className={cn("inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold", chip.className)}>
                  <Icon icon={chip.icon} className="me-1 size-3.5" />
                  {chip.label}
                </span>
              ))}
            </div>
            <p className={cn("inline-flex items-center gap-1.5 text-sm text-muted-foreground", isRTL ? "text-right" : "text-left")}>
              <Icon icon="solar:map-point-bold" className="size-4 text-warning" />
              <span className="line-clamp-1">{location}</span>
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              {sports.map((sport, index) => (
                <Pill
                  key={`${sport}-${index}`}
                  tone={index % 3 === 0 ? "orange" : index % 3 === 1 ? "blue" : "green"}
                  icon={sportIconByEnglish(gym.sportsEn[index] ?? "")}
                >
                  {sport}
                </Pill>
              ))}
            </div>
          </div>

          <div className="order-1 relative h-22 w-22 shrink-0 overflow-hidden rounded-2xl border border-border/40 bg-muted/30">
            <Image src={gym.logoSrc} alt={title} fill className="object-cover" sizes="88px" />
          </div>
        </header>

        <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
          <InfoCard icon="solar:global-linear" value={gym.website} label={labels.website} />
          <InfoCard icon="solar:phone-bold" value={gym.phone} label={labels.phone} />
          <InfoCard icon="solar:letter-bold" value={gym.email} label={labels.email} />
          <InfoCard icon="solar:users-group-rounded-bold" value={`${gym.capacity} ${labels.members}`} label={labels.capacity} />
        </div>

        <section className="mb-4 border-t-2 border-dashed border-border/65 pt-4">
          <div dir="ltr" className="mb-2 flex items-center justify-between">
            <h2 className={cn("text-[1.85rem] font-extrabold text-foreground", isRTL ? "order-2 text-right" : "order-1 text-left")}>{labels.facilities}</h2>
            <button type="button" className={cn("inline-flex cursor-pointer items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground", isRTL ? "order-1" : "order-2")}>
              <Icon icon="solar:pen-2-linear" className="size-4" />
              {labels.edit}
            </button>
          </div>
          <div className="mb-3 flex flex-wrap gap-2">
            {facilities.map((facility, index) => {
              const facilityEn = gym.facilitiesEn[index] ?? ""
              return (
                <Pill
                  key={`${facility}-${index}`}
                  tone={index % 3 === 0 ? "blue" : index % 3 === 1 ? "green" : "default"}
                  icon={facilityIconByEnglish(facilityEn)}
                >
                  {facility}
                </Pill>
              )
            })}
          </div>

          <p className={cn("text-[0.98rem] leading-8 text-muted-foreground", isRTL ? "text-right" : "text-left")}>{about}</p>
        </section>

        <section className="mb-4 border-t-2 border-dashed border-border/65 pt-4">
          <div dir="ltr" className="grid grid-cols-1 gap-3 lg:grid-cols-[1.4fr_1fr]">
            <div className={cn("relative h-36 overflow-hidden rounded-xl border border-border/35 bg-muted/25 sm:h-84 lg:h-91", isRTL ? "order-1 lg:order-2" : "order-1 lg:order-1")}>
              <Image
                src={primaryGalleryImage}
                alt={title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 620px"
              />
            </div>

            <div className={cn("grid grid-cols-2 gap-3", isRTL ? "order-2 lg:order-1" : "order-2 lg:order-2")}>
              {Array.from({ length: 4 }).map((_, index) => {
                const image = secondaryGalleryImages[index]
                const shouldShowOverlay = index === 3 && galleryExtraCount > 0

                return (
                  <div key={`thumb-${index}-${image ?? "empty"}`} className="relative h-36 overflow-hidden rounded-xl border border-border/35 bg-muted/25 sm:h-42 lg:h-44">
                    {image ? (
                      <Image src={image} alt={title} fill className="object-cover" sizes="(max-width: 1024px) 50vw, 230px" />
                    ) : null}

                    {shouldShowOverlay ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/55 text-white">
                        <span className="text-2xl font-extrabold">+{galleryExtraCount}</span>
                        <span className="text-xs font-semibold">{labels.showMoreImages}</span>
                      </div>
                    ) : null}
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        <section className="mb-4 border-t-2 border-dashed border-border/65 pt-4">
          <div dir="ltr" className="mb-3 flex items-center justify-between">
            <h2 className={cn("text-[1.85rem] font-extrabold text-foreground", isRTL ? "order-2 text-right" : "order-1 text-left")}>{labels.workSchedule}</h2>
            <button type="button" className={cn("inline-flex cursor-pointer items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground", isRTL ? "order-1" : "order-2")}>
              <Icon icon="solar:pen-2-linear" className="size-4" />
              {labels.edit}
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {gym.workDays.map((day) => (
              <Pill key={day.key} tone={day.isClosed ? "orange" : "default"}>
                {day.isClosed ? (isRTL ? day.labelAr : day.labelEn) : `${isRTL ? day.labelAr : day.labelEn}, ${isRTL ? day.timeAr : day.timeEn}`}
              </Pill>
            ))}
          </div>
        </section>

        <section className="mb-4 border-t-2 border-dashed border-border/65 pt-4">
          <div dir="ltr" className="mb-3 flex items-center justify-between">
            <h2 className={cn("text-[1.85rem] font-extrabold text-foreground", isRTL ? "order-2 text-right" : "order-1 text-left")}>{labels.prices}</h2>
            <button type="button" className={cn("inline-flex cursor-pointer items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground", isRTL ? "order-1" : "order-2")}>
              <Icon icon="solar:pen-2-linear" className="size-4" />
              {labels.edit}
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {gym.prices.map((price) => {
              const label = isRTL ? price.labelAr : price.labelEn
              return (
                <Pill key={price.key}>{`${label}: ${price.value} ${labels.currency}`}</Pill>
              )
            })}
          </div>
        </section>

        <section className="border-t-2 border-dashed border-border/65 pt-4">
          <div dir="ltr" className="mb-3 flex items-center justify-between">
            <h2 className={cn("text-[1.85rem] font-extrabold text-foreground", isRTL ? "order-2 text-right" : "order-1 text-left")}>{labels.social}</h2>
            <button type="button" className={cn("inline-flex cursor-pointer items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground", isRTL ? "order-1" : "order-2")}>
              <Icon icon="solar:pen-2-linear" className="size-4" />
              {labels.edit}
            </button>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {gym.socialLinks.map((social) => {
              const tone = socialToneByKey(social.key)

              return (
              <article key={social.key} className={cn("group rounded-xl border border-border/30 bg-muted/40 px-3 py-2.5 transition-colors", tone.hover)}>
                <div className="mb-1 flex items-center justify-between gap-2 text-sm font-semibold text-muted-foreground">
                  <span>{isRTL ? social.labelAr : social.labelEn}</span>
                  <Icon icon={social.icon} className={cn("size-4.5", tone.icon)} />
                </div>
                <p className="truncate text-lg font-extrabold text-foreground">{social.url}</p>
              </article>
              )
            })}
          </div>
        </section>
      </section>
    </div>
  )
}
