"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { Icon } from "@iconify/react"

import { cn } from "@/lib/utils"
import { useDictionary } from "@/providers/dictionary-provider"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { COACHES_ROUTES } from "@/lib/routes"
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
import { COACHES, type CoachData, type CoachType } from "../shared"

const COACH_STATUS_META = {
  online: {
    labelAr: "اونلاين",
    labelEn: "Online",
    chipClassName: "bg-emerald-500/15 text-emerald-500",
    dotClassName: "bg-emerald-500",
  },
  offline: {
    labelAr: "اوفلاين",
    labelEn: "Offline",
    chipClassName: "bg-red-500/15 text-red-500",
    dotClassName: "bg-red-500",
  },
} as const

const COACH_TYPE_META = {
  fitness: {
    labelAr: "مدرب لياقة بدنية",
    labelEn: "Fitness coach",
    icon: "solar:dumbbell-large-2-linear",
    chipClassName: "bg-amber-500/15 text-amber-500",
  },
  running: {
    labelAr: "مدرب جري",
    labelEn: "Running coach",
    icon: "solar:running-2-linear",
    chipClassName: "bg-sky-500/15 text-sky-500",
  },
  football: {
    labelAr: "مدرب كرة قدم",
    labelEn: "Football coach",
    icon: "mdi:soccer",
    chipClassName: "bg-emerald-500/15 text-emerald-500",
  },
  basketball: {
    labelAr: "مدرب كرة سلة",
    labelEn: "Basketball coach",
    icon: "mdi:basketball",
    chipClassName: "bg-orange-500/15 text-orange-500",
  },
  yoga: {
    labelAr: "مدرب يوغا",
    labelEn: "Yoga coach",
    icon: "mdi:meditation",
    chipClassName: "bg-violet-500/15 text-violet-500",
  },
  strength: {
    labelAr: "مدرب قوة",
    labelEn: "Strength coach",
    icon: "mdi:arm-flex-outline",
    chipClassName: "bg-rose-500/15 text-rose-500",
  },
} as const

type CoachSortMode = "id-asc" | "id-desc" | "name-asc" | "name-desc"

function normalizeSearchValue(value: string): string {
  return value.toLowerCase().trim()
}

function CoachesCard({ data, isRTL, lang }: { data: CoachData; isRTL: boolean; lang: string }) {
  const title = isRTL ? data.nameAr : data.nameEn
  const statusMeta = COACH_STATUS_META[data.status]
  const status = isRTL ? statusMeta.labelAr : statusMeta.labelEn
  const description = isRTL ? data.descriptionAr : data.descriptionEn
  const typeMeta = COACH_TYPE_META[data.coachType]
  const tag = isRTL ? typeMeta.labelAr : typeMeta.labelEn
  const mutualLead = isRTL ? data.mutualLeadAr : data.mutualLeadEn
  const mutualLabel = isRTL ? data.mutualLabelAr : data.mutualLabelEn

  return (
    <article
      className="group relative overflow-hidden rounded-2xl border border-border/30 bg-card shadow-[0_4px_14px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-1 hover:border-border/55 hover:shadow-[0_12px_28px_rgba(34,95,236,0.18)]"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="relative h-56 w-full overflow-hidden border-b border-border/20 bg-muted/50 sm:h-64">
        <Link href={COACHES_ROUTES.DETAIL(lang, data.id)} className="block h-full w-full cursor-pointer">
          <Image
            src={data.avatarSrc}
            alt={title}
            fill
            className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.03]"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 360px"
          />
        </Link>
      </div>

      <div className="space-y-3 p-3">
        <div dir="ltr" className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : "flex-row"}`}>
          <Link href={COACHES_ROUTES.DETAIL(lang, data.id)} className={`min-w-0 flex-1 cursor-pointer ${isRTL ? "text-right" : "text-left"}`}>
            <h3 className="line-clamp-1 text-lg font-extrabold leading-6 text-foreground transition-colors hover:text-primary">
              {title}
            </h3>
          </Link>

          <div className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${statusMeta.chipClassName}`}>
            <span className={`inline-block size-2 rounded-full ${statusMeta.dotClassName}`} />
            {status}
          </div>
        </div>

        <div className="rounded-xl bg-zinc-200/65 px-3 py-2 text-center text-sm leading-6 text-muted-foreground dark:bg-zinc-700/55">
          <span className="line-clamp-2 wrap-break-word">{description}</span>
        </div>

        <div className="space-y-2">
          <div dir="ltr" className={`flex ${isRTL ? "justify-end" : "justify-start"}`}>
            <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${typeMeta.chipClassName}`}>
              <Icon icon={typeMeta.icon} className="size-3.5" />
              {tag}
            </span>
          </div>

          <div dir="ltr" className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : "flex-row"}`}>
            <div className="flex shrink-0 items-center">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="relative size-7 overflow-hidden rounded-full border border-card/70 shadow-[0_1px_3px_rgba(0,0,0,0.14)]"
                  style={{
                    marginInlineStart: index === 0 ? 0 : -8,
                    zIndex: 20 - index,
                  }}
                >
                  <Image
                    src={data.avatarSrc}
                    alt="mutual"
                    fill
                    className="object-cover"
                    sizes="28px"
                  />
                  <span className="pointer-events-none absolute inset-0 bg-black/25" />
                </div>
              ))}
            </div>

            <div className={`min-w-0 leading-6 text-muted-foreground ${isRTL ? "text-right" : "text-left"}`}>
              <p className="truncate text-[15px]">{mutualLead}</p>
              <p className="truncate text-[15px]">{mutualLabel}</p>
            </div>
          </div>
        </div>
      </div>

      <span className={`absolute bottom-0 h-1 w-0 bg-[#2f66f6] transition-all duration-300 group-hover:w-full ${isRTL ? "right-0" : "left-0"}`} />
    </article>
  )
}

export function CoachesPage() {
  const { isRTL, lang } = useDictionary()
  const [searchDraft, setSearchDraft] = React.useState("")
  const [searchQuery, setSearchQuery] = React.useState("")
  const [isMobileSearchOpen, setIsMobileSearchOpen] = React.useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false)

  const [sortMode, setSortMode] = React.useState<CoachSortMode>("id-asc")
  const [statusOnlineOnly, setStatusOnlineOnly] = React.useState(false)
  const [statusOfflineOnly, setStatusOfflineOnly] = React.useState(false)
  const [selectedTypes, setSelectedTypes] = React.useState<Set<CoachType>>(new Set())

  const [draftSortMode, setDraftSortMode] = React.useState<CoachSortMode>("id-asc")
  const [draftStatusOnlineOnly, setDraftStatusOnlineOnly] = React.useState(false)
  const [draftStatusOfflineOnly, setDraftStatusOfflineOnly] = React.useState(false)
  const [draftSelectedTypes, setDraftSelectedTypes] = React.useState<Set<CoachType>>(new Set())

  const labels = lang === "ar"
    ? {
        title: "المدربين",
        add: "إضافة",
        settings: "الإعدادات",
        settingsTitle: "إعدادات المدربين",
        sortSection: "الترتيب",
        sortNewest: "الأحدث (المعرف تنازلي)",
        sortOldest: "الأقدم (المعرف تصاعدي)",
        sortNameAsc: "الاسم (أ - ي)",
        sortNameDesc: "الاسم (ي - أ)",
        filtersSection: "الفلاتر",
        onlineOnly: "اونلاين فقط",
        offlineOnly: "اوفلاين فقط",
        typesSection: "أنواع التدريب",
        searchPlaceholder: "ابحث عن مدرب...",
        searchButton: "بحث",
        openSearch: "فتح البحث",
        cancelSearch: "إلغاء",
        applyFilters: "تطبيق",
        resetFilters: "إعادة الضبط",
        results: "نتيجة",
        noResults: "لا توجد نتائج مطابقة.",
      }
    : {
        title: "Coaches",
        add: "Add",
        settings: "Settings",
        settingsTitle: "Coaches Settings",
        sortSection: "Sort",
        sortNewest: "Newest (ID Desc)",
        sortOldest: "Oldest (ID Asc)",
        sortNameAsc: "Name (A-Z)",
        sortNameDesc: "Name (Z-A)",
        filtersSection: "Filters",
        onlineOnly: "Online only",
        offlineOnly: "Offline only",
        typesSection: "Coach Types",
        searchPlaceholder: "Search coaches...",
        searchButton: "Search",
        openSearch: "Open search",
        cancelSearch: "Cancel",
        applyFilters: "Apply",
        resetFilters: "Reset",
        results: "results",
        noResults: "No matching coaches found.",
      }

  const typeOptions = React.useMemo(
    () => (Object.keys(COACH_TYPE_META) as CoachType[]).map((type) => ({
      key: type,
      label: isRTL ? COACH_TYPE_META[type].labelAr : COACH_TYPE_META[type].labelEn,
    })),
    [isRTL],
  )

  const syncDraftWithApplied = React.useCallback(() => {
    setDraftSortMode(sortMode)
    setDraftStatusOnlineOnly(statusOnlineOnly)
    setDraftStatusOfflineOnly(statusOfflineOnly)
    setDraftSelectedTypes(new Set(selectedTypes))
  }, [selectedTypes, sortMode, statusOfflineOnly, statusOnlineOnly])

  const applyDraftSettings = React.useCallback(() => {
    setSortMode(draftSortMode)
    setStatusOnlineOnly(draftStatusOnlineOnly)
    setStatusOfflineOnly(draftStatusOfflineOnly)
    setSelectedTypes(new Set(draftSelectedTypes))
    setIsSettingsOpen(false)
  }, [draftSelectedTypes, draftSortMode, draftStatusOfflineOnly, draftStatusOnlineOnly])

  const resetDraftSettings = React.useCallback(() => {
    const emptyTypes = new Set<CoachType>()
    setDraftSortMode("id-asc")
    setDraftStatusOnlineOnly(false)
    setDraftStatusOfflineOnly(false)
    setDraftSelectedTypes(emptyTypes)

    // Reset applies immediately.
    setSortMode("id-asc")
    setStatusOnlineOnly(false)
    setStatusOfflineOnly(false)
    setSelectedTypes(new Set(emptyTypes))
  }, [])

  const toggleDraftType = React.useCallback((type: CoachType) => {
    setDraftSelectedTypes((current) => {
      const next = new Set(current)
      if (next.has(type)) {
        next.delete(type)
      } else {
        next.add(type)
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

  const visibleCoaches = React.useMemo(() => {
    let coaches = [...COACHES]

    if (statusOnlineOnly && !statusOfflineOnly) {
      coaches = coaches.filter((coach) => coach.status === "online")
    }

    if (statusOfflineOnly && !statusOnlineOnly) {
      coaches = coaches.filter((coach) => coach.status === "offline")
    }

    if (selectedTypes.size > 0) {
      coaches = coaches.filter((coach) => selectedTypes.has(coach.coachType))
    }

    const normalizedQuery = normalizeSearchValue(searchQuery)
    if (normalizedQuery) {
      coaches = coaches.filter((coach) => {
        const values = [coach.nameAr, coach.nameEn, coach.descriptionAr, coach.descriptionEn]
        return values.some((value) => normalizeSearchValue(value).includes(normalizedQuery))
      })
    }

    coaches.sort((left, right) => {
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
        default:
          return 0
      }
    })

    return coaches
  }, [isRTL, searchQuery, selectedTypes, sortMode, statusOfflineOnly, statusOnlineOnly])

  const isCompactGrid = visibleCoaches.length <= 2
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
                      <DropdownMenuRadioGroup value={draftSortMode} onValueChange={(value) => setDraftSortMode(value as CoachSortMode)}>
                        <DropdownMenuRadioItem value="id-desc" onSelect={keepSettingsMenuOpenOnSelect}>{labels.sortNewest}</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="id-asc" onSelect={keepSettingsMenuOpenOnSelect}>{labels.sortOldest}</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="name-asc" onSelect={keepSettingsMenuOpenOnSelect}>{labels.sortNameAsc}</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="name-desc" onSelect={keepSettingsMenuOpenOnSelect}>{labels.sortNameDesc}</DropdownMenuRadioItem>
                      </DropdownMenuRadioGroup>
                    </div>

                    <div className="space-y-3 rounded-lg border border-border/45 bg-muted/20 p-2">
                      <div>
                        <DropdownMenuLabel className="pb-0 text-[11px] uppercase tracking-wide text-muted-foreground">{labels.filtersSection}</DropdownMenuLabel>
                        <DropdownMenuCheckboxItem checked={draftStatusOnlineOnly} onSelect={(event) => { event.preventDefault(); setDraftStatusOnlineOnly((current) => !current) }}>
                          {labels.onlineOnly}
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem checked={draftStatusOfflineOnly} onSelect={(event) => { event.preventDefault(); setDraftStatusOfflineOnly((current) => !current) }}>
                          {labels.offlineOnly}
                        </DropdownMenuCheckboxItem>
                      </div>

                      <DropdownMenuSeparator />

                      <div>
                        <DropdownMenuLabel className="pb-0 text-[11px] uppercase tracking-wide text-muted-foreground">{labels.typesSection}</DropdownMenuLabel>
                        {typeOptions.map((option) => (
                          <DropdownMenuCheckboxItem
                            key={option.key}
                            checked={draftSelectedTypes.has(option.key)}
                            onSelect={(event) => { event.preventDefault(); toggleDraftType(option.key) }}
                          >
                            {option.label}
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
            className="inline-flex size-10 cursor-pointer items-center justify-center rounded-lg border border-border/30 bg-card text-zinc-800 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-colors hover:border-border/75 hover:bg-card dark:text-zinc-100 dark:hover:border-border/65"
            title={labels.add}
            aria-label={labels.add}
          >
            <Icon icon="lucide:plus" className="size-5" />
          </button>
          </div>
        </div>
      </div>

      <section className="rounded-3xl bg-card p-4 shadow-[0_8px_24px_rgba(0,0,0,0.05)] md:p-6 dark:shadow-[0_8px_24px_rgba(0,0,0,0.18)]">
        <div dir={isRTL ? "rtl" : "ltr"} className="mb-4 text-xs font-semibold text-muted-foreground">
          {visibleCoaches.length} {labels.results}
        </div>

        {visibleCoaches.length === 0 ? (
          <div className="mb-4 rounded-2xl border border-dashed border-border/60 bg-muted/20 px-4 py-10 text-center text-sm font-medium text-muted-foreground">
            {labels.noResults}
          </div>
        ) : null}

        <div className={cn(
          "gap-4",
          isCompactGrid
            ? "flex flex-wrap"
            : "grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))]",
        )}>
          {visibleCoaches.map((coach) => (
            <div key={coach.id} className={isCompactGrid ? "w-full sm:w-[320px]" : ""}>
              <CoachesCard data={coach} isRTL={isRTL} lang={lang} />
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
