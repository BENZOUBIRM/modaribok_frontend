import type * as React from "react"

export interface CommentInputProps {
  replyTo?: string
  onCancelReply?: () => void
  value?: string
  onChange?: (value: string) => void
  onSubmit?: () => void
  isSubmitting?: boolean
  inputRef?: React.RefObject<HTMLInputElement | null>
}
