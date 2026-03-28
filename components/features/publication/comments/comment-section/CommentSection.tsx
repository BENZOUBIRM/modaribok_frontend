"use client"

import * as React from "react"
import { CommentItem } from "../comment-item"
import { CommentInput } from "../comment-input"
import type { MockComment } from "@/types"

/**
 * Comment section: list of comments + "write a comment" input.
 */
export function CommentSection({
  comments,
  onAddComment,
  onAddReply,
  onLoadReplies,
  isAddingComment,
  focusSignal,
  scrollable,
}: {
  comments: MockComment[]
  onAddComment?: (content: string) => Promise<void> | void
  onAddReply?: (parentCommentId: number, content: string) => Promise<boolean> | boolean
  onLoadReplies?: (commentId: number) => Promise<void> | void
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
      <div className="border-t border-border">
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
    <div className="border-t border-border">
      <div
        className={`px-4 pt-3 space-y-3 ${
          shouldScrollComments ? "max-h-72 overflow-y-auto overscroll-contain pe-1" : ""
        }`}
      >
        {comments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            onAddReply={onAddReply}
            onLoadReplies={onLoadReplies}
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
