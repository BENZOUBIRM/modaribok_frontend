"use client"

import { useEffect } from "react"
import { useDictionary } from "@/providers/dictionary-provider"
import { setToastDictionary } from "@/lib/api-toast"

/**
 * Syncs the current i18n dictionary into the api-toast module
 * so non-React code (Axios interceptors) can resolve messages.
 *
 * Re-runs whenever the language changes.
 */
export function ApiToastProvider() {
  const { dictionary } = useDictionary()

  useEffect(() => {
    setToastDictionary(dictionary)
  }, [dictionary])

  return null
}
