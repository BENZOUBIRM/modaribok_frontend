import type { Locale } from "./settings"

// All import paths must be static literals for Turbopack/Webpack to resolve them
const dictionaries = {
  en: () =>
    Promise.all([
      import("./dictionaries/en/common.json").then((m) => m.default),
      import("./dictionaries/en/navbar.json").then((m) => m.default),
      import("./dictionaries/en/home.json").then((m) => m.default),
      import("./dictionaries/en/auth.json").then((m) => m.default),
      import("./dictionaries/en/sidebar.json").then((m) => m.default),
      import("./dictionaries/en/activity.json").then((m) => m.default),
      import("./dictionaries/en/feed.json").then((m) => m.default),
      import("./dictionaries/en/profile.json").then((m) => m.default),
      import("./dictionaries/en/events.json").then((m) => m.default),
      import("./dictionaries/en/suggestions.json").then((m) => m.default),
      import("./dictionaries/en/api-messages.json").then((m) => m.default),
    ] as const),
  ar: () =>
    Promise.all([
      import("./dictionaries/ar/common.json").then((m) => m.default),
      import("./dictionaries/ar/navbar.json").then((m) => m.default),
      import("./dictionaries/ar/home.json").then((m) => m.default),
      import("./dictionaries/ar/auth.json").then((m) => m.default),
      import("./dictionaries/ar/sidebar.json").then((m) => m.default),
      import("./dictionaries/ar/activity.json").then((m) => m.default),
      import("./dictionaries/ar/feed.json").then((m) => m.default),
      import("./dictionaries/ar/profile.json").then((m) => m.default),
      import("./dictionaries/ar/events.json").then((m) => m.default),
      import("./dictionaries/ar/suggestions.json").then((m) => m.default),
      import("./dictionaries/ar/api-messages.json").then((m) => m.default),
    ] as const),
}

export type Dictionary = Awaited<ReturnType<(typeof dictionaries)["en"]>> extends
  readonly [
    infer Common, infer Navbar, infer Home, infer Auth, infer Sidebar,
    infer Activity, infer Feed, infer Profile, infer Events, infer Suggestions,
    infer ApiMessages,
  ]
  ? {
      common: Common; navbar: Navbar; home: Home; auth: Auth; sidebar: Sidebar;
      activity: Activity; feed: Feed; profile: Profile; events: Events;
      suggestions: Suggestions; apiMessages: ApiMessages;
    }
  : never

const KEYS = [
  "common", "navbar", "home", "auth", "sidebar",
  "activity", "feed", "profile", "events", "suggestions", "apiMessages",
] as const

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  const values = await dictionaries[locale]()
  const result = {} as Record<string, unknown>
  KEYS.forEach((k, i) => { result[k] = values[i] })
  return result as Dictionary
}
