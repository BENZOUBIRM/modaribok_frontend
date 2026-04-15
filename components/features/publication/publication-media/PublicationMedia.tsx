"use client"

import * as React from "react"
import Image from "next/image"
import { Icon } from "@iconify/react"
import { useDictionary } from "@/providers/dictionary-provider"
import { MediaPreviewer } from "@/components/ui/media-previewer"
import { cn } from "@/lib/utils"
import type { PublicationMediaProps } from "./PublicationMedia.types"

const VIDEO_POSTER_FALLBACK = "/images/man-running.png"
const MAX_VISIBLE_MEDIA = 4

type FeedMediaItem = {
  key: string
  type: "image" | "video"
  sourceIndex: number
  previewIndex: number
  src: string
  poster?: string
  unavailable: boolean
}

function MediaUnavailablePlaceholder({
  label,
  className,
}: {
  label: string
  className?: string
}) {
  return (
    <div className={cn("flex h-full w-full min-h-52 flex-col items-center justify-center gap-2 rounded-lg bg-muted/35 text-muted-foreground", className)}>
      <Icon icon="lucide:image-off" className="size-5" />
      <span className="text-xs font-medium">{label}</span>
    </div>
  )
}

/**
 * Renders publication images using lightweight feed thumbnails.
 * Opens full-quality originals in preview.
 */
export function PublicationMedia({
  images,
  originalImages,
  videos = [],
  videoThumbnails = [],
  forceSquareSingle = false,
}: PublicationMediaProps) {
  const { isRTL, lang } = useDictionary()
  const [isPreviewOpen, setIsPreviewOpen] = React.useState(false)
  const [previewIndex, setPreviewIndex] = React.useState(0)
  const [singleImageAspectRatio, setSingleImageAspectRatio] = React.useState<number | null>(null)
  const [unavailableImages, setUnavailableImages] = React.useState<Record<number, boolean>>({})
  const [unavailableVideos, setUnavailableVideos] = React.useState<Record<number, boolean>>({})
  const [hoveredVideoIndex, setHoveredVideoIndex] = React.useState<number | null>(null)
  const inlineVideoRefs = React.useRef<Record<number, HTMLVideoElement | null>>({})

  const hasImages = images.length > 0
  const hasVideos = videos.length > 0
  const hasMedia = hasImages || hasVideos

  const resolveVideoPoster = React.useCallback((index: number): string => {
    const thumbnail = videoThumbnails[index]
    if (typeof thumbnail === "string" && thumbnail.trim().length > 0) {
      return thumbnail
    }
    return VIDEO_POSTER_FALLBACK
  }, [videoThumbnails])

  const openPreviewAt = React.useCallback((index: number) => {
    setPreviewIndex(index)
    setIsPreviewOpen(true)
  }, [])

  const markImageUnavailable = React.useCallback((index: number) => {
    setUnavailableImages((current) => {
      if (current[index]) return current
      return {
        ...current,
        [index]: true,
      }
    })
  }, [])

  const markVideoUnavailable = React.useCallback((index: number) => {
    setUnavailableVideos((current) => {
      if (current[index]) return current
      return {
        ...current,
        [index]: true,
      }
    })
  }, [])

  React.useEffect(() => {
    setUnavailableImages({})
    setSingleImageAspectRatio(null)
  }, [images])

  React.useEffect(() => {
    setUnavailableVideos({})
    setHoveredVideoIndex(null)
  }, [videos])

  const stopInlineVideo = React.useCallback((index: number) => {
    const videoEl = inlineVideoRefs.current[index]
    if (!videoEl) return

    videoEl.pause()
    videoEl.currentTime = 0
    videoEl.muted = true
  }, [])

  const startInlineVideo = React.useCallback((index: number) => {
    Object.entries(inlineVideoRefs.current).forEach(([key, videoEl]) => {
      if (!videoEl || Number(key) === index) return
      videoEl.pause()
      videoEl.currentTime = 0
      videoEl.muted = true
    })

    const videoEl = inlineVideoRefs.current[index]
    if (!videoEl) return

    videoEl.muted = true
    void videoEl.play().catch(() => {})
  }, [])

  React.useEffect(() => {
    return () => {
      Object.values(inlineVideoRefs.current).forEach((videoEl) => {
        if (!videoEl) return
        videoEl.pause()
      })
    }
  }, [])

  const previewItems = React.useMemo(
    () => [
      ...images.map((imageUrl, index) => ({
        type: "image" as const,
        src: originalImages?.[index] || imageUrl,
        alt: lang === "ar" ? `وسائط المنشور ${index + 1}` : `Post media ${index + 1}`,
        downloadName: `post-image-${index + 1}`,
      })),
      ...videos.map((videoUrl, index) => ({
        type: "video" as const,
        src: videoUrl,
        poster:
          typeof videoThumbnails[index] === "string" && videoThumbnails[index]?.trim().length
            ? videoThumbnails[index]
            : VIDEO_POSTER_FALLBACK,
        alt: lang === "ar" ? `فيديو المنشور ${index + 1}` : `Post video ${index + 1}`,
        downloadName: `post-video-${index + 1}`,
      })),
    ],
    [images, originalImages, videos, videoThumbnails, lang],
  )

  const mediaItems = React.useMemo<FeedMediaItem[]>(() => {
    const imageItems: FeedMediaItem[] = images.map((imageUrl, index) => {
      const imageSrc = imageUrl?.trim() ?? ""

      return {
        key: `image-${index}`,
        type: "image",
        sourceIndex: index,
        previewIndex: index,
        src: imageSrc,
        unavailable: !imageSrc || !!unavailableImages[index],
      }
    })

    const videoItems: FeedMediaItem[] = videos.map((videoUrl, index) => {
      const videoSrc = videoUrl?.trim() ?? ""

      return {
        key: `video-${index}`,
        type: "video",
        sourceIndex: index,
        previewIndex: images.length + index,
        src: videoSrc,
        poster: resolveVideoPoster(index),
        unavailable: !videoSrc || !!unavailableVideos[index],
      }
    })

    return [...imageItems, ...videoItems]
  }, [images, videos, unavailableImages, unavailableVideos, resolveVideoPoster])

  if (!hasMedia) return null

  const unavailableLabel = lang === "ar" ? "الوسائط غير متاحة" : "Media unavailable"
  const visibleMediaItems = mediaItems.slice(0, MAX_VISIBLE_MEDIA)
  const visibleCount = visibleMediaItems.length
  const remainingMediaCount = Math.max(mediaItems.length - visibleCount, 0)
  const singleItem = visibleMediaItems[0]
  const isSingle = visibleCount === 1
  const isSingleSquareImage =
    forceSquareSingle && isSingle && singleItem?.type === "image"
  const singleImageFrameRatio = React.useMemo(() => {
    if (isSingleSquareImage) return 1

    const rawRatio = singleImageAspectRatio ?? 1
    // Keep adaptive behavior while avoiding extreme, overly tall or wide frames.
    return Math.min(1.8, Math.max(0.75, rawRatio))
  }, [isSingleSquareImage, singleImageAspectRatio])

  const gridClass = cn(
    "grid gap-2",
    visibleCount === 2
      && "grid-cols-2 aspect-[2/1]",
    visibleCount >= 3
      && "grid-cols-[minmax(0,2fr)_minmax(0,2fr)_minmax(0,1fr)] grid-rows-2 aspect-[5/2]",
  )

  const getCardClass = (item: FeedMediaItem, index: number): string =>
    cn(
      "group relative w-full overflow-hidden rounded-xl border border-border/35 bg-muted/20",
      item.type === "video" && "bg-black",
      isSingleSquareImage && "aspect-square",
      visibleCount === 2 && "h-full",
      visibleCount >= 3 && (index === 0 || index === 1) && "row-span-2 h-full",
      visibleCount === 3 && index === 2 && "row-span-2 h-full",
      visibleCount >= 4 && (index === 2 || index === 3) && "h-full",
    )

  return (
    <>
      <div className={cn("px-4 pb-3", isSingleSquareImage && "flex")}>
        {isSingle && singleItem ? (
          singleItem.type === "image" ? (
            <button
              type="button"
              onClick={() => openPreviewAt(singleItem.previewIndex)}
              disabled={singleItem.unavailable}
              className={cn(
                "w-full max-w-115 cursor-pointer overflow-hidden rounded-xl border border-border/35 bg-muted/20 disabled:cursor-not-allowed",
                isRTL ? "ml-auto" : "mr-auto",
              )}
              title={lang === "ar" ? "معاينة الصورة" : "Preview image"}
              aria-label={lang === "ar" ? "معاينة الصورة" : "Preview image"}
            >
              {singleItem.unavailable ? (
                <MediaUnavailablePlaceholder
                  label={unavailableLabel}
                  className={
                    isSingleSquareImage
                      ? "min-h-0"
                      : "min-h-56"
                  }
                />
              ) : isSingleSquareImage ? (
                <div className="relative aspect-square w-full overflow-hidden rounded-[inherit] bg-muted/30">
                  <Image
                    src={singleItem.src}
                    alt={lang === "ar" ? `وسائط المنشور ${singleItem.sourceIndex + 1}` : `Post media ${singleItem.sourceIndex + 1}`}
                    fill
                    onError={() => markImageUnavailable(singleItem.sourceIndex)}
                    sizes="(max-width: 768px) 100vw, 720px"
                    className="object-cover"
                  />
                </div>
              ) : (
                <div
                  className="relative w-full overflow-hidden rounded-[inherit] bg-muted/30"
                  style={{ aspectRatio: singleImageFrameRatio }}
                >
                  <Image
                    src={singleItem.src}
                    alt={lang === "ar" ? `وسائط المنشور ${singleItem.sourceIndex + 1}` : `Post media ${singleItem.sourceIndex + 1}`}
                    fill
                    onError={() => markImageUnavailable(singleItem.sourceIndex)}
                    onLoadingComplete={(img) => {
                      const { naturalWidth, naturalHeight } = img
                      if (naturalWidth > 0 && naturalHeight > 0) {
                        setSingleImageAspectRatio(naturalWidth / naturalHeight)
                      }
                    }}
                    sizes="(max-width: 768px) 100vw, 560px"
                    className="object-cover"
                  />
                </div>
              )}
            </button>
          ) : (
            <div
              onMouseEnter={
                singleItem.unavailable
                  ? undefined
                  : () => {
                    setHoveredVideoIndex(singleItem.sourceIndex)
                    startInlineVideo(singleItem.sourceIndex)
                  }
              }
              onMouseLeave={
                singleItem.unavailable
                  ? undefined
                  : () => {
                    setHoveredVideoIndex((current) =>
                      current === singleItem.sourceIndex ? null : current,
                    )
                    stopInlineVideo(singleItem.sourceIndex)
                  }
              }
              className="relative w-full overflow-hidden rounded-xl border border-border/35 bg-black aspect-video"
            >
              {!singleItem.unavailable && (
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation()
                    openPreviewAt(singleItem.previewIndex)
                  }}
                  className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2"
                  title={lang === "ar" ? "معاينة الفيديو" : "Preview video"}
                  aria-label={lang === "ar" ? "معاينة الفيديو" : "Preview video"}
                >
                  <span className="inline-flex size-12 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-black/55 text-white transition-colors hover:border-white/40 hover:bg-black/75">
                    <Icon icon="solar:play-bold" className="size-6" />
                  </span>
                </button>
              )}

              {singleItem.unavailable ? (
                <MediaUnavailablePlaceholder label={unavailableLabel} className="h-full min-h-0" />
              ) : (
                <video
                  src={singleItem.src}
                  poster={singleItem.poster || VIDEO_POSTER_FALLBACK}
                  ref={(node) => {
                    inlineVideoRefs.current[singleItem.sourceIndex] = node
                  }}
                  controls={hoveredVideoIndex === singleItem.sourceIndex}
                  preload="metadata"
                  playsInline
                  onError={() => markVideoUnavailable(singleItem.sourceIndex)}
                  className="h-full w-full bg-black object-contain"
                />
              )}
            </div>
          )
        ) : (
          <div
            dir={isRTL ? "rtl" : "ltr"}
            className={cn("w-full", gridClass)}
          >
            {visibleMediaItems.map((item, index) => {
              const showRemainingBadge = remainingMediaCount > 0 && index === visibleCount - 1

              if (item.type === "image") {
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => openPreviewAt(item.previewIndex)}
                    disabled={item.unavailable}
                    className={cn(
                      getCardClass(item, index),
                      "cursor-pointer disabled:cursor-not-allowed",
                    )}
                    title={lang === "ar" ? "معاينة الصورة" : "Preview image"}
                    aria-label={lang === "ar" ? "معاينة الصورة" : "Preview image"}
                  >
                    {item.unavailable ? (
                      <MediaUnavailablePlaceholder label={unavailableLabel} className="min-h-0" />
                    ) : (
                      <div className="relative h-full w-full overflow-hidden rounded-lg bg-muted/30">
                        <Image
                          src={item.src}
                          alt={lang === "ar" ? `وسائط المنشور ${item.sourceIndex + 1}` : `Post media ${item.sourceIndex + 1}`}
                          fill
                          onError={() => markImageUnavailable(item.sourceIndex)}
                          sizes="(max-width: 768px) 50vw, 360px"
                          className="object-cover"
                        />
                      </div>
                    )}

                    {showRemainingBadge && (
                      <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center rounded-xl bg-black/55 text-lg font-bold text-white">
                        +{remainingMediaCount}
                      </div>
                    )}
                  </button>
                )
              }

              return (
                <div
                  key={item.key}
                  onMouseEnter={
                    item.unavailable
                      ? undefined
                      : () => {
                        setHoveredVideoIndex(item.sourceIndex)
                        startInlineVideo(item.sourceIndex)
                      }
                  }
                  onMouseLeave={
                    item.unavailable
                      ? undefined
                      : () => {
                        setHoveredVideoIndex((current) =>
                          current === item.sourceIndex ? null : current,
                        )
                        stopInlineVideo(item.sourceIndex)
                      }
                  }
                  className={getCardClass(item, index)}
                >
                  {!item.unavailable && (
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation()
                        openPreviewAt(item.previewIndex)
                      }}
                      className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2"
                      title={lang === "ar" ? "معاينة الفيديو" : "Preview video"}
                      aria-label={lang === "ar" ? "معاينة الفيديو" : "Preview video"}
                    >
                      <span className="inline-flex size-12 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-black/55 text-white transition-colors hover:border-white/40 hover:bg-black/75">
                        <Icon icon="solar:play-bold" className="size-6" />
                      </span>
                    </button>
                  )}

                  {item.unavailable ? (
                    <MediaUnavailablePlaceholder label={unavailableLabel} className="min-h-0" />
                  ) : (
                    <video
                      src={item.src}
                      poster={item.poster || VIDEO_POSTER_FALLBACK}
                      ref={(node) => {
                        inlineVideoRefs.current[item.sourceIndex] = node
                      }}
                      controls={hoveredVideoIndex === item.sourceIndex}
                      preload="metadata"
                      playsInline
                      onError={() => markVideoUnavailable(item.sourceIndex)}
                      className="h-full w-full bg-black object-contain"
                    />
                  )}

                  {showRemainingBadge && (
                    <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center bg-black/50 text-lg font-bold text-white">
                      +{remainingMediaCount}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      <MediaPreviewer
        open={isPreviewOpen && previewItems.length > 0}
        items={previewItems}
        startIndex={previewIndex}
        onClose={() => setIsPreviewOpen(false)}
        title={lang === "ar" ? "وسائط المنشور" : "Post media"}
      />
    </>
  )
}
