"use client"

import * as React from "react"
import { CommentItem } from "../comment-item"
import { CommentInput } from "../comment-input"
import type { MockComment, ReactionType } from "@/types"

/**
 * Comment section: list of comments + "write a comment" input.
 */
export function CommentSection({
  comments,
  onAddComment,
  onAddReply,
  onLoadReplies,
  onDeleteComment,
  onReportComment,
  onReactComment,
  isAddingComment,
  focusSignal,
  scrollable,
}: {
  comments: MockComment[]
  onAddComment?: (content: string) => Promise<void> | void
  onAddReply?: (parentCommentId: number, content: string) => Promise<boolean> | boolean
  onLoadReplies?: (commentId: number) => Promise<void> | void
  onDeleteComment?: (commentId: number) => Promise<boolean> | boolean
  onReportComment?: (commentId: number) => Promise<boolean> | boolean
  onReactComment?: (commentId: number, reactionType: ReactionType) => void
  isAddingComment?: boolean
  focusSignal?: number
  scrollable?: boolean
}) {
  const [commentText, setCommentText] = React.useState("")
  const inputRef = React.useRef<HTMLInputElement | null>(null)
  const lastFocusSignalRef = React.useRef<number | undefined>(focusSignal)
  const shouldScrollComments = scrollable ?? true

  React.useEffect(() => {
    if (typeof focusSignal === "number" && focusSignal !== lastFocusSignalRef.current) {
      inputRef.current?.focus()
    }

    lastFocusSignalRef.current = focusSignal
  }, [focusSignal])

  const handleAddComment = async () => {
    const trimmed = commentText.trim()
    if (!trimmed || !onAddComment) {
      return
    }

    await onAddComment(trimmed)
    setCommentText("")
  }

  if (!comments.length) {
    return (
      <div className="border-t border-border [&_button:not(:disabled)]:cursor-pointer">
        <CommentInput
          value={commentText}
          onChange={setCommentText}
          onSubmit={handleAddComment}
          isSubmitting={isAddingComment}
          inputRef={inputRef}
        />
      </div>
    )
  }

  return (
    <div className="border-t border-border [&_button:not(:disabled)]:cursor-pointer">
      <div
        data-comment-reaction-boundary
        className={`px-4 pt-3 space-y-3 ${
          shouldScrollComments ? "max-h-72 overflow-y-auto overflow-x-hidden overscroll-contain pe-1" : ""
        }`}
      >
        {comments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            onAddReply={onAddReply}
            onLoadReplies={onLoadReplies}
            onDeleteComment={onDeleteComment}
            onReportComment={onReportComment}
            onReactComment={onReactComment}
          />
        ))}
      </div>
      <CommentInput
        value={commentText}
        onChange={setCommentText}
        onSubmit={handleAddComment}
        isSubmitting={isAddingComment}
        inputRef={inputRef}
      />
    </div>
  )
}
