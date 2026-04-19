import type { FeedPost } from "@/types"

export interface PublicationFeedCacheEntry {
  posts: FeedPost[]
  errorCode: string | null
  currentPage: number
  hasMorePosts: boolean
  timestamp: number
}

const CACHE_PREFIX = "modaribok_publication_feed_cache_v5:"
const FEED_CACHE_FRESH_MS = 60_000
const FEED_CACHE_MAX_AGE_MS = 30 * 60_000

const memoryCache = new Map<string, PublicationFeedCacheEntry>()

function getStorageKey(cacheKey: string): string {
  return `${CACHE_PREFIX}${cacheKey}`
}

function isExpired(timestamp: number): boolean {
  return Date.now() - timestamp > FEED_CACHE_MAX_AGE_MS
}

export function buildPublicationFeedCacheKey(params: {
  scopeUserId?: number
  viewerUserId?: number
}): string {
  const scopeKey = params.scopeUserId ? `user:${params.scopeUserId}` : "home"
  const viewerKey = params.viewerUserId ? `viewer:${params.viewerUserId}` : "viewer:guest"

  return `${scopeKey}:${viewerKey}`
}

export function getPublicationFeedCache(cacheKey: string): PublicationFeedCacheEntry | null {
  const memoryEntry = memoryCache.get(cacheKey)
  if (memoryEntry) {
    if (isExpired(memoryEntry.timestamp)) {
      memoryCache.delete(cacheKey)
    } else {
      return memoryEntry
    }
  }

  if (typeof window === "undefined") {
    return null
  }

  try {
    const raw = window.sessionStorage.getItem(getStorageKey(cacheKey))
    if (!raw) {
      return null
    }

    const parsed = JSON.parse(raw) as PublicationFeedCacheEntry
    if (!parsed || !Array.isArray(parsed.posts) || typeof parsed.timestamp !== "number") {
      window.sessionStorage.removeItem(getStorageKey(cacheKey))
      return null
    }

    const normalized: PublicationFeedCacheEntry = {
      posts: parsed.posts,
      errorCode: parsed.errorCode ?? null,
      currentPage: Number.isInteger(parsed.currentPage) ? parsed.currentPage : 0,
      hasMorePosts: typeof parsed.hasMorePosts === "boolean" ? parsed.hasMorePosts : false,
      timestamp: parsed.timestamp,
    }

    if (isExpired(normalized.timestamp)) {
      window.sessionStorage.removeItem(getStorageKey(cacheKey))
      return null
    }

    memoryCache.set(cacheKey, normalized)
    return normalized
  } catch {
    return null
  }
}

export function setPublicationFeedCache(
  cacheKey: string,
  entry: {
    posts: FeedPost[]
    errorCode: string | null
    currentPage: number
    hasMorePosts: boolean
  },
): void {
  const value: PublicationFeedCacheEntry = {
    posts: entry.posts,
    errorCode: entry.errorCode,
    currentPage: entry.currentPage,
    hasMorePosts: entry.hasMorePosts,
    timestamp: Date.now(),
  }

  memoryCache.set(cacheKey, value)

  if (typeof window === "undefined") {
    return
  }

  try {
    window.sessionStorage.setItem(getStorageKey(cacheKey), JSON.stringify(value))
  } catch {
    // Ignore storage write failures (e.g. private mode quota).
  }
}

export function isPublicationFeedCacheFresh(entry: PublicationFeedCacheEntry): boolean {
  return Date.now() - entry.timestamp <= FEED_CACHE_FRESH_MS
}
