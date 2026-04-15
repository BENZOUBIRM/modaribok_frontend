"use client"

import { Icon } from "@iconify/react"
import { useDictionary } from "@/providers/dictionary-provider"
import { cn } from "@/lib/utils"
import type { ReactionType } from "@/types"
import { Spinner } from "@/components/ui/spinner"
import { SharedReactionControl } from "../shared-reaction-control"
import {
  REACTION_COLOR_BY_TYPE,
  REACTION_ICON_BY_TYPE,
} from "../shared-reaction-control"
import type { PublicationActionsProps } from "./PublicationActions.types"

/**
 * Like / Comment / Share action buttons below a publication.
 */
export function PublicationActions({
  publicationId,
  likesCount,
  commentsCount,
  sharesCount,
  reactionsCountByType,
  currentUserReaction,
  onReact,
  onCommentClick,
  onShare,
  isSharing,
}: PublicationActionsProps) {
  const { dictionary, isRTL } = useDictionary()
  const t = dictionary.feed

  const reactionEntries = Object.entries(reactionsCountByType ?? {})
    .filter((entry): entry is [ReactionType, number] => {
      const [type, count] = entry
      return Boolean(type) && typeof count === "number" && count > 0
    })
    .sort((a, b) => b[1] - a[1])

  const visibleReactions = reactionEntries.length
    ? reactionEntries
    : likesCount > 0
      ? [["LIKE", likesCount] as [ReactionType, number]]
      : []

  return (
    <div className="border-t border-border/30" dir={isRTL ? "rtl" : "ltr"}>
      {/* Stats row */}
      <div className="flex items-center justify-between px-4 py-2 text-xs text-muted-foreground">
        <div className="flex min-w-0 items-center gap-2">
          {visibleReactions.length > 0 ? (
            <div className="flex min-w-0 items-center gap-1.5 overflow-hidden">
              {visibleReactions.map(([type, count], index) => (
                <span
                  key={type}
                  title={`${type} (${count})`}
                  className={cn(
                    "inline-flex items-center gap-0.5 rounded-full bg-muted/50 px-1.5 py-0.5",
                    index >= 3 && "hidden sm:inline-flex",
                    index >= 5 && "sm:hidden md:inline-flex",
                    index >= 7 && "md:hidden lg:inline-flex",
                    index >= 9 && "lg:hidden xl:inline-flex",
                  )}
                >
                  <Icon
                    icon={REACTION_ICON_BY_TYPE[type]}
                    className={cn("size-4.5", REACTION_COLOR_BY_TYPE[type])}
                  />
                  <span className="font-medium">{count}</span>
                </span>
              ))}
            </div>
          ) : (
            <span className="flex items-center gap-1">
              <Icon icon="solar:like-bold" className="size-3.5 text-primary" />
              {likesCount} {t.likes}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span>{commentsCount} {t.comments}</span>
          <span className="flex items-center gap-1">
            {sharesCount} {t.shares}
            <Icon icon="solar:share-linear" className="size-3.5" />
          </span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="relative flex items-center border-t border-border/30">
        <SharedReactionControl
          entityId={publicationId}
          likesCount={likesCount}
          reactionsCountByType={reactionsCountByType}
          currentUserReaction={currentUserReaction}
          onReact={onReact}
          variant="publication"
        />
        <button
          onClick={onCommentClick}
          className="cursor-pointer flex-1 flex items-center justify-center gap-2 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-black/5 dark:hover:bg-white/10"
        >
          <Icon icon="solar:chat-round-linear" className="size-5" />
          <span>{t.comment}</span>
        </button>
        <button
          type="button"
          onClick={() => onShare?.(publicationId)}
          disabled={Boolean(isSharing)}
          className="cursor-pointer flex-1 flex items-center justify-center gap-2 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-70 dark:hover:bg-white/10"
        >
          {isSharing ? <Spinner className="size-4" /> : <Icon icon="solar:share-linear" className="size-5" />}
          <span>{t.share}</span>
        </button>
      </div>
    </div>
  )
}
