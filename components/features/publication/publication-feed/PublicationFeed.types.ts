export interface PublicationFeedProps {
  className?: string
  publicationCardClassName?: string
  refreshKey?: number
  userId?: number
  showHeader?: boolean
  showSuggestions?: boolean
  emptyState?: React.ReactNode
  externalFollowStateByUserId?: Record<number, "follow" | "following">
}
