/**
 * ──────────────────────────────────────────────────────────────
 * Services — Barrel Export
 * ──────────────────────────────────────────────────────────────
 * Re-exports all API services for convenient importing:
 *   import { authService, apiClient } from "@/services/api"
 */

export { default as apiClient } from "./client"
export { setToken, getToken, removeToken, setStoredUser, getStoredUser } from "./client"
export * as authService from "./auth.service"
export * as profileService from "./profile.service"
export * as publicationService from "./publication.service"
export * as suggestionService from "./suggestion.service"
export * as followService from "./follow.service"
export * as profileStatsService from "./profile-stats.service"
