"use client"

import { CommentItem } from "./CommentItem"
import { CommentInput } from "./CommentInput"
import type { MockComment } from "@/components/homepage/mock-data"

/**
 * Comment section: list of comments + "write a comment" input.
 */
export function CommentSection({ comments }: { comments: MockComment[] }) {
  if (!comments.length) {
    return (
      <div className="border-t border-border">
        <CommentInput />
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
      <CommentInput />
    </div>
  )
}
