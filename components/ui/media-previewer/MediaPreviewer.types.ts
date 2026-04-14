export type MediaPreviewerItemType = "image" | "video"

export interface MediaPreviewerItem {
  type: MediaPreviewerItemType
  src: string
  alt?: string
  poster?: string | null
  downloadName?: string
}

export interface MediaPreviewerProps {
  open: boolean
  items: MediaPreviewerItem[]
  startIndex?: number
  onClose: () => void
  title?: string
  className?: string
}
