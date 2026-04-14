import type { MockComment } from "@/types/publication"

export interface CommentSectionProps {
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
  onOpenUserProfile?: (params: { userId: number | string; avatarUrl?: string; displayName?: string }) => void
  isAddingComment?: boolean
  focusSignal?: number
  scrollable?: boolean
}
