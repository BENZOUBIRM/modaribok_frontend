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

export type Gender = "male" | "female"
export type AccountType = "PUBLIC" | "PRIVATE"

export interface Sport {
  id: number
  nameAr: string
  nameFr: string
  nameEn: string
}

export interface UserProfile {
  id: number
  firstName: string
  lastName: string
  email: string
  phone: string
  gender: Gender | null
  birthday: string | null
  country: string | null
  city: string | null
  accountType: AccountType
  role: string
  profileImageUrl: string | null
  createdAt: string
  updatedAt: string
  sports: Sport[]
}

export interface CompleteProfileFormData {
  firstName: string
  lastName: string
  gender?: Gender
  birthday?: string
  country?: string
  city?: string
  sports: Sport[]
}

export interface CompleteProfileRequest {
  gender?: Gender
  birthday?: string
  country?: string
  city?: string
  sports?: Sport[]
}

export interface CountryOption {
  id: number
  name: string
  iso2: string
  flag: string
}

export interface CityOption {
  id: number
  name: string
}
