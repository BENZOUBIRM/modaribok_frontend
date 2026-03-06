"use client"

import { Icon } from "@iconify/react"
import { useDictionary } from "@/providers/dictionary-provider"

/**
 * Like / Comment / Share action buttons below a publication.
 */
export function PublicationActions({
  likesCount,
  commentsCount,
  sharesCount,
}: {
  likesCount: number
  commentsCount: number
  sharesCount: number
}) {
  const { dictionary } = useDictionary()
  const t = dictionary.feed

  return (
    <div className="border-t border-border">
      {/* Stats row */}
      <div className="flex items-center justify-between px-4 py-2 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Icon icon="solar:like-bold" className="size-3.5 text-primary" />
          {likesCount} {t.likes}
        </span>
        <div className="flex items-center gap-3">
          <span>{commentsCount} {t.comments}</span>
          <span className="flex items-center gap-1">
            {sharesCount} {t.shares}
            <Icon icon="solar:share-linear" className="size-3.5" />
          </span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center border-t border-border">
        <button className="cursor-pointer flex-1 flex items-center justify-center gap-2 py-2.5 text-sm text-muted-foreground hover:bg-muted/50 transition-colors">
          <Icon icon="solar:like-linear" className="size-5" />
          <span>{t.like}</span>
        </button>
        <button className="cursor-pointer flex-1 flex items-center justify-center gap-2 py-2.5 text-sm text-muted-foreground hover:bg-muted/50 transition-colors">
          <Icon icon="solar:chat-round-linear" className="size-5" />
          <span>{t.comment}</span>
        </button>
        <button className="cursor-pointer flex-1 flex items-center justify-center gap-2 py-2.5 text-sm text-muted-foreground hover:bg-muted/50 transition-colors">
          <Icon icon="solar:share-linear" className="size-5" />
          <span>{t.share}</span>
        </button>
      </div>
    </div>
  )
}
