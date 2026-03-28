import type { MockComment } from "@/types/publication"

export interface CommentSectionProps {
  comments: MockComment[]
  onAddComment?: (content: string) => Promise<void> | void
  onAddReply?: (parentCommentId: number, content: string) => Promise<boolean> | boolean
  onLoadReplies?: (commentId: number) => Promise<void> | void
  isAddingComment?: boolean
  focusSignal?: number
  scrollable?: boolean
}
