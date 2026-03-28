"use client"

import * as React from "react"
import Image from "next/image"
import { Icon } from "@iconify/react"
import { cn } from "@/lib/utils"
import { useDictionary } from "@/providers/dictionary-provider"
import { useAuth } from "@/providers/auth-provider"
import { publicationService } from "@/services/api"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Textarea } from "@/components/ui/primitives/textarea"
import { Spinner } from "@/components/ui/spinner"
import type { VisibilityPublication } from "@/types/publication"
import type { CreatePublicationProps } from "./CreatePublication.types"

type MediaAttachment = {
  id: string
  file: File
  url: string
}

/**
 * Post composer box — "What's on your mind?" area.
 */
export function CreatePublication({ className, onPublished }: CreatePublicationProps) {
  const { dictionary, isRTL } = useDictionary()
  const { user } = useAuth()
  const t = dictionary.feed
  const [isExpanded, setIsExpanded] = React.useState(false)
  const [content, setContent] = React.useState("")
  const [visibility, setVisibility] = React.useState<VisibilityPublication>("PUBLIC")
  const [isPublishing, setIsPublishing] = React.useState(false)
  const [photoAttachments, setPhotoAttachments] = React.useState<MediaAttachment[]>([])
  const [videoAttachments, setVideoAttachments] = React.useState<MediaAttachment[]>([])
  const [previewMedia, setPreviewMedia] = React.useState<{
    type: "photo" | "video"
    url: string
    name: string
  } | null>(null)

  const photoInputRef = React.useRef<HTMLInputElement>(null)
  const videoInputRef = React.useRef<HTMLInputElement>(null)
  const photoAttachmentsRef = React.useRef<MediaAttachment[]>([])
  const videoAttachmentsRef = React.useRef<MediaAttachment[]>([])

  const avatarSrc = user?.profileImageUrl || "/images/default-user.jpg"
  const visibilityOptions: Array<{
    value: VisibilityPublication
    label: string
    icon: string
  }> = [
    {
      value: "PUBLIC",
      label: t.privacyPublic,
      icon: "solar:global-linear",
    },
    {
      value: "FRIENDS",
      label: t.privacyFriends,
      icon: "solar:users-group-rounded-linear",
    },
    {
      value: "PRIVATE",
      label: t.privacyPrivate,
      icon: "solar:lock-keyhole-linear",
    },
  ]

  const currentVisibility = visibilityOptions.find((option) => option.value === visibility) ?? visibilityOptions[0]
  const hasMediaAttachments = photoAttachments.length > 0 || videoAttachments.length > 0
  const attachmentLabels =
    isRTL
      ? {
          title: "المرفقات",
          photos: "الصور",
          videos: "الفيديوهات",
          empty: "ستظهر العناصر المرفقة هنا",
          remove: "حذف",
          preview: "معاينة",
          closePreview: "إغلاق المعاينة",
        }
      : {
          title: "Attachments",
          photos: "Photos",
          videos: "Videos",
          empty: "Attached items will appear here",
          remove: "Remove",
          preview: "Preview",
          closePreview: "Close preview",
        }

  React.useEffect(() => {
    photoAttachmentsRef.current = photoAttachments
  }, [photoAttachments])

  React.useEffect(() => {
    videoAttachmentsRef.current = videoAttachments
  }, [videoAttachments])

  React.useEffect(() => {
    return () => {
      photoAttachmentsRef.current.forEach((item) => URL.revokeObjectURL(item.url))
      videoAttachmentsRef.current.forEach((item) => URL.revokeObjectURL(item.url))
    }
  }, [])

  const makeAttachmentId = (file: File) =>
    `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2)}`

  const clearAllAttachments = () => {
    photoAttachmentsRef.current.forEach((item) => URL.revokeObjectURL(item.url))
    videoAttachmentsRef.current.forEach((item) => URL.revokeObjectURL(item.url))
    setPhotoAttachments([])
    setVideoAttachments([])
  }

  const handleAddPhotos = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []).filter((file) => file.type.startsWith("image/"))

    if (files.length === 0) {
      return
    }

    const newPhotos = files.map((file) => ({
      id: makeAttachmentId(file),
      file,
      url: URL.createObjectURL(file),
    }))

    setPhotoAttachments((current) => [...current, ...newPhotos])
    event.target.value = ""
  }

  const handleAddVideos = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []).filter((file) => file.type.startsWith("video/"))

    if (files.length === 0) {
      return
    }

    const newVideos = files.map((file) => ({
      id: makeAttachmentId(file),
      file,
      url: URL.createObjectURL(file),
    }))

    setVideoAttachments((current) => [...current, ...newVideos])
    event.target.value = ""
  }

  const removePhoto = (photoId: string) => {
    setPhotoAttachments((current) => {
      const target = current.find((item) => item.id === photoId)
      if (target) {
        URL.revokeObjectURL(target.url)
      }
      return current.filter((item) => item.id !== photoId)
    })
  }

  const removeVideo = (videoId: string) => {
    setVideoAttachments((current) => {
      const target = current.find((item) => item.id === videoId)
      if (target) {
        URL.revokeObjectURL(target.url)
      }
      return current.filter((item) => item.id !== videoId)
    })
  }

  const handlePublish = async () => {
    if (isPublishing) {
      return
    }

    const mediaFiles = [
      ...photoAttachments.map((item) => item.file),
      ...videoAttachments.map((item) => item.file),
    ]

    const trimmedContent = content.trim()
    if (!trimmedContent && mediaFiles.length === 0) {
      return
    }

    setIsPublishing(true)

    const result = await publicationService.createPublication({
      content: trimmedContent,
      visibility,
      mediaFiles,
    })

    setIsPublishing(false)

    if (!result.success) {
      return
    }

    collapseComposer()
    onPublished?.()
  }

  const collapseComposer = () => {
    setIsExpanded(false)
    setContent("")
    clearAllAttachments()
  }

  return (
    <div className={cn("bg-card rounded-xl border border-border", className)} dir={isRTL ? "rtl" : "ltr"}>
      {/* Input row */}
      <div className="flex items-center gap-3 p-4">
        <Image
          src={avatarSrc}
          alt={user?.firstName ?? ""}
          width={40}
          height={40}
          className="size-10 rounded-full object-cover shrink-0"
        />
        <div className="flex-1 relative">
          {isExpanded ? (
            <Textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder={t.whatsOnYourMind}
              className={cn(
                "min-h-28 resize-none rounded-xl border-border bg-surface text-sm",
                isRTL ? "text-right" : "text-left",
              )}
              autoFocus
            />
          ) : (
            <input
              type="text"
              placeholder={t.whatsOnYourMind}
              className={cn(
                "cursor-text w-full h-10 rounded-full bg-surface border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors",
                isRTL ? "pr-4 pl-4 text-right" : "pl-4 pr-4"
              )}
              onFocus={() => setIsExpanded(true)}
              onClick={() => setIsExpanded(true)}
              readOnly
            />
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-between border-t border-border px-4 py-2">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => {
              setIsExpanded(true)
              photoInputRef.current?.click()
            }}
            className="cursor-pointer flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:bg-muted/50 transition-colors"
          >
            <Icon icon="solar:gallery-bold" className="size-5 text-success" />
            <span className="hidden sm:inline">{t.addPhoto}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setIsExpanded(true)
              videoInputRef.current?.click()
            }}
            className="cursor-pointer flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:bg-muted/50 transition-colors"
          >
            <Icon icon="solar:videocamera-record-bold" className="size-5 text-destructive" />
            <span className="hidden sm:inline">{t.addVideo}</span>
          </button>
        </div>

        <input
          ref={photoInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          title={t.addPhoto}
          aria-label={t.addPhoto}
          onChange={handleAddPhotos}
        />
        <input
          ref={videoInputRef}
          type="file"
          accept="video/*"
          multiple
          className="hidden"
          title={t.addVideo}
          aria-label={t.addVideo}
          onChange={handleAddVideos}
        />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:bg-muted/50 transition-colors">
              <Icon icon={currentVisibility.icon} className="size-4" />
              <span>{currentVisibility.label}</span>
              <Icon icon="solar:alt-arrow-down-linear" className="size-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align={isRTL ? "start" : "end"} className="min-w-44">
            {visibilityOptions.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onSelect={() => setVisibility(option.value)}
                className={cn(
                  "flex items-center gap-2",
                  option.value === visibility && "bg-muted dark:bg-muted/60",
                )}
              >
                <Icon icon={option.icon} className="size-4" />
                <span>{option.label}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div
        className={cn(
          "grid transition-all duration-300 ease-in-out",
          isExpanded ? "grid-rows-[1fr] border-t border-border" : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden">
          {hasMediaAttachments && (
            <div className="px-4 pt-3">
              <div className="rounded-xl border border-border bg-surface/40 p-3">
                <div className={cn("mb-3 text-xs font-semibold text-foreground", isRTL && "text-right")}>{attachmentLabels.title}</div>

                {photoAttachments.length > 0 && (
                  <div className="mb-3">
                    <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-foreground">
                      <Icon icon="solar:gallery-linear" className="size-4 text-success" />
                      <span>{attachmentLabels.photos}</span>
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {photoAttachments.map((photo) => (
                        <div key={photo.id} className="group relative h-28 w-44 shrink-0 overflow-hidden rounded-lg border border-border bg-card sm:w-52">
                          <Image
                            src={photo.url}
                            alt={photo.file.name}
                            width={360}
                            height={240}
                            className="h-full w-full object-cover transition-all duration-200 group-hover:blur-[1px] group-hover:brightness-75"
                          />
                          <div className="pointer-events-none absolute inset-0 flex items-center justify-center gap-2 bg-black/30 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                            <button
                              type="button"
                              onClick={() => setPreviewMedia({ type: "photo", url: photo.url, name: photo.file.name })}
                              className="pointer-events-auto inline-flex h-8 cursor-pointer items-center gap-1 rounded-md bg-white/90 px-2 text-xs font-medium text-black transition-colors hover:bg-white"
                              title={attachmentLabels.preview}
                              aria-label={attachmentLabels.preview}
                            >
                              <Icon icon="solar:eye-linear" className="size-4" />
                              {attachmentLabels.preview}
                            </button>
                            <button
                              type="button"
                              onClick={() => removePhoto(photo.id)}
                              className="pointer-events-auto inline-flex size-8 cursor-pointer items-center justify-center rounded-md bg-destructive/90 text-destructive-foreground transition-colors hover:bg-destructive"
                              title={attachmentLabels.remove}
                              aria-label={attachmentLabels.remove}
                            >
                              <Icon icon="solar:trash-bin-trash-linear" className="size-4 text-white" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {videoAttachments.length > 0 && (
                  <div>
                    <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-foreground">
                      <Icon icon="solar:videocamera-record-linear" className="size-4 text-destructive" />
                      <span>{attachmentLabels.videos}</span>
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {videoAttachments.map((video) => (
                        <div key={video.id} className="group relative h-28 w-52 shrink-0 overflow-hidden rounded-lg border border-border bg-card">
                          <video src={video.url} className="h-full w-full bg-muted/40 object-cover transition-all duration-200 group-hover:blur-[1px] group-hover:brightness-75" muted playsInline />
                          <div className="pointer-events-none absolute inset-0 flex items-center justify-center gap-2 bg-black/30 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                            <button
                              type="button"
                              onClick={() => setPreviewMedia({ type: "video", url: video.url, name: video.file.name })}
                              className="pointer-events-auto inline-flex h-8 cursor-pointer items-center gap-1 rounded-md bg-white/90 px-2 text-xs font-medium text-black transition-colors hover:bg-white"
                              title={attachmentLabels.preview}
                              aria-label={attachmentLabels.preview}
                            >
                              <Icon icon="solar:eye-linear" className="size-4" />
                              {attachmentLabels.preview}
                            </button>
                            <button
                              type="button"
                              onClick={() => removeVideo(video.id)}
                              className="pointer-events-auto inline-flex size-8 cursor-pointer items-center justify-center rounded-md bg-destructive/90 text-destructive-foreground transition-colors hover:bg-destructive"
                              title={attachmentLabels.remove}
                              aria-label={attachmentLabels.remove}
                            >
                              <Icon icon="solar:trash-bin-trash-linear" className="size-4 text-white" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className={cn("flex items-center justify-end gap-2 px-4 py-3", isRTL && "justify-start")}>
            <button
              type="button"
              onClick={collapseComposer}
              className="cursor-pointer rounded-md border border-border px-4 py-1.5 text-sm font-medium text-foreground hover:bg-muted/60 transition-colors"
            >
              {t.cancel}
            </button>
            <button
              type="button"
              onClick={handlePublish}
              disabled={isPublishing}
              className="cursor-pointer rounded-md bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPublishing ? (
                <span className="inline-flex items-center gap-1.5">
                  <Spinner className="size-4" />
                  {t.createPost}
                </span>
              ) : (
                t.createPost
              )}
            </button>
          </div>
        </div>
      </div>

      {previewMedia && (
        <div
          className="fixed inset-0 z-70 flex items-center justify-center bg-black/70 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setPreviewMedia(null)}
        >
          <div
            className="relative w-full max-w-3xl rounded-xl border border-white/20 bg-black/40 p-3 backdrop-blur-sm"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setPreviewMedia(null)}
              className="absolute right-3 top-3 z-20 inline-flex size-8 cursor-pointer items-center justify-center rounded-full bg-black/70 text-white transition-colors hover:bg-black/85"
              title={attachmentLabels.closePreview}
              aria-label={attachmentLabels.closePreview}
            >
              <Icon icon="solar:close-circle-bold" className="size-5" />
            </button>

            {previewMedia.type === "photo" ? (
              <img src={previewMedia.url} alt={previewMedia.name} className="max-h-[70vh] w-full rounded-lg object-contain" />
            ) : (
              <video src={previewMedia.url} className="max-h-[70vh] w-full rounded-lg bg-black object-contain" controls autoPlay />
            )}
          </div>
        </div>
      )}
    </div>
  )
}
