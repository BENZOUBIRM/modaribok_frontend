"use client"

/**
 * AppNavbar — Dormant component.
 * Migrated from the React admin app for future use.
 * Currently the global Navbar from components/shared/navbar.tsx is used instead.
 * This component can replace it in the authenticated layout when ready.
 */

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { Icon } from "@iconify/react"
import { toast } from "sonner"

import { useDictionary } from "@/providers/dictionary-provider"
import { useAuth } from "@/providers/auth-provider"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import type { Locale } from "@/i18n/settings"

const PageLoader = () => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
)

interface AppNavbarProps {
  onMenuClick?: () => void
  isOpen?: boolean
  isMobile?: boolean
}

export default function AppNavbar({ onMenuClick }: AppNavbarProps) {
  const { dictionary, lang, isRTL } = useDictionary()
  const { logout } = useAuth()
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  const switchLocale = (newLocale: string) => {
    document.cookie = `NEXT_LOCALE=${newLocale};path=/;max-age=31536000`
    const segments = window.location.pathname.split("/")
    segments[1] = newLocale
    const newPath = segments.join("/") || `/${newLocale}`
    router.push(newPath)
  }

  const handleLogout = async () => {
    setShowLogoutConfirm(false)
    setIsLoggingOut(true)
    await logout()
    toast.success(dictionary.home.logoutSuccess)
    router.push(`/${lang}/login`)
  }

  const onThemeToggle = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return (
    <>
      {isLoggingOut && <PageLoader />}
      
      <AlertDialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-orange-500/10">
              <Icon icon="solar:danger-triangle-bold" className="size-8 text-orange-500" />
            </AlertDialogMedia>
            <AlertDialogTitle className={cn(isRTL && "font-arabic")}>
              {dictionary.auth.logout.confirmTitle}
            </AlertDialogTitle>
            <AlertDialogDescription className={cn(isRTL && "font-arabic")}>
              {dictionary.auth.logout.confirmMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className={cn(isRTL && "font-arabic")}>
              {dictionary.common.cancel}
            </AlertDialogCancel>
            <AlertDialogAction 
              variant="destructive" 
              onClick={handleLogout}
              className={cn(isRTL && "font-arabic")}
            >
              {dictionary.auth.logout.confirmButton}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <header className="border-b border-border bg-card sticky top-0 z-50">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={onMenuClick}
              className="lg:hidden"
              aria-label="Toggle menu"
            >
              <Icon icon="solar:hamburger-menu-linear" className="size-5" />
            </Button>
            
            <div>
              <h1 className={cn("text-2xl font-bold text-primary", isRTL && "font-arabic")}>
                {dictionary.common.appName}
              </h1>
              <p className={cn("text-sm text-muted-foreground hidden sm:block", isRTL && "font-arabic")}>
                {dictionary.auth.login.metaDescription}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            
            <Select value={lang} onValueChange={(value) => switchLocale(value as Locale)}>
              <SelectTrigger title="Switch Language" className="w-32">
                <div className="flex items-center gap-2">
                  <Icon icon="solar:global-linear" className="size-4" />
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="ar">العربية</SelectItem>
              </SelectContent>
            </Select>
            <Button
              title="Light/Dark toggle"
              variant="outline"
              size="icon"
              onClick={onThemeToggle}
              aria-label="Toggle theme"
              className="hidden lg:flex"
            >
              {theme === "light" ? <Icon icon="solar:moon-bold" className="size-4" /> : <Icon icon="solar:sun-bold" className="size-4" />}
            </Button>
            <Button
              title="Logout"
              variant="outline"
              size="icon"
              onClick={() => setShowLogoutConfirm(true)}
              aria-label={dictionary.navbar.logout}
              className="hidden lg:flex cursor-pointer"
            >
              <Icon icon="solar:logout-2-linear" className="size-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
    </>
  )
}
