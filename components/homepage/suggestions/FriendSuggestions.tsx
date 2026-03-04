"use client"

import { useRef } from "react"
import { Icon } from "@iconify/react"
import { useDictionary } from "@/providers/dictionary-provider"
import { FriendSuggestionCard } from "./FriendSuggestionCard"
import { getMockSuggestions } from "@/components/homepage/mock-data"

/**
 * Horizontal scrolling "People You May Know" section with arrow navigation.
 */
export function FriendSuggestions() {
  const { dictionary, lang, isRTL } = useDictionary()
  const suggestions = getMockSuggestions(lang)
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return
    const amount = 160 // roughly one card + gap
    const sign = direction === "left" ? -1 : 1
    scrollRef.current.scrollBy({ left: sign * amount, behavior: "smooth" })
  }

  return (
    <div className="bg-card rounded-xl border border-border p-4">
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
            title="Previous"
            className="cursor-pointer size-7 flex items-center justify-center rounded-full hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground"
          >
            <Icon icon={isRTL ? "solar:arrow-right-linear" : "solar:arrow-left-linear"} className="size-4" />
          </button>
          <button
            onClick={() => scroll(isRTL ? "left" : "right")}
            title="Next"
            className="cursor-pointer size-7 flex items-center justify-center rounded-full hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground"
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
        {suggestions.map((s) => (
          <FriendSuggestionCard key={s.id} suggestion={s} />
        ))}
        {/* Spacer to ensure last card is fully visible */}
        <div className="shrink-0 w-px" aria-hidden />
      </div>
    </div>
  )
}
