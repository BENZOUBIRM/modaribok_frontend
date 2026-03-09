"use client"

import * as React from "react"
import { getDictionary, type Dictionary } from "@/i18n/get-dictionary"
import type { Locale } from "@/i18n/settings"
import { localeDirection } from "@/i18n/settings"
import { usePathname } from "next/navigation"

interface DictionaryContextValue {
  dictionary: Dictionary
  lang: Locale
  isRTL: boolean
  direction: "ltr" | "rtl"
  switchLocale: (newLocale: Locale) => Promise<void>
}

const DictionaryContext = React.createContext<DictionaryContextValue | null>(null)

interface DictionaryProviderProps {
  children: React.ReactNode
  dictionary: Dictionary
  lang: Locale
  /** Mapping from locale to the Next.js font className applied to <body> */
  fontClasses: Record<Locale, string>
}

export function DictionaryProvider({
  children,
  dictionary: initialDictionary,
  lang: initialLang,
  fontClasses,
}: DictionaryProviderProps) {
  const [dictionary, setDictionary] = React.useState(initialDictionary)
  const [lang, setLang] = React.useState(initialLang)
  const pathname = usePathname()

  const direction = localeDirection[lang]
  const isRTL = direction === "rtl"

  const switchLocale = React.useCallback(
    async (newLocale: Locale) => {
      if (newLocale === lang) return

      // 1. Load the new dictionary client-side
      const newDict = await getDictionary(newLocale)

      // 2. Update React state (triggers re-render with new translations)
      setDictionary(newDict)
      const oldLang = lang
      setLang(newLocale)

      // 3. Update DOM attributes (html lang, dir, body font)
      const newDir = localeDirection[newLocale]
      document.documentElement.lang = newLocale
      document.documentElement.dir = newDir
      document.body.classList.remove(fontClasses[oldLang])
      document.body.classList.add(fontClasses[newLocale])

      // 4. Update URL in-place (no navigation, no tree unmount)
      const segments = pathname.split("/")
      segments[1] = newLocale
      const newPath = segments.join("/") || `/${newLocale}`
      window.history.replaceState(window.history.state, "", newPath)

      // 5. Persist choice for future server renders
      document.cookie = `NEXT_LOCALE=${newLocale};path=/;max-age=31536000`
    },
    [lang, pathname, fontClasses],
  )

  const value = React.useMemo(
    () => ({ dictionary, lang, isRTL, direction, switchLocale }),
    [dictionary, lang, isRTL, direction, switchLocale],
  )

  return (
    <DictionaryContext.Provider value={value}>
      {children}
    </DictionaryContext.Provider>
  )
}

export function useDictionary() {
  const context = React.useContext(DictionaryContext)
  if (!context) {
    throw new Error("useDictionary must be used within a DictionaryProvider")
  }
  return context
}
