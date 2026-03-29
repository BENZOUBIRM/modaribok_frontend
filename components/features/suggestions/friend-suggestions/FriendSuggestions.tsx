"use client"

import * as React from "react"
import { Icon } from "@iconify/react"
import { cn } from "@/lib/utils"
import { useDictionary } from "@/providers/dictionary-provider"
import { suggestionService } from "@/services/api"
import { Spinner } from "@/components/ui/spinner"
import type { SuggestionUser, SuggestionUserDto } from "@/types"
import { FriendSuggestionCard } from "../friend-suggestion-card"
import type { FriendSuggestionsProps } from "./FriendSuggestions.types"

const DEFAULT_PAGE_SIZE = 20

/**
 * Horizontal scrolling "People You May Know" section with arrow navigation.
 */
export function FriendSuggestions({ className, pageSize = DEFAULT_PAGE_SIZE }: FriendSuggestionsProps) {
  const { dictionary, isRTL } = useDictionary()
  const [suggestions, setSuggestions] = React.useState<SuggestionUser[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const scrollRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    let isMounted = true

    const loadSuggestions = async () => {
      setIsLoading(true)

      const result = await suggestionService.getSuggestions({
        size: pageSize,
      })

      if (!isMounted) {
        return
      }

      if (!result.success || !result.data) {
        setSuggestions([])
        setIsLoading(false)
        return
      }

      const mappedSuggestions = result.data.items
        .map((item) => mapSuggestionToCard(item))
        .filter((item, index, items) => items.findIndex((candidate) => candidate.id === item.id) === index)

      setSuggestions(mappedSuggestions)
      setIsLoading(false)
    }

    loadSuggestions()

    return () => {
      isMounted = false
    }
  }, [pageSize])

  const hasSuggestions = suggestions.length > 0
  const canScroll = hasSuggestions && !isLoading

  if (!isLoading && !hasSuggestions) {
    return null
  }

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return
    const amount = 160 // roughly one card + gap
    const sign = direction === "left" ? -1 : 1
    scrollRef.current.scrollBy({ left: sign * amount, behavior: "smooth" })
  }

  return (
    <div className={cn("bg-card rounded-xl border border-border p-4", className)}>
      {/* Header with arrows */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon icon="solar:users-group-rounded-linear" className="size-5 text-primary" />
          <h3 className="font-bold text-sm text-foreground">
            {dictionary.suggestions.peopleYouMayKnow}
          </h3>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => scroll(isRTL ? "right" : "left")}
            disabled={!canScroll}
            title="Previous"
            className={cn(
              "size-7 flex items-center justify-center rounded-full transition-colors",
              canScroll
                ? "cursor-pointer text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                : "cursor-not-allowed text-muted-foreground/60",
            )}
          >
            <Icon icon={isRTL ? "solar:arrow-right-linear" : "solar:arrow-left-linear"} className="size-4" />
          </button>
          <button
            onClick={() => scroll(isRTL ? "left" : "right")}
            disabled={!canScroll}
            title="Next"
            className={cn(
              "size-7 flex items-center justify-center rounded-full transition-colors",
              canScroll
                ? "cursor-pointer text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                : "cursor-not-allowed text-muted-foreground/60",
            )}
          >
            <Icon icon={isRTL ? "solar:arrow-left-linear" : "solar:arrow-right-linear"} className="size-4" />
          </button>
        </div>
      </div>
      {/* Scrollable cards */}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-2 scrollbar-hidden scroll-smooth"
      >
        {isLoading ? (
          <div className="flex min-h-36 w-full items-center justify-center">
            <Spinner className="size-8" />
          </div>
        ) : (
          <>
            {suggestions.map((suggestion) => (
              <FriendSuggestionCard key={suggestion.id} suggestion={suggestion} />
            ))}
            {/* Spacer to ensure last card is fully visible */}
            <div className="shrink-0 w-px" aria-hidden />
          </>
        )}
      </div>
    </div>
  )
}

function mapSuggestionToCard(item: SuggestionUserDto): SuggestionUser {
  const firstName = item.firstName ?? ""
  const lastName = item.lastName ?? ""
  const fullName = `${firstName} ${lastName}`.trim() || "User"

  return {
    id: item.id,
    name: fullName,
    handle: buildHandle(firstName, lastName, item.id),
    avatarUrl: item.profileImage || "/images/default-user.jpg",
    score: item.score,
    rank: item.rank,
  }
}

function buildHandle(firstName: string, lastName: string, userId: number): string {
  const raw = `${firstName}${lastName}`.replace(/\s+/g, "").toLowerCase()
  return raw ? `@${raw}` : `@user${userId}`
}
