import type { PublicationMediaDto, VisibilityPublication } from "@/types/publication"

export type PublicationComposerMode = "create" | "update"

export interface PublicationComposerSubmitPayload {
  content: string
  visibility: VisibilityPublication
  mediaFiles: File[]
  mediaIdsToRemove: number[]
}

export interface CreatePublicationProps {
  className?: string
  onPublished?: () => void
  mode?: PublicationComposerMode
  initialContent?: string
  initialVisibility?: VisibilityPublication
  initialMedia?: PublicationMediaDto[]
  allowMediaAdditions?: boolean
  onCancel?: () => void
  onSubmit?: (
    payload: PublicationComposerSubmitPayload,
  ) => Promise<boolean> | boolean
}
