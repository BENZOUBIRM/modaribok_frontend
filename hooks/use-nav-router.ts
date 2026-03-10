"use client"

import { useRouter } from "next/navigation"
import { useNavigation } from "@/providers/navigation-provider"
import { useMemo } from "react"

/**
 * Drop-in replacement for `useRouter()` that triggers the global
 * navigation spinner before navigating to a different page.
 */
export function useNavRouter() {
  const router = useRouter()
  const { startNavigation } = useNavigation()

  return useMemo(
    () => ({
      ...router,
      push(href: string, options?: Parameters<typeof router.push>[1]) {
        startNavigation(href)
        router.push(href, options)
      },
      replace(href: string, options?: Parameters<typeof router.replace>[1]) {
        startNavigation(href)
        router.replace(href, options)
      },
    }),
    [router, startNavigation],
  )
}
