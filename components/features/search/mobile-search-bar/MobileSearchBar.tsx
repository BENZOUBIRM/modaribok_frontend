"use client"

import { Icon } from "@iconify/react"
import { cn } from "@/lib/utils"
import { useDictionary } from "@/providers/dictionary-provider"

/**
 * Search bar shown on mobile screens (below sm breakpoint)
 * when the navbar search bar is hidden.
 */
export function MobileSearchBar() {
  const { dictionary, isRTL } = useDictionary()

  return (
    <div className="sm:hidden">
      <div className="bg-card rounded-xl border border-border p-3">
        <div className="relative w-full">
          <Icon
            icon="solar:magnifer-linear"
            className={cn(
              "absolute top-1/2 -translate-y-1/2 size-4 text-muted-foreground",
              isRTL ? "right-3" : "left-3"
            )}
          />
          <input
            type="text"
            placeholder={dictionary.navbar.searchPlaceholder}
            className={cn(
              "w-full h-10 rounded-full bg-surface border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors",
              isRTL ? "pr-10 pl-4" : "pl-10 pr-4"
            )}
          />
        </div>
      </div>
    </div>
  )
}
