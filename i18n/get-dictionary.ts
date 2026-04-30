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
      import("./dictionaries/en/errors.json").then((m) => m.default),
      import("./dictionaries/en/products.json").then((m) => m.default),
      import("./dictionaries/en/product-details.json").then((m) => m.default),
      import("./dictionaries/en/coaches.json").then((m) => m.default),
      import("./dictionaries/en/coach-profile.json").then((m) => m.default),
      import("./dictionaries/en/gyms.json").then((m) => m.default),
      import("./dictionaries/en/gym-details.json").then((m) => m.default),
      import("./dictionaries/en/create-gym.json").then((m) => m.default),
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
      import("./dictionaries/ar/errors.json").then((m) => m.default),
      import("./dictionaries/ar/products.json").then((m) => m.default),
      import("./dictionaries/ar/product-details.json").then((m) => m.default),
      import("./dictionaries/ar/coaches.json").then((m) => m.default),
      import("./dictionaries/ar/coach-profile.json").then((m) => m.default),
      import("./dictionaries/ar/gyms.json").then((m) => m.default),
      import("./dictionaries/ar/gym-details.json").then((m) => m.default),
      import("./dictionaries/ar/create-gym.json").then((m) => m.default),
    ] as const),
}

export type Dictionary = Awaited<ReturnType<(typeof dictionaries)["en"]>> extends
  readonly [
    infer Common, infer Navbar, infer Home, infer Auth, infer Sidebar,
    infer Activity, infer Feed, infer Profile, infer Events, infer Suggestions,
    infer ApiMessages, infer Errors, infer Products, infer ProductDetails,
    infer Coaches, infer CoachProfile, infer Gyms, infer GymDetails, infer CreateGym,
  ]
  ? {
      common: Common; navbar: Navbar; home: Home; auth: Auth; sidebar: Sidebar;
      activity: Activity; feed: Feed; profile: Profile; events: Events;
      suggestions: Suggestions; apiMessages: ApiMessages; errors: Errors;
      products: Products; productDetails: ProductDetails; coaches: Coaches;
      coachProfile: CoachProfile; gyms: Gyms; gymDetails: GymDetails; createGym: CreateGym;
    }
  : never

const KEYS = [
  "common", "navbar", "home", "auth", "sidebar",
  "activity", "feed", "profile", "events", "suggestions", "apiMessages", "errors",
  "products", "productDetails", "coaches", "coachProfile", "gyms", "gymDetails", "createGym",
] as const

const dictionaryPromiseCache: Partial<Record<Locale, Promise<Dictionary>>> = {}

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  const cachedPromise = dictionaryPromiseCache[locale]
  if (cachedPromise) {
    return cachedPromise
  }

  const loadPromise = dictionaries[locale]()
    .then((values) => {
      const result = {} as Record<string, unknown>
      KEYS.forEach((k, i) => {
        result[k] = values[i]
      })
      return result as Dictionary
    })
    .catch((error) => {
      delete dictionaryPromiseCache[locale]
      throw error
    })

  dictionaryPromiseCache[locale] = loadPromise
  return loadPromise
}
