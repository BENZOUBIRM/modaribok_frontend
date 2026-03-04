"use client"

import { useState } from "react"
import Image from "next/image"
import { Icon } from "@iconify/react"
import { cn } from "@/lib/utils"
import { useDictionary } from "@/providers/dictionary-provider"
import { CommentInput } from "./CommentInput"
import type { MockComment } from "@/components/homepage/mock-data"

/**
 * Single comment with recursive replies.
 */
export function CommentItem({
  comment,
  isReply = false,
}: {
  comment: MockComment
  isReply?: boolean
}) {
  const { dictionary, isRTL } = useDictionary()
  const t = dictionary.feed
  const [showReplies, setShowReplies] = useState(false)
  const [showReplyInput, setShowReplyInput] = useState(false)
  const hasReplies = comment.replies && comment.replies.length > 0

  return (
    <div className={cn("flex gap-2", isReply && (isRTL ? "mr-10" : "ml-10"))}>
      <Image
        src={comment.author.avatarUrl}
        alt={comment.author.name}
        width={isReply ? 28 : 32}
        height={isReply ? 28 : 32}
        className={cn(
          "rounded-full object-cover shrink-0",
          isReply ? "size-7" : "size-8"
        )}
      />
      <div className="flex-1 min-w-0">
        {/* Comment bubble */}
        <div className="bg-surface rounded-xl px-3 py-2">
          <p className="text-sm font-semibold text-foreground leading-tight cursor-pointer hover:underline">
            {comment.author.name}
          </p>
          <p className="text-sm text-foreground mt-0.5 leading-relaxed">
            {comment.text}
          </p>
        </div>

        {/* Comment meta */}
        <div className="flex items-center gap-3 mt-1 px-1">
          <span className="text-xs text-muted-foreground">{comment.createdAt}</span>
          <button className="cursor-pointer text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
            {t.like}
          </button>
          {comment.likesCount > 0 && (
            <span className="text-xs text-muted-foreground flex items-center gap-0.5">
              <Icon icon="solar:like-bold" className="size-3 text-primary" />
              {comment.likesCount}
            </span>
          )}
          <button
            onClick={() => setShowReplyInput(!showReplyInput)}
            className="cursor-pointer text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            {t.reply}
          </button>
        </div>

        {/* Inline reply input */}
        {showReplyInput && (
          <div className={cn("mt-1.5", isRTL ? "mr-0" : "ml-0")}>
            <CommentInput
              replyTo={comment.author.handle}
              onCancelReply={() => setShowReplyInput(false)}
            />
          </div>
        )}

        {/* Replies toggle */}
        {hasReplies && (
          <div className="mt-1.5">
            <button
              onClick={() => setShowReplies(!showReplies)}
              className="cursor-pointer text-xs font-medium text-primary hover:underline flex items-center gap-1"
            >
              <Icon
                icon={showReplies ? "solar:alt-arrow-up-linear" : "solar:alt-arrow-down-linear"}
                className="size-3"
              />
              {showReplies ? t.hideReplies : `${t.viewReplies} (${comment.replies.length})`}
            </button>

            {showReplies && (
              <div className="mt-2 space-y-3">
                {comment.replies.map((reply) => (
                  <CommentItem key={reply.id} comment={reply} isReply />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
