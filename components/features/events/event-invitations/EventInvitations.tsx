"use client"

import { Icon } from "@iconify/react"
import { cn } from "@/lib/utils"
import { useDictionary } from "@/providers/dictionary-provider"
import { EventInvitationCard } from "./event-invitation-card"
import { getMockInvitations } from "@/data/mock-data"

/**
 * Event invitations section — list of events you've been invited to.
 */
export function EventInvitations() {
  const { dictionary, lang, isRTL } = useDictionary()
  const invitations = getMockInvitations(lang)

  return (
    <div className="p-4 border-b border-border">
      <h3 className="font-bold text-sm text-foreground mb-3">
        {dictionary.events.invitedEvents}
      </h3>
      <div className="space-y-2">
        {invitations.map((inv) => (
          <EventInvitationCard key={inv.id} invitation={inv} />
        ))}
      </div>
    </div>
  )
}
