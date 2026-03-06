"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { Icon } from "@iconify/react"

import { cn } from "@/lib/utils"
import { useDictionary } from "@/providers/dictionary-provider"
import { useAuth } from "@/providers/auth-provider"
import { localeNames, type Locale } from "@/i18n/settings"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function Navbar({
  fixed = true,
  onSidebarToggle,
  onGuestSidebarToggle,
  sidebarExpanded = false,
  onLogout,
}: {
  fixed?: boolean
  onSidebarToggle?: () => void
  onGuestSidebarToggle?: () => void
  sidebarExpanded?: boolean
  onLogout?: () => void
}) {
  const { dictionary, lang, isRTL } = useDictionary()
  const { isAuthenticated } = useAuth()
  const { theme, setTheme } = useTheme()
  const pathname = usePathname()
  const router = useRouter()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Switch language by replacing the locale segment in the URL
  const switchLocale = (newLocale: Locale) => {
    const segments = pathname.split("/")
    segments[1] = newLocale
    const newPath = segments.join("/") || `/${newLocale}`
    document.cookie = `NEXT_LOCALE=${newLocale};path=/;max-age=31536000`
    router.push(newPath)
  }

  // Guest-only nav links — split into page links and auth links with a divider
  const pageLinks = [
    { href: `/${lang}`, label: dictionary.navbar.home },
    { href: `/${lang}/about`, label: dictionary.navbar.aboutUs },
    { href: `/${lang}/contact`, label: dictionary.navbar.contactUs },
  ]
  const authLinks = [
    { href: `/${lang}/login`, label: dictionary.navbar.login },
    { href: `/${lang}/signup`, label: dictionary.navbar.signup },
  ]

  return (
    <nav className={cn(
      "z-50 h-16 border-b border-border bg-navbar/80 backdrop-blur-md",
      fixed ? "fixed top-0 left-0 right-0" : "shrink-0 w-full"
    )}>
      <div className="flex h-full items-center justify-between px-4 sm:px-6">
        {/* Logo / Mobile burger */}
        {onSidebarToggle ? (
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={onSidebarToggle}
              aria-label="Toggle sidebar"
              className="lg:hidden"
            >
              <Icon icon="solar:hamburger-menu-linear" className="size-5" />
            </Button>
            {/* Show logo only when sidebar is collapsed (no logo showing there) */}
            {!sidebarExpanded && (
              <Link href={`/${lang}`} className="hidden lg:flex items-center gap-2 shrink-0">
                <Image
                  src="/images/logo.png"
                  alt="Modaribok"
                  width={120}
                  height={40}
                  className="h-8 w-auto"
                  priority
                />
              </Link>
            )}
          </>
        ) : (
          <div className="flex items-center gap-2">
            {/* Guest mobile hamburger */}
            {onGuestSidebarToggle && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onGuestSidebarToggle}
                aria-label="Toggle menu"
                className="sm:hidden"
              >
                <Icon icon="solar:hamburger-menu-linear" className="size-5" />
              </Button>
            )}
            <Link href={`/${lang}`} className="flex items-center gap-2 shrink-0">
              <Image
                src="/images/logo.png"
                alt="Modaribok"
                width={120}
                height={40}
                className="h-8 w-auto"
                priority
              />
            </Link>
          </div>
        )}

        {/* Authenticated: Search bar (center) */}
        {isAuthenticated && (
          <div className="hidden sm:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Icon
                icon="solar:magnifer-linear"
                className={cn(
                  "absolute top-1/2 -translate-y-1/2 size-4 text-muted-foreground",
                  isRTL ? "right-3" : "left-3"
                )}
              />
              <input
                type="text"
                placeholder={dictionary.navbar.searchPlaceholder}
                className={cn(
                  "w-full h-10 rounded-full bg-surface border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors",
                  isRTL ? "pr-10 pl-4" : "pl-10 pr-4"
                )}
              />
            </div>
          </div>
        )}

        {/* Guest: Navigation Links */}
        {!isAuthenticated && (
          <div className="hidden sm:flex items-center gap-1">
            {pageLinks.map((link) => {
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  {link.label}
                </Link>
              )
            })}
            {/* Divider between page links and auth links */}
            <div className="w-px h-6 bg-border mx-1" />
            {authLinks.map((link) => {
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  {link.label}
                </Link>
              )
            })}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-1">
          {/* Authenticated: Notifications + Messages */}
          {mounted && isAuthenticated && (
            <>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={dictionary.navbar.notifications}
              >
                <Icon icon="solar:bell-bold" className="size-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={dictionary.navbar.messages}
              >
                <Icon icon="solar:chat-round-dots-bold" className="size-5" />
              </Button>
            </>
          )}

          {/* Language Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1.5">
                <Icon
                  icon={lang === "ar" ? "circle-flags:ma" : "circle-flags:us"}
                  className="size-5"
                />
                <span className="hidden sm:inline text-sm">
                  {localeNames[lang]}
                </span>
                <Icon icon="solar:alt-arrow-down-linear" className="size-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={isRTL ? "start" : "end"}>
              <DropdownMenuItem
                onClick={() => switchLocale("en")}
                className={cn("justify-between", lang === "en" && "bg-muted")}
              >
                <span className="flex items-center gap-2">
                  <Icon icon="circle-flags:us" className="size-5" />
                  <span>English</span>
                </span>
                {lang === "en" && (
                  <Icon icon="material-symbols:check" className="size-4 text-primary" />
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => switchLocale("ar")}
                className={cn("justify-between", lang === "ar" && "bg-muted")}
              >
                <span className="flex items-center gap-2">
                  <Icon icon="circle-flags:ma" className="size-5" />
                  <span>العربية</span>
                </span>
                {lang === "ar" && (
                  <Icon icon="material-symbols:check" className="size-4 text-primary" />
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label={
              mounted
                ? theme === "dark"
                  ? dictionary.navbar.lightMode
                  : dictionary.navbar.darkMode
                : dictionary.navbar.darkMode
            }
          >
            {mounted ? (
              theme === "dark" ? (
                <Icon icon="solar:sun-bold-duotone" className="size-5 text-accent" />
              ) : (
                <Icon icon="solar:moon-bold-duotone" className="size-5" />
              )
            ) : (
              <div className="size-5" />
            )}
          </Button>

          {/* Logout icon (authenticated only, far end) */}
          {mounted && isAuthenticated && onLogout && (
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={onLogout}
              aria-label={dictionary.navbar.logout}
            >
              <Icon icon="solar:logout-3-line-duotone" className="size-5" />
            </Button>
          )}
        </div>
      </div>
    </nav>
  )
}
