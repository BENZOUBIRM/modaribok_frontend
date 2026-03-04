"use client"

import { Icon } from "@iconify/react"
import { cn } from "@/lib/utils"
import { useDictionary } from "@/providers/dictionary-provider"
import { getMockCurrentEvents } from "@/components/homepage/mock-data"

/**
 * Current events section with countdown timer display.
 */
export function CurrentEvents() {
  const { dictionary, lang } = useDictionary()
  const events = getMockCurrentEvents(lang)

  return (
    <div className="p-4 border-b border-border">
      <h3 className="font-bold text-sm text-foreground mb-3">
        {dictionary.events.currentEvents}
      </h3>
      <div className="space-y-3">
        {events.map((event) => (
          <div key={event.id} className="space-y-2">
            <div className="flex items-center gap-2">
              <div className={cn("size-2.5 rounded-full shrink-0", event.color)} />
              <span className="text-sm font-medium text-foreground">{event.title}</span>
            </div>
            <p className="text-xs text-muted-foreground ps-4">{event.time}</p>
            {event.countdown && (
              <div className="flex items-center gap-2 ps-4">
                <div className="flex items-center gap-1 bg-primary/10 text-primary rounded-lg px-2 py-1.5 text-xs font-mono font-semibold">
                  <Icon icon="solar:clock-circle-linear" className="size-3.5" />
                  {event.countdown}
                </div>
                <button className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors">
                  {dictionary.events.join}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
