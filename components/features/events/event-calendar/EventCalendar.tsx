"use client"

import { Icon } from "@iconify/react"
import { cn } from "@/lib/utils"
import { useDictionary } from "@/providers/dictionary-provider"

/**
 * Mini calendar widget — static November 2023 month grid.
 */
const DAYS_OF_WEEK_EN = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"]
const DAYS_OF_WEEK_AR = ["اث", "ث", "أر", "خ", "ج", "س", "أح"]

const HIGHLIGHTED_DAY = 9

export function EventCalendar() {
  const { dictionary, lang, isRTL } = useDictionary()
  const daysOfWeek = lang === "ar" ? DAYS_OF_WEEK_AR : DAYS_OF_WEEK_EN
  const monthLabel = lang === "ar" ? "نوفمبر 2023" : "November 2023"

  // Full November grid matching screenshot
  const grid: (number | null)[][] = [
    [29, 30, 31, 1, 2, 3, 4],
    [5, 6, 7, 8, 9, 10, 11],
  ]
  const isOutsideMonth = (day: number | null, rowIdx: number) => {
    if (day === null) return false
    return rowIdx === 0 && day > 20 // Oct days in first row
  }

  return (
    <div className="p-4 border-b border-border">
      <div className="flex items-center gap-2 mb-3">
        <Icon icon="solar:calendar-mark-linear" className="size-4 text-muted-foreground" />
        <h3 className="font-bold text-sm text-foreground">
          {dictionary.events.upcomingActivities}
        </h3>
      </div>

      {/* Month navigation */}
      <div className="flex items-center justify-between mb-3">
        <button title="Previous month" className="p-1 rounded hover:bg-muted/50 transition-colors">
          <Icon
            icon={isRTL ? "solar:alt-arrow-right-linear" : "solar:alt-arrow-left-linear"}
            className="size-4 text-muted-foreground"
          />
        </button>
        <span className="text-sm font-semibold text-foreground">{monthLabel}</span>
        <button title="Next month" className="p-1 rounded hover:bg-muted/50 transition-colors">
          <Icon
            icon={isRTL ? "solar:alt-arrow-left-linear" : "solar:alt-arrow-right-linear"}
            className="size-4 text-muted-foreground"
          />
        </button>
      </div>

      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 gap-0 mb-1">
        {daysOfWeek.map((day) => (
          <div key={day} className="text-center text-[10px] font-medium text-muted-foreground py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-0">
        {grid.map((row, rowIdx) =>
          row.map((day, colIdx) => {
            const outside = isOutsideMonth(day, rowIdx)
            const isToday = day === HIGHLIGHTED_DAY && !outside
            return (
              <div
                key={`${rowIdx}-${colIdx}`}
                className={cn(
                  "flex items-center justify-center text-xs py-1.5 cursor-pointer rounded transition-colors",
                  outside && "text-disabled-text",
                  !outside && !isToday && "text-foreground hover:bg-muted/50",
                  isToday && "bg-primary text-primary-foreground rounded-full font-bold"
                )}
              >
                {day}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
