"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { Icon } from "@iconify/react"

import { PRODUCT_ROUTES } from "@/lib/routes"
import { useDictionary } from "@/providers/dictionary-provider"
import {
  DEFAULT_PRODUCT_IMAGE,
  PRODUCTS,
  getDiscountLabel,
  getOriginalPriceLabel,
  type ProductData,
} from "../shared"

function ProductCard({
  data,
  isRTL,
  lang,
  liked,
  inCart,
  onToggleLike,
  onAddToCart,
}: {
  data: ProductData
  isRTL: boolean
  lang: string
  liked: boolean
  inCart: boolean
  onToggleLike: (id: number) => void
  onAddToCart: (id: number) => void
}) {
  const name = isRTL ? data.nameAr : data.nameEn
  const price = isRTL ? data.priceAr : data.priceEn
  const description = isRTL ? data.descriptionAr : data.descriptionEn
  const category = isRTL ? data.categoryAr : data.categoryEn
  const rating = isRTL ? data.ratingAr : data.ratingEn
  const sold = isRTL ? data.soldAr : data.soldEn
  const discountLabel =
    typeof data.discountPercentage === "number"
      ? getDiscountLabel(data.discountPercentage, lang)
      : null
  const originalPriceLabel = getOriginalPriceLabel(price, data.discountPercentage)

  return (
    <article
      className="group relative overflow-hidden rounded-2xl border border-border/30 bg-card shadow-[0_4px_14px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-1 hover:border-border/55 hover:shadow-[0_12px_28px_rgba(34,95,236,0.18)]"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="relative h-56 w-full overflow-hidden border-b border-border/45 bg-muted/50 sm:h-64 dark:border-zinc-500/45">
        {discountLabel ? (
          <div className={`pointer-events-none absolute top-0 z-10 ${isRTL ? "left-0" : "right-0"}`} aria-hidden="true">
            <div className="relative h-24 w-24 overflow-hidden">
              <span
                className={`absolute top-4 z-20 inline-flex w-36 items-center justify-center bg-red-600 py-1.5 text-[13px] font-extrabold text-white shadow-[0_3px_8px_rgba(0,0,0,0.35)] ${
                  isRTL ? "-left-11 -rotate-45" : "-right-11 rotate-45"
                }`}
              >
                {discountLabel}
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
        ) : null}
        <Link
          href={PRODUCT_ROUTES.DETAIL(lang, data.id)}
          aria-label={isRTL ? `عرض تفاصيل ${name}` : `View details for ${name}`}
          className="absolute inset-0 block"
        >
          <Image
            src={data.galleryImages[0] ?? DEFAULT_PRODUCT_IMAGE}
            alt={name}
            fill
            className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.03]"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 360px"
          />
        </Link>
      </div>

      <div className="relative space-y-3 px-3 pb-3 pt-8 overflow-visible">
        <div className={`absolute -top-6 z-20 ${isRTL ? "right-2" : "left-2"}`}>
          <div className="relative inline-flex size-14 items-center justify-center rounded-full bg-card">
            <span className="pointer-events-none absolute inset-0 rounded-full border-t border-border/70 dark:border-zinc-200/75" />

            <button
              type="button"
              aria-label={isRTL ? "المفضلة" : "Favorite"}
              title={isRTL ? "المفضلة" : "Favorite"}
              aria-pressed={liked}
              onClick={() => onToggleLike(data.id)}
              className="inline-flex size-11 cursor-pointer items-center justify-center rounded-full border border-border/75 bg-zinc-200 text-muted-foreground transition-colors hover:border-border hover:text-foreground dark:border-0 dark:bg-zinc-600 dark:text-zinc-100 dark:hover:border-zinc-100/80"
            >
              {liked ? (
                <Icon icon="solar:heart-bold" className="size-6 text-red-500" />
              ) : (
                <Icon icon="solar:heart-linear" className="size-6 text-foreground" />
              )}
            </button>
          </div>
        </div>

        <div dir="ltr" className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : "flex-row"}`}>
          <h3 className={`line-clamp-2 min-w-0 flex-1 text-lg font-extrabold leading-6 text-foreground ${isRTL ? "text-right" : "text-left"}`}>
            <Link href={PRODUCT_ROUTES.DETAIL(lang, data.id)} className="cursor-pointer transition-colors hover:text-primary">
              {name}
            </Link>
          </h3>
        </div>

        <div className="rounded-xl bg-zinc-200/65 px-3 py-2 text-center text-sm leading-6 text-muted-foreground dark:bg-zinc-700/55">
          <span className="line-clamp-2 wrap-break-word">{description}</span>
        </div>

        <div className="space-y-1">
          <div dir="ltr" className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : "flex-row"}`}>
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-1 text-xs font-bold text-amber-500">
              <Icon icon="solar:star-bold" className="size-3.5" />
              {rating}
            </span>
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-bold text-emerald-500">
              {sold}
              <Icon icon="solar:check-circle-bold" className="size-3.5" />
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <div dir="ltr" className={`flex ${isRTL ? "justify-end" : "justify-start"}`}>
            <span className="inline-flex shrink-0 rounded-full bg-primary/12 px-2.5 py-1 text-xs font-bold text-primary">
              {category}
            </span>
          </div>

          <div dir="ltr" className={`flex items-center justify-between gap-2 ${isRTL ? "flex-row-reverse" : "flex-row"}`}>
            <div className={`inline-flex items-center gap-1.5 ${isRTL ? "flex-row-reverse" : "flex-row"}`}>
              <span className="text-lg font-extrabold text-primary">{price}</span>
              {originalPriceLabel ? (
                <span className="inline-flex shrink-0 whitespace-nowrap rounded-full bg-zinc-200/70 px-1.5 py-0.5 text-[10px] font-semibold text-red-500 line-through dark:bg-zinc-700/60 dark:text-red-400">
                  {originalPriceLabel}
                </span>
              ) : null}
            </div>
            <button
              type="button"
              aria-label={
                inCart
                  ? isRTL
                    ? "تمت الإضافة إلى السلة"
                    : "Added to cart"
                  : isRTL
                    ? "إضافة إلى السلة"
                    : "Add to cart"
              }
              title={
                inCart
                  ? isRTL
                    ? "تمت الإضافة إلى السلة"
                    : "Added to cart"
                  : isRTL
                    ? "إضافة إلى السلة"
                    : "Add to cart"
              }
              aria-pressed={inCart}
              disabled={inCart}
              onClick={() => onAddToCart(data.id)}
              className={`relative inline-flex size-8 items-center justify-center transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                inCart
                  ? "scale-125 cursor-default text-emerald-500"
                  : "scale-125 cursor-pointer text-zinc-700 hover:text-zinc-600 dark:text-zinc-100 dark:hover:text-zinc-200"
              }`}
            >
              <span className="relative inline-flex items-center justify-center">
                <Icon icon={inCart ? "solar:cart-check-bold" : "solar:cart-plus-bold"} className="size-7" />
              </span>
            </button>
          </div>
        </div>
      </div>

      <span className={`absolute bottom-0 h-1 w-0 bg-[#2f66f6] transition-all duration-300 group-hover:w-full ${isRTL ? "right-0" : "left-0"}`} />
    </article>
  )
}

export function ProductsPage() {
  const { isRTL, lang } = useDictionary()
  const [favoriteIds, setFavoriteIds] = React.useState<Set<number>>(new Set())
  const [cartIds, setCartIds] = React.useState<Set<number>>(new Set())

  const toggleFavorite = React.useCallback((id: number) => {
    setFavoriteIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  const addToCart = React.useCallback((id: number) => {
    setCartIds((prev) => {
      if (prev.has(id)) {
        return prev
      }

      const next = new Set(prev)
      next.add(id)
      return next
    })
  }, [])

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6">
      <div dir={isRTL ? "rtl" : "ltr"} className="mb-3 flex items-center justify-between gap-3">
        <h2 className={`text-xl font-bold text-foreground ${isRTL ? "text-right" : "text-left"}`}>
          {lang === "ar" ? "المتجر" : "Store"}
        </h2>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex size-10 cursor-pointer items-center justify-center rounded-lg border border-border/30 bg-card text-zinc-800 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-colors hover:border-border/75 hover:bg-card dark:text-zinc-100 dark:hover:border-border/65"
            title={lang === "ar" ? "إضافة" : "Add"}
            aria-label={lang === "ar" ? "إضافة" : "Add"}
          >
            <Icon icon="lucide:plus" className="size-5" />
          </button>

          <button
            type="button"
            className="inline-flex size-10 cursor-pointer items-center justify-center rounded-lg border border-border/30 bg-card text-zinc-800 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-colors hover:border-border/75 hover:bg-card dark:text-zinc-100 dark:hover:border-border/65"
            title={lang === "ar" ? "تصفية" : "Filter"}
            aria-label={lang === "ar" ? "تصفية" : "Filter"}
          >
            <Icon icon="lucide:sliders-horizontal" className="size-5" />
          </button>
        </div>
      </div>

      <section className="rounded-3xl bg-card p-4 shadow-[0_8px_24px_rgba(0,0,0,0.05)] md:p-6 dark:shadow-[0_8px_24px_rgba(0,0,0,0.18)]">

        <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">
          {PRODUCTS.map((product) => (
            <ProductCard
              key={product.id}
              data={product}
              isRTL={isRTL}
              lang={lang}
              liked={favoriteIds.has(product.id)}
              inCart={cartIds.has(product.id)}
              onToggleLike={toggleFavorite}
              onAddToCart={addToCart}
            />
          ))}
        </div>
      </section>
    </div>
  )
}
