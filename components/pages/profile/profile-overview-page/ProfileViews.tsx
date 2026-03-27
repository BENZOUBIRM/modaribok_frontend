"use client"

import * as React from "react"
import Image from "next/image"
import { Icon } from "@iconify/react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/primitives/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { UserRole } from "@/types/auth"
import { ProfilePatternOverlay } from "./ProfilePatternOverlay"

type ProfileType = "user" | "store" | "coach"

interface ProfileViewsProps {
  lang: "ar" | "en"
  profileType: ProfileType
  displayName: string
  handle: string
  avatarUrl: string
  userRole: UserRole
}

function labels(lang: "ar" | "en") {
  return lang === "ar"
    ? {
        posts: "منشور",
        followers: "متابعين",
        following: "أتابع",
        subscribe: "اشترك الآن",
        profileButton: "تعديل الملف الشخصي",
        report: "عرض الأرشيف",
        tabPosts: "منشورات",
        tabImages: "صور",
        tabVideos: "فيديوهات",
        tabEvents: "أحداث",
        emptyTitle: "لا يوجد محتوى بعد",
        emptyDesc: "سيظهر المحتوى هنا بعد ربط المنطق.",
        privateAccounts: "حساباتي الخاصة",
        aboutUser:
          "نؤمن دائمًا بصناعة فرق من البداية بطريقة منهجية، وهدفنا تقديم تجربة متكاملة وقابلة للتطوير مع تقدم مستواك الرياضي.",
        aboutStore:
          "نوفّر لك أفضل المنتجات المختارة بعناية مع تجربة شراء سلسة وخدمة موثوقة، وسيتم ربط بيانات المنتجات الحقيقية لاحقًا.",
        aboutCoach:
          "مدرب معتمد بخبرة عملية، أساعدك على بناء خطة واضحة تناسب أهدافك مع متابعة مستمرة وتوجيه شخصي.",
        certificates: "شهادات التدريب",
        sessions: "مواعيد العمل",
        packages: "الحصص التدريبية",
        prices: "الأسعار",
        links: "روابط التواصل",
        products: "منتجات المتجر",
      }
    : {
        posts: "Posts",
        followers: "Followers",
        following: "Following",
        subscribe: "Subscribe",
        profileButton: "Edit profile",
        report: "View archive",
        tabPosts: "Posts",
        tabImages: "Images",
        tabVideos: "Videos",
        tabEvents: "Events",
        emptyTitle: "No content yet",
        emptyDesc: "Content will appear here once logic is connected.",
        privateAccounts: "Private accounts",
        aboutUser:
          "We provide a progressive training experience with a practical methodology designed to grow with your goals.",
        aboutStore:
          "We curate high-quality products with a smooth shopping experience. Real product data will be connected later.",
        aboutCoach:
          "Certified coach with practical experience, helping you build a clear plan with consistent guidance.",
        certificates: "Training certificates",
        sessions: "Working schedule",
        packages: "Training packages",
        prices: "Pricing",
        links: "Social links",
        products: "Store products",
      }
}

function ProfileHeader({
  lang,
  profileType,
  displayName,
  handle,
  avatarUrl,
  about,
  userRole,
}: {
  lang: "ar" | "en"
  profileType: ProfileType
  displayName: string
  handle: string
  avatarUrl: string
  about: string
  userRole: UserRole
}) {
  const t = labels(lang)
  const isRTL = lang === "ar"
  const [isPreviewOpen, setIsPreviewOpen] = React.useState(false)
  const [zoom, setZoom] = React.useState(1)

  const closePreview = () => {
    setIsPreviewOpen(false)
    setZoom(1)
  }

  const zoomIn = () => setZoom((prev) => Math.min(4, Number((prev + 0.25).toFixed(2))))
  const zoomOut = () => setZoom((prev) => Math.max(1, Number((prev - 0.25).toFixed(2))))
  const resetZoom = () => setZoom(1)
  const badgeType =
    profileType === "store"
      ? "STORE"
      : profileType === "coach"
        ? "COACH"
        : userRole === "ADMIN"
          ? "ADMIN"
          : "USER"

  const roleBadgeConfig =
    lang === "ar"
      ? {
          USER: {
            label: "مستخدم",
            icon: "solar:user-linear",
            className: "border-success/30 bg-success/15 text-success",
          },
          ADMIN: {
            label: "مدير",
            icon: "solar:shield-user-linear",
            className: "border-destructive/30 bg-destructive/15 text-destructive",
          },
          STORE: {
            label: "متجر",
            icon: "solar:shop-linear",
            className: "border-warning/30 bg-warning/15 text-warning",
          },
          COACH: {
            label: "مدرب",
            icon: "solar:medal-ribbons-star-linear",
            className: "border-primary/30 bg-primary/15 text-primary",
          },
        }
      : {
          USER: {
            label: "User",
            icon: "solar:user-linear",
            className: "border-success/30 bg-success/15 text-success",
          },
          ADMIN: {
            label: "Admin",
            icon: "solar:shield-user-linear",
            className: "border-destructive/30 bg-destructive/15 text-destructive",
          },
          STORE: {
            label: "Store",
            icon: "solar:shop-linear",
            className: "border-warning/30 bg-warning/15 text-warning",
          },
          COACH: {
            label: "Coach",
            icon: "solar:medal-ribbons-star-linear",
            className: "border-primary/30 bg-primary/15 text-primary",
          },
        }

  const roleBadge = roleBadgeConfig[badgeType]

  React.useEffect(() => {
    if (!isPreviewOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closePreview()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [isPreviewOpen])

  return (
    <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
      {isRTL ? (
        <>
          <div className="space-y-5">
              <div dir="ltr" className="flex items-center justify-between gap-3">
              <button
                type="button"
                title="إضافة"
                aria-label="إضافة"
                className="inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-border bg-background text-muted-foreground"
              >
                <Icon icon="solar:add-circle-linear" className="size-5" />
              </button>

              <div className="flex flex-wrap items-center justify-end gap-2">
                <button className="hidden sm:inline-flex rounded-md border border-border bg-muted px-4 py-1.5 text-sm font-semibold text-foreground">
                  عرض الأرشيف
                </button>
                <button className="hidden sm:inline-flex rounded-md bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground">
                  تعديل الملف الشخصي
                </button>
                <button className="hidden sm:inline-flex items-center gap-1 rounded-md bg-warning px-4 py-1.5 text-sm font-semibold text-warning-foreground">
                  <Icon icon="solar:crown-bold" className="size-4" />
                  ترقية إلى حساب مدرب
                </button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      title="خيارات"
                      aria-label="خيارات"
                      className="inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-border bg-background text-muted-foreground"
                    >
                      <Icon icon="solar:menu-dots-linear" className="size-5" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="sm:hidden min-w-56 space-y-1 p-2">
                    <DropdownMenuItem className="justify-center rounded-md border border-border bg-muted px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted/80 focus:bg-muted/80 dark:hover:bg-muted/80 dark:focus:bg-muted/80 data-highlighted:bg-muted/80 dark:data-highlighted:bg-muted/80">
                      عرض الأرشيف
                    </DropdownMenuItem>
                    <DropdownMenuItem className="justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 focus:bg-primary/90 dark:hover:bg-primary/90 dark:focus:bg-primary/90 data-highlighted:bg-primary/90 dark:data-highlighted:bg-primary/90">
                      تعديل الملف الشخصي
                    </DropdownMenuItem>
                    <DropdownMenuItem className="justify-center rounded-md bg-warning px-4 py-2 text-sm font-semibold text-warning-foreground hover:bg-warning/90 focus:bg-warning/90 dark:hover:bg-warning/90 dark:focus:bg-warning/90 data-highlighted:bg-warning/90 dark:data-highlighted:bg-warning/90">
                      <Icon icon="solar:crown-bold" className="size-4" />
                      ترقية إلى حساب مدرب
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              </div>

              <div className="relative overflow-hidden rounded-lg">
                <ProfilePatternOverlay />
                <div dir="ltr" className="relative z-10 px-2 py-3 md:px-3 md:py-4 flex flex-col items-center gap-4 md:flex-row md:items-center">
                <div className="order-2 w-full md:order-1 md:flex-1">
                  <div className="flex items-center justify-center gap-8 sm:gap-12">
                    <div className="text-center">
                      <span className="block text-3xl sm:text-4xl font-bold text-foreground leading-none">548</span>
                      <span className="mt-1 block text-lg sm:text-xl text-muted-foreground">منشور</span>
                    </div>
                    <div className="text-center">
                      <span className="block text-3xl sm:text-4xl font-bold text-foreground leading-none">12.7K</span>
                      <span className="mt-1 block text-lg sm:text-xl text-muted-foreground">متابعين</span>
                    </div>
                    <div className="text-center">
                      <span className="block text-3xl sm:text-4xl font-bold text-foreground leading-none">221</span>
                      <span className="mt-1 block text-lg sm:text-xl text-muted-foreground">أتابع</span>
                    </div>
                  </div>
                </div>

                <div dir="ltr" className="order-1 flex flex-col items-center gap-2 text-center md:order-2 md:flex-row md:items-start md:gap-3 md:text-right">
                  <div className="order-2 min-w-0 md:order-1">
                    <div className="mb-1 flex items-center justify-end gap-2">
                      <h1 className="text-[28px] sm:text-[34px] font-bold leading-none text-foreground">{displayName}</h1>
                    </div>
                    <p className="text-center text-sm text-muted-foreground md:text-right">{handle}</p>
                    <div className="mt-1 flex justify-center md:justify-end">
                      <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${roleBadge.className}`}>
                        <Icon icon={roleBadge.icon} className="size-3.5" />
                        {roleBadge.label}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsPreviewOpen(true)}
                    className="order-1 relative shrink-0 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer md:order-2"
                    title="عرض الصورة"
                    aria-label="عرض الصورة"
                  >
                    <Image
                      src={avatarUrl}
                      alt={displayName}
                      width={132}
                      height={132}
                      className="size-24 sm:size-28 rounded-full object-cover ring-2 ring-primary/80"
                    />
                  </button>
                </div>
                </div>
              </div>
          </div>

          <div className="mt-5 border-t border-border pt-4 text-right">
            <h3 className="mb-2 text-lg font-bold text-foreground">نبذة</h3>
            <p className="text-base leading-8 text-muted-foreground">{about}</p>
          </div>
        </>
      ) : (
        <>
          <div className="space-y-5">
              <div className="flex items-center justify-between gap-3">
              <div className="flex flex-wrap items-center justify-start gap-2">
                <button className="hidden sm:inline-flex rounded-md border border-border bg-muted px-4 py-1.5 text-sm font-semibold text-foreground">
                  {t.report}
                </button>
                <button className="hidden sm:inline-flex rounded-md bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground">
                  {t.profileButton}
                </button>
                <button className="hidden sm:inline-flex items-center gap-1 rounded-md bg-warning px-4 py-1.5 text-sm font-semibold text-warning-foreground">
                  <Icon icon="solar:crown-bold" className="size-4" />
                  Upgrade to coach account
                </button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-border bg-background text-muted-foreground" type="button" title="Options" aria-label="Options">
                      <Icon icon="solar:menu-dots-linear" className="size-5" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="sm:hidden min-w-56 space-y-1 p-2">
                    <DropdownMenuItem className="justify-center rounded-md border border-border bg-muted px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted/80 focus:bg-muted/80 dark:hover:bg-muted/80 dark:focus:bg-muted/80 data-highlighted:bg-muted/80 dark:data-highlighted:bg-muted/80">
                      {t.report}
                    </DropdownMenuItem>
                    <DropdownMenuItem className="justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 focus:bg-primary/90 dark:hover:bg-primary/90 dark:focus:bg-primary/90 data-highlighted:bg-primary/90 dark:data-highlighted:bg-primary/90">
                      {t.profileButton}
                    </DropdownMenuItem>
                    <DropdownMenuItem className="justify-center rounded-md bg-warning px-4 py-2 text-sm font-semibold text-warning-foreground hover:bg-warning/90 focus:bg-warning/90 dark:hover:bg-warning/90 dark:focus:bg-warning/90 data-highlighted:bg-warning/90 dark:data-highlighted:bg-warning/90">
                      <Icon icon="solar:crown-bold" className="size-4" />
                      Upgrade to coach account
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <button
                type="button"
                title="Add"
                aria-label="Add"
                className="inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-border bg-background text-muted-foreground"
              >
                <Icon icon="solar:add-circle-linear" className="size-5" />
              </button>
              </div>

              <div className="relative overflow-hidden rounded-lg">
                <ProfilePatternOverlay />
                <div className="relative z-10 px-2 py-3 md:px-3 md:py-4 flex flex-col items-center gap-4 md:flex-row md:items-center">
                <div className="order-1 flex flex-col items-center gap-2 text-center md:flex-row md:items-start md:gap-3 md:text-left">
                  <button
                    type="button"
                    onClick={() => setIsPreviewOpen(true)}
                    className="relative shrink-0 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                    title="Preview image"
                    aria-label="Preview image"
                  >
                    <Image
                      src={avatarUrl}
                      alt={displayName}
                      width={132}
                      height={132}
                      className="size-24 sm:size-28 rounded-full object-cover ring-2 ring-primary/80"
                    />
                  </button>

                  <div className="min-w-0">
                    <div className="mb-1 flex items-center justify-start gap-2">
                      <h1 className="text-[28px] sm:text-[34px] font-bold leading-none text-foreground">{displayName}</h1>
                    </div>
                    <p className="text-sm text-muted-foreground text-center md:text-left">{handle}</p>
                    <div className="mt-1 flex justify-center md:justify-start">
                      <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${roleBadge.className}`}>
                        <Icon icon={roleBadge.icon} className="size-3.5" />
                        {roleBadge.label}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="order-2 w-full md:flex-1">
                  <div className="flex items-center justify-center gap-10 sm:gap-14">
                    <div className="text-center">
                      <span className="block text-3xl sm:text-4xl font-bold text-foreground leading-none">221</span>
                      <span className="mt-1 block text-lg sm:text-xl text-muted-foreground">{t.following}</span>
                    </div>
                    <div className="text-center">
                      <span className="block text-3xl sm:text-4xl font-bold text-foreground leading-none">12.7K</span>
                      <span className="mt-1 block text-lg sm:text-xl text-muted-foreground">{t.followers}</span>
                    </div>
                    <div className="text-center">
                      <span className="block text-3xl sm:text-4xl font-bold text-foreground leading-none">548</span>
                      <span className="mt-1 block text-lg sm:text-xl text-muted-foreground">{t.posts}</span>
                    </div>
                  </div>
                </div>
                </div>
              </div>
          </div>

          <div className="mt-5 border-t border-border pt-4 text-left">
            <h3 className="mb-2 text-lg font-bold text-foreground">Bio</h3>
            <p className="text-base leading-8 text-muted-foreground">{about}</p>
          </div>
        </>
      )}

      {isPreviewOpen && (
        <div
          className="fixed inset-0 z-70 bg-black/80 backdrop-blur-sm p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label={lang === "ar" ? "معاينة الصورة الشخصية" : "Profile image preview"}
          onClick={closePreview}
        >
          <div
            className="mx-auto flex h-full w-full max-w-5xl flex-col"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between rounded-xl border border-white/20 bg-black/40 px-3 py-2 text-white">
              <div className="text-sm font-medium">{displayName}</div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={zoomOut}
                  disabled={zoom <= 1}
                  className="inline-flex size-9 items-center justify-center rounded-md border border-white/25 bg-white/10 transition-colors hover:bg-white/20 disabled:opacity-50"
                  title={lang === "ar" ? "تصغير" : "Zoom out"}
                  aria-label={lang === "ar" ? "تصغير" : "Zoom out"}
                >
                  <Icon icon="solar:minus-circle-linear" className="size-5" />
                </button>
                <button
                  type="button"
                  onClick={zoomIn}
                  disabled={zoom >= 4}
                  className="inline-flex size-9 items-center justify-center rounded-md border border-white/25 bg-white/10 transition-colors hover:bg-white/20 disabled:opacity-50"
                  title={lang === "ar" ? "تكبير" : "Zoom in"}
                  aria-label={lang === "ar" ? "تكبير" : "Zoom in"}
                >
                  <Icon icon="solar:add-circle-linear" className="size-5" />
                </button>
                <button
                  type="button"
                  onClick={resetZoom}
                  className="inline-flex items-center rounded-md border border-white/25 bg-white/10 px-3 py-2 text-xs font-medium transition-colors hover:bg-white/20"
                >
                  {lang === "ar" ? "إعادة" : "Reset"}
                </button>
                <button
                  type="button"
                  onClick={closePreview}
                  className="inline-flex size-9 items-center justify-center rounded-md border border-white/25 bg-white/10 transition-colors hover:bg-white/20"
                  title={lang === "ar" ? "إغلاق" : "Close"}
                  aria-label={lang === "ar" ? "إغلاق" : "Close"}
                >
                  <Icon icon="solar:close-circle-linear" className="size-5" />
                </button>
              </div>
            </div>

            <div
              className="relative flex-1 overflow-hidden rounded-2xl border border-white/20 bg-black/30"
              onWheel={(event) => {
                event.preventDefault()
                if (event.deltaY < 0) {
                  zoomIn()
                } else {
                  zoomOut()
                }
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center p-4">
                <Image
                  src={avatarUrl}
                  alt={displayName}
                  width={1000}
                  height={1000}
                  className="max-h-full w-auto max-w-full object-contain transition-transform duration-200"
                  style={{ transform: `scale(${zoom})` }}
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function EmptyProfileTabs({ lang }: { lang: "ar" | "en" }) {
  const t = labels(lang)

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <Tabs defaultValue="posts" className="w-full">
        <TabsList variant="line" className="w-full justify-between border-b border-border pb-2">
          <TabsTrigger value="posts">
            <span className="inline-flex items-center gap-1.5">
              <Icon icon="solar:document-text-linear" className="size-4" />
              {t.tabPosts}
            </span>
          </TabsTrigger>
          <TabsTrigger value="images">
            <span className="inline-flex items-center gap-1.5">
              <Icon icon="solar:gallery-linear" className="size-4" />
              {t.tabImages}
            </span>
          </TabsTrigger>
          <TabsTrigger value="videos">
            <span className="inline-flex items-center gap-1.5">
              <Icon icon="solar:videocamera-record-linear" className="size-4" />
              {t.tabVideos}
            </span>
          </TabsTrigger>
          <TabsTrigger value="events">
            <span className="inline-flex items-center gap-1.5">
              <Icon icon="solar:calendar-linear" className="size-4" />
              {t.tabEvents}
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="posts">
          <EmptyState title={t.emptyTitle} description={t.emptyDesc} />
        </TabsContent>
        <TabsContent value="images">
          <EmptyState title={t.emptyTitle} description={t.emptyDesc} />
        </TabsContent>
        <TabsContent value="videos">
          <EmptyState title={t.emptyTitle} description={t.emptyDesc} />
        </TabsContent>
        <TabsContent value="events">
          <EmptyState title={t.emptyTitle} description={t.emptyDesc} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-lg border border-dashed border-border bg-muted/20 py-10 text-center mt-4">
      <div className="mx-auto mb-2 size-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
        <Icon icon="solar:document-linear" className="size-5" />
      </div>
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <p className="mt-1 text-xs text-muted-foreground">{description}</p>
    </div>
  )
}

function ChipsRow({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span key={item} className="rounded-full border border-border bg-background px-3 py-1 text-xs text-foreground">
          {item}
        </span>
      ))}
    </div>
  )
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <h3 className="mb-3 text-sm font-semibold text-foreground">{title}</h3>
      {children}
    </div>
  )
}

function UserProfileView({ lang, displayName, handle, avatarUrl, userRole }: Omit<ProfileViewsProps, "profileType">) {
  const t = labels(lang)

  return (
    <div className="space-y-4">
      <ProfileHeader
        lang={lang}
        profileType="user"
        displayName={displayName}
        handle={handle}
        avatarUrl={avatarUrl}
        userRole={userRole}
        about={t.aboutUser}
      />
      <EmptyProfileTabs lang={lang} />
    </div>
  )
}

function StoreProfileView({ lang, displayName, handle, avatarUrl, userRole }: Omit<ProfileViewsProps, "profileType">) {
  const t = labels(lang)

  return (
    <div className="space-y-4">
      <ProfileHeader
        lang={lang}
        profileType="store"
        displayName={displayName}
        handle={handle}
        avatarUrl={avatarUrl}
        userRole={userRole}
        about={t.aboutStore}
      />

      <SectionCard title={t.links}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="rounded-md border border-border bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
              https://example.com
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title={t.products}>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="rounded-lg border border-border bg-background p-2">
              <div className="aspect-square rounded-md bg-muted/50" />
              <p className="mt-2 text-xs font-medium text-foreground">{lang === "ar" ? "منتج" : "Product"} {index + 1}</p>
              <p className="text-[11px] text-muted-foreground">97.50 {lang === "ar" ? "درهم" : "MAD"}</p>
            </div>
          ))}
        </div>
      </SectionCard>

      <EmptyProfileTabs lang={lang} />
    </div>
  )
}

function CoachProfileView({ lang, displayName, handle, avatarUrl, userRole }: Omit<ProfileViewsProps, "profileType">) {
  const t = labels(lang)

  return (
    <div className="space-y-4">
      <ProfileHeader
        lang={lang}
        profileType="coach"
        displayName={displayName}
        handle={handle}
        avatarUrl={avatarUrl}
        userRole={userRole}
        about={t.aboutCoach}
      />

      <SectionCard title={t.certificates}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="rounded-lg border border-border bg-background p-3">
              <div className="h-16 rounded-md bg-muted/50" />
              <p className="mt-2 text-xs text-foreground">{lang === "ar" ? "شهادة تدريب" : "Training certificate"}</p>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title={t.sessions}>
        <ChipsRow items={lang === "ar" ? ["الأحد 6:30 ص", "الإثنين 6:30 ص", "الثلاثاء 6:30 ص", "الأربعاء 1:00 م"] : ["Sunday 6:30 AM", "Monday 6:30 AM", "Tuesday 6:30 AM", "Wednesday 1:00 PM"]} />
      </SectionCard>

      <SectionCard title={t.packages}>
        <ChipsRow items={lang === "ar" ? ["دورة اللياقة", "الجري مع الأصدقاء", "كرة القدم"] : ["Fitness cycle", "Run with friends", "Football"]} />
      </SectionCard>

      <SectionCard title={t.prices}>
        <ChipsRow items={lang === "ar" ? ["الجلسة 40 درهم", "الأسبوع 400 درهم", "الشهر 4000 درهم"] : ["Session 40 MAD", "Week 400 MAD", "Month 4000 MAD"]} />
      </SectionCard>

      <SectionCard title={t.links}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="rounded-md border border-border bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
              https://example.com
            </div>
          ))}
        </div>
      </SectionCard>

      <EmptyProfileTabs lang={lang} />
    </div>
  )
}

export function ProfileViews({ lang, profileType, displayName, handle, avatarUrl, userRole }: ProfileViewsProps) {
  if (profileType === "store") {
    return <StoreProfileView lang={lang} displayName={displayName} handle={handle} avatarUrl={avatarUrl} userRole={userRole} />
  }

  if (profileType === "coach") {
    return <CoachProfileView lang={lang} displayName={displayName} handle={handle} avatarUrl={avatarUrl} userRole={userRole} />
  }

  return <UserProfileView lang={lang} displayName={displayName} handle={handle} avatarUrl={avatarUrl} userRole={userRole} />
}
