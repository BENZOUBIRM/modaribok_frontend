import type { ReactionCountsByType, ReactionType } from "@/types"

export type ReactionTriggerVariant = "publication" | "comment"

export interface SharedReactionControlProps {
  entityId: number
  likesCount: number
  reactionsCountByType?: ReactionCountsByType
  currentUserReaction?: ReactionType | null
  onReact?: (entityId: number, reactionType: ReactionType) => void
  variant?: ReactionTriggerVariant
  pickerZIndexClassName?: string
  pickerSideClassName?: string
  pickerWidthClassName?: string
  triggerContainerClassName?: string
}
