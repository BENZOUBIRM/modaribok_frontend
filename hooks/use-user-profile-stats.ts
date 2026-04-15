"use client"

import * as React from "react"

import { profileStatsService } from "@/services/api"

type UserProfileStats = profileStatsService.UserProfileStats

type CacheEntry = {
  data: UserProfileStats | null
  promise: Promise<UserProfileStats> | null
  listeners: Set<() => void>
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
  }

  statsCache.set(userId, entry)
  return entry
}

function notify(entry: CacheEntry): void {
  entry.listeners.forEach((listener) => listener())
}

function ensureStatsRequested(userId: number, fallback: UserProfileStats): void {
  const entry = getOrCreateCacheEntry(userId)
  if (entry.data || entry.promise) {
    return
  }

  entry.promise = profileStatsService
    .getUserProfileStats(userId, fallback)
    .then((resolved) => {
      entry.data = resolved
      return resolved
    })
    .catch(() => {
      entry.data = fallback
      return fallback
    })
    .finally(() => {
      entry.promise = null
      notify(entry)
    })
}

export function useUserProfileStats(userId?: number | null): {
  stats: UserProfileStats
  isLoading: boolean
} {
  const normalizedUserId = typeof userId === "number" && Number.isFinite(userId) && userId > 0
    ? userId
    : null

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
    ensureStatsRequested(normalizedUserId, DEFAULT_STATS)
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
