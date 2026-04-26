"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { Icon } from "@iconify/react"

import { GYM_ROUTES } from "@/lib/routes"
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
import { CreateGymModal } from "../create-gym-modal/CreateGymModal"
import { GYMS, type GymData } from "../shared"

type GymSortMode = "id-asc" | "id-desc" | "name-asc" | "name-desc"
type GymGenderFilter = "all" | "women" | "men" | "mixed"

function normalizeSearchValue(value: string): string {
  return value.toLowerCase().trim()
}

function GymCard({ gym, isRTL, lang }: { gym: GymData; isRTL: boolean; lang: string }) {
  const title = isRTL ? gym.titleAr : gym.titleEn
  const description = isRTL ? gym.descriptionAr : gym.descriptionEn
  const location = isRTL ? gym.locationAr : gym.locationEn
  const genderTags = gym.genderTags.map((gender) => (gender === "women" ? (isRTL ? "نساء" : "Women") : (isRTL ? "رجال" : "Men")))
  const categoryTags = isRTL ? gym.sportsAr : gym.sportsEn

  const isFemaleTag = (tag: string): boolean => {
    const normalized = tag.trim().toLowerCase()
    return normalized === "نساء" || normalized === "women" || normalized === "female"
  }

  const isMaleTag = (tag: string): boolean => {
    const normalized = tag.trim().toLowerCase()
    return normalized === "رجال" || normalized === "men" || normalized === "male"
  }

  const getCategoryIcon = (tag: string): string => {
    const normalized = tag.trim().toLowerCase()

    if (
      normalized === "الجري مع الأصدقاء"
      || normalized === "running with friends"
      || normalized === "run with friends"
      || normalized === "running"
    ) {
      return "solar:running-2-linear"
    }

    if (normalized === "دورة اللياقة" || normalized === "fitness cycle" || normalized === "fitness") {
      return "solar:dumbbell-large-2-linear"
    }

    if (normalized === "كرة السلة" || normalized === "basketball") {
      return "mdi:basketball"
    }

    if (normalized === "كرة القدم" || normalized === "football" || normalized === "soccer") {
      return "mdi:soccer"
    }

    return "solar:ball-linear"
  }

  return (
    <Link href={GYM_ROUTES.DETAIL(lang, gym.id)} className="block">
      <article
        dir="ltr"
        className="group overflow-hidden rounded-xl border border-border/35 bg-card/80 p-3 transition-all duration-200 hover:border-border/55 hover:bg-card"
      >
      <div className="flex gap-3 max-sm:flex-col">
        <div dir={isRTL ? "rtl" : "ltr"} className={`min-w-0 flex-1 ${isRTL ? "order-1" : "order-2"}`}>
          <div className="mb-1.5 flex items-start justify-between gap-3">
            <div className={`flex flex-wrap gap-1.5 ${isRTL ? "order-2 justify-start" : "order-2 justify-end"}`}>
              {genderTags.map((tag) => (
                <span
                  key={`${gym.id}-${tag}`}
                  dir={isRTL ? "rtl" : "ltr"}
                  className={isFemaleTag(tag)
                    ? "inline-flex items-center gap-1 rounded-full bg-pink-500/16 px-2 py-0.5 text-[11px] font-semibold text-pink-500"
                    : isMaleTag(tag)
                      ? "inline-flex items-center gap-1 rounded-full bg-blue-500/16 px-2 py-0.5 text-[11px] font-semibold text-blue-500"
                      : "inline-flex items-center gap-1 rounded-full bg-primary/12 px-2 py-0.5 text-[11px] font-semibold text-primary"
                  }
                >
                  {tag}
                  <Icon
                    icon={isFemaleTag(tag) ? "solar:women-linear" : isMaleTag(tag) ? "solar:men-linear" : "solar:user-linear"}
                    className="size-3"
                  />
                </span>
              ))}
            </div>

            <h3 className={`inline-flex items-center gap-1.5 text-lg font-bold text-foreground ${isRTL ? "order-1" : "order-1"}`}>
              {isRTL ? (
                <>
                  <span>{title}</span>
                  <Icon icon="solar:dumbbells-bold" className="size-4.5 text-primary" />
                </>
              ) : (
                <>
                  <Icon icon="solar:dumbbells-bold" className="size-4.5 text-primary" />
                  <span>{title}</span>
                </>
              )}
            </h3>
          </div>

          <p className={`line-clamp-2 text-[13px] leading-6 text-muted-foreground ${isRTL ? "text-right" : "text-left"}`}>
            {description}
          </p>

          <div className="my-2 border-t border-border/25" />

          <p
            dir={isRTL ? "rtl" : "ltr"}
            className={`inline-flex w-full items-start gap-1.5 text-[12px] text-muted-foreground ${isRTL ? "text-right" : "text-left"}`}
          >
            <Icon icon="solar:map-point-bold" className="mt-0.5 size-4 shrink-0 text-warning" />
            <span className="line-clamp-1">{location}</span>
          </p>

          <div dir={isRTL ? "rtl" : "ltr"} className="mt-2.5 flex flex-wrap justify-start gap-1.5">
            {categoryTags.map((tag, index) => (
              <span
                key={`${gym.id}-${tag}-${index}`}
                dir={isRTL ? "rtl" : "ltr"}
                className={index % 2 === 0
                  ? "inline-flex items-center gap-1 rounded-full bg-success/15 px-2 py-0.5 text-[11px] font-semibold text-success whitespace-nowrap"
                  : "inline-flex items-center gap-1 rounded-full bg-destructive/12 px-2 py-0.5 text-[11px] font-semibold text-destructive whitespace-nowrap"
                }
              >
                <Icon icon={getCategoryIcon(tag)} className="size-3" />
                <span>{tag}</span>
              </span>
            ))}
          </div>
        </div>

        <div className={`relative h-37 w-49 shrink-0 overflow-hidden rounded-lg border border-border/30 bg-muted/30 max-sm:h-42 max-sm:w-full ${isRTL ? "order-2" : "order-1"}`}>
          <Image
            src={gym.imageSrc}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            sizes="(max-width: 640px) 100vw, 196px"
          />
          <span className="pointer-events-none absolute inset-0 bg-black/12" />
        </div>
      </div>
      </article>
    </Link>
  )
}

export function GymsPage() {
  const { isRTL, lang } = useDictionary()
  const [isCreateGymModalOpen, setIsCreateGymModalOpen] = React.useState(false)
  const [searchDraft, setSearchDraft] = React.useState("")
  const [searchQuery, setSearchQuery] = React.useState("")
  const [isMobileSearchOpen, setIsMobileSearchOpen] = React.useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false)

  const [sortMode, setSortMode] = React.useState<GymSortMode>("id-asc")
  const [genderFilter, setGenderFilter] = React.useState<GymGenderFilter>("all")
  const [selectedCategories, setSelectedCategories] = React.useState<Set<string>>(new Set())

  const [draftSortMode, setDraftSortMode] = React.useState<GymSortMode>("id-asc")
  const [draftGenderFilter, setDraftGenderFilter] = React.useState<GymGenderFilter>("all")
  const [draftSelectedCategories, setDraftSelectedCategories] = React.useState<Set<string>>(new Set())

  const labels = lang === "ar"
    ? {
        title: "صالات رياضية",
        add: "إضافة",
        settings: "الإعدادات",
        settingsTitle: "إعدادات الصالات",
        sortSection: "الترتيب",
        sortNewest: "الأحدث (المعرف تنازلي)",
        sortOldest: "الأقدم (المعرف تصاعدي)",
        sortNameAsc: "الاسم (أ - ي)",
        sortNameDesc: "الاسم (ي - أ)",
        womenOnly: "نسائي فقط",
        menOnly: "رجالي فقط",
        mixed: "مختلط (رجال ونساء)",
        allGenders: "الكل",
        categorySection: "التصنيفات",
        searchPlaceholder: "ابحث عن صالة...",
        searchButton: "بحث",
        openSearch: "فتح البحث",
        searchOnMap: "بحث على الخريطة",
        cancelSearch: "إلغاء",
        applyFilters: "تطبيق",
        resetFilters: "إعادة الضبط",
        results: "نتيجة",
        noResults: "لا توجد صالات مطابقة.",
      }
    : {
        title: "Gyms",
        add: "Add",
        settings: "Settings",
        settingsTitle: "Gyms Settings",
        sortSection: "Sort",
        sortNewest: "Newest (ID Desc)",
        sortOldest: "Oldest (ID Asc)",
        sortNameAsc: "Name (A-Z)",
        sortNameDesc: "Name (Z-A)",
        womenOnly: "Women only",
        menOnly: "Men only",
        mixed: "Mixed (male and female)",
        allGenders: "All",
        categorySection: "Categories",
        searchPlaceholder: "Search gyms...",
        searchButton: "Search",
        openSearch: "Open search",
        searchOnMap: "Search on map",
        cancelSearch: "Cancel",
        applyFilters: "Apply",
        resetFilters: "Reset",
        results: "results",
        noResults: "No matching gyms found.",
      }

  const categoryOptions = React.useMemo(() => {
    const map = new Map<string, string>()

    GYMS.forEach((gym) => {
      gym.sportsEn.forEach((enTag, index) => {
        const arTag = gym.sportsAr[index] ?? enTag
        map.set(enTag, isRTL ? arTag : enTag)
      })
    })

    return Array.from(map.entries()).map(([key, label]) => ({ key, label }))
  }, [isRTL])

  const syncDraftWithApplied = React.useCallback(() => {
    setDraftSortMode(sortMode)
    setDraftGenderFilter(genderFilter)
    setDraftSelectedCategories(new Set(selectedCategories))
  }, [genderFilter, selectedCategories, sortMode])

  const applyDraftSettings = React.useCallback(() => {
    setSortMode(draftSortMode)
    setGenderFilter(draftGenderFilter)
    setSelectedCategories(new Set(draftSelectedCategories))
    setIsSettingsOpen(false)
  }, [draftGenderFilter, draftSelectedCategories, draftSortMode])

  const resetDraftSettings = React.useCallback(() => {
    const emptyCategories = new Set<string>()

    setDraftSortMode("id-asc")
    setDraftGenderFilter("all")
    setDraftSelectedCategories(emptyCategories)

    // Reset applies immediately.
    setSortMode("id-asc")
    setGenderFilter("all")
    setSelectedCategories(new Set(emptyCategories))
  }, [])

  const toggleDraftCategory = React.useCallback((category: string) => {
    setDraftSelectedCategories((current) => {
      const next = new Set(current)
      if (next.has(category)) {
        next.delete(category)
      } else {
        next.add(category)
      }
      return next
    })
  }, [])

  const handleSettingsOpenChange = React.useCallback((open: boolean) => {
    setIsSettingsOpen(open)
    if (open) {
      syncDraftWithApplied()
    }
  }, [syncDraftWithApplied])

  const applySearch = React.useCallback(() => {
    setSearchQuery(searchDraft.trim())
    setIsMobileSearchOpen(false)
  }, [searchDraft])

  const clearSearchDraft = React.useCallback(() => {
    setSearchDraft("")
    setSearchQuery("")
  }, [])

  const cancelMobileSearch = React.useCallback(() => {
    setSearchDraft(searchQuery)
    setIsMobileSearchOpen(false)
  }, [searchQuery])

  const keepSettingsMenuOpenOnSelect = React.useCallback((event: Event) => {
    event.preventDefault()
  }, [])

  const visibleGyms = React.useMemo(() => {
    let gyms = [...GYMS]

    if (genderFilter !== "all") {
      gyms = gyms.filter((gym) => {
        const normalizedTags = gym.genderTags.map((tag) => tag.trim().toLowerCase())

        if (genderFilter === "women") {
          return normalizedTags.includes("women") && !normalizedTags.includes("men")
        }

        if (genderFilter === "men") {
          return normalizedTags.includes("men") && !normalizedTags.includes("women")
        }

        return normalizedTags.includes("men") && normalizedTags.includes("women")
      })
    }

    if (selectedCategories.size > 0) {
      gyms = gyms.filter((gym) => gym.sportsEn.some((tag) => selectedCategories.has(tag)))
    }

    const normalizedQuery = normalizeSearchValue(searchQuery)
    if (normalizedQuery) {
      gyms = gyms.filter((gym) => {
        const values = [
          gym.titleAr,
          gym.titleEn,
          gym.descriptionAr,
          gym.descriptionEn,
          gym.locationAr,
          gym.locationEn,
        ]

        return values.some((value) => normalizeSearchValue(value).includes(normalizedQuery))
      })
    }

    gyms.sort((left, right) => {
      const leftTitle = isRTL ? left.titleAr : left.titleEn
      const rightTitle = isRTL ? right.titleAr : right.titleEn

      switch (sortMode) {
        case "id-desc":
          return right.id - left.id
        case "id-asc":
          return left.id - right.id
        case "name-asc":
          return leftTitle.localeCompare(rightTitle)
        case "name-desc":
          return rightTitle.localeCompare(leftTitle)
        default:
          return 0
      }
    })

    return gyms
  }, [genderFilter, isRTL, searchQuery, selectedCategories, sortMode])

  const hasSearchDraft = searchDraft.trim().length > 0

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-5 md:px-6">
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
            }}
          >
            <div className="w-full md:max-w-160">
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
              className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-border/30 bg-card px-3 text-sm font-semibold text-zinc-800 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-colors hover:border-border/75 hover:bg-card dark:text-zinc-100 dark:hover:border-border/65"
              title={labels.searchOnMap}
              aria-label={labels.searchOnMap}
            >
              <Icon icon="solar:map-point-linear" className="size-5 text-primary" />
              <span className="hidden sm:inline">{labels.searchOnMap}</span>
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
                      <DropdownMenuRadioGroup value={draftSortMode} onValueChange={(value) => setDraftSortMode(value as GymSortMode)}>
                        <DropdownMenuRadioItem value="id-desc" onSelect={keepSettingsMenuOpenOnSelect}>{labels.sortNewest}</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="id-asc" onSelect={keepSettingsMenuOpenOnSelect}>{labels.sortOldest}</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="name-asc" onSelect={keepSettingsMenuOpenOnSelect}>{labels.sortNameAsc}</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="name-desc" onSelect={keepSettingsMenuOpenOnSelect}>{labels.sortNameDesc}</DropdownMenuRadioItem>
                      </DropdownMenuRadioGroup>
                    </div>

                    <div className="space-y-3 rounded-lg border border-border/45 bg-muted/20 p-2">
                      <DropdownMenuRadioGroup value={draftGenderFilter} onValueChange={(value) => setDraftGenderFilter(value as GymGenderFilter)}>
                        <DropdownMenuRadioItem value="all" onSelect={keepSettingsMenuOpenOnSelect}>{labels.allGenders}</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="women" onSelect={keepSettingsMenuOpenOnSelect}>{labels.womenOnly}</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="men" onSelect={keepSettingsMenuOpenOnSelect}>{labels.menOnly}</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="mixed" onSelect={keepSettingsMenuOpenOnSelect}>{labels.mixed}</DropdownMenuRadioItem>
                      </DropdownMenuRadioGroup>

                      <DropdownMenuSeparator />

                      <div>
                        <DropdownMenuLabel className="pb-0 text-[11px] uppercase tracking-wide text-muted-foreground">{labels.categorySection}</DropdownMenuLabel>
                        {categoryOptions.map((category) => (
                          <DropdownMenuCheckboxItem
                            key={category.key}
                            checked={draftSelectedCategories.has(category.key)}
                            onSelect={(event) => { event.preventDefault(); toggleDraftCategory(category.key) }}
                          >
                            {category.label}
                          </DropdownMenuCheckboxItem>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

          <button
            type="button"
            title={labels.add}
            aria-label={labels.add}
            onClick={() => setIsCreateGymModalOpen(true)}
            className="inline-flex size-10 cursor-pointer items-center justify-center rounded-lg border border-border/30 bg-card text-zinc-800 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-colors hover:border-border/75 hover:bg-card dark:text-zinc-100 dark:hover:border-border/65"
          >
            <Icon icon="lucide:plus" className="size-5" />
          </button>
          </div>
        </div>
      </div>

      <section className="rounded-3xl bg-card p-4 shadow-[0_8px_24px_rgba(0,0,0,0.05)] md:p-6 dark:shadow-[0_8px_24px_rgba(0,0,0,0.18)]">
        <div dir={isRTL ? "rtl" : "ltr"} className="mb-4 text-xs font-semibold text-muted-foreground">
          {visibleGyms.length} {labels.results}
        </div>

        {visibleGyms.length === 0 ? (
          <div className="mb-4 rounded-2xl border border-dashed border-border/60 bg-muted/20 px-4 py-10 text-center text-sm font-medium text-muted-foreground">
            {labels.noResults}
          </div>
        ) : null}

        <div className="space-y-3">
          {visibleGyms.map((gym) => (
            <GymCard key={gym.id} gym={gym} isRTL={isRTL} lang={lang} />
          ))}
        </div>
      </section>

      <CreateGymModal
        open={isCreateGymModalOpen}
        onOpenChange={setIsCreateGymModalOpen}
        isRTL={isRTL}
        lang={lang}
      />
    </div>
  )
}
