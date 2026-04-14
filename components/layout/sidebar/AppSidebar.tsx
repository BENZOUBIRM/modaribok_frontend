"use client"

import { NavLink } from "@/components/ui/nav-link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Icon } from "@iconify/react"
import { useDictionary } from "@/providers/dictionary-provider"
import { useAuth } from "@/providers/auth-provider"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useEffect, useState, useCallback, type WheelEvent } from "react"
import Image from "next/image"

const navItems = [
  { path: "/", icon: "solar:widget-4-bold", translationKey: "home" },
  { path: "/search", icon: "solar:magnifer-linear", translationKey: "search", mobileOnly: true },
  { path: "/dashboard", icon: "solar:chart-square-bold", translationKey: "dashboard", adminOnly: true },
  { path: "/products", icon: "solar:cart-3-bold", translationKey: "products" },
  { path: "/trainers", icon: "solar:users-group-rounded-bold", translationKey: "trainers" },
  { path: "/gyms", icon: "solar:dumbbells-bold", translationKey: "gyms" },
  { path: "/events", icon: "solar:calendar-mark-bold", translationKey: "events" },
  { path: "/stores", icon: "solar:shop-bold", translationKey: "stores" },
]

interface SidebarProps {
  isOpen: boolean
  isCollapsed: boolean
  isMobile: boolean
  onClose: () => void
  onToggle: () => void
  theme?: string
  onThemeToggle?: () => void
  onLogout?: () => void
}

export default function AppSidebar({
  isOpen,
  isCollapsed,
  isMobile,
  onClose,
  onToggle,
  theme = "light",
  onThemeToggle,
  onLogout,
}: SidebarProps) {
  const { dictionary, lang, isRTL } = useDictionary()
  const { user } = useAuth()
  const pathname = usePathname()
  const [showScrollTop, setShowScrollTop] = useState(false)

  const visibleItems = navItems.filter(
    (item) => !('adminOnly' in item && item.adminOnly) || user?.role === "ADMIN"
  )

  useEffect(() => {
    const mainContent = document.getElementById("main-content")
    if (!mainContent) return

    const handleScroll = () => {
      setShowScrollTop(mainContent.scrollTop > 200)
    }

    mainContent.addEventListener("scroll", handleScroll)
    return () => mainContent.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToTop = () => {
    const mainContent = document.getElementById("main-content")
    if (mainContent) {
      mainContent.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const handoffWheelToMainContent = useCallback((event: WheelEvent<HTMLElement>) => {
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

  useEffect(() => {
    if (isMobile && isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isMobile, isOpen])

  const getHref = (path: string) => path === "/" ? `/${lang}` : `/${lang}${path}`
  const bare = pathname.replace(/^\/[a-z]{2}(?=\/|$)/, "") || "/"
  const isActive = (path: string) => {
    if (path === "/") return bare === "/"
    return bare === path || bare.startsWith(`${path}/`)
  }

  // Mobile sidebar
  if (isMobile) {
    return (
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
              initial={{ x: isRTL ? "100%" : "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: isRTL ? "100%" : "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className={cn(
                "fixed top-0 h-full w-60 bg-card border-border z-70 flex flex-col",
                isRTL ? "right-0 border-l" : "left-0 border-r"
              )}
            >
              <div className="flex items-center justify-between p-4 border-b border-border">
                {/* <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                    <span className="text-primary-foreground font-bold text-lg">M</span>
                  </div>
                  <span className="font-bold text-lg">
                    {dictionary.common.appName}
                  </span>
                </div> */}
                <NavLink href={`/${lang}`} className="flex items-center gap-2 shrink-0">
                          <Image
                            src="/images/logo.png"
                            alt="Modaribok"
                            width={120}
                            height={40}
                            className="h-8 w-auto"
                            priority
                          />
                        </NavLink>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <Icon icon="material-symbols:close-rounded" className="size-5" />
                </Button>
              </div>

              <nav onWheel={handoffWheelToMainContent} className="flex-1 overflow-y-auto p-4">
                <div className="space-y-1">
                  {visibleItems.map((item) => {
                    const active = isActive(item.path)
                    return (
                      <NavLink
                        key={item.path}
                        href={getHref(item.path)}
                        onClick={onClose}
                        className={cn(
                          "relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                          active
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                        )}
                      >
                        {active && (
                          <motion.span
                            layoutId="mobile-active-indicator"
                            className={cn(
                              "absolute top-1/2 -translate-y-1/2 w-1.5 h-10 bg-primary",
                              isRTL ? "rounded-l-full -right-4" : "rounded-r-full -left-4"
                            )}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                          />
                        )}
                        <Icon icon={item.icon} className="size-4 shrink-0" />
                        <motion.span
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          {dictionary.sidebar[item.translationKey as keyof typeof dictionary.sidebar]}
                        </motion.span>
                      </NavLink>
                    )
                  })}
                </div>
              </nav>

              <div className="p-4 border-t border-border">
                <div className="mb-3">
                  <NavLink
                      href={getHref("/settings")}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all border",
                        isActive("/settings")
                        ? "bg-primary/15 text-primary border-primary/40"
                        : "bg-primary/5 text-primary border-primary/20 hover:bg-primary/10",
                    )}
                  >
                      <Icon icon="solar:settings-bold" className="size-4 shrink-0" />
                      <span>{dictionary.sidebar.settings}</span>
                  </NavLink>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={onThemeToggle}
                    title={theme === "dark" ? "Light Mode" : "Dark Mode"}
                  >
                    {theme === "dark" ? <Icon icon="solar:sun-bold-duotone" className="size-5 text-accent" /> : <Icon icon="solar:moon-bold-duotone" className="size-5" />}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={onLogout}
                    title="Logout"
                  >
                    <Icon icon="solar:logout-3-line-duotone" className="size-5 text-destructive" />
                  </Button>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    )
  }

  // Desktop sidebar
  return (
    <aside
      className={cn(
        "bg-card shrink-0 transition-[width] duration-300 overflow-hidden",
        isRTL ? "border-l border-border" : "border-r border-border",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      <div className="h-full flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-4 h-16 border-b border-border min-w-0 shrink-0">
          {!isCollapsed && (
            <div className="flex items-center gap-2 min-w-0 flex-1">
              {/* <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
                <span className="text-primary-foreground font-bold text-lg">M</span>
              </div>
              <span className="font-bold text-lg truncate">{dictionary.common.appName}</span> */}
              
                <NavLink href={`/${lang}`} className="flex items-center gap-2 shrink-0">
                    <Image
                        src="/images/logo.png"
                        alt="Modaribok"
                        width={120}
                        height={40}
                        className="h-8 w-auto"
                        priority
                    />
                </NavLink>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className={cn(isCollapsed && "mx-auto")}
          >
            {isRTL ? (
              isCollapsed ? <Icon icon="solar:alt-arrow-left-linear" className="size-4" /> : <Icon icon="solar:alt-arrow-right-linear" className="size-4" />
            ) : (
              isCollapsed ? <Icon icon="solar:alt-arrow-right-linear" className="size-4" /> : <Icon icon="solar:alt-arrow-left-linear" className="size-4" />
            )}
          </Button>
        </div>

        <nav className={cn(
          "flex-1 overflow-y-auto overflow-x-hidden p-4 min-w-0",
          isCollapsed && "scrollbar-hidden"
        )} onWheel={handoffWheelToMainContent}>
          <div className="space-y-1">
            {visibleItems.filter(item => !item.mobileOnly).map((item) => {
              const active = isActive(item.path)
              return (
                <NavLink
                  key={item.path}
                  href={getHref(item.path)}
                  className={cn(
                    "relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all min-w-0",
                    isCollapsed && "justify-center size-10 p-0",
                    active
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  )}
                  title={isCollapsed ? dictionary.sidebar[item.translationKey as keyof typeof dictionary.sidebar] : undefined}
                >
                  {active && (
                    <motion.span
                      layoutId="desktop-active-indicator"
                      className={cn(
                        "absolute top-1/2 -translate-y-1/2 w-1 h-10 bg-primary",
                        isRTL ? "rounded-l-full -right-4" : "rounded-r-full -left-4"
                      )}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <Icon icon={item.icon} className="size-4 shrink-0" />
                  {!isCollapsed && (
                    <motion.span
                      className="truncate"
                      initial={{ opacity: 0, x: isRTL ? 10 : -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: isRTL ? 10 : -10 }}
                      transition={{ duration: 0.2, delay: 0.05 }}
                    >
                      {dictionary.sidebar[item.translationKey as keyof typeof dictionary.sidebar]}
                    </motion.span>
                  )}
                </NavLink>
              )
            })}
          </div>
        </nav>

        <div className="p-4 border-t border-border shrink-0 overflow-hidden">
          {isCollapsed ? (
            <div className="mb-3 flex justify-center">
              <NavLink
                href={getHref("/settings")}
                className={cn(
                  "flex items-center justify-center size-9 rounded-md border transition-colors",
                  isActive("/settings")
                    ? "text-primary bg-primary/15 border-primary/40"
                    : "text-primary bg-primary/5 border-primary/20 hover:bg-primary/10",
                )}
                title={dictionary.sidebar.settings}
              >
                <Icon icon="solar:settings-bold" className="size-4" />
              </NavLink>
            </div>
          ) : (
            <div className="mb-3">
              <NavLink
                href={getHref("/settings")}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all border",
                  isActive("/settings")
                    ? "bg-primary/15 text-primary border-primary/40"
                    : "bg-primary/5 text-primary border-primary/20 hover:bg-primary/10",
                )}
              >
                <Icon icon="solar:settings-bold" className="size-4 shrink-0" />
                <span>{dictionary.sidebar.settings}</span>
              </NavLink>
            </div>
          )}

          {isCollapsed ? (
            <div className="flex justify-center">
              {showScrollTop ? (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={scrollToTop}
                  title="Scroll to Top"
                >
                  <Icon icon="solar:arrow-up-linear" className="size-4 text-primary" />
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={onThemeToggle}
                  title={theme === "dark" ? "Light Mode" : "Dark Mode"}
                >
                  {theme === "dark" ? <Icon icon="solar:sun-bold-duotone" className="size-5 text-accent" /> : <Icon icon="solar:moon-bold-duotone" className="size-5" />}
                </Button>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={onThemeToggle}
                title={theme === "dark" ? "Light Mode" : "Dark Mode"}
              >
                {theme === "dark" ? <Icon icon="solar:sun-bold-duotone" className="size-5 text-accent" /> : <Icon icon="solar:moon-bold-duotone" className="size-5" />}
              </Button>

              {showScrollTop && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={scrollToTop}
                  title="Scroll to Top"
                >
                  <Icon icon="solar:arrow-up-linear" className="size-4 text-primary" />
                </Button>
              )}
              
              <Button
                variant="outline"
                size="icon"
                onClick={onLogout}
                title="Logout"
              >
                <Icon icon="solar:logout-3-line-duotone" className="size-5 text-destructive" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}
