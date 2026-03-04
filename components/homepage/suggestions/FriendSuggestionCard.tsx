"use client"

import Image from "next/image"
import { useDictionary } from "@/providers/dictionary-provider"
import type { MockSuggestion } from "@/components/homepage/mock-data"

/**
 * Single friend suggestion card — avatar, name, handle, follow button.
 */
export function FriendSuggestionCard({ suggestion }: { suggestion: MockSuggestion }) {
  const { dictionary } = useDictionary()

  return (
    <div className="flex flex-col items-center bg-card rounded-xl border border-border p-4 w-36 shrink-0 text-center gap-2">
      <Image
        src={suggestion.avatarUrl}
        alt={suggestion.name}
        width={64}
        height={64}
        className="size-16 rounded-full object-cover"
      />
      <div className="min-w-0 w-full">
        <p className="text-sm font-semibold text-foreground truncate">
          {suggestion.name}
        </p>
        <p className="text-xs text-muted-foreground truncate">
          {suggestion.handle}
        </p>
      </div>
      <button className="cursor-pointer w-full py-1.5 px-3 rounded-lg bg-success text-white text-xs font-medium hover:bg-success/90 transition-colors">
        {dictionary.suggestions.follow}
      </button>
    </div>
  )
}
