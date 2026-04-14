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
import { MediaPreviewer } from "@/components/ui/media-previewer"
import { Textarea } from "@/components/ui/primitives/textarea"
import { Spinner } from "@/components/ui/spinner"
import type { PublicationMediaDto, VisibilityPublication } from "@/types/publication"
import type { CreatePublicationProps } from "./CreatePublication.types"

type MediaAttachment = {
  id: string
  file: File
  url: string
}

type ExistingMediaAttachment = {
  id: number
  mediaType: PublicationMediaDto["mediaType"]
  url: string
  thumbnailUrl: string | null
  displayOrder: number
}

/**
 * Post composer box — "What's on your mind?" area.
 */
export function CreatePublication({
  className,
  onPublished,
  mode = "create",
  initialContent,
  initialVisibility,
  initialMedia,
  allowMediaAdditions = true,
  onCancel,
  onSubmit,
}: CreatePublicationProps) {
  const { dictionary, isRTL } = useDictionary()
  const { user } = useAuth()
  const t = dictionary.feed
  const isUpdateMode = mode === "update"
  const isMediaEnabled = true
  const isMediaAdditionEnabled = isMediaEnabled && allowMediaAdditions
  const submitLabel = isUpdateMode ? t.updatePost : t.createPost
  const [isExpanded, setIsExpanded] = React.useState(false)
  const [content, setContent] = React.useState("")
  const [visibility, setVisibility] = React.useState<VisibilityPublication>("PUBLIC")
  const [isPublishing, setIsPublishing] = React.useState(false)
  const [existingMediaAttachments, setExistingMediaAttachments] = React.useState<ExistingMediaAttachment[]>([])
  const [removedMediaIds, setRemovedMediaIds] = React.useState<number[]>([])
  const [photoAttachments, setPhotoAttachments] = React.useState<MediaAttachment[]>([])
  const [videoAttachments, setVideoAttachments] = React.useState<MediaAttachment[]>([])
  const [isPreviewOpen, setIsPreviewOpen] = React.useState(false)
  const [previewStartIndex, setPreviewStartIndex] = React.useState(0)

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
  const collapseTextareaLabel = isRTL ? "طي مربع النص" : "Collapse text area"
  const isComposerBodyExpanded = isUpdateMode || isExpanded
  const existingPhotoAttachments = React.useMemo(
    () => existingMediaAttachments.filter((media) => media.mediaType === "image"),
    [existingMediaAttachments],
  )
  const existingVideoAttachments = React.useMemo(
    () => existingMediaAttachments.filter((media) => media.mediaType === "video"),
    [existingMediaAttachments],
  )
  const hasMediaAttachments =
    existingMediaAttachments.length > 0
    || photoAttachments.length > 0
    || videoAttachments.length > 0
  const attachmentLabels =
    isRTL
      ? {
          title: "المرفقات",
          existingPhotos: "الصور الحالية",
          existingVideos: "الفيديوهات الحالية",
          newPhotos: "صور جديدة",
          newVideos: "فيديوهات جديدة",
          empty: "ستظهر العناصر المرفقة هنا",
          remove: "حذف",
          preview: "معاينة",
          closePreview: "إغلاق المعاينة",
        }
      : {
          title: "Attachments",
          existingPhotos: "Current photos",
          existingVideos: "Current videos",
          newPhotos: "New photos",
          newVideos: "New videos",
          empty: "Attached items will appear here",
          remove: "Remove",
          preview: "Preview",
          closePreview: "Close preview",
        }

  const previewItems = React.useMemo(
    () => [
      ...existingMediaAttachments.map((media) => ({
        type: media.mediaType,
        src: media.url,
        alt: media.mediaType === "image" ? `image-${media.id}` : `video-${media.id}`,
        downloadName: media.mediaType === "image" ? `image-${media.id}` : `video-${media.id}`,
      })),
      ...photoAttachments.map((photo, index) => ({
        type: "image" as const,
        src: photo.url,
        alt: photo.file.name,
        downloadName: photo.file.name || `photo-${index + 1}`,
      })),
      ...videoAttachments.map((video, index) => ({
        type: "video" as const,
        src: video.url,
        alt: video.file.name,
        downloadName: video.file.name || `video-${index + 1}`,
      })),
    ],
    [existingMediaAttachments, photoAttachments, videoAttachments],
  )

  const openPreviewAt = React.useCallback((index: number) => {
    setPreviewStartIndex(index)
    setIsPreviewOpen(true)
  }, [])

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

  function clearAllAttachments() {
    photoAttachmentsRef.current.forEach((item) => URL.revokeObjectURL(item.url))
    videoAttachmentsRef.current.forEach((item) => URL.revokeObjectURL(item.url))
    setPhotoAttachments([])
    setVideoAttachments([])
  }

  React.useEffect(() => {
    if (!isUpdateMode) {
      return
    }

    setIsExpanded(false)
    setContent(initialContent ?? "")
    setVisibility(initialVisibility ?? "PUBLIC")
    setExistingMediaAttachments(
      [...(initialMedia ?? [])]
        .sort((a, b) => a.displayOrder - b.displayOrder)
        .map((media) => ({
          id: media.id,
          mediaType: media.mediaType,
          url: media.url,
          thumbnailUrl: media.thumbnailUrl ?? null,
          displayOrder: media.displayOrder,
        })),
    )
    setRemovedMediaIds([])
    clearAllAttachments()
  }, [initialContent, initialMedia, initialVisibility, isUpdateMode])

  const handleAddPhotos = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!isMediaAdditionEnabled) {
      event.target.value = ""
      return
    }

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
    if (!isMediaAdditionEnabled) {
      event.target.value = ""
      return
    }

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

  const removeExistingMedia = (mediaId: number) => {
    setExistingMediaAttachments((current) => current.filter((item) => item.id !== mediaId))
    setRemovedMediaIds((current) => (current.includes(mediaId) ? current : [...current, mediaId]))
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
    if (!trimmedContent && mediaFiles.length === 0 && existingMediaAttachments.length === 0) {
      return
    }

    setIsPublishing(true)

    let isSuccess = false

    if (onSubmit) {
      const submitted = await onSubmit({
        content: trimmedContent,
        visibility,
        mediaFiles,
        mediaIdsToRemove: removedMediaIds,
      })

      isSuccess = Boolean(submitted)
    } else if (isUpdateMode) {
      setIsPublishing(false)
      return
    } else {
      const result = await publicationService.createPublication({
        content: trimmedContent,
        visibility,
        mediaFiles,
      })

      isSuccess = result.success
    }

    setIsPublishing(false)

    if (!isSuccess) {
      return
    }

    if (!isUpdateMode) {
      collapseComposer()
    }

    onPublished?.()
  }

  const collapseComposer = () => {
    setIsExpanded(false)
    setContent("")
    setVisibility("PUBLIC")
    setExistingMediaAttachments([])
    setRemovedMediaIds([])
    clearAllAttachments()
  }

  const handleCancel = () => {
    if (isUpdateMode) {
      onCancel?.()
      return
    }

    collapseComposer()
    onCancel?.()
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
            <>
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
              {isUpdateMode && (
                <button
                  type="button"
                  onClick={() => setIsExpanded(false)}
                  className={cn(
                    "absolute top-2 inline-flex size-7 cursor-pointer items-center justify-center rounded-md border border-border bg-background/85 text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground",
                    isRTL ? "left-2" : "right-2",
                  )}
                  title={collapseTextareaLabel}
                  aria-label={collapseTextareaLabel}
                >
                  <Icon icon="lucide:chevron-down" className="size-4" />
                </button>
              )}
            </>
          ) : (
            <input
              type="text"
              value={isUpdateMode ? content : undefined}
              placeholder={t.whatsOnYourMind}
              className={cn(
                "cursor-text w-full h-10 rounded-full bg-surface border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors",
                isRTL ? "pr-4 pl-4 text-right" : "pl-4 pr-4"
              )}
              onFocus={() => setIsExpanded(true)}
              onClick={() => setIsExpanded(true)}
              readOnly
              title={isUpdateMode ? content : undefined}
            />
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-between border-t border-border px-4 py-2">
        {isMediaEnabled && (
          <>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  if (!isMediaAdditionEnabled) {
                    return
                  }

                  setIsExpanded(true)
                  photoInputRef.current?.click()
                }}
                disabled={!isMediaAdditionEnabled}
                className="cursor-pointer flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:bg-muted/50 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Icon icon="solar:gallery-bold" className="size-5 text-success" />
                <span className="hidden sm:inline">{t.addPhoto}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!isMediaAdditionEnabled) {
                    return
                  }

                  setIsExpanded(true)
                  videoInputRef.current?.click()
                }}
                disabled={!isMediaAdditionEnabled}
                className="cursor-pointer flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:bg-muted/50 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
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
          </>
        )}

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
          isComposerBodyExpanded ? "grid-rows-[1fr] border-t border-border" : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden">
          {isMediaEnabled && hasMediaAttachments && (
            <div className="px-4 pt-3">
              <div className="rounded-xl border border-border bg-surface/40 p-3">
                <div className={cn("mb-3 text-xs font-semibold text-foreground", isRTL && "text-right")}>{attachmentLabels.title}</div>

                {existingPhotoAttachments.length > 0 && (
                  <div className="mb-3">
                    <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-foreground">
                      <Icon icon="solar:gallery-linear" className="size-4 text-success" />
                      <span>{attachmentLabels.existingPhotos}</span>
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {existingPhotoAttachments.map((photo) => {
                        const previewIndex = existingMediaAttachments.findIndex((item) => item.id === photo.id)

                        return (
                          <div key={`existing-photo-${photo.id}`} className="group relative h-28 w-44 shrink-0 overflow-hidden rounded-lg border border-border bg-card sm:w-52">
                            <Image
                              src={photo.thumbnailUrl || photo.url}
                              alt={`existing-photo-${photo.id}`}
                              width={360}
                              height={240}
                              className="h-full w-full object-cover transition-all duration-200 group-hover:blur-[1px] group-hover:brightness-75"
                            />
                            <div className="pointer-events-none absolute inset-0 flex items-center justify-center gap-2 bg-black/30 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                              <button
                                type="button"
                                onClick={() => {
                                  if (previewIndex >= 0) {
                                    openPreviewAt(previewIndex)
                                  }
                                }}
                                className="pointer-events-auto inline-flex h-8 cursor-pointer items-center gap-1 rounded-md bg-white/90 px-2 text-xs font-medium text-black transition-colors hover:bg-white"
                                title={attachmentLabels.preview}
                                aria-label={attachmentLabels.preview}
                              >
                                <Icon icon="solar:eye-linear" className="size-4" />
                                {attachmentLabels.preview}
                              </button>
                              <button
                                type="button"
                                onClick={() => removeExistingMedia(photo.id)}
                                className="pointer-events-auto inline-flex size-8 cursor-pointer items-center justify-center rounded-md bg-destructive/90 text-destructive-foreground transition-colors hover:bg-destructive"
                                title={attachmentLabels.remove}
                                aria-label={attachmentLabels.remove}
                              >
                                <Icon icon="solar:trash-bin-trash-linear" className="size-4 text-white" />
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {existingVideoAttachments.length > 0 && (
                  <div className="mb-3">
                    <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-foreground">
                      <Icon icon="solar:videocamera-record-linear" className="size-4 text-destructive" />
                      <span>{attachmentLabels.existingVideos}</span>
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {existingVideoAttachments.map((video) => {
                        const previewIndex = existingMediaAttachments.findIndex((item) => item.id === video.id)

                        return (
                          <div key={`existing-video-${video.id}`} className="group relative h-28 w-52 shrink-0 overflow-hidden rounded-lg border border-border bg-card">
                            {video.thumbnailUrl ? (
                              <Image
                                src={video.thumbnailUrl}
                                alt={`existing-video-${video.id}`}
                                width={360}
                                height={240}
                                className="h-full w-full object-cover transition-all duration-200 group-hover:blur-[1px] group-hover:brightness-75"
                              />
                            ) : (
                              <video
                                src={video.url}
                                className="h-full w-full bg-muted/40 object-cover transition-all duration-200 group-hover:blur-[1px] group-hover:brightness-75"
                                muted
                                playsInline
                              />
                            )}
                            <div className="pointer-events-none absolute inset-0 flex items-center justify-center gap-2 bg-black/30 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                              <button
                                type="button"
                                onClick={() => {
                                  if (previewIndex >= 0) {
                                    openPreviewAt(previewIndex)
                                  }
                                }}
                                className="pointer-events-auto inline-flex h-8 cursor-pointer items-center gap-1 rounded-md bg-white/90 px-2 text-xs font-medium text-black transition-colors hover:bg-white"
                                title={attachmentLabels.preview}
                                aria-label={attachmentLabels.preview}
                              >
                                <Icon icon="solar:eye-linear" className="size-4" />
                                {attachmentLabels.preview}
                              </button>
                              <button
                                type="button"
                                onClick={() => removeExistingMedia(video.id)}
                                className="pointer-events-auto inline-flex size-8 cursor-pointer items-center justify-center rounded-md bg-destructive/90 text-destructive-foreground transition-colors hover:bg-destructive"
                                title={attachmentLabels.remove}
                                aria-label={attachmentLabels.remove}
                              >
                                <Icon icon="solar:trash-bin-trash-linear" className="size-4 text-white" />
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {photoAttachments.length > 0 && (
                  <div className="mb-3">
                    <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-foreground">
                      <Icon icon="solar:gallery-linear" className="size-4 text-success" />
                      <span>{attachmentLabels.newPhotos}</span>
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {photoAttachments.map((photo, photoIndex) => (
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
                              onClick={() => openPreviewAt(existingMediaAttachments.length + photoIndex)}
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
                      <span>{attachmentLabels.newVideos}</span>
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {videoAttachments.map((video, videoIndex) => (
                        <div key={video.id} className="group relative h-28 w-52 shrink-0 overflow-hidden rounded-lg border border-border bg-card">
                          <video src={video.url} className="h-full w-full bg-muted/40 object-cover transition-all duration-200 group-hover:blur-[1px] group-hover:brightness-75" muted playsInline />
                          <div className="pointer-events-none absolute inset-0 flex items-center justify-center gap-2 bg-black/30 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                            <button
                              type="button"
                              onClick={() => openPreviewAt(existingMediaAttachments.length + photoAttachments.length + videoIndex)}
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
              onClick={handleCancel}
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
                  {submitLabel}
                </span>
              ) : (
                submitLabel
              )}
            </button>
          </div>
        </div>
      </div>

      <MediaPreviewer
        open={isPreviewOpen && previewItems.length > 0}
        items={previewItems}
        startIndex={previewStartIndex}
        onClose={() => setIsPreviewOpen(false)}
        title={attachmentLabels.title}
      />
    </div>
  )
}
