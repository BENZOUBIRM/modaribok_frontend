"use client"

import { useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Icon } from "@iconify/react"

import { useDictionary } from "@/providers/dictionary-provider"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

/** Navigation links shown in the top section of the guest sidebar. */
const guestNavItems = [
  { path: "/", icon: "solar:home-smile-bold", translationKey: "home" },
  { path: "/services", icon: "solar:layers-bold", translationKey: "services" },
  { path: "/about", icon: "solar:info-circle-bold", translationKey: "aboutUs" },
  { path: "/contact", icon: "solar:phone-calling-bold", translationKey: "contactUs" },
] as const

interface GuestSidebarProps {
  isOpen: boolean
  onClose: () => void
  theme?: string
  onThemeToggle?: () => void
}

/**
 * Mobile-only sidebar for unauthenticated users.
 *
 * Mirrors the AppSidebar mobile layout:
 *  - Backdrop overlay + slide-in panel
 *  - Header with logo + close button
 *  - Top: page navigation links (Home, Services, About Us, Contact Us)
 *  - Bottom: Login/Signup links + theme toggle
 */
export default function GuestSidebar({
  isOpen,
  onClose,
  theme = "light",
  onThemeToggle,
}: GuestSidebarProps) {
  const { dictionary, lang, isRTL } = useDictionary()
  const pathname = usePathname()
  const t = dictionary.navbar

  // Lock body scroll while sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  const getHref = (path: string) =>
    path === "/" ? `/${lang}` : `/${lang}${path}`

  const bare = pathname.replace(/^\/[a-z]{2}(?=\/|$)/, "") || "/"
  const isActive = (path: string) => {
    if (path === "/") return bare === "/"
    return bare === path || bare.startsWith(`${path}/`)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60]"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.aside
            initial={{ x: isRTL ? "100%" : "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: isRTL ? "100%" : "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={cn(
              "fixed top-0 h-full w-60 bg-card border-border z-[70] flex flex-col",
              isRTL ? "right-0 border-l" : "left-0 border-r"
            )}
          >
            {/* ── Header ── */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <Link
                href={`/${lang}`}
                className="flex items-center gap-2 shrink-0"
                onClick={onClose}
              >
                <Image
                  src="/images/logo.png"
                  alt="Modaribok"
                  width={120}
                  height={40}
                  className="h-8 w-auto"
                  priority
                />
              </Link>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <Icon
                  icon="material-symbols:close-rounded"
                  className="size-5"
                />
              </Button>
            </div>

            {/* ── Page Navigation ── */}
            <nav className="flex-1 overflow-y-auto p-4">
              <div className="space-y-1">
                {guestNavItems.map((item) => {
                  const active = isActive(item.path)
                  return (
                    <Link
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
                          layoutId="guest-mobile-active"
                          className={cn(
                            "absolute top-1/2 -translate-y-1/2 w-1.5 h-10 bg-primary",
                            isRTL
                              ? "rounded-l-full -right-4"
                              : "rounded-r-full -left-4"
                          )}
                          transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 30,
                          }}
                        />
                      )}
                      <Icon icon={item.icon} className="size-4 shrink-0" />
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        {t[item.translationKey as keyof typeof t]}
                      </motion.span>
                    </Link>
                  )
                })}
              </div>
            </nav>

            {/* ── Bottom: Auth Links + Theme ── */}
            <div className="p-4 border-t border-border space-y-2">
              {/* Login */}
              <Link
                href={`/${lang}/login`}
                onClick={onClose}
                className={cn(
                  "flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  pathname === `/${lang}/login`
                    ? "bg-primary text-primary-foreground"
                    : "border border-border text-foreground hover:bg-muted/50"
                )}
              >
                <Icon icon="solar:login-3-bold" className="size-4" />
                {t.login}
              </Link>

              {/* Signup */}
              <Link
                href={`/${lang}/signup`}
                onClick={onClose}
                className={cn(
                  "flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg text-sm font-medium border transition-colors",
                  pathname === `/${lang}/signup`
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border text-foreground hover:bg-muted/50"
                )}
              >
                <Icon icon="solar:user-plus-bold" className="size-4" />
                {t.signup}
              </Link>

              {/* Theme toggle */}
              <div className="flex justify-center pt-1">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={onThemeToggle}
                  title={
                    theme === "dark" ? t.lightMode : t.darkMode
                  }
                >
                  {theme === "dark" ? (
                    <Icon
                      icon="solar:sun-bold-duotone"
                      className="size-5 text-accent"
                    />
                  ) : (
                    <Icon
                      icon="solar:moon-bold-duotone"
                      className="size-5"
                    />
                  )}
                </Button>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
