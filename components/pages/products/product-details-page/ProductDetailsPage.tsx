"use client"

import * as React from "react"
import Image from "next/image"
import { Icon } from "@iconify/react"

import { useDictionary } from "@/providers/dictionary-provider"
import {
  DEFAULT_PRODUCT_IMAGE,
  extractNumericPrice,
  getDiscountLabel,
  getOriginalPriceLabel,
  getProductById,
} from "../shared"

interface ProductDetailsPageProps {
  productId: string | number
}

const SIZE_OPTIONS = ["S", "M", "L"] as const
const IMAGE_ZOOM_SCALE = 2.4
const IMAGE_ZOOM_LENS_SIZE = 180

type ProductSize = (typeof SIZE_OPTIONS)[number]
type ZoomNaturalSize = { width: number; height: number }

function DiscountRibbon({ label, isRTL }: { label: string; isRTL: boolean }) {
  return (
    <div className={`pointer-events-none absolute top-0 z-10 ${isRTL ? "left-0" : "right-0"}`} aria-hidden="true">
      <div className="relative h-24 w-24 overflow-hidden">
        <span
          className={`absolute top-4 z-20 inline-flex w-36 items-center justify-center bg-red-600 py-1.5 text-[13px] font-extrabold text-white shadow-[0_3px_8px_rgba(0,0,0,0.35)] ${
            isRTL ? "-left-11 -rotate-45" : "-right-11 rotate-45"
          }`}
        >
          {label}
          <span
            className={`absolute -top-px h-0 w-0 border-x-4 border-x-transparent border-b-4 border-b-white/95 ${
              isRTL ? "left-7" : "right-7"
            }`}
          />
          <span
            className={`absolute top-1/2 h-0 w-0 -translate-y-1/2 border-y-4 border-y-transparent ${
              isRTL ? "-left-px border-r-4 border-r-red-900" : "-right-px border-l-4 border-l-red-900"
            }`}
          />
        </span>
      </div>
    </div>
  )
}

function ProductInfoBadge({
  className,
  icon,
  children,
}: {
  className: string
  icon: string
  children: React.ReactNode
}) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${className}`}>
      <Icon icon={icon} className="size-3.5" />
      {children}
    </span>
  )
}

export function ProductDetailsPage({ productId }: ProductDetailsPageProps) {
  const { isRTL, lang } = useDictionary()

  const productNumericId = React.useMemo(() => Number(productId), [productId])
  const resolvedProduct = React.useMemo(
    () => (Number.isFinite(productNumericId) ? getProductById(productNumericId) : undefined),
    [productNumericId],
  )

  const product = resolvedProduct ?? getProductById(1)
  const galleryImages = product?.galleryImages.length ? product.galleryImages : [DEFAULT_PRODUCT_IMAGE]
  const resolvedProductId = product?.id

  const [selectedImageIndex, setSelectedImageIndex] = React.useState(0)
  const [selectedSize, setSelectedSize] = React.useState<ProductSize>("M")
  const [quantity, setQuantity] = React.useState(4)
  const [isAddedToCart, setIsAddedToCart] = React.useState(false)
  const [isDescriptionExpanded, setIsDescriptionExpanded] = React.useState(false)
  const [isBottomGalleryVisible, setIsBottomGalleryVisible] = React.useState(true)
  const [isZoomFrameVisible, setIsZoomFrameVisible] = React.useState(false)
  const zoomNaturalSizeRef = React.useRef<ZoomNaturalSize>({ width: 1, height: 1 })
  const zoomFrameRef = React.useRef<HTMLDivElement | null>(null)
  const zoomLensRef = React.useRef<HTMLDivElement | null>(null)
  const zoomAnimationFrameRef = React.useRef<number | null>(null)
  const pendingPointerRef = React.useRef<{ clientX: number; clientY: number } | null>(null)
  const selectedImage = galleryImages[selectedImageIndex] ?? DEFAULT_PRODUCT_IMAGE

  React.useEffect(() => {
    if (!resolvedProductId) {
      return
    }

    setSelectedImageIndex(0)
    setSelectedSize("M")
    setQuantity(4)
    setIsAddedToCart(false)
    setIsDescriptionExpanded(false)
    setIsBottomGalleryVisible(true)
    setIsZoomFrameVisible(false)
    zoomNaturalSizeRef.current = { width: 1, height: 1 }

    const lensElement = zoomLensRef.current
    if (lensElement) {
      lensElement.style.transform = "translate3d(-9999px, -9999px, 0)"
      lensElement.style.backgroundPosition = "0px 0px"
      lensElement.style.backgroundSize = `${IMAGE_ZOOM_LENS_SIZE * IMAGE_ZOOM_SCALE}px ${IMAGE_ZOOM_LENS_SIZE * IMAGE_ZOOM_SCALE}px`
    }

    pendingPointerRef.current = null
  }, [resolvedProductId])

  React.useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    const probeImage = new window.Image()
    const updateNaturalSize = () => {
      zoomNaturalSizeRef.current = {
        width: probeImage.naturalWidth || 1,
        height: probeImage.naturalHeight || 1,
      }

      const lensElement = zoomLensRef.current
      if (lensElement) {
        lensElement.style.backgroundImage = `url(${selectedImage})`
      }
    }

    probeImage.src = selectedImage

    const lensElement = zoomLensRef.current
    if (lensElement) {
      lensElement.style.backgroundImage = `url(${selectedImage})`
    }

    if (probeImage.complete && probeImage.naturalWidth > 0) {
      updateNaturalSize()
      return
    }

    probeImage.addEventListener("load", updateNaturalSize)
    return () => {
      probeImage.removeEventListener("load", updateNaturalSize)
    }
  }, [selectedImage])

  React.useEffect(() => {
    return () => {
      if (zoomAnimationFrameRef.current !== null && typeof window !== "undefined") {
        window.cancelAnimationFrame(zoomAnimationFrameRef.current)
        zoomAnimationFrameRef.current = null
      }
    }
  }, [])

  if (!product) {
    return null
  }

  const title = isRTL ? product.nameAr : product.nameEn
  const rating = isRTL ? product.ratingDetailAr : product.ratingDetailEn
  const stockLabel = isRTL ? product.stockAr : product.stockEn
  const soldProductsLabel = isRTL ? product.soldProductsAr : product.soldProductsEn
  const description = isRTL ? product.detailDescriptionAr : product.detailDescriptionEn
  const priceLabel = isRTL ? product.priceAr : product.priceEn
  const currencyLabel = lang === "ar" ? "درهم" : "MAD"

  const labels = lang === "ar"
    ? {
        size: "الحجم",
        quantity: "الكمية",
        total: "الاجمالي",
        addToCart: "اضافة الى السلة",
        added: "تمت الاضافة",
        showMore: "عرض المزيد",
        showLess: "عرض أقل",
        hideBottomGallery: "إخفاء شريط الصور",
        showBottomGallery: "إظهار شريط الصور",
      }
    : {
        size: "Size",
        quantity: "Quantity",
        total: "Total",
        addToCart: "Add to cart",
        added: "Added",
        showMore: "Show more",
        showLess: "Show less",
        hideBottomGallery: "Hide image bar",
        showBottomGallery: "Show image bar",
      }

  const discountLabel =
    typeof product.discountPercentage === "number"
      ? getDiscountLabel(product.discountPercentage, lang)
      : null

  const originalPriceLabel = getOriginalPriceLabel(priceLabel, product.discountPercentage)

  const unitPrice = extractNumericPrice(priceLabel)
  const totalPrice = (unitPrice * quantity).toFixed(2)
  const originalPriceValue = originalPriceLabel ? extractNumericPrice(originalPriceLabel).toFixed(2) : null
  const originalUnitPrice = originalPriceLabel ? extractNumericPrice(originalPriceLabel) : null
  const originalTotalPrice = originalUnitPrice ? (originalUnitPrice * quantity).toFixed(2) : null

  const syncZoomFromPointer = () => {
    zoomAnimationFrameRef.current = null

    const frameElement = zoomFrameRef.current
    const lensElement = zoomLensRef.current
    const pendingPointer = pendingPointerRef.current

    if (!frameElement || !lensElement || !pendingPointer) {
      return
    }

    const frameRect = frameElement.getBoundingClientRect()
    if (frameRect.width <= 0 || frameRect.height <= 0) {
      return
    }

    const pointerX = Math.max(0, Math.min(pendingPointer.clientX - frameRect.left, frameRect.width))
    const pointerY = Math.max(0, Math.min(pendingPointer.clientY - frameRect.top, frameRect.height))

    const lensSize = Math.min(IMAGE_ZOOM_LENS_SIZE, frameRect.width, frameRect.height)
    const lensHalf = lensSize / 2
    const lensX = Math.max(lensHalf, Math.min(pointerX, frameRect.width - lensHalf))
    const lensY = Math.max(lensHalf, Math.min(pointerY, frameRect.height - lensHalf))

    const naturalWidth = Math.max(1, zoomNaturalSizeRef.current.width)
    const naturalHeight = Math.max(1, zoomNaturalSizeRef.current.height)
    const imageRatio = naturalWidth / naturalHeight
    const frameRatio = frameRect.width / frameRect.height

    let coveredWidth = frameRect.width
    let coveredHeight = frameRect.height
    let coveredOffsetX = 0
    let coveredOffsetY = 0

    if (imageRatio > frameRatio) {
      coveredHeight = frameRect.height
      coveredWidth = coveredHeight * imageRatio
      coveredOffsetX = (frameRect.width - coveredWidth) / 2
    } else {
      coveredWidth = frameRect.width
      coveredHeight = coveredWidth / imageRatio
      coveredOffsetY = (frameRect.height - coveredHeight) / 2
    }

    const backgroundWidth = coveredWidth * IMAGE_ZOOM_SCALE
    const backgroundHeight = coveredHeight * IMAGE_ZOOM_SCALE
    const backgroundX = lensHalf - (pointerX - coveredOffsetX) * IMAGE_ZOOM_SCALE
    const backgroundY = lensHalf - (pointerY - coveredOffsetY) * IMAGE_ZOOM_SCALE

    lensElement.style.transform = `translate3d(${lensX - lensHalf}px, ${lensY - lensHalf}px, 0)`
    lensElement.style.backgroundSize = `${backgroundWidth}px ${backgroundHeight}px`
    lensElement.style.backgroundPosition = `${backgroundX}px ${backgroundY}px`
  }

  const scheduleZoomSync = () => {
    if (typeof window === "undefined" || zoomAnimationFrameRef.current !== null) {
      return
    }

    zoomAnimationFrameRef.current = window.requestAnimationFrame(syncZoomFromPointer)
  }

  const handleImageMouseEnter = (event: React.MouseEvent<HTMLDivElement>) => {
    if (typeof window !== "undefined" && window.matchMedia("(hover: none), (pointer: coarse)").matches) {
      return
    }

    pendingPointerRef.current = { clientX: event.clientX, clientY: event.clientY }
    setIsZoomFrameVisible(true)
    scheduleZoomSync()
  }

  const handleImageMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomFrameVisible) {
      return
    }

    pendingPointerRef.current = { clientX: event.clientX, clientY: event.clientY }
    scheduleZoomSync()
  }

  const handleImageMouseLeave = () => {
    setIsZoomFrameVisible(false)
    pendingPointerRef.current = null

    if (zoomAnimationFrameRef.current !== null && typeof window !== "undefined") {
      window.cancelAnimationFrame(zoomAnimationFrameRef.current)
      zoomAnimationFrameRef.current = null
    }

    const lensElement = zoomLensRef.current
    if (lensElement) {
      lensElement.style.transform = "translate3d(-9999px, -9999px, 0)"
    }
  }

  const handlePrevImage = () => {
    setSelectedImageIndex((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1))
  }

  const handleNextImage = () => {
    setSelectedImageIndex((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1))
  }

  const toggleBottomGalleryVisibility = () => {
    setIsBottomGalleryVisible((previous) => !previous)
  }

  const incrementQuantity = () => {
    setQuantity((prev) => Math.min(20, prev + 1))
  }

  const decrementQuantity = () => {
    setQuantity((prev) => Math.max(1, prev - 1))
  }

  return (
    <div className="mx-auto w-full max-w-[1260px] px-4 py-6 md:px-6" dir={isRTL ? "rtl" : "ltr"}>
      <section className="w-full min-w-0 overflow-hidden rounded-3xl border border-border/30 bg-card shadow-[0_8px_24px_rgba(0,0,0,0.05)] dark:border-zinc-700 dark:shadow-[0_8px_24px_rgba(0,0,0,0.18)]">
        <div dir="ltr" className="grid w-full min-w-0 lg:min-h-[610px] lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-stretch">
          <div dir={isRTL ? "rtl" : "ltr"} className={`order-2 min-w-0 bg-card px-4 py-6 sm:px-7 sm:py-8 ${isRTL ? "lg:order-1" : "lg:order-2"} lg:px-10 lg:py-10`}>
            <div className="mx-auto flex h-full w-full min-w-0 max-w-none flex-col gap-5 lg:max-w-[640px] lg:justify-center">
              <header className="space-y-3">
                <h1 className={`break-words text-3xl font-extrabold leading-tight text-foreground md:text-5xl ${isRTL ? "text-right" : "text-left"}`}>
                  {title}
                </h1>

                <div dir="ltr" className={`flex w-full flex-wrap items-center gap-2 ${isRTL ? "flex-row-reverse" : "flex-row"}`}>
                  <ProductInfoBadge className="bg-amber-500/15 text-amber-500" icon="solar:star-bold">
                    {rating}
                  </ProductInfoBadge>

                  <ProductInfoBadge className="bg-emerald-500/15 text-emerald-500" icon="solar:check-circle-bold">
                    {stockLabel}
                  </ProductInfoBadge>

                  <ProductInfoBadge className="bg-amber-600/14 text-amber-600 dark:bg-amber-400/18 dark:text-amber-400" icon="solar:verified-check-bold">
                    {soldProductsLabel}
                  </ProductInfoBadge>
                </div>

                <div dir="ltr" className={`flex w-full flex-wrap items-end gap-x-2 gap-y-1 ${isRTL ? "flex-row-reverse justify-start" : "flex-row justify-start"}`}>
                  <span className="text-4xl font-extrabold text-primary md:text-5xl">{unitPrice.toFixed(2)}</span>

                  {originalPriceValue ? (
                    <span className="pb-1 text-base font-semibold text-zinc-400 dark:text-zinc-500">
                      <span className="line-through decoration-2 decoration-zinc-500/85 dark:decoration-zinc-500/95">
                        {originalPriceValue}
                      </span>
                    </span>
                  ) : null}

                  <span className="pb-1 text-sm font-semibold text-muted-foreground">{currencyLabel}</span>
                </div>
              </header>

              <div className="rounded-xl border border-border/30 bg-zinc-200/60 px-4 py-3 text-sm leading-8 text-muted-foreground dark:border-zinc-700/60 dark:bg-zinc-800/70 dark:text-zinc-300 md:text-lg">
                <p className={`${isRTL ? "text-right" : "text-left"} ${isDescriptionExpanded ? "line-clamp-none" : "line-clamp-1"}`}>
                  {description}
                </p>
                <button
                  type="button"
                  onClick={() => setIsDescriptionExpanded((previous) => !previous)}
                  className={`mt-1 inline-flex cursor-pointer text-xs font-semibold text-primary transition-colors hover:text-primary/80 hover:underline ${isRTL ? "justify-end" : "justify-start"}`}
                >
                  {isDescriptionExpanded ? labels.showLess : labels.showMore}
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <p className={`text-base font-semibold text-foreground ${isRTL ? "text-right" : "text-left"}`}>{labels.size}</p>
                  <div dir="ltr" className={`inline-flex items-center gap-2 ${isRTL ? "flex-row-reverse" : "flex-row"}`}>
                    {SIZE_OPTIONS.map((sizeOption) => {
                      const active = selectedSize === sizeOption
                      return (
                        <button
                          key={sizeOption}
                          type="button"
                          onClick={() => setSelectedSize(sizeOption)}
                          className={`inline-flex size-10 cursor-pointer items-center justify-center border text-base font-bold transition-colors ${
                            active
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border bg-background text-foreground hover:border-primary/70 dark:border-zinc-600 dark:bg-zinc-900"
                          }`}
                        >
                          {sizeOption}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div dir="ltr" className={`flex flex-wrap items-end justify-between gap-4 ${isRTL ? "flex-row-reverse" : "flex-row"}`}>
                  <div className="space-y-2">
                    <p className={`text-base font-semibold text-foreground ${isRTL ? "text-right" : "text-left"}`}>{labels.quantity}</p>
                    <div dir="ltr" className={`inline-flex items-center gap-3 ${isRTL ? "flex-row-reverse" : "flex-row"}`}>
                      <button
                        type="button"
                        onClick={decrementQuantity}
                        className="inline-flex size-10 cursor-pointer items-center justify-center rounded-full bg-zinc-200 text-zinc-700 transition-colors hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-600"
                        aria-label={isRTL ? "انقاص الكمية" : "Decrease quantity"}
                      >
                        <Icon icon="mdi:minus" className="size-5" />
                      </button>

                      <span className="min-w-8 text-center text-2xl font-bold text-foreground">{quantity}</span>

                      <button
                        type="button"
                        onClick={incrementQuantity}
                        className="inline-flex size-10 cursor-pointer items-center justify-center rounded-full bg-zinc-200 text-zinc-700 transition-colors hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-600"
                        aria-label={isRTL ? "زيادة الكمية" : "Increase quantity"}
                      >
                        <Icon icon="mdi:plus" className="size-5" />
                      </button>
                    </div>
                  </div>

                  <div className={`space-y-1 ${isRTL ? "text-right" : "text-left"}`}>
                    <p className="text-base font-semibold text-foreground">{labels.total}</p>
                    {originalTotalPrice ? (
                      <p className="text-base font-semibold text-zinc-400 dark:text-zinc-500" dir="ltr">
                        <span className="inline-flex items-end gap-1 line-through decoration-2 decoration-zinc-500/85 dark:decoration-zinc-500/95" dir="ltr">
                          {isRTL ? (
                            <>
                              <span className="text-sm">{currencyLabel}</span>
                              <span>{originalTotalPrice}</span>
                            </>
                          ) : (
                            <>
                              <span>{originalTotalPrice}</span>
                              <span className="text-sm">{currencyLabel}</span>
                            </>
                          )}
                        </span>
                      </p>
                    ) : null}

                    <p className="text-3xl font-extrabold text-foreground md:text-4xl">
                      <span className="inline-flex items-end gap-2" dir="ltr">
                        {isRTL ? (
                          <>
                            <span className="text-sm font-semibold text-muted-foreground">{currencyLabel}</span>
                            <span>{totalPrice}</span>
                          </>
                        ) : (
                          <>
                            <span>{totalPrice}</span>
                            <span className="text-sm font-semibold text-muted-foreground">{currencyLabel}</span>
                          </>
                        )}
                      </span>
                    </p>
                  </div>
                </div>

                <div dir="ltr" className={`flex flex-wrap items-center justify-between gap-4 ${isRTL ? "flex-row-reverse" : "flex-row"}`}>
                  <button
                    type="button"
                    onClick={() => setIsAddedToCart(true)}
                    className={`inline-flex w-full min-w-0 cursor-pointer items-center justify-center gap-2 rounded-full px-6 py-2.5 text-lg font-bold transition-colors sm:w-auto sm:min-w-[180px] ${
                      isAddedToCart
                        ? "bg-emerald-500 text-white hover:bg-emerald-500/90"
                        : "bg-primary text-primary-foreground hover:bg-primary/90"
                    } ${isRTL ? "flex-row-reverse" : "flex-row"}`}
                  >
                    <Icon icon={isAddedToCart ? "solar:cart-check-bold" : "solar:cart-plus-bold"} className="size-4.5" />
                    {isAddedToCart ? labels.added : labels.addToCart}
                  </button>

                  <div dir="ltr" className={`flex shrink-0 items-center gap-1.5 ${isRTL ? "flex-row" : "flex-row-reverse"}`}>
                    <span className="inline-flex size-7 items-center justify-center rounded-full bg-amber-500 text-white">
                      <Icon icon="solar:heart-bold" className="size-4" />
                    </span>
                    <span className="text-lg font-semibold text-muted-foreground">{product.likesLabel}</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          <div className={`order-1 min-w-0 bg-card ${isRTL ? "lg:order-2" : "lg:order-1"} lg:h-full`}>
            <div className="relative h-[360px] w-full overflow-hidden sm:h-[520px] lg:h-full lg:min-h-[610px]">
              <div
                ref={zoomFrameRef}
                onMouseEnter={handleImageMouseEnter}
                onMouseMove={handleImageMouseMove}
                onMouseLeave={handleImageMouseLeave}
                className="absolute inset-0 cursor-none overflow-hidden"
              >
                {discountLabel ? <DiscountRibbon label={discountLabel} isRTL={isRTL} /> : null}

                <Image
                  src={selectedImage}
                  alt={title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 48vw"
                  className={`object-cover object-center transition-[filter] duration-150 ease-out ${isZoomFrameVisible ? "blur-[1.25px]" : "blur-0"}`}
                />

                <div
                  ref={zoomLensRef}
                  aria-hidden="true"
                  className={`pointer-events-none absolute left-0 top-0 z-20 overflow-hidden rounded-xl border-2 border-white/90 shadow-[0_10px_26px_rgba(0,0,0,0.36)] ring-1 ring-black/10 transition-opacity duration-100 ${isZoomFrameVisible ? "opacity-100" : "opacity-0"}`}
                  style={{
                    width: `${IMAGE_ZOOM_LENS_SIZE}px`,
                    height: `${IMAGE_ZOOM_LENS_SIZE}px`,
                    transform: "translate3d(-9999px, -9999px, 0)",
                    backgroundImage: `url(${selectedImage})`,
                    backgroundRepeat: "no-repeat",
                    backgroundSize: `${IMAGE_ZOOM_LENS_SIZE * IMAGE_ZOOM_SCALE}px ${IMAGE_ZOOM_LENS_SIZE * IMAGE_ZOOM_SCALE}px`,
                    backgroundPosition: "0px 0px",
                    willChange: "transform, background-position, background-size",
                  }}
                >
                  <span className="absolute inset-0 border border-white/40" />
                </div>

                <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
              </div>

              <div className="pointer-events-auto absolute inset-x-0 bottom-0 z-30 hidden px-4 pb-4 lg:block">
                {isBottomGalleryVisible ? (
                  <div id="product-desktop-bottom-gallery" className="rounded-xl border border-white/25 bg-black/40 p-2 backdrop-blur-sm">
                    <div dir="ltr" className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : "flex-row"}`}>
                      <button
                        type="button"
                        onClick={isRTL ? handleNextImage : handlePrevImage}
                        className="inline-flex size-8 cursor-pointer items-center justify-center rounded-full text-amber-300 transition-colors hover:bg-amber-500/15"
                        aria-label={isRTL ? "الصورة السابقة" : "Previous image"}
                      >
                        <Icon icon={isRTL ? "solar:arrow-right-linear" : "solar:arrow-left-linear"} className="size-5" />
                      </button>

                      <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto pb-1">
                        {galleryImages.map((thumb, index) => (
                          <button
                            key={`${thumb}-${index}`}
                            type="button"
                            onClick={() => setSelectedImageIndex(index)}
                            className={`relative size-[72px] shrink-0 cursor-pointer overflow-hidden border transition-colors ${
                              selectedImageIndex === index
                                ? "border-primary shadow-[0_0_0_2px_rgba(47,102,246,0.24)]"
                                : "border-white/25 hover:border-primary/60"
                            }`}
                            aria-label={isRTL ? `صورة مصغرة ${index + 1}` : `Thumbnail ${index + 1}`}
                          >
                            <Image src={thumb} alt={`${title} thumbnail ${index + 1}`} fill className="object-cover" sizes="72px" />
                          </button>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={isRTL ? handlePrevImage : handleNextImage}
                        className="inline-flex size-8 cursor-pointer items-center justify-center rounded-full text-amber-300 transition-colors hover:bg-amber-500/15"
                        aria-label={isRTL ? "الصورة التالية" : "Next image"}
                      >
                        <Icon icon={isRTL ? "solar:arrow-left-linear" : "solar:arrow-right-linear"} className="size-5" />
                      </button>

                      <button
                        type="button"
                        onClick={toggleBottomGalleryVisibility}
                        className="inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full border border-white/35 text-white transition-colors hover:bg-white/10"
                        aria-label={labels.hideBottomGallery}
                        aria-expanded={isBottomGalleryVisible}
                        aria-controls="product-desktop-bottom-gallery"
                      >
                        <Icon icon="solar:alt-arrow-down-linear" className="size-4.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className={`flex ${isRTL ? "justify-start" : "justify-end"}`}>
                    <button
                      type="button"
                      onClick={toggleBottomGalleryVisibility}
                      className="inline-flex size-8 cursor-pointer items-center justify-center rounded-full border border-white/35 bg-black/40 text-white transition-colors hover:bg-black/55"
                      aria-label={labels.showBottomGallery}
                      aria-expanded={isBottomGalleryVisible}
                      aria-controls="product-desktop-bottom-gallery"
                    >
                      <Icon icon="solar:alt-arrow-up-linear" className="size-4.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3 px-4 py-4 lg:hidden">
              {isBottomGalleryVisible ? (
                <>
                  <div id="product-mobile-bottom-gallery" className="flex min-w-0 items-center gap-2 overflow-x-auto pb-1">
                    {galleryImages.map((thumb, index) => (
                      <button
                        key={`${thumb}-${index}`}
                        type="button"
                        onClick={() => setSelectedImageIndex(index)}
                        className={`relative size-20 shrink-0 cursor-pointer overflow-hidden border transition-colors ${
                          selectedImageIndex === index
                            ? "border-primary shadow-[0_0_0_2px_rgba(47,102,246,0.2)]"
                            : "border-border/40 hover:border-primary/50 dark:border-zinc-700"
                        }`}
                        aria-label={isRTL ? `صورة مصغرة ${index + 1}` : `Thumbnail ${index + 1}`}
                      >
                        <Image src={thumb} alt={`${title} thumbnail ${index + 1}`} fill className="object-cover" sizes="80px" />
                      </button>
                    ))}
                  </div>

                  <div dir="ltr" className="flex items-center justify-start gap-3">
                    <button
                      type="button"
                      onClick={isRTL ? handleNextImage : handlePrevImage}
                      className="inline-flex size-8 cursor-pointer items-center justify-center rounded-full text-amber-500 transition-colors hover:bg-amber-500/12"
                      aria-label={isRTL ? "الصورة السابقة" : "Previous image"}
                    >
                      <Icon icon={isRTL ? "solar:arrow-right-linear" : "solar:arrow-left-linear"} className="size-5" />
                    </button>

                    <button
                      type="button"
                      onClick={isRTL ? handlePrevImage : handleNextImage}
                      className="inline-flex size-8 cursor-pointer items-center justify-center rounded-full text-amber-500 transition-colors hover:bg-amber-500/12"
                      aria-label={isRTL ? "الصورة التالية" : "Next image"}
                    >
                      <Icon icon={isRTL ? "solar:arrow-left-linear" : "solar:arrow-right-linear"} className="size-5" />
                    </button>

                    <button
                      type="button"
                      onClick={toggleBottomGalleryVisibility}
                      className="inline-flex size-8 cursor-pointer items-center justify-center rounded-full border border-amber-500/45 text-amber-600 transition-colors hover:bg-amber-500/12 dark:text-amber-400"
                      aria-label={labels.hideBottomGallery}
                      aria-expanded={isBottomGalleryVisible}
                      aria-controls="product-mobile-bottom-gallery"
                    >
                      <Icon icon="solar:alt-arrow-down-linear" className="size-4.5" />
                    </button>
                  </div>
                </>
              ) : (
                <div dir="ltr" className="flex items-center justify-start gap-3">
                  <button
                    type="button"
                    onClick={toggleBottomGalleryVisibility}
                    className="inline-flex size-8 cursor-pointer items-center justify-center rounded-full border border-amber-500/45 text-amber-600 transition-colors hover:bg-amber-500/12 dark:text-amber-400"
                    aria-label={labels.showBottomGallery}
                    aria-expanded={isBottomGalleryVisible}
                    aria-controls="product-mobile-bottom-gallery"
                  >
                    <Icon icon="solar:alt-arrow-up-linear" className="size-4.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
