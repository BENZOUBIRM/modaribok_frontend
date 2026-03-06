/**
 * ──────────────────────────────────────────────────────────────
 * Profile Types — Modaribok
 * ──────────────────────────────────────────────────────────────
 * Type definitions for user profile display data (mock layer).
 */

/** Mock user used in feed, comments, and profile cards */
export interface MockUser {
  id: number
  name: string
  handle: string
  avatarUrl: string
}
