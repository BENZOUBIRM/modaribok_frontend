"use client"

import * as React from "react"
import { Icon } from "@iconify/react"
import { motion } from "framer-motion"
import { useDictionary } from "@/providers/dictionary-provider"
import { cn } from "@/lib/utils"
import type { ReactionCountsByType, ReactionType } from "@/types"

const REACTION_ICON_BY_TYPE: Record<ReactionType, string> = {
  LIKE: "solar:like-bold",
  LOVE: "solar:heart-bold",
  HAHA: "emojione:smiling-face-with-open-mouth-and-closed-eyes",
  STRONG: "game-icons:strong",
  FIRE: "solar:fire-bold",
  CLAP: "mdi:hand-clap",
  MUSCLE: "game-icons:biceps",
  HEALTHY: "solar:heart-pulse-2-bold",
  MOTIVATION: "solar:bolt-bold",
  GOAL: "solar:target-bold",
  PROGRESS: "solar:chart-2-bold",
  CHAMPION: "solar:cup-star-bold",
}

const REACTION_COLOR_BY_TYPE: Record<ReactionType, string> = {
  LIKE: "text-primary",
  LOVE: "text-rose-500",
  HAHA: "text-amber-500",
  STRONG: "text-violet-500",
  FIRE: "text-orange-500",
  CLAP: "text-sky-500",
  MUSCLE: "text-indigo-500",
  HEALTHY: "text-emerald-500",
  MOTIVATION: "text-yellow-500",
  GOAL: "text-fuchsia-500",
  PROGRESS: "text-cyan-500",
  CHAMPION: "text-lime-500",
}

const REACTION_ACTIVE_BG_BY_TYPE: Record<ReactionType, string> = {
  LIKE: "bg-blue-500/15 hover:bg-blue-500/25",
  LOVE: "bg-rose-500/15 hover:bg-rose-500/25",
  HAHA: "bg-amber-500/15 hover:bg-amber-500/25",
  STRONG: "bg-violet-500/15 hover:bg-violet-500/25",
  FIRE: "bg-orange-500/15 hover:bg-orange-500/25",
  CLAP: "bg-sky-500/15 hover:bg-sky-500/25",
  MUSCLE: "bg-indigo-500/15 hover:bg-indigo-500/25",
  HEALTHY: "bg-emerald-500/15 hover:bg-emerald-500/25",
  MOTIVATION: "bg-yellow-500/15 hover:bg-yellow-500/25",
  GOAL: "bg-fuchsia-500/15 hover:bg-fuchsia-500/25",
  PROGRESS: "bg-cyan-500/15 hover:bg-cyan-500/25",
  CHAMPION: "bg-lime-500/15 hover:bg-lime-500/25",
}

const REACTION_PICKER_ACTIVE_BG_BY_TYPE: Record<ReactionType, string> = {
  LIKE: "bg-blue-500/15 dark:bg-blue-400/20",
  LOVE: "bg-rose-500/15 dark:bg-rose-400/20",
  HAHA: "bg-amber-500/15 dark:bg-amber-400/20",
  STRONG: "bg-violet-500/15 dark:bg-violet-400/20",
  FIRE: "bg-orange-500/15 dark:bg-orange-400/20",
  CLAP: "bg-sky-500/15 dark:bg-sky-400/20",
  MUSCLE: "bg-indigo-500/15 dark:bg-indigo-400/20",
  HEALTHY: "bg-emerald-500/15 dark:bg-emerald-400/20",
  MOTIVATION: "bg-yellow-500/15 dark:bg-yellow-400/20",
  GOAL: "bg-fuchsia-500/15 dark:bg-fuchsia-400/20",
  PROGRESS: "bg-cyan-500/15 dark:bg-cyan-400/20",
  CHAMPION: "bg-lime-500/15 dark:bg-lime-400/20",
}

const REACTION_PICKER_ACTIVE_BORDER_BY_TYPE: Record<ReactionType, string> = {
  LIKE: "border-blue-500/50 dark:border-blue-400/60",
  LOVE: "border-rose-500/50 dark:border-rose-400/60",
  HAHA: "border-amber-500/50 dark:border-amber-400/60",
  STRONG: "border-violet-500/50 dark:border-violet-400/60",
  FIRE: "border-orange-500/50 dark:border-orange-400/60",
  CLAP: "border-sky-500/50 dark:border-sky-400/60",
  MUSCLE: "border-indigo-500/50 dark:border-indigo-400/60",
  HEALTHY: "border-emerald-500/50 dark:border-emerald-400/60",
  MOTIVATION: "border-yellow-500/50 dark:border-yellow-400/60",
  GOAL: "border-fuchsia-500/50 dark:border-fuchsia-400/60",
  PROGRESS: "border-cyan-500/50 dark:border-cyan-400/60",
  CHAMPION: "border-lime-500/50 dark:border-lime-400/60",
}

const REACTION_ORDER: ReactionType[] = [
  "LIKE",
  "LOVE",
  "HAHA",
  "STRONG",
  "FIRE",
  "CLAP",
  "MUSCLE",
  "HEALTHY",
  "MOTIVATION",
  "GOAL",
  "PROGRESS",
  "CHAMPION",
]

const REACTION_ICON_BURST_COLOR_CLASSES: Record<ReactionType, string[]> = {
  LIKE: ["text-blue-400", "text-blue-500", "text-blue-600"],
  LOVE: ["text-rose-400", "text-rose-500", "text-rose-600"],
  HAHA: ["text-amber-400", "text-amber-500", "text-amber-600"],
  STRONG: ["text-violet-400", "text-violet-500", "text-violet-600"],
  FIRE: ["text-orange-400", "text-orange-500", "text-orange-600"],
  CLAP: ["text-sky-400", "text-sky-500", "text-sky-600"],
  MUSCLE: ["text-indigo-400", "text-indigo-500", "text-indigo-600"],
  HEALTHY: ["text-emerald-400", "text-emerald-500", "text-emerald-600"],
  MOTIVATION: ["text-yellow-400", "text-yellow-500", "text-yellow-600"],
  GOAL: ["text-fuchsia-400", "text-fuchsia-500", "text-fuchsia-600"],
  PROGRESS: ["text-cyan-400", "text-cyan-500", "text-cyan-600"],
  CHAMPION: ["text-lime-400", "text-lime-500", "text-lime-600"],
}

const REACTION_ICON_BURST_ACCENT_BY_TYPE: Record<ReactionType, string> = {
  LIKE: "solar:star-bold",
  LOVE: "solar:heart-bold",
  HAHA: "emojione:smiling-face-with-open-mouth-and-closed-eyes",
  STRONG: "solar:bolt-bold",
  FIRE: "solar:fire-bold",
  CLAP: "mdi:hand-clap",
  MUSCLE: "game-icons:biceps",
  HEALTHY: "solar:heart-pulse-2-bold",
  MOTIVATION: "solar:rocket-bold",
  GOAL: "solar:target-bold",
  PROGRESS: "solar:chart-2-bold",
  CHAMPION: "solar:cup-star-bold",
}

type ReactionBurstParticle = {
  id: string
  icon: string
  colorClassName: string
  dx: number
  dy: number
  rotateDeg: number
  sizeClassName: string
  durationMs: number
  delayMs: number
}

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
      return element.scrollLeft
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

/**
 * Like / Comment / Share action buttons below a publication.
 */
export function PublicationActions({
  publicationId,
  likesCount,
  commentsCount,
  sharesCount,
  reactionsCountByType,
  currentUserReaction,
  onReact,
  onCommentClick,
}: {
  publicationId: number
  likesCount: number
  commentsCount: number
  sharesCount: number
  reactionsCountByType?: ReactionCountsByType
  currentUserReaction?: ReactionType | null
  onReact?: (publicationId: number, reactionType: ReactionType) => void
  onCommentClick?: () => void
}) {
  const { dictionary, isRTL } = useDictionary()
  const t = dictionary.feed
  const [isReactionPickerOpen, setIsReactionPickerOpen] = React.useState(false)
  const [reactionBurstParticles, setReactionBurstParticles] = React.useState<ReactionBurstParticle[]>([])
  const [hasHorizontalOverflow, setHasHorizontalOverflow] = React.useState(false)
  const [canScrollLeft, setCanScrollLeft] = React.useState(false)
  const [canScrollRight, setCanScrollRight] = React.useState(false)
  const closeTimeoutRef = React.useRef<number | null>(null)
  const burstClearTimeoutRef = React.useRef<number | null>(null)
  const reactionScrollRef = React.useRef<HTMLDivElement | null>(null)
  const previousReactionRef = React.useRef<ReactionType | null>(currentUserReaction ?? null)

  React.useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        window.clearTimeout(closeTimeoutRef.current)
      }
      if (burstClearTimeoutRef.current) {
        window.clearTimeout(burstClearTimeoutRef.current)
      }
    }
  }, [])

  const triggerReactionBurst = React.useCallback((reactionType: ReactionType) => {
    const primaryIcon = REACTION_ICON_BY_TYPE[reactionType]
    const accentIcon = REACTION_ICON_BURST_ACCENT_BY_TYPE[reactionType]
    const colors = REACTION_ICON_BURST_COLOR_CLASSES[reactionType]
    const sizeClasses = ["size-8", "size-9", "size-10"]
    const particleCount = 10

    const particles = Array.from({ length: particleCount }, (_, index) => {
      const angle = (Math.PI * 2 * index) / particleCount + (Math.random() - 0.5) * 0.22
      const distance = 56 + Math.random() * 52

      return {
        id: `${reactionType}-${Date.now()}-${index}`,
        icon: index % 3 === 0 ? accentIcon : primaryIcon,
        colorClassName: colors[index % colors.length],
        dx: Math.cos(angle) * distance,
        dy: Math.sin(angle) * distance,
        rotateDeg: -30 + Math.random() * 60,
        sizeClassName: sizeClasses[index % sizeClasses.length],
        durationMs: 1200 + Math.random() * 520,
        delayMs: Math.random() * 90,
      }
    })

    setReactionBurstParticles(particles)

    if (burstClearTimeoutRef.current) {
      window.clearTimeout(burstClearTimeoutRef.current)
    }

    burstClearTimeoutRef.current = window.setTimeout(() => {
      setReactionBurstParticles([])
      burstClearTimeoutRef.current = null
    }, 2100)
  }, [])

  React.useEffect(() => {
    const currentReaction = currentUserReaction ?? null
    const previousReaction = previousReactionRef.current

    if (currentReaction && currentReaction !== previousReaction) {
      triggerReactionBurst(currentReaction)
    } else if (!currentReaction && burstClearTimeoutRef.current) {
      window.clearTimeout(burstClearTimeoutRef.current)
      burstClearTimeoutRef.current = null
      setReactionBurstParticles([])
    }

    previousReactionRef.current = currentReaction
  }, [currentUserReaction, triggerReactionBurst])

  const reactionEntries = Object.entries(reactionsCountByType ?? {})
    .filter((entry): entry is [ReactionType, number] => {
      const [type, count] = entry
      return Boolean(type) && typeof count === "number" && count > 0
    })
    .sort((a, b) => b[1] - a[1])

  const visibleReactions = reactionEntries.length
    ? reactionEntries
    : likesCount > 0
      ? [["LIKE", likesCount] as [ReactionType, number]]
      : []

  const isReacted = Boolean(currentUserReaction)
  const activeReactionType = currentUserReaction ?? "LIKE"
  const activeReactionLabel = formatReactionLabel(activeReactionType)

  const handleDefaultLike = () => {
    onReact?.(publicationId, currentUserReaction ?? "LIKE")
  }

  const handleReactionClick = (reactionType: ReactionType) => {
    onReact?.(publicationId, reactionType)
    setIsReactionPickerOpen(false)
  }

  const openReactionPicker = () => {
    if (closeTimeoutRef.current) {
      window.clearTimeout(closeTimeoutRef.current)
    }
    setIsReactionPickerOpen(true)
  }

  const closeReactionPicker = () => {
    if (closeTimeoutRef.current) {
      window.clearTimeout(closeTimeoutRef.current)
    }

    closeTimeoutRef.current = window.setTimeout(() => {
      setIsReactionPickerOpen(false)
    }, 120)
  }

  const updateScrollState = React.useCallback(() => {
    const container = reactionScrollRef.current
    if (!container) {
      return
    }

    const normalizedLeft = getNormalizedScrollLeft(container, isRTL)
    const maxScrollLeft = Math.max(0, container.scrollWidth - container.clientWidth)
    const hasOverflow = container.scrollWidth > container.clientWidth + 4
    setHasHorizontalOverflow(hasOverflow)
    setCanScrollLeft(normalizedLeft > 4)
    setCanScrollRight(normalizedLeft < maxScrollLeft - 4)
  }, [isRTL])

  React.useEffect(() => {
    if (!isReactionPickerOpen) {
      return
    }

    const container = reactionScrollRef.current
    if (!container) {
      return
    }

    const firstReaction = container.querySelector("button")
    firstReaction?.scrollIntoView({
      block: "nearest",
      inline: "start",
      behavior: "auto",
    })

    updateScrollState()

    const handleScroll = () => updateScrollState()
    const resizeObserver = new ResizeObserver(() => updateScrollState())

    container.addEventListener("scroll", handleScroll)
    window.addEventListener("resize", handleScroll)
    resizeObserver.observe(container)

    return () => {
      container.removeEventListener("scroll", handleScroll)
      window.removeEventListener("resize", handleScroll)
      resizeObserver.disconnect()
    }
  }, [isReactionPickerOpen, updateScrollState])

  const scrollReactions = (direction: "left" | "right") => {
    const container = reactionScrollRef.current
    if (!container) {
      return
    }

    const firstReaction = container.querySelector("button")
    const reactionItemWidth = firstReaction?.getBoundingClientRect().width ?? 72
    const distance = Math.max(64, Math.round(reactionItemWidth * 2.25))
    const normalizedLeft = getNormalizedScrollLeft(container, isRTL)
    const maxScrollLeft = Math.max(0, container.scrollWidth - container.clientWidth)
    const delta = direction === "left" ? -distance : distance
    const nextNormalizedLeft = Math.max(0, Math.min(maxScrollLeft, normalizedLeft + delta))

    if (nextNormalizedLeft === normalizedLeft) {
      return
    }

    setNormalizedScrollLeft(container, nextNormalizedLeft, isRTL)
    window.setTimeout(updateScrollState, 60)
  }

  return (
    <div className="border-t border-border">
      {/* Stats row */}
      <div className="flex items-center justify-between px-4 py-2 text-xs text-muted-foreground">
        <div className="flex min-w-0 items-center gap-2">
          {visibleReactions.length > 0 ? (
            <div className="flex min-w-0 items-center gap-1.5 overflow-hidden">
              {visibleReactions.map(([type, count], index) => (
                <span
                  key={type}
                  title={`${type} (${count})`}
                  className={cn(
                    "inline-flex items-center gap-0.5 rounded-full bg-muted/50 px-1.5 py-0.5",
                    index >= 3 && "hidden sm:inline-flex",
                    index >= 5 && "sm:hidden md:inline-flex",
                    index >= 7 && "md:hidden lg:inline-flex",
                    index >= 9 && "lg:hidden xl:inline-flex",
                  )}
                >
                  <Icon
                    icon={REACTION_ICON_BY_TYPE[type]}
                    className={cn("size-4.5", REACTION_COLOR_BY_TYPE[type])}
                  />
                  <span className="font-medium">{count}</span>
                </span>
              ))}
            </div>
          ) : (
            <span className="flex items-center gap-1">
              <Icon icon="solar:like-bold" className="size-3.5 text-primary" />
              {likesCount} {t.likes}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span>{commentsCount} {t.comments}</span>
          <span className="flex items-center gap-1">
            {sharesCount} {t.shares}
            <Icon icon="solar:share-linear" className="size-3.5" />
          </span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="relative flex items-center border-t border-border">
        <div
          className="relative flex-1"
          onMouseEnter={openReactionPicker}
          onMouseLeave={closeReactionPicker}
        >
          <div className="relative">
            <div
              className="pointer-events-none absolute left-1/2 top-1/2 z-20 h-64 w-64 -translate-x-1/2 -translate-y-1/2"
              aria-hidden="true"
            >
              {reactionBurstParticles.map((particle) => (
                <motion.span
                  key={particle.id}
                  initial={{ x: 0, y: 0, opacity: 0, scale: 0.7, rotate: 0 }}
                  animate={{
                    x: particle.dx,
                    y: particle.dy,
                    opacity: [0, 1, 0],
                    scale: [0.7, 1, 1.08],
                    rotate: particle.rotateDeg,
                  }}
                  transition={{
                    duration: particle.durationMs / 1000,
                    delay: particle.delayMs / 1000,
                    ease: [0.2, 0.72, 0.15, 1],
                  }}
                  className="absolute left-1/2 top-1/2 inline-flex -translate-x-1/2 -translate-y-1/2 drop-shadow-sm"
                >
                  <Icon
                    icon={particle.icon}
                    className={cn(particle.sizeClassName, particle.colorClassName)}
                  />
                </motion.span>
              ))}
            </div>

            <button
              onClick={handleDefaultLike}
              className={cn(
                "cursor-pointer flex w-full items-center justify-center gap-2 py-2.5 text-sm transition-colors",
                isReacted
                  ? cn(
                      "text-foreground",
                      REACTION_ACTIVE_BG_BY_TYPE[activeReactionType],
                    )
                  : "text-muted-foreground hover:bg-muted/50",
              )}
            >
              <Icon
                icon={isReacted ? REACTION_ICON_BY_TYPE[activeReactionType] : "solar:like-linear"}
                className={cn("size-5", isReacted && REACTION_COLOR_BY_TYPE[activeReactionType])}
              />
              <span>{isReacted ? activeReactionLabel : t.like}</span>
            </button>
          </div>

        </div>
        <div
          onMouseEnter={openReactionPicker}
          onMouseLeave={closeReactionPicker}
          className={cn(
            "pointer-events-none absolute bottom-full z-30 mb-2 inset-x-2 sm:inset-x-auto ltr:sm:left-2 rtl:sm:right-2",
            "rounded-2xl border border-border bg-card p-2 shadow-xl transition-all duration-200 ease-out",
            "w-[calc(100%-1rem)] sm:w-max max-w-[calc(100%-1rem)]",
            "origin-bottom",
            isReactionPickerOpen
              ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
              : "translate-y-2 scale-95 opacity-0",
          )}
        >
          <div className="mb-1.5 flex items-center justify-between gap-2 px-1">
            <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              {t.reactionsTitle || "Reactions"}
            </div>
            <div dir="ltr" className={cn("items-center gap-1", hasHorizontalOverflow ? "flex" : "hidden")}>
              <button
                type="button"
                onClick={() => scrollReactions("left")}
                disabled={!canScrollLeft}
                className={cn(
                  "cursor-pointer inline-flex size-6 items-center justify-center rounded-md border border-border bg-muted/50 text-muted-foreground transition-colors",
                  "hover:bg-black/10 dark:hover:bg-white/10",
                  !canScrollLeft && "opacity-40 cursor-not-allowed",
                )}
                aria-label="Scroll reactions left"
              >
                <Icon icon="solar:alt-arrow-left-linear" className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => scrollReactions("right")}
                disabled={!canScrollRight}
                className={cn(
                  "cursor-pointer inline-flex size-6 items-center justify-center rounded-md border border-border bg-muted/50 text-muted-foreground transition-colors",
                  "hover:bg-black/10 dark:hover:bg-white/10",
                  !canScrollRight && "opacity-40 cursor-not-allowed",
                )}
                aria-label="Scroll reactions right"
              >
                <Icon icon="solar:alt-arrow-right-linear" className="size-4" />
              </button>
            </div>
          </div>
          <div
            ref={reactionScrollRef}
            className={cn(
              "overflow-y-hidden pt-1 pb-1",
              "overflow-x-scroll md:overflow-x-auto",
              !hasHorizontalOverflow && "md:overflow-x-visible",
            )}
          >
            <div className="flex w-max items-end gap-2 pr-1">
              {REACTION_ORDER.map((reactionType) => (
                <button
                  key={reactionType}
                  type="button"
                  onClick={() => handleReactionClick(reactionType)}
                  className={cn(
                    "group flex min-w-14 cursor-pointer flex-col items-center gap-1 rounded-xl border border-transparent px-1.5 py-1.5 transition-all duration-200",
                    currentUserReaction === reactionType
                      ? ""
                      : "hover:-translate-y-1 hover:bg-black/10 dark:hover:bg-white/10",
                    currentUserReaction === reactionType && cn(
                      "ring-1 ring-transparent",
                      REACTION_PICKER_ACTIVE_BG_BY_TYPE[reactionType],
                      REACTION_PICKER_ACTIVE_BORDER_BY_TYPE[reactionType],
                    ),
                  )}
                  title={formatReactionLabel(reactionType)}
                >
                  <Icon
                    icon={REACTION_ICON_BY_TYPE[reactionType]}
                    className={cn("size-5.5 transition-transform duration-200 group-hover:scale-110", REACTION_COLOR_BY_TYPE[reactionType])}
                  />
                  <span className="text-[11px] font-medium text-muted-foreground group-hover:text-foreground">
                    {formatReactionLabel(reactionType)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
        <button
          onClick={onCommentClick}
          className="cursor-pointer flex-1 flex items-center justify-center gap-2 py-2.5 text-sm text-muted-foreground hover:bg-muted/50 transition-colors"
        >
          <Icon icon="solar:chat-round-linear" className="size-5" />
          <span>{t.comment}</span>
        </button>
        <button className="cursor-pointer flex-1 flex items-center justify-center gap-2 py-2.5 text-sm text-muted-foreground hover:bg-muted/50 transition-colors">
          <Icon icon="solar:share-linear" className="size-5" />
          <span>{t.share}</span>
        </button>
      </div>
    </div>
  )
}

function formatReactionLabel(type: ReactionType): string {
  return `${type.charAt(0)}${type.slice(1).toLowerCase()}`
}
