export interface OtherUserProfileModalProps {
  open: boolean
  userId: number | null
  fallbackAvatarUrl?: string
  fallbackDisplayName?: string
  onOpenChange: (open: boolean) => void
}
