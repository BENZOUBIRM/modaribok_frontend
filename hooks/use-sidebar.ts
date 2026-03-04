"use client"

import { useState, useEffect } from "react"

export function useSidebar() {
  const [isMobile, setIsMobile] = useState(false)

  // Initialise open/collapsed based on viewport — uses lazy initialisers
  // so we avoid calling setState inside an effect (React strict mode warning).
  const [isOpen, setIsOpen] = useState(() => {
    if (typeof window === "undefined") return false
    return window.innerWidth >= 1024 // Desktop always "open"
  })
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window === "undefined") return false
    if (window.innerWidth >= 1024) {
      // Collapsed by default
      return true
    }
    return false
  })

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024
      setIsMobile(mobile)
      if (!mobile) {
        setIsOpen(true)
      } else {
        setIsOpen(false)
      }
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  useEffect(() => {
    if (!isMobile) {
      localStorage.setItem("sidebar-collapsed", String(isCollapsed))
    }
  }, [isCollapsed, isMobile])

  const toggle = () => {
    if (isMobile) {
      setIsOpen(!isOpen)
    } else {
      setIsCollapsed(!isCollapsed)
    }
  }

  const open = () => setIsOpen(true)
  const close = () => setIsOpen(false)

  return {
    isOpen,
    isCollapsed,
    isMobile,
    toggle,
    open,
    close,
  }
}
