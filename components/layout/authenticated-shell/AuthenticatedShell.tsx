"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { motion, AnimatePresence } from "framer-motion"
import { Icon } from "@iconify/react"
import { toast } from "sonner"

import { Toaster } from "@/components/ui/primitives/sonner"
import { ApiToastProvider } from "@/providers/api-toast-provider"
import { useDictionary } from "@/providers/dictionary-provider"
import { useAuth } from "@/providers/auth-provider"
import { useSidebar } from "@/hooks/use-sidebar"
import { useActivityPanel } from "@/hooks/use-activity-panel"
import { cn } from "@/lib/utils"

import { Navbar } from "@/components/layout/navbar"
import { AppSidebar } from "@/components/layout/sidebar"
import { GuestSidebar } from "@/components/layout/guest-sidebar"
import {
  ActivityPanelMobile,
  ActivityPanelDesktop,
} from "@/components/layout/activity-panel"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
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

/**
 * Conditional layout shell.
 *
 * - Loading        → fixed Navbar + spinner
 * - Guest          → fixed Navbar + children
 * - Authenticated  → h-screen flex: left column (static navbar, sidebar,
 *   content, footer) | activity panel (full viewport height)
 */
export default function AuthenticatedShell({
  children,
}: {
  children: React.ReactNode
}) {
  const { dictionary, lang, isRTL } = useDictionary()
  const { isAuthenticated, isLoading, logout } = useAuth()
  const { theme, setTheme } = useTheme()
  const router = useRouter()

  const sidebar = useSidebar()
  const activityPanel = useActivityPanel()

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [guestSidebarOpen, setGuestSidebarOpen] = useState(false)

  // Scroll-to-top listener
  useEffect(() => {
    if (!isAuthenticated) return
    const mainContent = document.getElementById("main-content")
    if (!mainContent) return

    const handleScroll = () =>
      setShowScrollTop(mainContent.scrollTop > 200)

    mainContent.addEventListener("scroll", handleScroll)
    return () => mainContent.removeEventListener("scroll", handleScroll)
  }, [isAuthenticated])

  const scrollToTop = () => {
    document
      .getElementById("main-content")
      ?.scrollTo({ top: 0, behavior: "smooth" })
  }

  const toggleTheme = () =>
    setTheme(theme === "dark" ? "light" : "dark")

  const handleLogout = async () => {
    setShowLogoutConfirm(false)
    await logout()
    toast.success(dictionary.home.logoutSuccess, {
      description: dictionary.home.logoutSuccessDescription,
    })
    router.push(`/${lang}/login`)
  }

  // Unified logout request — close overlays first, then show dialog
  const requestLogout = () => {
    if (sidebar.isMobile) {
      sidebar.close()
      activityPanel.close()
      // Small delay so overlay exit animations start before dialog appears
      setTimeout(() => setShowLogoutConfirm(true), 80)
    } else {
      setShowLogoutConfirm(true)
    }
  }

  /* ── Loading state ───────────────────────────────────────────── */
  if (isLoading) {
    return (
      <>
        <Toaster position="top-center" offset="80px" dir={isRTL ? "rtl" : "ltr"} />
        <ApiToastProvider />
        <Navbar />
        <main className="pt-16">
          <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-background">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
          </div>
        </main>
      </>
    )
  }

  /* ── Guest state ─────────────────────────────────────────────── */
  if (!isAuthenticated) {
    return (
      <>
        <Toaster position="top-center" offset="80px" dir={isRTL ? "rtl" : "ltr"} />
        <ApiToastProvider />
        <Navbar onGuestSidebarToggle={() => setGuestSidebarOpen(true)} />
        <GuestSidebar
          isOpen={guestSidebarOpen}
          onClose={() => setGuestSidebarOpen(false)}
          theme={theme}
          onThemeToggle={toggleTheme}
        />
        <main className="pt-16">{children}</main>
      </>
    )
  }

  /* ── Authenticated state ─────────────────────────────────────── */
  return (
    <>
      <Toaster position="top-center" offset="80px" dir={isRTL ? "rtl" : "ltr"} />
      <ApiToastProvider />

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-orange-500/10">
              <Icon
                icon="solar:danger-triangle-bold"
                className="size-8 text-orange-500"
              />
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
              {dictionary.auth.logout.cancelButton}
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

      {/* ─── Main full-height layout ─── */}
      <div className="h-screen bg-background text-foreground flex overflow-hidden">
        {/* Sidebar — full viewport height, first column */}
        <AppSidebar
          isOpen={sidebar.isOpen}
          isCollapsed={sidebar.isCollapsed}
          isMobile={sidebar.isMobile}
          onClose={sidebar.close}
          onToggle={sidebar.toggle}
          theme={theme}
          onThemeToggle={toggleTheme}
          onLogout={requestLogout}
        />

        {/* Center column: navbar ▸ content ▸ footer */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Navbar — flows inside center column */}
          <Navbar
            fixed={false}
            onSidebarToggle={sidebar.toggle}
            sidebarExpanded={!sidebar.isMobile && !sidebar.isCollapsed}
            onLogout={requestLogout}
          />

          {/* Content + toggle strip row */}
          <div className="flex flex-1 overflow-hidden">
            <main
              id="main-content"
              className="flex-1 overflow-auto min-w-0 bg-background"
            >
              {children}
            </main>

            {/* Desktop toggle/close strip */}
            {!activityPanel.isMobile && (
              <div
                className={cn(
                  "w-6 shrink-0 bg-card flex items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors",
                  isRTL
                    ? "border-r border-border"
                    : "border-l border-border"
                )}
                onClick={activityPanel.toggle}
              >
                {activityPanel.isOpen ? (
                  isRTL ? (
                    <Icon
                      icon="solar:alt-arrow-left-linear"
                      className="size-4 text-muted-foreground"
                    />
                  ) : (
                    <Icon
                      icon="solar:alt-arrow-right-linear"
                      className="size-4 text-muted-foreground"
                    />
                  )
                ) : (
                  isRTL ? (
                    <Icon
                      icon="solar:alt-arrow-right-linear"
                      className="size-4 text-muted-foreground"
                    />
                  ) : (
                    <Icon
                      icon="solar:alt-arrow-left-linear"
                      className="size-4 text-muted-foreground"
                    />
                  )
                )}
              </div>
            )}
          </div>

          {/* Footer — below content row, spans center column */}
          {/* <Footer /> */}
        </div>

        {/* Activity panel — full viewport height, last column */}
        {!activityPanel.isMobile && (
          <ActivityPanelDesktop
            isOpen={activityPanel.isOpen}
          />
        )}
      </div>

      {/* Mobile activity panel (overlay drawer) */}
      {activityPanel.isMobile && (
        <ActivityPanelMobile
          isOpen={activityPanel.isOpen}
          onClose={activityPanel.close}
          onToggle={activityPanel.toggle}
        />
      )}

      {/* Scroll-to-top button (mobile only) */}
      <AnimatePresence>
        {sidebar.isMobile && showScrollTop && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-4 z-50"
            style={{ [isRTL ? "left" : "right"]: "1rem" }}
          >
            <Button
              onClick={scrollToTop}
              size="icon"
              className="rounded-full shadow-lg"
              title="Scroll to Top"
            >
              <Icon icon="solar:arrow-up-linear" className="size-5" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
