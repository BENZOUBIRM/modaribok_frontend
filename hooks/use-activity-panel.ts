"use client"

import { useState, useEffect } from "react"

export function useActivityPanel() {
  const [isOpen, setIsOpen] = useState(() => {
    if (typeof window === "undefined") return false
    return window.innerWidth >= 1024 // Open by default on desktop
  })
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024
      setIsMobile(mobile)
      if (mobile) setIsOpen(false)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const toggle = () => {
    setIsOpen(!isOpen)
  }

  const close = () => {
    setIsOpen(false)
  }

  const open = () => {
    setIsOpen(true)
  }

  return {
    isOpen,
    isMobile,
    toggle,
    close,
    open,
  }
}
