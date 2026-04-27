"use client"

import * as React from "react"
import Image from "next/image"
import { Icon } from "@iconify/react"

import { cn } from "@/lib/utils"
import { useDictionary } from "@/providers/dictionary-provider"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/primitives/accordion"
import { getCoachById } from "../shared"

type RtlScrollType = "default" | "negative" | "reverse"

let cachedRtlScrollType: RtlScrollType | null = null

function getRtlScrollType(): RtlScrollType {
  if (cachedRtlScrollType) {
    return cachedRtlScrollType
  }

  if (typeof document === "undefined") {
    return "default"
  }

  const dummy = document.createElement("div")
  const child = document.createElement("div")

  dummy.dir = "rtl"
  dummy.style.width = "4px"
  dummy.style.height = "1px"
  dummy.style.overflow = "scroll"
  dummy.style.position = "absolute"
  dummy.style.top = "-9999px"
  child.style.width = "10px"
  child.style.height = "1px"

  dummy.appendChild(child)
  document.body.appendChild(dummy)

  if (dummy.scrollLeft > 0) {
    cachedRtlScrollType = "default"
  } else {
    dummy.scrollLeft = 1
    cachedRtlScrollType = dummy.scrollLeft === 0 ? "negative" : "reverse"
  }

  document.body.removeChild(dummy)
  return cachedRtlScrollType
}

function getNormalizedScrollLeft(element: HTMLDivElement, isRTL: boolean): number {
  if (!isRTL) {
    return element.scrollLeft
  }

  const maxScrollLeft = Math.max(0, element.scrollWidth - element.clientWidth)
  const scrollType = getRtlScrollType()

  switch (scrollType) {
    case "negative":
      return maxScrollLeft + element.scrollLeft
    case "reverse":
      return maxScrollLeft - element.scrollLeft
    case "default":
    default:
      return element.scrollLeft
  }
}

function setNormalizedScrollLeft(element: HTMLDivElement, normalizedLeft: number, isRTL: boolean) {
  const maxScrollLeft = Math.max(0, element.scrollWidth - element.clientWidth)
  const clampedNormalizedLeft = Math.max(0, Math.min(maxScrollLeft, normalizedLeft))

  const resolveRawScrollLeft = () => {
    if (!isRTL) {
      return clampedNormalizedLeft
    }

    const scrollType = getRtlScrollType()

    switch (scrollType) {
      case "negative":
        return clampedNormalizedLeft - maxScrollLeft
      case "reverse":
        return maxScrollLeft - clampedNormalizedLeft
      case "default":
      default:
        return clampedNormalizedLeft
    }
  }

  const rawLeft = resolveRawScrollLeft()

  if (typeof element.scrollTo === "function") {
    element.scrollTo({ left: rawLeft, behavior: "smooth" })
    return
  }

  if (!isRTL) {
    element.scrollLeft = clampedNormalizedLeft
    return
  }

  const scrollType = getRtlScrollType()

  switch (scrollType) {
    case "negative":
      element.scrollLeft = clampedNormalizedLeft - maxScrollLeft
      break
    case "reverse":
      element.scrollLeft = maxScrollLeft - clampedNormalizedLeft
      break
    case "default":
    default:
      element.scrollLeft = clampedNormalizedLeft
      break
  }
}

interface CoachProfilePageProps {
  coachId: string | number
}

function Badge({ children, tone = "default", icon }: { children: React.ReactNode; tone?: "default" | "blue" | "green" | "orange" | "pink"; icon?: string }) {
  const classes = tone === "blue"
    ? "border-blue-400/45 bg-blue-500/10 text-blue-500"
    : tone === "green"
      ? "border-emerald-400/45 bg-emerald-500/10 text-emerald-500"
      : tone === "orange"
        ? "border-orange-400/45 bg-orange-500/10 text-orange-500"
        : tone === "pink"
          ? "border-pink-400/45 bg-pink-500/10 text-pink-500"
          : "border-border/35 bg-muted/45 text-muted-foreground"

  return (
    <span className={cn("inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold", classes)}>
      {icon ? <Icon icon={icon} className="me-1.5 size-3.5" /> : null}
      {children}
    </span>
  )
}

function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-border/35 bg-card p-4 shadow-[0_8px_24px_rgba(0,0,0,0.05)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.2)] md:p-6">
      {children}
    </div>
  )
}

export function CoachProfilePage({ coachId }: CoachProfilePageProps) {
  const { isRTL, lang } = useDictionary()

  const coachNumericId = React.useMemo(() => Number(coachId), [coachId])
  const coach = React.useMemo(
    () => (Number.isFinite(coachNumericId) ? getCoachById(coachNumericId) : undefined),
    [coachNumericId],
  )

  if (!coach) {
    return null
  }

  const name = isRTL ? coach.nameAr : coach.nameEn
  const bio = isRTL ? coach.bioAr : coach.bioEn
  const specialties = isRTL ? coach.specialtiesAr : coach.specialtiesEn
  const certifications = coach.certifications
  const workDays = coach.workDays

  const certificationScrollRef = React.useRef<HTMLDivElement | null>(null)
  const certificationTrackRef = React.useRef<HTMLDivElement | null>(null)
  const rtlPositiveRawMovesTrackRightRef = React.useRef<boolean | null>(null)

  const [hasCertOverflow, setHasCertOverflow] = React.useState(false)
  const [canCertScrollLeft, setCanCertScrollLeft] = React.useState(false)
  const [canCertScrollRight, setCanCertScrollRight] = React.useState(false)

  const labels = lang === "ar"
    ? {
        changeAccount: "تبديل الحساب",
        archive: "عرض الأرشيف",
        editProfile: "تعديل الملف الشخصي",
        bio: "نبذة",
        certifications: "الشهادات",
        specialties: "التخصصات",
        workSchedule: "مواعيد العمل",
        posts: "منشور",
        followers: "متابعين",
        following: "أتابع",
      }
    : {
        changeAccount: "Change account",
        archive: "View archive",
        editProfile: "Edit profile",
        bio: "Bio",
        certifications: "Certifications",
        specialties: "Specialties",
        workSchedule: "Work schedule",
        posts: "Posts",
        followers: "Followers",
        following: "Following",
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

  const detectRtlRawDirection = React.useCallback((
    container: HTMLDivElement,
    track: HTMLDivElement,
  ) => {
    if (!isRTL) {
      rtlPositiveRawMovesTrackRightRef.current = null
      return
    }

    const beforeRaw = container.scrollLeft
    const beforeTrackLeft = track.getBoundingClientRect().left

    container.scrollLeft = beforeRaw + 1
    const plusTrackLeft = track.getBoundingClientRect().left

    container.scrollLeft = beforeRaw - 1
    const minusTrackLeft = track.getBoundingClientRect().left

    container.scrollLeft = beforeRaw

    const plusShift = plusTrackLeft - beforeTrackLeft
    const minusShift = minusTrackLeft - beforeTrackLeft

    if (Math.abs(plusShift) < 0.01 && Math.abs(minusShift) < 0.01) {
      rtlPositiveRawMovesTrackRightRef.current = null
      return
    }

    if (Math.abs(plusShift) >= Math.abs(minusShift)) {
      rtlPositiveRawMovesTrackRightRef.current = plusShift > 0
      return
    }

    rtlPositiveRawMovesTrackRightRef.current = minusShift < 0
  }, [isRTL])

  const updateCertScrollState = React.useCallback(() => {
    const container = certificationScrollRef.current
    if (!container) {
      return
    }

    const maxScrollLeft = Math.max(0, container.scrollWidth - container.clientWidth)
    const normalizedLeft = getNormalizedScrollLeft(container, isRTL)
    const hasOverflow = maxScrollLeft > 1

    setHasCertOverflow(hasOverflow)
    setCanCertScrollLeft(hasOverflow && normalizedLeft > 4)
    setCanCertScrollRight(hasOverflow && normalizedLeft < maxScrollLeft - 4)
  }, [isRTL])

  React.useEffect(() => {
    const container = certificationScrollRef.current
    if (!container) {
      return
    }

    updateCertScrollState()

    const handleScroll = () => updateCertScrollState()
    const resizeObserver = new ResizeObserver(() => updateCertScrollState())

    container.addEventListener("scroll", handleScroll)
    window.addEventListener("resize", handleScroll)
    resizeObserver.observe(container)

    return () => {
      container.removeEventListener("scroll", handleScroll)
      window.removeEventListener("resize", handleScroll)
      resizeObserver.disconnect()
    }
  }, [updateCertScrollState, certifications.length])

  React.useEffect(() => {
    if (!isRTL) {
      rtlPositiveRawMovesTrackRightRef.current = null
      return
    }

    const container = certificationScrollRef.current
    const track = certificationTrackRef.current

    if (!container || !track) {
      return
    }

    rtlPositiveRawMovesTrackRightRef.current = null
    detectRtlRawDirection(container, track)
  }, [isRTL, detectRtlRawDirection, certifications.length])

  const scrollCertifications = (direction: "left" | "right") => {
    const container = certificationScrollRef.current
    if (!container) {
      return
    }

    const firstCard = container.querySelector<HTMLElement>("[data-cert-card]")
    const cardWidth = firstCard?.getBoundingClientRect().width ?? 240
    const distance = Math.max(180, Math.round(cardWidth * 1.15))

    if (isRTL) {
      const track = certificationTrackRef.current
      if (track && rtlPositiveRawMovesTrackRightRef.current === null) {
        detectRtlRawDirection(container, track)
      }

      const positiveRawMovesTrackRight = rtlPositiveRawMovesTrackRightRef.current
      const shouldMoveTrackRight = direction === "left"
      const rawSign = positiveRawMovesTrackRight === null
        ? (shouldMoveTrackRight ? 1 : -1)
        : (shouldMoveTrackRight === positiveRawMovesTrackRight ? 1 : -1)

      const nextRawLeft = container.scrollLeft + (rawSign * distance)

      if (typeof container.scrollTo === "function") {
        container.scrollTo({ left: nextRawLeft, behavior: "smooth" })
      } else {
        container.scrollLeft = nextRawLeft
      }

      window.setTimeout(updateCertScrollState, 60)
      return
    }

    const normalizedLeft = getNormalizedScrollLeft(container, isRTL)
    const maxScrollLeft = Math.max(0, container.scrollWidth - container.clientWidth)
    const delta = direction === "left" ? -distance : distance
    const nextNormalizedLeft = Math.max(0, Math.min(maxScrollLeft, normalizedLeft + delta))

    if (nextNormalizedLeft === normalizedLeft) {
      return
    }

    setNormalizedScrollLeft(container, nextNormalizedLeft, isRTL)
    window.setTimeout(updateCertScrollState, 60)
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6" dir={isRTL ? "rtl" : "ltr"}>
      <div className="space-y-4">
        <SectionCard>
          <header dir={isRTL ? "rtl" : "ltr"} className="flex flex-col gap-4 md:flex-row md:items-start md:gap-5">
            <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-3xl border border-border/40 bg-muted/30 md:h-34 md:w-34">
              <Image src={coach.avatarSrc} alt={name} fill className="object-cover" sizes="136px" />
            </div>

            <div className="min-w-0 flex-1">
              <div className={cn("flex flex-wrap items-center gap-2", isRTL ? "text-right" : "text-left")}>
                <h1 className="text-3xl font-black leading-tight text-foreground">{name}</h1>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-4 md:flex-nowrap md:justify-between">
                <div className="flex items-center gap-6" dir={isRTL ? "rtl" : "ltr"}>
                  {[
                    { value: coach.postsCount, label: labels.posts },
                    { value: coach.followersCount, label: labels.followers },
                    { value: coach.followingCount, label: labels.following },
                  ].map((stat, index, array) => (
                    <div key={`${stat.label}-${index}`} className="flex items-center gap-6">
                      <div className={cn("text-center", isRTL ? "text-right" : "text-left")}>
                        <p className="text-[1.4rem] font-black leading-none text-foreground">{stat.value}</p>
                        <p className="mt-1 text-sm font-semibold text-muted-foreground">{stat.label}</p>
                      </div>
                      {index < array.length - 1 ? (
                        <span className="h-10 w-px bg-border/70" aria-hidden="true" />
                      ) : null}
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg bg-warning px-4 text-sm font-semibold text-warning-foreground transition-colors hover:bg-warning/90"
                  >
                    <Icon icon="solar:refresh-circle-linear" className="size-4" />
                    {labels.changeAccount}
                  </button>

                  <button
                    type="button"
                    className="inline-flex h-10 cursor-pointer items-center rounded-lg bg-muted px-4 text-sm font-semibold text-foreground transition-colors hover:bg-muted/80"
                  >
                    {labels.archive}
                  </button>

                  <button
                    type="button"
                    className="inline-flex h-10 cursor-pointer items-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    {labels.editProfile}
                  </button>
                </div>
              </div>
            </div>
          </header>
          <div className={cn("mt-6 space-y-3", isRTL ? "text-right" : "text-left")}>
            <h2 className="text-lg font-black text-foreground">{labels.bio}</h2>
            <p className="max-w-5xl text-sm leading-7 text-muted-foreground">{bio}</p>
          </div>

          <div className="my-4 border-t-2 border-dashed border-border/60" aria-hidden="true" />

          <div className="mt-4">
            <Accordion type="multiple" defaultValue={["certifications"]} className="w-full">
              <AccordionItem value="certifications" className="border-0">
                <AccordionTrigger className="py-5 text-base font-black no-underline hover:no-underline">
                  <span>{labels.certifications}</span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className={cn("mb-3 flex items-center", isRTL ? "justify-start" : "justify-end")} dir="ltr">
                    <div className={cn("items-center gap-1", hasCertOverflow ? "flex" : "hidden")}>
                      <button
                        type="button"
                        onClick={() => scrollCertifications("left")}
                        disabled={!canCertScrollLeft}
                        className={cn(
                          "cursor-pointer inline-flex size-7 items-center justify-center rounded-md border border-border/30 bg-muted/40 text-muted-foreground transition-colors hover:border-border/60",
                          "hover:bg-black/10 dark:hover:bg-white/10",
                          !canCertScrollLeft && "opacity-40 cursor-not-allowed",
                        )}
                        aria-label="Scroll certifications left"
                      >
                        <Icon icon="solar:alt-arrow-left-linear" className="size-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => scrollCertifications("right")}
                        disabled={!canCertScrollRight}
                        className={cn(
                          "cursor-pointer inline-flex size-7 items-center justify-center rounded-md border border-border/30 bg-muted/40 text-muted-foreground transition-colors hover:border-border/60",
                          "hover:bg-black/10 dark:hover:bg-white/10",
                          !canCertScrollRight && "opacity-40 cursor-not-allowed",
                        )}
                        aria-label="Scroll certifications right"
                      >
                        <Icon icon="solar:alt-arrow-right-linear" className="size-4" />
                      </button>
                    </div>
                  </div>

                  <div
                    ref={certificationScrollRef}
                    dir={isRTL ? "rtl" : "ltr"}
                    className={cn(
                      "overflow-x-auto overflow-y-hidden pb-2",
                      "scrollbar-on-hover",
                    )}
                  >
                    <div ref={certificationTrackRef} className="flex w-max items-stretch gap-3 pe-2">
                      {certifications.map((certification) => (
                        <article
                          key={`${certification.titleEn}-${certification.year}`}
                          data-cert-card
                          className={cn(
                            "flex w-64 shrink-0 gap-3 rounded-2xl border border-border/30 bg-muted/30 p-3",
                            isRTL ? "flex-row-reverse" : "flex-row",
                          )}
                        >
                          <div className="relative size-16 shrink-0 overflow-hidden rounded-xl border border-border/40 bg-card">
                            <Image src={certification.imageSrc} alt={isRTL ? certification.titleAr : certification.titleEn} fill className="object-cover" sizes="64px" />
                          </div>

                          <div className={cn("min-w-0 flex-1", isRTL ? "text-right" : "text-left")}>
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-sm font-extrabold text-foreground">{isRTL ? certification.titleAr : certification.titleEn}</h3>
                              <Badge tone="green">{certification.year}</Badge>
                            </div>
                            <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                              {isRTL ? certification.issuerAr : certification.issuerEn}
                            </p>
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <div className="border-t-2 border-dashed border-border/60" aria-hidden="true" />

              <AccordionItem value="work-schedule" className="border-0">
                <AccordionTrigger className="py-5 text-base font-black no-underline hover:no-underline">
                  <span>{labels.workSchedule}</span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-wrap gap-2">
                    {workDays.map((day) => (
                      <span
                        key={day.key}
                        className={cn(
                          "inline-flex items-center rounded-full border border-border/35 bg-muted/30 px-3 py-1 text-sm font-semibold text-muted-foreground",
                          day.isClosed ? "border-warning/40 text-warning" : "",
                        )}
                      >
                        {day.isClosed
                          ? (isRTL ? day.labelAr : day.labelEn)
                          : `${isRTL ? day.labelAr : day.labelEn}, ${isRTL ? day.timeAr : day.timeEn}`}
                      </span>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>

              <div className="border-t-2 border-dashed border-border/60" aria-hidden="true" />

              <AccordionItem value="specialties" className="border-0">
                <AccordionTrigger className="py-5 text-base font-black no-underline hover:no-underline">
                  <span>{labels.specialties}</span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-wrap gap-2">
                    {specialties.map((specialty, index) => (
                      <Badge key={`${specialty}-${index}`} tone={index % 3 === 0 ? "blue" : index % 3 === 1 ? "orange" : "green"}>
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          <div className="my-4 border-t-2 border-dashed border-border/60" aria-hidden="true" />

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Icon icon="ri:facebook-fill" className="size-5 text-black dark:text-white" />
              <h2 className="text-lg font-black text-foreground">{lang === "ar" ? "روابط التواصل الاجتماعي" : "Social links"}</h2>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {coach.socialLinks.map((socialLink) => {
              const tone = socialToneByKey(socialLink.key)
              return (
                <a
                  key={socialLink.key}
                  href={socialLink.url}
                  target="_blank"
                  rel="noreferrer"
                  className={cn(
                    "group flex flex-col items-center justify-center gap-2 rounded-2xl border border-border/30 bg-muted/20 px-3 py-4 text-center transition-all duration-200 hover:-translate-y-0.5",
                    tone.hover,
                  )}
                >
                  <Icon icon={socialLink.icon} className={cn("size-6 transition-transform duration-200 group-hover:scale-110", tone.icon)} />
                  <span className="text-xs font-bold text-foreground">{isRTL ? socialLink.labelAr : socialLink.labelEn}</span>
                </a>
              )
            })}
          </div>
        </SectionCard>
      </div>
    </div>
  )
}
