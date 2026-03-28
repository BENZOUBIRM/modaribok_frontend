"use client"

import { useState } from "react"
import Image from "next/image"
import { Icon } from "@iconify/react"
import { cn } from "@/lib/utils"
import { useDictionary } from "@/providers/dictionary-provider"
import { CommentInput } from "../comment-input"
import type { MockComment } from "@/types"

/**
 * Single comment with recursive replies.
 */
export function CommentItem({
  comment,
  isReply = false,
  onAddReply,
  onLoadReplies,
}: {
  comment: MockComment
  isReply?: boolean
  onAddReply?: (parentCommentId: number, content: string) => Promise<boolean> | boolean
  onLoadReplies?: (commentId: number) => Promise<void> | void
}) {
  const { dictionary, isRTL } = useDictionary()
  const t = dictionary.feed
  const [showReplies, setShowReplies] = useState(false)
  const [showReplyInput, setShowReplyInput] = useState(false)
  const [replyText, setReplyText] = useState("")
  const [isSubmittingReply, setIsSubmittingReply] = useState(false)
  const [isLoadingReplies, setIsLoadingReplies] = useState(false)
  const hasReplies = comment.repliesCount > 0

  const handleReplySubmit = async () => {
    const trimmedReply = replyText.trim()
    if (!trimmedReply || !onAddReply || isSubmittingReply) {
      return
    }

    setIsSubmittingReply(true)
    const created = await onAddReply(comment.id, trimmedReply)
    setIsSubmittingReply(false)

    if (!created) {
      return
    }

    setReplyText("")
    setShowReplyInput(false)
    setShowReplies(true)
  }

  const handleToggleReplies = async () => {
    if (showReplies) {
      setShowReplies(false)
      return
    }

    if (hasReplies && comment.replies.length === 0 && onLoadReplies) {
      setIsLoadingReplies(true)
      await onLoadReplies(comment.id)
      setIsLoadingReplies(false)
    }

    setShowReplies(true)
  }

  return (
    <div className={cn("flex gap-2", isReply && (isRTL ? "mr-10" : "ml-10"))} dir={isRTL ? "rtl" : "ltr"}>
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
      <div className={cn("flex-1 min-w-0", isRTL && "text-right")}>
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
        <div className="mt-1 flex items-center gap-3 px-1">
          <div className="flex items-center gap-3">
            <button className="cursor-pointer text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
              {t.like}
            </button>
            {comment.likesCount > 0 && (
              <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                <Icon icon="solar:like-bold" className="size-3 text-primary" />
                {comment.likesCount}
              </span>
            )}
            {!comment.isDeleted && (
              <button
                onClick={() => setShowReplyInput(!showReplyInput)}
                className="cursor-pointer text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {t.reply}
              </button>
            )}
          </div>

          <span
            dir="ltr"
            className={cn(
              "text-xs text-muted-foreground tabular-nums",
              isRTL ? "mr-auto" : "ml-auto",
            )}
          >
            {comment.createdAt}
          </span>
        </div>

        {/* Inline reply input */}
        {showReplyInput && (
          <div className={cn("mt-1.5", isRTL ? "mr-0" : "ml-0")}>
            <CommentInput
              replyTo={comment.author.handle}
              value={replyText}
              onChange={setReplyText}
              onSubmit={handleReplySubmit}
              isSubmitting={isSubmittingReply}
              onCancelReply={() => {
                setShowReplyInput(false)
                setReplyText("")
              }}
            />
          </div>
        )}

        {/* Replies toggle */}
        {hasReplies && (
          <div className="mt-1.5">
            <button
              onClick={handleToggleReplies}
              className="cursor-pointer text-xs font-medium text-primary hover:underline flex items-center gap-1"
            >
              {isLoadingReplies ? (
                <Icon icon="svg-spinners:3-dots-fade" className="size-3" />
              ) : (
                <Icon
                  icon={showReplies ? "solar:alt-arrow-up-linear" : "solar:alt-arrow-down-linear"}
                  className="size-3"
                />
              )}
              {showReplies ? t.hideReplies : `${t.viewReplies} (${comment.repliesCount})`}
            </button>

            {showReplies && (
              <div className="mt-2 space-y-3">
                {comment.replies.map((reply) => (
                  <CommentItem
                    key={reply.id}
                    comment={reply}
                    isReply
                    onAddReply={onAddReply}
                    onLoadReplies={onLoadReplies}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
