"use client"

import * as React from "react"
import Image from "next/image"
import { Icon } from "@iconify/react"
import { useDictionary } from "@/providers/dictionary-provider"
import type { PublicationMediaProps } from "./PublicationMedia.types"

/**
 * Renders publication images using lightweight feed thumbnails.
 * Opens full-quality originals in preview.
 */
export function PublicationMedia({ images, originalImages, forceSquareSingle = false }: PublicationMediaProps) {
  const { isRTL } = useDictionary()
  const [previewIndex, setPreviewIndex] = React.useState<number | null>(null)
  const [singleImageAspectRatio, setSingleImageAspectRatio] = React.useState<number | null>(null)

  if (!images.length) return null

  const resolvePreviewUrl = (index: number) => originalImages?.[index] || images[index]
  const visibleImages = images.length > 3 ? images.slice(0, 3) : images
  const remainingImagesCount = Math.max(images.length - 3, 0)

  const isSingle = images.length === 1
  const isSingleLandscape = !forceSquareSingle && isSingle && (singleImageAspectRatio ?? 1) > 1.2

  const goToPrevious = () => {
    if (previewIndex === null) return
    setPreviewIndex((current) => {
      if (current === null) return current
      return current > 0 ? current - 1 : current
    })
  }

  const goToNext = () => {
    if (previewIndex === null) return
    setPreviewIndex((current) => {
      if (current === null) return current
      return current < images.length - 1 ? current + 1 : current
    })
  }

  const canGoPrevious = previewIndex !== null && previewIndex > 0
  const canGoNext = previewIndex !== null && previewIndex < images.length - 1

  return (
    <>
      <div className="px-4 pb-3">
        {isSingle ? (
          <div className={`flex ${isSingleLandscape ? "justify-stretch" : "justify-start"}`}>
            <button
              type="button"
              onClick={() => setPreviewIndex(0)}
              className={`cursor-pointer overflow-hidden rounded-xl border border-border/60 bg-muted/20 p-1 ${forceSquareSingle ? "aspect-square w-full max-w-115" : isSingleLandscape ? "w-full" : "w-full max-w-115"}`}
              title="Preview image"
              aria-label="Preview image"
            >
              <Image
                src={images[0]}
                alt="Post media"
                width={1200}
                height={800}
                onLoadingComplete={(img) => {
                  if (forceSquareSingle) {
                    return
                  }
                  const { naturalWidth, naturalHeight } = img
                  if (naturalWidth > 0 && naturalHeight > 0) {
                    setSingleImageAspectRatio(naturalWidth / naturalHeight)
                  }
                }}
                className={forceSquareSingle ? "h-full w-full rounded-lg bg-muted/30 object-cover" : "h-auto max-h-[70vh] w-full rounded-lg bg-muted/30 object-cover"}
              />
            </button>
          </div>
        ) : (
          <div dir={isRTL ? "rtl" : "ltr"} className={`grid gap-2 ${visibleImages.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
            {visibleImages.map((img, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setPreviewIndex(index)}
                className="group relative aspect-square w-full cursor-pointer overflow-hidden rounded-xl border border-border/60 bg-muted/20 p-1"
                title="Preview image"
                aria-label="Preview image"
              >
                <Image
                  src={img}
                  alt={`Post media ${index + 1}`}
                  width={800}
                  height={800}
                  className="h-full w-full rounded-lg bg-muted/30 object-cover"
                />

                {remainingImagesCount > 0 && index === 2 && (
                  <div className="absolute inset-1 flex items-center justify-center rounded-lg bg-black/55 text-lg font-bold text-white">
                    +{remainingImagesCount}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {previewIndex !== null && (
        <div
          className="fixed inset-0 z-70 flex items-center justify-center bg-black/75 p-4"
          onClick={() => setPreviewIndex(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Image preview"
        >
          <div
            className="relative w-full max-w-4xl rounded-xl border border-white/20 bg-black/40 p-3"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="relative flex h-[80vh] items-center justify-center rounded-lg bg-black/25 p-2">
              {canGoPrevious && (
                <button
                  type="button"
                  onClick={goToPrevious}
                  className={`absolute z-20 inline-flex size-10 cursor-pointer items-center justify-center rounded-full border border-border bg-background/85 text-foreground transition-colors hover:bg-muted/80 dark:border-zinc-700 dark:bg-zinc-900/80 dark:text-white dark:hover:bg-zinc-800 ${isRTL ? "right-3" : "left-3"}`}
                  title="Previous"
                  aria-label="Previous"
                >
                  <Icon icon={isRTL ? "lucide:chevron-right" : "lucide:chevron-left"} className="size-5" />
                </button>
              )}

            <button
              type="button"
              onClick={() => setPreviewIndex(null)}
              className="absolute right-3 top-3 z-20 inline-flex size-9 cursor-pointer items-center justify-center rounded-full border border-border bg-background/85 text-foreground transition-colors hover:bg-muted/80 dark:border-zinc-700 dark:bg-zinc-900/80 dark:text-white dark:hover:bg-zinc-800"
              title="Close preview"
              aria-label="Close preview"
            >
              <Icon icon="lucide:x" className="size-5" />
            </button>

            <img
              src={resolvePreviewUrl(previewIndex)}
              alt={`Post media ${previewIndex + 1}`}
              className="max-h-full w-full rounded-lg object-contain"
            />

              {canGoNext && (
                <button
                  type="button"
                  onClick={goToNext}
                  className={`absolute z-20 inline-flex size-10 cursor-pointer items-center justify-center rounded-full border border-border bg-background/85 text-foreground transition-colors hover:bg-muted/80 dark:border-zinc-700 dark:bg-zinc-900/80 dark:text-white dark:hover:bg-zinc-800 ${isRTL ? "left-3" : "right-3"}`}
                  title="Next"
                  aria-label="Next"
                >
                  <Icon icon={isRTL ? "lucide:chevron-left" : "lucide:chevron-right"} className="size-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
