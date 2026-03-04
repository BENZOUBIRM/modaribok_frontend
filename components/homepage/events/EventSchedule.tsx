"use client"

import { cn } from "@/lib/utils"
import { useDictionary } from "@/providers/dictionary-provider"
import { getMockScheduleEvents } from "@/components/homepage/mock-data"

/**
 * Day schedule — vertical timeline with hour slots and event blocks.
 */
const HOURS = [8, 9, 10, 11, 12, 13, 14, 15]

function formatHour(h: number): string {
  if (h === 0) return "12 AM"
  if (h < 12) return `${h} AM`
  if (h === 12) return "12 PM"
  return `${h - 12} PM`
}

export function EventSchedule() {
  const { lang } = useDictionary()
  const events = getMockScheduleEvents(lang)

  return (
    <div className="p-4 border-b border-border">
      <div className="relative">
        {/* Hour grid */}
        {HOURS.map((hour) => {
          const event = events.find((e) => e.startHour === hour)
          return (
            <div key={hour} className="flex items-start min-h-[40px]">
              {/* Hour label */}
              <div className="w-12 shrink-0 text-[10px] text-muted-foreground pt-0.5">
                {formatHour(hour)}
              </div>
              {/* Timeline line + event */}
              <div className="flex-1 border-t border-border relative min-h-[40px]">
                {event && (
                  <div
                    className={cn(
                      "absolute inset-x-0 top-1 rounded-md border-l-2 px-2 py-1",
                      event.color
                    )}
                  >
                    <p className={cn("text-xs font-medium truncate", event.textColor)}>
                      {event.title}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {formatHour(event.startHour)} - {formatHour(event.endHour)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
