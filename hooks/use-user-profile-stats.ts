"use client"

import * as React from "react"

import { profileStatsService } from "@/services/api"

type UserProfileStats = profileStatsService.UserProfileStats

type CacheEntry = {
  data: UserProfileStats | null
  promise: Promise<UserProfileStats> | null
  listeners: Set<() => void>
  requestNonce: number
}

const DEFAULT_STATS: UserProfileStats = {
  posts: 0,
  followers: 0,
  following: 0,
}

const statsCache = new Map<number, CacheEntry>()

function getOrCreateCacheEntry(userId: number): CacheEntry {
  const existing = statsCache.get(userId)
  if (existing) {
    return existing
  }

  const entry: CacheEntry = {
    data: null,
    promise: null,
    listeners: new Set(),
    requestNonce: 0,
  }

  statsCache.set(userId, entry)
  return entry
}

function notify(entry: CacheEntry): void {
  entry.listeners.forEach((listener) => listener())
}

function normalizeUserId(userId?: number | null): number | null {
  if (typeof userId === "number" && Number.isFinite(userId) && userId > 0) {
    return userId
  }

  return null
}

function sanitizeCount(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.max(0, Math.floor(value))
  }

  return 0
}

function sanitizeStats(stats: UserProfileStats): UserProfileStats {
  return {
    posts: sanitizeCount(stats.posts),
    followers: sanitizeCount(stats.followers),
    following: sanitizeCount(stats.following),
  }
}

function sanitizeDelta(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.trunc(value)
  }

  return 0
}

function requestStats(userId: number, fallback: UserProfileStats, force = false): void {
  const entry = getOrCreateCacheEntry(userId)
  if (entry.promise) {
    return
  }

  if (entry.data && !force) {
    return
  }

  const requestFallback = entry.data ?? fallback
  entry.requestNonce += 1
  const requestNonce = entry.requestNonce

  entry.promise = profileStatsService
    .getUserProfileStats(userId, requestFallback)
    .then((resolved) => {
      if (entry.requestNonce !== requestNonce) {
        return entry.data ?? requestFallback
      }

      const sanitized = sanitizeStats(resolved)
      entry.data = sanitized
      return sanitized
    })
    .catch(() => {
      if (entry.requestNonce !== requestNonce) {
        return entry.data ?? requestFallback
      }

      const safeFallback = sanitizeStats(requestFallback)
      entry.data = safeFallback
      return safeFallback
    })
    .finally(() => {
      if (entry.requestNonce !== requestNonce) {
        return
      }

      entry.promise = null
      notify(entry)
    })

  notify(entry)
}

export function refreshUserProfileStats(userId?: number | null): void {
  const normalizedUserId = normalizeUserId(userId)
  if (!normalizedUserId) {
    return
  }

  const entry = getOrCreateCacheEntry(normalizedUserId)
  requestStats(normalizedUserId, entry.data ?? DEFAULT_STATS, true)
}

export function applyUserProfileStatsDelta(
  userId?: number | null,
  delta?: Partial<UserProfileStats>,
): void {
  const normalizedUserId = normalizeUserId(userId)
  if (!normalizedUserId || !delta) {
    return
  }

  const entry = getOrCreateCacheEntry(normalizedUserId)
  const base = entry.data ?? DEFAULT_STATS

  entry.requestNonce += 1
  entry.promise = null
  entry.data = {
    posts: Math.max(0, base.posts + sanitizeDelta(delta.posts)),
    followers: Math.max(0, base.followers + sanitizeDelta(delta.followers)),
    following: Math.max(0, base.following + sanitizeDelta(delta.following)),
  }

  notify(entry)
}

export function useUserProfileStats(userId?: number | null): {
  stats: UserProfileStats
  isLoading: boolean
} {
  const normalizedUserId = normalizeUserId(userId)

  const [stats, setStats] = React.useState<UserProfileStats>(DEFAULT_STATS)
  const [isLoading, setIsLoading] = React.useState(false)

  React.useEffect(() => {
    if (!normalizedUserId) {
      setStats(DEFAULT_STATS)
      setIsLoading(false)
      return
    }

    const entry = getOrCreateCacheEntry(normalizedUserId)

    const syncFromEntry = () => {
      if (entry.data) {
        setStats(entry.data)
        setIsLoading(false)
        return
      }

      setStats(DEFAULT_STATS)
      setIsLoading(Boolean(entry.promise))
    }

    entry.listeners.add(syncFromEntry)
    requestStats(normalizedUserId, DEFAULT_STATS)
    syncFromEntry()

    return () => {
      entry.listeners.delete(syncFromEntry)
    }
  }, [normalizedUserId])

  return {
    stats,
    isLoading,
  }
}
