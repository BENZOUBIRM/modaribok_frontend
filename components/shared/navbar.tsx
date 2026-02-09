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

export function Navbar() {
  const { dictionary, lang, isRTL } = useDictionary()
  const { user, isAuthenticated, isLoading, logout } = useAuth()
  const { theme, setTheme } = useTheme()
  const pathname = usePathname()
  const router = useRouter()
  const [mounted, setMounted] = React.useState(false)
  const [loggingOut, setLoggingOut] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Switch language by replacing the locale segment in the URL
  const switchLocale = (newLocale: Locale) => {
    // pathname is like /en/login or /ar
    const segments = pathname.split("/")
    segments[1] = newLocale
    const newPath = segments.join("/") || `/${newLocale}`
    // Set cookie for middleware to remember preference
    document.cookie = `NEXT_LOCALE=${newLocale};path=/;max-age=31536000`
    router.push(newPath)
  }

  // Handle logout
  const handleLogout = async () => {
    setLoggingOut(true)
    await logout()
    setLoggingOut(false)
    router.push(`/${lang}/login`)
  }

  // Build nav links based on auth state
  const navLinks = isAuthenticated
    ? [
        { href: `/${lang}`, label: dictionary.navbar.home },
      ]
    : [
        { href: `/${lang}`, label: dictionary.navbar.home },
        { href: `/${lang}/login`, label: dictionary.navbar.login },
        { href: `/${lang}/signup`, label: dictionary.navbar.signup },
      ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-border bg-navbar/80 backdrop-blur-md">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
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

        {/* Navigation Links */}
        <div className="hidden sm:flex items-center gap-1">
          {navLinks.map((link) => {
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

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* User greeting & Logout (authenticated) */}
          {mounted && isAuthenticated && user && (
            <>
              <span className="hidden sm:inline text-sm text-muted-foreground">
                {dictionary.navbar.welcome}, <span className="font-medium text-foreground">{user.firstName}</span>
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={handleLogout}
                disabled={loggingOut}
              >
                <Icon icon="solar:logout-2-bold-duotone" className="size-5" />
                <span className="hidden sm:inline text-sm">
                  {dictionary.navbar.logout}
                </span>
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
        </div>
      </div>
    </nav>
  )
}
