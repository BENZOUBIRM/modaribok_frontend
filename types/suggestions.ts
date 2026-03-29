/**
 * ──────────────────────────────────────────────────────────────
 * Suggestion Types — Modaribok
 * ──────────────────────────────────────────────────────────────
 * Type definitions for friend/people suggestion cards and API DTOs.
 */

/** A friend suggestion entry used by UI cards */
export interface SuggestionUser {
  id: number
  name: string
  handle: string
  avatarUrl: string
  score?: number
  rank?: number
}

/** Backend DTO for a suggested user item */
export interface SuggestionUserDto {
  id: number
  firstName: string | null
  lastName: string | null
  profileImage: string | null
  score: number
  rank: number
}

/** Backend cursor-based suggestions page */
export interface SuggestionCursorPageDto {
  items: SuggestionUserDto[]
  nextCursorScore: number | null
  nextCursorUserId: number | null
  hasNext: boolean
}

// Backward compatibility for modules still migrating away from mock naming.
export type MockSuggestion = SuggestionUser
