"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Icon } from "@iconify/react"
import { useState, useCallback, type WheelEvent } from "react"
import { usePathname } from "next/navigation"
import { useDictionary } from "@/providers/dictionary-provider"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { NavLink } from "@/components/ui/nav-link"
import { UserProfileCard } from "@/components/features/profile"
import { CurrentEvents } from "@/components/features/events"
import { EventInvitations } from "@/components/features/events"
import { EventCalendar } from "@/components/features/events"
import { EventSchedule } from "@/components/features/events"
import { EventLegend } from "@/components/features/events"
import type { ActivityPanelDesktopProps, ActivityPanelMobileProps } from "./ActivityPanel.types"

/* ------------------------------------------------------------------ */
/*  Shared scrollable content used by both desktop and mobile panels   */
/* ------------------------------------------------------------------ */
function PanelContent({ onLogout }: { onLogout: () => void }) {
  const pathname = usePathname()
  const { dictionary, lang, isRTL } = useDictionary()

  const bare = pathname.replace(/^\/[a-z]{2}(?=\/|$)/, "") || "/"
  const profileSlugs = [
    "/settings",
  ]
  const isProfileRoute = profileSlugs.some((slug) => bare === slug || bare.startsWith(`${slug}/`))
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)

  const handoffWheelToMainContent = useCallback((event: WheelEvent<HTMLDivElement>) => {
    const deltaY = event.deltaY
    if (deltaY === 0) {
      return
    }

    const current = event.currentTarget
    const canScrollLocally = current.scrollHeight > current.clientHeight
    const isScrollingDown = deltaY > 0
    const isAtTop = current.scrollTop <= 0
    const isAtBottom = current.scrollTop + current.clientHeight >= current.scrollHeight - 1

    if (canScrollLocally && ((isScrollingDown && !isAtBottom) || (!isScrollingDown && !isAtTop))) {
      return
    }

    const mainContent = document.getElementById("main-content")
    if (!mainContent) {
      return
    }

    event.preventDefault()
    mainContent.scrollBy({ top: deltaY, behavior: "auto" })
  }, [])

  const generalSettingsItems = [
    { href: `/${lang}/settings/profile`, label: dictionary.profile.menu.personalInfo, icon: "solar:user-linear" },
    { href: `/${lang}/settings/myorders`, label: dictionary.profile.menu.orders, icon: "solar:box-linear" },
    { href: `/${lang}/settings/offers`, label: dictionary.profile.menu.offers, icon: "solar:ticket-linear" },
    { href: `/${lang}/settings/addresses`, label: dictionary.profile.menu.addresses, icon: "solar:buildings-2-linear" },
  ]

  const securityItems = [
    { href: `/${lang}/settings/password-security`, label: dictionary.profile.menu.passwordSecurity, icon: "solar:key-linear" },
    { href: `/${lang}/settings/privacy-policy`, label: dictionary.profile.menu.privacyPolicy, icon: "solar:shield-user-linear" },
    { href: `/${lang}/settings/delete-account`, label: dictionary.profile.menu.deleteAccount, icon: "solar:user-cross-linear", danger: true },
  ]

  const toBarePath = (href: string) => href.replace(new RegExp(`^/${lang}(?=/|$)`), "") || "/"
  const isItemActive = (href: string) => {
    const hrefBare = toBarePath(href)
    return bare === hrefBare || bare.startsWith(`${hrefBare}/`)
  }

  const renderLinkItem = (
    item: { href: string; label: string; icon: string; danger?: boolean },
  ) => {
    const active = isItemActive(item.href)

    const itemClassName = cn(
      "flex min-h-11 items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-colors",
      isRTL ? "flex-row text-right" : "flex-row text-left",
      active
        ? "bg-primary text-primary-foreground shadow-sm"
        : item.danger
          ? "text-destructive hover:bg-destructive/10 dark:hover:bg-destructive/25"
          : "text-foreground hover:bg-muted/80 dark:hover:bg-foreground/10",
    )

    return (
      <NavLink key={item.href} href={item.href} className={itemClassName}>
        <Icon
          icon={item.icon}
          className={cn(
            "size-5 shrink-0",
            active
              ? "text-primary-foreground"
              : item.danger
                ? "text-destructive"
                : "text-muted-foreground",
          )}
        />
        <span className="flex-1">{item.label}</span>
      </NavLink>
    )
  }

  const renderNotificationsToggleItem = () => {
    const switchTrackClassName = notificationsEnabled
      ? "border-success/40 bg-success"
      : "border-border bg-muted-foreground/25 dark:bg-muted-foreground/35"

    const switchThumbPositionClassName = cn(
      "absolute top-1/2 size-5 -translate-y-1/2 rounded-full border border-border/80 bg-white shadow-sm transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
      notificationsEnabled
        ? isRTL
          ? "left-0.5"
          : "right-0.5"
        : isRTL
          ? "right-0.5"
          : "left-0.5",
    )

    return (
      <button
        type="button"
        onClick={() => setNotificationsEnabled((prev) => !prev)}
        className={cn(
          "flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-colors text-foreground hover:bg-muted/80 dark:hover:bg-foreground/10",
          isRTL ? "flex-row text-right" : "flex-row text-left",
        )}
      >
        <Icon icon="solar:bell-linear" className="size-5 shrink-0 text-muted-foreground" />
        <span className="flex-1">{dictionary.profile.menu.notifications}</span>
        <span className={cn("relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-colors duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]", switchTrackClassName)}>
          <span className={switchThumbPositionClassName} />
        </span>
      </button>
    )
  }

  if (isProfileRoute) {
    return (
      <div className="flex-1 overflow-y-auto" onWheel={handoffWheelToMainContent}>
        <UserProfileCard />

        <div className="px-4 py-5">
          <div className="space-y-4">
            <div className="space-y-1 border-b border-border/70 pb-4">
              <div className={cn("px-3 pb-1 text-xs font-semibold text-muted-foreground/80", isRTL ? "text-right" : "text-left")}>
                {dictionary.profile.menu.generalSettings}
              </div>
              {generalSettingsItems.map(renderLinkItem)}
            </div>

            <div className="space-y-1 border-b border-border/70 pb-4">
              <div className={cn("px-3 pb-1 text-xs font-semibold text-muted-foreground/80", isRTL ? "text-right" : "text-left")}>
                {dictionary.profile.menu.notificationsSection}
              </div>
              {renderNotificationsToggleItem()}
            </div>

            <div className="space-y-1 border-b border-border/70 pb-4">
              <div className={cn("px-3 pb-1 text-xs font-semibold text-muted-foreground/80", isRTL ? "text-right" : "text-left")}>
                {dictionary.profile.menu.privacySection}
              </div>
              {securityItems.map(renderLinkItem)}
            </div>

            <div className="space-y-1">
              <div className={cn("px-3 pb-1 text-xs font-semibold text-muted-foreground/80", isRTL ? "text-right" : "text-left")}>
                {dictionary.profile.menu.accountSection}
              </div>
              <button
                type="button"
                onClick={onLogout}
                className={cn(
                  "flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-colors text-destructive hover:bg-destructive/10 dark:hover:bg-destructive/25",
                  isRTL ? "flex-row text-right" : "flex-row text-left",
                )}
              >
                <Icon icon="solar:logout-2-linear" className="size-5 shrink-0 text-destructive" />
                <span className="flex-1">{dictionary.profile.menu.logout}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto" onWheel={handoffWheelToMainContent}>
      <UserProfileCard />
      <CurrentEvents />
      <EventInvitations />
      <EventCalendar />
      <EventSchedule />
      <EventLegend />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Desktop expanded panel — full viewport height, next to navbar      */
/* ------------------------------------------------------------------ */
export function ActivityPanelDesktop({
  isOpen,
  onLogout,
}: ActivityPanelDesktopProps) {
  const { isRTL } = useDictionary()

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 256, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className={cn(
            "shrink-0 flex flex-col bg-card overflow-hidden",
            isRTL ? "border-r border-border" : "border-l border-border"
          )}
        >
          <div className="flex-1 flex flex-col min-w-56 overflow-hidden">
            <PanelContent onLogout={onLogout} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* ------------------------------------------------------------------ */
/*  Mobile overlay panel                                               */
/* ------------------------------------------------------------------ */
export default function ActivityPanelMobile({
  isOpen,
  onClose,
  onToggle,
  onLogout,
}: ActivityPanelMobileProps) {
  const pathname = usePathname()
  const { dictionary, isRTL } = useDictionary()
  const bare = pathname.replace(/^\/[a-z]{2}(?=\/|$)/, "") || "/"
  const profileSlugs = [
    "/settings",
  ]
  const isProfileRoute = profileSlugs.some((slug) => bare === slug || bare.startsWith(`${slug}/`))

  return (
    <>
      {/* Floating trigger pill */}
      {!isOpen && (
        <div
          className={cn(
            "fixed top-1/2 -translate-y-1/2 z-30 flex items-center justify-center cursor-pointer",
            isRTL ? "left-2" : "right-2"
          )}
          onClick={onToggle}
        >
          <div
            className={cn(
              "h-20 w-6 bg-card flex items-center justify-center border border-border shadow-md",
              isRTL
                ? "rounded-r-lg border-r"
                : "rounded-l-lg border-l"
            )}
          >
            {isRTL ? (
              <Icon
                icon="solar:alt-arrow-right-linear"
                className="size-4 text-primary"
              />
            ) : (
              <Icon
                icon="solar:alt-arrow-left-linear"
                className="size-4 text-primary"
              />
            )}
          </div>
        </div>
      )}

      {/* Overlay drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-60"
              onClick={onClose}
            />

            <motion.aside
              initial={{ x: isRTL ? "-100%" : "100%" }}
              animate={{ x: 0 }}
              exit={{ x: isRTL ? "-100%" : "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className={cn(
                "fixed top-0 h-full w-80 bg-card border-border z-70 flex flex-col",
                isRTL ? "left-0 border-r" : "right-0 border-l"
              )}
            >
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h2 className="font-bold text-lg">
                  {isProfileRoute ? dictionary.profile.title : dictionary.activity.title}
                </h2>
                <Button variant="ghost" size="icon" onClick={onClose} className="border border-border">
                  <Icon
                    icon="material-symbols:close-rounded"
                    className="size-5"
                  />
                </Button>
              </div>
              <PanelContent onLogout={onLogout} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
