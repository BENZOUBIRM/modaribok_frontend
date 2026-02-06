import type { Locale } from "./settings"

// Dynamically import dictionary JSON files
const dictionaries = {
  en: () => import("./dictionaries/en.json").then((m) => m.default),
  ar: () => import("./dictionaries/ar.json").then((m) => m.default),
}

export type Dictionary = Awaited<ReturnType<(typeof dictionaries)["en"]>>

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  return dictionaries[locale]()
}
