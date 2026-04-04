"use client"

import * as React from "react"
import { Icon } from "@iconify/react"
import { motion } from "framer-motion"
import { createPortal } from "react-dom"

import { useDictionary } from "@/providers/dictionary-provider"
import { cn } from "@/lib/utils"
import type { ReactionType } from "@/types"
import {
  formatReactionLabel,
  REACTION_ACTIVE_BG_BY_TYPE,
  REACTION_COLOR_BY_TYPE,
  REACTION_ICON_BURST_ACCENT_BY_TYPE,
  REACTION_ICON_BURST_COLOR_CLASSES,
  REACTION_ICON_BY_TYPE,
  REACTION_ORDER,
  REACTION_PICKER_ACTIVE_BG_BY_TYPE,
  REACTION_PICKER_ACTIVE_BORDER_BY_TYPE,
} from "./reaction-config"
import type { SharedReactionControlProps } from "./SharedReactionControl.types"

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

export function SharedReactionControl({
  entityId,
  likesCount,
  reactionsCountByType,
  currentUserReaction,
  onReact,
  variant = "publication",
  pickerZIndexClassName,
  pickerSideClassName,
  pickerWidthClassName,
  triggerContainerClassName,
}: SharedReactionControlProps) {
  const { dictionary, isRTL } = useDictionary()
  const t = dictionary.feed

  const [isReactionPickerOpen, setIsReactionPickerOpen] = React.useState(false)
  const [isPortalReady, setIsPortalReady] = React.useState(false)
  const [reactionBurstParticles, setReactionBurstParticles] = React.useState<ReactionBurstParticle[]>([])
  const [hasHorizontalOverflow, setHasHorizontalOverflow] = React.useState(false)
  const [canScrollLeft, setCanScrollLeft] = React.useState(false)
  const [canScrollRight, setCanScrollRight] = React.useState(false)
  const [commentPickerAnchorRect, setCommentPickerAnchorRect] = React.useState<DOMRect | null>(null)
  const [commentPickerBoundaryRect, setCommentPickerBoundaryRect] = React.useState<DOMRect | null>(null)

  const closeTimeoutRef = React.useRef<number | null>(null)
  const burstClearTimeoutRef = React.useRef<number | null>(null)
  const reactionScrollRef = React.useRef<HTMLDivElement | null>(null)
  const reactionTrackRef = React.useRef<HTMLDivElement | null>(null)
  const triggerWrapperRef = React.useRef<HTMLDivElement | null>(null)
  const previousReactionRef = React.useRef<ReactionType | null>(currentUserReaction ?? null)
  const rtlPositiveRawMovesTrackRightRef = React.useRef<boolean | null>(null)

  React.useEffect(() => {
    setIsPortalReady(true)
  }, [])

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

  const updateCommentPickerAnchor = React.useCallback(() => {
    if (!triggerWrapperRef.current) {
      return
    }

    setCommentPickerAnchorRect(triggerWrapperRef.current.getBoundingClientRect())

    const boundaryElement = triggerWrapperRef.current.closest<HTMLElement>("[data-comment-reaction-boundary]")
    setCommentPickerBoundaryRect(boundaryElement?.getBoundingClientRect() ?? null)
  }, [])

  const openReactionPicker = () => {
    if (closeTimeoutRef.current) {
      window.clearTimeout(closeTimeoutRef.current)
    }

    if (variant === "comment") {
      updateCommentPickerAnchor()
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

    const hasOverflow = container.scrollWidth > container.clientWidth + 4
    const track = reactionTrackRef.current

    setHasHorizontalOverflow(hasOverflow)

    if (!track || !hasOverflow) {
      setCanScrollLeft(false)
      setCanScrollRight(false)
      return
    }

    const containerRect = container.getBoundingClientRect()
    const trackRect = track.getBoundingClientRect()

    setCanScrollLeft(trackRect.left < containerRect.left - 2)
    setCanScrollRight(trackRect.right > containerRect.right + 2)
  }, [])

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

  React.useEffect(() => {
    if (variant !== "comment" || !isReactionPickerOpen) {
      return
    }

    const updateAnchor = () => {
      updateCommentPickerAnchor()
    }

    updateAnchor()
    window.addEventListener("resize", updateAnchor)
    window.addEventListener("scroll", updateAnchor, true)

    return () => {
      window.removeEventListener("resize", updateAnchor)
      window.removeEventListener("scroll", updateAnchor, true)
    }
  }, [variant, isReactionPickerOpen, updateCommentPickerAnchor])

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

  React.useEffect(() => {
    if (!isRTL || !isReactionPickerOpen) {
      return
    }

    const container = reactionScrollRef.current
    const track = reactionTrackRef.current

    if (!container || !track) {
      return
    }

    rtlPositiveRawMovesTrackRightRef.current = null
    detectRtlRawDirection(container, track)
  }, [isRTL, isReactionPickerOpen, detectRtlRawDirection])

  const scrollReactions = (direction: "left" | "right") => {
    const container = reactionScrollRef.current
    if (!container) {
      return
    }

    const firstReaction = container.querySelector("button")
    const reactionItemWidth = firstReaction?.getBoundingClientRect().width ?? 72
    const distance = Math.max(64, Math.round(reactionItemWidth * 2.25))

    if (isRTL) {
      const track = reactionTrackRef.current
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

      window.setTimeout(updateScrollState, 60)
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
    window.setTimeout(updateScrollState, 60)
  }

  const handleDefaultLike = () => {
    onReact?.(entityId, currentUserReaction ?? "LIKE")
  }

  const handleReactionClick = (reactionType: ReactionType) => {
    onReact?.(entityId, reactionType)
    setIsReactionPickerOpen(false)
  }

  const resolvedTriggerContainerClassName = triggerContainerClassName ?? (
    variant === "publication" ? "relative flex-1" : "relative"
  )

  const resolvedPickerZIndexClassName = pickerZIndexClassName ?? "z-[220]"

  const resolvedPickerWidthClassName = pickerWidthClassName ?? (
    variant === "publication"
      ? "w-[calc(100%-1rem)] sm:w-max max-w-[calc(100%-1rem)]"
      : "w-max"
  )

  const resolvedPickerSideClassName = pickerSideClassName ?? (
    variant === "publication"
      ? (isRTL ? "sm:right-2" : "sm:left-2")
      : ""
  )

  const commentPickerStyle: React.CSSProperties | undefined = (() => {
    if (variant !== "comment" || !commentPickerAnchorRect) {
      return undefined
    }

    const viewportWidth = typeof window !== "undefined" ? window.innerWidth : 0
    const isSmallViewport = viewportWidth < 640
    const horizontalMargin = 8
    const boundaryLeft = commentPickerBoundaryRect
      ? Math.max(horizontalMargin, commentPickerBoundaryRect.left + horizontalMargin)
      : horizontalMargin
    const boundaryRight = commentPickerBoundaryRect
      ? Math.min(viewportWidth - horizontalMargin, commentPickerBoundaryRect.right - horizontalMargin)
      : viewportWidth - horizontalMargin
    const boundaryWidth = Math.max(200, boundaryRight - boundaryLeft)

    if (isSmallViewport) {
      return {
        top: commentPickerAnchorRect.top - 8,
        left: boundaryLeft,
        width: boundaryWidth,
        maxWidth: boundaryWidth,
      }
    }

    if (isRTL) {
      return {
        top: commentPickerAnchorRect.top - 8,
        right: Math.max(horizontalMargin, viewportWidth - boundaryRight),
        maxWidth: boundaryWidth,
      }
    }

    return {
      top: commentPickerAnchorRect.top - 8,
      left: boundaryLeft,
      maxWidth: boundaryWidth,
    }
  })()

  const pickerBody = (
    <div
      onMouseEnter={openReactionPicker}
      onMouseLeave={closeReactionPicker}
      style={commentPickerStyle}
      className={cn(
        "pointer-events-none",
        variant === "publication" ? "absolute bottom-full mb-2" : "fixed",
        variant === "publication" && "inset-x-2 sm:inset-x-auto",
        resolvedPickerZIndexClassName,
        "rounded-2xl border border-border bg-card p-2 shadow-xl transition-all duration-200 ease-out",
        resolvedPickerWidthClassName,
        "origin-bottom",
        resolvedPickerSideClassName,
        variant === "publication"
          ? isReactionPickerOpen
            ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
            : "translate-y-2 scale-95 opacity-0"
          : isReactionPickerOpen
            ? "pointer-events-auto -translate-y-full scale-100 opacity-100"
            : "-translate-y-[calc(100%-0.5rem)] scale-95 opacity-0",
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
        <div ref={reactionTrackRef} className="flex w-max items-end gap-2 pr-1">
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
  )

  const shouldUsePortal = variant === "comment" && isPortalReady && typeof document !== "undefined"

  return (
    <>
      <div
        ref={triggerWrapperRef}
        className={resolvedTriggerContainerClassName}
        onMouseEnter={openReactionPicker}
        onMouseLeave={closeReactionPicker}
      >
        <div className="relative">
          {reactionBurstParticles.length > 0 && (
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
          )}

          <button
            onClick={handleDefaultLike}
            className={cn(
              variant === "publication"
                ? "cursor-pointer flex w-full items-center justify-center gap-2 py-2.5 text-sm transition-colors"
                : "cursor-pointer inline-flex items-center gap-1 rounded-md px-1 text-xs font-medium transition-colors",
              isReacted
                ? cn(
                    "text-foreground",
                    REACTION_ACTIVE_BG_BY_TYPE[activeReactionType],
                  )
                : variant === "publication"
                  ? "text-muted-foreground hover:bg-black/5 dark:hover:bg-white/10"
                  : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon
              icon={isReacted ? REACTION_ICON_BY_TYPE[activeReactionType] : "solar:like-linear"}
              className={cn(
                variant === "publication" ? "size-5" : "size-3.5",
                isReacted && REACTION_COLOR_BY_TYPE[activeReactionType],
              )}
            />
            <span>{isReacted ? activeReactionLabel : t.like}</span>
          </button>
        </div>
      </div>

      {shouldUsePortal ? createPortal(pickerBody, document.body) : pickerBody}

      {variant === "comment" && visibleReactions.length > 0 && (
        <div className="flex min-w-0 items-center gap-1 overflow-x-auto scrollbar-hidden">
          {visibleReactions.map(([type, count]) => (
            <span
              key={type}
              title={`${formatReactionLabel(type)} (${count})`}
              className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-muted/50 px-1 py-0.5 text-[10px] text-muted-foreground"
            >
              <Icon
                icon={REACTION_ICON_BY_TYPE[type]}
                className={cn("size-3", REACTION_COLOR_BY_TYPE[type])}
              />
              <span className="tabular-nums">{count}</span>
            </span>
          ))}
        </div>
      )}
    </>
  )
}
