import type { FeedComment, ReactionCountsByType, ReactionType } from "@/types"

type CommentReactionCacheEntry = {
  reactionsCountByType: ReactionCountsByType
  currentUserReaction: ReactionType | null
  likesCount: number
  updatedAt: number
}

type CommentReactionCacheMap = Record<string, CommentReactionCacheEntry>

const STORAGE_KEY_PREFIX = "comment-reaction-cache-v1"

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined"
}

function getStorageKey(userId?: number | null): string {
  return `${STORAGE_KEY_PREFIX}:${userId ?? "guest"}`
}

function sanitizeCounts(rawCounts?: ReactionCountsByType): ReactionCountsByType {
  const sanitized: ReactionCountsByType = {}

  Object.entries(rawCounts ?? {}).forEach(([type, count]) => {
    if (typeof count !== "number" || count <= 0) {
      return
    }

    sanitized[type.toUpperCase() as ReactionType] = count
  })

  return sanitized
}

function readCache(userId?: number | null): CommentReactionCacheMap {
  if (!canUseStorage()) {
    return {}
  }

  try {
    const raw = window.localStorage.getItem(getStorageKey(userId))
    if (!raw) {
      return {}
    }

    const parsed = JSON.parse(raw) as unknown
    if (!parsed || typeof parsed !== "object") {
      return {}
    }

    return parsed as CommentReactionCacheMap
  } catch {
    return {}
  }
}

function writeCache(userId: number | null | undefined, cacheMap: CommentReactionCacheMap): void {
  if (!canUseStorage()) {
    return
  }

  try {
    window.localStorage.setItem(getStorageKey(userId), JSON.stringify(cacheMap))
  } catch {
    // Ignore write failures (quota/private mode).
  }
}

export function cacheCommentReactionState(
  userId: number | null | undefined,
  commentId: number,
  params: {
    reactionsCountByType?: ReactionCountsByType
    currentUserReaction?: ReactionType | null
    likesCount?: number
  },
): void {
  const reactionsCountByType = sanitizeCounts(params.reactionsCountByType)
  const likesCount = typeof params.likesCount === "number"
    ? params.likesCount
    : Object.values(reactionsCountByType).reduce((sum, count) => sum + (count ?? 0), 0)

  const cacheMap = readCache(userId)
  cacheMap[String(commentId)] = {
    reactionsCountByType,
    currentUserReaction: params.currentUserReaction ?? null,
    likesCount,
    updatedAt: Date.now(),
  }

  writeCache(userId, cacheMap)
}

function hydrateCommentFromCache(
  comment: FeedComment,
  cacheMap: CommentReactionCacheMap,
): [FeedComment, boolean] {
  const cacheEntry = cacheMap[String(comment.id)]
  let hasChanged = false
  let nextComment = comment
  const hasServerReactionSnapshot =
    typeof comment.currentUserReaction !== "undefined"
    || typeof comment.reactionsCountByType !== "undefined"
    || comment.likesCount > 0

  if (cacheEntry && !hasServerReactionSnapshot) {
    hasChanged = true
    nextComment = {
      ...nextComment,
      likesCount: cacheEntry.likesCount,
      reactionsCountByType: cacheEntry.reactionsCountByType,
      currentUserReaction: cacheEntry.currentUserReaction,
    }
  }

  if (!comment.replies.length) {
    return [hasChanged ? nextComment : comment, hasChanged]
  }

  let hasRepliesChanged = false
  const nextReplies = comment.replies.map((reply) => {
    const [hydratedReply, changed] = hydrateCommentFromCache(reply, cacheMap)
    if (changed) {
      hasRepliesChanged = true
    }
    return hydratedReply
  })

  if (!hasRepliesChanged) {
    return [hasChanged ? nextComment : comment, hasChanged]
  }

  return [
    {
      ...nextComment,
      replies: nextReplies,
    },
    true,
  ]
}

export function hydrateCommentsWithReactionCache(
  comments: FeedComment[],
  userId?: number | null,
): FeedComment[] {
  if (!comments.length) {
    return comments
  }

  const cacheMap = readCache(userId)
  if (!Object.keys(cacheMap).length) {
    return comments
  }

  let hasChanged = false

  const nextComments = comments.map((comment) => {
    const [hydratedComment, changed] = hydrateCommentFromCache(comment, cacheMap)
    if (changed) {
      hasChanged = true
    }
    return hydratedComment
  })

  return hasChanged ? nextComments : comments
}
