"use client"

import { cn } from "@/lib/utils"
import { useDictionary } from "@/providers/dictionary-provider"
import type { MockInvitation } from "@/data/mock-data"
import { Icon } from "@iconify/react"

/**
 * Single event invitation card with accept/reject buttons.
 */
export function EventInvitationCard({ invitation }: { invitation: MockInvitation }) {
  const { dictionary, isRTL } = useDictionary()

  return (
    <div className="flex items-center justify-between gap-2 bg-surface rounded-lg p-3">
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <div className={cn("w-1 h-10 rounded-full shrink-0", invitation.color)} />
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{invitation.title}</p>
          <p className="text-xs text-muted-foreground">{invitation.date}, {invitation.time}</p>
        </div>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <button className="px-2.5 py-1 rounded-md bg-success text-white text-xs font-medium hover:bg-success/90 transition-colors cursor-pointer" title={dictionary.events.accept}>
          
          <Icon
                icon="solar:unread-linear"
                className="size-4"
            />
        </button>
        <button className="px-2.5 py-1 rounded-md bg-destructive text-white text-xs font-medium hover:bg-destructive/90 transition-colors cursor-pointer" title={dictionary.events.reject}>
            
            {/* <Icon
                icon="solar:forbidden-linear"
                className="size-4"
            /> */}
            <Icon
                icon="material-symbols:close-rounded"
                className="size-4"
            />
        </button>
      </div>
    </div>
  )
}
