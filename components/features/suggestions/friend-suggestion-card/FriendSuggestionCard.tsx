"use client"

import Image from "next/image"
import { useDictionary } from "@/providers/dictionary-provider"
import type { FriendSuggestionCardProps } from "./FriendSuggestionCard.types"

/**
 * Single friend suggestion card — avatar, name, handle, follow button.
 */
export function FriendSuggestionCard({ suggestion }: FriendSuggestionCardProps) {
  const { dictionary } = useDictionary()

  return (
    <div className="flex w-36 shrink-0 flex-col items-center gap-2 rounded-xl border border-border/30 bg-card p-4 text-center transition-colors hover:border-border/55">
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
