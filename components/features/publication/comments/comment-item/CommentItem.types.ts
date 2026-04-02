import type { MockComment } from "@/types/publication"
import type { ReactionType } from "@/types"

export interface CommentItemProps {
  comment: MockComment
  isReply?: boolean
  onAddReply?: (parentCommentId: number, content: string) => Promise<boolean> | boolean
  onLoadReplies?: (commentId: number) => Promise<void> | void
  onDeleteComment?: (commentId: number) => Promise<boolean> | boolean
  onReportComment?: (commentId: number) => Promise<boolean> | boolean
  onReactComment?: (commentId: number, reactionType: ReactionType) => void
}
