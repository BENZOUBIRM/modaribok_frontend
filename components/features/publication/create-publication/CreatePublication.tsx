"use client"

import Image from "next/image"
import { Icon } from "@iconify/react"
import { cn } from "@/lib/utils"
import { useDictionary } from "@/providers/dictionary-provider"
import { useAuth } from "@/providers/auth-provider"

/**
 * Post composer box — "What's on your mind?" area.
 */
export function CreatePublication() {
  const { dictionary, isRTL } = useDictionary()
  const { user } = useAuth()
  const t = dictionary.feed

  const avatarSrc = user?.profileImageUrl || "/images/default-user.jpg"

  return (
    <div className="bg-card rounded-xl border border-border">
      {/* Input row */}
      <div className="flex items-center gap-3 p-4">
        <Image
          src={avatarSrc}
          alt={user?.firstName ?? ""}
          width={40}
          height={40}
          className="size-10 rounded-full object-cover shrink-0"
        />
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder={t.whatsOnYourMind}
            className={cn(
              "cursor-pointer w-full h-10 rounded-full bg-surface border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors",
              isRTL ? "pr-4 pl-4" : "pl-4 pr-4"
            )}
            readOnly
          />
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-between border-t border-border px-4 py-2">
        <div className="flex items-center gap-1">
          <button className="cursor-pointer flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:bg-muted/50 transition-colors">
            <Icon icon="solar:gallery-bold" className="size-5 text-success" />
            <span className="hidden sm:inline">{t.addPhoto}</span>
          </button>
          <button className="cursor-pointer flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:bg-muted/50 transition-colors">
            <Icon icon="solar:videocamera-record-bold" className="size-5 text-destructive" />
            <span className="hidden sm:inline">{t.addVideo}</span>
          </button>
        </div>
        <button className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:bg-muted/50 transition-colors">
          <Icon icon="solar:lock-keyhole-linear" className="size-4" />
          <span>{t.privacyPublic}</span>
        </button>
      </div>
    </div>
  )
}
