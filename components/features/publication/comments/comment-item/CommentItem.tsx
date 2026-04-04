"use client"

import { useState } from "react"
import Image from "next/image"
import { Icon } from "@iconify/react"
import { cn } from "@/lib/utils"
import { useDictionary } from "@/providers/dictionary-provider"
import { useAuth } from "@/providers/auth-provider"
import { SharedReactionControl } from "../../shared-reaction-control"
import { CommentInput } from "../comment-input"
import type { MockComment, ReactionType } from "@/types"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

/**
 * Single comment with recursive replies.
 */
export function CommentItem({
  comment,
  isReply = false,
  onAddReply,
  onLoadReplies,
  onDeleteComment,
  onReportComment,
  onReactComment,
  onOpenUserProfile,
}: {
  comment: MockComment
  isReply?: boolean
  onAddReply?: (parentCommentId: number, content: string) => Promise<boolean> | boolean
  onLoadReplies?: (commentId: number) => Promise<void> | void
  onDeleteComment?: (commentId: number) => Promise<boolean> | boolean
  onReportComment?: (commentId: number) => Promise<boolean> | boolean
  onReactComment?: (commentId: number, reactionType: ReactionType) => void
  onOpenUserProfile?: (params: { userId: number; avatarUrl?: string; displayName?: string }) => void
}) {
  const { dictionary, isRTL } = useDictionary()
  const { user } = useAuth()
  const t = dictionary.feed
  const [showReplies, setShowReplies] = useState(false)
  const [showReplyInput, setShowReplyInput] = useState(false)
  const [replyText, setReplyText] = useState("")
  const [isSubmittingReply, setIsSubmittingReply] = useState(false)
  const [isLoadingReplies, setIsLoadingReplies] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isReporting, setIsReporting] = useState(false)
  const hasReplies = comment.repliesCount > 0
  const isOwner = user?.id === comment.author.id

  const handleCopyComment = async () => {
    const textToCopy = comment.text?.trim()
    if (!textToCopy) {
      return
    }

    try {
      await navigator.clipboard.writeText(textToCopy)
    } catch {
      // Clipboard access may be blocked by browser permissions.
    }
  }

  const handleReportComment = async () => {
    if (!onReportComment || isReporting) {
      return
    }

    setIsReporting(true)
    await onReportComment(comment.id)
    setIsReporting(false)
  }

  const handleDeleteComment = async () => {
    if (!onDeleteComment || !isOwner || isDeleting || comment.isDeleted) {
      return
    }

    setIsDeleting(true)
    await onDeleteComment(comment.id)
    setIsDeleting(false)
  }

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

  const handleOpenAuthorProfile = () => {
    onOpenUserProfile?.({
      userId: comment.author.id,
      avatarUrl: comment.author.avatarUrl,
      displayName: comment.author.name,
    })
  }

  return (
    <div className={cn("flex items-start gap-2", isReply && (isRTL ? "mr-6" : "ml-6"))} dir={isRTL ? "rtl" : "ltr"}>
      <button
        type="button"
        onClick={handleOpenAuthorProfile}
        className="cursor-pointer shrink-0 self-start rounded-full"
      >
        <Image
          src={comment.author.avatarUrl}
          alt={comment.author.name}
          width={isReply ? 28 : 32}
          height={isReply ? 28 : 32}
          className={cn(
            "rounded-full object-cover",
            isReply ? "size-7" : "size-8"
          )}
        />
      </button>
      <div className={cn("flex-1 min-w-0", isRTL && "text-right")}>
        {/* Comment bubble */}
        <div className="rounded-xl border border-border/70 bg-muted/75 px-3 py-2 dark:bg-surface">
          <div className="mb-0.5 flex items-start justify-between gap-2">
            <button
              type="button"
              onClick={handleOpenAuthorProfile}
              className="cursor-pointer text-left text-sm font-semibold leading-tight text-foreground hover:underline"
            >
              {comment.author.name}
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  title="Comment options"
                  className="inline-flex size-6 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
                >
                  <Icon icon="solar:menu-dots-bold" className="size-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={isRTL ? "start" : "end"} className="z-100 min-w-40">
                <DropdownMenuItem onSelect={handleCopyComment} className="cursor-pointer">
                  <Icon icon="solar:copy-linear" className="size-4" />
                  <span>{t.copyComment}</span>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={handleReportComment} className="cursor-pointer">
                  {isReporting ? (
                    <Icon icon="svg-spinners:3-dots-fade" className="size-4" />
                  ) : (
                    <Icon icon="solar:flag-2-linear" className="size-4" />
                  )}
                  <span>{t.reportComment}</span>
                </DropdownMenuItem>
                {isOwner && !comment.isDeleted && (
                  <DropdownMenuItem
                    onSelect={handleDeleteComment}
                    className="cursor-pointer text-destructive focus:text-destructive"
                  >
                    {isDeleting ? (
                      <Icon icon="svg-spinners:3-dots-fade" className="size-4" />
                    ) : (
                      <Icon icon="solar:trash-bin-trash-linear" className="size-4" />
                    )}
                    <span>{t.deleteComment}</span>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <p className="text-sm text-foreground mt-0.5 leading-relaxed">
            {comment.text}
          </p>
        </div>

        {/* Comment meta */}
        <div className="mt-1 flex items-center gap-3 px-1">
          <div className="relative flex items-center gap-3">
            <SharedReactionControl
              entityId={comment.id}
              likesCount={comment.likesCount}
              reactionsCountByType={comment.reactionsCountByType}
              currentUserReaction={comment.currentUserReaction}
              onReact={onReactComment}
              variant="comment"
            />
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
                    onDeleteComment={onDeleteComment}
                    onReportComment={onReportComment}
                    onReactComment={onReactComment}
                    onOpenUserProfile={onOpenUserProfile}
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
