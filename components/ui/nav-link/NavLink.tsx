"use client"

import Link from "next/link"
import { useNavigation } from "@/providers/navigation-provider"
import type { ComponentProps, MouseEvent } from "react"

type NavLinkProps = ComponentProps<typeof Link>

/**
 * Drop-in replacement for next/link that triggers the global
 * navigation spinner when navigating to a different page.
 */
export function NavLink({ href, onClick, target, ...rest }: NavLinkProps) {
  const { startNavigation } = useNavigation()

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    // Don't intercept modified clicks (new tab / window)
    if (e.ctrlKey || e.metaKey || e.shiftKey || e.button !== 0) {
      onClick?.(e)
      return
    }

    // Don't intercept external links or target="_blank"
    if (target === "_blank") {
      onClick?.(e)
      return
    }

    const url = typeof href === "string" ? href : href.pathname ?? ""

    // Skip external URLs
    if (/^https?:\/\//.test(url)) {
      onClick?.(e)
      return
    }

    // Skip hash-only links
    if (url.startsWith("#")) {
      onClick?.(e)
      return
    }

    startNavigation(url)
    onClick?.(e)
  }

  return <Link href={href} onClick={handleClick} target={target} {...rest} />
}
