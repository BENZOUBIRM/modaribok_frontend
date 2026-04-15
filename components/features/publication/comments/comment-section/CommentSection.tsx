"use client"

import * as React from "react"
import { CommentItem } from "../comment-item"
import { CommentInput } from "../comment-input"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"
import { useDictionary } from "@/providers/dictionary-provider"
import type { MockComment, ReactionType } from "@/types"

function containsCommentById(comment: MockComment, targetCommentId: number): boolean {
  if (comment.id === targetCommentId) {
    return true
  }

  return comment.replies.some((reply) => containsCommentById(reply, targetCommentId))
}

/**
 * Comment section: list of comments + "write a comment" input.
 */
export function CommentSection({
  comments,
  totalCommentsCount = 0,
  areCommentsInitialized = false,
  hasMoreComments = false,
  isLoadingMoreComments = false,
  onLoadMoreComments,
  onAddComment,
  onAddReply,
  onLoadReplies,
  onUpdateComment,
  onDeleteComment,
  onReportComment,
  onReactComment,
  onOpenUserProfile,
  isAddingComment,
  focusSignal,
  scrollable,
}: {
  comments: MockComment[]
  totalCommentsCount?: number
  areCommentsInitialized?: boolean
  hasMoreComments?: boolean
  isLoadingMoreComments?: boolean
  onLoadMoreComments?: () => Promise<void> | void
  onAddComment?: (content: string) => Promise<void> | void
  onAddReply?: (parentCommentId: number, content: string) => Promise<boolean> | boolean
  onLoadReplies?: (commentId: number) => Promise<void> | void
  onUpdateComment?: (commentId: number, content: string) => Promise<boolean> | boolean
  onDeleteComment?: (commentId: number) => Promise<boolean> | boolean
  onReportComment?: (commentId: number) => Promise<boolean> | boolean
  onReactComment?: (commentId: number, reactionType: ReactionType) => void
  onOpenUserProfile?: (params: { userId: number | string; avatarUrl?: string; displayName?: string }) => void
  isAddingComment?: boolean
  focusSignal?: number
  scrollable?: boolean
}) {
  const { dictionary } = useDictionary()
  const [commentText, setCommentText] = React.useState("")
  const [editingCommentId, setEditingCommentId] = React.useState<number | null>(null)
  const [isUpdatingComment, setIsUpdatingComment] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement | null>(null)
  const focusTimeoutIdsRef = React.useRef<number[]>([])
  const lastFocusSignalRef = React.useRef<number | undefined>(focusSignal)
  const shouldScrollComments = scrollable ?? true
  const t = dictionary.feed
  const isEditingComment = editingCommentId !== null

  const focusCommentInput = React.useCallback(() => {
    const input = inputRef.current
    if (!input) {
      return
    }

    input.focus()

    const cursorPosition = input.value.length
    input.setSelectionRange(cursorPosition, cursorPosition)
  }, [])

  const queueFocusCommentInput = React.useCallback(() => {
    focusTimeoutIdsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId))

    const retryDelays = [0, 40, 100, 180]
    focusTimeoutIdsRef.current = retryDelays.map((delay) =>
      window.setTimeout(() => {
        focusCommentInput()
      }, delay),
    )
  }, [focusCommentInput])

  const canShowLoadAllComments = totalCommentsCount > 0 && !areCommentsInitialized
  const canShowLoadMoreComments = areCommentsInitialized && hasMoreComments
  const shouldRenderCommentsContainer =
    comments.length > 0 || canShowLoadAllComments || canShowLoadMoreComments || isLoadingMoreComments

  React.useEffect(() => {
    if (typeof focusSignal === "number" && focusSignal !== lastFocusSignalRef.current) {
      inputRef.current?.focus()
    }

    lastFocusSignalRef.current = focusSignal
  }, [focusSignal])

  React.useEffect(() => {
    if (editingCommentId === null) {
      return
    }

    queueFocusCommentInput()
  }, [editingCommentId, queueFocusCommentInput])

  React.useEffect(() => {
    return () => {
      focusTimeoutIdsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId))
    }
  }, [])

  React.useEffect(() => {
    if (editingCommentId === null) {
      return
    }

    const stillExists = comments.some((comment) => containsCommentById(comment, editingCommentId))
    if (!stillExists) {
      setEditingCommentId(null)
      setCommentText("")
      setIsUpdatingComment(false)
    }
  }, [comments, editingCommentId])

  const handleEditComment = React.useCallback((commentId: number, content: string) => {
    setEditingCommentId(commentId)
    setCommentText(content)

    queueFocusCommentInput()
  }, [queueFocusCommentInput])

  const handleCancelEditing = React.useCallback(() => {
    setEditingCommentId(null)
    setCommentText("")
    setIsUpdatingComment(false)
  }, [])

  const handleAddComment = async () => {
    const trimmed = commentText.trim()
    if (!trimmed) {
      return
    }

    if (isEditingComment) {
      if (!onUpdateComment || editingCommentId === null || isUpdatingComment) {
        return
      }

      setIsUpdatingComment(true)
      const updated = await onUpdateComment(editingCommentId, trimmed)
      setIsUpdatingComment(false)

      if (!updated) {
        return
      }

      setEditingCommentId(null)
      setCommentText("")
      return
    }

    if (!onAddComment) {
      return
    }

    await onAddComment(trimmed)
    setCommentText("")
  }

  return (
    <div className="border-t border-border/30 bg-muted/30 [&_button:not(:disabled)]:cursor-pointer">
      {shouldRenderCommentsContainer && (
        <div
          data-comment-reaction-boundary
          className={`px-4 pt-3 space-y-3 ${
            shouldScrollComments ? "max-h-72 overflow-y-auto overflow-x-hidden pe-1" : ""
          }`}
        >
          {canShowLoadAllComments && (
            <div className={cn(
              "flex justify-center",
              isEditingComment && "blur-[2px] opacity-60 pointer-events-none select-none",
            )}>
              <button
                type="button"
                onClick={() => void onLoadMoreComments?.()}
                disabled={isLoadingMoreComments}
                className="inline-flex cursor-pointer items-center gap-1 text-center text-xs font-semibold text-primary hover:underline disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoadingMoreComments ? <Spinner className="size-3.5" /> : null}
                <span>
                  {t.viewAllComments}
                  {totalCommentsCount > 0 ? ` (${totalCommentsCount})` : ""}
                </span>
              </button>
            </div>
          )}

          {comments.map((comment) => (
            <div
              key={comment.id}
              className={cn(
                "transition-[filter,opacity] duration-200",
                isEditingComment
                && editingCommentId !== null
                && !containsCommentById(comment, editingCommentId)
                && "blur-[2px] opacity-60 pointer-events-none select-none",
              )}
            >
              <CommentItem
                comment={comment}
                onAddReply={onAddReply}
                onLoadReplies={onLoadReplies}
                onEditComment={handleEditComment}
                onDeleteComment={onDeleteComment}
                onReportComment={onReportComment}
                onReactComment={onReactComment}
                onOpenUserProfile={onOpenUserProfile}
              />
            </div>
          ))}

          {canShowLoadMoreComments && (
            <div className={cn(
              "flex justify-center",
              isEditingComment && "blur-[2px] opacity-60 pointer-events-none select-none",
            )}>
              <button
                type="button"
                onClick={() => void onLoadMoreComments?.()}
                disabled={isLoadingMoreComments}
                className="inline-flex cursor-pointer items-center gap-1 text-center text-xs font-semibold text-primary hover:underline disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoadingMoreComments ? <Spinner className="size-3.5" /> : null}
                <span>{isLoadingMoreComments ? t.loading : t.showMore}</span>
              </button>
            </div>
          )}
        </div>
      )}

      {isEditingComment && (
        <div className="mt-2 flex items-center justify-between border-t border-border/35 px-4 py-2">
          <span className="text-sm font-semibold text-foreground">{t.editingComment}</span>
          <button
            type="button"
            onClick={handleCancelEditing}
            className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            {t.cancel}
          </button>
        </div>
      )}

      <CommentInput
        value={commentText}
        onChange={setCommentText}
        onSubmit={handleAddComment}
        isSubmitting={isEditingComment ? isUpdatingComment : isAddingComment}
        inputRef={inputRef}
      />
    </div>
  )
}
