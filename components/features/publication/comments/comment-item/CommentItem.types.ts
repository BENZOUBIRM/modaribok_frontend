import type { MockComment } from "@/types/publication"

export interface CommentItemProps {
  comment: MockComment
  isReply?: boolean
  onAddReply?: (parentCommentId: number, content: string) => Promise<boolean> | boolean
  onLoadReplies?: (commentId: number) => Promise<void> | void
}
