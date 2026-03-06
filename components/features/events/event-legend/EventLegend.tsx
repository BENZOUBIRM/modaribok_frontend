"use client"

import { cn } from "@/lib/utils"
import { useDictionary } from "@/providers/dictionary-provider"
import { getMockEventLegend } from "@/data/mock-data"

/**
 * Color-coded event type legend list.
 */
export function EventLegend() {
  const { dictionary, lang } = useDictionary()
  const legend = getMockEventLegend(lang)

  return (
    <div className="p-4">
      <h3 className="font-bold text-sm text-foreground mb-3">
        {dictionary.events.eventsList}:
      </h3>
      <div className="space-y-2">
        {legend.map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <div className={cn("size-2.5 rounded-full shrink-0", item.color)} />
            <span className="text-xs text-foreground">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
