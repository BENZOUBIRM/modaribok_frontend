"use client"

import * as React from "react"
import { Icon } from "@iconify/react"

import { useDictionary } from "@/providers/dictionary-provider"
import { cn } from "@/lib/utils"
import type { MediaPreviewerProps } from "./MediaPreviewer.types"

const MIN_ZOOM = 1
const MAX_ZOOM = 4
const ZOOM_STEP = 0.25
const DOUBLE_CLICK_ZOOM = 2

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export function MediaPreviewer({
  open,
  items,
  startIndex = 0,
  onClose,
  title,
  className,
}: MediaPreviewerProps) {
  const { lang, isRTL, dictionary } = useDictionary()

  const [activeIndex, setActiveIndex] = React.useState(() => clamp(startIndex, 0, Math.max(items.length - 1, 0)))
  const [zoom, setZoom] = React.useState(MIN_ZOOM)
  const [pan, setPan] = React.useState({ x: 0, y: 0 })
  const [isDraggingImage, setIsDraggingImage] = React.useState(false)
  const viewportRef = React.useRef<HTMLDivElement | null>(null)
  const imageRef = React.useRef<HTMLImageElement | null>(null)
  const dragStateRef = React.useRef({
    pointerId: -1,
    startX: 0,
    startY: 0,
    originX: 0,
    originY: 0,
  })

  const clampPan = React.useCallback((nextX: number, nextY: number, nextZoom: number) => {
    if (nextZoom <= MIN_ZOOM) {
      return { x: 0, y: 0 }
    }

    const viewportEl = viewportRef.current
    const imageEl = imageRef.current

    if (!viewportEl || !imageEl) {
      return { x: nextX, y: nextY }
    }

    const scaledWidth = imageEl.clientWidth * nextZoom
    const scaledHeight = imageEl.clientHeight * nextZoom
    const maxX = Math.max((scaledWidth - viewportEl.clientWidth) / 2, 0)
    const maxY = Math.max((scaledHeight - viewportEl.clientHeight) / 2, 0)

    return {
      x: clamp(nextX, -maxX, maxX),
      y: clamp(nextY, -maxY, maxY),
    }
  }, [])

  React.useLayoutEffect(() => {
    if (!open) return

    setActiveIndex(clamp(startIndex, 0, Math.max(items.length - 1, 0)))
    setZoom(MIN_ZOOM)
    setPan({ x: 0, y: 0 })
    setIsDraggingImage(false)
    dragStateRef.current.pointerId = -1
  }, [open, startIndex, items.length])

  const activeItem = items[activeIndex]
  const isImage = activeItem?.type === "image"

  const canGoPrevious = open && activeIndex > 0
  const canGoNext = open && activeIndex < items.length - 1

  const goToPrevious = React.useCallback(() => {
    setActiveIndex((current) => (current > 0 ? current - 1 : current))
    setZoom(MIN_ZOOM)
    setPan({ x: 0, y: 0 })
    setIsDraggingImage(false)
    dragStateRef.current.pointerId = -1
  }, [])

  const goToNext = React.useCallback(() => {
    setActiveIndex((current) => (current < items.length - 1 ? current + 1 : current))
    setZoom(MIN_ZOOM)
    setPan({ x: 0, y: 0 })
    setIsDraggingImage(false)
    dragStateRef.current.pointerId = -1
  }, [items.length])

  const zoomIn = React.useCallback(() => {
    setZoom((current) => clamp(Number((current + ZOOM_STEP).toFixed(2)), MIN_ZOOM, MAX_ZOOM))
  }, [])

  const zoomOut = React.useCallback(() => {
    setZoom((current) => clamp(Number((current - ZOOM_STEP).toFixed(2)), MIN_ZOOM, MAX_ZOOM))
  }, [])

  const resetZoom = React.useCallback(() => {
    setZoom(MIN_ZOOM)
    setPan({ x: 0, y: 0 })
    setIsDraggingImage(false)
    dragStateRef.current.pointerId = -1
  }, [])

  const handleDownload = React.useCallback(() => {
    if (!activeItem) return

    const anchor = document.createElement("a")
    anchor.href = activeItem.src
    anchor.target = "_blank"
    anchor.rel = "noopener noreferrer"
    anchor.download = activeItem.downloadName || `media-${activeIndex + 1}`
    document.body.appendChild(anchor)
    anchor.click()
    document.body.removeChild(anchor)
  }, [activeItem, activeIndex])

  React.useEffect(() => {
    if (!open) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault()
        onClose()
        return
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault()
        if (isRTL) {
          if (canGoNext) goToNext()
        } else if (canGoPrevious) {
          goToPrevious()
        }
        return
      }

      if (event.key === "ArrowRight") {
        event.preventDefault()
        if (isRTL) {
          if (canGoPrevious) goToPrevious()
        } else if (canGoNext) {
          goToNext()
        }
        return
      }

      if (activeItem?.type !== "image") return

      if (event.key === "+" || event.key === "=") {
        event.preventDefault()
        zoomIn()
        return
      }

      if (event.key === "-" || event.key === "_") {
        event.preventDefault()
        zoomOut()
        return
      }

      if (event.key === "0") {
        event.preventDefault()
        resetZoom()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [
    activeItem?.type,
    canGoNext,
    canGoPrevious,
    goToNext,
    goToPrevious,
    isRTL,
    onClose,
    open,
    resetZoom,
    zoomIn,
    zoomOut,
  ])

  React.useEffect(() => {
    if (!isImage) {
      setPan({ x: 0, y: 0 })
      setIsDraggingImage(false)
      dragStateRef.current.pointerId = -1
      return
    }

    setPan((current) => clampPan(current.x, current.y, zoom))

    if (zoom <= MIN_ZOOM) {
      setIsDraggingImage(false)
      dragStateRef.current.pointerId = -1
    }
  }, [isImage, zoom, activeIndex, clampPan])

  const endImageDrag = React.useCallback((event?: React.PointerEvent<HTMLImageElement>) => {
    const pointerId = dragStateRef.current.pointerId

    if (event && pointerId === event.pointerId) {
      try {
        event.currentTarget.releasePointerCapture(event.pointerId)
      } catch {
        // No-op when capture is already released.
      }
    }

    dragStateRef.current.pointerId = -1
    setIsDraggingImage(false)
  }, [])

  const handleImagePointerDown = React.useCallback((event: React.PointerEvent<HTMLImageElement>) => {
    event.preventDefault()
    dragStateRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: pan.x,
      originY: pan.y,
    }
    setIsDraggingImage(true)
    event.currentTarget.setPointerCapture(event.pointerId)
  }, [pan.x, pan.y])

  const handleImagePointerMove = React.useCallback((event: React.PointerEvent<HTMLImageElement>) => {
    if (!isDraggingImage) return
    if (dragStateRef.current.pointerId !== event.pointerId) return

    event.preventDefault()
    const deltaX = event.clientX - dragStateRef.current.startX
    const deltaY = event.clientY - dragStateRef.current.startY
    const nextX = dragStateRef.current.originX + deltaX
    const nextY = dragStateRef.current.originY + deltaY

    setPan(clampPan(nextX, nextY, zoom))
  }, [clampPan, isDraggingImage, zoom])

  const handleImageDoubleClick = React.useCallback(() => {
    if (zoom > MIN_ZOOM) {
      resetZoom()
      return
    }

    const nextZoom = Math.min(DOUBLE_CLICK_ZOOM, MAX_ZOOM)
    setZoom(nextZoom)
    setPan((current) => clampPan(current.x, current.y, nextZoom))
    setIsDraggingImage(false)
    dragStateRef.current.pointerId = -1
  }, [clampPan, resetZoom, zoom])

  if (!open || !activeItem) return null

  const labels =
    lang === "ar"
      ? {
          close: dictionary.common.close,
          previous: "السابق",
          next: dictionary.common.next,
          zoomIn: "تكبير",
          zoomOut: "تصغير",
          resetZoom: "إعادة",
          download: "تنزيل",
          dialog: "معاينة الوسائط",
          imageFallbackAlt: "صورة",
          videoFallbackAlt: "فيديو",
        }
      : {
          close: dictionary.common.close,
          previous: "Previous",
          next: dictionary.common.next,
          zoomIn: "Zoom in",
          zoomOut: "Zoom out",
          resetZoom: "Reset",
          download: "Download",
          dialog: "Media preview",
          imageFallbackAlt: "Image",
          videoFallbackAlt: "Video",
        }

  const frameTitle = title || `${activeIndex + 1} / ${items.length}`

  return (
    <div
      className={cn("fixed inset-0 z-70 bg-black/80 backdrop-blur-sm p-4 sm:p-6", className)}
      role="dialog"
      aria-modal="true"
      aria-label={labels.dialog}
      onClick={onClose}
    >
      <div
        className="mx-auto flex h-full w-full max-w-5xl flex-col"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between rounded-xl border border-white/20 bg-black/40 px-3 py-2 text-white">
          <div className="text-sm font-medium truncate pe-3">{frameTitle}</div>
          <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}> 
            {isImage && (
              <>
                <button
                  type="button"
                  onClick={zoomOut}
                  disabled={zoom <= MIN_ZOOM}
                  className="inline-flex size-9 cursor-pointer items-center justify-center rounded-md border border-white/25 bg-white/10 transition-colors hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50"
                  title={labels.zoomOut}
                  aria-label={labels.zoomOut}
                >
                  <Icon icon="solar:minus-circle-linear" className="size-5" />
                </button>
                <button
                  type="button"
                  onClick={zoomIn}
                  disabled={zoom >= MAX_ZOOM}
                  className="inline-flex size-9 cursor-pointer items-center justify-center rounded-md border border-white/25 bg-white/10 transition-colors hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50"
                  title={labels.zoomIn}
                  aria-label={labels.zoomIn}
                >
                  <Icon icon="solar:add-circle-linear" className="size-5" />
                </button>
                <button
                  type="button"
                  onClick={resetZoom}
                  className="inline-flex cursor-pointer items-center rounded-md border border-white/25 bg-white/10 px-3 py-2 text-xs font-medium transition-colors hover:bg-white/20"
                >
                  {labels.resetZoom}
                </button>
              </>
            )}

            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex size-9 cursor-pointer items-center justify-center rounded-md border border-white/25 bg-white/10 transition-colors hover:bg-white/20"
              title={labels.download}
              aria-label={labels.download}
            >
              <Icon icon="solar:download-linear" className="size-5" />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="inline-flex size-9 cursor-pointer items-center justify-center rounded-md border border-white/25 bg-white/10 transition-colors hover:bg-white/20"
              title={labels.close}
              aria-label={labels.close}
            >
              <Icon icon="solar:close-circle-linear" className="size-5" />
            </button>
          </div>
        </div>

        <div
          className="relative flex-1 overflow-hidden rounded-2xl border border-white/20 bg-black/30"
          onWheel={(event) => {
            if (!isImage) return

            event.preventDefault()
            if (event.deltaY < 0) {
              zoomIn()
            } else {
              zoomOut()
            }
          }}
        >
          {canGoPrevious && (
            <button
              type="button"
              onClick={goToPrevious}
              className={cn(
                "absolute top-1/2 z-20 inline-flex size-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/25 bg-black/55 text-white transition-colors hover:bg-black/75",
                isRTL ? "right-3" : "left-3",
              )}
              title={labels.previous}
              aria-label={labels.previous}
            >
              <Icon icon={isRTL ? "lucide:chevron-right" : "lucide:chevron-left"} className="size-5" />
            </button>
          )}

          <div ref={viewportRef} className="absolute inset-0 flex items-center justify-center px-4">
            {isImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                ref={imageRef}
                src={activeItem.src}
                alt={activeItem.alt || labels.imageFallbackAlt}
                onDragStart={(event) => event.preventDefault()}
                onDoubleClick={handleImageDoubleClick}
                onPointerDown={handleImagePointerDown}
                onPointerMove={handleImagePointerMove}
                onPointerUp={(event) => endImageDrag(event)}
                onPointerCancel={(event) => endImageDrag(event)}
                className={cn(
                  "h-full w-auto max-w-none rounded-lg object-contain select-none",
                  isDraggingImage ? "cursor-grabbing touch-none" : "cursor-grab touch-none",
                  isDraggingImage ? "transition-none" : "transition-transform duration-200",
                )}
                style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}
              />
            ) : (
              <video
                src={activeItem.src}
                poster={activeItem.poster || undefined}
                controls
                autoPlay
                playsInline
                preload="metadata"
                className="h-full w-auto max-w-full rounded-xl bg-black object-contain"
              >
                {activeItem.alt || labels.videoFallbackAlt}
              </video>
            )}
          </div>

          {canGoNext && (
            <button
              type="button"
              onClick={goToNext}
              className={cn(
                "absolute top-1/2 z-20 inline-flex size-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/25 bg-black/55 text-white transition-colors hover:bg-black/75",
                isRTL ? "left-3" : "right-3",
              )}
              title={labels.next}
              aria-label={labels.next}
            >
              <Icon icon={isRTL ? "lucide:chevron-left" : "lucide:chevron-right"} className="size-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
