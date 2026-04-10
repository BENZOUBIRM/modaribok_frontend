"use client"

import * as React from "react"
import { usePathname } from "next/navigation"

interface NavigationContextValue {
  isNavigating: boolean
  pendingPath: string | null
  startNavigation: (targetPath: string) => void
  completeNavigation: () => void
}

const NavigationContext = React.createContext<NavigationContextValue | null>(null)

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isNavigating, setIsNavigating] = React.useState(false)
  const [pendingPath, setPendingPath] = React.useState<string | null>(null)

  const normalizePath = React.useCallback((path: string) => {
    const stripped = path.split(/[?#]/)[0]
    if (stripped.length > 1 && stripped.endsWith("/")) {
      return stripped.slice(0, -1)
    }
    return stripped
  }, [])

  const startNavigation = React.useCallback(
    (targetPath: string) => {
      const clean = normalizePath(targetPath)
      const current = normalizePath(pathname)
      if (clean === current) return
      setPendingPath(clean)
      setIsNavigating(true)
    },
    [normalizePath, pathname],
  )

  const completeNavigation = React.useCallback(() => {
    setIsNavigating(false)
    setPendingPath(null)
  }, [])

  const value = React.useMemo(
    () => ({ isNavigating, pendingPath, startNavigation, completeNavigation }),
    [completeNavigation, isNavigating, pendingPath, startNavigation],
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
