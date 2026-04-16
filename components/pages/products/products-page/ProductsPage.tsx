"use client"

import * as React from "react"
import Image from "next/image"
import { Icon } from "@iconify/react"

import { useDictionary } from "@/providers/dictionary-provider"

interface ProductCardData {
  id: number
  nameAr: string
  nameEn: string
  priceAr: string
  priceEn: string
  descriptionAr: string
  descriptionEn: string
  categoryAr: string
  categoryEn: string
  ratingAr: string
  ratingEn: string
  soldAr: string
  soldEn: string
  discountPercentage?: number
}

const DEFAULT_AVATAR = "/images/default-user.jpg"

const PRODUCTS: ProductCardData[] = [
  {
    id: 1,
    nameAr: "منتج وي بروتين فيت خوليتي",
    nameEn: "Gold Standard Whey Protein",
    priceAr: "97.50 MAD",
    priceEn: "97.50 MAD",
    descriptionAr: "بروتين ثري لدعم العضلات والاستشفاء بعد التمرين.",
    descriptionEn: "Premium protein to support muscle recovery after workouts.",
    categoryAr: "مكملات غذائية",
    categoryEn: "Supplements",
    ratingAr: "4.9 (1,090)",
    ratingEn: "4.9 (1,090)",
    soldAr: "458 تم البيع",
    soldEn: "458 Sold",
    discountPercentage: 70,
  },
  {
    id: 2,
    nameAr: "منتج وي بروتين فيت خوليتي",
    nameEn: "Gold Standard Whey Protein",
    priceAr: "97.50 MAD",
    priceEn: "97.50 MAD",
    descriptionAr: "بروتين ثري لدعم العضلات والاستشفاء بعد التمرين.",
    descriptionEn: "Premium protein to support muscle recovery after workouts.",
    categoryAr: "مكملات غذائية",
    categoryEn: "Supplements",
    ratingAr: "4.9 (1,090)",
    ratingEn: "4.9 (1,090)",
    soldAr: "458 تم البيع",
    soldEn: "458 Sold",
  },
  {
    id: 3,
    nameAr: "منتج وي بروتين فيت خوليتي",
    nameEn: "Gold Standard Whey Protein",
    priceAr: "97.50 MAD",
    priceEn: "97.50 MAD",
    descriptionAr: "بروتين ثري لدعم العضلات والاستشفاء بعد التمرين.",
    descriptionEn: "Premium protein to support muscle recovery after workouts.",
    categoryAr: "مكملات غذائية",
    categoryEn: "Supplements",
    ratingAr: "4.9 (1,090)",
    ratingEn: "4.9 (1,090)",
    soldAr: "458 تم البيع",
    soldEn: "458 Sold",
    discountPercentage: 35,
  },
  {
    id: 4,
    nameAr: "منتج وي بروتين فيت خوليتي",
    nameEn: "Gold Standard Whey Protein",
    priceAr: "97.50 MAD",
    priceEn: "97.50 MAD",
    descriptionAr: "بروتين ثري لدعم العضلات والاستشفاء بعد التمرين.",
    descriptionEn: "Premium protein to support muscle recovery after workouts.",
    categoryAr: "مكملات غذائية",
    categoryEn: "Supplements",
    ratingAr: "4.9 (1,090)",
    ratingEn: "4.9 (1,090)",
    soldAr: "458 تم البيع",
    soldEn: "458 Sold",
  },
  {
    id: 5,
    nameAr: "منتج وي بروتين فيت خوليتي",
    nameEn: "Gold Standard Whey Protein",
    priceAr: "97.50 MAD",
    priceEn: "97.50 MAD",
    descriptionAr: "بروتين ثري لدعم العضلات والاستشفاء بعد التمرين.",
    descriptionEn: "Premium protein to support muscle recovery after workouts.",
    categoryAr: "مكملات غذائية",
    categoryEn: "Supplements",
    ratingAr: "4.9 (1,090)",
    ratingEn: "4.9 (1,090)",
    soldAr: "458 تم البيع",
    soldEn: "458 Sold",
    discountPercentage: 20,
  },
  {
    id: 6,
    nameAr: "منتج وي بروتين فيت خوليتي",
    nameEn: "Gold Standard Whey Protein",
    priceAr: "97.50 MAD",
    priceEn: "97.50 MAD",
    descriptionAr: "بروتين ثري لدعم العضلات والاستشفاء بعد التمرين.",
    descriptionEn: "Premium protein to support muscle recovery after workouts.",
    categoryAr: "مكملات غذائية",
    categoryEn: "Supplements",
    ratingAr: "4.9 (1,090)",
    ratingEn: "4.9 (1,090)",
    soldAr: "458 تم البيع",
    soldEn: "458 Sold",
  },
]

function getDiscountLabel(discountPercentage: number, lang: string) {
  return lang === "ar" ? `خصم %${discountPercentage}` : `${discountPercentage}% OFF`
}

function ProductCard({
  data,
  isRTL,
  lang,
  liked,
  onToggleLike,
}: {
  data: ProductCardData
  isRTL: boolean
  lang: string
  liked: boolean
  onToggleLike: (id: number) => void
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
        <Image
          src={DEFAULT_AVATAR}
          alt={name}
          fill
          className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.03]"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 360px"
        />
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
          <h3 className={`line-clamp-2 min-h-12 min-w-0 flex-1 text-lg font-extrabold leading-6 text-foreground ${isRTL ? "text-right" : "text-left"}`}>
            {name}
          </h3>
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

        <div className="rounded-xl bg-zinc-200/65 px-3 py-2 text-center text-sm leading-6 text-muted-foreground dark:bg-zinc-700/55">
          <span className="line-clamp-2 wrap-break-word">{description}</span>
        </div>

        <div className="space-y-2">
          <div dir="ltr" className={`flex ${isRTL ? "justify-end" : "justify-start"}`}>
            <span className="inline-flex shrink-0 rounded-full bg-primary/12 px-2.5 py-1 text-xs font-bold text-primary">
              {category}
            </span>
          </div>

          <div dir="ltr" className={`flex items-center justify-between gap-2 ${isRTL ? "flex-row-reverse" : "flex-row"}`}>
            <span className="text-lg font-extrabold text-primary">{price}</span>
            <button type="button" className="inline-flex items-center justify-center rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90">
              <Icon icon="solar:cart-plus-linear" className="size-4" />
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
              onToggleLike={toggleFavorite}
            />
          ))}
        </div>
      </section>
    </div>
  )
}
