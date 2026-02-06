"use client"

import * as React from "react"
import type { Dictionary } from "@/i18n/get-dictionary"
import type { Locale } from "@/i18n/settings"
import { localeDirection } from "@/i18n/settings"

interface DictionaryContextValue {
  dictionary: Dictionary
  lang: Locale
  isRTL: boolean
  direction: "ltr" | "rtl"
}

const DictionaryContext = React.createContext<DictionaryContextValue | null>(null)

interface DictionaryProviderProps {
  children: React.ReactNode
  dictionary: Dictionary
  lang: Locale
}

export function DictionaryProvider({ children, dictionary, lang }: DictionaryProviderProps) {
  const direction = localeDirection[lang]
  const isRTL = direction === "rtl"

  const value = React.useMemo(
    () => ({ dictionary, lang, isRTL, direction }),
    [dictionary, lang, isRTL, direction]
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
