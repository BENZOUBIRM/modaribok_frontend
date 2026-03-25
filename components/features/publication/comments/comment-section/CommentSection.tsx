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
  isAddingComment,
  focusSignal,
}: {
  comments: MockComment[]
  onAddComment?: (content: string) => Promise<void> | void
  isAddingComment?: boolean
  focusSignal?: number
}) {
  const [commentText, setCommentText] = React.useState("")
  const inputRef = React.useRef<HTMLInputElement | null>(null)

  React.useEffect(() => {
    if (typeof focusSignal === "number") {
      inputRef.current?.focus()
    }
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
      <div className="px-4 pt-3 space-y-3">
        {comments.map((comment) => (
          <CommentItem key={comment.id} comment={comment} />
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
