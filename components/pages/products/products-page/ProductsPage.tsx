"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { Icon } from "@iconify/react"

import { PRODUCT_ROUTES } from "@/lib/routes"
import { cn } from "@/lib/utils"
import { useDictionary } from "@/providers/dictionary-provider"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  DEFAULT_PRODUCT_IMAGE,
  PRODUCTS,
  extractNumericPrice,
  getDiscountLabel,
  getOriginalPriceLabel,
  type ProductData,
} from "../shared"

type ProductSortMode =
  | "id-desc"
  | "id-asc"
  | "name-asc"
  | "name-desc"
  | "price-asc"
  | "price-desc"
  | "rating-desc"
  | "sold-desc"
  | "discount-desc"

const DEFAULT_SORT_MODE: ProductSortMode = "id-asc"
const DEFAULT_MIN_RATING: 0 | 4 | 4.5 = 0

function extractLeadingNumber(value: string): number {
  const match = value.match(/[\d,.]+/)
  if (!match) {
    return 0
  }

  const parsed = Number.parseFloat(match[0].replaceAll(",", ""))
  return Number.isFinite(parsed) ? parsed : 0
}

function normalizeSearchValue(value: string): string {
  return value.toLowerCase().trim()
}

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
            <span className="pointer-events-none absolute inset-0 rounded-full border-t border-border/20 dark:border-zinc-200/20" />

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
  const [searchDraft, setSearchDraft] = React.useState("")
  const [searchQuery, setSearchQuery] = React.useState("")
  const [isMobileSearchOpen, setIsMobileSearchOpen] = React.useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false)
  const [favoritesOnly, setFavoritesOnly] = React.useState(false)
  const [sortMode, setSortMode] = React.useState<ProductSortMode>(DEFAULT_SORT_MODE)
  const [discountOnly, setDiscountOnly] = React.useState(false)
  const [inStockOnly, setInStockOnly] = React.useState(false)
  const [minRating, setMinRating] = React.useState<0 | 4 | 4.5>(DEFAULT_MIN_RATING)
  const [selectedCategoryKeys, setSelectedCategoryKeys] = React.useState<Set<string>>(new Set())

  const [draftSortMode, setDraftSortMode] = React.useState<ProductSortMode>(DEFAULT_SORT_MODE)
  const [draftDiscountOnly, setDraftDiscountOnly] = React.useState(false)
  const [draftInStockOnly, setDraftInStockOnly] = React.useState(false)
  const [draftMinRating, setDraftMinRating] = React.useState<0 | 4 | 4.5>(DEFAULT_MIN_RATING)
  const [draftSelectedCategoryKeys, setDraftSelectedCategoryKeys] = React.useState<Set<string>>(new Set())

  const labels = isRTL
    ? {
        title: "المتجر",
        add: "إضافة",
        settings: "الإعدادات",
        settingsTitle: "إعدادات المنتجات",
        sortSection: "الترتيب",
        sortNewest: "الأحدث (المعرف تنازلي)",
        sortOldest: "الأقدم (المعرف تصاعدي)",
        sortNameAsc: "الاسم (أ - ي)",
        sortNameDesc: "الاسم (ي - أ)",
        sortPriceAsc: "السعر (من الأقل)",
        sortPriceDesc: "السعر (من الأعلى)",
        sortRating: "الأعلى تقييما",
        sortSold: "الأكثر مبيعا",
        sortDiscount: "أعلى خصم",
        filtersSection: "الفلاتر",
        filterDiscount: "العروض فقط",
        filterStock: "المتاح فقط",
        ratingSection: "الحد الأدنى للتقييم",
        ratingAny: "الكل",
        rating4: "4.0+",
        rating45: "4.5+",
        categoriesSection: "الفئات",
        applyFilters: "تطبيق",
        resetFilters: "إعادة الضبط",
        searchPlaceholder: "ابحث عن منتج...",
        searchButton: "بحث",
        openSearch: "فتح البحث",
        cancelSearch: "إلغاء",
        favorites: "المفضلة",
        favoritesOnly: "عرض المفضلة فقط",
        allProducts: "عرض كل المنتجات",
        results: "نتيجة",
        noProducts: "لا توجد منتجات مطابقة للإعدادات الحالية.",
      }
    : {
        title: "Store",
        add: "Add",
        settings: "Settings",
        settingsTitle: "Products Settings",
        sortSection: "Sort",
        sortNewest: "Newest (ID Desc)",
        sortOldest: "Oldest (ID Asc)",
        sortNameAsc: "Name (A-Z)",
        sortNameDesc: "Name (Z-A)",
        sortPriceAsc: "Price (Low to High)",
        sortPriceDesc: "Price (High to Low)",
        sortRating: "Top Rated",
        sortSold: "Best Selling",
        sortDiscount: "Highest Discount",
        filtersSection: "Filters",
        filterDiscount: "Discounted only",
        filterStock: "In stock only",
        ratingSection: "Minimum rating",
        ratingAny: "Any",
        rating4: "4.0+",
        rating45: "4.5+",
        categoriesSection: "Categories",
        applyFilters: "Apply",
        resetFilters: "Reset",
        searchPlaceholder: "Search products...",
        searchButton: "Search",
        openSearch: "Open search",
        cancelSearch: "Cancel",
        favorites: "Favorites",
        favoritesOnly: "Show favorites only",
        allProducts: "Show all products",
        results: "results",
        noProducts: "No products match the current settings.",
      }

  const categoryOptions = React.useMemo(
    () => Array.from(new Map(
      PRODUCTS.map((product) => [
        product.categoryEn,
        {
          key: product.categoryEn,
          label: isRTL ? product.categoryAr : product.categoryEn,
        },
      ]),
    ).values()),
    [isRTL],
  )

  const toggleDraftCategory = React.useCallback((categoryKey: string) => {
    setDraftSelectedCategoryKeys((current) => {
      const next = new Set(current)
      if (next.has(categoryKey)) {
        next.delete(categoryKey)
      } else {
        next.add(categoryKey)
      }
      return next
    })
  }, [])

  const syncDraftWithApplied = React.useCallback(() => {
    setDraftSortMode(sortMode)
    setDraftDiscountOnly(discountOnly)
    setDraftInStockOnly(inStockOnly)
    setDraftMinRating(minRating)
    setDraftSelectedCategoryKeys(new Set(selectedCategoryKeys))
  }, [discountOnly, inStockOnly, minRating, selectedCategoryKeys, sortMode])

  const resetDraftSettings = React.useCallback(() => {
    const resetCategories = new Set<string>()

    setDraftSortMode(DEFAULT_SORT_MODE)
    setDraftDiscountOnly(false)
    setDraftInStockOnly(false)
    setDraftMinRating(DEFAULT_MIN_RATING)
    setDraftSelectedCategoryKeys(resetCategories)

    // Reset should apply immediately without waiting for Apply click.
    setSortMode(DEFAULT_SORT_MODE)
    setDiscountOnly(false)
    setInStockOnly(false)
    setMinRating(DEFAULT_MIN_RATING)
    setSelectedCategoryKeys(new Set(resetCategories))
  }, [])

  const applyDraftSettings = React.useCallback(() => {
    setSortMode(draftSortMode)
    setDiscountOnly(draftDiscountOnly)
    setInStockOnly(draftInStockOnly)
    setMinRating(draftMinRating)
    setSelectedCategoryKeys(new Set(draftSelectedCategoryKeys))
    setIsSettingsOpen(false)
  }, [draftDiscountOnly, draftInStockOnly, draftMinRating, draftSelectedCategoryKeys, draftSortMode])

  const handleSettingsOpenChange = React.useCallback((open: boolean) => {
    setIsSettingsOpen(open)
    if (open) {
      syncDraftWithApplied()
    }
  }, [syncDraftWithApplied])

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

  const applySearch = React.useCallback(() => {
    setSearchQuery(searchDraft.trim())
  }, [searchDraft])

  const cancelMobileSearch = React.useCallback(() => {
    setSearchDraft(searchQuery)
    setIsMobileSearchOpen(false)
  }, [searchQuery])

  const clearSearchDraft = React.useCallback(() => {
    setSearchDraft("")
    setSearchQuery("")
  }, [])

  const keepSettingsMenuOpenOnSelect = React.useCallback((event: Event) => {
    event.preventDefault()
  }, [])

  const visibleProducts = React.useMemo(() => {
    let products = [...PRODUCTS]

    if (favoritesOnly) {
      products = products.filter((product) => favoriteIds.has(product.id))
    }

    if (discountOnly) {
      products = products.filter((product) => (product.discountPercentage ?? 0) > 0)
    }

    if (inStockOnly) {
      products = products.filter((product) => extractLeadingNumber(product.stockEn) > 0)
    }

    if (minRating > 0) {
      products = products.filter((product) => extractLeadingNumber(product.ratingEn) >= minRating)
    }

    if (selectedCategoryKeys.size > 0) {
      products = products.filter((product) => selectedCategoryKeys.has(product.categoryEn))
    }

    const normalizedQuery = normalizeSearchValue(searchQuery)
    if (normalizedQuery) {
      products = products.filter((product) => {
        const searchableValues = [
          String(product.id),
          product.nameAr,
          product.nameEn,
          product.descriptionAr,
          product.descriptionEn,
          product.categoryAr,
          product.categoryEn,
        ]

        return searchableValues.some((value) => normalizeSearchValue(value).includes(normalizedQuery))
      })
    }

    products.sort((left, right) => {
      const leftName = isRTL ? left.nameAr : left.nameEn
      const rightName = isRTL ? right.nameAr : right.nameEn

      switch (sortMode) {
        case "id-desc":
          return right.id - left.id
        case "id-asc":
          return left.id - right.id
        case "name-asc":
          return leftName.localeCompare(rightName)
        case "name-desc":
          return rightName.localeCompare(leftName)
        case "price-asc":
          return extractNumericPrice(left.priceEn) - extractNumericPrice(right.priceEn)
        case "price-desc":
          return extractNumericPrice(right.priceEn) - extractNumericPrice(left.priceEn)
        case "rating-desc":
          return extractLeadingNumber(right.ratingEn) - extractLeadingNumber(left.ratingEn)
        case "sold-desc":
          return extractLeadingNumber(right.soldEn) - extractLeadingNumber(left.soldEn)
        case "discount-desc":
          return (right.discountPercentage ?? 0) - (left.discountPercentage ?? 0)
        default:
          return 0
      }
    })

    return products
  }, [discountOnly, favoriteIds, favoritesOnly, inStockOnly, isRTL, minRating, searchQuery, selectedCategoryKeys, sortMode])

  const isCompactProductGrid = visibleProducts.length <= 2
  const hasSearchDraft = searchDraft.trim().length > 0

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6">
      <div dir={isRTL ? "rtl" : "ltr"} className="mb-3">
        <div className="flex items-center gap-2">
          <h2 className={`shrink-0 text-xl font-bold text-foreground ${isRTL ? "text-right" : "text-left"}`}>
            {labels.title}
          </h2>

          <form
            className={cn(
              "hidden items-center gap-2",
              "md:flex md:min-w-0 md:flex-1 md:justify-center",
              isMobileSearchOpen && "flex min-w-0 flex-1",
            )}
            onSubmit={(event) => {
              event.preventDefault()
              applySearch()
              setIsMobileSearchOpen(false)
            }}
          >
            <div className="w-full md:max-w-[40rem]">
              <Input
                value={searchDraft}
                onChange={(event) => {
                  const nextValue = event.target.value
                  setSearchDraft(nextValue)

                  if (nextValue.trim() === "") {
                    setSearchQuery("")
                  }
                }}
                placeholder={labels.searchPlaceholder}
                endIcon={hasSearchDraft ? (
                  <div className="pointer-events-auto inline-flex h-5 items-center gap-1 leading-none">
                    <button
                      type="submit"
                      className="inline-flex size-5 cursor-pointer items-center justify-center leading-none text-primary transition-colors hover:text-primary/80"
                      aria-label={labels.searchButton}
                    >
                      <Icon icon="solar:magnifer-linear" className="block size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={clearSearchDraft}
                      className="inline-flex size-5 cursor-pointer items-center justify-center leading-none text-muted-foreground transition-colors hover:text-foreground"
                      aria-label={lang === "ar" ? "مسح النص" : "Clear text"}
                    >
                      <Icon icon="material-symbols:close-rounded" className="block size-4" />
                    </button>
                  </div>
                ) : (
                  <Icon icon="solar:magnifer-linear" className="size-4" />
                )}
                endIconInteractive
                className="h-10 rounded-full border border-border/40 bg-surface"
              />
            </div>

            {isMobileSearchOpen ? (
              <Button type="button" variant="outline" size="sm" className="h-10 px-3 md:hidden" onClick={cancelMobileSearch}>
                {labels.cancelSearch}
              </Button>
            ) : null}
          </form>

          <div className={cn("ms-auto shrink-0 items-center gap-2", isMobileSearchOpen ? "hidden md:flex" : "flex")}>
            <button
              type="button"
              onClick={() => setIsMobileSearchOpen(true)}
              className="inline-flex size-10 cursor-pointer items-center justify-center rounded-lg border border-border/30 bg-card text-zinc-800 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-colors hover:border-border/75 hover:bg-card dark:text-zinc-100 dark:hover:border-border/65 md:hidden"
              title={labels.openSearch}
              aria-label={labels.openSearch}
            >
              <Icon icon="solar:magnifer-linear" className="size-5" />
            </button>

            <button
              type="button"
              onClick={() => setFavoritesOnly((current) => !current)}
              className={`inline-flex h-10 min-w-10 cursor-pointer items-center justify-center gap-1.5 rounded-lg border px-2 transition-colors ${
                favoritesOnly
                  ? "border-red-500/50 bg-red-500/12 text-red-500"
                  : "border-border/35 bg-card text-zinc-800 hover:border-border/75 dark:text-zinc-100"
              }`}
              title={favoritesOnly ? labels.allProducts : labels.favoritesOnly}
              aria-label={favoritesOnly ? labels.allProducts : labels.favoritesOnly}
              aria-pressed={favoritesOnly}
            >
              <Icon icon={favoritesOnly ? "solar:heart-bold" : "solar:heart-linear"} className="size-5" />
              {favoriteIds.size > 0 ? (
                <span className="inline-flex min-w-4.5 items-center justify-center rounded-full bg-black/15 px-1 py-0.5 text-[10px] font-bold leading-none text-current dark:bg-white/20">
                  {favoriteIds.size}
                </span>
              ) : null}
            </button>

            <DropdownMenu open={isSettingsOpen} onOpenChange={handleSettingsOpenChange}>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="inline-flex size-10 cursor-pointer items-center justify-center rounded-lg border border-border/30 bg-card text-zinc-800 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-colors hover:border-border/75 hover:bg-card dark:text-zinc-100 dark:hover:border-border/65"
                  title={labels.settings}
                  aria-label={labels.settings}
                >
                  <Icon icon="lucide:sliders-horizontal" className="size-5" />
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align={isRTL ? "start" : "end"}
                className="w-[92vw] max-w-92 lg:max-w-184 max-h-[min(85vh,var(--radix-dropdown-menu-content-available-height))] overflow-hidden rounded-xl border-border/60 bg-popover p-3"
              >
                <div className="flex items-center justify-between gap-2 px-2 py-1">
                  <DropdownMenuLabel className="p-0 text-sm font-bold">{labels.settingsTitle}</DropdownMenuLabel>
                  <div className="inline-flex items-center gap-3">
                    <button
                      type="button"
                      onClick={applyDraftSettings}
                      className="cursor-pointer text-sm font-semibold text-primary underline-offset-4 transition-colors hover:text-primary/80 hover:underline"
                    >
                      {labels.applyFilters}
                    </button>
                    <button
                      type="button"
                      onClick={resetDraftSettings}
                      className="cursor-pointer text-sm font-semibold text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
                    >
                      {labels.resetFilters}
                    </button>
                  </div>
                </div>

                <div
                  className="rounded-lg ps-2 pe-3"
                  style={{ maxHeight: "calc(min(85vh, var(--radix-dropdown-menu-content-available-height)) - 3rem)", overflowY: "auto" }}
                >
                  <div className="grid gap-3 lg:grid-cols-2">
                    <div className="space-y-3 rounded-lg border border-border/45 bg-muted/20 p-2">
                      <DropdownMenuLabel className="pb-0 text-[11px] uppercase tracking-wide text-muted-foreground">{labels.sortSection}</DropdownMenuLabel>
                      <DropdownMenuRadioGroup value={draftSortMode} onValueChange={(value) => setDraftSortMode(value as ProductSortMode)}>
                        <DropdownMenuRadioItem value="id-desc" onSelect={keepSettingsMenuOpenOnSelect}>{labels.sortNewest}</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="id-asc" onSelect={keepSettingsMenuOpenOnSelect}>{labels.sortOldest}</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="name-asc" onSelect={keepSettingsMenuOpenOnSelect}>{labels.sortNameAsc}</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="name-desc" onSelect={keepSettingsMenuOpenOnSelect}>{labels.sortNameDesc}</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="price-asc" onSelect={keepSettingsMenuOpenOnSelect}>{labels.sortPriceAsc}</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="price-desc" onSelect={keepSettingsMenuOpenOnSelect}>{labels.sortPriceDesc}</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="rating-desc" onSelect={keepSettingsMenuOpenOnSelect}>{labels.sortRating}</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="sold-desc" onSelect={keepSettingsMenuOpenOnSelect}>{labels.sortSold}</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="discount-desc" onSelect={keepSettingsMenuOpenOnSelect}>{labels.sortDiscount}</DropdownMenuRadioItem>
                      </DropdownMenuRadioGroup>
                    </div>

                    <div className="space-y-3 rounded-lg border border-border/45 bg-muted/20 p-2">
                      <div>
                        <DropdownMenuLabel className="pb-0 text-[11px] uppercase tracking-wide text-muted-foreground">{labels.filtersSection}</DropdownMenuLabel>
                        <DropdownMenuCheckboxItem checked={draftDiscountOnly} onSelect={() => setDraftDiscountOnly((current) => !current)}>
                          {labels.filterDiscount}
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem checked={draftInStockOnly} onSelect={() => setDraftInStockOnly((current) => !current)}>
                          {labels.filterStock}
                        </DropdownMenuCheckboxItem>
                      </div>

                      <DropdownMenuSeparator />

                      <div>
                        <DropdownMenuLabel className="pb-0 text-[11px] uppercase tracking-wide text-muted-foreground">{labels.ratingSection}</DropdownMenuLabel>
                        <DropdownMenuRadioGroup
                          value={String(draftMinRating)}
                          onValueChange={(value) => setDraftMinRating(Number(value) as 0 | 4 | 4.5)}
                        >
                          <DropdownMenuRadioItem value="0" onSelect={keepSettingsMenuOpenOnSelect}>{labels.ratingAny}</DropdownMenuRadioItem>
                          <DropdownMenuRadioItem value="4" onSelect={keepSettingsMenuOpenOnSelect}>{labels.rating4}</DropdownMenuRadioItem>
                          <DropdownMenuRadioItem value="4.5" onSelect={keepSettingsMenuOpenOnSelect}>{labels.rating45}</DropdownMenuRadioItem>
                        </DropdownMenuRadioGroup>
                      </div>

                      <DropdownMenuSeparator />

                      <div>
                        <DropdownMenuLabel className="pb-0 text-[11px] uppercase tracking-wide text-muted-foreground">{labels.categoriesSection}</DropdownMenuLabel>
                        <div className="max-h-40 overflow-y-auto">
                          {categoryOptions.map((category) => (
                            <DropdownMenuCheckboxItem
                              key={category.key}
                              checked={draftSelectedCategoryKeys.has(category.key)}
                              onSelect={() => toggleDraftCategory(category.key)}
                            >
                              {category.label}
                            </DropdownMenuCheckboxItem>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <button
              type="button"
              className="inline-flex size-10 cursor-pointer items-center justify-center rounded-lg border border-border/30 bg-card text-zinc-800 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-colors hover:border-border/75 hover:bg-card dark:text-zinc-100 dark:hover:border-border/65"
              title={labels.add}
              aria-label={labels.add}
            >
              <Icon icon="lucide:plus" className="size-5" />
            </button>
          </div>
        </div>
      </div>

      <section className="relative rounded-3xl bg-card p-4 shadow-[0_8px_24px_rgba(0,0,0,0.05)] md:p-6 dark:shadow-[0_8px_24px_rgba(0,0,0,0.18)]">
        <div className="relative z-0">
          <div dir={isRTL ? "rtl" : "ltr"} className="mb-4 text-xs font-semibold text-muted-foreground">
            {visibleProducts.length} {labels.results}
          </div>

          {visibleProducts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/60 bg-muted/20 px-4 py-10 text-center text-sm font-medium text-muted-foreground">
              {labels.noProducts}
            </div>
          ) : null}

          <div className={cn(
            "gap-4",
            isCompactProductGrid
              ? "flex flex-wrap"
              : "grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))]",
          )}>
            {visibleProducts.map((product) => (
              <div key={product.id} className={isCompactProductGrid ? "w-full sm:w-[320px]" : ""}>
                <ProductCard
                  data={product}
                  isRTL={isRTL}
                  lang={lang}
                  liked={favoriteIds.has(product.id)}
                  inCart={cartIds.has(product.id)}
                  onToggleLike={toggleFavorite}
                  onAddToCart={addToCart}
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
