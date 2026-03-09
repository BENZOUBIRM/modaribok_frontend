/**
 * Centralized route constants for the Next.js app.
 * All routes are functions that accept a locale prefix string.
 */

export const AUTH_ROUTES = {
  LOGIN: (lang: string) => `/${lang}/login`,
  SIGNUP: (lang: string) => `/${lang}/signup`,
  FORGOT_PASSWORD: (lang: string) => `/${lang}/forgot-password`,
  RESET_PASSWORD: (lang: string) => `/${lang}/reset-password`,
} as const

export const DASHBOARD_ROUTES = {
  HOME: (lang: string) => `/${lang}/dashboard`,
  ANALYTICS: (lang: string) => `/${lang}/dashboard/analytics`,
} as const

export const USER_ROUTES = {
  LIST: (lang: string) => `/${lang}/users`,
  DETAIL: (lang: string, id: string | number) => `/${lang}/users/${id}`,
  CREATE: (lang: string) => `/${lang}/users/create`,
  EDIT: (lang: string, id: string | number) => `/${lang}/users/${id}/edit`,
  ROLES: (lang: string) => `/${lang}/users/roles`,
} as const

export const PRODUCT_ROUTES = {
  LIST: (lang: string) => `/${lang}/products`,
  DETAIL: (lang: string, id: string | number) => `/${lang}/products/${id}`,
  CREATE: (lang: string) => `/${lang}/products/create`,
  EDIT: (lang: string, id: string | number) => `/${lang}/products/${id}/edit`,
  CATEGORIES: (lang: string) => `/${lang}/products/categories`,
} as const

export const TRAINER_ROUTES = {
  LIST: (lang: string) => `/${lang}/trainers`,
  DETAIL: (lang: string, id: string | number) => `/${lang}/trainers/${id}`,
} as const

export const GYM_ROUTES = {
  LIST: (lang: string) => `/${lang}/gyms`,
  DETAIL: (lang: string, id: string | number) => `/${lang}/gyms/${id}`,
} as const

export const EVENT_ROUTES = {
  LIST: (lang: string) => `/${lang}/events`,
  DETAIL: (lang: string, id: string | number) => `/${lang}/events/${id}`,
} as const

export const FIELD_ROUTES = {
  LIST: (lang: string) => `/${lang}/fields`,
  DETAIL: (lang: string, id: string | number) => `/${lang}/fields/${id}`,
} as const

export const STORE_ROUTES = {
  LIST: (lang: string) => `/${lang}/stores`,
  DETAIL: (lang: string, id: string | number) => `/${lang}/stores/${id}`,
} as const

export const ORDER_ROUTES = {
  LIST: (lang: string) => `/${lang}/orders`,
  DETAIL: (lang: string, id: string | number) => `/${lang}/orders/${id}`,
  TRANSACTIONS: (lang: string) => `/${lang}/orders/transactions`,
} as const

export const SETTINGS_ROUTES = {
  GENERAL: (lang: string) => `/${lang}/settings`,
  PROFILE: (lang: string) => `/${lang}/settings/profile`,
  SECURITY: (lang: string) => `/${lang}/settings/security`,
  NOTIFICATIONS: (lang: string) => `/${lang}/settings/notifications`,
} as const

export const ROUTES = {
  AUTH: AUTH_ROUTES,
  DASHBOARD: DASHBOARD_ROUTES,
  USERS: USER_ROUTES,
  PRODUCTS: PRODUCT_ROUTES,
  TRAINERS: TRAINER_ROUTES,
  GYMS: GYM_ROUTES,
  EVENTS: EVENT_ROUTES,
  FIELDS: FIELD_ROUTES,
  STORES: STORE_ROUTES,
  ORDERS: ORDER_ROUTES,
  SETTINGS: SETTINGS_ROUTES,
} as const

export const DEFAULT_ROUTES = {
  AFTER_LOGIN: DASHBOARD_ROUTES.HOME,
  AFTER_LOGOUT: AUTH_ROUTES.LOGIN,
} as const

/**
 * Route classification for access control.
 * Slugs are the path segments after the locale prefix (e.g. "login", "dashboard").
 */

/** Routes only accessible to unauthenticated users */
export const GUEST_ONLY_SLUGS = [
  "login",
  "signup",
  "forgot-password",
  "reset-password",
] as const

/** Routes that require authentication */
export const PROTECTED_SLUGS = [
  "dashboard",
  "users",
  "products",
  "trainers",
  "gyms",
  "events",
  "fields",
  "stores",
  "orders",
  "settings",
] as const

/** Routes accessible by anyone (guest or authenticated) */
export const PUBLIC_SLUGS = [
  "",          // home page (/{lang})
  "auth",      // OAuth callback routes
  "oauth2",    // OAuth2 callback routes
] as const

/**
 * All known first-level route slugs under /{lang}/...
 * Used to determine if a path is a valid app route.
 */
export const KNOWN_SLUGS = [
  ...GUEST_ONLY_SLUGS,
  ...PROTECTED_SLUGS,
  ...PUBLIC_SLUGS,
] as const
