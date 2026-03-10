"use client"

import * as React from "react"
import { usePathname } from "next/navigation"

interface NavigationContextValue {
  isNavigating: boolean
  startNavigation: (targetPath: string) => void
}

const NavigationContext = React.createContext<NavigationContextValue | null>(null)

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isNavigating, setIsNavigating] = React.useState(false)
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  const startNavigation = React.useCallback(
    (targetPath: string) => {
      // Strip query string and hash for comparison
      const clean = targetPath.split(/[?#]/)[0]
      if (clean === pathname) return
      setIsNavigating(true)
    },
    [pathname],
  )

  // Clear navigating state when pathname changes (route transition complete).
  // Use double-rAF to ensure the new component has painted before hiding the spinner.
  const rafRef = React.useRef<number | null>(null)
  React.useEffect(() => {
    if (!isNavigating) return
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = requestAnimationFrame(() => {
        setIsNavigating(false)
        rafRef.current = null
        if (timerRef.current) {
          clearTimeout(timerRef.current)
          timerRef.current = null
        }
      })
    })
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [pathname]) // eslint-disable-line react-hooks/exhaustive-deps

  // Safety timeout — prevent stuck spinner
  React.useEffect(() => {
    if (!isNavigating) return
    timerRef.current = setTimeout(() => {
      setIsNavigating(false)
      timerRef.current = null
    }, 5000)
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }
  }, [isNavigating])

  const value = React.useMemo(
    () => ({ isNavigating, startNavigation }),
    [isNavigating, startNavigation],
  )

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  )
}

export function useNavigation(): NavigationContextValue {
  const context = React.useContext(NavigationContext)
  if (!context) {
    throw new Error("useNavigation must be used within a <NavigationProvider>")
  }
  return context
}
