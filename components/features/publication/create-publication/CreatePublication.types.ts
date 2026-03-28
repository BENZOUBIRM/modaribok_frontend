import type { VisibilityPublication } from "@/types/publication"

export type PublicationComposerMode = "create" | "update"

export interface PublicationComposerSubmitPayload {
  content: string
  visibility: VisibilityPublication
  mediaFiles: File[]
}

export interface CreatePublicationProps {
  className?: string
  onPublished?: () => void
  mode?: PublicationComposerMode
  initialContent?: string
  initialVisibility?: VisibilityPublication
  onCancel?: () => void
  onSubmit?: (
    payload: PublicationComposerSubmitPayload,
  ) => Promise<boolean> | boolean
}
