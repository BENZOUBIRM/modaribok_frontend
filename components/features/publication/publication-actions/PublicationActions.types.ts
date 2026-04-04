import type { ReactionCountsByType, ReactionType } from "@/types"

export interface PublicationActionsProps {
  publicationId: number
  likesCount: number
  commentsCount: number
  sharesCount: number
  reactionsCountByType?: ReactionCountsByType
  currentUserReaction?: ReactionType | null
  onReact?: (publicationId: number, reactionType: ReactionType) => void
  onCommentClick?: () => void
  onShare?: (publicationId: number) => void
  isSharing?: boolean
}
